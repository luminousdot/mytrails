# Feature ideas from trailos and Trail Station

Reviewed 27 Nov 2026: `~/Projects/trail-os` (routes, components, phase 1–2 specs, news and myrace.rs specs) and `~/Projects/calc` (Trail Station, its ROADMAP.md). Ideas only; nothing here is code to copy. Ordered by what PRODUCT.md says matters: organisers and results are confirmed next, Serbia first.

## 1. Organisers (confirmed need)

| Idea | From | Notes for My Trails |
|---|---|---|
| **Race submission form**: name, dates, place, distances, GPX upload, cover and gallery photos, registration link, organiser contact | trailos `/submit` | The core of "organiser tools". Saves as *pending*. |
| **Review queue**: pending submissions to approve, edit or reject; publish, unpublish, archive | trailos `/admin` | Needed before anything a stranger submits goes live. |
| **Claim and edit an existing race page** | new | Most races are already listed from ITRA; organisers should take them over rather than resubmit. |
| **Aid stations per distance** (name, km) | trailos checkpoints, Trail Station aid-station entry | Unlocks the estimator, the profile markers and the Trail Station handoff below. |
| **Branded race page for the organiser's runners** | Trail Station "race-director pages" | One link an organiser sends to every entrant: course, profile, aid stations, fuel plan. |

## 2. Results and rankings (confirmed need)

| Idea | From | Notes |
|---|---|---|
| **Results per edition** (finish times by distance) | trailos phase 2c | Start with organiser upload (CSV) or the results links mountain-race.rs already exposes (`results_link`, `has_results`). |
| **"Log my result"** for a runner | trailos `LogResultButton` | Needs runner accounts (open decision). |
| **Rankings**: per series (e.g. WST standings), per race, later per region | trailos (left out there) | Series standings are the natural first ranking; WST already exists in our data. |
| **Course history**: past editions with distance, climb and notes | trailos phase 2b | mountain-race.rs already lists every WST edition since 2024. |

## 3. Course detail (our positioning)

| Idea | From | Notes |
|---|---|---|
| **GPX route on the map** (2D) | trailos race page | We have 7 tracks; draw them on the race page map. |
| **3D terrain fly-over** | trailos race page | Showpiece; later, and heavy. |
| **Difficulty score** (distance + climb → 1–10, Moderate to Extreme) | trailos phase 2b | Cheap, no login, helps comparison. |
| **Finish time estimator** (trail-adjusted Naismith; arrival per aid station) | trailos phase 2b | Needs aid stations; no login needed in our version. |
| **Plan your fuel → Trail Station** | Trail Station | A link that opens Trail Station with this race's distance, profile and aid stations. Keep nutrition in Trail Station; its roadmap deliberately has no calendar, so the two complement each other. |
| **Photo gallery, full description, organiser block, similar races** | trailos race page | Gallery depends on organiser uploads (no stock photos). |

## 4. Discovery

| Idea | From | Notes |
|---|---|---|
| **Series pages** (`/series/wst`): races, dates, standings | trailos `/series` | Pairs with series rankings. |
| **More filters**: race type (trail, sky, mountain), climb bands, date range | trailos filters | Type needs a field we do not have yet. |
| **More Serbian sources**: myrace.rs (has GPX per distance), trka.rs, more mountain-race.rs series | trailos scrapers and specs | Later: the current data is frozen as demo data. |
| **News** from trail running RSS feeds | trailos news spec | Low priority; not core to the calendar. |

## 5. Runners (open decision: accounts)

| Idea | From | Notes |
|---|---|---|
| **Save races** and a personal upcoming list | trailos phase 2a | Could start without accounts (saved in the browser). |
| **Strava sign-in**, fitness-based estimates | trailos phase 2a | Only if accounts are decided; trailos gated tools behind it, which hid them from most visitors. |
| **Serbian language** | trailos (post phase 1) | Open decision in PRODUCT.md. |

## From other Serbian race sites

See `docs/competitor-map.md` (trkesrbija.rs, trka.rs, mountain-race.rs, spisaktrka.com, runnmore.com). The ones that fit best:

- **Registration status** (open, closed, opens on a date) on cards and race pages; organisers enter it in the form.
- **"Next edition expected in <month>"** for races without a new date (fixes the WST gap).
- **Serbian language**: every one of these sites is in Serbian.
- **Standalone GPX tool**: drop any GPX and see its profile and climb.
- **Category landing pages** (ultra, sky, by country) for discovery and search.
- trka.rs already lists the 2027 WST dates; add it as a source once the demo data is unfrozen.

## Suggested order

1. Organiser submission + review queue, with aid stations in the form.
2. Results per edition, then WST series standings and a series page.
3. Difficulty score and GPX route on the map (small, no accounts).
4. Finish time estimator and the Trail Station fuel link (needs aid stations).
5. Runner accounts, saved races and Serbian, once decided.
