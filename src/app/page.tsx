import { Column } from "@once-ui-system/core";
import { RaceExplorer } from "../components/RaceExplorer";
import { TopBar } from "../components/TopBar";
import { getRaces } from "../lib/races";

export default async function Home() {
  const { races, crawled_at } = await getRaces();

  return (
    <>
      <TopBar />
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="24" paddingTop="40" paddingBottom="80">
        <RaceExplorer races={races} crawledAt={crawled_at} />
      </Column>
    </>
  );
}
