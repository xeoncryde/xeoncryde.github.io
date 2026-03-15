import type { Vector3 } from '@babylonjs/core';
import type { FalafelActor } from '../actors/FalafelActor';
import type { ResourceSystem } from './ResourceSystem';
import type { Input } from '../input/Input';
import type { HUD } from '../ui/HUD';

export class InteractionSystem {
  update(
    playerPos: Vector3,
    actors: FalafelActor[],
    res: ResourceSystem,
    input: Input,
    hud: HUD
  ): void {
    let nearActor: FalafelActor | null = null;
    for (const actor of actors) {
      const dx = Math.abs(playerPos.x - actor.position.x);
      if (dx < 1.8) {
        nearActor = actor;
        break;
      }
    }

    if (nearActor) {
      hud.showPrompt(`[E] ${nearActor.getDialogue()}`);
      if (input.interactPressed) {
        input.consumeInteract();
        const msg = nearActor.tryInteract(playerPos, res);
        if (msg) hud.showMessage(msg, 3);
      }
    } else {
      hud.hidePrompt();
    }
  }
}
