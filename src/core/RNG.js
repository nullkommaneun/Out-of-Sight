// Deterministic LCG RNG (Numerical Recipes constants)
export class LCG {
  constructor(seed = 123456789) {
    this._state = seed >>> 0;
  }
  setSeed(seed) { this._state = seed >>> 0; }
  get state() { return this._state >>> 0; }
  next() {
    // 32-bit LCG
    this._state = (1664525 * this._state + 1013904223) >>> 0;
    return this._state;
  }
  // [0,1)
  float() {
    return (this.next() >>> 0) / 4294967296;
  }
  // integer in [min, max]
  int(min, max) {
    if (max < min) [min, max] = [max, min];
    const r = this.next() >>> 0;
    const span = (max - min + 1) >>> 0;
    return min + (r % span);
  }
  pick(arr) { return arr[Math.floor(this.float() * arr.length)]; }
}
