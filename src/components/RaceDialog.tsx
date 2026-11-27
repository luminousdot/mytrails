"use client";

import { Button, Column, Dialog, Grid, Row, Tag, Text } from "@once-ui-system/core";
import {
  bucketOf,
  buckets,
  daysUntil,
  formatDates,
  formatGain,
  formatKm,
  longest,
  place,
} from "../lib/race-utils";
import type { Race } from "../lib/types";

export function RaceDialog({ race, onClose }: { race: Race | null; onClose: () => void }) {
  const top = race ? longest(race) : undefined;
  const days = race ? daysUntil(race.date_start) : 0;

  return (
    <Dialog
      open={race !== null}
      onClose={onClose}
      title={race?.name ?? ""}
      description={race ? `${formatDates(race, true)} · ${place(race)}` : undefined}
      maxWidth="40rem"
      footer={
        race && (
          <Row gap="8" fillWidth horizontal="end" wrap>
            {race.itra_url && (
              <Button variant="secondary" suffixIcon="arrowUpRight" href={race.itra_url}>
                View on ITRA
              </Button>
            )}
            {race.registration_url && (
              <Button suffixIcon="arrowUpRight" href={race.registration_url}>
                Register
              </Button>
            )}
          </Row>
        )
      }
    >
      {race && (
        <Column gap="24">
          <Grid columns="3" gap="12" s={{ columns: "1" }}>
            <Stat label="Starts" value={days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`} />
            <Stat label="Longest" value={formatKm(top?.distance_km)} />
            <Stat label="Climb" value={formatGain(top?.elevation_gain_m)} />
          </Grid>

          <Column gap="8">
            <Text as="h3" textVariant="label-strong-s" onBackground="neutral-weak">
              Distances
            </Text>
            <Column as="ul" background="surface" border radius="l">
              {race.distances.map((d, i) => {
                const b = buckets[bucketOf(d.distance_km)];
                return (
                  <Row
                    as="li"
                    key={`${d.name}-${i}`}
                    borderTop={i > 0}
                    paddingX="16"
                    paddingY="12"
                    gap="12"
                    vertical="center"
                    horizontal="between"
                    s={{ direction: "column", vertical: "start" }}
                  >
                    <Column gap="4">
                      <Text textVariant="label-strong-m">{d.name ?? formatKm(d.distance_km)}</Text>
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        {formatKm(d.distance_km)} · {formatGain(d.elevation_gain_m)}
                        {d.time_limit_hours ? ` · ${d.time_limit_hours} h cut-off` : ""}
                      </Text>
                    </Column>
                    <Row gap="8" vertical="center">
                      <Tag size="s" tone={b.tone}>
                        {b.label}
                      </Tag>
                      {d.itra_points != null && d.itra_points > 0 && (
                        <Tag size="s" prefixIcon="medal">
                          {`${d.itra_points} ITRA`}
                        </Tag>
                      )}
                    </Row>
                  </Row>
                );
              })}
            </Column>
          </Column>

          {race.description && (
            <Text textVariant="body-default-m" onBackground="neutral-medium" wrap="pretty">
              {race.description}
            </Text>
          )}
        </Column>
      )}
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Column background="surface" border radius="l" padding="16" gap="4">
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text textVariant="heading-strong-m">{value}</Text>
    </Column>
  );
}
