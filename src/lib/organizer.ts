import "server-only";

import { cacheTag } from "next/cache";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseGpx } from "./gpx";
import type { RaceDraft, Submission, SubmissionStatus } from "./organizer-types";
import type { Race } from "./types";

// The only code that touches organiser storage. Today: JSON files in
// data/organizer/ and uploads in public/uploads/, which work on a local
// machine only. Swapping in a database (and object storage) changes this file,
// not the screens.

const DIR = path.join(process.cwd(), "data", "organizer");
const SUBMISSIONS = path.join(DIR, "submissions.json");
const PUBLISHED = path.join(DIR, "published.json");
const UPLOADS = path.join(process.cwd(), "public", "uploads");
// Kept apart from data/profiles so a claim never rewrites the demo dataset.
export const ORGANIZER_PROFILES = path.join(DIR, "profiles");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(data, null, 2) + "\n");
}

function reference(): string {
  // No 0/O or 1/I, so it reads back over the phone.
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let s = "";
  for (let i = 0; i < 4; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `MT-${s}`;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/đ/g, "dj")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Saves an uploaded file under public/uploads/<id>/ and returns its public path. */
export async function storeUpload(id: string, file: File, name: string): Promise<string> {
  const dir = path.join(UPLOADS, id);
  await mkdir(dir, { recursive: true });
  const ext = path.extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, "") || "";
  const fileName = `${name}${ext}`;
  await writeFile(path.join(dir, fileName), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${id}/${fileName}`;
}

export async function newSubmissionId(): Promise<string> {
  const existing = new Set((await readJson<Submission[]>(SUBMISSIONS, [])).map((s) => s.id));
  let id = reference();
  while (existing.has(id)) id = reference();
  return id;
}

export async function createSubmission(submission: Submission): Promise<Submission> {
  const all = await readJson<Submission[]>(SUBMISSIONS, []);
  all.push(submission);
  await writeJson(SUBMISSIONS, all);
  return submission;
}

// Cached so pages can prerender; the server actions expire these tags on every write.
export const SUBMISSIONS_TAG = "organizer-submissions";
export const PUBLISHED_TAG = "organizer-published";

export async function listSubmissions(status?: SubmissionStatus): Promise<Submission[]> {
  "use cache";
  cacheTag(SUBMISSIONS_TAG);
  const all = await readJson<Submission[]>(SUBMISSIONS, []);
  return all
    .filter((s) => !status || s.status === status)
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
}

export async function getSubmission(id: string): Promise<Submission | null> {
  return (await listSubmissions()).find((s) => s.id === id) ?? null;
}

/** Races organisers published, keyed by race id; they override the demo data. */
export async function getPublished(): Promise<Race[]> {
  "use cache";
  cacheTag(PUBLISHED_TAG);
  return readJson<Race[]>(PUBLISHED, []);
}

async function geocode(city: string, country: string): Promise<[number, number] | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({ q: `${city}, ${country}`, format: "json", limit: "1" })}`;
    const res = await fetch(url, { headers: { "User-Agent": "MyTrails/0.1 (trail race calendar prototype)" } });
    const hits = (await res.json()) as { lat: string; lon: string }[];
    return hits[0] ? [Number(hits[0].lon), Number(hits[0].lat)] : null;
  } catch {
    return null;
  }
}

/** Turns an approved draft into a calendar race, writing its elevation profile when a GPX came with it. */
async function toRace(s: Submission, existing: Race | undefined): Promise<Race> {
  const d: RaceDraft = s.race;
  const id = existing?.id ?? `org-${s.id.toLowerCase()}`;
  const distances = [...d.distances]
    .sort((a, b) => (b.distance_km ?? 0) - (a.distance_km ?? 0))
    .map((x) => ({
      name: x.name || undefined,
      distance_km: x.distance_km ?? undefined,
      elevation_gain_m: x.elevation_gain_m ?? undefined,
      time_limit_hours: x.time_limit_hours ?? undefined,
      start_time: x.start_time || undefined,
      aid_stations: x.aid_stations.filter((a) => a.km != null).map((a) => ({ name: a.name, km: a.km as number })),
      gpx_url: x.gpx_url,
    }));

  // The longest distance with a GPX gives the profile, and its start the map position.
  let profile: Race["profile"];
  let start: [number, number] | null = null;
  const withGpx = distances.find((x) => x.gpx_url);
  if (withGpx?.gpx_url) {
    const xml = await readFile(path.join(process.cwd(), "public", withGpx.gpx_url), "utf8").catch(() => "");
    const track = xml ? parseGpx(xml) : null;
    if (track) {
      await mkdir(ORGANIZER_PROFILES, { recursive: true });
      await writeFile(path.join(ORGANIZER_PROFILES, `${id}.json`), JSON.stringify(track.profile) + "\n");
      profile = {
        distance_km: track.distance_km,
        elevation_gain_m: track.elevation_gain_m,
        elevation_loss_m: track.elevation_loss_m,
        max_m: track.max_m,
        min_m: track.min_m,
        url: withGpx.gpx_url,
        distance_name: withGpx.name ?? null,
      };
      start = [track.start[1], track.start[0]];
    }
  }
  const position =
    d.position ?? start ?? (await geocode(d.city, d.country)) ?? (existing ? [existing.lng, existing.lat] : [20.46, 44.81]);

  const photos = d.photos ?? [];
  return {
    ...(existing ?? {}),
    id,
    slug: existing?.slug ?? slugify(d.name),
    name: d.name,
    country: d.country,
    city: d.city,
    date_start: d.date_start,
    date_end: d.date_end || undefined,
    lat: position[1],
    lng: position[0],
    website: d.website || existing?.website,
    registration_url: d.registration_url || existing?.registration_url,
    description: d.description || existing?.description,
    cover: photos[0] ? { url: photos[0], source: "organiser" } : existing?.cover,
    photos: photos.slice(1),
    profile: profile ?? existing?.profile,
    distances,
    organizer: { name: s.organizer.name, since: new Date().toISOString().slice(0, 10) },
    sources: ["organiser", ...(existing?.sources ?? []).filter((x) => x !== "organiser")],
    source: "organiser",
  };
}

export async function reviewSubmission(
  id: string,
  decision: "approved" | "rejected",
  note: string,
  findListed: (raceId: string) => Promise<Race | undefined>,
): Promise<Submission> {
  const all = await readJson<Submission[]>(SUBMISSIONS, []);
  const s = all.find((x) => x.id === id);
  if (!s) throw new Error(`No submission ${id}`);

  if (decision === "approved") {
    const published = await readJson<Race[]>(PUBLISHED, []);
    const existing = s.claim ? (published.find((r) => r.id === s.claim?.raceId) ?? (await findListed(s.claim.raceId))) : undefined;
    const race = await toRace(s, existing);
    const taken = new Set(published.filter((r) => r.id !== race.id).map((r) => r.slug));
    if (!existing && taken.has(race.slug)) race.slug = `${race.slug}-${race.date_start.slice(0, 4)}`;
    await writeJson(PUBLISHED, [...published.filter((r) => r.id !== race.id), race]);
    s.published_slug = race.slug;
  }

  s.status = decision;
  s.reviewed_at = new Date().toISOString();
  s.review_note = note || undefined;
  await writeJson(SUBMISSIONS, all);
  return s;
}

/** The elevation track of an uploaded GPX, for the review preview. */
export async function readUploadedTrack(gpxUrl: string) {
  "use cache";
  cacheTag(SUBMISSIONS_TAG);
  const xml = await readFile(path.join(process.cwd(), "public", gpxUrl), "utf8").catch(() => "");
  return xml ? parseGpx(xml) : null;
}
