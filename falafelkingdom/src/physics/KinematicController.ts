import { Vector3 } from '@babylonjs/core';
import type { Input } from '../input/Input';

export interface AABB {
  x: number; y: number; z: number;
  w: number; h: number; d: number;
  locked?: boolean;
}

const GROUND_SPEED = 7;
const JUMP_VEL = 14;
const GRAVITY = -34;
const MAX_FALL = -24;
const COYOTE_TIME = 0.12;
const JUMP_BUFFER = 0.10;
const JUMP_HOLD_TIME = 0.22;
const JUMP_HOLD_FORCE = 28;
const ACCEL_GROUND = 38;
const DECEL_GROUND = 46;
const ACCEL_AIR = 22;
const PLAYER_W = 0.6;
const PLAYER_H = 0.9;
const PLAYER_D = 0.6;

export class KinematicController {
  position = new Vector3(0, 1, 0);
  velocity = new Vector3(0, 0, 0);
  grounded = false;
  facingRight = true;

  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private jumpHoldTimer = 0;
  private wasGrounded = false;
  private jumping = false;

  update(dt: number, input: Input, platforms: AABB[]): void {
    // Horizontal
    const targetVx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (targetVx !== 0) this.facingRight = targetVx > 0;
    const accel = this.grounded ? ACCEL_GROUND : ACCEL_AIR;
    const decel = this.grounded ? DECEL_GROUND : ACCEL_AIR;
    if (targetVx !== 0) {
      this.velocity.x += (targetVx * GROUND_SPEED - this.velocity.x) * Math.min(1, accel * dt);
    } else {
      this.velocity.x *= Math.max(0, 1 - decel * dt);
    }

    // Coyote time
    if (this.wasGrounded && !this.grounded) this.coyoteTimer = COYOTE_TIME;
    else if (this.grounded) this.coyoteTimer = COYOTE_TIME;
    else this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);

    // Jump buffer
    if (input.jumpPressed) {
      this.jumpBufferTimer = JUMP_BUFFER;
      input.consumeJump();
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    }

    // Jump
    const canJump = this.coyoteTimer > 0 && !this.jumping;
    if (this.jumpBufferTimer > 0 && canJump) {
      this.velocity.y = JUMP_VEL;
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
      this.jumping = true;
      this.jumpHoldTimer = 0;
    }

    // Variable jump hold
    if (this.jumping && input.jump && this.jumpHoldTimer < JUMP_HOLD_TIME) {
      this.velocity.y += JUMP_HOLD_FORCE * dt;
      this.jumpHoldTimer += dt;
    }
    if (!input.jump) {
      this.jumping = false;
    }
    if (this.grounded) {
      this.jumping = false;
      this.jumpHoldTimer = 0;
    }

    // Gravity
    this.velocity.y += GRAVITY * dt;
    this.velocity.y = Math.max(MAX_FALL, this.velocity.y);

    // Move and collide
    this.wasGrounded = this.grounded;
    this.grounded = false;

    // Move X
    this.position.x += this.velocity.x * dt;
    for (const p of platforms) {
      if (p.locked) continue;
      if (this.overlapsAABB(p)) {
        const dx = this.position.x - p.x;
        if (dx > 0) this.position.x = p.x + p.w / 2 + PLAYER_W / 2;
        else this.position.x = p.x - p.w / 2 - PLAYER_W / 2;
        this.velocity.x = 0;
      }
    }

    // Move Y
    this.position.y += this.velocity.y * dt;
    for (const p of platforms) {
      if (p.locked) continue;
      if (this.overlapsAABB(p)) {
        const pTop = p.y + p.h / 2;
        const pBot = p.y - p.h / 2;
        const plrBot = this.position.y - PLAYER_H / 2;
        const plrTop = this.position.y + PLAYER_H / 2;
        if (this.velocity.y <= 0 && plrBot <= pTop && plrBot >= p.y) {
          this.position.y = pTop + PLAYER_H / 2;
          this.velocity.y = 0;
          this.grounded = true;
        } else if (this.velocity.y > 0 && plrTop >= pBot) {
          this.position.y = pBot - PLAYER_H / 2;
          this.velocity.y = 0;
          this.jumping = false;
        }
      }
    }
  }

  private overlapsAABB(p: AABB): boolean {
    return (
      Math.abs(this.position.x - p.x) < (PLAYER_W / 2 + p.w / 2) &&
      Math.abs(this.position.y - p.y) < (PLAYER_H / 2 + p.h / 2) &&
      Math.abs(this.position.z - p.z) < (PLAYER_D / 2 + p.d / 2)
    );
  }

  getAABB(): AABB {
    return { x: this.position.x, y: this.position.y, z: this.position.z, w: PLAYER_W, h: PLAYER_H, d: PLAYER_D };
  }
}
