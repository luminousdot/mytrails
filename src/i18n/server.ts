import "server-only";

import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Dictionary, type Locale } from ".";

/** The page's language from its params, with its dictionary; unknown languages are a 404. */
export async function pageLang(params: Promise<{ lang: string }>): Promise<{ lang: Locale; t: Dictionary }> {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return { lang, t: getDictionary(lang) };
}
