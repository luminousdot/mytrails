"use client";

import { createContext, useContext } from "react";
import { getDictionary, type Dictionary, type Locale } from ".";

const I18nContext = createContext<{ lang: Locale; t: Dictionary } | null>(null);

/** Client components read the language and words from here; the dictionary is bundled, not passed as props. */
export function I18nProvider({ lang, children }: { lang: Locale; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ lang, t: getDictionary(lang) }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n needs an I18nProvider above it");
  return ctx;
}
