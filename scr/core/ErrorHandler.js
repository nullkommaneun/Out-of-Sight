import { CONFIG } from '../../config.js';

export class ErrorHandler {
  constructor(bus, logger, diagnostics){
    this.bus = bus; this.logger = logger; this.diagnostics = diagnostics;
    this.systemErrors = new Map();
  }
  attachGlobal(){
    window.addEventListener('error', (e)=>{
      this.report(e.error || new Error(e.message), { source:'window.onerror' });
    });
    window.addEventListener('unhandledrejection', (e)=>{
      this.report(e.reason instanceof Error ? e.reason : new Error(String(e.reason)), { source:'unhandledrejection' });
    });
  }
  report(error, context={}){
    const entry = { ts: Date.now(), error, context };
    this.logger.error(error.message, context);
    this.diagnostics?.push('error', error.message, { ...context, stack: error.stack });
    this.bus.emit('error', entry);
    // Circuit Breaker pro System
    const sys = context.system;
    if (sys && CONFIG.CIRCUIT_BREAKER_THRESHOLD > 0) {
      const arr = this.systemErrors.get(sys) || []; arr.push(entry);
      const cutoff = Date.now() - 60000; // 60s Fenster
      while (arr.length && arr[0].ts < cutoff) arr.shift();
      this.systemErrors.set(sys, arr);
      if (arr.length >= CONFIG.CIRCUIT_BREAKER_THRESHOLD) {
        this.bus.emit('system:disable', { system: sys, reason: 'circuit-breaker' });
        this.diagnostics?.push('warn', `System deaktiviert: ${sys}`, { reason:'circuit-breaker' });
        setTimeout(()=> this.bus.emit('system:enable', { system: sys }), CONFIG.CIRCUIT_BREAKER_COOLDOWN_MS);
      }
    }
  }
}