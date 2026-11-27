# Race calendar prototype

**Goal:** a clean, working prototype of a trail race calendar for SE Europe, built only with Once UI and fed by real ITRA data. It replaces the trailos approach: no database, no auth and no extra scrapers yet.

## Data

- `crawler/itra_crawl.py` (Crawl4AI) is a port of `trail-os/scripts/scraper/itra.py`. It keeps one browser session, reads the race map's `[lat, lng, id]` list, filters it to the SE Europe bounding box, then fetches each race's popup JSON and the longest distance's detail page from inside that session.
- Output is `data/races.json`: one record per event with every distance (km, D+, ITRA points, cut-off), dates, place, coordinates and links. It keeps upcoming races only, drops organisers' test events and pins that land outside the region's countries, and dedupes on name and date.
- `crawler/mountain_race.py` reads race series from mountain-race.rs's public JSON (`/api/get-series?slug=wst`). It has the organisers' own names, distances, cover photos and registration links, but no coordinates.
- `crawler/merge.py` combines both into `data/races.json`: ITRA is the base; a mountain-race.rs edition matching an ITRA race (date within 3 days, a shared distinctive word in the name) overrides name, distances, cover and links; one only on mountain-race.rs is placed by geocoding its town (Nominatim, cached in `data/sources/geocode.json`). Only upcoming, not cancelled editions are kept.
- Races carry their `series` (e.g. WST): a tag on cards and rows, a Series filter (also `/?series=wst`), and a series panel on the race page.
- The app reads it through `src/lib/races.ts` (`getRaces()`), so a database can replace the file later without touching the screens.

## Elevation profiles

- `crawler/gpx.py` turns GPX tracks into ~300 evenly spaced [km, m] points (`data/profiles/<race id>.json`) plus stats (track length, smoothed climb and descent, high and low point) in `data/sources/gpx.json`, which `merge.py` attaches to the race as `profile`.
- Tracks come from `public/gpx/<race slug>.gpx` (added by hand, also the race page's download link) first, then `.gpx` links on the race's own website and up to six course pages linked from it.
- The race page draws it with Once UI's `LineChart` (gradient area, y axis from the course's low point, Start, High point and Finish marks) above five stat tiles. Races without a track say the profile is coming.

## Covers

Each race gets a cover, tried in this order:
1. The first race photo on its ITRA page (`/Files/Photos/…`), 13 of 103 races today.
2. The `og:image` of the race's own website (or its registration page), 26 races. Logos, icons and images shared by several races (platform defaults such as raceresult's share card) are skipped.
3. A map of the start area (`MapCover`): Esri's light or dark grey canvas tiles at zoom 10, centred on the race with a pin in its distance colour. It is a static tile mosaic, not a live map, because dozens of cards would each need a WebGL context. No API key needed.

Photos are hotlinked, so the map shows until a photo has actually loaded.

## Screens

- **Header:** full-width hero, the Divča Winter Trail photo fading in from the right (`SectionBackdrop`, Once UI `Mask` + `Media`).
- **Phones:** search and the view switch stay on the page; country, series, distance and ITRA open in a bottom `Drawer` with a live "Show N races" button.

- **Header:** race count, countries, days to the next start, data date.
- **Season strip:** twelve months with a bar for each month's race count. Picking a month narrows the list, cards and map to it and moves the calendar there; picking it again clears it.
- **Filters:** search, country, ITRA points only, distance bucket (Short < 21 km, Marathon 21–44, Long 45–79, Ultra 80+). They apply to every view.
- **Views**, in toggle order: sortable paginated list (`Table`, the default), cards (one `Card` per race), clustered map (`Map`) and month agenda (`RaceAgenda`: each race day with its races, previous/next month, a jump to the next month with races). The chosen view is remembered for the tab, so coming back from a race page lands on it.
- **Race page** (`/races/[slug]`, prerendered for every race): breadcrumb back, date and place, links to ITRA and registration, days to the start, longest distance, climb, ITRA points, every distance with its bucket and points, a map of the start area, and other races that month.
- Loading (`loading.tsx`), error with Retry (`error.tsx`) and an empty state when the filters match nothing.

## Not yet

More sources (trka.rs, myrace.rs, mountain-race.rs), saved races, GPX and elevation profiles, and a scheduled crawl.
