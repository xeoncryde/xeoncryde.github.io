/**
 * FKObjects — 3D game-object factories and per-frame visual updaters
 * for Falafel Kingdom co-op.  Vanilla JS, no modules.
 * THREE (r128) is expected as a global.
 */
(function () {
  'use strict';

  // ── Palette ────────────────────────────────────────────────
  var GOLD       = 0xF4A832;
  var DEEP_BROWN = 0x5C3317;
  var CREAM      = 0xFFF4DC;
  var SPICE_RED  = 0xC0392B;
  var DARK_BG    = 0x08080f;

  // ── Material helpers ───────────────────────────────────────

  function makeMat(color, opts) {
    var cfg = { color: color };
    if (opts) {
      if (opts.transparent)          cfg.transparent = true;
      if (opts.opacity !== undefined) cfg.opacity     = opts.opacity;
      if (opts.emissive !== undefined) cfg.emissive   = opts.emissive;
      if (opts.emissiveIntensity !== undefined) cfg.emissiveIntensity = opts.emissiveIntensity;
      if (opts.side !== undefined)   cfg.side = opts.side;
    }
    return new THREE.MeshStandardMaterial(cfg);
  }

  function setShadow(mesh) {
    mesh.castShadow    = true;
    mesh.receiveShadow = true;
  }

  function setShadowRecursive(obj) {
    obj.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow    = true;
        child.receiveShadow = true;
      }
    });
  }

  // ── Particle pool (lightweight) ────────────────────────────

  var _particles = [];

  function spawnParticles(scene, origin, color, count, speed, life) {
    for (var i = 0; i < count; i++) {
      var geo  = new THREE.SphereGeometry(0.05, 4, 4);
      var mat  = makeMat(color, { transparent: true, opacity: 1 });
      var mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(origin.x, origin.y, origin.z);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      scene.add(mesh);
      _particles.push({
        mesh: mesh,
        vx: (Math.random() - 0.5) * speed,
        vy: Math.random() * speed + speed * 0.5,
        vz: (Math.random() - 0.5) * speed,
        life: life,
        maxLife: life
      });
    }
  }

  function tickParticles(dt) {
    for (var i = _particles.length - 1; i >= 0; i--) {
      var p = _particles[i];
      p.mesh.position.x += p.vx * dt;
      p.mesh.position.y += p.vy * dt;
      p.mesh.position.z += p.vz * dt;
      p.vy -= 0.005 * dt;
      p.life -= dt;
      p.mesh.material.opacity = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        if (p.mesh.parent) p.mesh.parent.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        _particles.splice(i, 1);
      }
    }
  }

  // ── Floating text helper (canvas texture) ──────────────────

  function createFloatingText(text, color) {
    var canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = color || '#FF0000';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 32, 32);

    var tex = new THREE.CanvasTexture(canvas);
    var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    var sprite = new THREE.Sprite(mat);
    sprite.scale.set(0.5, 0.5, 0.5);
    return sprite;
  }

  // ── Object storage ─────────────────────────────────────────

  var objects = {
    plates:      [],
    doors:       [],
    bullies:     [],
    spiceTraps:  [],
    garlicZones: [],
    conveyors:   [],
    portals:     [],
    platforms:   []
  };

  // ════════════════════════════════════════════════════════════
  //  1. Pressure Plates
  // ════════════════════════════════════════════════════════════

  function createPressurePlate(scene, config) {
    var group = new THREE.Group();
    group.userData.type      = 'pressurePlate';
    group.userData.id        = config.id;
    group.userData.pairId    = config.pairId;
    group.userData.active    = false;
    group.userData.activated = false; // first-time flag

    var geo  = new THREE.BoxGeometry(1.2, 0.1, 1.2);
    var mat  = makeMat(0x888888);
    var mesh = new THREE.Mesh(geo, mat);
    setShadow(mesh);
    group.add(mesh);
    group.userData.plateMesh = mesh;

    group.position.set(config.x || 0, config.y || 0, config.z || 0);
    scene.add(group);
    objects.plates.push(group);
    return group;
  }

  function updatePlate(plate, isActive) {
    var wasActive = plate.userData.active;
    plate.userData.active = isActive;

    var mesh = plate.userData.plateMesh;
    if (isActive) {
      mesh.material.color.setHex(GOLD);
      // First-time activation particles
      if (!plate.userData.activated) {
        plate.userData.activated = true;
        var pos = new THREE.Vector3();
        plate.getWorldPosition(pos);
        spawnParticles(plate.parent || plate, pos, 0xFFFF00, 5, 0.08, 40);
      }
    } else {
      mesh.material.color.setHex(0x888888);
    }
  }

  // ════════════════════════════════════════════════════════════
  //  2. Doors
  // ════════════════════════════════════════════════════════════

  function createDoor(scene, config) {
    var group = new THREE.Group();
    group.userData.type      = 'door';
    group.userData.id        = config.id;
    group.userData.pairId    = config.pairId;
    group.userData.open      = false;
    group.userData.closedY   = config.y || 0;
    group.userData.targetY   = config.y || 0;

    var geo  = new THREE.BoxGeometry(1, 2.5, 0.2);
    var mat  = makeMat(DEEP_BROWN);
    var mesh = new THREE.Mesh(geo, mat);
    setShadow(mesh);
    group.add(mesh);

    group.position.set(config.x || 0, config.y || 0, config.z || 0);
    scene.add(group);
    objects.doors.push(group);
    return group;
  }

  function updateDoor(door, isOpen) {
    door.userData.open = isOpen;
    if (isOpen) {
      door.userData.targetY = door.userData.closedY + 3;
    } else {
      door.userData.targetY = door.userData.closedY;
    }
  }

  function _tickDoor(door) {
    var target = door.userData.targetY;
    var cur    = door.position.y;
    if (door.userData.open && cur < target) {
      door.position.y = Math.min(cur + 0.08, target);
    } else if (!door.userData.open && cur > target) {
      door.position.y = Math.max(cur - 0.08, target);
    }
  }

  // ════════════════════════════════════════════════════════════
  //  3. Bullies
  // ════════════════════════════════════════════════════════════

  function _addBullyEyes(group, scale) {
    var s = scale || 1;
    var eyeGeo   = new THREE.SphereGeometry(0.07 * s, 8, 8);
    var eyeMat   = makeMat(0xFFFFFF);
    var pupilGeo = new THREE.SphereGeometry(0.03 * s, 6, 6);
    var pupilMat = makeMat(0x000000);

    var offX = 0.13 * s;
    var eyeY = 0.12 * s;
    var eyeZ = 0.35 * s + 0.01;

    // Left eye
    var leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-offX, eyeY, eyeZ);
    setShadow(leftEye);
    group.add(leftEye);

    var leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(0, 0, 0.05 * s);
    leftEye.add(leftPupil);

    // Right eye
    var rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(offX, eyeY, eyeZ);
    setShadow(rightEye);
    group.add(rightEye);

    var rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0, 0, 0.05 * s);
    rightEye.add(rightPupil);

    // Angry eyebrows
    var browGeo = new THREE.BoxGeometry(0.2 * s, 0.03 * s, 0.03 * s);
    var browMat = makeMat(SPICE_RED);

    var leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-offX, eyeY + 0.09 * s, eyeZ + 0.01);
    leftBrow.rotation.z = 0.3; // tilted inward
    setShadow(leftBrow);
    group.add(leftBrow);

    var rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(offX, eyeY + 0.09 * s, eyeZ + 0.01);
    rightBrow.rotation.z = -0.3; // tilted inward
    setShadow(rightBrow);
    group.add(rightBrow);
  }

  function createBully(scene, config) {
    var isBoss = !!config.isBoss;
    var size   = isBoss ? 1.4 : 0.7;
    var group  = new THREE.Group();

    group.userData.type       = 'bully';
    group.userData.id         = config.id;
    group.userData.isBoss     = isBoss;
    group.userData.waypoints  = config.waypoints || [];
    group.userData.waypointIdx = 0;
    group.userData.stunned    = false;
    group.userData.chasing    = false;

    // Body
    var bodyGeo = new THREE.BoxGeometry(size, size, size);
    var bodyMat = makeMat(0x8B1A1A);
    var body    = new THREE.Mesh(bodyGeo, bodyMat);
    setShadow(body);
    group.add(body);
    group.userData.bodyMesh = body;

    // Scale factor for features relative to body size
    var s = size / 0.7;
    _addBullyEyes(group, s);

    // Boss: red glowing eyes override
    if (isBoss) {
      group.traverse(function (child) {
        if (child.isMesh && child.material.color.getHex() === 0xFFFFFF) {
          child.material = makeMat(0xFF0000, { emissive: 0xFF0000, emissiveIntensity: 0.8 });
        }
      });
    }

    // Stun text (hidden initially)
    var stunText = createFloatingText('✗', '#FF0000');
    stunText.position.y = size * 0.8;
    stunText.visible = false;
    group.add(stunText);
    group.userData.stunText = stunText;

    group.position.set(config.x || 0, config.y || 0, config.z || 0);
    scene.add(group);
    objects.bullies.push(group);
    return group;
  }

  function updateBully(bully, state) {
    if (state.x !== undefined) bully.position.x = state.x;
    if (state.y !== undefined) bully.position.y = state.y;
    if (state.z !== undefined) bully.position.z = state.z;

    var body     = bully.userData.bodyMesh;
    var stunText = bully.userData.stunText;
    bully.userData.stunned = !!state.stunned;
    bully.userData.chasing = !!state.chasing;

    if (state.stunned) {
      bully.rotation.y += 0.3;
      body.material.color.setHex(0x6A0080);
      if (stunText) stunText.visible = true;
    } else {
      body.material.color.setHex(0x8B1A1A);
      if (stunText) stunText.visible = false;
    }
  }

  // ════════════════════════════════════════════════════════════
  //  6. Spice Traps
  // ════════════════════════════════════════════════════════════

  function createSpiceTrap(scene, config) {
    var group = new THREE.Group();
    group.userData.type      = 'spiceTrap';
    group.userData.id        = config.id;
    group.userData.triggered = false;
    group.userData.pulseTime = 0;

    var geo  = new THREE.BoxGeometry(1, 0.15, 1);
    var mat  = makeMat(0xD35400, { emissive: 0xD35400, emissiveIntensity: 0.15 });
    var mesh = new THREE.Mesh(geo, mat);
    setShadow(mesh);
    group.add(mesh);
    group.userData.trapMesh = mesh;

    group.position.set(config.x || 0, config.y || 0, config.z || 0);
    scene.add(group);
    objects.spiceTraps.push(group);
    return group;
  }

  function updateSpiceTrap(trap, triggered) {
    if (triggered && !trap.userData.triggered) {
      // Trigger burst
      var pos = new THREE.Vector3();
      trap.getWorldPosition(pos);
      spawnParticles(trap.parent || trap, pos, SPICE_RED, 8, 0.1, 30);
    }
    trap.userData.triggered = triggered;
  }

  function _tickSpiceTrap(trap, dt) {
    trap.userData.pulseTime += dt * 0.05;
    var intensity = 0.15 + Math.sin(trap.userData.pulseTime) * 0.1;
    trap.userData.trapMesh.material.emissiveIntensity = Math.max(0, intensity);
  }

  // ════════════════════════════════════════════════════════════
  //  7. Garlic Zones
  // ════════════════════════════════════════════════════════════

  function createGarlicZone(scene, config) {
    var w = config.width || 3;
    var d = config.depth || 3;
    var group = new THREE.Group();
    group.userData.type = 'garlicZone';
    group.userData.id   = config.id;
    group.userData.particleTimer = 0;

    var geo  = new THREE.PlaneGeometry(w, d);
    var mat  = makeMat(0x556B2F, {
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2; // lay flat
    mesh.receiveShadow = true;
    group.add(mesh);

    group.position.set(config.x || 0, config.y || 0.01, config.z || 0);
    scene.add(group);
    objects.garlicZones.push(group);
    return group;
  }

  function _tickGarlicZone(zone, dt) {
    zone.userData.particleTimer += dt;
    if (zone.userData.particleTimer > 20) {
      zone.userData.particleTimer = 0;
      var pos = new THREE.Vector3();
      zone.getWorldPosition(pos);
      pos.x += (Math.random() - 0.5) * 2;
      pos.z += (Math.random() - 0.5) * 2;
      spawnParticles(zone.parent || zone, pos, 0x556B2F, 1, 0.03, 50);
    }
  }

  // ════════════════════════════════════════════════════════════
  //  8. Conveyor Belts
  // ════════════════════════════════════════════════════════════

  function createConveyor(scene, config) {
    var length    = config.length || 4;
    var direction = config.direction || { x: 1, y: 0, z: 0 };
    var group     = new THREE.Group();

    group.userData.type      = 'conveyor';
    group.userData.id        = config.id;
    group.userData.direction = direction;
    group.userData.length    = length;
    group.userData.arrows    = [];

    // Belt body
    var beltGeo = new THREE.BoxGeometry(length, 0.2, 1);
    var beltMat = makeMat(0x666666);
    var belt    = new THREE.Mesh(beltGeo, beltMat);
    setShadow(belt);
    group.add(belt);

    // Arrow markers that scroll along the belt
    var arrowGeo = new THREE.BoxGeometry(0.15, 0.05, 0.6);
    var arrowMat = makeMat(0xFFFF00, { emissive: 0xFFFF00, emissiveIntensity: 0.3 });
    var arrowCount = Math.max(3, Math.floor(length));
    var spacing    = length / arrowCount;
    for (var i = 0; i < arrowCount; i++) {
      var arrow = new THREE.Mesh(arrowGeo, arrowMat);
      arrow.position.set(-length / 2 + spacing * (i + 0.5), 0.13, 0);
      arrow.castShadow = false;
      group.add(arrow);
      group.userData.arrows.push(arrow);
    }

    group.position.set(config.x || 0, config.y || 0, config.z || 0);
    scene.add(group);
    objects.conveyors.push(group);
    return group;
  }

  function updateConveyor(conveyor, dt) {
    _tickConveyor(conveyor, dt);
  }

  function _tickConveyor(conveyor, dt) {
    var arrows  = conveyor.userData.arrows;
    var len     = conveyor.userData.length;
    var half    = len / 2;
    var dir     = conveyor.userData.direction;
    var speed   = 0.04 * dt;
    // Determine local scroll axis (default x)
    for (var i = 0; i < arrows.length; i++) {
      var a = arrows[i];
      a.position.x += speed;
      if (a.position.x > half) {
        a.position.x -= len;
      }
    }
  }

  // ════════════════════════════════════════════════════════════
  //  9. Exit Portal
  // ════════════════════════════════════════════════════════════

  function createExitPortal(scene, config) {
    var group = new THREE.Group();
    group.userData.type      = 'portal';
    group.userData.pulseTime = 0;

    var geo  = new THREE.TorusGeometry(0.8, 0.2, 8, 24);
    var mat  = makeMat(GOLD, { emissive: GOLD, emissiveIntensity: 0.6 });
    var mesh = new THREE.Mesh(geo, mat);
    setShadow(mesh);
    group.add(mesh);
    group.userData.portalMesh = mesh;

    group.position.set(config.x || 0, config.y || 1, config.z || 0);
    scene.add(group);
    objects.portals.push(group);
    return group;
  }

  function updatePortal(portal, dt) {
    _tickPortal(portal, dt);
  }

  function _tickPortal(portal, dt) {
    portal.userData.pulseTime += dt * 0.03;
    portal.rotation.y += 0.01 * dt;

    var mesh = portal.userData.portalMesh;
    var glow = 0.6 + Math.sin(portal.userData.pulseTime) * 0.3;
    mesh.material.emissiveIntensity = Math.max(0, glow);
  }

  // ════════════════════════════════════════════════════════════
  //  10. Platforms (static / moving)
  // ════════════════════════════════════════════════════════════

  function createPlatform(scene, config) {
    var w = config.w || 2;
    var h = config.h || 0.3;
    var d = config.d || 2;
    var color = config.color || CREAM;
    var moving    = !!config.moving;
    var crumbling = !!config.crumbling;

    var group = new THREE.Group();
    group.userData.type      = 'platform';
    group.userData.moving    = moving;
    group.userData.crumbling = crumbling;

    var geo  = new THREE.BoxGeometry(w, h, d);
    var mat  = makeMat(color);
    var mesh = new THREE.Mesh(geo, mat);
    setShadow(mesh);
    group.add(mesh);
    group.userData.platMesh = mesh;

    // Moving platform: add small arrow indicators
    if (moving) {
      var arrowGeo = new THREE.BoxGeometry(0.2, 0.06, 0.06);
      var arrowMat = makeMat(0xFFFF00, { emissive: 0xFFFF00, emissiveIntensity: 0.4 });
      for (var i = 0; i < 3; i++) {
        var arrow = new THREE.Mesh(arrowGeo, arrowMat);
        arrow.position.set((i - 1) * 0.4, h / 2 + 0.04, 0);
        arrow.castShadow = false;
        group.add(arrow);
      }
    }

    group.position.set(config.x || 0, config.y || 0, config.z || 0);
    scene.add(group);
    objects.platforms.push(group);
    return group;
  }

  // ════════════════════════════════════════════════════════════
  //  Per-frame animation for all tracked objects
  // ════════════════════════════════════════════════════════════

  function animateAll(dt) {
    var i;
    var d = (dt !== undefined) ? dt : 1;

    // Doors
    for (i = 0; i < objects.doors.length; i++) {
      _tickDoor(objects.doors[i]);
    }

    // Spice traps (pulse)
    for (i = 0; i < objects.spiceTraps.length; i++) {
      _tickSpiceTrap(objects.spiceTraps[i], d);
    }

    // Garlic zone particles
    for (i = 0; i < objects.garlicZones.length; i++) {
      _tickGarlicZone(objects.garlicZones[i], d);
    }

    // Conveyors
    for (i = 0; i < objects.conveyors.length; i++) {
      _tickConveyor(objects.conveyors[i], d);
    }

    // Portals
    for (i = 0; i < objects.portals.length; i++) {
      _tickPortal(objects.portals[i], d);
    }

    // Particles
    tickParticles(d);
  }

  // ════════════════════════════════════════════════════════════
  //  Cleanup
  // ════════════════════════════════════════════════════════════

  function clearAll(scene) {
    var key, arr, i, obj;
    for (key in objects) {
      if (!objects.hasOwnProperty(key)) continue;
      arr = objects[key];
      for (i = arr.length - 1; i >= 0; i--) {
        obj = arr[i];
        scene.remove(obj);
        obj.traverse(function (child) {
          if (child.isMesh) {
            child.geometry.dispose();
            if (child.material.map) child.material.map.dispose();
            child.material.dispose();
          }
        });
      }
      objects[key] = [];
    }

    // Clean up remaining particles
    for (i = _particles.length - 1; i >= 0; i--) {
      var p = _particles[i];
      if (p.mesh.parent) p.mesh.parent.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
    }
    _particles = [];
  }

  // ════════════════════════════════════════════════════════════
  //  Public API
  // ════════════════════════════════════════════════════════════

  window.FKObjects = {
    // Factory methods
    createPressurePlate: createPressurePlate,
    createDoor:          createDoor,
    createBully:         createBully,
    createSpiceTrap:     createSpiceTrap,
    createGarlicZone:    createGarlicZone,
    createConveyor:      createConveyor,
    createExitPortal:    createExitPortal,
    createPlatform:      createPlatform,

    // Update methods
    updatePlate:     updatePlate,
    updateDoor:      updateDoor,
    updateBully:     updateBully,
    updateSpiceTrap: updateSpiceTrap,
    updatePortal:    updatePortal,
    updateConveyor:  updateConveyor,
    animateAll:      animateAll,

    // Storage
    objects: objects,
    clearAll: clearAll
  };
})();
