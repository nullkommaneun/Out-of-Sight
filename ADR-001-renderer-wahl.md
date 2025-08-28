# ADR‑001: Renderer‑Wahl (Canvas vs. PixiJS vs. Phaser 3)

**Datum:** 2025‑08‑28  
**Status:** Akzeptiert  
**Entscheidung:** **PixiJS v8.12.0** als Standard‑Renderer über `RendererAdapter`, mit **Canvas‑Fallback**. Phaser 3 wird nicht eingesetzt (Overhead für unseren Scope).

## Kontext
Top‑Down‑Stealth 2D, Sprites, Batching, Primitive für Debug (Polygone), einfache Kamera. Harte Anforderungen: 60 FPS, deterministische Replays, saubere Debug‑Overlays, geringe Komplexität.

## Optionen (Kurzmatrix)
| Kriterium | Canvas (Vanilla) | PixiJS (v8) | Phaser 3 (v3.90) |
|---|---|---|---|
| Einbindung ESM | sehr leicht | leicht | leicht |
| Leistung | ok | **sehr gut (WebGL/WebGPU Fallback)** | gut |
| API‑Umfang | minimal | **moderat (Renderer, Assets, Graphics)** | groß (Scene, Physics, Input, etc.) |
| Lernkurve | niedrig | niedrig‑moderat | moderat |
| Zuverlässigkeit | hoch | **hoch** (aktives Release v8.12.0, 2025‑08‑06) | hoch (v3.90.0, 2025‑05‑23) |
| Kontrolle | **maximal** | hoch | mittel |
| Abhängigkeit/Lock‑in | none | **gering** dank Adapter | höher |
| Aufwand FOV/Shadow | manuell | moderat | moderat |

**Belege:** PixiJS v8.12.0 stable und aktiv gepflegt【Pixi docs】; Release‑Historie bestätigt jüngste Wartung【Pixi blog】. Phaser 3 aktuell v3.90.0 (Mai 2025)【Phaser】.

## Quantitative Schätzung
- **LOC‑Ersparnis (Renderer‑Spezifik):** PixiJS spart ca. **250–400 LOC** ggü. reinem Canvas (Sprite‑Batching, Texturen, Primitive, Ticker/Resize).
- **Bundle‑Impact initial:** PixiJS ~**120–200 kB gzip** (tree‑shaken Minimalpfad). Canvas‑Fallback ~0 kB.
- **Komplexitätsreduktion:** >30 % beim Rendering/Pipelines durch fertige `Graphics`, Texture‑Management und Ticker.

## Entscheidung
Wir **wählen PixiJS** als Primärpfad und kapseln ihn hinter `RendererAdapter`. Der **Canvas‑Fallback** bleibt funktionsfähig und build‑bar. Ein späterer Wechsel (z. B. zu Phaser) bleibt durch die Adapter‑Schnittstelle realistisch.

## Risiken & Gegemaßnahmen
- **Framework‑Lock‑in:** Minimiert durch `RendererAdapter` mit identischer API (`beginFrame`, `drawSprite`, `drawPoly`, `endFrame`).  
- **Bundlegröße:** Size‑Gate im CI, Lazy‑Load von Assets.  
- **API‑Änderungen:** Version **fest gepinnt**; Updates nur via ADR‑Change.

## Rollback‑Plan
Bei Rendering‑Problemen: **Switch auf Canvas** via `?backend=canvas` oder Build‑Flag, ohne Code außerhalb des Adapters anzupassen.

## Referenzen
- PixiJS v8.12.0: https://pixijs.com/versions (stable)  
- Blog/Release v8.x: https://pixijs.com/blog/8.12.0  
- Phaser 3 v3.90.0: https://phaser.io/download/phaser3
