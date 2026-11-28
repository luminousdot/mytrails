import { Column } from "@once-ui-system/core";
import { RaceHeader } from "../../components/RaceHeader";
import { RaceExplorer } from "../../components/RaceExplorer";
import { TopBar } from "../../components/TopBar";
import { getRaces } from "../../lib/races";
import { Suspense } from "react";
import Loading from "./loading";
import type { Metadata } from "next";
import { intlLocale, locales } from "../../i18n";
import { pageLang } from "../../i18n/server";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { t } = await pageLang(params);
  return {
    description: t.meta.description,
    alternates: { languages: Object.fromEntries(locales.map((l) => [intlLocale[l], `/${l}`])) },
  };
}

export default async function Home() {
  const { races, series, crawled_at } = await getRaces();
  // mountain-race.rs serves resized copies; 1600px is plenty for a faded backdrop.
  const photo = races
    .find((r) => r.cover?.source === "mountain-race")
    ?.cover?.url.replace("/storage/races/", "/img/1600/races/");

  return (
    <>
      <TopBar />
      <RaceHeader
        races={races}
        countries={new Set(races.map((r) => r.country)).size}
        crawledAt={crawled_at}
        photo={photo}
      />
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="24" paddingTop="32" paddingBottom="80">
        <Column maxWidth="l" gap="32">
          {/* The explorer reads ?series= from the address, which needs a Suspense boundary. */}
          <Suspense fallback={<Loading />}>
            <RaceExplorer races={races} series={series} />
          </Suspense>
        </Column>
      </Column>
    </>
  );
}
