/* ═══════════════════════════════════════════════════════════════════════════
   Falafel Kingdom — Level Definitions (levels.js)
   5 co-op platformer levels with geometry, mechanics, and metadata.
   Depends on: THREE (global), FKObjects (global, loaded before this file)
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── Palette shortcuts ──────────────────────────────────────────────────
  var C = {
    GRASS:     0x4a7c2e,
    DIRT:      0x8B7355,
    SAND:      0xD2B48C,
    STONE:     0x888888,
    METAL:     0x607080,
    DARK_METAL:0x3a3f4a,
    WOOD:      0x7a5230,
    CREAM:     0xFFF4DC,
    GOLD:      0xF4A832,
    RED_SPICE: 0xC0392B,
    TAHINI:    0xC8AD7F,
    PURPLE:    0x6a4c93,
    TEAL:      0x2a9d8f
  };

  /* ═══════════════════════════════════════════════════════════════════════
     LEVEL 1 — The Chickpea Fields  (Tutorial)
     Wide, flat, forgiving.  Teaches movement, jumping, and co-op plates.
     ═══════════════════════════════════════════════════════════════════════ */
  var level1 = {
    id: 1,
    name: 'The Chickpea Fields',
    subtitle: 'Tutorial',
    bgColor: '#1a2a1a',
    fogColor: '#1a2a1a',
    fogDensity: 0.02,
    spawnP1: { x: 0, y: 2, z: 0 },
    spawnP2: { x: 1.5, y: 2, z: 0 },

    platforms: [
      // Main ground
      { x: 10, y: -0.15, z: 0, w: 28, h: 0.3, d: 8, color: C.GRASS, type: 'static' },
      // Raised plate islands
      { x: 5, y: 0.4, z: -2.5, w: 2.5, h: 0.5, d: 2.5, color: C.DIRT, type: 'static' },
      { x: 5, y: 0.4, z:  2.5, w: 2.5, h: 0.5, d: 2.5, color: C.DIRT, type: 'static' },
      // Walls flanking the door
      { x: 9, y: 1.5, z: -3, w: 0.5, h: 3, d: 3, color: C.STONE, type: 'static' },
      { x: 9, y: 1.5, z:  3, w: 0.5, h: 3, d: 3, color: C.STONE, type: 'static' },
      // Stepping stones (post-door)
      { x: 13, y: 0.5,  z: 0, w: 3, h: 0.6, d: 3, color: C.DIRT, type: 'static' },
      { x: 17, y: 1.2,  z: 0, w: 3, h: 0.6, d: 3, color: C.DIRT, type: 'static' },
      // Exit platform
      { x: 21, y: 2.0,  z: 0, w: 4, h: 0.6, d: 4, color: C.SAND, type: 'static' }
    ],

    bullies: [
      { id: 'L1_B1', x: 14, y: 0.15, z: 0,
        waypoints: [{ x: 12, y: 0.15, z: 0 }, { x: 18, y: 0.15, z: 0 }],
        speed: 0.03, isBoss: false }
    ],

    pressurePairs: [
      { pairId: 'L1_A',
        plates: [{ x: 5, y: 0.65, z: -2.5 }, { x: 5, y: 0.65, z: 2.5 }],
        door:   { x: 9, y: 0.8, z: 0 },
        timedDuration: null }
    ],

    spiceTraps:  [],
    garlicZones: [],
    conveyors:   [],

    exitPortal: { x: 21, y: 3.5, z: 0 },

    hints: [
      'Stand on both gold plates to open the door!',
      'Jump with Space — move with WASD or Arrow Keys!'
    ],

    tutorialNPC: {
      x: 2, y: 0.5, z: 1.5,
      dialogue: [
        'Welcome to the Chickpea Fields!',
        'Both players must stand on gold plates to open doors.',
        'Head right and reach the golden portal together!'
      ]
    }
  };

  /* ═══════════════════════════════════════════════════════════════════════
     LEVEL 2 — The Spice Market
     Narrow platforms over void, spice traps, and a boost-jump gap.
     ═══════════════════════════════════════════════════════════════════════ */
  var level2 = {
    id: 2,
    name: 'The Spice Market',
    subtitle: 'Hot Oil Atmosphere',
    bgColor: '#2a1a0a',
    fogColor: '#3a2010',
    fogDensity: 0.03,
    spawnP1: { x: 0, y: 2, z: 0 },
    spawnP2: { x: 1.5, y: 2, z: 0 },

    platforms: [
      // Start island
      { x: 0, y: -0.15, z: 0, w: 6, h: 0.3, d: 5, color: C.SAND, type: 'static' },
      // Narrow bridge with spice trap spots
      { x: 5, y: 0, z: 0, w: 3, h: 0.3, d: 2, color: C.WOOD, type: 'static' },
      // Plate area (pair A)
      { x: 9.5, y: 0.3, z: 0, w: 5, h: 0.4, d: 6, color: C.SAND, type: 'static' },
      { x: 9.5, y: 0.6, z: -3, w: 2.5, h: 0.3, d: 2, color: C.DIRT, type: 'static' },
      { x: 9.5, y: 0.6, z:  3, w: 2.5, h: 0.3, d: 2, color: C.DIRT, type: 'static' },
      // Walls around door A
      { x: 13, y: 1.2, z: -2.5, w: 0.4, h: 2.5, d: 2, color: C.STONE, type: 'static' },
      { x: 13, y: 1.2, z:  2.5, w: 0.4, h: 2.5, d: 2, color: C.STONE, type: 'static' },
      // Post-door narrow run
      { x: 16, y: 0.5, z: 0, w: 3, h: 0.3, d: 2, color: C.WOOD, type: 'static' },
      { x: 19, y: 0.9, z: 0, w: 2, h: 0.3, d: 2, color: C.WOOD, type: 'static' },
      // ─── BOOST GAP (~5 units) ───
      // Landing island
      { x: 25, y: 0.7, z: 0, w: 5, h: 0.4, d: 5, color: C.SAND, type: 'static' },
      // Plate area (pair B)
      { x: 29, y: 0.9, z: 0, w: 4, h: 0.4, d: 6, color: C.SAND, type: 'static' },
      { x: 29, y: 1.2, z: -3, w: 2, h: 0.3, d: 2, color: C.DIRT, type: 'static' },
      { x: 29, y: 1.2, z:  3, w: 2, h: 0.3, d: 2, color: C.DIRT, type: 'static' },
      // Walls around door B
      { x: 32, y: 1.5, z: -2, w: 0.4, h: 2.5, d: 2, color: C.STONE, type: 'static' },
      { x: 32, y: 1.5, z:  2, w: 0.4, h: 2.5, d: 2, color: C.STONE, type: 'static' },
      // Exit area
      { x: 35, y: 0.5, z: 0, w: 4, h: 0.4, d: 4, color: C.SAND, type: 'static' }
    ],

    bullies: [
      { id: 'L2_B1', x: 16, y: 0.65, z: 0,
        waypoints: [{ x: 15, y: 0.65, z: 0 }, { x: 19, y: 0.65, z: 0 }],
        speed: 0.05, isBoss: false },
      { id: 'L2_B2', x: 27, y: 0.9, z: 0,
        waypoints: [{ x: 25, y: 0.9, z: 0 }, { x: 29, y: 0.9, z: 0 }],
        speed: 0.05, isBoss: false }
    ],

    pressurePairs: [
      { pairId: 'L2_A',
        plates: [{ x: 9.5, y: 0.75, z: -3 }, { x: 9.5, y: 0.75, z: 3 }],
        door:   { x: 13, y: 0.5, z: 0 },
        timedDuration: null },
      { pairId: 'L2_B',
        plates: [{ x: 29, y: 1.35, z: -3 }, { x: 29, y: 1.35, z: 3 }],
        door:   { x: 32, y: 0.8, z: 0 },
        timedDuration: null }
    ],

    spiceTraps: [
      { id: 'L2_S1', x: 5,  y: 0.15, z: 0 },
      { id: 'L2_S2', x: 16, y: 0.65, z: 0.5 },
      { id: 'L2_S3', x: 19, y: 1.05, z: 0 },
      { id: 'L2_S4', x: 25, y: 0.9,  z: 1 }
    ],

    garlicZones: [],
    conveyors:   [],

    exitPortal: { x: 35, y: 2, z: 0 },

    hints: [
      'Use E near your partner to launch them across!',
      'Spice traps launch you skyward — time your jumps!'
    ],

    tutorialNPC: null
  };

  /* ═══════════════════════════════════════════════════════════════════════
     LEVEL 3 — The Bully Bazaar
     Market stalls at different heights, many bullies, garlic hazards.
     ═══════════════════════════════════════════════════════════════════════ */
  var level3 = {
    id: 3,
    name: 'The Bully Bazaar',
    subtitle: 'Market Mayhem',
    bgColor: '#1a1a2a',
    fogColor: '#1a1a2a',
    fogDensity: 0.02,
    spawnP1: { x: 0, y: 2, z: 0 },
    spawnP2: { x: 1.5, y: 2, z: 0 },

    platforms: [
      // Entrance courtyard
      { x: 0, y: -0.15, z: 0, w: 8, h: 0.3, d: 8, color: C.STONE, type: 'static' },
      // Left market stall (raised)
      { x: 6, y: 1, z: -3.5, w: 5, h: 0.5, d: 3, color: C.WOOD, type: 'static' },
      // Right market stall (raised)
      { x: 6, y: 1, z:  3.5, w: 5, h: 0.5, d: 3, color: C.WOOD, type: 'static' },
      // Central narrow corridor (bullies patrol here)
      { x: 10, y: 0, z: 0, w: 8, h: 0.3, d: 3, color: C.STONE, type: 'static' },
      // Elevated stall (must jump up from corridor)
      { x: 16, y: 1.8, z: 0, w: 4, h: 0.5, d: 4, color: C.WOOD, type: 'static' },
      // Side ledge to reach elevated stall
      { x: 14, y: 0.9, z: -2.5, w: 2, h: 0.4, d: 2, color: C.DIRT, type: 'static' },
      { x: 14, y: 0.9, z:  2.5, w: 2, h: 0.4, d: 2, color: C.DIRT, type: 'static' },
      // Moving platform bridge
      { x: 20, y: 1.8, z: 0, w: 2.5, h: 0.3, d: 2.5, color: C.GOLD,
        type: 'moving', moveAxis: 'x', moveSpeed: 0.04, moveRange: 4 },
      // Far landing
      { x: 26, y: 1.8, z: 0, w: 5, h: 0.5, d: 5, color: C.STONE, type: 'static' },
      // Pressure pair area
      { x: 28, y: 2.2, z: -3, w: 2, h: 0.3, d: 2, color: C.DIRT, type: 'static' },
      { x: 28, y: 2.2, z:  3, w: 2, h: 0.3, d: 2, color: C.DIRT, type: 'static' },
      // Walls around exit door
      { x: 31, y: 3, z: -2, w: 0.4, h: 3, d: 2, color: C.STONE, type: 'static' },
      { x: 31, y: 3, z:  2, w: 0.4, h: 3, d: 2, color: C.STONE, type: 'static' },
      // Exit platform
      { x: 34, y: 1.5, z: 0, w: 4, h: 0.5, d: 4, color: C.SAND, type: 'static' }
    ],

    bullies: [
      { id: 'L3_B1', x: 8, y: 0.15, z: 0,
        waypoints: [{ x: 7, y: 0.15, z: 0 }, { x: 13, y: 0.15, z: 0 }],
        speed: 0.05, isBoss: false },
      { id: 'L3_B2', x: 11, y: 0.15, z: 1,
        waypoints: [{ x: 7, y: 0.15, z: 1 }, { x: 13, y: 0.15, z: 1 }],
        speed: 0.04, isBoss: false },
      { id: 'L3_B3', x: 6, y: 1.25, z: -3.5,
        waypoints: [{ x: 4, y: 1.25, z: -3.5 }, { x: 8, y: 1.25, z: -3.5 }],
        speed: 0.04, isBoss: false },
      { id: 'L3_B4', x: 26, y: 2.05, z: 0,
        waypoints: [{ x: 24, y: 2.05, z: -2 }, { x: 28, y: 2.05, z: 2 }],
        speed: 0.05, isBoss: false }
    ],

    pressurePairs: [
      { pairId: 'L3_A',
        plates: [{ x: 28, y: 2.5, z: -3 }, { x: 28, y: 2.5, z: 3 }],
        door:   { x: 31, y: 1.8, z: 0 },
        timedDuration: null }
    ],

    spiceTraps:  [],

    garlicZones: [
      { id: 'L3_G1', x: 10, y: 0.15, z: 0, width: 3, depth: 2 },
      { id: 'L3_G2', x: 26, y: 2.05, z: -2, width: 2, depth: 2 }
    ],

    conveyors: [],

    exitPortal: { x: 34, y: 3, z: 0 },

    hints: [
      'Get close to a bully together to confuse it!',
      'Green garlic clouds reverse your controls — be careful!'
    ],

    tutorialNPC: null
  };

  /* ═══════════════════════════════════════════════════════════════════════
     LEVEL 4 — The Falafel Factory
     Industrial theme — conveyors, pistons, and the Falafel Cannon.
     ═══════════════════════════════════════════════════════════════════════ */
  var level4 = {
    id: 4,
    name: 'The Falafel Factory',
    subtitle: 'Industrial Grind',
    bgColor: '#0a0a0f',
    fogColor: '#0a0a12',
    fogDensity: 0.025,
    spawnP1: { x: 0, y: 2, z: 0 },
    spawnP2: { x: 1.5, y: 2, z: 0 },

    platforms: [
      // Intake area
      { x: 0, y: -0.15, z: 0, w: 7, h: 0.3, d: 6, color: C.DARK_METAL, type: 'static' },
      // Conveyor 1 platform
      { x: 6.5, y: 0, z: 0, w: 6, h: 0.25, d: 3, color: C.METAL, type: 'static' },
      // Pressure pair A island
      { x: 12, y: 0.3, z: 0, w: 5, h: 0.4, d: 6, color: C.DARK_METAL, type: 'static' },
      { x: 12, y: 0.6, z: -3, w: 2, h: 0.3, d: 2, color: C.METAL, type: 'static' },
      { x: 12, y: 0.6, z:  3, w: 2, h: 0.3, d: 2, color: C.METAL, type: 'static' },
      // Walls around door A
      { x: 15.5, y: 1.5, z: -2.5, w: 0.5, h: 3, d: 2, color: C.DARK_METAL, type: 'static' },
      { x: 15.5, y: 1.5, z:  2.5, w: 0.5, h: 3, d: 2, color: C.DARK_METAL, type: 'static' },
      // Piston room floor
      { x: 19, y: 0, z: 0, w: 5, h: 0.3, d: 6, color: C.DARK_METAL, type: 'static' },
      // Vertical piston platforms (move up/down)
      { x: 18, y: 1, z: -1.5, w: 2, h: 0.3, d: 2, color: C.GOLD,
        type: 'moving', moveAxis: 'y', moveSpeed: 0.03, moveRange: 2 },
      { x: 20, y: 2, z:  1.5, w: 2, h: 0.3, d: 2, color: C.GOLD,
        type: 'moving', moveAxis: 'y', moveSpeed: 0.03, moveRange: 2 },
      // Upper walkway (reached via pistons)
      { x: 22, y: 3, z: 0, w: 4, h: 0.4, d: 4, color: C.METAL, type: 'static' },
      // Pressure pair B area
      { x: 26, y: 3, z: 0, w: 5, h: 0.4, d: 6, color: C.DARK_METAL, type: 'static' },
      { x: 26, y: 3.3, z: -3, w: 2, h: 0.3, d: 2, color: C.METAL, type: 'static' },
      { x: 26, y: 3.3, z:  3, w: 2, h: 0.3, d: 2, color: C.METAL, type: 'static' },
      // Walls around door B
      { x: 29.5, y: 4.2, z: -2, w: 0.4, h: 3, d: 2, color: C.DARK_METAL, type: 'static' },
      { x: 29.5, y: 4.2, z:  2, w: 0.4, h: 3, d: 2, color: C.DARK_METAL, type: 'static' },
      // Conveyor 2 platform
      { x: 33, y: 2.8, z: 0, w: 6, h: 0.25, d: 3, color: C.METAL, type: 'static' },
      // Cannon area — P1 stands on cannon plate, P2 gets launched
      { x: 37, y: 2.5, z: 0, w: 4, h: 0.4, d: 5, color: C.DARK_METAL, type: 'static' },
      { x: 37, y: 2.8, z: -2, w: 2, h: 0.3, d: 2, color: C.RED_SPICE, type: 'static' },
      // ─── CANNON GAP (~6 units) ───
      // Landing after cannon
      { x: 44, y: 2.5, z: 0, w: 5, h: 0.4, d: 5, color: C.DARK_METAL, type: 'static' },
      // Exit platform
      { x: 48, y: 2.5, z: 0, w: 4, h: 0.4, d: 4, color: C.METAL, type: 'static' }
    ],

    bullies: [
      { id: 'L4_B1', x: 12, y: 0.5, z: 0,
        waypoints: [{ x: 10, y: 0.5, z: -1 }, { x: 14, y: 0.5, z: 1 }],
        speed: 0.06, isBoss: false },
      { id: 'L4_B2', x: 26, y: 3.2, z: 0,
        waypoints: [{ x: 24, y: 3.2, z: 0 }, { x: 28, y: 3.2, z: 0 }],
        speed: 0.06, isBoss: false },
      { id: 'L4_B3', x: 44, y: 2.7, z: 0,
        waypoints: [{ x: 42, y: 2.7, z: -1 }, { x: 46, y: 2.7, z: 1 }],
        speed: 0.04, isBoss: false }
    ],

    pressurePairs: [
      { pairId: 'L4_A',
        plates: [{ x: 12, y: 0.7, z: -3 }, { x: 12, y: 0.7, z: 3 }],
        door:   { x: 15.5, y: 0.5, z: 0 },
        timedDuration: null },
      { pairId: 'L4_B',
        plates: [{ x: 26, y: 3.5, z: -3 }, { x: 26, y: 3.5, z: 3 }],
        door:   { x: 29.5, y: 3, z: 0 },
        timedDuration: null },
      // Falafel Cannon plate — P1 stands here, P2 near edge gets boosted
      { pairId: 'L4_CANNON',
        plates: [{ x: 37, y: 3.1, z: -2 }, { x: 37, y: 2.7, z: 1.5 }],
        door:   { x: 44, y: 5, z: 0 },
        timedDuration: null }
    ],

    spiceTraps: [],

    garlicZones: [],

    conveyors: [
      { id: 'L4_C1', x: 6.5,  y: 0.13, z: 0, length: 5, direction: 'x+' },
      { id: 'L4_C2', x: 33,   y: 2.93, z: 0, length: 5, direction: 'x+' }
    ],

    exitPortal: { x: 48, y: 4, z: 0 },

    hints: [
      'Conveyor belts push you — use them to gain speed!',
      'The Falafel Cannon: P1 stands on the red plate while P2 boosts off the edge!'
    ],

    tutorialNPC: null
  };

  /* ═══════════════════════════════════════════════════════════════════════
     LEVEL 5 — The Tahini Tower
     Vertical climb through multiple floors.  All mechanics + Boss Bully.
     ═══════════════════════════════════════════════════════════════════════ */
  var level5 = {
    id: 5,
    name: 'The Tahini Tower',
    subtitle: 'Final Ascent',
    bgColor: '#0f0a1a',
    fogColor: '#0f0a1a',
    fogDensity: 0.015,
    spawnP1: { x: 0, y: 2, z: 0 },
    spawnP2: { x: 1.5, y: 2, z: 0 },

    platforms: [
      // ── FLOOR 0: Ground lobby ──
      { x: 0, y: -0.15, z: 0, w: 10, h: 0.3, d: 8, color: C.TAHINI, type: 'static' },
      // Staircase to floor 1
      { x: 4, y: 0.8, z: 0, w: 3, h: 0.4, d: 3, color: C.STONE, type: 'static' },
      { x: 2, y: 1.8, z: 0, w: 3, h: 0.4, d: 3, color: C.STONE, type: 'static' },

      // ── FLOOR 1: Spice gauntlet (y ≈ 3) ──
      { x: -1, y: 3, z: 0, w: 8, h: 0.4, d: 6, color: C.TAHINI, type: 'static' },
      // Narrow bridge with traps
      { x: 5.5, y: 3, z: 0, w: 5, h: 0.3, d: 2, color: C.WOOD, type: 'static' },
      // Crumbling shortcut
      { x: 5.5, y: 3, z: 3, w: 3, h: 0.3, d: 2, color: C.SAND,
        type: 'crumbling' },
      // Pressure pair A area
      { x: 10, y: 3.3, z: 0, w: 5, h: 0.4, d: 6, color: C.TAHINI, type: 'static' },
      { x: 10, y: 3.6, z: -3, w: 2, h: 0.3, d: 2, color: C.DIRT, type: 'static' },
      { x: 10, y: 3.6, z:  3, w: 2, h: 0.3, d: 2, color: C.DIRT, type: 'static' },
      // Walls around door A
      { x: 13.5, y: 4.5, z: -2, w: 0.4, h: 3, d: 2, color: C.STONE, type: 'static' },
      { x: 13.5, y: 4.5, z:  2, w: 0.4, h: 3, d: 2, color: C.STONE, type: 'static' },

      // ── FLOOR 2: Garlic maze (y ≈ 6) ──
      // Staircase from floor 1
      { x: 15, y: 4.5, z: 0, w: 3, h: 0.4, d: 3, color: C.STONE, type: 'static' },
      { x: 13, y: 5.5, z: 0, w: 3, h: 0.4, d: 3, color: C.STONE, type: 'static' },
      // Main floor 2 area
      { x: 8, y: 6.5, z: 0, w: 12, h: 0.4, d: 8, color: C.TAHINI, type: 'static' },
      // Moving platform to floor 3
      { x: 3, y: 7, z: 0, w: 2.5, h: 0.3, d: 2.5, color: C.GOLD,
        type: 'moving', moveAxis: 'y', moveSpeed: 0.03, moveRange: 3 },

      // ── FLOOR 3: Timed plate challenge (y ≈ 10) ──
      { x: 0, y: 10, z: 0, w: 10, h: 0.4, d: 8, color: C.TAHINI, type: 'static' },
      // Timed plate pair (pair B) — plates only stay active 180 frames
      { x: -2, y: 10.3, z: -3, w: 2, h: 0.3, d: 2, color: C.DIRT, type: 'static' },
      { x:  4, y: 10.3, z:  3, w: 2, h: 0.3, d: 2, color: C.DIRT, type: 'static' },
      // Walls around door B
      { x: 6, y: 11.5, z: -2, w: 0.4, h: 3, d: 2, color: C.STONE, type: 'static' },
      { x: 6, y: 11.5, z:  2, w: 0.4, h: 3, d: 2, color: C.STONE, type: 'static' },
      // Conveyor bridge
      { x: 8, y: 10, z: 0, w: 5, h: 0.25, d: 3, color: C.METAL, type: 'static' },
      // Horizontal moving platform
      { x: 13, y: 10, z: 0, w: 2.5, h: 0.3, d: 2.5, color: C.GOLD,
        type: 'moving', moveAxis: 'x', moveSpeed: 0.04, moveRange: 3 },

      // ── FLOOR 4: Boss arena + final plates (y ≈ 13) ──
      { x: 18, y: 13, z: 0, w: 14, h: 0.5, d: 10, color: C.PURPLE, type: 'static' },
      // Boss arena side pillars
      { x: 13, y: 14.5, z: -4, w: 1.5, h: 3, d: 1.5, color: C.STONE, type: 'static' },
      { x: 13, y: 14.5, z:  4, w: 1.5, h: 3, d: 1.5, color: C.STONE, type: 'static' },
      { x: 23, y: 14.5, z: -4, w: 1.5, h: 3, d: 1.5, color: C.STONE, type: 'static' },
      { x: 23, y: 14.5, z:  4, w: 1.5, h: 3, d: 1.5, color: C.STONE, type: 'static' },
      // Final plate pair (pair C) — at back of arena
      { x: 23, y: 13.4, z: -3, w: 2, h: 0.3, d: 2, color: C.DIRT, type: 'static' },
      { x: 23, y: 13.4, z:  3, w: 2, h: 0.3, d: 2, color: C.DIRT, type: 'static' },
      // Walls around final exit door
      { x: 25.5, y: 14.5, z: -2, w: 0.5, h: 3, d: 2, color: C.STONE, type: 'static' },
      { x: 25.5, y: 14.5, z:  2, w: 0.5, h: 3, d: 2, color: C.STONE, type: 'static' },
      // Exit pedestal
      { x: 28, y: 13.5, z: 0, w: 4, h: 0.6, d: 4, color: C.GOLD, type: 'static' }
    ],

    bullies: [
      // Floor 1 patrol
      { id: 'L5_B1', x: 5, y: 3.15, z: 0,
        waypoints: [{ x: 3, y: 3.15, z: 0 }, { x: 8, y: 3.15, z: 0 }],
        speed: 0.05, isBoss: false },
      // Floor 2 patrol
      { id: 'L5_B2', x: 8, y: 6.7, z: -2,
        waypoints: [{ x: 4, y: 6.7, z: -2 }, { x: 12, y: 6.7, z: -2 }],
        speed: 0.05, isBoss: false },
      { id: 'L5_B3', x: 8, y: 6.7, z: 2,
        waypoints: [{ x: 4, y: 6.7, z: 2 }, { x: 12, y: 6.7, z: 2 }],
        speed: 0.04, isBoss: false },
      // Floor 3 guard
      { id: 'L5_B4', x: 2, y: 10.2, z: 0,
        waypoints: [{ x: -2, y: 10.2, z: 0 }, { x: 4, y: 10.2, z: 0 }],
        speed: 0.05, isBoss: false },
      // ★ BOSS BULLY — twice as large, requires both players within 3.0
      { id: 'L5_BOSS', x: 18, y: 13.25, z: 0,
        waypoints: [
          { x: 15, y: 13.25, z: -3 },
          { x: 21, y: 13.25, z: 3 },
          { x: 18, y: 13.25, z: 0 }
        ],
        speed: 0.04, isBoss: true }
    ],

    pressurePairs: [
      // Floor 1 gate
      { pairId: 'L5_A',
        plates: [{ x: 10, y: 3.75, z: -3 }, { x: 10, y: 3.75, z: 3 }],
        door:   { x: 13.5, y: 3.5, z: 0 },
        timedDuration: null },
      // Floor 3 timed gate (180 frames = 3 seconds at 60 fps)
      { pairId: 'L5_B',
        plates: [{ x: -2, y: 10.6, z: -3 }, { x: 4, y: 10.6, z: 3 }],
        door:   { x: 6, y: 10.2, z: 0 },
        timedDuration: 180 },
      // Boss arena final gate
      { pairId: 'L5_C',
        plates: [{ x: 23, y: 13.7, z: -3 }, { x: 23, y: 13.7, z: 3 }],
        door:   { x: 25.5, y: 13.2, z: 0 },
        timedDuration: null }
    ],

    spiceTraps: [
      { id: 'L5_S1', x: 5.5, y: 3.15, z: 0 },
      { id: 'L5_S2', x: 7,   y: 3.15, z: 0 },
      { id: 'L5_S3', x: 8,   y: 10.13, z: 1 }
    ],

    garlicZones: [
      { id: 'L5_G1', x: 8, y: 6.7, z: 0, width: 4, depth: 3 },
      { id: 'L5_G2', x: 0, y: 10.2, z: 2, width: 3, depth: 2 }
    ],

    conveyors: [
      { id: 'L5_CV1', x: 8, y: 10.13, z: 0, length: 4, direction: 'x+' }
    ],

    exitPortal: { x: 28, y: 15.5, z: 0 },

    hints: [
      'The Boss Bully is huge — both of you must get within 3 units to stun it!',
      'Timed plates only stay active for 3 seconds — hurry!',
      'Use every trick you have learned to climb the tower!'
    ],

    tutorialNPC: null,

    // Confetti burst when the final door opens
    confetti: {
      colors: [0xF4A832, 0xC0392B, 0x27AE60, 0x2980B9, 0xFFF4DC],
      count: 200,
      origin: { x: 28, y: 16, z: 0 }
    }
  };

  // ── Collected array ─────────────────────────────────────────────────
  var levels = [level1, level2, level3, level4, level5];

  // ── Helpers ─────────────────────────────────────────────────────────

  /** Returns level data by 1-based id, or null. */
  function getLevel(id) {
    return levels[id - 1] || null;
  }

  /** Direction-string → vector + axis mapping for conveyors. */
  var DIR_MAP = {
    'x+': { vec: { x:  1, y: 0, z: 0 }, axis: 'x' },
    'x-': { vec: { x: -1, y: 0, z: 0 }, axis: 'x' },
    'z+': { vec: { x: 0, y: 0, z:  1 }, axis: 'z' },
    'z-': { vec: { x: 0, y: 0, z: -1 }, axis: 'z' }
  };

  // ── Build / Clear ──────────────────────────────────────────────────

  /**
   * Instantiate every 3-D object for `levelId` into `scene`.
   * Returns an object with references to all created meshes/groups.
   */
  function buildLevel(scene, levelId) {
    var level = getLevel(levelId);
    if (!level) { return null; }

    // Scene atmosphere
    scene.background = new THREE.Color(level.bgColor);
    scene.fog = new THREE.FogExp2(new THREE.Color(level.fogColor), level.fogDensity);

    var refs = {
      platforms: [],
      plates: [],
      doors: [],
      bullies: [],
      spiceTraps: [],
      garlicZones: [],
      conveyors: [],
      portal: null
    };

    // ── Platforms ──
    level.platforms.forEach(function (p) {
      var opts = { w: p.w, h: p.h, d: p.d, color: p.color, x: p.x, y: p.y, z: p.z };
      if (p.type === 'moving') {
        opts.moving = { axis: p.moveAxis, speed: p.moveSpeed, range: p.moveRange };
      } else if (p.type === 'crumbling') {
        opts.crumbling = true;
      }
      refs.platforms.push(FKObjects.createPlatform(scene, opts));
    });

    // ── Pressure-plate pairs ──
    var plateIdx = 0;
    level.pressurePairs.forEach(function (pair) {
      pair.plates.forEach(function (pl) {
        plateIdx++;
        refs.plates.push(FKObjects.createPressurePlate(scene, {
          id: pair.pairId + '_P' + plateIdx,
          pairId: pair.pairId,
          x: pl.x, y: pl.y, z: pl.z
        }));
      });
      refs.doors.push(FKObjects.createDoor(scene, {
        id: pair.pairId + '_D',
        pairId: pair.pairId,
        x: pair.door.x, y: pair.door.y, z: pair.door.z
      }));
    });

    // ── Bullies ──
    level.bullies.forEach(function (b) {
      refs.bullies.push(FKObjects.createBully(scene, {
        id: b.id,
        isBoss: !!b.isBoss,
        x: b.x, y: b.y, z: b.z,
        waypoints: b.waypoints,
        speed: b.speed
      }));
    });

    // ── Spice traps ──
    level.spiceTraps.forEach(function (s) {
      refs.spiceTraps.push(FKObjects.createSpiceTrap(scene, {
        id: s.id, x: s.x, y: s.y, z: s.z
      }));
    });

    // ── Garlic zones ──
    level.garlicZones.forEach(function (g) {
      refs.garlicZones.push(FKObjects.createGarlicZone(scene, {
        id: g.id, x: g.x, y: g.y, z: g.z,
        width: g.width, depth: g.depth
      }));
    });

    // ── Conveyors ──
    level.conveyors.forEach(function (c) {
      var mapping = DIR_MAP[c.direction] || DIR_MAP['x+'];
      refs.conveyors.push(FKObjects.createConveyor(scene, {
        id: c.id, x: c.x, y: c.y, z: c.z,
        length: c.length,
        direction: mapping.vec,
        axis: mapping.axis
      }));
    });

    // ── Exit portal ──
    refs.portal = FKObjects.createExitPortal(scene, level.exitPortal);

    return refs;
  }

  /** Remove all level objects from the scene and reset fog. */
  function clearLevel(scene) {
    FKObjects.clearAll(scene);
    scene.fog = null;
  }

  // ── Public API ─────────────────────────────────────────────────────
  window.FKLevels = {
    levels: levels,
    getLevel: getLevel,
    totalLevels: 5,
    buildLevel: buildLevel,
    clearLevel: clearLevel
  };
})();
