"use client";

import {BucketTag, SeriesTag } from "./RaceTags";
import { Column, Row, SmartLink, Table, Text } from "@once-ui-system/core";
import { formatDates, formatGain, formatKm, longest, place, raceBucket } from "../lib/race-utils";
import { localePath, plural } from "../i18n";
import { useI18n } from "../i18n/I18nProvider";
import type { Race } from "../lib/types";

// Rows are the races themselves, so each column sorts on the real value
// (date, km, metres) rather than on the formatted text in the cell.
const byNumber = (pick: (r: Race) => number | undefined) => (a: Race, b: Race) =>
  (pick(a) ?? -1) - (pick(b) ?? -1);

export function RaceList({ races }: { races: Race[] }) {
  const { lang, t } = useI18n();
  return (
    <Table<Race>
      aria-label={t.list.label}
      labels={{
        pagination: t.table.pagination,
        previous: t.table.previous,
        next: t.table.next,
        first: t.table.first,
        last: t.table.last,
        perPage: t.table.perPage,
        noResults: t.table.noResults,
        noResultsHint: t.table.noResultsHint,
        results: (n) => plural(lang, n, t.table.results),
      }}
      paginated
      defaultPerPage={20}
      perPageOptions={[20, 50, 100]}
      getRowId={(race) => race.id}
      rows={races}
      columns={[
        {
          header: t.list.date,
          key: "date",
          width: "9rem",
          sortable: true,
          sort: (a, b) => a.date_start.localeCompare(b.date_start),
          hide: { s: true },
          cell: (race) => <Text textVariant="label-default-s">{formatDates(race, lang, false, true)}</Text>,
        },
        {
          header: t.list.race,
          key: "race",
          sortable: true,
          sort: (a, b) => a.name.localeCompare(b.name),
          cell: (race) => <RaceCell race={race} />,
        },
        {
          header: t.list.longest,
          key: "km",
          align: "right",
          sortable: true,
          sort: byNumber((r) => longest(r)?.distance_km),
          hide: { s: true },
          cell: (race) => formatKm(longest(race)?.distance_km, lang),
        },
        {
          header: t.list.climb,
          key: "gain",
          align: "right",
          sortable: true,
          sort: byNumber((r) => longest(r)?.elevation_gain_m),
          hide: { s: true },
          cell: (race) => formatGain(longest(race)?.elevation_gain_m, lang),
        },
        {
          header: t.list.itra,
          key: "itra",
          align: "right",
          sortable: true,
          sort: byNumber((r) => r.itra_points),
          hide: { s: true },
          cell: (race) => (race.itra_points ? plural(lang, race.itra_points, t.common.pt) : "–"),
        },
      ]}
    />
  );
}

function RaceCell({ race }: { race: Race }) {
  const { lang, t } = useI18n();
  const bucket = raceBucket(race);
  const top = longest(race);
  return (
    <Column gap="4" paddingY="4">
      {/* On phones the date and number columns are hidden, so the date and distance join this cell. */}
      <Row hide s={{ hide: false }}>
        <Text textVariant="label-default-s" onBackground="brand-medium">
          {formatDates(race, lang, false, true)} · {formatKm(top?.distance_km, lang)}
        </Text>
      </Row>
      <SmartLink href={localePath(lang, `/races/${race.slug}`)}>
        <Text textVariant="label-strong-m" onBackground="neutral-strong">
          {race.name}
        </Text>
      </SmartLink>
      <Row gap="8" vertical="center" wrap>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          {place(race, lang)} · {plural(lang, race.distances.length, t.common.distances)}
        </Text>
        <BucketTag bucket={bucket} />
        {race.series?.map((s) => (
          <SeriesTag key={s.slug} title={s.title} />
        ))}
      </Row>
    </Column>
  );
}
