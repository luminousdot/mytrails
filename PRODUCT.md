# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Trail runners (primary).** Runners in Southeast Europe, Serbia first, planning their race season. They browse on the phone between runs and on the desktop while planning a training block. They choose races by date, distance, climb and ITRA points, and want to know what a course is really like before entering.

**Race organisers (co-primary).** Race directors who want their race seen by runners beyond their local network. They need tools to create and maintain their race's page themselves: dates, distances, GPX course, photos and the registration link.

## Product Purpose

My Trails is the trail and mountain race calendar for Southeast Europe. It lets a runner find, compare and enter races across a region that has no single authoritative source, and lets an organiser publish a race page that reaches them. Success is a runner discovering and entering a race they would not have found otherwise, and an organiser getting entries from outside their own circle.

## Positioning

The one place that covers the whole region with real course detail (elevation profiles from GPX, ITRA points, every distance) and data straight from organisers (for example mountain-race.rs and the organisers' own pages), rather than a list of links. The focus is Serbia in general, then its neighbours.

## Operating Context

- Runners arrive on a phone, often outdoors, or on a desktop while planning; a race page is often their first page, reached from search or social media.
- Organisers publish infrequently, on a desktop, and expect a short form flow.
- Race series (such as WST, West Serbia Trail Series) group races runners follow across a season.

## Capabilities and Constraints

- **Today (prototype):** one calendar with list, cards, map and month-agenda views; filters for country, series, distance and ITRA points; a page per race with distances, start-area map, elevation profile where a GPX exists, cover photo, and links to ITRA, the race site and registration.
- **Data today:** a frozen demo dataset (27 November 2026) crawled from ITRA (Crawl4AI) and mountain-race.rs. 103 races; 39 have a real photo, 7 have a GPX profile. Do not present it as live or complete.
- **Needed next (confirmed):** organiser tools to create and edit their race page; race results and rankings.
- **Stack:** Next.js (App Router) with Once UI only; Python crawlers in `crawler/`.
- **Languages (decided 27 Nov 2026):** Serbian in Latin script is the default (`/sr`), English second (`/en`); every competitor in Serbia is in Serbian. Cyrillic not planned.
- **Open decisions:** runner accounts or Strava sign-in (not decided).

## Brand Commitments

- Name: My Trails, with the "MT" monogram (confirmed 27 Nov 2026).
- Built entirely with Once UI components.
- Light and dark mode are both first-class.
- Never use JetBrains Mono.

## Evidence on Hand

- Race data: `data/races.json`, sources in `data/sources/`, GPX tracks in `public/gpx/`, profiles in `data/profiles/`.
- Photos: hotlinked from ITRA, mountain-race.rs and race websites; no licensed photography of our own.
- No testimonials, user numbers, partner organisers or press yet. Do not invent any.

## Product Principles

1. **Course detail earns trust.** Distance, climb, elevation profile and ITRA points are why a runner comes here instead of a link list; surface them, and never fake them.
2. **Organisers are the source.** Their own data wins over aggregated data, and publishing a race should feel like a natural part of the product, not a bolt-on.
3. **Serbia first, the region next.** Coverage and defaults start with Serbia and widen to Southeast Europe.
4. **Phone first, field conditions.** Fast, legible and one-thumb usable between runs.
5. **Discovery over search.** The map, series and calendar exist so runners find races they did not know to look for.
