# Troubleshooting Guide — Falafel Kingdom

## How to check for errors

Open your browser's developer console before starting the game:

- **Chrome / Edge:** Press `F12` → click the **Console** tab
- **Firefox:** Press `F12` → click the **Console** tab
- **Safari:** Press `⌘ + Option + C`

Reload the page and click **Start Game**. Any errors will appear in red.

---

## Common errors and solutions

### "position is read-only"

**Cause:** A Three.js object's `position` property was assigned directly instead of
using the `.set()` method.

**Solution:** Already fixed in this PR (see `DEBUG_REPORT.md` Bug 1).  
If you add new objects, always use:
```js
mesh.position.set(x, y, z);       // ✅ correct
mesh.position = { x, y, z };      // ❌ will throw
```

---

### "Failed to load resource: 404"

**Cause:** A model or texture file path in the code does not match the actual file
location on disk.

**How to identify it:**
1. Open the Console and look for `404` errors.
2. Note the URL — it will tell you exactly which file is missing.

**Common mismatches fixed in this PR:**

| Old path (broken) | New path (correct) |
|---|---|
| `models/quaternius/platforms/cube.glb` | `models/quaternius/Modular Platforms/Single Cube/glTF/Cube_Grass_Single.gltf` |
| `models/quaternius/props/jar.glb` | *(removed — no matching file in pack)* |
| `models/quaternius/enemies/bully.glb` | `models/quaternius/enemies/glTF/Enemy.gltf` |
| `models/quaternius/enemies/bully_king.glb` | `models/quaternius/enemies/glTF/Skull.gltf` |

**If you add new models**, verify the path by checking the `models/quaternius/` folder
structure directly in the repository.

---

### Models not appearing (invisible platforms/enemies)

**Cause:** The GLTF loader failed silently. The game falls back to procedural (coloured
box) meshes, so the game is still playable but won't show 3D models.

**Check:** In the Console, look for any messages about failed resource loads.

**Fix:** Ensure the model `.gltf` file and its companion `.bin` / texture files are all
present in the same folder.

---

### Game freezes on "Loading…" screen

**Cause:** A JavaScript error before the game loop starts.

**Check:** Open the Console before clicking Start. If you see a red error, fix that
first.

---

### Physics / player falls through platforms

**Cause:** Cannon.js physics bodies may not be created correctly, or the CDN failed to
load.

**Check:**
1. In the Console, look for `Uncaught ReferenceError: CANNON is not defined`.
2. If you see this, check your internet connection — Cannon.js is loaded from CDN.

---

### Player can't move / keyboard not responding

**Cause:** The game canvas may not have focus.

**Fix:** Click directly on the game canvas, then try again.

---

## Verifying files are in the correct location

Run a quick sanity check in the browser Console after the page loads:

```js
fetch('models/quaternius/Modular%20Platforms/Single%20Cube/glTF/Cube_Grass_Single.gltf')
  .then(r => console.log('Platform model OK:', r.status))
  .catch(e => console.error('Platform model MISSING:', e));

fetch('models/quaternius/enemies/glTF/Enemy.gltf')
  .then(r => console.log('Enemy model OK:', r.status))
  .catch(e => console.error('Enemy model MISSING:', e));
```

A `200` status means the file was found. A `404` means the file is missing.

---

## Performance issues

- Lower the browser window size if the game runs slowly.
- Close other browser tabs to free GPU memory.
- The game uses Three.js with shadows enabled — disable hardware acceleration only
  as a last resort.
