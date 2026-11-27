#!/usr/bin/env python3
"""
mountain-race.rs series importer.

mountain-race.rs publishes each series as JSON (/api/get-series?slug=…), the
same feed its own pages are built from, so this needs no browser. It writes
every edition of every race in the series to data/sources/mountain-race.json;
merge.py decides which ones the calendar shows.

    uv run mountain_race.py            # WST
    uv run mountain_race.py wst other  # several series
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

BASE = 'https://mountain-race.rs'
OUT = Path(__file__).resolve().parent.parent / 'data' / 'sources' / 'mountain-race.json'
UA = 'MyTrails/0.1 (trail race calendar prototype)'

COUNTRY_MAP = {
    'Srbija': ('Serbia', 'RS'), 'Bosna i Hercegovina': ('Bosnia and Herzegovina', 'BA'),
    'Crna Gora': ('Montenegro', 'ME'), 'Hrvatska': ('Croatia', 'HR'), 'Slovenija': ('Slovenia', 'SI'),
    'Makedonija': ('North Macedonia', 'MK'), 'Severna Makedonija': ('North Macedonia', 'MK'),
    'Bugarska': ('Bulgaria', 'BG'), 'Rumunija': ('Romania', 'RO'), 'Grčka': ('Greece', 'GR'),
    'Albanija': ('Albania', 'AL'), 'Mađarska': ('Hungary', 'HU'),
}


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def get_json(url: str):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'application/json'})
    with urllib.request.urlopen(req, timeout=20) as res:
        return json.load(res)


def place(location: Optional[str]) -> dict:
    # "Srbija, Divčibare" → country first, then the place
    parts = [p.strip() for p in (location or '').split(',') if p.strip()]
    country, code = COUNTRY_MAP.get(parts[0], (parts[0], None)) if parts else ('Serbia', 'RS')
    return {'country': country, 'country_code': code, 'city': ', '.join(parts[1:]) or None}


def num(v) -> Optional[float]:
    try:
        return float(v) if v not in (None, '') else None
    except (TypeError, ValueError):
        return None


def build(start: dict, series: dict) -> dict:
    distances = []
    for d in start.get('distances') or []:
        km = num(d.get('length'))
        dist = {
            'name': (d.get('title') or '').strip() or (d.get('params') or '').strip() or None,
            'distance_km': km,
            'elevation_gain_m': int(num(d.get('elevation'))) if num(d.get('elevation')) else None,
            'itra_points': int(num(d.get('itra'))) if num(d.get('itra')) is not None else None,
            'time_limit_hours': round(d['time_limit_seconds'] / 3600, 1) if d.get('time_limit_seconds') else None,
        }
        distances.append({k: v for k, v in dist.items() if v is not None})
    distances.sort(key=lambda d: d.get('distance_km') or 0, reverse=True)
    points = [d['itra_points'] for d in distances if d.get('itra_points')]
    page = f"{BASE}/trka/{start['race_slug']}/{start['start_slug']}/"

    race = {
        'id': f"mr-{start['id']}",
        'race_key': start['race_slug'],
        'name': start['title'],
        **place(start.get('location')),
        'date_start': start['date_start'],
        'date_end': start.get('date_end') if start.get('date_end') not in (None, start['date_start']) else None,
        'canceled': bool(start.get('isCanceled')),
        'registration_url': page,
        'website': page,
        'itra_points': max(points) if points else None,
        'cover': {'url': start['image'], 'source': 'mountain-race'} if start.get('image') else None,
        'distances': distances,
        'series': [{'slug': series['slug'], 'title': series['title']}],
        'source': 'mountain-race.rs',
    }
    return {k: v for k, v in race.items() if v is not None}


def main(slugs: list[str]) -> None:
    races = []
    series_meta = []
    for slug in slugs:
        log(f'  Fetching series {slug}…')
        s = get_json(f'{BASE}/api/get-series?slug={slug}')
        series_meta.append({
            'slug': s['slug'], 'title': s['title'],
            'logo_url': s.get('logo_url'), 'cover_url': s.get('cover_img_url'),
            'url': f'{BASE}/s/{s["slug"]}/',
        })
        for start in s.get('starts') or []:
            races.append(build(start, s))
        log(f"  ✓ {s['title']}: {len(s.get('starts') or [])} editions")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        'crawled_at': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'source': 'mountain-race.rs',
        'series': series_meta,
        'races': races,
    }, ensure_ascii=False, indent=2) + '\n')
    log(f'  ✓ wrote {len(races)} editions to {OUT}')


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('series', nargs='*', default=['wst'], help='series slugs on mountain-race.rs')
    main(ap.parse_args().series)
