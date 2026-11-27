# My Trails

Trail race calendar for SE Europe. Next.js (App Router) + Once UI (`@once-ui-system/core`), race data crawled from ITRA with Crawl4AI.

## Layout

- `src/` — Next.js app (Once UI). Data layer in `src/lib/`, the UI never reads JSON directly.
- `crawler/` — Python (uv) Crawl4AI crawler; writes `data/races.json`.
- `data/races.json` — the race dataset the app reads.
- `docs/superpowers/specs/`, `docs/superpowers/plans/` — specs and plans.

## Commands

- `npm run dev` — app on http://localhost:3000
- `npm run build` — production build
- `cd crawler && uv sync && uv run crawl4ai-setup` — first-time crawler setup
- `cd crawler && uv run itra_crawl.py` — refresh `data/races.json` (`--limit 30` for a quick run)
- `npm run lint` / `npx once-ui-validate-ai-code src/**/*.tsx` — checks

## Rules

- Once UI components only; no Tailwind, no other UI kit. Read `node_modules/@once-ui-system/core/AGENTS.md` before writing UI.
- Never use JetBrains Mono. Check every screen in light and dark.
- `trail-os` is a reference for ideas only; don't copy its code.
