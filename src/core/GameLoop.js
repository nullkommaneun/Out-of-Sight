export class GameLoop {
  constructor({ update, render, targetFPS = 60 }) {
    this.update = update;
    this.render = render;
    this._running = false;
    this._last = 0;
    this._acc = 0;
    this._step = 1000 / targetFPS;
    this._frameHandle = 0;
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._last = performance.now();
    const tick = (now) => {
      if (!this._running) return;
      const dt = now - this._last;
      this._last = now;
      // Clamp to avoid spiral of death
      const clamped = Math.min(dt, 250);
      this._acc += clamped;
      while (this._acc >= this._step) {
        this.update(this._step / 1000);
        this._acc -= this._step;
      }
      this.render();
      this._frameHandle = requestAnimationFrame(tick);
    };
    this._frameHandle = requestAnimationFrame(tick);
  }

  stop() {
    if (!this._running) return;
    this._running = false;
    cancelAnimationFrame(this._frameHandle);
  }
}
