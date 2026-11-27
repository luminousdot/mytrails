"use client";

import { Column } from "@once-ui-system/core";
import { Map as TrailMap, MapMarkers, MapPin } from "@once-ui-system/core/map";
import { buckets, raceBucket } from "../lib/race-utils";
import type { Race } from "../lib/types";

export function RaceLocationMap({ race }: { race: Race }) {
  const position: [number, number] = [race.lng, race.lat];
  return (
    <Column height="24rem" radius="l" border overflow="hidden">
      <TrailMap fill controls cooperativeGestures defaultViewport={{ center: position, zoom: 9 }}>
        <MapMarkers
          items={[{ id: race.id, position }]}
          renderItem={() => (
            <MapPin icon="flag" tone={buckets[raceBucket(race)].tone} aria-label={`${race.name} start area`} />
          )}
        />
      </TrailMap>
    </Column>
  );
}
