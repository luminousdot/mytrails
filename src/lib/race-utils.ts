import { getDictionary, intlLocale, type Locale } from "../i18n";
import type { DistanceBucket, Race, RaceFilters } from "./types";

type Tone = "neutral" | "brand" | "accent" | "info" | "success" | "warning" | "danger";

/** Distance buckets and their fixed colours; the words are in the dictionaries (t.buckets). */
export const buckets: Record<DistanceBucket, { tone: Tone }> = {
  short: { tone: "success" },
  marathon: { tone: "accent" },
  long: { tone: "warning" },
  ultra: { tone: "danger" },
};

export const bucketKeys = Object.keys(buckets) as DistanceBucket[];

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

/** Lower-case without accents, so "divca" finds "Divča" and "djerdap" finds "Đerdap". */
export function fold(s: string): string {
  return s.toLowerCase().replace(/đ/g, "dj").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function matches(race: Race, f: RaceFilters): boolean {
  if (f.country !== "all" && race.country !== f.country) return false;
  if (f.series !== "all" && !race.series?.some((s) => s.slug === f.series)) return false;
  if (f.itraOnly && !race.itra_points) return false;
  if (f.distance !== "all" && !race.distances.some((d) => bucketOf(d.distance_km) === f.distance)) {
    return false;
  }
  if (f.search) {
    const q = fold(f.search);
    const hay = fold(`${race.name} ${race.city ?? ""} ${race.country}`);
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

const formats = new Map<string, Intl.DateTimeFormat>();
function dateFmt(lang: Locale, kind: "day" | "full" | "dayYear"): Intl.DateTimeFormat {
  const key = `${lang}:${kind}`;
  if (!formats.has(key)) {
    const opts: Intl.DateTimeFormatOptions =
      kind === "full"
        ? { weekday: "short", day: "numeric", month: "long", year: "numeric" }
        : kind === "dayYear"
          ? { day: "numeric", month: "short", year: "numeric" }
          : { day: "numeric", month: "short" };
    formats.set(key, new Intl.DateTimeFormat(intlLocale[lang], opts));
  }
  return formats.get(key)!;
}

/** A date in the given language with the given Intl options (months, weekdays…). */
export function formatDate(lang: Locale, date: Date, opts: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(intlLocale[lang], opts).format(date);
}

/**
 * "28 Nov" / "28. nov", or with `withYear` "7 Mar 2027" when the race is not
 * this year (the calendar runs a year ahead, so a bare "7 Mar" is ambiguous).
 */
export function formatDates(race: Race, lang: Locale, full = false, withYear: boolean | "always" = false): string {
  const start = toDate(race.date_start);
  const end = race.date_end ? toDate(race.date_end) : null;
  // "always" needs no clock, so server components can prerender with it.
  const otherYear =
    !full && (withYear === "always" || (withYear && (end ?? start).getFullYear() !== new Date().getFullYear()));
  const last = full ? dateFmt(lang, "full") : otherYear ? dateFmt(lang, "dayYear") : dateFmt(lang, "day");
  if (!end) return last.format(start);
  return `${dateFmt(lang, "day").format(start)} – ${last.format(end)}`;
}

export function formatNumber(n: number, lang: Locale, digits = 0): string {
  return new Intl.NumberFormat(intlLocale[lang], { maximumFractionDigits: digits }).format(n);
}

export function formatKm(km: number | undefined, lang: Locale): string {
  if (km == null) return "–";
  return `${formatNumber(km, lang, 1)} km`;
}

export function formatGain(m: number | undefined, lang: Locale): string {
  if (m == null) return "–";
  return `${formatNumber(m, lang)} m D+`;
}

export function countryName(country: string, lang: Locale): string {
  return getDictionary(lang).countries[country] ?? country;
}

export function place(race: Race, lang: Locale): string {
  // ITRA sometimes puts a full street address in the city field.
  const city = race.city && race.city.length < 30 ? race.city : undefined;
  const country = countryName(race.country, lang);
  return city ? `${city}, ${country}` : country;
}

export function daysUntil(iso: string, now = new Date()): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((toDate(iso).getTime() - today.getTime()) / 86_400_000);
}

/** "WST | West Serbia Trail Series" → { short: "WST", long: "West Serbia Trail Series" } */
export function seriesName(title: string) {
  const [short, ...rest] = title.split("|").map((p) => p.trim());
  return { short, long: rest.join(" ") || short };
}
