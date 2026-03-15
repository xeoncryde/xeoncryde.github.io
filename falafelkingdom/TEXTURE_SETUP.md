# Falafel Kingdom — Real PBR Texture Setup Guide

This guide explains how to download **free, high-resolution PBR textures** from
[Poly Haven](https://polyhaven.com/textures) to replace the canvas-generated
textures and achieve Interland-level visual quality.

All textures on Poly Haven are **CC0 licensed** (completely free, no attribution required).

---

## Folder Structure

Place downloaded textures here (relative to `falafelkingdom/`):

```
falafelkingdom/
└── textures/
    ├── stone/
    │   └── color.jpg      ← sandstone / brick platforms
    ├── earth/
    │   └── color.jpg      ← dirt / mud platforms
    ├── gold/
    │   └── color.jpg      ← gold jars, checkpoint bowls
    ├── peach/
    │   └── color.jpg      ← coral / peach-toned platforms
    ├── wood/
    │   └── color.jpg      ← ladder rails and rungs
    └── grass/
        └── color.jpg      ← ground plane
```

> **Note:** The game already includes polished canvas-generated fallback textures,
> so everything looks great even without downloading real textures. Adding real
> PBR textures gives an extra visual boost but is entirely optional.

---

## Recommended Downloads (2K resolution)

Go to **https://polyhaven.com/textures**, search for each name below,
and download the **2K JPG** variant.

### 🪨 Stone Platform (`textures/stone/color.jpg`)
- **Search:** `sandstone cliff`
- **Recommended:** [Sandstone Cliff Face](https://polyhaven.com/a/sandstone_cliff_face)
  or [Weathered Sandstone](https://polyhaven.com/a/weathered_sandstone)
- Download → rename `*_diff_2k.jpg` → `color.jpg`

### 🟤 Earth Platform (`textures/earth/color.jpg`)
- **Search:** `brown mud`
- **Recommended:** [Mud Cracked](https://polyhaven.com/a/mud_cracked_dry)
  or [Ground Dirt](https://polyhaven.com/a/ground_dirt)
- Download → rename `*_diff_2k.jpg` → `color.jpg`

### 🌿 Grass Ground (`textures/grass/color.jpg`)
- **Search:** `grass meadow`
- **Recommended:** [Grass Meadow](https://polyhaven.com/a/grass_meadow)
  or [Green Grass](https://polyhaven.com/a/green_grass)
- Download → rename `*_diff_2k.jpg` → `color.jpg`

### 🥇 Gold / Metal (`textures/gold/color.jpg`)
- **Search:** `gold metal`
- **Recommended:** [Gold](https://polyhaven.com/a/gold)
  or [Brushed Gold](https://polyhaven.com/a/brushed_metal)
- Download → rename `*_diff_2k.jpg` (or `*_col_2k.jpg`) → `color.jpg`

### 🌸 Peach Platform (`textures/peach/color.jpg`)
- **Search:** `terracotta` or `painted plaster`
- **Recommended:** [Terracotta Tiles](https://polyhaven.com/a/terracotta_tiles)
  or [Painted Plaster](https://polyhaven.com/a/painted_plaster)
- Download → rename `*_diff_2k.jpg` → `color.jpg`

### 🪵 Wood (`textures/wood/color.jpg`)
- **Search:** `old wood planks`
- **Recommended:** [Old Wood Planks](https://polyhaven.com/a/old_wood_planks)
  or [Worn Planks](https://polyhaven.com/a/worn_planks)
- Download → rename `*_diff_2k.jpg` → `color.jpg`

---

## How It Works

The game uses a **PBR texture loader with automatic canvas fallback**:

```javascript
// In the game code (loadPBRColor helper)
// 1. Tries to load textures/<set>/color.jpg from the server
// 2. If the file isn't found (404), silently falls back to the
//    procedurally-generated canvas texture — no errors, no broken visuals
```

This means you can add textures one at a time and the rest will keep
using their canvas fallbacks.

---

## Performance Tips

- **2K (2048×2048)** is the sweet spot for browser games — great quality, fast load
- Avoid 4K unless you're targeting desktop-only; it quadruples memory usage
- JPG is preferred over PNG for diffuse/colour maps (smaller files, no transparency needed)
- The game already caches all textures on the GPU — no repeated downloads

---

## HDRI Lighting (Optional)

For real environment-based reflections, download an HDRI from Poly Haven:

1. Go to https://polyhaven.com/hdris
2. Search for `spaghetti_logic` or `kloofendal_48`
3. Download the **1K HDR** version
4. Save as `textures/hdri/sky.hdr`

Then add this to `init()` after the renderer is created:

```javascript
// Load HDRI environment map
new THREE.RGBELoader()
    .load('textures/hdri/sky.hdr', function(texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;   // PBR reflections
        scene.background = texture;    // Sky background (optional)
    });
```

You'll also need the RGBELoader addon:
```html
<script src="https://unpkg.com/three@0.128.0/examples/js/loaders/RGBELoader.js"></script>
```

---

## Checklist

- [ ] Downloaded stone texture → `textures/stone/color.jpg`
- [ ] Downloaded earth texture → `textures/earth/color.jpg`
- [ ] Downloaded grass texture → `textures/grass/color.jpg`
- [ ] Downloaded gold texture → `textures/gold/color.jpg`
- [ ] Downloaded peach texture → `textures/peach/color.jpg`
- [ ] Downloaded wood texture → `textures/wood/color.jpg`
- [ ] (Optional) Downloaded HDRI → `textures/hdri/sky.hdr`

Once files are in place, just open the game — textures load automatically!
