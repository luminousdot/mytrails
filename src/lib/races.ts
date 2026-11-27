import "server-only";

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
