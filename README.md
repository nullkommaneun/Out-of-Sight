# Gefängnisausbruch — Top‑Down‑Stealth (MVP)

**Stack:** ES‑Module, Vite, PixiJS v8 (RendererAdapter mit Canvas‑Fallback), Vitest.  
**Ziele:** 60 FPS, deterministische Seeds (LCG), Debug‑Overlays (F1).

## Setup
```bash
npm install  # erzeugt beim ersten Mal die package-lock.json
npm ci       # ab dem 2. Lauf, nutzt Lockfile und prüft Integrität
npm run dev  # Dev‑Server
npm run test # Unit‑Tests (A*, Perception)
npm run build
```

## Controls
- **WASD / Pfeile**: Bewegung (Stub)
- **F1**: Debug Overlay (Grid + Sichtkegel)
- **R**: Neustart mit gleichem Seed
- **N**: Neustart mit neuem Seed

## Dev‑Flags (URL‑Params)
- `?seed=1234` — setzt Startseed (deterministisch)
- `?backend=canvas` — erzwingt Canvas‑Fallback statt Pixi

## Struktur
Siehe `/src` sowie ADR‑001 im Projekt‑Root.
