// Vector helpers
function dot(ax, ay, bx, by) { return ax*bx + ay*by; }
function len(x, y) { return Math.hypot(x, y); }
function norm(x, y) { const l = len(x, y); return l === 0 ? [0,0] : [x/l, y/l]; }

// Digital Differential Analyzer (grid-based raycast)
export function raycast(grid, x0, y0, x1, y1) {
  // x/y are in tile coordinates (float). We step through grid cells.
  let dx = x1 - x0, dy = y1 - y0;
  const stepX = dx > 0 ? 1 : -1;
  const stepY = dy > 0 ? 1 : -1;
  dx = Math.abs(dx); dy = Math.abs(dy);

  let tMaxX, tMaxY;
  let tDeltaX = dx === 0 ? Infinity : 1 / dx;
  let tDeltaY = dy === 0 ? Infinity : 1 / dy;

  let x = Math.floor(x0);
  let y = Math.floor(y0);

  const endX = Math.floor(x1);
  const endY = Math.floor(y1);

  // distance to first grid boundary
  const fracX = x0 - x;
  const fracY = y0 - y;
  tMaxX = dx === 0 ? Infinity : (stepX > 0 ? (1 - fracX) : fracX) / dx;
  tMaxY = dy === 0 ? Infinity : (stepY > 0 ? (1 - fracY) : fracY) / dy;

  // check starting cell (skip if starting inside wall is allowed? here we treat as non-blocking)
  if (grid.isVisBlocked(x, y)) {
    return { hit: true, x, y };
  }

  while (x !== endX || y !== endY) {
    if (tMaxX < tMaxY) {
      x += stepX;
      tMaxX += tDeltaX;
    } else {
      y += stepY;
      tMaxY += tDeltaY;
    }
    if (grid.isVisBlocked(x, y)) {
      return { hit: true, x, y };
    }
  }
  return { hit: false, x: endX, y: endY };
}

/**
 * canSee — Guard's vision cone + LoS via DDA raycast.
 * @param {Object} guard {x,y,dir:[dx,dy], fovDeg, viewRadius}
 * @param {Object} player {x,y}
 * @param {Object} grid   with isVisBlocked(x,y)
 * @returns {boolean}
 */
export function canSee(guard, player, grid) {
  const vx = player.x - guard.x;
  const vy = player.y - guard.y;
  const dist = Math.hypot(vx, vy);
  if (dist > guard.viewRadius) return false;

  const [fdx, fdy] = norm(guard.dir[0], guard.dir[1]);
  const [pvx, pvy] = norm(vx, vy);
  const cos = dot(fdx, fdy, pvx, pvy);
  const cosHalf = Math.cos((guard.fovDeg * Math.PI/180) / 2);
  if (cos < cosHalf) return false;

  const rc = raycast(grid, guard.x, guard.y, player.x, player.y);
  return !rc.hit;
}

/**
 * hearNoise — radial hearing with optional falloff.
 * @param {Object} guard {x,y, hearingRadius}
 * @param {Object} noise {x,y, volume:1.0}
 * @returns {boolean}
 */
export function hearNoise(guard, noise) {
  const d = Math.hypot(noise.x - guard.x, noise.y - guard.y);
  const effective = guard.hearingRadius * (noise.volume ?? 1.0);
  return d <= effective;
}
