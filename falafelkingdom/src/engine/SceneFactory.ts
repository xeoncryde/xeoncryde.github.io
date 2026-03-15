import {
  Scene, HemisphericLight, DirectionalLight, UniversalCamera,
  Vector3, Color3, Color4
} from '@babylonjs/core';
import type { Engine } from '@babylonjs/core';

export interface SceneResult {
  scene: Scene;
  camera: UniversalCamera;
}

export function createScene(engine: Engine): SceneResult {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.53, 0.81, 0.98, 1);
  scene.fogMode = Scene.FOGMODE_LINEAR;
  scene.fogColor = new Color3(0.53, 0.81, 0.98);
  scene.fogStart = 40;
  scene.fogEnd = 80;

  const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), scene);
  ambient.intensity = 0.6;
  ambient.diffuse = new Color3(1, 0.95, 0.85);
  ambient.groundColor = new Color3(0.4, 0.35, 0.2);

  const sun = new DirectionalLight('sun', new Vector3(-0.5, -1, 0.3), scene);
  sun.intensity = 0.9;
  sun.diffuse = new Color3(1, 0.95, 0.8);

  const camera = new UniversalCamera('cam', new Vector3(10, 5, -15), scene);
  camera.setTarget(new Vector3(10, 3, 0));
  camera.minZ = 0.1;
  camera.maxZ = 200;

  return { scene, camera };
}
