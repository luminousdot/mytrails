// What organisers submit, shared by the form (client) and the store (server).

export type DraftDistance = {
  name: string;
  distance_km: number | null;
  elevation_gain_m: number | null;
  time_limit_hours: number | null;
  start_time: string;
  aid_stations: { name: string; km: number | null }[];
  /** Set by the server once the GPX upload is stored. */
  gpx_url?: string;
};

export type RaceDraft = {
  name: string;
  date_start: string; // YYYY-MM-DD
  date_end: string; // "" when one day
  country: string;
  city: string;
  /** [lng, lat] picked on the map; looked up from the town when missing. */
  position: [number, number] | null;
  website: string;
  registration_url: string;
  description: string;
  distances: DraftDistance[];
  /** Set by the server once photo uploads are stored. */
  photos?: string[];
};

export type OrganizerContact = {
  name: string;
  email: string;
  role: "director" | "team" | "other";
};

export type SubmissionStatus = "pending" | "approved" | "rejected";

export type Submission = {
  id: string; // short reference shown to the organiser, e.g. MT-4K7Q
  kind: "new" | "claim";
  /** The listed race a claim is for. */
  claim?: { raceId: string; slug: string; name: string };
  status: SubmissionStatus;
  submitted_at: string; // ISO
  reviewed_at?: string;
  review_note?: string;
  /** How a claimant shows they organise the race. */
  claim_note?: string;
  organizer: OrganizerContact;
  race: RaceDraft;
  /** Slug the race was published under. */
  published_slug?: string;
};

import type { Dictionary } from "../i18n";

/** Field path → error code; the form shows t.errors[code] in the visitor's language. */
export type ErrorCode = keyof Dictionary["errors"];
export type DraftErrors = Partial<Record<string, ErrorCode>>;

export const emptyDistance = (): DraftDistance => ({
  name: "",
  distance_km: null,
  elevation_gain_m: null,
  time_limit_hours: null,
  start_time: "",
  aid_stations: [],
});

export const emptyDraft = (): RaceDraft => ({
  name: "",
  date_start: "",
  date_end: "",
  country: "Serbia",
  city: "",
  position: null,
  website: "",
  registration_url: "",
  description: "",
  distances: [emptyDistance()],
});

const isUrl = (s: string) => /^https?:\/\/\S+\.\S+/.test(s);

/** Checked in the form and again on the server. Keys are field paths, values error codes. */
export function validate(
  race: RaceDraft,
  organizer: OrganizerContact,
  kind: Submission["kind"],
  claimNote: string,
): DraftErrors {
  const e: DraftErrors = {};
  if (!race.name.trim()) e.name = "name";
  if (!race.date_start) e.date_start = "date_start";
  if (race.date_end && race.date_start && race.date_end < race.date_start)
    e.date_end = "date_end";
  if (!race.country.trim()) e.country = "country";
  if (!race.city.trim()) e.city = "city";
  if (race.website && !isUrl(race.website)) e.website = "url";
  if (race.registration_url && !isUrl(race.registration_url))
    e.registration_url = "url";
  if (race.distances.length === 0) e.distances = "distances";
  race.distances.forEach((d, i) => {
    if (!d.distance_km || d.distance_km <= 0) e[`distances.${i}.distance_km`] = "distance_km";
    if (d.elevation_gain_m != null && d.elevation_gain_m < 0) e[`distances.${i}.elevation_gain_m`] = "elevation_gain_m";
    if (d.start_time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(d.start_time))
      e[`distances.${i}.start_time`] = "start_time";
    d.aid_stations.forEach((a, j) => {
      if (!a.name.trim()) e[`distances.${i}.aid.${j}.name`] = "aidName";
      if (a.km == null || a.km < 0 || (d.distance_km != null && a.km > d.distance_km))
        e[`distances.${i}.aid.${j}.km`] = "aidKm";
    });
  });
  if (!organizer.name.trim()) e["organizer.name"] = "organizerName";
  if (!/^\S+@\S+\.\S+$/.test(organizer.email)) e["organizer.email"] = "organizerEmail";
  if (kind === "claim" && !claimNote.trim())
    e.claim_note = "claimNote";
  return e;
}
