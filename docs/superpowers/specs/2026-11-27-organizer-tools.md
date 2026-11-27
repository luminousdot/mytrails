# Organiser tools (v1)

**Goal:** race organisers can put their race on My Trails themselves, either by adding a new race or by claiming one we already list, and nothing goes live until it is reviewed. Confirmed need in PRODUCT.md; ideas from trailos `/submit` and `/admin` (see `2026-11-27-feature-ideas.md`).

## Flows

1. **Entry: `/organizers`.** "Put your race on My Trails." Two paths: find your race among the listed ones and claim it, or add a new race. Linked from the top bar ("For organisers") and from every race page ("Organising this race? Claim it").
2. **Add a race: `/organizers/new`.** One form in sections:
   - Race: name, start and end date, country, town, website, registration link, short description.
   - Distances (one or more): name, km, climb (m), cut-off (h), start time, **GPX file**, **aid stations** (name, km).
   - Photos: cover photo (first) plus up to five more.
   - You: name, email, role (race director, organising team, other).
3. **Claim a race: `/organizers/claim/[slug]`.** The same form, pre-filled from the listed race, plus "how can we confirm you organise it" (for example an email on the race's own domain). Submitting creates a claim, not a new race.
4. **After submitting: `/organizers/thanks`.** What happens next, and the reference number.
5. **Review: `/review`.** A queue of pending submissions and claims, newest first, with status filter. **`/review/[id]`** shows everything submitted (with the elevation profile from the GPX) and three actions: approve and publish, reject with a note, or leave pending.

## Publishing

- Approving a new race adds it to the calendar; approving a claim replaces the listed race's details with the organiser's (same address, marked as organiser data, sources `organiser`).
- A GPX on the longest distance becomes the race's elevation profile right away (same processing as `crawler/gpx.py`: smoothed climb, 300 points).
- Organiser data wins over crawled data (PRODUCT.md principle 2).

## Data (prototype)

- `src/lib/organizer.ts` is the only code that touches storage: typed async functions (`createSubmission`, `listSubmissions`, `getSubmission`, `reviewSubmission`, `getPublished`). Swapping in a database (Supabase or Neon) later changes this file, not the screens.
- Storage today: `data/organizer/submissions.json`, `data/organizer/published.json` and organiser elevation profiles in `data/organizer/profiles/` (apart from the demo data, which claims never rewrite); uploaded files under `public/uploads/<submission id>/`. This works on a local machine only, not on Vercel.
- `getRaces()` merges published organiser races over the demo data.

## Out of v1

- Organiser accounts and sign-in (they get a reference number; editing after submission goes through a new claim).
- Real verification of claims (the reviewer decides from the note).
- Email notifications.
- Protection of `/review`: it only exists in development (`next dev`); it must get real auth before any deploy.
- Results and rankings (next feature).
