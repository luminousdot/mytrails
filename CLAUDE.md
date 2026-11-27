# My Trails

Trail race calendar for SE Europe. Next.js (App Router) + Once UI (`@once-ui-system/core`), race data crawled from ITRA with Crawl4AI.

## Layout

- `src/` — Next.js app (Once UI). Data layer in `src/lib/`, the UI never reads JSON directly.
- `crawler/` — Python (uv). `itra_crawl.py` (Crawl4AI) → `data/sources/itra.json`; `mountain_race.py` (mountain-race.rs series JSON, default WST) → `data/sources/mountain-race.json`; `merge.py` combines them into `data/races.json`.
- `data/races.json` — the race dataset the app reads. Never edit by hand; rerun `merge.py`.
- `docs/superpowers/specs/`, `docs/superpowers/plans/` — specs and plans.

## Commands

- `npm run dev` — app on http://localhost:3000
- `npm run build` — production build
- `cd crawler && uv sync && uv run crawl4ai-setup` — first-time crawler setup
- `cd crawler && uv run itra_crawl.py && uv run mountain_race.py && uv run merge.py && uv run gpx.py && uv run merge.py` — refresh all race data
- Elevation profiles: drop a track at `public/gpx/<race slug>.gpx`, then `uv run gpx.py --local-only && uv run merge.py`
- `npm run lint` / `npx once-ui-validate-ai-code src/**/*.tsx` — checks

## Rules

- **The current race data is the demo dataset** (crawled 27 Nov 2026: `data/races.json`, `data/sources/`, `data/profiles/`, `public/gpx/`). Keep it as is: don't re-run the crawlers or `merge.py` unless Vlada asks.
- Once UI components only; no Tailwind, no other UI kit. Read `node_modules/@once-ui-system/core/AGENTS.md` before writing UI.
- Never use JetBrains Mono. Check every screen in light and dark.
- `trail-os` is a reference for ideas only; don't copy its code.
