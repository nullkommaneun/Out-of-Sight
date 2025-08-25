export async function runPreflight() {
  const results = { ok: true, checks: [] };
  const pass = (name, ok, details="") => results.checks.push({ name, ok, details });

  // 1) ES‑Module support
  try {
    pass("ESModules", true);
  } catch (e) {
    results.ok = false; pass("ESModules", false, e.message);
  }

  // 2) Canvas vorhanden
  try {
    const c = document.createElement('canvas');
    const ok = !!c.getContext && !!c.getContext('2d');
    if (!ok) throw new Error('2D‑Canvas nicht verfügbar');
    pass("Canvas2D", ok);
  } catch (e) { results.ok = false; pass("Canvas2D", false, e.message); }

  // 3) Test‑Importe zentraler Module (nur Existenz & Named Exports)
  try {
    const m = await import('./src/core/Logger.js');
    if (!m.Logger) throw new Error('Logger export fehlt');
    pass("Import Logger", true);
  } catch (e) { results.ok = false; pass("Import Logger", false, e.message); }

  try {
    const m = await import('./src/core/GameLoop.js');
    if (!m.GameLoop) throw new Error('GameLoop export fehlt');
    pass("Import GameLoop", true);
  } catch (e) { results.ok = false; pass("Import GameLoop", false, e.message); }

  return results;
}