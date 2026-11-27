import { Column } from "@once-ui-system/core";
import { RaceExplorer } from "../components/RaceExplorer";
import { TopBar } from "../components/TopBar";
import { getRaces } from "../lib/races";
import { Suspense } from "react";
import Loading from "./loading";

export default async function Home() {
  const { races, series, crawled_at } = await getRaces();

  return (
    <>
      <TopBar />
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="24" paddingTop="40" paddingBottom="80">
        {/* The explorer reads ?series= from the address, which needs a Suspense boundary. */}
        <Suspense fallback={<Loading />}>
          <RaceExplorer races={races} series={series} crawledAt={crawled_at} />
        </Suspense>
      </Column>
    </>
  );
}
