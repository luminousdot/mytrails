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
  website?: string;
  /** A photo from ITRA or the race's own site; absent means the app draws a cover. */
  cover?: { url: string; source: "itra" | "website" | "mountain-race" };
  /** Race series the event belongs to, such as WST. */
  series?: { slug: string; title: string }[];
  /** Stats of the GPX track behind the elevation profile; the points are in data/profiles/<id>.json. */
  profile?: {
    distance_km: number;
    elevation_gain_m: number;
    elevation_loss_m: number;
    max_m: number;
    min_m: number;
    url: string;
    /** Which of the race's distances the track is, when it matches one. */
    distance_name?: string | null;
  };
  /** Where the data came from, organiser's own source first. */
  sources?: string[];
  distances: RaceDistance[];
  source: string;
};

export type RaceSeries = {
  slug: string;
  title: string;
  logo_url?: string;
  cover_url?: string;
  url: string;
};

export type RaceDataset = {
  crawled_at: string;
  sources: string[];
  series: RaceSeries[];
  races: Race[];
};

/** Distance buckets runners actually plan around. */
export type DistanceBucket = "short" | "marathon" | "long" | "ultra";

export type RaceFilters = {
  country: string; // "all" or a country name
  series: string; // "all" or a series slug
  distance: "all" | DistanceBucket;
  itraOnly: boolean;
  search: string;
};
