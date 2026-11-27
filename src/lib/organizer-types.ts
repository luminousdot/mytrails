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

export type DraftErrors = Partial<Record<string, string>>;

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

/** Checked in the form and again on the server. Keys are field paths. */
export function validate(
  race: RaceDraft,
  organizer: OrganizerContact,
  kind: Submission["kind"],
  claimNote: string,
): DraftErrors {
  const e: DraftErrors = {};
  if (!race.name.trim()) e.name = "Enter the race name.";
  if (!race.date_start) e.date_start = "Pick the race date.";
  if (race.date_end && race.date_start && race.date_end < race.date_start)
    e.date_end = "The last day can't be before the first.";
  if (!race.country.trim()) e.country = "Choose the country.";
  if (!race.city.trim()) e.city = "Enter the town or place of the start.";
  if (race.website && !isUrl(race.website)) e.website = "Enter a full link, starting with https://";
  if (race.registration_url && !isUrl(race.registration_url))
    e.registration_url = "Enter a full link, starting with https://";
  if (race.distances.length === 0) e.distances = "Add at least one distance.";
  race.distances.forEach((d, i) => {
    if (!d.distance_km || d.distance_km <= 0) e[`distances.${i}.distance_km`] = "Enter the distance in km.";
    if (d.elevation_gain_m != null && d.elevation_gain_m < 0) e[`distances.${i}.elevation_gain_m`] = "Climb can't be negative.";
    if (d.start_time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(d.start_time))
      e[`distances.${i}.start_time`] = "Use 24-hour time, like 07:30.";
    d.aid_stations.forEach((a, j) => {
      if (!a.name.trim()) e[`distances.${i}.aid.${j}.name`] = "Name the aid station.";
      if (a.km == null || a.km < 0 || (d.distance_km != null && a.km > d.distance_km))
        e[`distances.${i}.aid.${j}.km`] = "Km must be on the course.";
    });
  });
  if (!organizer.name.trim()) e["organizer.name"] = "Enter your name.";
  if (!/^\S+@\S+\.\S+$/.test(organizer.email)) e["organizer.email"] = "Enter an email we can reach you at.";
  if (kind === "claim" && !claimNote.trim())
    e.claim_note = "Tell us how we can confirm you organise this race.";
  return e;
}
