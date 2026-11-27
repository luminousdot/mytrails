import { Breadcrumbs, Button, Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RaceCards } from "../../../components/RaceCards";
import { RaceCover } from "../../../components/RaceCover";
import { StartsIn } from "../../../components/StartsIn";
import { RaceLocationMap } from "../../../components/RaceLocationMap";
import { TopBar } from "../../../components/TopBar";
import {
  bucketOf,
  buckets,
  formatDates,
  formatGain,
  formatKm,
  longest,
  place,
  seriesName,
  toDate,
} from "../../../lib/race-utils";
import { getRace, getRaces } from "../../../lib/races";

export async function generateStaticParams() {
  const { races } = await getRaces();
  return races.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const race = await getRace((await params).slug);
  if (!race) return {};
  return { title: race.name, description: `${formatDates(race, true)} · ${place(race)}` };
}

export default async function RacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const race = await getRace(slug);
  if (!race) notFound();

  const { races, series } = await getRaces();
  const raceSeries = (race.series ?? []).map((rs) => series.find((s) => s.slug === rs.slug) ?? { ...rs, url: "" });
  const top = longest(race);
  const start = toDate(race.date_start);
  const sameMonth = races
    .filter((r) => {
      const d = toDate(r.date_start);
      return r.id !== race.id && d.getFullYear() === start.getFullYear() && d.getMonth() === start.getMonth();
    })
    .slice(0, 3);

  return (
    <>
      <TopBar />
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="24" paddingTop="32" paddingBottom="80">
        <Column maxWidth="l" gap="40">
          <Breadcrumbs
            items={[
              { label: "All races", href: "/", prefixIcon: "chevronLeft" },
              { label: race.country },
              { label: race.name },
            ]}
          />

          <Row gap="24" vertical="end" horizontal="between" s={{ direction: "column", horizontal: "start" }}>
            <Column gap="12">
              <Text textVariant="label-default-s" onBackground="brand-medium">
                {formatDates(race, true)} · {place(race)}
              </Text>
              <Heading as="h1" textVariant="display-strong-s" wrap="balance">
                {race.name}
              </Heading>
            </Column>
            <Row gap="8" wrap>
              {race.itra_url && (
                <Button variant="secondary" suffixIcon="arrowUpRight" href={race.itra_url}>
                  View on ITRA
                </Button>
              )}
              {race.website && race.website !== race.registration_url && (
                <Button variant="secondary" suffixIcon="arrowUpRight" href={race.website}>
                  Race website
                </Button>
              )}
              {race.registration_url && (
                <Button suffixIcon="arrowUpRight" href={race.registration_url}>
                  Register
                </Button>
              )}
            </Row>
          </Row>

          <Column radius="l" border overflow="hidden" height="22rem" s={{ height: "14rem" }}>
            <RaceCover race={race} />
          </Column>

          {raceSeries.map((s) => (
            <Row
              key={s.slug}
              background="brand-alpha-weak"
              border="brand-alpha-medium"
              radius="l"
              paddingX="20"
              paddingY="16"
              gap="16"
              vertical="center"
              horizontal="between"
              s={{ direction: "column", horizontal: "start" }}
            >
              <Column gap="4">
                <Text textVariant="label-default-s" onBackground="brand-medium">
                  Part of a race series
                </Text>
                <Text textVariant="heading-strong-m">
                  {seriesName(s.title).short} · {seriesName(s.title).long}
                </Text>
              </Column>
              <Row gap="8" wrap>
                <Button variant="secondary" size="s" href={`/?series=${s.slug}`} prefixIcon="list">
                  All {seriesName(s.title).short} races
                </Button>
                {s.url && (
                  <Button variant="tertiary" size="s" suffixIcon="arrowUpRight" href={s.url}>
                    Series on mountain-race.rs
                  </Button>
                )}
              </Row>
            </Row>
          ))}

          <Grid columns="4" gap="12" m={{ columns: "2" }}>
            <Stat label="Starts" value={<StartsIn date={race.date_start} />} />
            <Stat label="Longest distance" value={formatKm(top?.distance_km)} />
            <Stat label="Climb" value={formatGain(top?.elevation_gain_m)} />
            <Stat label="ITRA points" value={race.itra_points ? String(race.itra_points) : "–"} />
          </Grid>

          <Grid columns="2" gap="32" m={{ columns: "1" }}>
            <Column gap="12">
              <Heading as="h2" textVariant="display-strong-xs">
                {race.distances.length === 1 ? "Distance" : `${race.distances.length} distances`}
              </Heading>
              <Column as="ul" background="surface" border radius="l">
                {race.distances.map((d, i) => {
                  const b = buckets[bucketOf(d.distance_km)];
                  return (
                    <Row
                      as="li"
                      key={`${d.name}-${i}`}
                      borderTop={i > 0}
                      paddingX="16"
                      paddingY="16"
                      gap="12"
                      vertical="center"
                      horizontal="between"
                    >
                      <Column gap="4">
                        <Text textVariant="label-strong-m">{d.name ?? formatKm(d.distance_km)}</Text>
                        <Text textVariant="body-default-s" onBackground="neutral-weak">
                          {formatKm(d.distance_km)} · {formatGain(d.elevation_gain_m)}
                          {d.time_limit_hours ? ` · ${d.time_limit_hours} h cut-off` : ""}
                        </Text>
                      </Column>
                      <Row gap="8" vertical="center" wrap horizontal="end">
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
              {race.description && (
                <Text textVariant="body-default-m" onBackground="neutral-medium" wrap="pretty">
                  {race.description}
                </Text>
              )}
            </Column>

            <Column gap="12">
              <Heading as="h2" textVariant="display-strong-xs">
                Where
              </Heading>
              <RaceLocationMap race={race} />
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                Start area: {place(race)}. Race data from {(race.sources ?? [race.source]).join(" and ")}.
              </Text>
            </Column>
          </Grid>

          {sameMonth.length > 0 && (
            <Column gap="16" borderTop paddingTop="40">
              <Heading as="h2" textVariant="display-strong-xs">
                Also that month
              </Heading>
              <RaceCards races={sameMonth} />
            </Column>
          )}
        </Column>
      </Column>
    </>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Column background="surface" border radius="l" padding="16" gap="4">
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      {typeof value === "string" ? <Text textVariant="heading-strong-l">{value}</Text> : value}
    </Column>
  );
}
