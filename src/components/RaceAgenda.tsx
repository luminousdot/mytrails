"use client";

import { Button, Column, Heading, IconButton, Row, SmartLink, Tag, Text } from "@once-ui-system/core";
import { useMemo } from "react";
import { buckets, formatGain, formatKm, longest, place, raceBucket, seriesName, toDate } from "../lib/race-utils";
import type { Race } from "../lib/types";
import { DistanceLegend } from "./DistanceLegend";

const monthFmt = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
const weekdayFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short" });
const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric" });

const sameMonth = (d: Date, m: Date) => d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth();
const addMonths = (m: Date, n: number) => new Date(m.getFullYear(), m.getMonth() + n, 1);

/**
 * One month as a list of race days. Most months hold a handful of races, so a
 * full grid would be mostly empty squares; this keeps every start readable.
 */
export function RaceAgenda({
  races,
  month,
  onMonthChange,
}: {
  races: Race[];
  month: Date;
  onMonthChange: (month: Date) => void;
}) {
  const days = useMemo(() => {
    const byDay = new Map<string, Race[]>();
    for (const race of races) {
      if (!sameMonth(toDate(race.date_start), month)) continue;
      byDay.set(race.date_start, [...(byDay.get(race.date_start) ?? []), race]);
    }
    return [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [races, month]);

  const count = days.reduce((n, [, list]) => n + list.length, 0);
  const nextWithRaces = useMemo(() => {
    const later = races.map((r) => toDate(r.date_start)).filter((d) => d > addMonths(month, 1) || sameMonth(d, addMonths(month, 1)));
    const first = later.sort((a, b) => a.getTime() - b.getTime())[0];
    return first ? new Date(first.getFullYear(), first.getMonth(), 1) : null;
  }, [races, month]);

  return (
    <Column background="surface" border radius="l">
      <Row paddingX="20" paddingY="16" gap="12" vertical="center" horizontal="between" borderBottom>
        <Column gap="2">
          <Heading as="h2" textVariant="heading-strong-l">
            {monthFmt.format(month)}
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {count === 0 ? "No races" : count === 1 ? "1 race" : `${count} races`}
          </Text>
        </Column>
        <Row gap="4">
          <IconButton
            icon="chevronLeft"
            variant="secondary"
            tooltip="Previous month"
            aria-label="Previous month"
            onClick={() => onMonthChange(addMonths(month, -1))}
          />
          <IconButton
            icon="chevronRight"
            variant="secondary"
            tooltip="Next month"
            aria-label="Next month"
            onClick={() => onMonthChange(addMonths(month, 1))}
          />
        </Row>
      </Row>

      {days.length === 0 ? (
        <Column padding="32" gap="12" horizontal="center" align="center">
          <Text textVariant="body-default-m" onBackground="neutral-medium">
            No races match in {monthFmt.format(month)}.
          </Text>
          {nextWithRaces && (
            <Button variant="secondary" size="s" suffixIcon="chevronRight" onClick={() => onMonthChange(nextWithRaces)}>
              Jump to {monthFmt.format(nextWithRaces)}
            </Button>
          )}
        </Column>
      ) : (
        <Column as="ol">
          {days.map(([iso, list], i) => {
            const d = toDate(iso);
            return (
              <Row as="li" key={iso} borderTop={i > 0} paddingX="20" paddingY="16" gap="20" vertical="start">
                <Column width="48px" horizontal="center" gap="2" style={{ flexShrink: 0 }} data-tabular>
                  <Text textVariant="label-default-s" onBackground="neutral-weak">
                    {weekdayFmt.format(d)}
                  </Text>
                  <Text textVariant="heading-strong-l">{dayFmt.format(d)}</Text>
                </Column>
                <Column as="ul" flex={1} minWidth="0" gap="16">
                  {list.map((race) => (
                    <AgendaRace key={race.id} race={race} />
                  ))}
                </Column>
              </Row>
            );
          })}
        </Column>
      )}

      <Row paddingX="20" paddingY="12" borderTop>
        <DistanceLegend />
      </Row>
    </Column>
  );
}

function AgendaRace({ race }: { race: Race }) {
  const b = buckets[raceBucket(race)];
  const top = longest(race);
  return (
    <Column as="li" gap="4">
      <SmartLink href={`/races/${race.slug}`}>
        <Text textVariant="label-strong-m" onBackground="neutral-strong">
          {race.name}
        </Text>
      </SmartLink>
      <Row gap="8" vertical="center" wrap>
        <Text textVariant="body-default-s" onBackground="neutral-weak" data-tabular>
          {place(race)} · {formatKm(top?.distance_km)} · {formatGain(top?.elevation_gain_m)}
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
