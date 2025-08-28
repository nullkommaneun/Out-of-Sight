import { Renderer } from './render/RendererAdapter.js';
import { GameLoop } from './core/GameLoop.js';
import { LCG } from './core/RNG.js';
import { loadLevel, createGrid } from './world/MapLoader.js';
import { canSee } from './ai/Perception.js';
import { DebugOverlay } from './ui/DebugOverlay.js';
import { Input } from './core/Input.js';

const params = new URLSearchParams(location.search);
const seedParam = params.get('seed');
const backend = params.get('backend') || 'pixi';
const rng = new LCG(seedParam ? parseInt(seedParam,10) : Math.floor(Math.random()*1e9));
document.getElementById('seed').textContent = String(rng.state);

const container = document.getElementById('game');
const width = 20*32, height = 15*32;
const renderer = new Renderer({ backend, width, height, container });

const input = new Input();
const overlay = new DebugOverlay();
input.on('F1', () => overlay.toggleF1());
input.on('KeyN', () => location.search = '?seed=' + (Math.floor(Math.random()*1e9)));
input.on('KeyR', () => location.search = '?seed=' + (rng.state));

let level, grid;
let player = { x:1, y:7, color: 0x44ccff };
let guard = { x:5, y:4, dir:[1,0], fovDeg:80, viewRadius:8, hearingRadius:5 };

async function init() {
  level = await loadLevel('/src/data/level_prison_A.json');
  grid = createGrid(level);
  // center entities to pixel coords when drawing
}

function update(dt) {
  // Minimal patrol: move guard along rectangle route
  const route = level.guards[0].route;
  if (!guard._i) guard._i = 0;
  const target = { x: route[guard._i][0], y: route[guard._i][1] };
  const dx = target.x - guard.x;
  const dy = target.y - guard.y;
  const dist = Math.hypot(dx, dy);
  const speed = 2.0 * dt; // tiles per second (approx)
  if (dist < 0.05) {
    guard._i = (guard._i + 1) % route.length;
  } else {
    guard.dir = [dx/dist || 1, dy/dist || 0];
    guard.x += (dx/dist) * speed;
    guard.y += (dy/dist) * speed;
  }
}

function render() {
  renderer.beginFrame();
  renderer.clear();

  const ts = level.tileSize;
  // Draw walls
  for (let y=0; y<level.height; y++) {
    for (let x=0; x<level.width; x++) {
      const c = level.layers.collision[y][x];
      if (c === 1) {
        renderer.drawSprite({ color: 0x1f2630 }, x*ts+ts/2, y*ts+ts/2, 0);
      }
      if (c === 2) { // door cell visualization
        renderer.drawSprite({ color: 0x8b6b3f }, x*ts+ts/2, y*ts+ts/2, 0);
      }
    }
  }

  // Draw player and guard
  renderer.drawSprite({ color: 0x44ccff }, player.x*ts+ts/2, player.y*ts+ts/2, 0);
  renderer.drawSprite({ color: 0xff5555 }, guard.x*ts+ts/2, guard.y*ts+ts/2, 0);

  if (overlay.show.grid) overlay.drawGrid(renderer, ts, level.width, level.height);
  if (overlay.show.fov) overlay.drawFOV(renderer, guard, ts);

  // Visualize LoS
  const seen = canSee(guard, player, grid);
  if (seen) {
    renderer.drawPoly([player.x*ts+ts/2, player.y*ts+ts/2, guard.x*ts+ts/2, guard.y*ts+ts/2], { stroke:'#ff0000', width:2, alpha:0, strokeAlpha:0.9 });
  }

  renderer.endFrame();
}

init().then(()=> {
  const loop = new GameLoop({ update, render, targetFPS: 60 });
  loop.start();
});
