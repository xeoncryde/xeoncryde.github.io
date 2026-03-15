import { Engine } from '@babylonjs/core';
import { Game } from './game/Game';

const canvas = document.getElementById('render-canvas') as HTMLCanvasElement;
const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

const game = new Game(engine, canvas);
game.start();

window.addEventListener('resize', () => engine.resize());
