/* ============================================================
   Falafel Kingdom — main.js
   Entry point & game loop for 2-player co-op (Three.js r128)
   ============================================================ */

(function () {
  'use strict';

  // ── Random message pools ──────────────────────────────────
  var GARLIC_MESSAGES = [
    'THE GARLIC... IT BURNS 🧄',
    'MY EYES ARE WATERING 😭',
    'WHO PUT GARLIC HERE?!',
    'raw garlic is NOT a snack 🧄',
    'I can taste it in my SOUL'
  ];

  var SPICE_MESSAGES = [
    'TOO SPICY 🌶️',
    'AHHHH MY MOUTH 🔥',
    'that was a TRAP',
    'I need milk... DO FALAFELS DRINK MILK?!',
    'spice level: REGRET 🌶️🌶️🌶️'
  ];

  function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // ── Module state ──────────────────────────────────────────
  var scene = null;
  var camera = null;
  var renderer = null;
  var role = null;
  var roomCode = null;
  var currentLevel = 1;
  var p1Group = null;
  var p2Group = null;
  var localKeys = { w: false, a: false, s: false, d: false, space: false, e: false };
  var remoteKeys = { w: false, a: false, s: false, d: false, space: false, e: false };
  var gameActive = false;
  var paused = false;

  var levelData = null;
  var builtLevel = null;
  var lastState = null;
  var lastTime = 0;
  var levelStartTime = 0;

  // Camera shake
  var shakeFrames = 0;

  // Prevent repeated event bubbles per frame
  var prevP1Alive = true;
  var prevP2Alive = true;
  var prevP1Grounded = true;
  var prevP2Grounded = true;
  var exitMessageCooldown = 0;
  var boostCooldown = 0;
  var garlicCooldownP1 = 0;
  var garlicCooldownP2 = 0;
  var spiceCooldownP1 = 0;
  var spiceCooldownP2 = 0;

  // ── Initialisation ────────────────────────────────────────
  function init() {
    // 1. Read room info
    var raw = sessionStorage.getItem('fk_room');
    if (!raw) {
      window.location.href = 'index.html';
      return;
    }
    var room = JSON.parse(raw);
    role = room.role;
    roomCode = room.code;

    // 2. Three.js renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('game-container').appendChild(renderer.domElement);

    // 3. Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 15);

    // 4. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    // Lighting
    var ambient = new THREE.AmbientLight(0x404060);
    scene.add(ambient);

    var dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 12, 8);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 2048;
    dir.shadow.mapSize.height = 2048;
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 60;
    dir.shadow.camera.left = -20;
    dir.shadow.camera.right = 20;
    dir.shadow.camera.top = 20;
    dir.shadow.camera.bottom = -20;
    scene.add(dir);

    // 5. Initialise sub-modules
    FKChat.init();
    FKUI.init(role, roomCode);
    FKUI.markLocalPlayer(role === 'host' ? 1 : 2);

    // 6. Create player meshes
    p1Group = FKPlayer.createP1(scene);
    p2Group = FKPlayer.createP2(scene);

    // 7. Set up network callbacks
    FKNetwork.onConnect = onConnect;
    FKNetwork.onDisconnect = onDisconnect;
    FKNetwork.onStateReceived = onStateReceived;
    FKNetwork.onInputReceived = onInputReceived;
    FKNetwork.onChatReceived = onChatReceived;
    FKNetwork.onEventReceived = onEventReceived;

    // 8. Connect
    FKUI.showWaitingForPlayer();

    if (role === 'host') {
      FKNetwork.hostGame().then(function (code) {
        roomCode = code;
        FKUI.updateRoomCode(code);
      });
    } else {
      // Client: retry connection with delay in case host hasn't created peer yet
      (function retryJoin(attempts) {
        FKNetwork.joinGame(roomCode).catch(function () {
          if (attempts > 0) {
            setTimeout(function () { retryJoin(attempts - 1); }, 1500);
          } else {
            FKUI.showDisconnected('Could not connect to host. Please try again.');
          }
        });
      })(5);
    }

    // 9. Input listeners
    window.addEventListener('keydown', function (e) { handleInput(e, true); });
    window.addEventListener('keyup', function (e) { handleInput(e, false); });
    window.addEventListener('resize', onResize);

    // Expose on module
    FKMain.scene = scene;
    FKMain.camera = camera;
    FKMain.renderer = renderer;
    FKMain.role = role;
    FKMain.roomCode = roomCode;
    FKMain.p1Group = p1Group;
    FKMain.p2Group = p2Group;
    FKMain.localKeys = localKeys;
    FKMain.remoteKeys = remoteKeys;
  }

  // ── Network callbacks ─────────────────────────────────────
  function onConnect() {
    // Hide loading screen
    var loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.style.display = 'none';

    FKUI.hideWaitingForPlayer();
    if (role === 'host') {
      loadLevel(1);
      startGame();
    } else {
      // Client: load level 1 visuals and start render loop
      loadLevel(1);
      startGame();
    }
  }

  function onDisconnect() {
    gameActive = false;
    FKUI.showDisconnected('Your co-op partner disconnected.');
  }

  function onStateReceived(state) {
    lastState = state;
  }

  function onInputReceived(input) {
    if (input && input.keys) {
      remoteKeys = input.keys;
      FKMain.remoteKeys = remoteKeys;
    }
  }

  function onChatReceived(data) {
    FKChat.receiveMessage(data);
  }

  function onEventReceived(data) {
    if (!data) return;
    if (data.event === 'LEVEL_CHANGE' || (data.type === 'LEVEL_CHANGE')) {
      var lvl = data.level || data.event && data.event.level;
      if (typeof lvl === 'number') {
        loadLevel(lvl);
      }
    }
    if (data.event === 'GAME_EVENT' && data.detail) {
      handleRemoteGameEvent(data.detail);
    }
  }

  function handleRemoteGameEvent(detail) {
    if (detail.type === 'bubble') {
      FKChat.showGameEvent(detail.playerId, detail.eventType);
    }
    if (detail.type === 'boost') {
      shakeFrames = 8;
    }
    if (detail.type === 'levelComplete') {
      var lvl = detail.levelId || currentLevel;
      var elapsed = Date.now() - levelStartTime;
      FKUI.showLevelComplete(lvl, elapsed, detail.triggeredBy || 'p1');
    }
    if (detail.type === 'respawn') {
      FKUI.showRespawning(detail.playerId);
    }
    if (detail.type === 'gameComplete') {
      FKUI.showGameComplete();
      gameActive = false;
    }
  }

  // ── Level management ──────────────────────────────────────
  function loadLevel(levelId) {
    currentLevel = levelId;
    FKMain.currentLevel = levelId;

    // Clear previous level
    FKObjects.clearAll(scene);
    FKLevels.clearLevel(scene);

    // Get level definition
    levelData = FKLevels.getLevel(levelId);
    if (!levelData) return;

    // Set background
    if (levelData.bgColor) {
      scene.background = new THREE.Color(levelData.bgColor);
    }
    if (levelData.fogColor) {
      scene.fog = new THREE.FogExp2(new THREE.Color(levelData.fogColor), levelData.fogDensity || 0.01);
    }

    // Build 3D objects
    builtLevel = FKLevels.buildLevel(scene, levelId);

    // Initialise physics (host only)
    if (role === 'host') {
      FKPhysics.init(levelData);
    }

    // Place players at spawn
    var spawnP1 = levelData.spawnP1 || levelData.spawn || { x: 0, y: 2, z: 0 };
    var spawnP2 = levelData.spawnP2 || { x: (spawnP1.x || 0) + 1.5, y: spawnP1.y || 2, z: spawnP1.z || 0 };
    p1Group.position.set(spawnP1.x || 0, spawnP1.y || 2, spawnP1.z || 0);
    p2Group.position.set(spawnP2.x || 1.5, spawnP2.y || 2, spawnP2.z || 0);

    // UI
    FKUI.updateLevel(levelId, levelData.name || null);
    if (levelData.hints) {
      FKUI.updateHints(levelData.hints);
    }
    FKUI.hideLevelComplete();

    // Reset event tracking
    prevP1Alive = true;
    prevP2Alive = true;
    exitMessageCooldown = 0;
    boostCooldown = 0;
    garlicCooldownP1 = 0;
    garlicCooldownP2 = 0;
    spiceCooldownP1 = 0;
    spiceCooldownP2 = 0;

    levelStartTime = Date.now();
  }

  // ── Start game ────────────────────────────────────────────
  function startGame() {
    gameActive = true;
    FKMain.gameActive = true;
    lastTime = performance.now();

    if (role === 'host') {
      FKNetwork.startSyncLoop(function () {
        return FKPhysics.getState();
      });
    }

    gameLoop();
  }

  // ── Game loop ─────────────────────────────────────────────
  function gameLoop() {
    requestAnimationFrame(gameLoop);

    var now = performance.now();
    var dt = Math.min((now - lastTime) / 1000, 0.05); // cap at 50ms
    lastTime = now;

    if (!gameActive) {
      renderer.render(scene, camera);
      return;
    }

    if (paused) {
      renderer.render(scene, camera);
      return;
    }

    if (role === 'host') {
      hostUpdate(dt);
    } else {
      clientUpdate(dt);
    }

    // ── Common updates (both roles) ─────────────────────────
    FKPlayer.animate(p1Group, dt);
    FKPlayer.animate(p2Group, dt);
    FKObjects.animateAll(dt);
    FKChat.update(camera, p1Group, p2Group);
    updateCamera(dt);

    // Cooldown ticks
    if (exitMessageCooldown > 0) exitMessageCooldown--;
    if (boostCooldown > 0) boostCooldown--;
    if (garlicCooldownP1 > 0) garlicCooldownP1--;
    if (garlicCooldownP2 > 0) garlicCooldownP2--;
    if (spiceCooldownP1 > 0) spiceCooldownP1--;
    if (spiceCooldownP2 > 0) spiceCooldownP2--;

    renderer.render(scene, camera);
  }

  // ── Host update ───────────────────────────────────────────
  function hostUpdate(dt) {
    var p1Keys = localKeys;
    var p2Keys = remoteKeys;

    FKPhysics.update(p1Keys, p2Keys);

    var phys = FKPhysics;
    var p1 = phys.p1;
    var p2 = phys.p2;

    // Update player meshes directly from physics
    FKPlayer.updatePosition(p1Group, p1);
    FKPlayer.updatePosition(p2Group, p2);

    // Animations based on physics state
    setAnimFromState(p1Group, p1);
    setAnimFromState(p2Group, p2);

    // Update hummus UI
    FKUI.updatePlayerStatus(1, p1.hummus || 0);
    FKUI.updatePlayerStatus(2, p2.hummus || 0);

    // ── Game events ─────────────────────────────────────────
    // Fall death
    if (!p1.alive && prevP1Alive) {
      FKChat.showGameEvent(1, 'fall');
      FKUI.showRespawning(1);
      sendGameEvent({ type: 'bubble', playerId: 1, eventType: 'fall' });
      sendGameEvent({ type: 'respawn', playerId: 1 });
    }
    if (!p2.alive && prevP2Alive) {
      FKChat.showGameEvent(2, 'fall');
      FKUI.showRespawning(2);
      sendGameEvent({ type: 'bubble', playerId: 2, eventType: 'fall' });
      sendGameEvent({ type: 'respawn', playerId: 2 });
    }
    prevP1Alive = p1.alive;
    prevP2Alive = p2.alive;

    // Boost jump detection
    if (boostCooldown <= 0) {
      if (p1.vy > 0.5 || p2.vy > 0.5) {
        var boostee = p1.vy > 0.5 ? 1 : 2;
        var booster = boostee === 1 ? 2 : 1;
        FKChat.showGameEvent(boostee, 'boost');
        FKChat.showGameEvent(booster, 'yeeter');
        sendGameEvent({ type: 'boost' });
        sendGameEvent({ type: 'bubble', playerId: boostee, eventType: 'boost' });
        sendGameEvent({ type: 'bubble', playerId: booster, eventType: 'yeeter' });
        shakeFrames = 8;
        boostCooldown = 30;
      }
    }

    // Bully stun
    if (levelData && levelData.bullies) {
      for (var bi = 0; bi < levelData.bullies.length; bi++) {
        var bully = phys.p1;
        // Bully interactions handled inside physics — we detect stun via player state
      }
    }
    if (p1.stunTimer > 0 && p1.stunTimer > 28) {
      FKChat.showGameEvent(1, 'stun');
      sendGameEvent({ type: 'bubble', playerId: 1, eventType: 'stun' });
    }
    if (p2.stunTimer > 0 && p2.stunTimer > 28) {
      FKChat.showGameEvent(2, 'stun');
      sendGameEvent({ type: 'bubble', playerId: 2, eventType: 'stun' });
    }

    // Garlic zone
    if (levelData && levelData.garlicZones) {
      for (var gi = 0; gi < levelData.garlicZones.length; gi++) {
        var gz = levelData.garlicZones[gi];
        var gw = (gz.width || 4) / 2;
        var gd = (gz.depth || 4) / 2;
        if (p1.x > gz.x - gw && p1.x < gz.x + gw && p1.z > gz.z - gd && p1.z < gz.z + gd) {
          if (garlicCooldownP1 <= 0) {
            FKChat.showBubble(1, randomFrom(GARLIC_MESSAGES), 3000, false);
            sendGameEvent({ type: 'bubble', playerId: 1, eventType: 'garlic' });
            garlicCooldownP1 = 120;
          }
        }
        if (p2.x > gz.x - gw && p2.x < gz.x + gw && p2.z > gz.z - gd && p2.z < gz.z + gd) {
          if (garlicCooldownP2 <= 0) {
            FKChat.showBubble(2, randomFrom(GARLIC_MESSAGES), 3000, false);
            sendGameEvent({ type: 'bubble', playerId: 2, eventType: 'garlic' });
            garlicCooldownP2 = 120;
          }
        }
      }
    }

    // Spice trap
    if (levelData && levelData.spiceTraps) {
      for (var si = 0; si < levelData.spiceTraps.length; si++) {
        var st = levelData.spiceTraps[si];
        var sdist1 = Math.abs(p1.x - st.x) + Math.abs(p1.z - st.z);
        var sdist2 = Math.abs(p2.x - st.x) + Math.abs(p2.z - st.z);
        if (sdist1 < 1.5 && spiceCooldownP1 <= 0) {
          FKChat.showBubble(1, randomFrom(SPICE_MESSAGES), 3000, false);
          sendGameEvent({ type: 'bubble', playerId: 1, eventType: 'spice' });
          spiceCooldownP1 = 120;
        }
        if (sdist2 < 1.5 && spiceCooldownP2 <= 0) {
          FKChat.showBubble(2, randomFrom(SPICE_MESSAGES), 3000, false);
          sendGameEvent({ type: 'bubble', playerId: 2, eventType: 'spice' });
          spiceCooldownP2 = 120;
        }
      }
    }

    // Exit portal check
    if (levelData && levelData.exitPortal) {
      var ep = levelData.exitPortal;
      var d1 = dist3(p1, ep);
      var d2 = dist3(p2, ep);
      var p1Near = d1 < 1.5;
      var p2Near = d2 < 1.5;

      if (p1Near && p2Near) {
        if (exitMessageCooldown <= 0) {
          FKChat.showGameEvent(1, 'both_exit');
          FKChat.showGameEvent(2, 'both_exit');
          exitMessageCooldown = 9999;
          onLevelComplete();
        }
      } else if ((p1Near || p2Near) && exitMessageCooldown <= 0) {
        var waitingPlayer = p1Near ? 1 : 2;
        FKChat.showGameEvent(waitingPlayer, 'solo_exit');
        sendGameEvent({ type: 'bubble', playerId: waitingPlayer, eventType: 'solo_exit' });
        exitMessageCooldown = 60;
      }
    }

    // Update built objects visuals from physics
    updateObjectVisuals();
  }

  // ── Client update ─────────────────────────────────────────
  function clientUpdate(dt) {
    // Send local input to host
    FKNetwork.sendInput(localKeys);

    // Interpolate from latest received state
    if (lastState) {
      if (lastState.p1) {
        FKPlayer.interpolatePosition(p1Group, lastState.p1, 0.25);
        setAnimFromState(p1Group, lastState.p1);
      }
      if (lastState.p2) {
        FKPlayer.interpolatePosition(p2Group, lastState.p2, 0.25);
        setAnimFromState(p2Group, lastState.p2);
      }

      // Update hummus
      if (lastState.p1) FKUI.updatePlayerStatus(1, lastState.p1.hummus || 0);
      if (lastState.p2) FKUI.updatePlayerStatus(2, lastState.p2.hummus || 0);

      // Update level if changed
      if (lastState.level && lastState.level !== currentLevel) {
        loadLevel(lastState.level);
      }

      // Update object states from host
      updateObjectsFromState(lastState);
    }
  }

  // ── Helper: set animation from physics state ──────────────
  function setAnimFromState(group, state) {
    if (!state.alive) {
      FKPlayer.setAnimation(group, 'dead');
    } else if (!state.grounded && state.vy > 0) {
      FKPlayer.setAnimation(group, 'jump');
    } else if (!state.grounded && state.vy <= 0) {
      FKPlayer.setAnimation(group, 'fall');
    } else if (Math.abs(state.vx) > 0.01 || Math.abs(state.vz) > 0.01) {
      FKPlayer.setAnimation(group, 'walk');
    } else {
      FKPlayer.setAnimation(group, 'idle');
    }
  }

  // ── Helper: 3D distance ───────────────────────────────────
  function dist3(a, b) {
    var dx = a.x - b.x;
    var dy = (a.y || 0) - (b.y || 0);
    var dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // ── Helper: send game event to client ─────────────────────
  function sendGameEvent(detail) {
    FKNetwork.sendEvent({ type: 'GAME_EVENT', event: 'GAME_EVENT', detail: detail });
  }

  // ── Object visuals from physics (host) ────────────────────
  function updateObjectVisuals() {
    if (!builtLevel) return;

    // Pressure plates & doors
    if (builtLevel.plates && FKPhysics.getState) {
      var st = FKPhysics.getState();
      if (st.plates) {
        for (var i = 0; i < st.plates.length; i++) {
          if (builtLevel.plates[i]) {
            FKObjects.updatePlate(builtLevel.plates[i], st.plates[i].pressed);
          }
        }
      }
      // Doors linked to plates
      if (builtLevel.doors && levelData.pressurePairs) {
        for (var pi = 0; pi < levelData.pressurePairs.length; pi++) {
          var pair = levelData.pressurePairs[pi];
          var allPressed = true;
          if (pair.plates) {
            for (var pj = 0; pj < pair.plates.length; pj++) {
              var plateIdx = pair.plates[pj];
              if (st.plates && st.plates[plateIdx] && !st.plates[plateIdx].pressed) {
                allPressed = false;
              }
            }
          }
          if (builtLevel.doors[pi]) {
            FKObjects.updateDoor(builtLevel.doors[pi], allPressed);
          }
        }
      }
    }

    // Bullies
    if (builtLevel.bullies) {
      var bState = FKPhysics.getState();
      if (bState.bullies) {
        for (var bi = 0; bi < bState.bullies.length; bi++) {
          if (builtLevel.bullies[bi]) {
            FKObjects.updateBully(builtLevel.bullies[bi], bState.bullies[bi].state || 'patrol');
          }
        }
      }
    }
  }

  // ── Update objects from network state (client) ────────────
  function updateObjectsFromState(state) {
    if (!builtLevel || !state) return;

    if (state.plates && builtLevel.plates) {
      for (var i = 0; i < state.plates.length; i++) {
        if (builtLevel.plates[i]) {
          FKObjects.updatePlate(builtLevel.plates[i], state.plates[i].pressed);
        }
      }
    }

    if (state.bullies && builtLevel.bullies) {
      for (var bi = 0; bi < state.bullies.length; bi++) {
        if (builtLevel.bullies[bi]) {
          FKObjects.updateBully(builtLevel.bullies[bi], state.bullies[bi].state || 'patrol');
        }
      }
    }

    if (builtLevel.doors && levelData && levelData.pressurePairs && state.plates) {
      for (var pi = 0; pi < levelData.pressurePairs.length; pi++) {
        var pair = levelData.pressurePairs[pi];
        var allPressed = true;
        if (pair.plates) {
          for (var pj = 0; pj < pair.plates.length; pj++) {
            if (state.plates[pair.plates[pj]] && !state.plates[pair.plates[pj]].pressed) {
              allPressed = false;
            }
          }
        }
        if (builtLevel.doors[pi]) {
          FKObjects.updateDoor(builtLevel.doors[pi], allPressed);
        }
      }
    }
  }

  // ── Level complete ────────────────────────────────────────
  function onLevelComplete() {
    var elapsed = Date.now() - levelStartTime;
    FKUI.showLevelComplete(currentLevel, elapsed, 'p1');

    sendGameEvent({ type: 'levelComplete', levelId: currentLevel, triggeredBy: 'p1' });

    if (role === 'host') {
      // Stop sync briefly
      var totalLevels = FKLevels.totalLevels || 5;
      if (currentLevel >= totalLevels) {
        // Game complete!
        FKUI.showGameComplete();
        sendGameEvent({ type: 'gameComplete' });
        gameActive = false;
        FKMain.gameActive = false;
        FKNetwork.stopSyncLoop();
      } else {
        // Advance after a short delay — host clicks "Next Level" in the UI overlay
        // Listen for the UI next-level action
        setupNextLevelListener();
      }
    }
  }

  function setupNextLevelListener() {
    // FKUI shows a "Next Level" button; we poll for it
    var checkBtn = setInterval(function () {
      var btn = document.querySelector('#fk-level-complete .fk-next-btn, #fk-level-complete button');
      if (btn && !btn._fkBound) {
        btn._fkBound = true;
        btn.addEventListener('click', function () {
          clearInterval(checkBtn);
          var nextLvl = currentLevel + 1;
          FKUI.hideLevelComplete();
          loadLevel(nextLvl);

          FKNetwork.sendEvent({ type: 'LEVEL_CHANGE', level: nextLvl });
        });
      }
    }, 200);
  }

  // ── Camera ────────────────────────────────────────────────
  function updateCamera(dt) {
    var target = role === 'host' ? p1Group : p2Group;
    if (!target) return;

    var tx = target.position.x;
    var ty = target.position.y + 6;
    var tz = target.position.z + 10;

    var lerpFactor = 1 - Math.pow(0.05, dt);

    camera.position.x += (tx - camera.position.x) * lerpFactor;
    camera.position.y += (ty - camera.position.y) * lerpFactor;
    camera.position.z += (tz - camera.position.z) * lerpFactor;

    // Camera shake
    if (shakeFrames > 0) {
      camera.position.x += (Math.random() - 0.5) * 0.1;
      camera.position.y += (Math.random() - 0.5) * 0.1;
      shakeFrames--;
    }

    // Smooth lookAt via lerp
    var lx = target.position.x;
    var ly = target.position.y;
    var lz = target.position.z;

    // We use a hidden target for smooth look
    if (!camera._lookTarget) {
      camera._lookTarget = new THREE.Vector3(lx, ly, lz);
    }
    camera._lookTarget.x += (lx - camera._lookTarget.x) * lerpFactor;
    camera._lookTarget.y += (ly - camera._lookTarget.y) * lerpFactor;
    camera._lookTarget.z += (lz - camera._lookTarget.z) * lerpFactor;
    camera.lookAt(camera._lookTarget);
  }

  // ── Input ─────────────────────────────────────────────────
  function handleInput(e, isDown) {
    // Chat toggle (T key handled by FKChat internally)
    if (FKChat.isOpen) return;

    var key = e.key ? e.key.toLowerCase() : '';
    var code = e.code || '';

    switch (key) {
      case 'w': case 'arrowup':    localKeys.w = isDown; break;
      case 'a': case 'arrowleft':  localKeys.a = isDown; break;
      case 's': case 'arrowdown':  localKeys.s = isDown; break;
      case 'd': case 'arrowright': localKeys.d = isDown; break;
      case ' ':                    localKeys.space = isDown; break;
      case 'e':                    localKeys.e = isDown; break;
      case 'p':
        if (isDown && role === 'host') {
          paused = !paused;
          FKMain.paused = paused;
          if (paused) {
            FKUI.showPause();
          } else {
            FKUI.hidePause();
          }
        }
        break;
    }

    // Also map space from code in case key is weird
    if (code === 'Space') localKeys.space = isDown;
  }

  // ── Resize ────────────────────────────────────────────────
  function onResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ── Public module ─────────────────────────────────────────
  window.FKMain = {
    scene: null,
    camera: null,
    renderer: null,
    role: null,
    roomCode: null,
    currentLevel: 1,
    p1Group: null,
    p2Group: null,
    localKeys: localKeys,
    remoteKeys: remoteKeys,
    gameActive: false,
    paused: false,

    init: init,
    startGame: startGame,
    gameLoop: gameLoop,
    loadLevel: loadLevel,
    handleInput: handleInput,
    updateCamera: updateCamera
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
