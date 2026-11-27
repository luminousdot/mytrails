import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import dataset from "../../data/races.json";
import type { RaceDataset } from "./types";

// The one place the app reads race data. Today it is the crawler's JSON file;
// swapping in a database means changing this function, not the screens.
export async function getRaces(): Promise<RaceDataset> {
  const data = dataset as RaceDataset;
  return {
    ...data,
    races: [...data.races].sort((a, b) => a.date_start.localeCompare(b.date_start)),
  };
}

export async function getRace(slug: string) {
  const { races } = await getRaces();
  return races.find((r) => r.slug === slug) ?? null;
}

/** [km, metres] points along the race's GPX track, or null when it has none. */
export async function getProfile(raceId: string): Promise<[number, number][] | null> {
  try {
    const file = path.join(process.cwd(), "data", "profiles", `${raceId}.json`);
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return null;
  }
}
