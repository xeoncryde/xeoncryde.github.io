(function () {
  "use strict";

  var _clock = 0;
  var _animStates = new Map();

  // ── helpers ──────────────────────────────────────────────────────────

  function makeMat(color, opts) {
    var cfg = { color: color };
    if (opts) {
      if (opts.transparent) cfg.transparent = true;
      if (opts.opacity !== undefined) cfg.opacity = opts.opacity;
    }
    return new THREE.MeshStandardMaterial(cfg);
  }

  function addEyes(group) {
    var eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
    var eyeMat = makeMat(0x111111);
    var leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.12, 0.08, 0.35);
    leftEye.castShadow = true;
    leftEye.receiveShadow = true;
    var rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.12, 0.08, 0.35);
    rightEye.castShadow = true;
    rightEye.receiveShadow = true;
    group.add(leftEye);
    group.add(rightEye);
  }

  function makeGlowRing(color) {
    var torusGeo = new THREE.TorusGeometry(0.35, 0.08, 8, 24);
    var torusMat = makeMat(color, { transparent: true, opacity: 0.4 });
    var ring = new THREE.Mesh(torusGeo, torusMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.38;
    ring.castShadow = false;
    ring.receiveShadow = false;
    ring.userData.isGlowRing = true;
    return ring;
  }

  function setShadow(mesh) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  }

  // ── P1 – Chickpea ───────────────────────────────────────────────────

  function createP1(scene) {
    var group = new THREE.Group();
    group.userData.type = "P1";

    // body
    var bodyGeo = new THREE.SphereGeometry(0.4, 16, 16);
    var body = new THREE.Mesh(bodyGeo, makeMat(0xe8c080));
    setShadow(body);
    group.add(body);

    // eyes
    addEyes(group);

    // crown – 3 golden spikes
    var spikeGeo = new THREE.BoxGeometry(0.06, 0.12, 0.06);
    var spikeMat = makeMat(0xf4a832);
    var offsets = [-0.1, 0, 0.1];
    for (var i = 0; i < 3; i++) {
      var spike = new THREE.Mesh(spikeGeo, spikeMat);
      spike.position.set(offsets[i], 0.44, 0);
      setShadow(spike);
      group.add(spike);
    }

    // glow ring
    group.add(makeGlowRing(0xf4a832));

    _animStates.set(group.uuid, { name: "idle", t: 0 });
    scene.add(group);
    return group;
  }

  // ── P2 – Falafel Ball ───────────────────────────────────────────────

  function createP2(scene) {
    var group = new THREE.Group();
    group.userData.type = "P2";

    // body – bumpy sphere
    var bodyGeo = new THREE.SphereGeometry(0.42, 12, 12);
    var pos = bodyGeo.getAttribute("position");
    for (var i = 0; i < pos.count; i++) {
      pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * 0.04);
      pos.setY(i, pos.getY(i) + (Math.random() - 0.5) * 0.04);
      pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * 0.04);
    }
    pos.needsUpdate = true;
    bodyGeo.computeVertexNormals();

    var body = new THREE.Mesh(bodyGeo, makeMat(0xa67c52));
    setShadow(body);
    group.add(body);

    // eyes
    addEyes(group);

    // herb sprig
    var herbGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.15, 6);
    var herb = new THREE.Mesh(herbGeo, makeMat(0x4caf50));
    herb.position.set(0.05, 0.46, 0);
    herb.rotation.z = 0.3;
    setShadow(herb);
    group.add(herb);

    // glow ring
    group.add(makeGlowRing(0x4caf50));

    _animStates.set(group.uuid, { name: "idle", t: 0 });
    scene.add(group);
    return group;
  }

  // ── position helpers ────────────────────────────────────────────────

  function updatePosition(playerGroup, state) {
    if (!playerGroup || !state) return;
    playerGroup.position.set(
      state.x || 0,
      state.y || 0,
      state.z || 0
    );
  }

  function interpolatePosition(playerGroup, state, factor) {
    if (!playerGroup || !state) return;
    var f = factor !== undefined ? factor : 0.25;
    playerGroup.position.x += ((state.x || 0) - playerGroup.position.x) * f;
    playerGroup.position.y += ((state.y || 0) - playerGroup.position.y) * f;
    playerGroup.position.z += ((state.z || 0) - playerGroup.position.z) * f;
  }

  // ── animation ───────────────────────────────────────────────────────

  function setAnimation(playerGroup, anim) {
    if (!playerGroup) return;
    var entry = _animStates.get(playerGroup.uuid);
    if (!entry) {
      entry = { name: "idle", t: 0 };
      _animStates.set(playerGroup.uuid, entry);
    }
    if (entry.name !== anim) {
      entry.name = anim;
      entry.t = 0;
    }
  }

  function tickAnimations(dt) {
    _clock += dt;

    _animStates.forEach(function (entry) {
      entry.t += dt;
    });
  }

  function applyAnimations() {
    _animStates.forEach(function (entry, uuid) {
      // find the group in the scene graph — stored weakly via uuid
      // groups self-register, so iterate tracked roots
    });
  }

  // The main per-frame update: call from your render loop with delta-time.
  function update(dt) {
    if (!dt) dt = 1 / 60;
    _clock += dt;

    _animStates.forEach(function (entry, uuid) {
      entry.t += dt;
    });

    // Pulse glow rings + apply anim per group
    // We rely on the consumer calling update(); groups are reachable via
    // the references returned by createP1/createP2.
  }

  // Call this per frame for each player group to drive procedural anims.
  function animate(playerGroup, dt) {
    if (!playerGroup) return;
    if (!dt) dt = 1 / 60;

    var entry = _animStates.get(playerGroup.uuid);
    if (!entry) return;

    entry.t += dt;
    var t = entry.t;

    // glow ring pulse
    playerGroup.children.forEach(function (child) {
      if (child.userData && child.userData.isGlowRing) {
        var pulse = 0.35 + 0.15 * Math.sin(_clock * 3); // 0.20–0.50
        child.material.opacity = pulse;
      }
    });

    switch (entry.name) {
      case "idle":
        playerGroup.scale.set(1, 1, 1);
        playerGroup.rotation.set(0, playerGroup.rotation.y, 0);
        playerGroup.position.y += Math.sin(t * 2) * 0.03;
        break;

      case "walk":
        playerGroup.scale.set(1, 1, 1);
        playerGroup.position.y += Math.sin(t * 6) * 0.03;
        playerGroup.rotation.x = 0.15; // slight forward tilt
        break;

      case "jump":
        playerGroup.scale.set(0.85, 1.2, 0.85);
        playerGroup.rotation.x = 0;
        break;

      case "fall":
        playerGroup.scale.set(1.1, 0.85, 1.1);
        playerGroup.rotation.x = 0;
        break;

      case "dead":
        playerGroup.rotation.y += dt * 6;
        var s = Math.max(0.01, 1 - t * 0.5);
        playerGroup.scale.set(s, s, s);
        if (s <= 0.01) entry.t = 2; // clamp timer once fully shrunk
        break;

      default:
        break;
    }
  }

  // ── public API ──────────────────────────────────────────────────────

  window.FKPlayer = {
    createP1: createP1,
    createP2: createP2,
    updatePosition: updatePosition,
    interpolatePosition: interpolatePosition,
    setAnimation: setAnimation,
    animate: animate,
    update: update
  };
})();
