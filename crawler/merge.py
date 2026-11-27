#!/usr/bin/env python3
"""
Combine the sources in data/sources/ into data/races.json, the one file the
app reads.

- ITRA (itra.json) is the base: it has every race's map position and points.
- mountain-race.rs (mountain-race.json) is the organisers' own data, so for a
  race it lists it wins on name, distances, cover photo and registration link.
  A race only it lists is placed on the map by looking its town up.
- Only upcoming, not cancelled editions reach the calendar.

    uv run merge.py
"""

from __future__ import annotations

import json
import re
import sys
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from itra_crawl import slugify

DATA = Path(__file__).resolve().parent.parent / 'data'
SOURCES = DATA / 'sources'
GEOCODE_CACHE = SOURCES / 'geocode.json'
UA = 'MyTrails/0.1 (trail race calendar prototype)'


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def load(name: str) -> dict:
    path = SOURCES / name
    return json.loads(path.read_text()) if path.exists() else {'races': []}


def base_name(name: str) -> str:
    """'Divča Winter Trail 2027' → 'divca-winter-trail'."""
    return slugify(re.sub(r'\b(19|20)\d{2}\b', '', name))


def same_race(a: dict, b: dict) -> bool:
    da, db = date.fromisoformat(a['date_start']), date.fromisoformat(b['date_start'])
    if abs((da - db).days) > 3:
        return False
    wa, wb = set(base_name(a['name']).split('-')), set(base_name(b['name']).split('-'))
    # Shared distinctive words ("divca", "winter") beat generic ones ("trail").
    generic = {'trail', 'race', 'run', 'ultra', 'sky', 'skyrace', 'the', 'i', 'and'}
    return len((wa & wb) - generic) >= 1


def geocode(query: str, cache: dict) -> Optional[tuple[float, float]]:
    if query in cache:
        return tuple(cache[query]) if cache[query] else None
    url = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode(
        {'q': query, 'format': 'json', 'limit': 1})
    try:
        req = urllib.request.Request(url, headers={'User-Agent': UA})
        with urllib.request.urlopen(req, timeout=20) as res:
            hits = json.load(res)
        point = (float(hits[0]['lat']), float(hits[0]['lon'])) if hits else None
    except Exception as e:  # noqa: BLE001 — a failed lookup just leaves the race off the map
        log(f'    geocode {query!r} failed: {e}')
        point = None
    cache[query] = list(point) if point else None
    return point


def main() -> None:
    itra = load('itra.json')
    mr = load('mountain-race.json')
    today = date.today().isoformat()
    races = [dict(r, sources=['itra.run']) for r in itra['races'] if r['date_start'] >= today]

    # The latest edition of each mountain-race.rs race that has distances, for
    # an announced edition whose distances are not published yet.
    last_distances: dict[str, list] = {}
    for e in sorted(mr['races'], key=lambda e: e['date_start']):
        if e.get('distances'):
            last_distances[e['race_key']] = e['distances']

    cache = json.loads(GEOCODE_CACHE.read_text()) if GEOCODE_CACHE.exists() else {}
    added = merged = 0
    for e in mr['races']:
        if e['date_start'] < today or e.get('canceled'):
            continue
        name = re.sub(r'\s+\b(19|20)\d{2}\b\s*$', '', e['name']).strip()
        distances = e.get('distances') or None
        match = next((r for r in races if same_race(r, e)), None)
        if match:
            match['name'] = name
            match['series'] = e['series']
            match['registration_url'] = e['registration_url']
            match['website'] = e['website']
            if e.get('cover'):
                match['cover'] = e['cover']
            if distances:
                match['distances'] = distances
            match['sources'] = ['mountain-race.rs', 'itra.run']
            merged += 1
            continue

        point = geocode(f"{e.get('city') or ''}, {e['country']}".strip(', '), cache)
        if not point:
            log(f'  ✗ {name}: no map position, skipped')
            continue
        race = {k: v for k, v in e.items() if k not in ('race_key', 'canceled', 'source')}
        race.update({
            'name': name,
            'slug': slugify(name),
            'lat': point[0],
            'lng': point[1],
            'distances': distances or last_distances.get(e['race_key'], []),
            'sources': ['mountain-race.rs'],
        })
        races.append(race)
        added += 1

    GEOCODE_CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2) + '\n')

    # Slugs are page addresses, so they must be unique.
    seen: dict[str, int] = {}
    for r in sorted(races, key=lambda r: r['date_start']):
        n = seen.get(r['slug'], 0)
        seen[r['slug']] = n + 1
        if n:
            r['slug'] = f"{r['slug']}-{r['date_start'][:4]}"

    races.sort(key=lambda r: (r['date_start'], r['name']))
    (DATA / 'races.json').write_text(json.dumps({
        'crawled_at': itra.get('crawled_at') or datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'sources': ['itra.run', 'mountain-race.rs'],
        'series': mr.get('series', []),
        'races': races,
    }, ensure_ascii=False, indent=2) + '\n')
    log(f'  ✓ {len(races)} races ({merged} enriched from mountain-race.rs, {added} only there)')


if __name__ == '__main__':
    main()
