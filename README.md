# My Trails

Trail and mountain races across Southeast Europe in one calendar. The UI is built entirely with [Once UI](https://docs.once-ui.com), and the race data is crawled from [ITRA](https://itra.run) with [Crawl4AI](https://github.com/unclecode/crawl4ai).

## Run it

```bash
npm install
npm run dev
```

## Refresh the race data

Needs [uv](https://docs.astral.sh/uv/).

```bash
cd crawler
uv sync && uv run crawl4ai-setup   # first time only
uv run itra_crawl.py               # writes ../data/races.json
```

See `docs/superpowers/specs/` for what the prototype covers.
