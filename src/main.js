import { CONFIG } from '../config.js';
import { EventBus } from './core/EventBus.js';
import { Logger } from './core/Logger.js';
import { Diagnostics } from './core/Diagnostics.js';
import { ErrorHandler } from './core/ErrorHandler.js';
import { GameLoop } from './core/GameLoop.js';

import { Input } from './input/Input.js';
import { TileMap } from './world/Map.js';
import { Renderer } from './render/Renderer.js';
import { Player } from './gameplay/Player.js';
import { Guard } from './gameplay/Guard.js';
import { GuardAI } from './ai/GuardAI.js';

export async function main(){
  const bus = new EventBus();
  const logger = new Logger();
  const diagnostics = new Diagnostics(logger);
  const err = new ErrorHandler(bus, logger, diagnostics); err.attachGlobal();

  const canvas = document.getElementById('game');
  const map = new TileMap(30, 17, 32); // 960x544 ≈ 30x17
  const renderer = new Renderer(canvas, map);
  const input = new Input();

  const player = new Player(map);
  const guard = new Guard(300, 160);
  const ai = new GuardAI(guard, player, map);

  const loop = new GameLoop(bus, diagnostics); diagnostics.bindLoop(loop);

  // Systeme registrieren – jede update‑Funktion ist isoliert (try/catch in GameLoop)
  loop.addSystem('input', (dt)=>{
    let dx=0, dy=0; if (input.isDown('ArrowUp')||input.isDown('w')) dy-=1; if (input.isDown('ArrowDown')||input.isDown('s')) dy+=1; if (input.isDown('ArrowLeft')||input.isDown('a')) dx-=1; if (input.isDown('ArrowRight')||input.isDown('d')) dx+=1; const len = Math.hypot(dx,dy)||1; player.tryMove(dx/len, dy/len, dt);
  });
  loop.addSystem('ai', (dt)=>{ ai.update(dt); if (CONFIG.TEST_INJECT_ERROR && Math.random()<0.001) throw new Error('Testfehler in AI'); });
  loop.addSystem('render', (dt)=>{
    renderer.clear(); renderer.drawGrid(); renderer.drawMap(); renderer.drawFOV(guard); renderer.drawGuard(guard); renderer.drawPlayer(player);
  });

  // Fehlerkanal → zentraler Reporter
  bus.on('error', ({error, context})=>{ err.report(error instanceof Error? error : new Error(String(error)), context||{}); });

  // Start
  diagnostics.push('info', 'Framework gestartet');
  loop.run();
}
