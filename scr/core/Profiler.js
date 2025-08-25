export class Profiler {
  constructor(){ this.spans = new Map(); }
  time(label){ this.spans.set(label, performance.now()); }
  timeEnd(label){ const t0 = this.spans.get(label); return t0 ? (performance.now() - t0) : 0; }
}