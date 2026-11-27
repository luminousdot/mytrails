import { Column } from "@once-ui-system/core";
import { SectionBackdrop } from "../components/SectionBackdrop";
import { RaceHeader } from "../components/RaceHeader";
import { RaceExplorer } from "../components/RaceExplorer";
import { TopBar } from "../components/TopBar";
import { getRaces } from "../lib/races";
import { Suspense } from "react";
import Loading from "./loading";

export default async function Home() {
  const { races, series, crawled_at } = await getRaces();
  const photo = races.find((r) => r.cover?.source === "mountain-race")?.cover?.url;

  return (
    <>
      <TopBar />
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="24" paddingTop="32" paddingBottom="80">
        <Column maxWidth="l" gap="32">
          <Column as="section" overflow="hidden" radius="xl" border paddingX="32" paddingY="40" s={{ paddingX: "20", paddingY: "24" }}>
            <SectionBackdrop photo={photo} />
            <Column>
              <RaceHeader
                races={races}
                countries={new Set(races.map((r) => r.country)).size}
                crawledAt={crawled_at}
                photo={photo}
              />
            </Column>
          </Column>
          {/* The explorer reads ?series= from the address, which needs a Suspense boundary. */}
          <Suspense fallback={<Loading />}>
            <RaceExplorer races={races} series={series} />
          </Suspense>
        </Column>
      </Column>
    </>
  );
}
