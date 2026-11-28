import { fill, getDictionary, plural, type Locale } from ".";

// Phrases built from the dictionaries, shared by server and client components.

export function startsIn(lang: Locale, days: number): string {
  const t = getDictionary(lang).common;
  if (days === 0) return t.today;
  if (days === 1) return t.tomorrow;
  if (days < 0) return t.finished;
  return plural(lang, days, t.inDays);
}

export function count(lang: Locale, n: number, forms: { one: string; few?: string; other: string }): string {
  return plural(lang, n, forms);
}

export { fill };
