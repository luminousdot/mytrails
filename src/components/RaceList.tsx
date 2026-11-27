"use client";

import { Column, Row, SmartLink, Table, Tag, Text } from "@once-ui-system/core";
import { buckets, formatDates, formatGain, formatKm, longest, place, raceBucket, seriesName } from "../lib/race-utils";
import type { Race } from "../lib/types";

// Rows are the races themselves, so each column sorts on the real value
// (date, km, metres) rather than on the formatted text in the cell.
const byNumber = (pick: (r: Race) => number | undefined) => (a: Race, b: Race) =>
  (pick(a) ?? -1) - (pick(b) ?? -1);

export function RaceList({ races }: { races: Race[] }) {
  return (
    <Table<Race>
      aria-label="Races"
      paginated
      defaultPerPage={20}
      perPageOptions={[20, 50, 100]}
      getRowId={(race) => race.id}
      rows={races}
      columns={[
        {
          header: "Date",
          key: "date",
          width: "9rem",
          sortable: true,
          sort: (a, b) => a.date_start.localeCompare(b.date_start),
          hide: { s: true },
          cell: (race) => <Text textVariant="label-default-s">{formatDates(race, false, true)}</Text>,
        },
        {
          header: "Race",
          key: "race",
          sortable: true,
          sort: (a, b) => a.name.localeCompare(b.name),
          cell: (race) => <RaceCell race={race} />,
        },
        {
          header: "Longest",
          key: "km",
          align: "right",
          sortable: true,
          sort: byNumber((r) => longest(r)?.distance_km),
          hide: { s: true },
          cell: (race) => formatKm(longest(race)?.distance_km),
        },
        {
          header: "Climb",
          key: "gain",
          align: "right",
          sortable: true,
          sort: byNumber((r) => longest(r)?.elevation_gain_m),
          hide: { s: true },
          cell: (race) => formatGain(longest(race)?.elevation_gain_m),
        },
        {
          header: "ITRA",
          key: "itra",
          align: "right",
          sortable: true,
          sort: byNumber((r) => r.itra_points),
          hide: { s: true },
          cell: (race) => (race.itra_points ? `${race.itra_points} ${race.itra_points === 1 ? "pt" : "pts"}` : "–"),
        },
      ]}
    />
  );
}

function RaceCell({ race }: { race: Race }) {
  const b = buckets[raceBucket(race)];
  const top = longest(race);
  return (
    <Column gap="4" paddingY="4">
      {/* On phones the date and number columns are hidden, so the date and distance join this cell. */}
      <Row hide s={{ hide: false }}>
        <Text textVariant="label-default-s" onBackground="brand-medium">
          {formatDates(race, false, true)} · {formatKm(top?.distance_km)}
        </Text>
      </Row>
      <SmartLink href={`/races/${race.slug}`}>
        <Text textVariant="label-strong-m" onBackground="neutral-strong">
          {race.name}
        </Text>
      </SmartLink>
      <Row gap="8" vertical="center" wrap>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          {place(race)} · {race.distances.length} {race.distances.length === 1 ? "distance" : "distances"}
        </Text>
        <Tag size="s" tone={b.tone}>
          {b.label}
        </Tag>
        {race.series?.map((s) => (
          <Tag key={s.slug} size="s" tone="brand" prefixIcon="flag">
            {seriesName(s.title).short}
          </Tag>
        ))}
      </Row>
    </Column>
  );
}
