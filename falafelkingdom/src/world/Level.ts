import { Scene, Vector3, MeshBuilder, StandardMaterial, Color3, Mesh } from '@babylonjs/core';
import type { Assets } from '../engine/Assets';
import type { FalafelActor } from '../actors/FalafelActor';
import { FalafelActor as FA } from '../actors/FalafelActor';
import type { Bully } from '../actors/Bully';
import { Bully as BullyClass } from '../actors/Bully';
import type { AABB } from '../physics/KinematicController';
import type { CheckpointData } from '../systems/CheckpointSystem';

export interface LevelData {
  id: string;
  name: string;
  gravity: number;
  platforms: Array<{ id: string; x: number; y: number; z: number; w: number; h: number; d: number; type: string; locked?: boolean; unlockedBy?: string }>;
  hazards: Array<{ id: string; x: number; y: number; z: number; w: number; h: number; d: number; type: string }>;
  pickups: Array<{ id: string; x: number; y: number; z: number; amount: number }>;
  actors: Array<{ id: string; type: string; x: number; y: number; z: number; hummusRequired?: number; unlocks?: string[]; dialogue?: { idle: string; request: string; activated: string }; patrolStart?: number; patrolEnd?: number; hummusDrop?: number }>;
  checkpoints: Array<{ id: string; x: number; y: number; z: number; baselineHummus: number }>;
  playerSpawn: { x: number; y: number; z: number };
  goalPosition: { x: number; y: number; z: number };
}

export interface LoadedLevel {
  platforms: AABB[];
  platformMeshes: Mesh[];
  lockedPlatforms: Map<string, { aabb: AABB; mesh: Mesh; unlockedBy: string }>;
  falafelActors: FalafelActor[];
  bullies: Bully[];
  pickups: Array<{ mesh: Mesh; amount: number; collected: boolean }>;
  checkpoints: CheckpointData[];
  hazards: AABB[];
  playerSpawn: Vector3;
  goalPosition: Vector3;
  name: string;
}

export class Level {
  async loadFromJSON(scene: Scene, data: LevelData, assets: Assets): Promise<LoadedLevel> {
    const platforms: AABB[] = [];
    const platformMeshes: Mesh[] = [];
    const lockedPlatforms = new Map<string, { aabb: AABB; mesh: Mesh; unlockedBy: string }>();

    // Build platforms using fallback meshes for speed/reliability
    for (const p of data.platforms) {
      const pos = new Vector3(p.x, p.y, p.z);
      const scale = new Vector3(p.w, p.h, p.d);
      const mesh = assets.fallbackMesh(scene, p.locked ? 'bridge' : p.type, pos, scale);
      const aabb: AABB = { x: p.x, y: p.y, z: p.z, w: p.w, h: p.h, d: p.d, locked: p.locked };
      if (p.locked && p.unlockedBy) {
        lockedPlatforms.set(p.id, { aabb, mesh, unlockedBy: p.unlockedBy });
        mesh.visibility = 0.4;
      } else {
        platforms.push(aabb);
      }
      platformMeshes.push(mesh);
    }

    // Hazards
    const hazards: AABB[] = [];
    for (const h of data.hazards) {
      const pos = new Vector3(h.x, h.y, h.z);
      const scale = new Vector3(h.w, h.h, h.d);
      assets.fallbackMesh(scene, h.type, pos, scale);
      hazards.push({ x: h.x, y: h.y, z: h.z, w: h.w, h: h.h, d: h.d });
    }

    // Pickups
    const pickups: LoadedLevel['pickups'] = [];
    for (const pk of data.pickups) {
      const mat = new StandardMaterial('hummat_' + pk.id, scene);
      mat.diffuseColor = new Color3(1, 0.8, 0);
      mat.emissiveColor = new Color3(0.5, 0.4, 0);
      const mesh = MeshBuilder.CreateSphere('pickup_' + pk.id, { diameter: 0.4 }, scene);
      mesh.position = new Vector3(pk.x, pk.y, pk.z);
      mesh.material = mat;
      pickups.push({ mesh, amount: pk.amount, collected: false });
    }

    // Falafel actors
    const falafelActors: FalafelActor[] = [];
    const bullies: Bully[] = [];

    for (const a of data.actors) {
      const pos = new Vector3(a.x, a.y, a.z);
      const scale = new Vector3(1, 1, 1);
      const mesh = assets.fallbackMesh(scene, a.type, pos, scale) as Mesh;

      if (a.type === 'falafel') {
        falafelActors.push(new FA(mesh, {
          id: a.id,
          x: a.x, y: a.y, z: a.z,
          hummusRequired: a.hummusRequired ?? 1,
          unlocks: a.unlocks ?? [],
          dialogue: a.dialogue ?? { idle: '...', request: 'Need hummus!', activated: 'Thanks!' }
        }));
      } else if (a.type === 'bully') {
        bullies.push(new BullyClass(mesh, {
          id: a.id,
          x: a.x, y: a.y, z: a.z,
          patrolStart: a.patrolStart ?? a.x - 2,
          patrolEnd: a.patrolEnd ?? a.x + 2,
          hummusDrop: a.hummusDrop ?? 1
        }));
      }
    }

    // Checkpoints
    const checkpoints: CheckpointData[] = data.checkpoints.map(cp => ({
      id: cp.id, x: cp.x, y: cp.y, z: cp.z, baselineHummus: cp.baselineHummus
    }));

    // Visual checkpoint markers
    for (const cp of data.checkpoints) {
      const mat = new StandardMaterial('cpmat_' + cp.id, scene);
      mat.diffuseColor = new Color3(0.2, 0.8, 0.2);
      mat.emissiveColor = new Color3(0.1, 0.4, 0.1);
      const marker = MeshBuilder.CreateBox('cp_' + cp.id, { width: 0.2, height: 1.5, depth: 0.2 }, scene);
      marker.position = new Vector3(cp.x, cp.y, cp.z);
      marker.material = mat;
    }

    // Goal marker
    const goalMat = new StandardMaterial('goalmat', scene);
    goalMat.diffuseColor = new Color3(0.2, 0.7, 1.0);
    goalMat.emissiveColor = new Color3(0.1, 0.35, 0.5);
    const goalMarker = MeshBuilder.CreateBox('goal', { width: 0.3, height: 2, depth: 0.3 }, scene);
    goalMarker.position = new Vector3(data.goalPosition.x, data.goalPosition.y, data.goalPosition.z);
    goalMarker.material = goalMat;

    return {
      platforms,
      platformMeshes,
      lockedPlatforms,
      falafelActors,
      bullies,
      pickups,
      checkpoints,
      hazards,
      playerSpawn: new Vector3(data.playerSpawn.x, data.playerSpawn.y, data.playerSpawn.z),
      goalPosition: new Vector3(data.goalPosition.x, data.goalPosition.y, data.goalPosition.z),
      name: data.name
    };
  }
}
