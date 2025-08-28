function heuristic(ax, ay, bx, by) {
  // Manhattan (grid, no diagonals). Use octile if diagonals allowed.
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

export function findPath(grid, start, goal, opts = {}) {
  const width = grid.width, height = grid.height;
  const sx = start.x|0, sy = start.y|0, gx = goal.x|0, gy = goal.y|0;
  if (sx === gx && sy === gy) return [{x:sx,y:sy}];

  const open = new MinHeap((a,b)=> a.f - b.f);
  const cameFrom = new Map();
  const gScore = new Map();

  const key = (x,y)=> (y*width + x);
  const setG = (x,y,v)=> gScore.set(key(x,y), v);
  const getG = (x,y)=> gScore.get(key(x,y)) ?? Infinity;

  if (grid.isBlocked(sx, sy)) return null;
  if (grid.isBlocked(gx, gy)) return null;

  const startNode = { x:sx, y:sy, g:0, f:heuristic(sx,sy,gx,gy) };
  open.push(startNode);
  setG(sx, sy, 0);

  const neighbors = [[1,0],[-1,0],[0,1],[0,-1]];

  while (!open.isEmpty()) {
    const current = open.pop();
    if (current.x === gx && current.y === gy) {
      // reconstruct
      const path = [{x:gx,y:gy}];
      let k = key(gx, gy);
      while (cameFrom.has(k)) {
        const c = cameFrom.get(k);
        path.push({x:c.x, y:c.y});
        k = key(c.x, c.y);
      }
      return path.reverse();
    }

    for (const [dx,dy] of neighbors) {
      const nx = current.x + dx, ny = current.y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      if (grid.isBlocked(nx, ny)) continue;
      const tentative = current.g + grid.cost(nx, ny);
      if (tentative < getG(nx, ny)) {
        cameFrom.set(key(nx, ny), {x: current.x, y: current.y});
        setG(nx, ny, tentative);
        const f = tentative + heuristic(nx, ny, gx, gy);
        open.push({ x:nx, y:ny, g:tentative, f });
      }
    }
  }
  return null; // no path
}

// Minimal binary heap
class MinHeap {
  constructor(compare) { this._a=[]; this._cmp=compare; }
  isEmpty() { return this._a.length===0; }
  push(v) { this._a.push(v); this._siftUp(this._a.length-1); }
  pop() {
    const a = this._a;
    if (a.length === 0) return undefined;
    const top = a[0], last = a.pop();
    if (a.length) { a[0] = last; this._siftDown(0); }
    return top;
  }
  _siftUp(i) {
    const a=this._a, cmp=this._cmp;
    while (i>0) {
      const p=(i-1)>>1;
      if (cmp(a[i],a[p])<0){ [a[i],a[p]]=[a[p],a[i]]; i=p; } else break;
    }
  }
  _siftDown(i) {
    const a=this._a, cmp=this._cmp;
    while (true) {
      let l=i*2+1, r=l+1, s=i;
      if (l<a.length && cmp(a[l],a[s])<0) s=l;
      if (r<a.length && cmp(a[r],a[s])<0) s=r;
      if (s!==i){ [a[i],a[s]]=[a[s],a[i]]; i=s; } else break;
    }
  }
}
