export class Input {
  constructor(){ this.keys = new Set(); this.enabled = true; this._bind(); }
  _bind(){
    window.addEventListener('keydown',(e)=>{ if(!this.enabled) return; this.keys.add(e.key); });
    window.addEventListener('keyup',(e)=>{ this.keys.delete(e.key); });
  }
  isDown(k){ return this.keys.has(k); }
}
