import {Breadcrumbs, Button, Column, Grid, Heading, Icon, Media, Row, Text } from "@once-ui-system/core";
import { BucketTag, ItraTag } from "../../../../components/RaceTags";
import { Hint } from "../../../../components/Hint";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ElevationProfile } from "../../../../components/ElevationProfile";
import { RaceCards } from "../../../../components/RaceCards";
import { RaceCover } from "../../../../components/RaceCover";
import { StartsIn } from "../../../../components/StartsIn";
import { RaceLocationMap } from "../../../../components/RaceLocationMap";
import { TopBar } from "../../../../components/TopBar";
import {
  bucketOf, formatDates, formatGain, countryName, formatKm, formatNumber, longest, place, seriesName, toDate } from "../../../../lib/race-utils";
import { getProfile, getRace, getRaces } from "../../../../lib/races";
import { fill, getDictionary, hasLocale, localePath, locales, plural, type Locale } from "../../../../i18n";

type Params = Promise<{ lang: string; slug: string }>;

export async function generateStaticParams() {
  const { races } = await getRaces();
  return locales.flatMap((lang) => races.map((r) => ({ lang, slug: r.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  const race = await getRace(slug);
  if (!race || !hasLocale(lang)) return {};
  return { title: race.name, description: `${formatDates(race, lang, true)} · ${place(race, lang)}` };
}

export default async function RacePage({ params }: { params: Params }) {
  const { lang: rawLang, slug } = await params;
  const race = await getRace(slug);
  if (!race || !hasLocale(rawLang)) notFound();
  const lang: Locale = rawLang;
  const t = getDictionary(lang);
  const r = t.race;

  const { races, series } = await getRaces();
  const points = race.profile ? await getProfile(race.id) : null;
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
              { label: t.common.allRaces, href: localePath(lang, "/"), prefixIcon: "chevronLeft" },
              { label: countryName(race.country, lang) },
              { label: race.name },
            ]}
          />

          <Row gap="24" vertical="end" horizontal="between" s={{ direction: "column", horizontal: "start" }}>
            <Column gap="12">
              <Heading as="h1" textVariant="display-strong-s" wrap="balance">
                {race.name}
              </Heading>
              <Text textVariant="body-default-l" onBackground="neutral-medium">
                {formatDates(race, lang, true)} · {place(race, lang)}
              </Text>
            </Column>
            <Row gap="8" wrap>
              {race.itra_url && (
                <Button variant="secondary" suffixIcon="arrowUpRight" href={race.itra_url}>
                  {r.viewOnItra}
                </Button>
              )}
              {race.website && race.website !== race.registration_url && (
                <Button variant="secondary" suffixIcon="arrowUpRight" href={race.website}>
                  {r.website}
                </Button>
              )}
              {race.registration_url && (
                <Button suffixIcon="arrowUpRight" href={race.registration_url}>
                  {r.register}
                </Button>
              )}
            </Row>
          </Row>

          {/* Only a real photo earns the banner; without one, the "Where" map below shows the place. */}
          {race.cover && (
            <Column radius="l" border overflow="hidden" height="22rem" s={{ height: "14rem" }}>
              <RaceCover race={race} />
            </Column>
          )}

          {raceSeries.map((s) => (
            <Row
              key={s.slug}
              background="accent-alpha-weak"
              border="accent-alpha-medium"
              radius="l"
              paddingX="20"
              paddingY="16"
              gap="16"
              vertical="center"
              horizontal="between"
              s={{ direction: "column", horizontal: "start" }}
            >
              <Column gap="4">
                <Text textVariant="label-default-s" onBackground="accent-medium">
                  {r.partOfSeries}
                </Text>
                <Text textVariant="heading-strong-m">
                  {seriesName(s.title).short} · {seriesName(s.title).long}
                </Text>
              </Column>
              <Row gap="8" wrap>
                <Button variant="secondary" size="s" href={localePath(lang, `/?series=${s.slug}`)} prefixIcon="list">
                  {fill(r.allSeriesRaces, { series: seriesName(s.title).short })}
                </Button>
                {s.url && (
                  <Button variant="tertiary" size="s" suffixIcon="arrowUpRight" href={s.url}>
                    {r.seriesOnSite}
                  </Button>
                )}
              </Row>
            </Row>
          ))}

          <Grid columns="4" gap="12" m={{ columns: "2" }}>
            <Stat label={r.starts} value={<StartsIn date={race.date_start} />} />
            <Stat label={r.longestDistance} value={formatKm(top?.distance_km, lang)} />
            <Stat label={t.common.climb} hint={t.hints.climb} value={formatGain(top?.elevation_gain_m, lang)} />
            <Stat label={r.itraPoints} hint={t.hints.itra} value={race.itra_points ? String(race.itra_points) : "–"} />
          </Grid>

          <Column gap="12">
            <Heading as="h2" textVariant="display-strong-xs">
              {r.profile}
            </Heading>
            {race.profile && points ? (
              <ElevationProfile points={points} profile={race.profile} />
            ) : (
              <Row background="surface" border radius="l" padding="20" gap="12" vertical="center">
                <Icon name="trend" onBackground="neutral-weak" />
                <Text textVariant="body-default-m" onBackground="neutral-weak" wrap="pretty">
                  {r.profileComing}
                </Text>
              </Row>
            )}
          </Column>

          <Grid columns="2" gap="32" m={{ columns: "1" }}>
            <Column gap="12">
              <Heading as="h2" textVariant="display-strong-xs">
                {plural(lang, race.distances.length, r.distancesTitle)}
              </Heading>
              <Column as="ul" background="surface" border radius="l">
                {race.distances.map((d, i) => {
                  const bucket = bucketOf(d.distance_km);
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
                        <Text textVariant="label-strong-m">{d.name ?? formatKm(d.distance_km, lang)}</Text>
                        <Text textVariant="body-default-s" onBackground="neutral-weak">
                          {formatKm(d.distance_km, lang)} · {formatGain(d.elevation_gain_m, lang)}
                          {d.time_limit_hours ? ` · ${fill(r.cutoff, { n: formatNumber(d.time_limit_hours, lang, 1) })}` : ""}
                          {d.start_time ? ` · ${fill(r.startsAt, { time: d.start_time })}` : ""}
                        </Text>
                        {d.aid_stations && d.aid_stations.length > 0 && (
                          <Text textVariant="body-default-s" onBackground="neutral-weak" data-tabular>
                            {fill(r.aid, { list: d.aid_stations.map((a) => `${a.name} (km ${formatNumber(a.km, lang, 1)})`).join(", ") })}
                          </Text>
                        )}
                      </Column>
                      <Row gap="8" vertical="center" wrap horizontal="end">
                        <BucketTag bucket={bucket} />
                        {d.itra_points != null && d.itra_points > 0 && (
                          <ItraTag points={d.itra_points} />
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
                {r.where}
              </Heading>
              <RaceLocationMap race={race} />
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {fill(r.startArea, {
                  place: place(race, lang),
                  sources: (race.sources ?? [race.source]).map((x) => (x === "organiser" ? r.sourceOrganizer : x)).join(r.and),
                })}
              </Text>
            </Column>
          </Grid>

          {race.photos && race.photos.length > 0 && (
            <Column gap="12">
              <Heading as="h2" textVariant="display-strong-xs">
                {r.photos}
              </Heading>
              <Grid columns="3" gap="12" s={{ columns: "2" }}>
                {race.photos.map((src, i) => (
                  <Column key={src} radius="m" overflow="hidden" border>
                    <Media src={src} alt={fill(r.photoAlt, { name: race.name, n: i + 2 })} aspectRatio="4 / 3" enlarge unoptimized />
                  </Column>
                ))}
              </Grid>
            </Column>
          )}

          {race.organizer ? (
            <Row gap="8" vertical="center">
              <Icon name="checkCircle" onBackground="success-medium" />
              <Text textVariant="body-default-s" onBackground="neutral-medium">
                {fill(r.fromOrganizer, { name: race.organizer.name })}
              </Text>
            </Row>
          ) : (
            <Row
              border
              radius="l"
              paddingX="20"
              paddingY="16"
              gap="16"
              vertical="center"
              horizontal="between"
              s={{ direction: "column", horizontal: "start" }}
            >
              <Column gap="2">
                <Text textVariant="label-strong-m">{r.claimTitle}</Text>
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  {r.claimText}
                </Text>
              </Column>
              <Button href={localePath(lang, `/organizers/claim/${race.slug}`)} variant="secondary" size="s">
                {r.claimButton}
              </Button>
            </Row>
          )}

          {sameMonth.length > 0 && (
            <Column gap="16" borderTop paddingTop="40">
              <Heading as="h2" textVariant="display-strong-xs">
                {r.sameMonth}
              </Heading>
              <RaceCards races={sameMonth} />
            </Column>
          )}
        </Column>
      </Column>
    </>
  );
}

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  const text = (
    <Text textVariant="label-default-s" onBackground="neutral-weak">
      {label}
    </Text>
  );
  return (
    <Column background="surface" border radius="l" padding="16" gap="4">
      {hint ? <Hint text={hint}>{text}</Hint> : text}
      {typeof value === "string" ? <Text textVariant="heading-strong-l">{value}</Text> : value}
    </Column>
  );
}
