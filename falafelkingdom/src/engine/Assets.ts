import {
  Scene, MeshBuilder, StandardMaterial, Color3, Vector3, Mesh,
  SceneLoader
} from '@babylonjs/core';
import '@babylonjs/loaders';

const ASSET_MAP: Record<string, string> = {
  grass:   'models/platformer/block-grass-large.glb',
  bridge:  'models/platformer/platform.glb',
  spikes:  'models/platformer/trap-spikes.glb',
  hummus:  'models/platformer/coin-gold.glb',
  falafel: 'models/platformer/tree.glb',
  bully:   'models/platformer/barrel.glb',
  flag:    'models/platformer/flag.glb',
  player:  'models/platformer/tree.glb',
};

const FALLBACK_COLORS: Record<string, Color3> = {
  grass:   new Color3(0.3, 0.7, 0.2),
  bridge:  new Color3(0.6, 0.4, 0.2),
  spikes:  new Color3(0.8, 0.1, 0.1),
  hummus:  new Color3(1.0, 0.8, 0.0),
  falafel: new Color3(1.0, 0.55, 0.0),
  bully:   new Color3(0.8, 0.1, 0.1),
  flag:    new Color3(0.2, 0.7, 1.0),
  player:  new Color3(1.0, 0.55, 0.0),
};

export class Assets {
  async loadMesh(scene: Scene, type: string, position: Vector3, scaling: Vector3): Promise<Mesh> {
    const url = ASSET_MAP[type] ?? '';
    try {
      const result = await SceneLoader.ImportMeshAsync('', '', url, scene);
      const root = result.meshes[0] as Mesh;
      root.position = position.clone();
      root.scaling = scaling.clone();
      return root;
    } catch {
      return this.fallbackMesh(scene, type, position, scaling);
    }
  }

  fallbackMesh(scene: Scene, type: string, position: Vector3, scaling: Vector3): Mesh {
    const color = FALLBACK_COLORS[type] ?? new Color3(0.5, 0.5, 0.5);
    const mat = new StandardMaterial('mat_' + type + '_' + Math.random(), scene);
    mat.diffuseColor = color;
    let mesh: Mesh;
    if (type === 'hummus') {
      mesh = MeshBuilder.CreateSphere('pickup', { diameter: 0.4 }, scene);
    } else if (type === 'spikes') {
      mesh = MeshBuilder.CreateBox('spikes', { width: scaling.x, height: scaling.y, depth: scaling.z }, scene);
    } else if (type === 'falafel' || type === 'bully' || type === 'player') {
      mesh = MeshBuilder.CreateCylinder('actor', { diameter: 0.7, height: 1.0 }, scene);
    } else {
      mesh = MeshBuilder.CreateBox('platform', { width: scaling.x, height: scaling.y, depth: scaling.z }, scene);
    }
    mesh.position = position.clone();
    mesh.material = mat;
    return mesh;
  }
}
