import type { DistanceBucket, Race, RaceFilters } from "./types";

type Tone = "neutral" | "brand" | "accent" | "info" | "success" | "warning" | "danger";

export const buckets: Record<DistanceBucket, { label: string; range: string; tone: Tone }> = {
  short: { label: "Short", range: "under 21 km", tone: "success" },
  marathon: { label: "Marathon", range: "21–44 km", tone: "accent" },
  long: { label: "Long", range: "45–79 km", tone: "warning" },
  ultra: { label: "Ultra", range: "80 km+", tone: "danger" },
};

export function longest(race: Race) {
  return race.distances[0];
}

export function bucketOf(km?: number): DistanceBucket {
  if (!km || km < 21) return "short";
  if (km < 45) return "marathon";
  if (km < 80) return "long";
  return "ultra";
}

export function raceBucket(race: Race): DistanceBucket {
  return bucketOf(longest(race)?.distance_km);
}

export function matches(race: Race, f: RaceFilters): boolean {
  if (f.country !== "all" && race.country !== f.country) return false;
  if (f.itraOnly && !race.itra_points) return false;
  if (f.distance !== "all" && !race.distances.some((d) => bucketOf(d.distance_km) === f.distance)) {
    return false;
  }
  if (f.search) {
    const q = f.search.toLowerCase();
    const hay = `${race.name} ${race.city ?? ""} ${race.country}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

// Dates are calendar days, not instants: parse them as local midnight so a race
// never slides to the previous day west of UTC.
export function toDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const fullFmt = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDates(race: Race, full = false): string {
  const fmt = full ? fullFmt : dayFmt;
  const start = fmt.format(toDate(race.date_start));
  if (!race.date_end) return start;
  return `${dayFmt.format(toDate(race.date_start))} – ${fmt.format(toDate(race.date_end))}`;
}

export function formatKm(km?: number): string {
  if (km == null) return "–";
  return `${Number.isInteger(km) ? km : km.toFixed(1)} km`;
}

export function formatGain(m?: number): string {
  if (m == null) return "–";
  return `${m.toLocaleString("en-GB")} m D+`;
}

export function place(race: Race): string {
  // ITRA sometimes puts a full street address in the city field.
  const city = race.city && race.city.length < 30 ? race.city : undefined;
  return city ? `${city}, ${race.country}` : race.country;
}

export function daysUntil(iso: string, now = new Date()): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((toDate(iso).getTime() - today.getTime()) / 86_400_000);
}
