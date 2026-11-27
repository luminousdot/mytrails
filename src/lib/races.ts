import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import dataset from "../../data/races.json";
import { cacheTag } from "next/cache";
import { getPublished, ORGANIZER_PROFILES, PUBLISHED_TAG } from "./organizer";
import type { Race, RaceDataset } from "./types";

// The one place the app reads race data: the crawled demo dataset with races
// organisers published on top (theirs win, by race id). Swapping in a
// database means changing this function, not the screens.
export async function getRaces(): Promise<RaceDataset> {
  const data = dataset as RaceDataset;
  const published = await getPublished();
  const byId = new Map<string, Race>(data.races.map((r) => [r.id, r]));
  for (const race of published) byId.set(race.id, race);
  return {
    ...data,
    races: [...byId.values()].sort((a, b) => a.date_start.localeCompare(b.date_start)),
  };
}

/** A race as crawled, before any organiser edits; claims start from it. */
export async function getListedRace(raceId: string): Promise<Race | undefined> {
  return (dataset as RaceDataset).races.find((r) => r.id === raceId);
}

export async function getRace(slug: string) {
  const { races } = await getRaces();
  return races.find((r) => r.slug === slug) ?? null;
}

/** [km, metres] points along the race's GPX track, or null when it has none. */
export async function getProfile(raceId: string): Promise<[number, number][] | null> {
  "use cache";
  cacheTag(PUBLISHED_TAG);
  // An organiser's own track wins over the crawled one.
  for (const dir of [ORGANIZER_PROFILES, path.join(process.cwd(), "data", "profiles")]) {
    try {
      return JSON.parse(await readFile(path.join(dir, `${raceId}.json`), "utf8"));
    } catch {}
  }
  return null;
}
