export class GuardAI {
  constructor(guard, player, map){
    this.g = guard; this.p = player; this.map = map; this.t=0;
    this.route = [ {x:220,y:120}, {x:220,y:420}, {x:740,y:420}, {x:740,y:120} ];
    this.idx = 0;
  }
  update(dt){
    this.t += dt;
    // 1) Sichtprüfung
    const dx = this.p.x - this.g.x; const dy = this.p.y - this.g.y;
    const dist = Math.hypot(dx,dy);
    const angleToPlayer = Math.atan2(dy,dx);
    const delta = normalizeAngle(angleToPlayer - this.g.dir);
    const inCone = dist <= this.g.fovRange && Math.abs(delta) <= this.g.fovAngle/2;
    this.g.alert = inCone; // (Occlusion kann später via Raycast kommen)

    // 2) Patrouille oder Verfolgung
    if (this.g.alert) {
      // einfache Verfolgung: Richtung Spieler
      const dir = Math.atan2(dy,dx); this.g.dir = dir;
      const step = this.g.speed * (dt/1000);
      this.g.x += Math.cos(dir)*step; this.g.y += Math.sin(dir)*step;
    } else {
      const target = this.route[this.idx];
      const vx = target.x - this.g.x; const vy = target.y - this.g.y; const d = Math.hypot(vx,vy);
      if (d < 8) { this.idx = (this.idx+1)%this.route.length; }
      else { const dir = Math.atan2(vy,vx); this.g.dir = dir; const step = this.g.speed*(dt/1000); this.g.x += Math.cos(dir)*step; this.g.y += Math.sin(dir)*step; }
    }
  }
}

function normalizeAngle(a){ while (a>Math.PI) a-=2*Math.PI; while(a<-Math.PI) a+=2*Math.PI; return a; }
