import {Button, Column, Grid, Heading, Media, Row, SmartLink, Text } from "@once-ui-system/core";
import { BucketTag } from "../../../../components/RaceTags";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ElevationProfile } from "../../../../components/ElevationProfile";
import { OrganizerShell } from "../../../../components/organizer/OrganizerShell";
import { PageIntro } from "../../../../components/organizer/PageIntro";
import { ReviewActions } from "../../../../components/organizer/ReviewActions";
import { getSubmission, readUploadedTrack } from "../../../../lib/organizer";
import { bucketOf, countryName, formatGain, formatKm, formatNumber } from "../../../../lib/race-utils";
import { fill, intlLocale, localePath } from "../../../../i18n";
import { pageLang } from "../../../../i18n/server";

type Props = { params: Promise<{ lang: string; id: string }> };

// Static: the submission id is only known at request time, and this page is internal anyway.
export const metadata: Metadata = { title: "Review" };

// Submissions only exist at request time. One placeholder lets the build
// prerender the shell (it 404s); real ids render on request.
export function generateStaticParams() {
  return [{ id: "_" }];
}

export default async function ReviewItemPage({ params }: Props) {
  if (process.env.NODE_ENV === "production") notFound();
  const { lang, t } = await pageLang(params);
  const v = t.review;
  const when = new Intl.DateTimeFormat(intlLocale[lang], { dateStyle: "medium", timeStyle: "short" });
  const s = await getSubmission((await params).id);
  if (!s) notFound();
  const r = s.race;

  // Preview the profile the race page will get, from the longest distance with a GPX.
  const withGpx = [...r.distances].sort((a, b) => (b.distance_km ?? 0) - (a.distance_km ?? 0)).find((d) => d.gpx_url);
  const track = withGpx?.gpx_url ? await readUploadedTrack(withGpx.gpx_url) : null;

  return (
    <OrganizerShell>
      <PageIntro
        crumbs={[{ label: v.title, href: localePath(lang, "/review") }, { label: s.id }]}
        title={r.name || v.untitled}
        lead={
          <>
            {s.kind === "claim" ? (
              <>
                {v.claimOfPage}
                <SmartLink href={localePath(lang, `/races/${s.claim?.slug}`)}>{s.claim?.name}</SmartLink>
              </>
            ) : (
              v.newRace
            )}{" "}
            · {fill(v.sent, { date: when.format(new Date(s.submitted_at)) })}
          </>
        }
      />

      <Panel title={v.organizer}>
        <Text textVariant="body-default-m">
          {s.organizer.name} · {v.roles[s.organizer.role]} ·{" "}
          <SmartLink href={`mailto:${s.organizer.email}`}>{s.organizer.email}</SmartLink>
        </Text>
        {s.claim_note && (
          <Column gap="4">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {v.proof}
            </Text>
            <Text textVariant="body-default-m" wrap="pretty">
              {s.claim_note}
            </Text>
          </Column>
        )}
      </Panel>

      <Panel title={v.race}>
        <Grid columns="2" gap="16" s={{ columns: "1" }}>
          <Fact label={v.dates} value={r.date_end ? fill(v.datesRange, { start: r.date_start, end: r.date_end }) : r.date_start} />
          <Fact label={v.place} value={`${r.city}, ${countryName(r.country, lang)}`} />
          <Fact
            label={v.startPin}
            value={r.position ? `${r.position[1].toFixed(4)}, ${r.position[0].toFixed(4)}` : v.noPin}
          />
          <Fact label={v.website} value={r.website || "–"} href={r.website || undefined} />
          <Fact label={v.registration} value={r.registration_url || "–"} href={r.registration_url || undefined} />
        </Grid>
        {r.description && (
          <Text textVariant="body-default-m" onBackground="neutral-medium" wrap="pretty">
            {r.description}
          </Text>
        )}
      </Panel>

      <Panel title={fill(v.distances, { n: r.distances.length })}>
        <Column as="ul" gap="12">
          {r.distances.map((d, i) => {
            const bucket = bucketOf(d.distance_km ?? undefined);
            return (
              <Column as="li" key={i} gap="4" borderTop={i > 0} paddingTop={i > 0 ? "12" : "0"}>
                <Row gap="8" vertical="center" wrap>
                  <Text textVariant="label-strong-m">{d.name || fill(t.form.distanceN, { n: i + 1 })}</Text>
                  <BucketTag bucket={bucket} />
                </Row>
                <Text textVariant="body-default-s" onBackground="neutral-weak" data-tabular>
                  {formatKm(d.distance_km ?? undefined, lang)} · {formatGain(d.elevation_gain_m ?? undefined, lang)}
                  {d.time_limit_hours ? ` · ${fill(t.race.cutoff, { n: formatNumber(d.time_limit_hours, lang, 1) })}` : ""}
                  {d.start_time ? ` · ${fill(t.race.startsAt, { time: d.start_time })}` : ""}
                </Text>
                {d.aid_stations.length > 0 && (
                  <Text textVariant="body-default-s" onBackground="neutral-weak" data-tabular>
                    {fill(t.race.aid, { list: d.aid_stations.map((a) => `${a.name} (km ${a.km})`).join(", ") })}
                  </Text>
                )}
                {d.gpx_url && (
                  <SmartLink href={d.gpx_url} suffixIcon="download">
                    {v.gpxFile}
                  </SmartLink>
                )}
              </Column>
            );
          })}
        </Column>
      </Panel>

      {track && withGpx?.gpx_url && (
        <Panel title={v.profilePreview}>
          <ElevationProfile
            points={track.profile}
            profile={{ ...track, url: withGpx.gpx_url, distance_name: withGpx.name || null }}
          />
        </Panel>
      )}

      {r.photos && r.photos.length > 0 && (
        <Panel title={fill(v.photos, { n: r.photos.length })}>
          <Grid columns="3" gap="12" s={{ columns: "2" }}>
            {r.photos.map((src, i) => (
              <Column key={src} gap="4">
                <Column radius="m" overflow="hidden" border>
                  <Media src={src} alt={fill(t.form.photoN, { n: i + 1 })} aspectRatio="16 / 9" unoptimized enlarge />
                </Column>
                <Text textVariant="label-default-s" onBackground="neutral-weak">
                  {i === 0 ? t.form.cover : fill(t.form.photoN, { n: i + 1 })}
                </Text>
              </Column>
            ))}
          </Grid>
        </Panel>
      )}

      {s.status === "pending" ? (
        <ReviewActions id={s.id} kind={s.kind} />
      ) : (
        <Panel title={s.status === "approved" ? v.published : v.rejected}>
          {s.review_note && <Text textVariant="body-default-m">{s.review_note}</Text>}
          {s.published_slug && (
            <Row>
              <Button href={localePath(lang, `/races/${s.published_slug}`)} variant="secondary" suffixIcon="arrowRight">
                {v.openRace}
              </Button>
            </Row>
          )}
        </Panel>
      )}
    </OrganizerShell>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Column as="section" background="surface" border radius="l" padding="24" gap="16" s={{ padding: "16" }}>
      <Heading as="h2" textVariant="heading-strong-m">
        {title}
      </Heading>
      {children}
    </Column>
  );
}

function Fact({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <Column gap="2" minWidth="0">
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      {href ? (
        <SmartLink href={href}>{value}</SmartLink>
      ) : (
        <Text textVariant="body-default-m" style={{ overflowWrap: "anywhere" }}>
          {value}
        </Text>
      )}
    </Column>
  );
}
