import { Mesh, Vector3 } from '@babylonjs/core';
import type { ResourceSystem } from '../systems/ResourceSystem';
import { eventBus } from '../systems/EventBus';

export const enum FalafelState { IDLE, REQUEST, ACTIVATING, ACTIVATED }

export interface FalafelActorData {
  id: string;
  x: number; y: number; z: number;
  hummusRequired: number;
  unlocks: string[];
  dialogue: { idle: string; request: string; activated: string };
}

export class FalafelActor {
  state: FalafelState = FalafelState.IDLE;
  mesh: Mesh;
  data: FalafelActorData;
  private progress = 0;
  private bobTime = 0;
  private baseY: number;

  constructor(mesh: Mesh, data: FalafelActorData) {
    this.mesh = mesh;
    this.data = data;
    this.baseY = data.y;
    this.state = FalafelState.REQUEST;
  }

  update(dt: number): void {
    this.bobTime += dt;
    this.mesh.position.y = this.baseY + Math.sin(this.bobTime * 2) * 0.1;
  }

  get position(): Vector3 { return this.mesh.position; }

  tryInteract(playerPos: Vector3, res: ResourceSystem): string {
    const dx = Math.abs(playerPos.x - this.position.x);
    if (dx > 1.8) return '';
    if (this.state === FalafelState.ACTIVATED) return this.data.dialogue.activated;
    if (this.state === FalafelState.REQUEST || this.state === FalafelState.ACTIVATING) {
      if (res.spend(1)) {
        this.progress++;
        this.state = FalafelState.ACTIVATING;
        if (this.progress >= this.data.hummusRequired) {
          this.state = FalafelState.ACTIVATED;
          eventBus.emit('actorActivated', { id: this.data.id, unlocks: this.data.unlocks });
          return this.data.dialogue.activated;
        }
        return `${this.data.dialogue.request} (${this.progress}/${this.data.hummusRequired})`;
      }
      return 'Not enough hummus!';
    }
    return this.data.dialogue.idle;
  }

  getDialogue(): string {
    switch (this.state) {
      case FalafelState.ACTIVATED: return this.data.dialogue.activated;
      case FalafelState.ACTIVATING: return `${this.data.dialogue.request} (${this.progress}/${this.data.hummusRequired})`;
      default: return this.data.dialogue.request;
    }
  }
}
