# Download 3D Models (Optional)

The game works fully **without any models** — all objects are built from procedural geometry. If you want the full Quaternius 3D look, follow these steps.

---

## Quaternius Ultimate Platformer Pack

| Detail | Info |
|--------|------|
| **URL** | https://quaternius.com/packs/ultimateplatformer.html |
| **License** | CC0 — free for all uses including commercial |
| **Format** | glTF / GLB (native Three.js support) |
| **Size** | ~300 MB ZIP |

---

## What's In The Pack

| Folder | Contents |
|--------|---------|
| `platforms/` | Cube, ramp, slope, bridge, column platforms |
| `props/` | Jars, coins, crates, checkpoints, decorations |
| `enemies/` | Bully, hazard, and obstacle characters |
| `skyboxes/` | Per-island environment pieces |

---

## Installation

1. **Download** the ZIP from the link above.
2. **Extract** the ZIP anywhere on your computer.
3. **Copy** the GLB files into the matching subfolders:

```
falafelkingdom/
  models/
    quaternius/
      platforms/
        cube.glb          ← rename the cube/block platform model here
        ramp.glb          ← rename the ramp/slope model here
      props/
        jar.glb           ← rename the jar/pot model here
        checkpoint.glb    ← rename the checkpoint/flag model here
      enemies/
        bully.glb         ← rename the standard enemy model here
        bully_king.glb    ← rename the boss enemy model here
      skyboxes/
        island1.glb       ← (optional) per-island environment
```

4. **Serve** the game from a local HTTP server (required for GLB loading):
   ```bash
   # Python 3
   cd falafelkingdom
   python3 -m http.server 8080
   # Then open http://localhost:8080
   ```

> **Note:** The game detects missing models automatically and falls back to its built-in procedural geometry. You can add models one at a time.

---

## File Naming Reference

The game looks for these exact filenames:

| Object | Model Path |
|--------|-----------|
| All platforms | `models/quaternius/platforms/cube.glb` |
| Ramp platforms | `models/quaternius/platforms/ramp.glb` |
| Hummus jars | `models/quaternius/props/jar.glb` |
| Bully enemies | `models/quaternius/enemies/bully.glb` |
| Bully King (boss) | `models/quaternius/enemies/bully_king.glb` |

Models are scaled automatically to fit the platform dimensions — no manual resizing needed.
