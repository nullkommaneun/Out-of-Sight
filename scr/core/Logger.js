import { CONFIG } from '../../config.js';

export class Logger {
  constructor(max=CONFIG.LOG_RING_SIZE) {
    this.max = max; this.buffer = []; this.enabled = true;
  }
  _push(level, msg, ctx) {
    const entry = { ts: Date.now(), level, msg: ''+msg, ctx: ctx || null };
    this.buffer.push(entry); if (this.buffer.length > this.max) this.buffer.shift();
    if (CONFIG.LOG_TO_CONSOLE) console[level === 'error' ? 'error' : level || 'log'](msg, ctx||'');
    return entry;
  }
  log(m, c){ return this._push('log', m, c);} 
  info(m,c){ return this._push('info', m, c);} 
  warn(m,c){ return this._push('warn', m, c);} 
  error(m,c){ return this._push('error', m, c);} 
  clear(){ this.buffer.length = 0; }
}