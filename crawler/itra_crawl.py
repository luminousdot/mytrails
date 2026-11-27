#!/usr/bin/env python3
"""
ITRA race crawler (Crawl4AI). Port of trail-os/scripts/scraper/itra.py.

itra.run only serves race data to a browser session with cookies, so the
crawler keeps one Crawl4AI session open: it warms the session on the home
page, reads the race map (raceSearchJsonSidePopupNew holds [lat, lng, id]
for every race), then calls the popup and detail endpoints with fetch()
from inside that same page, so the cookies come along.

Writes data/races.json (see src/lib/types.ts for the shape).

    uv run itra_crawl.py              # all SE Europe races
    uv run itra_crawl.py --limit 40   # quick run
"""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import sys
import unicodedata
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Optional

from crawl4ai import AsyncWebCrawler, BrowserConfig, CacheMode, CrawlerRunConfig

# SE Europe bounding box
LAT_MIN, LAT_MAX, LNG_MIN, LNG_MAX = 35, 48, 13, 30

COUNTRY_MAP = {
    'RS': 'Serbia', 'HR': 'Croatia', 'SI': 'Slovenia', 'BA': 'Bosnia and Herzegovina',
    'ME': 'Montenegro', 'MK': 'North Macedonia', 'GR': 'Greece', 'AL': 'Albania',
    'BG': 'Bulgaria', 'RO': 'Romania', 'HU': 'Hungary', 'XK': 'Kosovo',
    'TR': 'Turkey', 'IT': 'Italy', 'AT': 'Austria', 'SK': 'Slovakia',
    'UA': 'Ukraine', 'MD': 'Moldova', 'CY': 'Cyprus',
}

MONTH_MAP = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
    'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12,
}

ITRA_POINTS_MAP = {'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6}

UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')

SESSION = 'itra'
OUT = Path(__file__).resolve().parent.parent / 'data' / 'races.json'

# Runs inside the map page, so fetch() sends the session cookies.
FETCH_JS = """
const ids = %s;
const kind = %s;
const out = await Promise.all(ids.map(async (id) => {
  const url = kind === 'popup' ? '/Races/RaceMapPopup?id=' + id : id;
  try {
    const r = await fetch(url, { credentials: 'include' });
    if (!r.ok) return [id, null];
    return [id, kind === 'popup' ? await r.json() : await r.text()];
  } catch (e) { return [id, null]; }
}));
return out;
"""


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def extract_array_from_html(html: str) -> Optional[list]:
    """Find raceSearchJsonSidePopupNew = [...] and parse it."""
    idx = html.find('raceSearchJsonSidePopupNew')
    if idx == -1:
        return None
    start = html.find('[', idx)
    if start == -1:
        return None
    depth = 0
    for i in range(start, len(html)):
        if html[i] == '[':
            depth += 1
        elif html[i] == ']':
            depth -= 1
            if depth == 0:
                raw = re.sub(r',\s*\]$', ']', html[start:i + 1])
                try:
                    return json.loads(raw)
                except json.JSONDecodeError as e:
                    log(f'  JSON parse error: {e}')
                    return None
    return None


def parse_detail_html(html: str) -> dict:
    result: dict[str, Any] = {}
    m = re.search(r'Distance:.*?<span[^>]*>([\d.]+)', html, re.DOTALL)
    if m:
        try:
            result['distance_km'] = float(m.group(1))
        except ValueError:
            pass
    m = re.search(r'Elevation Gain:.*?<span[^>]*>\+?([\d\s,]+)', html, re.DOTALL)
    if m:
        val = re.sub(r'[^\d]', '', m.group(1))
        if val:
            result['elevation_gain_m'] = int(val)
    m = re.search(r'Time Limit:.*?<span[^>]*>(\d+):(\d+):(\d+)', html, re.DOTALL)
    if m:
        result['time_limit_hours'] = round(int(m.group(1)) + int(m.group(2)) / 60, 1)
    m = re.search(r'<meta name="description" content="([^"]{40,})"', html)
    if m:
        result['description'] = re.sub(r'\s+', ' ', m.group(1)).strip()
    m = re.search(r'/images/itra_numbers/icons/(\w+)\.svg', html)
    if m and m.group(1) in ITRA_POINTS_MAP:
        result['itra_points'] = ITRA_POINTS_MAP[m.group(1)]
    return result


def to_km(raw: str) -> Optional[float]:
    d = re.sub(r'[^\d.]', '', raw or '')
    if not d:
        return None
    try:
        v = float(d)
    except ValueError:
        return None
    # ITRA sometimes drops the decimal point ("425" for 42.5)
    return round(v / 10, 1) if v > 300 else v


def to_int(raw: str) -> Optional[int]:
    e = re.sub(r'[^\d]', '', raw or '')
    return int(e) if e else None


def distance_name(race_url: str) -> Optional[str]:
    # /Races/RaceDetails/<Event>.<Distance name>/<year>/<id>
    parts = race_url.split('/')
    if len(parts) < 4 or '.' not in parts[3]:
        return None
    return parts[3].rsplit('.', 1)[1].strip() or None


def slugify(s: str) -> str:
    s = s.lower().replace('đ', 'dj').replace('ı', 'i')
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def build_race(lat: float, lng: float, race_id: int, popup: dict) -> Optional[dict]:
    year = popup.get('minYear')
    month = MONTH_MAP.get(popup.get('minMonth', ''))
    if not year or not month:
        return None
    try:
        start = date(int(year), month, int(popup.get('minDate') or 1))
    except (TypeError, ValueError):
        return None

    code = popup.get('countrycode') or popup.get('code') or ''
    name = (popup.get('eventName') or '').strip()
    # The bbox catches a few far-away races with bad pins, and ITRA keeps organisers' test events.
    if code not in COUNTRY_MAP or re.match(r'test\b', name, re.I):
        return None
    end = None
    if popup.get('maxDate') and popup.get('maxDate') != popup.get('minDate'):
        try:
            end = date(int(popup.get('maxYear') or year), month, int(popup['maxDate']))
        except (TypeError, ValueError):
            end = None
    distances = []
    for i, r in enumerate(popup.get('races') or []):
        distances.append({
            'name': distance_name(r.get('raceUrl', '')),
            'distance_km': to_km(r.get('distance', '')),
            'elevation_gain_m': to_int(r.get('elevationGain', '')),
            'itra_points': ITRA_POINTS_MAP.get((r.get('itraPointsImg') or '').split('.')[0]),
            'url': f"https://itra.run{r['raceUrl']}" if r.get('raceUrl') else None,
        })
    distances = [{k: v for k, v in d.items() if v is not None} for d in distances]
    distances.sort(key=lambda d: d.get('distance_km') or 0, reverse=True)

    points = [d['itra_points'] for d in distances if d.get('itra_points') is not None]
    race = {
        'id': f'itra-{race_id}',
        'slug': slugify(name) or f'itra-{race_id}',
        'name': name,
        'country': COUNTRY_MAP.get(code) or popup.get('country') or code,
        'country_code': code or None,
        'city': popup.get('city') or None,
        'date_start': start.isoformat(),
        'date_end': end.isoformat() if end and end > start else None,
        'lat': lat,
        'lng': lng,
        'registration_url': popup.get('registrationurl') or None,
        'itra_url': distances[0].get('url') if distances else None,
        'itra_points': max(points) if points else None,
        'distances': distances,
        'source': 'itra.run',
    }
    return {k: v for k, v in race.items() if v is not None}


async def run_js(crawler: AsyncWebCrawler, url: str, js: str) -> list:
    res = await crawler.arun(url=url, config=CrawlerRunConfig(
        session_id=SESSION, js_code=js, js_only=True, cache_mode=CacheMode.BYPASS,
    ))
    er = res.js_execution_result or {}
    results = er.get('results') if isinstance(er, dict) else er
    if not results:
        return []
    first = results[0]
    # Crawl4AI wraps each script's return value; unwrap it whatever the version.
    if isinstance(first, dict) and 'result' in first:
        first = first['result']
    return first or []


async def main(limit: Optional[int], upcoming_only: bool, batch: int) -> None:
    log('ITRA crawler — Crawl4AI')
    browser = BrowserConfig(headless=True, user_agent=UA, viewport_width=1280, viewport_height=900,
                            verbose=False)
    map_url = 'https://itra.run/Races/RaceMap'

    async with AsyncWebCrawler(config=browser) as crawler:
        log('  Warming session at itra.run…')
        await crawler.arun(url='https://itra.run/', config=CrawlerRunConfig(
            session_id=SESSION, cache_mode=CacheMode.BYPASS, wait_until='domcontentloaded',
            delay_before_return_html=2, page_timeout=30000,
        ))

        log('  Opening race map…')
        res = await crawler.arun(url=map_url, config=CrawlerRunConfig(
            session_id=SESSION, cache_mode=CacheMode.BYPASS, wait_until='domcontentloaded',
            delay_before_return_html=3, page_timeout=60000,
        ))
        html = res.html or ''
        log(f'  Got {len(html):,} chars of rendered HTML')

        points = extract_array_from_html(html)
        if points is None:
            log('ERROR: raceSearchJsonSidePopupNew not found (ITRA may be blocking the session)')
            sys.exit(1)

        se = [p for p in points if LAT_MIN <= p[0] <= LAT_MAX and LNG_MIN <= p[1] <= LNG_MAX]
        log(f'  {len(points)} races on map, {len(se)} in SE Europe')

        today = date.today().isoformat()
        races: list[dict] = []
        for b in range(0, len(se), batch):
            if limit and len(races) >= limit:
                break
            chunk = se[b:b + batch]
            by_id = {int(p[2]): p for p in chunk}
            popups = await run_js(crawler, map_url, FETCH_JS % (json.dumps(list(by_id)), '"popup"'))
            built = []
            for rid, popup in popups:
                if not popup:
                    continue
                lat, lng, _ = by_id[int(rid)]
                race = build_race(lat, lng, int(rid), popup)
                if race and (not upcoming_only or race['date_start'] >= today):
                    built.append(race)

            # Detail pages carry the exact stats and ITRA points of the longest distance.
            detail_urls = [r['itra_url'].replace('https://itra.run', '') for r in built if r.get('itra_url')]
            if detail_urls:
                details = dict(await run_js(crawler, map_url, FETCH_JS % (json.dumps(detail_urls), '"detail"')))
                for r in built:
                    page = details.get((r.get('itra_url') or '').replace('https://itra.run', ''))
                    if not page:
                        continue
                    d = parse_detail_html(page)
                    longest = r['distances'][0] if r['distances'] else None
                    if longest is not None:
                        longest.update({k: v for k, v in d.items() if k != 'description'})
                    if 'itra_points' in d:
                        r['itra_points'] = max(d['itra_points'], r.get('itra_points') or 0)
                    if d.get('description'):
                        r['description'] = d['description']

            races.extend(built)
            log(f'  {min(b + batch, len(se))}/{len(se)} checked, {len(races)} kept')
            await asyncio.sleep(0.5)

    if limit:
        races = races[:limit]

    # Dedupe on name + date (ITRA lists some events twice).
    seen: set[tuple[str, str]] = set()
    unique = []
    for r in sorted(races, key=lambda r: r['date_start']):
        key = (r['slug'], r['date_start'])
        if key not in seen:
            seen.add(key)
            unique.append(r)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        'crawled_at': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'source': 'itra.run',
        'races': unique,
    }, ensure_ascii=False, indent=2) + '\n')
    log(f'  ✓ wrote {len(unique)} races to {OUT}')


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--limit', type=int, help='stop after this many races')
    ap.add_argument('--all-dates', action='store_true', help='keep past races too')
    ap.add_argument('--batch', type=int, default=15, help='parallel requests per batch')
    args = ap.parse_args()
    asyncio.run(main(args.limit, not args.all_dates, args.batch))
