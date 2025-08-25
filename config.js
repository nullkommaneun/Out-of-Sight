export const CONFIG = {
  DEBUG: true,
  SHOW_DIAG_OVERLAY: true,    // F1 toggelt
  LOG_TO_CONSOLE: true,
  LOG_RING_SIZE: 200,
  CIRCUIT_BREAKER_THRESHOLD: 3,   // System wird temporär deaktiviert nach n Fehlern/60s
  CIRCUIT_BREAKER_COOLDOWN_MS: 5000,
  FIXED_DT: 1000 / 60,            // 60 Hz
  MAX_FRAME_SKIP: 5,
  PANIC_RESET_MS: 1500,           // nach massiven Lags dt zurücksetzen
  TEST_INJECT_ERROR: false,       // nur für manuelle Tests
};