import { Engine, Vector3, MeshBuilder, StandardMaterial, Color3, Mesh } from '@babylonjs/core';
import { createScene } from '../engine/SceneFactory';
import { Assets } from '../engine/Assets';
import { Input } from '../input/Input';
import { KinematicController } from '../physics/KinematicController';
import { Level } from '../world/Level';
import { ResourceSystem } from '../systems/ResourceSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { CheckpointSystem } from '../systems/CheckpointSystem';
import { HUD } from '../ui/HUD';
import { eventBus } from '../systems/EventBus';
import type { UniversalCamera } from '@babylonjs/core';
import type { Scene } from '@babylonjs/core';
import type { LoadedLevel } from '../world/Level';
import type { LevelData } from '../world/Level';

type GameState = 'LOADING' | 'PLAYING' | 'WIN' | 'DEAD';

export class Game {
  private engine: Engine;
  private canvas: HTMLCanvasElement;
  private scene!: Scene;
  private camera!: UniversalCamera;
  private state: GameState = 'LOADING';

  private input!: Input;
  private controller!: KinematicController;
  private resources!: ResourceSystem;
  private interaction!: InteractionSystem;
  private checkpoints!: CheckpointSystem;
  private hud!: HUD;
  private assets!: Assets;
  private level!: LoadedLevel;
  private playerMesh!: Mesh;
  private deadTimer = 0;

  constructor(engine: Engine, canvas: HTMLCanvasElement) {
    this.engine = engine;
    this.canvas = canvas;
  }

  async start(): Promise<void> {
    const { scene, camera } = createScene(this.engine);
    this.scene = scene;
    this.camera = camera;

    this.input = new Input(this.canvas);
    this.assets = new Assets();
    this.hud = new HUD();
    this.resources = new ResourceSystem();
    this.interaction = new InteractionSystem();

    this.resources.onChanged = (n) => this.hud.setHummus(n, this.resources.cap);
    this.hud.setHummus(0, 12);

    // Load level JSON
    let levelData: LevelData;
    try {
      const resp = await fetch('levels/zone1.json');
      levelData = await resp.json() as LevelData;
    } catch {
      this.hud.showMessage('Failed to load level!', 5);
      return;
    }

    const loader = new Level();
    this.level = await loader.loadFromJSON(this.scene, levelData, this.assets);
    this.hud.setZone(this.level.name);

    // Create player mesh
    const pmat = new StandardMaterial('playermat', this.scene);
    pmat.diffuseColor = new Color3(1, 0.55, 0);
    pmat.emissiveColor = new Color3(0.4, 0.2, 0);
    this.playerMesh = MeshBuilder.CreateCylinder('player', { diameter: 0.7, height: 1.0 }, this.scene);
    this.playerMesh.material = pmat;

    // Physics controller
    this.controller = new KinematicController();
    this.controller.position.set(this.level.playerSpawn.x, this.level.playerSpawn.y, this.level.playerSpawn.z);

    // Checkpoint system
    this.checkpoints = new CheckpointSystem(this.level.playerSpawn);
    this.checkpoints.checkpoints = this.level.checkpoints;

    // Listen for actor activation
    eventBus.on('actorActivated', (data) => {
      const d = data as { id: string; unlocks: string[] };
      for (const unlockId of d.unlocks) {
        const locked = this.level.lockedPlatforms.get(d.id);
        if (locked) {
          locked.aabb.locked = false;
          locked.mesh.visibility = 1.0;
          this.level.platforms.push(locked.aabb);
          this.hud.showMessage('The bridge is open!', 3);
        }
        void unlockId;
      }
      this.checkpoints.activatedActors.add(d.id);
    });

    this.state = 'PLAYING';
    this.hud.showMessage('Welcome to Falafel Kingdom!', 3);

    this.engine.runRenderLoop(() => {
      const dt = Math.min(this.engine.getDeltaTime() / 1000, 0.05);
      this.update(dt);
      this.scene.render();
    });
  }

  private update(dt: number): void {
    this.hud.update(dt);

    if (this.state === 'WIN') return;

    if (this.state === 'DEAD') {
      this.deadTimer -= dt;
      if (this.deadTimer <= 0) {
        this.checkpoints.respawn(this.controller, this.resources);
        this.state = 'PLAYING';
      }
      return;
    }

    if (this.state !== 'PLAYING') return;

    // Update physics
    this.controller.update(dt, this.input, this.level.platforms);
    this.playerMesh.position.copyFrom(this.controller.position);
    this.playerMesh.rotation.y = this.controller.facingRight ? 0 : Math.PI;

    // Pickup collection
    for (const pk of this.level.pickups) {
      if (pk.collected) continue;
      const dx = Math.abs(this.controller.position.x - pk.mesh.position.x);
      const dy = Math.abs(this.controller.position.y - pk.mesh.position.y);
      if (dx < 0.8 && dy < 0.8) {
        pk.collected = true;
        pk.mesh.setEnabled(false);
        this.resources.add(pk.amount);
        this.hud.showMessage(`+${pk.amount} Hummus! 🧆`, 1.5);
      }
      // Bob animation
      pk.mesh.position.y += Math.sin(Date.now() / 400) * 0.002;
    }

    // Bully updates
    for (const bully of this.level.bullies) {
      const stunned = bully.update(dt, this.controller, this.resources);
      if (stunned) {
        this.resources.add(bully.data.hummusDrop);
        this.hud.showMessage(`Bully stunned! +${bully.data.hummusDrop} Hummus!`, 2);
      }
    }

    // Interaction system
    this.interaction.update(
      this.controller.position,
      this.level.falafelActors,
      this.resources,
      this.input,
      this.hud
    );

    // Falafel actor updates
    for (const actor of this.level.falafelActors) actor.update(dt);

    // Checkpoint system
    this.checkpoints.update(this.controller);

    // Hazard check
    for (const hz of this.level.hazards) {
      const dx = Math.abs(this.controller.position.x - hz.x);
      const dy = Math.abs(this.controller.position.y - hz.y);
      if (dx < hz.w / 2 + 0.3 && dy < hz.h / 2 + 0.3) {
        this.die();
        return;
      }
    }

    // Fall death
    if (this.controller.position.y < -8) {
      this.die();
      return;
    }

    // Win check
    const gp = this.level.goalPosition;
    const gdx = Math.abs(this.controller.position.x - gp.x);
    const gdy = Math.abs(this.controller.position.y - gp.y);
    if (gdx < 2 && gdy < 2) {
      this.win();
      return;
    }

    // Camera follow
    const targetX = this.controller.position.x + (this.controller.facingRight ? 3 : -3);
    const targetY = this.controller.position.y + 2;
    this.camera.position.x += (targetX - this.camera.position.x) * 0.12;
    this.camera.position.y += (targetY - this.camera.position.y) * 0.08;
    this.camera.target.x += (this.controller.position.x - this.camera.target.x) * 0.12;
    this.camera.target.y += (this.controller.position.y - this.camera.target.y) * 0.08;
  }

  private die(): void {
    this.state = 'DEAD';
    this.deadTimer = 1.5;
    this.hud.showMessage('💀 Respawning...', 1.5);
  }

  private win(): void {
    this.state = 'WIN';
    this.hud.showMessage('🎉 You Win! Falafel Kingdom is saved!', 999);
  }

  dispose(): void {
    this.scene.dispose();
  }
}
