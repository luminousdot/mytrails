# Race calendar prototype

**Goal:** a clean, working prototype of a trail race calendar for SE Europe, built only with Once UI and fed by real ITRA data. It replaces the trailos approach: no database, no auth and no extra scrapers yet.

## Data

- `crawler/itra_crawl.py` (Crawl4AI) is a port of `trail-os/scripts/scraper/itra.py`. It keeps one browser session, reads the race map's `[lat, lng, id]` list, filters it to the SE Europe bounding box, then fetches each race's popup JSON and the longest distance's detail page from inside that session.
- Output is `data/races.json`: one record per event with every distance (km, D+, ITRA points, cut-off), dates, place, coordinates and links. It keeps upcoming races only, drops organisers' test events and pins that land outside the region's countries, and dedupes on name and date.
- The app reads it through `src/lib/races.ts` (`getRaces()`), so a database can replace the file later without touching the screens.

## Screens (one page)

- **Header:** race count, countries, days to the next start, data date.
- **Season strip:** twelve months with a bar for each month's race count; picking a month moves the calendar.
- **Filters:** search, country, ITRA points only, distance bucket (Short < 21 km, Marathon 21–44, Long 45–79, Ultra 80+). They apply to every view.
- **Views:** month calendar (Once UI `Calendar`, coloured by longest distance), sortable paginated list (`Table`), clustered map (`Map`).
- **Race details:** a `Dialog` with days to the start, the longest distance and climb, every distance with its bucket and ITRA points, and links to ITRA and registration.
- Loading (`loading.tsx`), error with Retry (`error.tsx`) and an empty state when the filters match nothing.

## Not yet

Race detail pages with their own URL, more sources (trka.rs, myrace.rs, mountain-race.rs), saved races, GPX and elevation profiles, and a scheduled crawl.
