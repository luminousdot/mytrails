import { en, type Dictionary } from "./en";
import { sr } from "./sr";
import type { Locale } from "./config";

export * from "./config";
export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { sr, en };

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}

/** "{n} races" with {n} and other placeholders filled in. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));
}
