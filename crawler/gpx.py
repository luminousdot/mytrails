#!/usr/bin/env python3
"""
Elevation profiles from GPX files published on race websites (Crawl4AI).

GPX files dropped in public/gpx/<race slug>.gpx come first (they are also
what the race page's download link serves). Neither ITRA nor
mountain-race.rs publish tracks, so for the rest this visits each race's
own site (and up to a few course pages linked from it) looking for .gpx
links, downloads them, and keeps the track closest in length to the race's
longest distance.

Writes data/profiles/<race id>.json — [km, metres] points, about 300 of them —
plus data/sources/gpx.json with each race's track stats. Run after merge.py,
then run merge.py again so races know they have a profile.

    uv run gpx.py               # local files + search race websites
    uv run gpx.py --local-only  # just public/gpx/, keep earlier web results
"""

from __future__ import annotations

import argparse
import asyncio
import json
import math
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Optional
from urllib.parse import urljoin, urlparse

from crawl4ai import AsyncWebCrawler, BrowserConfig, CacheMode, CrawlerRunConfig

DATA = Path(__file__).resolve().parent.parent / 'data'
PROFILES = DATA / 'profiles'
LOCAL = DATA.parent / 'public' / 'gpx'
OUT = DATA / 'sources' / 'gpx.json'
UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')

# Pages worth opening one level down: course, route, map, in the region's languages.
COURSE_WORDS = re.compile(
    r'gpx|course|route|track|map|staz|trasa|trase|proga|parcours|percorso|strecke|traseu|'
    r'diadrom|maršrut|marsrut|distanc|race-info|races',
    re.I,
)
MAX_SUBPAGES = 6
POINTS = 300


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def gpx_links(html: str, base: str) -> list[str]:
    hrefs = re.findall(r'href=["\']([^"\']+)["\']', html, re.I)
    return sorted({urljoin(base, h) for h in hrefs if re.search(r'\.gpx(\?|$)|[?&/]gpx\b', h, re.I)})


def course_pages(result, base: str) -> list[str]:
    host = urlparse(base).netloc
    found = []
    for link in (result.links or {}).get('internal', []):
        href = urljoin(base, link.get('href') or '')
        text = f"{href} {link.get('text') or ''}"
        if urlparse(href).netloc == host and COURSE_WORDS.search(text) and href not in found:
            found.append(href)
    return found[:MAX_SUBPAGES]


def haversine(a, b) -> float:
    lat1, lon1, lat2, lon2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin((lon2 - lon1) / 2) ** 2
    return 6371.0 * 2 * math.asin(math.sqrt(h))


def parse_gpx(raw: bytes) -> Optional[dict]:
    try:
        root = ET.fromstring(raw)
    except ET.ParseError:
        return None
    pts = []
    for el in root.iter():
        if el.tag.split('}')[-1] in ('trkpt', 'rtept'):
            ele = next((c.text for c in el if c.tag.split('}')[-1] == 'ele'), None)
            if ele is None:
                continue
            try:
                pts.append((float(el.get('lat')), float(el.get('lon')), float(ele)))
            except (TypeError, ValueError):
                continue
    if len(pts) < 20:
        return None

    dist = [0.0]
    for a, b in zip(pts, pts[1:]):
        dist.append(dist[-1] + haversine(a, b))
    total = dist[-1]
    if total < 2:
        return None

    # Smooth before summing climb: raw GPS elevation jitters and inflates D+.
    ele = [p[2] for p in pts]
    w = 5
    smooth = [sum(ele[max(0, i - w):i + w + 1]) / len(ele[max(0, i - w):i + w + 1]) for i in range(len(ele))]
    gain = sum(max(0.0, b - a) for a, b in zip(smooth, smooth[1:]))
    loss = sum(max(0.0, a - b) for a, b in zip(smooth, smooth[1:]))

    # Resample to evenly spaced points along the course.
    profile, j = [], 0
    for k in range(POINTS):
        target = total * k / (POINTS - 1)
        while j < len(dist) - 2 and dist[j + 1] < target:
            j += 1
        span = dist[j + 1] - dist[j] or 1
        t = min(1.0, max(0.0, (target - dist[j]) / span))
        profile.append([round(target, 2), round(smooth[j] + (smooth[j + 1] - smooth[j]) * t)])

    return {
        'distance_km': round(total, 1),
        'elevation_gain_m': round(gain),
        'elevation_loss_m': round(loss),
        'max_m': round(max(smooth)),
        'min_m': round(min(smooth)),
        'start': [pts[0][0], pts[0][1]],
        'profile': profile,
    }


def download(url: str) -> Optional[bytes]:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': UA})
        with urllib.request.urlopen(req, timeout=30) as res:
            data = res.read(20_000_000)
        return data if b'<gpx' in data[:2000] or b'<trkpt' in data else None
    except Exception:  # noqa: BLE001 — a dead link just means no profile
        return None


def save(rid: str, track: dict, tracks: dict) -> None:
    PROFILES.mkdir(parents=True, exist_ok=True)
    (PROFILES / f'{rid}.json').write_text(json.dumps(track['profile']) + '\n')
    tracks[rid] = {k: v for k, v in track.items() if k != 'profile'}


def local_tracks(races: list[dict], tracks: dict) -> set[str]:
    """public/gpx/<slug>.gpx, added by hand; served at /gpx/<slug>.gpx."""
    done = set()
    for r in races:
        path = LOCAL / f"{r['slug']}.gpx"
        track = parse_gpx(path.read_bytes()) if path.exists() else None
        if track:
            track['url'] = f"/gpx/{r['slug']}.gpx"
            track['source'] = 'manual'
            save(r['id'], track, tracks)
            done.add(r['id'])
            log(f"  ✓ {r['name']} (local): {track['distance_km']} km, {track['elevation_gain_m']} m D+")
    return done


async def main(local_only: bool) -> None:
    races = json.loads((DATA / 'races.json').read_text())['races']
    tracks = json.loads(OUT.read_text()) if local_only and OUT.exists() else {}
    done = local_tracks(races, tracks)
    if local_only:
        OUT.write_text(json.dumps(tracks, ensure_ascii=False, indent=2) + '\n')
        log(f'  ✓ {len(tracks)} races with a GPX profile')
        return

    sites = {r['id']: r.get('website') or r.get('registration_url') for r in races}
    sites = {k: v for k, v in sites.items() if v and 'itra.run' not in v and k not in done}
    log(f'GPX search on {len(sites)} race websites')

    cfg = CrawlerRunConfig(cache_mode=CacheMode.BYPASS, wait_until='domcontentloaded',
                           page_timeout=20000, delay_before_return_html=1)
    browser = BrowserConfig(headless=True, user_agent=UA, verbose=False)
    links: dict[str, set[str]] = {k: set() for k in sites}

    async with AsyncWebCrawler(config=browser) as crawler:
        home = {r.url: r for r in await crawler.arun_many(urls=list(set(sites.values())), config=cfg)}
        sub_urls: dict[str, list[str]] = {}
        for rid, url in sites.items():
            res = home.get(url)
            if not res or not res.success:
                continue
            links[rid] |= set(gpx_links(res.html or '', url))
            sub_urls[rid] = course_pages(res, url)
        all_sub = sorted({u for us in sub_urls.values() for u in us})
        log(f'  opening {len(all_sub)} course pages…')
        sub = {r.url: r for r in await crawler.arun_many(urls=all_sub, config=cfg)} if all_sub else {}
        for rid, us in sub_urls.items():
            for u in us:
                res = sub.get(u)
                if res and res.success:
                    links[rid] |= set(gpx_links(res.html or '', u))

    by_id = {r['id']: r for r in races}
    for rid, urls in links.items():
        if not urls:
            continue
        want = (by_id[rid].get('distances') or [{}])[0].get('distance_km')
        best = None
        for url in sorted(urls)[:8]:
            raw = download(url)
            track = parse_gpx(raw) if raw else None
            if not track:
                continue
            track['url'] = url
            # The longest distance's track, when the site has one per distance.
            score = abs(track['distance_km'] - want) if want else -track['distance_km']
            if best is None or score < best[0]:
                best = (score, track)
        if best:
            track = best[1]
            track['source'] = 'website'
            save(rid, track, tracks)
            log(f"  ✓ {by_id[rid]['name']}: {track['distance_km']} km, {track['elevation_gain_m']} m D+")

    OUT.write_text(json.dumps(tracks, ensure_ascii=False, indent=2) + '\n')
    log(f'  ✓ {len(tracks)} races with a GPX profile')


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--local-only', action='store_true', help='only read public/gpx/')
    asyncio.run(main(ap.parse_args().local_only))
