import { CONFIG } from '../../config.js';
import { Profiler } from './Profiler.js';

export class GameLoop {
  constructor(bus, diagnostics){
    this.bus = bus; this.diagnostics = diagnostics; this.systems = [];
    this.profiler = new Profiler();
    this.acc = 0; this.last = performance.now(); this.paused = false; this.stepPending = false;
    this.frameTimes = []; // für FPS

    bus.on('system:disable', ({system})=>{
      const s = this.systems.find(x=>x.name===system); if (s) s.enabled = false;
    });
    bus.on('system:enable', ({system})=>{
      const s = this.systems.find(x=>x.name===system); if (s) s.enabled = true;
    });
  }
  addSystem(name, updateFn){ this.systems.push({ name, updateFn, enabled:true, lastMs:0 }); }
  togglePause(){ this.paused = !this.paused; this.diagnostics?.push('info', `Loop ${this.paused?'pausiert':'läuft'}`); }
  stepOnce(){ this.stepPending = true; if (this.paused) this.runFrame(performance.now()); }

  run(){ requestAnimationFrame(this.tick.bind(this)); }
  tick(now){
    if (!this.paused) this.acc += now - this.last; this.last = now;
    const dt = CONFIG.FIXED_DT;
    let loops = 0;
    while (this.acc >= dt && (loops < CONFIG.MAX_FRAME_SKIP || this.stepPending)){
      this.runFrame(now);
      this.acc -= dt; loops++; this.stepPending = false;
      if (loops >= CONFIG.MAX_FRAME_SKIP) { this.acc = 0; break; }
    }
    requestAnimationFrame(this.tick.bind(this));
  }

  runFrame(now){
    const dt = CONFIG.FIXED_DT;
    const frameStart = performance.now();

    for (const s of this.systems){
      if (!s.enabled) { s.lastMs = 0; continue; }
      try {
        this.profiler.time(s.name);
        s.updateFn(dt);
        s.lastMs = this.profiler.timeEnd(s.name);
      } catch (e) {
        // Fehler pro System isolieren
        s.lastMs = 0;
        this.bus.emit('error', { ts: Date.now(), error: e, context:{ system:s.name } });
      }
    }

    const frameMs = performance.now() - frameStart;
    this.frameTimes.push(frameMs); if (this.frameTimes.length>60) this.frameTimes.shift();
    const avg = this.frameTimes.reduce((a,b)=>a+b,0)/this.frameTimes.length;
    const fps = 1000 / Math.max(1, avg);
    this.diagnostics?.renderMetrics({ fps, frameTimeMs: avg, systems: this.systems.map(s=>({ name:s.name, ms:s.lastMs, health: s.enabled? (s.lastMs>8?'warn':'ok') : 'err' })) });
  }
}