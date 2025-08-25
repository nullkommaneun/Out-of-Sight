export class Player {
  constructor(map){ this.map = map; this.x = 80; this.y = 80; this.speed = 100; }
  tryMove(dx, dy, dt){
    const step = this.speed * (dt/1000);
    let nx = this.x + dx * step, ny = this.y + dy * step;
    // Achsenweise Kollision
    if (!this.map.isBlocked(nx, this.y)) this.x = nx;
    if (!this.map.isBlocked(this.x, ny)) this.y = ny;
  }
}
