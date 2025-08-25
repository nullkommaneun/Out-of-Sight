import { runPreflight } from './preflight.js';

const fallbackOverlay = {
  ensure() {
    let el = document.getElementById('diag-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'diag-overlay';
      document.body.appendChild(el);
    }
    el.hidden = false;
    return el;
  },
  show(result) {
    const el = this.ensure();
    el.innerHTML = `<div style="padding:12px;font-family:ui-monospace;white-space:pre-wrap">${result}</div>`;
  }
};

(async function start() {
  try {
    const pf = await runPreflight();
    if (!pf.ok) {
      const text = [
        'Preflight fehlgeschlagen:',
        ...pf.checks.map(c => `• ${c.name}: ${c.ok ? 'OK' : 'FAIL'}${c.details ? ' – ' + c.details : ''}`)
      ].join('\n');
      fallbackOverlay.show(text);
      console.warn(text);
      // Weiterladen trotzdem erlauben – Overlay informiert.
    }
    const { main } = await import('./src/main.js');
    await main();
  } catch (e) {
    const msg = `Boot‑Fehler: ${e?.message || e}`;
    console.error(e);
    fallbackOverlay.show(msg + "\n" + (e?.stack || ''));
  }
})();