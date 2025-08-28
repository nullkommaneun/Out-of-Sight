export class Input {
  constructor() {
    this.keys = new Set();
    this.handlers = new Map();
    this._onKeyDown = (e) => {
      this.keys.add(e.code);
      const h = this.handlers.get(e.code);
      if (h) h.forEach(fn => fn(e));
    };
    this._onKeyUp = (e) => {
      this.keys.delete(e.code);
    };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }
  on(code, fn) {
    if (!this.handlers.has(code)) this.handlers.set(code, new Set());
    this.handlers.get(code).add(fn);
  }
  isDown(code) { return this.keys.has(code); }
  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }
}
