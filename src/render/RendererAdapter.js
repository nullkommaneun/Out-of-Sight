import * as PIXI from 'pixi.js';

export class Renderer {
  constructor({ backend = 'pixi', width, height, container }) {
    this.backend = backend;
    if (backend === 'canvas') {
      this.impl = new CanvasRenderer({ width, height, container });
    } else {
      this.impl = new PixiRenderer({ width, height, container });
    }
  }
  get view() { return this.impl.view; }
  beginFrame() { this.impl.beginFrame(); }
  drawSprite(sprite, x, y, rot = 0) { this.impl.drawSprite(sprite, x, y, rot); }
  drawPoly(points, opts) { this.impl.drawPoly(points, opts); }
  endFrame() { this.impl.endFrame(); }
  clear() { this.impl.clear(); }
}

class PixiRenderer {
  constructor({ width, height, container }) {
    this.app = new PIXI.Application();
    this.ready = this.app.init({ width, height, background: '#0b0e12' });
    this.stage = this.app.stage;
    this.graphics = new PIXI.Graphics();
    this.stage.addChild(this.graphics);
    this._container = container || document.body;
    this._container.appendChild(this.app.canvas);
  }
  get view() { return this.app.canvas; }
  async beginFrame() {
    await this.ready; // ensure init
    this.graphics.clear();
  }
  drawSprite(sprite, x, y, rot = 0) {
    // Minimal placeholder: colored rectangle as sprite
    const g = new PIXI.Graphics();
    g.rect(x - 12, y - 12, 24, 24).fill(sprite?.color || 0x44ccff);
    g.rotation = rot;
    this.stage.addChild(g);
  }
  drawPoly(points, opts = {}) {
    const stroke = { color: opts.stroke ?? 0xffffff, width: opts.width ?? 1, alpha: opts.strokeAlpha ?? 0.6 };
    const fillCol = opts.fill ?? 0x000000;
    const fillAlpha = opts.alpha ?? 0.2;
    if (points.length === 4) { // line [x1,y1,x2,y2]
      this.graphics.moveTo(points[0], points[1]).lineTo(points[2], points[3]).stroke(stroke);
      return;
    }
    this.graphics.poly(points).fill(fillCol, fillAlpha).stroke(stroke);
  }
  endFrame() {
    // Pixi handles present in ticker
  }
  clear() {
    this.stage.removeChildren();
    this.stage.addChild(this.graphics);
  }
}

class CanvasRenderer {
  constructor({ width, height, container }) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    (container || document.body).appendChild(this.canvas);
  }
  get view() { return this.canvas; }
  beginFrame() {
    const ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#0b0e12';
    ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
  }
  drawSprite(sprite, x, y, rot=0) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = sprite?.color || '#44ccff';
    ctx.fillRect(-12, -12, 24, 24);
    ctx.restore();
  }
  drawPoly(points, opts={}) {
    const ctx = this.ctx;
    ctx.save();
    if (points.length === 4) {
      ctx.globalAlpha = opts.strokeAlpha ?? 0.6;
      ctx.strokeStyle = opts.stroke || '#fff';
      ctx.lineWidth = opts.width || 1;
      ctx.beginPath();
      ctx.moveTo(points[0], points[1]);
      ctx.lineTo(points[2], points[3]);
      ctx.stroke();
      ctx.restore();
      return;
    }
    ctx.globalAlpha = opts.alpha ?? 0.2;
    ctx.fillStyle = opts.fill || '#000';
    ctx.beginPath();
    for (let i=0;i<points.length;i+=2){
      const x=points[i],y=points[i+1];
      if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = opts.strokeAlpha ?? 0.6;
    ctx.strokeStyle = opts.stroke || '#fff';
    ctx.lineWidth = opts.width || 1;
    ctx.stroke();
    ctx.restore();
  }
  endFrame(){ this.ctx.restore(); }
  clear(){
    this.beginFrame();
  }
}
