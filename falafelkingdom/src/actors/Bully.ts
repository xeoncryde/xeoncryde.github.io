import { Mesh, Vector3 } from '@babylonjs/core';
import type { ResourceSystem } from '../systems/ResourceSystem';
import type { KinematicController } from '../physics/KinematicController';

export interface BullyData {
  id: string;
  x: number; y: number; z: number;
  patrolStart: number; patrolEnd: number;
  hummusDrop: number;
}

export class Bully {
  mesh: Mesh;
  data: BullyData;
  private dir = 1;
  private stunTimer = 0;
  active = true;

  constructor(mesh: Mesh, data: BullyData) {
    this.mesh = mesh;
    this.data = data;
  }

  update(dt: number, player: KinematicController, res: ResourceSystem): boolean {
    if (!this.active) return false;

    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      if (this.stunTimer <= 0) this.active = false;
      return false;
    }

    // Patrol
    this.mesh.position.x += this.dir * 2.5 * dt;
    if (this.mesh.position.x >= this.data.patrolEnd) this.dir = -1;
    if (this.mesh.position.x <= this.data.patrolStart) this.dir = 1;

    const dx = Math.abs(player.position.x - this.mesh.position.x);
    const dy = player.position.y - this.mesh.position.y;

    // Player jumps on top
    if (dx < 0.7 && dy > 0.3 && player.velocity.y < 0) {
      this.stunTimer = 2.0;
      player.velocity.y = 8;
      return true; // signal stun/drop
    }

    // Player touches side
    if (dx < 0.6 && Math.abs(dy) < 0.8) {
      res.spend(1); // steal 1 hummus
      // knockback
      player.velocity.x = player.position.x < this.mesh.position.x ? -5 : 5;
      player.velocity.y = 4;
    }

    return false;
  }

  get position(): Vector3 { return this.mesh.position; }
}
