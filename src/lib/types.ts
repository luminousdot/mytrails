// Shape of data/races.json, written by crawler/itra_crawl.py.

export type RaceDistance = {
  name?: string;
  distance_km?: number;
  elevation_gain_m?: number;
  itra_points?: number;
  time_limit_hours?: number;
  url?: string;
};

export type Race = {
  id: string;
  slug: string;
  name: string;
  country: string;
  country_code?: string;
  city?: string;
  date_start: string; // YYYY-MM-DD
  date_end?: string;
  lat: number;
  lng: number;
  registration_url?: string;
  itra_url?: string;
  itra_points?: number;
  description?: string;
  distances: RaceDistance[];
  source: string;
};

export type RaceDataset = {
  crawled_at: string;
  source: string;
  races: Race[];
};

/** Distance buckets runners actually plan around. */
export type DistanceBucket = "short" | "marathon" | "long" | "ultra";

export type RaceFilters = {
  country: string; // "all" or a country name
  distance: "all" | DistanceBucket;
  itraOnly: boolean;
  search: string;
};
