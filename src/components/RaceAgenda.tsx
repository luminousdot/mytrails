"use client";

import {BucketTag, SeriesTag } from "./RaceTags";
import { Button, Column, Heading, IconButton, Row, SmartLink, Text } from "@once-ui-system/core";
import { useMemo } from "react";
import { formatDate, formatGain, formatKm, longest, place, raceBucket, toDate } from "../lib/race-utils";
import { fill, localePath, plural, type Locale } from "../i18n";
import { useI18n } from "../i18n/I18nProvider";
import type { Race } from "../lib/types";
import { DistanceLegend } from "./DistanceLegend";

// Serbian month names are lower case ("mart 2027."); a heading starts with a capital.
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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
  const { lang, t } = useI18n();
  const monthLabel = (m: Date) => cap(formatDate(lang, m, { month: "long", year: "numeric" }));
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
            {monthLabel(month)}
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {count === 0 ? t.agenda.none : plural(lang, count, t.common.races)}
          </Text>
        </Column>
        <Row gap="4">
          <IconButton
            icon="chevronLeft"
            variant="secondary"
            tooltip={t.agenda.previous}
            aria-label={t.agenda.previous}
            onClick={() => onMonthChange(addMonths(month, -1))}
          />
          <IconButton
            icon="chevronRight"
            variant="secondary"
            tooltip={t.agenda.next}
            aria-label={t.agenda.next}
            onClick={() => onMonthChange(addMonths(month, 1))}
          />
        </Row>
      </Row>

      {days.length === 0 ? (
        <Column padding="32" gap="12" horizontal="center" align="center">
          <Text textVariant="body-default-m" onBackground="neutral-medium">
            {fill(t.agenda.empty, { month: monthLabel(month) })}
          </Text>
          {nextWithRaces && (
            <Button variant="secondary" size="s" suffixIcon="chevronRight" onClick={() => onMonthChange(nextWithRaces)}>
              {fill(t.agenda.jump, { month: monthLabel(nextWithRaces) })}
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
                    {formatDate(lang, d, { weekday: "short" })}
                  </Text>
                  <Text textVariant="heading-strong-l">{formatDate(lang, d, { day: "numeric" })}</Text>
                </Column>
                <Column as="ul" flex={1} minWidth="0" gap="16">
                  {list.map((race) => (
                    <AgendaRace key={race.id} race={race} lang={lang} />
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

function AgendaRace({ race, lang }: { race: Race; lang: Locale }) {
  const bucket = raceBucket(race);
  const top = longest(race);
  return (
    <Column as="li" gap="4">
      <SmartLink href={localePath(lang, `/races/${race.slug}`)}>
        <Text textVariant="label-strong-m" onBackground="neutral-strong">
          {race.name}
        </Text>
      </SmartLink>
      <Row gap="8" vertical="center" wrap>
        <Text textVariant="body-default-s" onBackground="neutral-weak" data-tabular>
          {place(race, lang)} · {formatKm(top?.distance_km, lang)} · {formatGain(top?.elevation_gain_m, lang)}
        </Text>
        <BucketTag bucket={bucket} />
        {race.series?.map((s) => (
          <SeriesTag key={s.slug} title={s.title} />
        ))}
      </Row>
    </Column>
  );
}
