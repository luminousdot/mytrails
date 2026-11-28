import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "../../resources/custom.css";

import { Column } from "@once-ui-system/core/components/Column";
import { Row } from "@once-ui-system/core/components/Row";
import { ThemeInit } from "@once-ui-system/core/components/ThemeInit";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist_Mono, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { Providers } from "../../components/Providers";
import { defaultLocale, getDictionary, hasLocale, intlLocale, locales } from "../../i18n";
import { I18nProvider } from "../../i18n/I18nProvider";
import { app } from "../../resources/app";
import { dataStyle, style } from "../../resources/once-ui.config";

// Once UI reads these four variables. A condensed grotesque for headings,
// Inter for reading, Geist Mono for numbers in code style.
// latin-ext carries č, ć, š, ž and đ for Serbian.
const heading = Bricolage_Grotesque({ variable: "--font-heading", subsets: ["latin", "latin-ext"], display: "swap" });
const body = Inter({ variable: "--font-body", subsets: ["latin", "latin-ext"], display: "swap" });
const label = Inter({ variable: "--font-label", subsets: ["latin", "latin-ext"], display: "swap" });
const code = Geist_Mono({ variable: "--font-code", subsets: ["latin"], display: "swap" });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// Static on purpose: routes with request-time params (review ids) can't prerender a
// layout whose metadata reads params. Pages set their own title and description.
export const metadata: Metadata = {
  title: { default: app.name, template: `%s · ${app.name}` },
  description: getDictionary(defaultLocale).meta.description,
};

// The root layout sits under [lang] so <html lang> and every page know the language.
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <Row
      as="html"
      lang={intlLocale[lang]}
      suppressHydrationWarning
      className={[heading.variable, body.variable, label.variable, code.variable].join(" ")}
    >
      <head>
        {/* Sets data-theme and the scheme before first paint. */}
        <ThemeInit config={style} dataStyle={dataStyle} />
      </head>
      <Providers>
        <I18nProvider lang={lang}>
          <Column as="body" background="page" fillWidth margin="0" padding="0" minHeight="100vh">
            {children}
          </Column>
        </I18nProvider>
      </Providers>
    </Row>
  );
}
