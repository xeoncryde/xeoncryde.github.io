import { Vector3 } from '@babylonjs/core';
import type { KinematicController } from '../physics/KinematicController';
import type { ResourceSystem } from './ResourceSystem';

export interface CheckpointData {
  id: string;
  x: number; y: number; z: number;
  baselineHummus: number;
}

export class CheckpointSystem {
  checkpoints: CheckpointData[] = [];
  lastCheckpoint: CheckpointData | null = null;
  activatedActors = new Set<string>();
  private spawnPos: Vector3;

  constructor(spawnPos: Vector3) {
    this.spawnPos = spawnPos.clone();
  }

  update(player: KinematicController): void {
    for (const cp of this.checkpoints) {
      const dx = Math.abs(player.position.x - cp.x);
      const dy = Math.abs(player.position.y - cp.y);
      if (dx < 1.5 && dy < 1.5) {
        if (!this.lastCheckpoint || this.lastCheckpoint.id !== cp.id) {
          this.lastCheckpoint = cp;
        }
      }
    }
  }

  respawn(player: KinematicController, res: ResourceSystem): void {
    if (this.lastCheckpoint) {
      player.position.set(this.lastCheckpoint.x, this.lastCheckpoint.y + 0.5, this.lastCheckpoint.z);
      res.setBaseline(this.lastCheckpoint.baselineHummus);
    } else {
      player.position.copyFrom(this.spawnPos);
    }
    player.velocity.set(0, 0, 0);
    res.restoreToBaseline();
  }
}
