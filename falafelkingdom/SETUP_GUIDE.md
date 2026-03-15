# Falafel Kingdom — Island Adventure
## Setup Guide

The game works **completely out of the box** with no setup required.
Open `index_20.html` in any modern browser and play immediately.

### Optional: External Textures (for enhanced visuals)

The game uses procedurally generated canvas textures by default.
For higher-quality visuals, you can add real PBR textures:

1. Download the textures listed in `TEXTURES_TO_DOWNLOAD.md`
2. Place them in the folder structure described in `FOLDER_STRUCTURE.txt`
3. The game will automatically use them if present

### Controls

| Key | Action |
|-----|--------|
| `W / ↑` | Move forward |
| `A / ←` | Move left |
| `S / ↓` | Move backward |
| `D / →` | Move right |
| `SPACE` | Jump (hold for higher jump!) |
| `P` | Pause |

**Mobile:** On-screen D-pad and jump button appear automatically on touch devices.

### How to Play

1. **Collect Hummus Jars** — walk near a jar to pick it up automatically
2. **Share with Falafels** — walk near a sad falafel while holding a jar to make them happy
3. **Avoid Bullies** — they'll bounce you away and you'll drop a jar
4. **Activate the Portal** — when ALL falafels on an island are happy, a golden portal appears
5. **Step through the Portal** — to move to the next island
6. **Beat all 10 islands** — to earn your Certificate of Mastery!

### Per-Island Mechanics

| Island | Mechanic | How It Works |
|--------|----------|--------------|
| 1 — Sandy Steps | **Spring Pads** | Yellow pads launch you high into the air |
| 2 — Coral Beach | **Tidal Platforms** | Pink platforms bob up and down with the tide |
| 3 — Green Valley | **Wind Zones** | Blue shimmering zones push you sideways |
| 4 — Golden Meadow | **Moving Platforms** | Gold slabs slide side to side — ride them! |
| 5 — Sunset Cliffs | **Crumbling Platforms** | Cracked platforms fall 1.5s after you step on them |
| 6 — Forest Grove | **Teleport Mushrooms** | Step on a mushroom to teleport to its pair |
| 7 — Sky Bridge | **Air Boost Pads** | Arrow pads launch you horizontally across gaps |
| 8 — Crystal Lake | **Ice Physics** | Crystal platforms are slippery — control your slide! |
| 9 — Starlight Peak | **Star Sequence** | Touch stars in order 1→2→3→4→5 to unlock final jars |
| 10 — The Throne | **Boss Encounter** | Collect all jars and the Bully King bows peacefully |

### Saving Progress

Progress is automatically saved to browser `localStorage`.
Use "Continue" on the main menu to resume where you left off.
Use "Select Island" to replay any completed island.

### Troubleshooting

**Game doesn't load:**
- Ensure you have a working internet connection (loads Three.js from CDN)
- Use a modern browser: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- WebGL must be enabled in your browser

**Performance issues:**
- Close other browser tabs
- Lower the browser window size
- Disable browser extensions
