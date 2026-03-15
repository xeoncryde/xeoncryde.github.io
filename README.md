# xeoncryde.github.io

## Falafel Kingdom — Island Adventure

A complete browser-based **3D platformer** built with Three.js + Cannon.js physics.

### 🎮 How to Play

Open `falafelkingdom/index.html` in your browser and start playing immediately — no build step, no install.

| Key | Action |
|-----|--------|
| `W / A / S / D` or Arrow Keys | Move |
| `SPACE` | Jump (hold for higher!) |
| `P` | Pause |

Touch controls (D-pad + jump button) appear automatically on mobile.

### 📖 Gameplay

- **Collect** hummus jars scattered across floating islands
- **Walk near** a sad falafel while holding a jar to make them happy
- **Avoid** Burnt Bullies — they'll knock you and you'll drop a jar
- When **all falafels** on an island are happy, a golden portal activates
- **Step through** the portal to reach the next island
- Save all 10 islands to earn your **Certificate of Mastery**!

### 🏝️ 10 Islands

| # | Island | Mechanic |
|---|--------|----------|
| 1 | Sandy Steps | Spring Pads |
| 2 | Coral Beach | Tidal Platforms |
| 3 | Green Valley | Wind Zones |
| 4 | Golden Meadow | Moving Platforms |
| 5 | Sunset Cliffs | Crumbling Platforms |
| 6 | Forest Grove | Teleport Mushrooms |
| 7 | Sky Bridge | Air Boost Pads |
| 8 | Crystal Lake | Ice Physics |
| 9 | Starlight Peak | Star Sequence |
| 10 | The Throne | Boss Encounter |

### ⚙️ Technical Stack

| Component | Library |
|-----------|---------|
| 3D Rendering | Three.js r128 |
| Physics Engine | Cannon.js 0.6.2 (with AABB fallback) |
| 3D Model Loading | Three.js GLTFLoader |
| Audio | Web Audio API (procedural synthesis) |
| Save System | Browser localStorage |

### 🗂️ Repository Layout

```
falafelkingdom/
  index.html          — complete game (open this!)
  SETUP_GUIDE.md      — setup instructions
  DOWNLOAD_MODELS.md  — optional Quaternius model integration
  models/
    quaternius/       — drop Quaternius GLB files here (optional)
      platforms/
      props/
      enemies/
      skyboxes/
happybirthdayfalafel/
  index.html          — birthday celebration page
```

### 🧩 Optional: 3D Models

The game uses procedural geometry by default. For the full Quaternius 3D look,
see **[`falafelkingdom/DOWNLOAD_MODELS.md`](falafelkingdom/DOWNLOAD_MODELS.md)**.
