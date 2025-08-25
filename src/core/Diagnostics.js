import { CONFIG } from '../../config.js';

export class Diagnostics {
  constructor(logger){
    this.logger = logger; this.visible = !!CONFIG.SHOW_DIAG_OVERLAY; this.captureLogs = true;
    this.el = document.getElementById('diag-overlay');
    this.body = document.getElementById('diag-body');
    this.status = document.getElementById('diag-status');
    this.metrics = document.getElementById('diag-metrics');
    this.btnClear = document.getElementById('diag-clear');
    this.btnPause = document.getElementById('diag-pause');
    this.btnStep = document.getElementById('diag-step');
    if (!this.el) return; this.el.hidden = !this.visible;
    this.btnClear?.addEventListener('click', ()=>{ this.logger.clear(); this.renderLogs(); });
  }
  bindLoop(loop){
    this.loop = loop;
    this.btnPause?.addEventListener('click', ()=>{ loop.togglePause(); });
    this.btnStep?.addEventListener('click', ()=>{ loop.stepOnce(); });
    window.addEventListener('keydown', (e)=>{
      if (e.key === 'F1'){ this.toggle(); }
      if (e.key === 'F5'){ loop.togglePause(); }
      if (e.key === 'F6'){ loop.stepOnce(); }
      if (e.key.toLowerCase() === 'l'){ this.captureLogs = !this.captureLogs; this.push('info', `Logging ${this.captureLogs?'an':'aus'}`); }
    });
  }
  toggle(){ if (!this.el) return; this.visible = !this.visible; this.el.hidden = !this.visible; }
  push(level, msg, ctx){ if (!this.captureLogs) return; this.logger[level]?.(msg, ctx); this.renderLogs(); }
  renderLogs(){
    if (!this.body) return; const items = this.logger.buffer.slice(-60).map(e=>{
      const time = new Date(e.ts).toLocaleTimeString();
      const cls = e.level === 'error' ? 'entry error' : e.level === 'warn' ? 'entry warn' : 'entry';
      const meta = [e.level.toUpperCase(), time, e.ctx && e.ctx.system ? `sys:${e.ctx.system}`:'' ].filter(Boolean).join(' · ');
      const ctx = e.ctx ? `\nctx: ${JSON.stringify(e.ctx, null, 2)}` : '';
      return `<div class="${cls}"><div class="meta">${meta}</div><div>${e.msg}</div>${ctx?`<pre>${ctx}</pre>`:''}</div>`;
    }).join('');
    this.body.innerHTML = items || '<div class="entry">Keine Meldungen.</div>';
  }
  setStatus(text, level='ok'){ if (this.status){ this.status.textContent = text; this.status.className = 'badge '+level; } }
  renderMetrics(data){
    if (!this.metrics) return;
    const { fps, frameTimeMs, systems } = data;
    const sysHtml = systems.map(s=>`<div><span class="badge ${s.health}">${s.name}</span> ${s.ms.toFixed(2)} ms</div>`).join('');
    this.metrics.innerHTML = `<div><span class="badge ok">FPS</span> ${fps.toFixed(1)} (${frameTimeMs.toFixed(2)} ms)</div>${sysHtml}`;
  }
}