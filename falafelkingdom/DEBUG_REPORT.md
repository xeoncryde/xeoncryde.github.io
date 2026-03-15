# DEBUG REPORT — Falafel Kingdom

## Summary

Four bugs were found and fixed in `index.html`.

---

## Bug 1 — `buildDecorations`: "position is read-only" (CRITICAL)

**File:** `index.html` · **Line:** 1176  
**Error:** `Uncaught TypeError: "position" is read-only`

### Root Cause

`Object.assign()` was used to set the `position` property on a `THREE.Mesh`.
`position` is a getter on Three.js `Object3D` instances that returns a `Vector3` object. The `Vector3` itself can be mutated via methods like `.set()`, but the property reference cannot be reassigned — so `Object.assign()` throws a `TypeError` and crashes the entire game.

### Fix

```js
// BEFORE (broken):
g.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(br,7,6),cloudMat.clone()),{position:{x:bx*2.2,y:by*1.4,z:bz*1.5}}));

// AFTER (fixed):
const blob = new THREE.Mesh(new THREE.SphereGeometry(br,7,6),cloudMat.clone());
blob.position.set(bx*2.2, by*1.4, bz*1.5);
g.add(blob);
```

---

## Bug 2 — Platform model path mismatch

**File:** `index.html` · **Line:** 862

### Root Cause

The fallback model path `'platforms/cube.glb'` pointed to an **empty** directory
(`models/quaternius/platforms/`). The file did not exist, causing the GLTF loader
to silently fail on every platform mesh.

### Fix

```js
// BEFORE (wrong path – directory is empty):
const modelKey = pd.modelType || 'platforms/cube.glb';

// AFTER (correct path – file exists):
const modelKey = pd.modelType || 'Modular Platforms/Single Cube/glTF/Cube_Grass_Single.gltf';
```

---

## Bug 3 — Jar model path mismatch

**File:** `index.html` · **Line:** 963

### Root Cause

`swapMeshWhenLoaded(bowl, 'props/jar.glb', …)` referenced a file in the empty
`models/quaternius/props/` directory. No jar (or equivalent) model was found in
the uploaded Quaternius asset pack.

### Fix

Removed the dead `swapMeshWhenLoaded` call. The procedural jar mesh renders
correctly on its own and is unaffected.

```js
// BEFORE (missing file – causes loader error):
if (!locked) swapMeshWhenLoaded(bowl, 'props/jar.glb', 0.65, 0.65, 0.65);

// AFTER (removed – no matching model available):
// (line deleted)
```

---

## Bug 4 — Enemy model paths mismatch

**File:** `index.html` · **Line:** 1019

### Root Cause

Enemy models were referenced as `'enemies/bully.glb'` and `'enemies/bully_king.glb'`,
but the uploaded Quaternius enemy pack uses `.gltf` files in a `glTF/` subdirectory,
and neither `bully.glb` nor `bully_king.glb` exist.

### Fix

```js
// BEFORE (non-existent files):
const enemyModel = boss ? 'enemies/bully_king.glb' : 'enemies/bully.glb';

// AFTER (correct paths from uploaded files):
const enemyModel = boss ? 'enemies/glTF/Skull.gltf' : 'enemies/glTF/Enemy.gltf';
```

Available enemy files confirmed in repo:
- `models/quaternius/enemies/glTF/Enemy.gltf` — regular bully
- `models/quaternius/enemies/glTF/Skull.gltf` — boss bully
- `models/quaternius/enemies/glTF/Bee.gltf`
- `models/quaternius/enemies/glTF/Crab.gltf`

---

## Remaining Notes

- All other `position.set()`, `rotation.copy()`, and `scale.set()` calls in the file
  use the correct Three.js API and are unaffected.
- Physics (Cannon.js) is loaded via CDN and initialised correctly in the existing code.
- The `GLTFLoader` is imported via unpkg CDN and initialised in `initModelLoader()`.
- Texture loading uses `THREE.CanvasTexture` (procedural) — no external texture files
  are required.
