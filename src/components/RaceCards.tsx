"use client";

import {BucketTag, ItraTag, SeriesTag } from "./RaceTags";
import { Card, Column, Grid, Row, Text } from "@once-ui-system/core";
import { daysUntil, formatDate, formatGain, formatKm, longest, place, raceBucket, toDate } from "../lib/race-utils";
import { fill, localePath } from "../i18n";
import { useI18n } from "../i18n/I18nProvider";
import { startsIn } from "../i18n/words";
import type { Race } from "../lib/types";
import { Hint } from "./Hint";
import { RaceCover } from "./RaceCover";


export function RaceCards({ races }: { races: Race[] }) {
  return (
    <Grid as="ul" columns="3" gap="16" m={{ columns: "2" }} s={{ columns: "1" }}>
      {races.map((race) => (
        <Column as="li" key={race.id} fillWidth>
          <RaceCard race={race} />
        </Column>
      ))}
    </Grid>
  );
}

function RaceCard({ race }: { race: Race }) {
  const { lang, t } = useI18n();
  const top = longest(race);
  const bucket = raceBucket(race);
  const start = toDate(race.date_start);
  const days = daysUntil(race.date_start);
  const others = race.distances.length - 1;

  return (
    <Card href={localePath(lang, `/races/${race.slug}`)} fillHeight direction="column" style={{ width: "100%", overflow: "hidden" }}>
      <Column fillWidth height="160px">
        <RaceCover race={race} />
      </Column>
      <Column fillWidth flex={1} padding="20" gap="16">
        <Row gap="16" vertical="start">
          <Column
            width="56px"
            paddingY="8"
            radius="m"
            background="brand-alpha-weak"
            horizontal="center"
            gap="2"
            aria-hidden
          >
            <Text textVariant="heading-strong-l" onBackground="brand-strong">
              {formatDate(lang, start, { day: "numeric" })}
            </Text>
            <Text textVariant="label-default-s" onBackground="brand-medium">
              {formatDate(lang, start, { month: "short" })}
            </Text>
            {start.getFullYear() !== new Date().getFullYear() && (
              <Text textVariant="label-default-xs" onBackground="brand-medium">
                {start.getFullYear()}
              </Text>
            )}
          </Column>
          <Column gap="4" flex={1} minWidth="0">
            <Text as="h3" textVariant="heading-strong-s" wrap="balance">
              {race.name}
            </Text>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {place(race, lang)}
            </Text>
          </Column>
        </Row>

        <Row gap="24" vertical="end" marginTop="auto">
          <Column gap="2">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {t.common.longest}
            </Text>
            <Text textVariant="heading-strong-s">{formatKm(top?.distance_km, lang)}</Text>
          </Column>
          <Column gap="2">
            <Hint text={t.hints.climb}>
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                {t.common.climb}
              </Text>
            </Hint>
            <Text textVariant="heading-strong-s">{formatGain(top?.elevation_gain_m, lang)}</Text>
          </Column>
        </Row>

        <Row gap="8" wrap vertical="center" borderTop paddingTop="12">
          <BucketTag bucket={bucket} />
          {race.series?.map((s) => (
            <SeriesTag key={s.slug} title={s.title} />
          ))}
          {race.itra_points ? (
            <ItraTag points={race.itra_points} />
          ) : null}
          {others > 0 && (
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {fill(t.common.shorter, { n: others })}
            </Text>
          )}
          <Text textVariant="body-default-s" onBackground="neutral-weak" style={{ marginLeft: "auto" }}>
            {startsIn(lang, days)}
          </Text>
        </Row>
      </Column>
    </Card>
  );
}
