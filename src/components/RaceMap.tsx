"use client";

import { Column, Text } from "@once-ui-system/core";
import { Map as TrailMap, MapMarkers, MapPin } from "@once-ui-system/core/map";
import { useMemo } from "react";
import { buckets, formatDates, raceBucket } from "../lib/race-utils";
import type { Race } from "../lib/types";

export function RaceMap({ races }: { races: Race[] }) {
  // Once UI positions are [lng, lat].
  const items = useMemo(
    () => races.map((race) => ({ id: race.id, race, position: [race.lng, race.lat] as [number, number] })),
    [races],
  );

  return (
    <Column gap="8">
      <Column height="40rem" s={{ height: "28rem" }} radius="l" border overflow="hidden">
        <TrailMap
          fill
          controls
          cooperativeGestures
          bounds={items.map((i) => i.position)}
          boundsPadding={48}
          boundsMaxZoom={9}
          defaultViewport={{ center: [21, 43], zoom: 5 }}
        >
          <MapMarkers
            items={items}
            cluster
            clusterLabel={(n) => `${n} races, zoom in`}
            renderItem={({ race }) => {
              const b = buckets[raceBucket(race)];
              return (
                <MapPin
                  variant="dot"
                  tone={b.tone}
                  href={`/races/${race.slug}`}
                  aria-label={`${race.name}, ${formatDates(race)}, ${b.label}`}
                />
              );
            }}
          />
        </TrailMap>
      </Column>
      <Text textVariant="body-default-s" onBackground="neutral-weak">
        Pins are coloured by the longest distance at the event. Pick one to open the race.
      </Text>
    </Column>
  );
}
