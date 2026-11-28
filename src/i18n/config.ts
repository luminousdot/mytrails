// Serbian first (PRODUCT.md: Serbia first), in Latin script; English for the region.
export const locales = ["sr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "sr";

export const hasLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v);

/** The BCP 47 tag for Intl: dates, numbers and plural rules. */
export const intlLocale: Record<Locale, string> = { sr: "sr-Latn-RS", en: "en-GB" };

/** "/races/x" → "/sr/races/x". External links and anchors pass through. */
export function localePath(lang: Locale, path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return `/${lang}${path === "/" ? "" : path}`;
}

/** The same page in another language. */
export function switchLocale(pathname: string, to: Locale): string {
  const rest = pathname.replace(/^\/(sr|en)(?=\/|$)/, "");
  return `/${to}${rest}`;
}

type PluralForms = { one: string; few?: string; other: string };

/** Serbian has three forms (1 trka, 2 trke, 5 trka); English two. "{n}" is replaced by the count. */
export function plural(lang: Locale, n: number, forms: PluralForms): string {
  const rule = new Intl.PluralRules(intlLocale[lang]).select(n);
  const form = rule === "one" ? forms.one : rule === "few" ? (forms.few ?? forms.other) : forms.other;
  return form.replace("{n}", new Intl.NumberFormat(intlLocale[lang]).format(n));
}
