export class Renderer {
  constructor(canvas, map){
    this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.map = map;
  }
  clear(){ this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height); }
  drawGrid(){
    const { ctx } = this; const t = this.map.tile;
    ctx.strokeStyle = '#12202b'; ctx.lineWidth = 1;
    for (let x=0;x<=this.canvas.width;x+=t){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,this.canvas.height); ctx.stroke(); }
    for (let y=0;y<=this.canvas.height;y+=t){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(this.canvas.width,y); ctx.stroke(); }
  }
  drawMap(){
    const { ctx } = this; const t = this.map.tile;
    for (let y=0;y<this.map.rows;y++){
      for (let x=0;x<this.map.cols;x++){
        if (this.map.grid[y][x]===1){ ctx.fillStyle = '#0f1a24'; ctx.fillRect(x*t, y*t, t, t); }
      }
    }
  }
  drawPlayer(p){
    const { ctx } = this; ctx.fillStyle = '#62e0a6'; ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI*2); ctx.fill();
  }
  drawGuard(g){
    const { ctx } = this; ctx.fillStyle = '#e0a662'; ctx.beginPath(); ctx.arc(g.x, g.y, 8, 0, Math.PI*2); ctx.fill();
  }
  drawFOV(guard){
    const { ctx } = this; const r = guard.fovRange; const ang = guard.fovAngle; const dir = guard.dir;
    ctx.save(); ctx.translate(guard.x, guard.y); ctx.rotate(dir);
    ctx.globalAlpha = 0.12; ctx.fillStyle = '#ff6470';
    ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0,r, -ang/2, ang/2); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}
