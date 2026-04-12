/**
 * FKPhysics — Host-authoritative physics engine for Falafel Kingdom.
 * 2-player co-op 3D platformer. All physics run ONLY on the host;
 * the client just renders positions it receives via FKNetwork.
 * Vanilla JS, no modules — loaded as a regular <script> tag.
 */
(function () {
  'use strict';

  // ── Constants ──────────────────────────────────────────────

  var GRAVITY            = 0.015;
  var MOVE_SPEED         = 0.12;
  var JUMP_VELOCITY      = 0.35;
  var FRICTION           = 0.85;
  var PLAYER_SIZE        = 0.8;
  var FALL_DEATH_Y       = -10;
  var BOOST_JUMP_VY      = 0.9;
  var BOOST_JUMP_FORWARD = 0.4;
  var BULLY_CHASE_SPEED  = 0.06;
  var BULLY_PATROL_SPEED = 0.05;
  var BULLY_STUN_DURATION = 180;   // 3 s @ 60 fps
  var BULLY_CATCH_DIST   = 0.5;
  var BULLY_DUAL_STUN_DIST = 2.0;
  var CONVEYOR_SPEED     = 0.06;
  var CRUMBLE_DELAY      = 90;     // 1.5 s
  var CRUMBLE_RESPAWN    = 300;    // 5 s
  var SPICE_TRAP_MIN     = 180;
  var SPICE_TRAP_MAX     = 300;
  var SPICE_LAUNCH_VY    = 0.6;
  var GARLIC_DURATION    = 300;    // 5 s
  var RESPAWN_DELAY      = 90;
  var BOOST_RANGE        = 1.5;
  var HALF               = PLAYER_SIZE / 2;

  // ── Helpers ────────────────────────────────────────────────

  function makePlayer() {
    return {
      x: 0, y: 2, z: 0,
      vx: 0, vy: 0, vz: 0,
      grounded: false,
      anim: 'idle',
      hummus: 3,
      alive: true,
      respawnTimer: 0,
      garlicTimer: 0
    };
  }

  function dist3(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    var dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  function distXZ(a, b) {
    var dx = a.x - b.x;
    var dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // ── AABB helpers ──────────────────────────────────────────

  /** Build an AABB from a player position (centre-bottom). */
  function playerAABB(p) {
    return {
      minX: p.x - HALF,
      maxX: p.x + HALF,
      minY: p.y,
      maxY: p.y + PLAYER_SIZE,
      minZ: p.z - HALF,
      maxZ: p.z + HALF
    };
  }

  /** Build an AABB from a platform { x,y,z, sx,sy,sz } or { x,y,z, w,h,d }. */
  function platAABB(pl) {
    var hx = (pl.sx || pl.w || pl.width  || 1) / 2;
    var hy = (pl.sy || pl.h || pl.height || 0.5) / 2;
    var hz = (pl.sz || pl.d || pl.depth  || 1) / 2;
    return {
      minX: pl.x - hx, maxX: pl.x + hx,
      minY: pl.y - hy, maxY: pl.y + hy,
      minZ: pl.z - hz, maxZ: pl.z + hz
    };
  }

  // ── Module ─────────────────────────────────────────────────

  var levelData  = null;
  var spawnPos   = { x: 0, y: 2, z: 0 };

  window.FKPhysics = {

    p1: makePlayer(),
    p2: makePlayer(),

    // ── Init ───────────────────────────────────────────────

    init: function (data) {
      levelData = data || {};

      // Determine spawn positions (levels use spawnP1/spawnP2)
      var sp1 = levelData.spawnP1 || levelData.spawn || { x: 0, y: 2, z: 0 };
      var sp2 = levelData.spawnP2 || { x: (sp1.x || 0) + 1.5, y: sp1.y || 2, z: sp1.z || 0 };
      spawnPos = { x: sp1.x || 0, y: sp1.y || 2, z: sp1.z || 0 };

      this.p1 = makePlayer();
      this.p2 = makePlayer();
      this.p1.x = sp1.x || 0;
      this.p1.y = sp1.y || 2;
      this.p1.z = sp1.z || 0;
      this.p2.x = sp2.x || 1.5;
      this.p2.y = sp2.y || 2;
      this.p2.z = sp2.z || 0;

      // Build a flat objects array from level's separate arrays
      var objects = [];
      // Moving/crumbling platforms from the platforms array
      var platforms = levelData.platforms || [];
      for (var pi = 0; pi < platforms.length; pi++) {
        var p = platforms[pi];
        if (p.type === 'moving') {
          objects.push({ type: 'moving', x: p.x, y: p.y, z: p.z, sx: p.w, sy: p.h, sz: p.d, axis: p.moveAxis || 'x', speed: p.moveSpeed || 0.02, range: p.moveRange || 2, collide: true });
        }
        if (p.type === 'crumbling') {
          objects.push({ type: 'crumble', x: p.x, y: p.y, z: p.z, sx: p.w, sy: p.h, sz: p.d, collide: true, timer: 0, fallen: false, respawnTimer: 0, active: true });
        }
      }
      // Spice traps
      var spice = levelData.spiceTraps || [];
      for (var si = 0; si < spice.length; si++) {
        var s = spice[si];
        objects.push({ type: 'spiceTrap', id: s.id, x: s.x, y: s.y, z: s.z, sx: 1, sy: 0.15, sz: 1, cooldown: randomInt(SPICE_TRAP_MIN, SPICE_TRAP_MAX), collide: false });
      }
      // Garlic zones
      var garlic = levelData.garlicZones || [];
      for (var gi = 0; gi < garlic.length; gi++) {
        var g = garlic[gi];
        objects.push({ type: 'garlic', id: g.id, x: g.x, y: g.y || 0.05, z: g.z, sx: g.width || 3, sy: 0.1, sz: g.depth || 3, collide: false });
      }
      // Conveyors
      var conveyors = levelData.conveyors || [];
      for (var ci = 0; ci < conveyors.length; ci++) {
        var c = conveyors[ci];
        var dir = 1;
        var caxis = 'x';
        if (c.direction === 'x-') dir = -1;
        if (c.direction === 'z+') { caxis = 'z'; dir = 1; }
        if (c.direction === 'z-') { caxis = 'z'; dir = -1; }
        objects.push({ type: 'conveyor', id: c.id, x: c.x, y: c.y, z: c.z, sx: c.length || 4, sy: 0.2, sz: 1, axis: caxis, direction: dir, collide: true });
      }
      levelData.objects = objects;

      // Build flat plates array from pressurePairs
      var plates = [];
      var pairs = levelData.pressurePairs || [];
      for (var pri = 0; pri < pairs.length; pri++) {
        var pair = pairs[pri];
        var pls = pair.plates || [];
        for (var pli = 0; pli < pls.length; pli++) {
          plates.push({ x: pls[pli].x, y: pls[pli].y, z: pls[pli].z, sx: 1.2, sy: 0.1, sz: 1.2, pairId: pair.pairId, pressed: false, requireBoth: false });
        }
      }
      levelData.plates = plates;

      // Initialise dynamic object timers
      for (var i = 0; i < objects.length; i++) {
        var obj = objects[i];
        if (obj.type === 'crumble') {
          obj.timer = 0;
          obj.fallen = false;
          obj.respawnTimer = 0;
          obj.active = true;
        }
        if (obj.type === 'moving') {
          obj.t = obj.t || 0;
        }
      }

      var bullies = levelData.bullies || [];
      for (var j = 0; j < bullies.length; j++) {
        var b = bullies[j];
        b.waypointIdx = 0;
        b.stunTimer = 0;
        b.state = 'patrol';
      }
    },

    // ── Main update (one frame) ────────────────────────────

    update: function (p1Keys, p2Keys) {
      var platforms = levelData ? levelData.platforms || [] : [];
      var objects   = levelData ? levelData.objects   || [] : [];
      var bullies   = levelData ? levelData.bullies   || [] : [];
      var plates    = levelData ? levelData.plates    || [] : [];

      // Update dynamic objects first (moving platforms change position)
      this.updateObjects(objects);

      // Build combined collision list (static + dynamic active)
      var colliders = platforms.slice();
      for (var i = 0; i < objects.length; i++) {
        var o = objects[i];
        if (o.type === 'crumble' && !o.active) continue;
        if (o.collide !== false) colliders.push(o);
      }

      // Player 1
      if (this.p1.alive) {
        this.applyInput(this.p1, p1Keys || {});
        this.applyGravity(this.p1);
        this._applyObjectEffects(this.p1, objects, p1Keys || {});
        this._moveAndCollide(this.p1, colliders);
        this.checkFallDeath(this.p1, spawnPos);
        this.checkBoostJump(this.p1, this.p2, p1Keys || {});
      } else {
        this._tickRespawn(this.p1, spawnPos);
      }

      // Player 2
      if (this.p2.alive) {
        this.applyInput(this.p2, p2Keys || {});
        this.applyGravity(this.p2);
        this._applyObjectEffects(this.p2, objects, p2Keys || {});
        this._moveAndCollide(this.p2, colliders);
        this.checkFallDeath(this.p2, spawnPos);
        this.checkBoostJump(this.p2, this.p1, p2Keys || {});
      } else {
        this._tickRespawn(this.p2, spawnPos);
      }

      // Bullies
      this.updateBullies(bullies, this.p1, this.p2);

      // Pressure plates
      this.checkPressurePlates(plates, this.p1, this.p2);
    },

    // ── Input ──────────────────────────────────────────────

    applyInput: function (player, keys) {
      var mx = 0;
      var mz = 0;

      var forward  = keys.w || keys.up;
      var back     = keys.s || keys.down;
      var left     = keys.a || keys.left;
      var right    = keys.d || keys.right;

      // Garlic zone reversal
      if (player.garlicTimer > 0) {
        var tmp;
        tmp = forward; forward = back; back = tmp;
        tmp = left;    left = right;   right = tmp;
        player.garlicTimer--;
      }

      if (forward) mz -= 1;
      if (back)    mz += 1;
      if (left)    mx -= 1;
      if (right)   mx += 1;

      // Normalise diagonal
      if (mx !== 0 && mz !== 0) {
        var inv = 1 / Math.SQRT2;
        mx *= inv;
        mz *= inv;
      }

      player.vx += mx * MOVE_SPEED;
      player.vz += mz * MOVE_SPEED;

      // Jump
      if ((keys.space || keys.jump) && player.grounded) {
        player.vy = JUMP_VELOCITY;
        player.grounded = false;
      }

      // Friction
      player.vx *= FRICTION;
      player.vz *= FRICTION;

      // Animation hint
      if (!player.grounded) {
        player.anim = 'jump';
      } else if (Math.abs(player.vx) > 0.01 || Math.abs(player.vz) > 0.01) {
        player.anim = 'run';
      } else {
        player.anim = 'idle';
      }
    },

    // ── Gravity ────────────────────────────────────────────

    applyGravity: function (player) {
      player.vy -= GRAVITY;
    },

    // ── Move + Collide ────────────────────────────────────

    _moveAndCollide: function (player, platforms) {
      // Integrate position
      player.x += player.vx;
      player.y += player.vy;
      player.z += player.vz;

      player.grounded = false;

      this.checkCollisions(player, platforms);
    },

    // ── AABB Collision ────────────────────────────────────

    aabbOverlap: function (a, b) {
      return (
        a.minX < b.maxX && a.maxX > b.minX &&
        a.minY < b.maxY && a.maxY > b.minY &&
        a.minZ < b.maxZ && a.maxZ > b.minZ
      );
    },

    checkCollisions: function (player, platforms) {
      var pBox = playerAABB(player);

      for (var i = 0; i < platforms.length; i++) {
        var plat = platforms[i];
        var bBox = platAABB(plat);

        if (!this.aabbOverlap(pBox, bBox)) continue;

        // Compute penetration on each axis
        var overlapX1 = pBox.maxX - bBox.minX;
        var overlapX2 = bBox.maxX - pBox.minX;
        var overlapY1 = pBox.maxY - bBox.minY;
        var overlapY2 = bBox.maxY - pBox.minY;
        var overlapZ1 = pBox.maxZ - bBox.minZ;
        var overlapZ2 = bBox.maxZ - pBox.minZ;

        var penX = Math.min(overlapX1, overlapX2);
        var penY = Math.min(overlapY1, overlapY2);
        var penZ = Math.min(overlapZ1, overlapZ2);

        // Push out on axis of least penetration
        if (penY <= penX && penY <= penZ) {
          if (overlapY2 < overlapY1) {
            // Pushed up (landing on top)
            player.y = bBox.maxY;
            if (player.vy < 0) player.vy = 0;
            player.grounded = true;
          } else {
            // Pushed down (hit ceiling)
            player.y = bBox.minY - PLAYER_SIZE;
            if (player.vy > 0) player.vy = 0;
          }
        } else if (penX <= penZ) {
          if (overlapX1 < overlapX2) {
            player.x = bBox.minX - HALF;
          } else {
            player.x = bBox.maxX + HALF;
          }
          player.vx = 0;
        } else {
          if (overlapZ1 < overlapZ2) {
            player.z = bBox.minZ - HALF;
          } else {
            player.z = bBox.maxZ + HALF;
          }
          player.vz = 0;
        }

        // Rebuild player box after resolution for next iteration
        pBox = playerAABB(player);
      }
    },

    // ── Fall Death ────────────────────────────────────────

    checkFallDeath: function (player, spawn) {
      if (player.y < FALL_DEATH_Y) {
        player.alive = false;
        player.respawnTimer = RESPAWN_DELAY;
        player.vx = 0;
        player.vy = 0;
        player.vz = 0;
      }
    },

    respawnPlayer: function (player, spawn) {
      player.x = spawn.x || 0;
      player.y = spawn.y || 2;
      player.z = spawn.z || 0;
      player.vx = 0;
      player.vy = 0;
      player.vz = 0;
      player.grounded = false;
      player.alive = true;
      player.respawnTimer = 0;
      player.anim = 'idle';
    },

    _tickRespawn: function (player, spawn) {
      if (player.respawnTimer > 0) {
        player.respawnTimer--;
        if (player.respawnTimer <= 0) {
          this.respawnPlayer(player, spawn);
        }
      }
    },

    // ── Boost Jump ────────────────────────────────────────

    checkBoostJump: function (presser, partner, presserKeys) {
      if (!presserKeys.e && !presserKeys.interact) return;
      if (!presser.alive || !partner.alive) return;
      if (!partner.grounded) return;

      if (dist3(presser, partner) > BOOST_RANGE) return;

      // Launch partner upward
      partner.vy = BOOST_JUMP_VY;
      partner.grounded = false;

      // Forward velocity: push partner away from presser on XZ
      var dx = partner.x - presser.x;
      var dz = partner.z - presser.z;
      var d  = Math.sqrt(dx * dx + dz * dz) || 1;
      partner.vx += (dx / d) * BOOST_JUMP_FORWARD;
      partner.vz += (dz / d) * BOOST_JUMP_FORWARD;
    },

    // ── Bully AI ─────────────────────────────────────────

    updateBullies: function (bullies, p1, p2) {
      for (var i = 0; i < bullies.length; i++) {
        var b = bullies[i];

        // Stun countdown
        if (b.stunTimer > 0) {
          b.stunTimer--;
          b.state = 'stunned';
          continue;
        }

        // Check dual-stun: both players within range
        var d1 = distXZ(b, p1);
        var d2 = distXZ(b, p2);
        if (p1.alive && p2.alive && d1 < BULLY_DUAL_STUN_DIST && d2 < BULLY_DUAL_STUN_DIST) {
          b.stunTimer = BULLY_STUN_DURATION;
          b.state = 'stunned';
          continue;
        }

        // Pick target: closest alive player
        var target = null;
        var closer = Infinity;
        if (p1.alive && d1 < closer) { closer = d1; target = p1; }
        if (p2.alive && d2 < closer) { closer = d2; target = p2; }

        // Chase if a player is somewhat near (within 8 units)
        if (target && closer < 8) {
          b.state = 'chase';
          var dx = target.x - b.x;
          var dz = target.z - b.z;
          var dist = Math.sqrt(dx * dx + dz * dz) || 1;
          b.x += (dx / dist) * BULLY_CHASE_SPEED;
          b.z += (dz / dist) * BULLY_CHASE_SPEED;

          // Catch check
          if (closer < BULLY_CATCH_DIST) {
            // Bounce target away
            var bx = target.x - b.x;
            var bz = target.z - b.z;
            var bd = Math.sqrt(bx * bx + bz * bz) || 1;
            target.vx += (bx / bd) * 2;
            target.vz += (bz / bd) * 2;
            target.vy = 0.2;
            target.grounded = false;
            target.hummus = Math.max(0, target.hummus - 1);
          }
        } else {
          // Patrol waypoints
          b.state = 'patrol';
          var waypoints = b.waypoints;
          if (waypoints && waypoints.length > 0) {
            var wp = waypoints[b.waypointIdx % waypoints.length];
            var wx = wp.x - b.x;
            var wz = wp.z - b.z;
            var wd = Math.sqrt(wx * wx + wz * wz) || 1;
            if (wd < 0.2) {
              b.waypointIdx = (b.waypointIdx + 1) % waypoints.length;
            } else {
              b.x += (wx / wd) * BULLY_PATROL_SPEED;
              b.z += (wz / wd) * BULLY_PATROL_SPEED;
            }
          }
        }
      }
    },

    // ── Dynamic Objects ──────────────────────────────────

    updateObjects: function (objects) {
      for (var i = 0; i < objects.length; i++) {
        var obj = objects[i];

        // Moving platforms: oscillate
        if (obj.type === 'moving') {
          obj.t = (obj.t || 0) + (obj.speed || 0.01);
          var wave = Math.sin(obj.t);
          var range = obj.range || 3;
          if (obj.axis === 'x') {
            obj.x = (obj.originX != null ? obj.originX : obj.x) + wave * range;
          } else if (obj.axis === 'y') {
            obj.y = (obj.originY != null ? obj.originY : obj.y) + wave * range;
          } else {
            obj.z = (obj.originZ != null ? obj.originZ : obj.z) + wave * range;
          }
          // Store origins on first frame
          if (obj.originX == null) obj.originX = obj.x;
          if (obj.originY == null) obj.originY = obj.y;
          if (obj.originZ == null) obj.originZ = obj.z;
        }

        // Crumbling platforms
        if (obj.type === 'crumble') {
          if (obj.fallen) {
            obj.respawnTimer--;
            if (obj.respawnTimer <= 0) {
              obj.fallen = false;
              obj.active = true;
              obj.timer = 0;
            }
          } else if (obj.timer > 0) {
            obj.timer--;
            if (obj.timer <= 0) {
              obj.fallen = true;
              obj.active = false;
              obj.respawnTimer = CRUMBLE_RESPAWN;
            }
          }
        }

        // Spice traps: countdown
        if (obj.type === 'spiceTrap') {
          if (obj.cooldown > 0) {
            obj.cooldown--;
          }
          if (obj.cooldown <= 0) {
            obj.shouldFire = true;
            obj.cooldown = randomInt(SPICE_TRAP_MIN, SPICE_TRAP_MAX);
          } else {
            obj.shouldFire = false;
          }
        }
      }
    },

    // ── Object Effects on Players ────────────────────────

    _applyObjectEffects: function (player, objects, keys) {
      if (!player.grounded) return;

      var pBox = playerAABB(player);

      for (var i = 0; i < objects.length; i++) {
        var obj = objects[i];
        var oBox = platAABB(obj);

        // Only check objects the player is standing on (overlap with a thin zone at top)
        var standBox = {
          minX: oBox.minX, maxX: oBox.maxX,
          minY: oBox.maxY - 0.1, maxY: oBox.maxY + 0.15,
          minZ: oBox.minZ, maxZ: oBox.maxZ
        };
        if (!this.aabbOverlap(pBox, standBox)) continue;

        // Conveyor belt
        if (obj.type === 'conveyor') {
          var dir = obj.direction || 1;
          if (obj.axis === 'z') {
            player.vz += CONVEYOR_SPEED * dir;
          } else {
            player.vx += CONVEYOR_SPEED * dir;
          }
        }

        // Crumbling: start countdown
        if (obj.type === 'crumble' && obj.active && obj.timer <= 0 && !obj.fallen) {
          obj.timer = CRUMBLE_DELAY;
        }

        // Spice trap: launch player
        if (obj.type === 'spiceTrap' && obj.shouldFire) {
          player.vy += SPICE_LAUNCH_VY;
          player.grounded = false;
          obj.shouldFire = false;
        }

        // Garlic zone: reverse controls
        if (obj.type === 'garlic') {
          player.garlicTimer = GARLIC_DURATION;
        }
      }
    },

    // ── Pressure Plates ──────────────────────────────────

    checkPressurePlates: function (plates, p1, p2) {
      for (var i = 0; i < plates.length; i++) {
        var plate = plates[i];
        var pBox  = platAABB(plate);

        var p1On = p1.alive && p1.grounded && this.aabbOverlap(playerAABB(p1), pBox);
        var p2On = p2.alive && p2.grounded && this.aabbOverlap(playerAABB(p2), pBox);

        plate.pressed = p1On || p2On;

        // Plates that require both players
        if (plate.requireBoth) {
          plate.pressed = p1On && p2On;
        }
      }
    },

    // ── State Snapshot ───────────────────────────────────

    getState: function () {
      return {
        p1: {
          x: this.p1.x, y: this.p1.y, z: this.p1.z,
          vx: this.p1.vx, vy: this.p1.vy, vz: this.p1.vz,
          grounded: this.p1.grounded,
          anim: this.p1.anim,
          hummus: this.p1.hummus,
          alive: this.p1.alive,
          respawnTimer: this.p1.respawnTimer
        },
        p2: {
          x: this.p2.x, y: this.p2.y, z: this.p2.z,
          vx: this.p2.vx, vy: this.p2.vy, vz: this.p2.vz,
          grounded: this.p2.grounded,
          anim: this.p2.anim,
          hummus: this.p2.hummus,
          alive: this.p2.alive,
          respawnTimer: this.p2.respawnTimer
        },
        objects: levelData ? levelData.objects : [],
        bullies: levelData ? levelData.bullies : [],
        plates:  levelData ? levelData.plates  : []
      };
    }
  };
})();
