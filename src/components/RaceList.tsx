"use client";

import { Button, Column, Row, Table, Tag, Text } from "@once-ui-system/core";
import { buckets, formatDates, formatGain, formatKm, longest, place, raceBucket } from "../lib/race-utils";
import type { Race } from "../lib/types";
import { useRouter } from "next/navigation";

export function RaceList({ races }: { races: Race[] }) {
  const router = useRouter();
  return (
    <Table
      aria-label="Races"
      paginated
      defaultPerPage={20}
      perPageOptions={[20, 50, 100]}
      columns={[
        { header: "Date", key: "date", sortable: true, width: "8rem" },
        { header: "Race", key: "race", sortable: true },
        { header: "Longest", key: "km", sortable: true, align: "right", hide: { s: true } },
        { header: "Climb", key: "gain", sortable: true, align: "right", hide: { s: true } },
        { header: "ITRA", key: "itra", sortable: true, align: "right", hide: { s: true } },
      ]}
      rows={races.map((race) => {
        const top = longest(race);
        const b = buckets[raceBucket(race)];
        return [
          <Text key="date" textVariant="label-default-s">
            {formatDates(race)}
          </Text>,
          <Column key="race" gap="4" paddingY="4">
            <Row>
              <Button variant="link" weight="strong" horizontal="start" style={{ paddingInline: 0 }} href={`/races/${race.slug}`}>
                {race.name}
              </Button>
            </Row>
            <Row gap="8" vertical="center" wrap>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {place(race)} · {race.distances.length} {race.distances.length === 1 ? "distance" : "distances"}
              </Text>
              <Tag size="s" tone={b.tone}>
                {b.label}
              </Tag>
            </Row>
          </Column>,
          formatKm(top?.distance_km),
          formatGain(top?.elevation_gain_m),
          race.itra_points ? `${race.itra_points} ${race.itra_points === 1 ? "pt" : "pts"}` : "–",
        ];
      })}
      actions={[
        {
          icon: "arrowUpRight",
          tooltip: "Race details",
          onClick: (_row, index) => router.push(`/races/${races[index].slug}`),
        },
      ]}
    />
  );
}
