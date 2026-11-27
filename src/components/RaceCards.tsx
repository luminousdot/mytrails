"use client";

import { Card, Column, Grid, Row, Tag, Text } from "@once-ui-system/core";
import { buckets, daysUntil, seriesName, formatGain, formatKm, longest, place, raceBucket, toDate } from "../lib/race-utils";
import type { Race } from "../lib/types";
import { RaceCover } from "./RaceCover";

const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric" });
const monthFmt = new Intl.DateTimeFormat("en-GB", { month: "short" });

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
  const top = longest(race);
  const b = buckets[raceBucket(race)];
  const start = toDate(race.date_start);
  const days = daysUntil(race.date_start);
  const others = race.distances.length - 1;

  return (
    <Card href={`/races/${race.slug}`} fillHeight direction="column" style={{ width: "100%", overflow: "hidden" }}>
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
              {dayFmt.format(start)}
            </Text>
            <Text textVariant="label-default-s" onBackground="brand-medium">
              {monthFmt.format(start)}
            </Text>
          </Column>
          <Column gap="4" flex={1} minWidth="0">
            <Text as="h3" textVariant="heading-strong-s" wrap="balance">
              {race.name}
            </Text>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {place(race)}
            </Text>
          </Column>
        </Row>

        <Row gap="24" vertical="end" marginTop="auto">
          <Column gap="2">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              Longest
            </Text>
            <Text textVariant="heading-strong-s">{formatKm(top?.distance_km)}</Text>
          </Column>
          <Column gap="2">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              Climb
            </Text>
            <Text textVariant="heading-strong-s">{formatGain(top?.elevation_gain_m)}</Text>
          </Column>
        </Row>

        <Row gap="8" wrap vertical="center" borderTop paddingTop="12">
          <Tag size="s" tone={b.tone}>
            {b.label}
          </Tag>
          {race.series?.map((s) => (
            <Tag key={s.slug} size="s" tone="brand" prefixIcon="flag">
              {seriesName(s.title).short}
            </Tag>
          ))}
          {race.itra_points ? (
            <Tag size="s" prefixIcon="medal">
              {`${race.itra_points} ITRA`}
            </Tag>
          ) : null}
          {others > 0 && (
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              +{others} shorter
            </Text>
          )}
          <Text textVariant="body-default-s" onBackground="neutral-weak" style={{ marginLeft: "auto" }}>
            {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`}
          </Text>
        </Row>
      </Column>
    </Card>
  );
}
