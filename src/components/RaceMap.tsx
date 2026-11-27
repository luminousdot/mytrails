"use client";

import { Column, Text } from "@once-ui-system/core";
import { Map as TrailMap, MapMarkers, MapPin } from "@once-ui-system/core/map";
import { useMemo } from "react";
import { buckets, formatDates, raceBucket } from "../lib/race-utils";
import { fill, localePath } from "../i18n";
import { useI18n } from "../i18n/I18nProvider";
import type { Race } from "../lib/types";
import { DistanceLegend } from "./DistanceLegend";

export function RaceMap({ races }: { races: Race[] }) {
  const { lang, t } = useI18n();
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
            clusterLabel={(n) => fill(t.map.cluster, { n })}
            renderItem={({ race }) => {
              const bucket = raceBucket(race);
              return (
                <MapPin
                  variant="dot"
                  tone={buckets[bucket].tone}
                  href={localePath(lang, `/races/${race.slug}`)}
                  aria-label={`${race.name}, ${formatDates(race, lang)}, ${t.buckets[bucket].label}`}
                />
              );
            }}
          />
        </TrailMap>
      </Column>
      <Column gap="8" paddingTop="4">
        <Text textVariant="body-default-s" onBackground="neutral-weak" marginX="4">
          {t.map.hint}
        </Text>
        <DistanceLegend />
      </Column>
    </Column>
  );
}
