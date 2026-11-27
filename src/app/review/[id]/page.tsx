import { Button, Column, Grid, Heading, Media, Row, SmartLink, Tag, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ElevationProfile } from "../../../components/ElevationProfile";
import { OrganizerShell } from "../../../components/organizer/OrganizerShell";
import { PageIntro } from "../../../components/organizer/PageIntro";
import { ReviewActions } from "../../../components/organizer/ReviewActions";
import { parseGpx } from "../../../lib/gpx";
import { getSubmission } from "../../../lib/organizer";
import { bucketOf, buckets, formatGain, formatKm } from "../../../lib/race-utils";

export const metadata: Metadata = { title: "Review submission" };

const roles = { director: "Race director", team: "Organising team", other: "Other" };
const when = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

export default async function ReviewItemPage({ params }: { params: Promise<{ id: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const s = await getSubmission((await params).id);
  if (!s) notFound();
  const r = s.race;

  // Preview the profile the race page will get, from the longest distance with a GPX.
  const withGpx = [...r.distances].sort((a, b) => (b.distance_km ?? 0) - (a.distance_km ?? 0)).find((d) => d.gpx_url);
  const xml = withGpx?.gpx_url ? await readFile(path.join(process.cwd(), "public", withGpx.gpx_url), "utf8").catch(() => "") : "";
  const track = xml ? parseGpx(xml) : null;

  return (
    <OrganizerShell>
      <PageIntro
        crumbs={[{ label: "Review queue", href: "/review" }, { label: s.id }]}
        title={r.name || "Untitled race"}
        lead={
          <>
            {s.kind === "claim" ? (
              <>
                Claim of the listed page{" "}
                <SmartLink href={`/races/${s.claim?.slug}`}>{s.claim?.name}</SmartLink>
              </>
            ) : (
              "New race"
            )}{" "}
            · sent {when.format(new Date(s.submitted_at))}
          </>
        }
      />

      <Panel title="Organiser">
        <Text textVariant="body-default-m">
          {s.organizer.name} · {roles[s.organizer.role]} ·{" "}
          <SmartLink href={`mailto:${s.organizer.email}`}>{s.organizer.email}</SmartLink>
        </Text>
        {s.claim_note && (
          <Column gap="4">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              How they say we can confirm it
            </Text>
            <Text textVariant="body-default-m" wrap="pretty">
              {s.claim_note}
            </Text>
          </Column>
        )}
      </Panel>

      <Panel title="Race">
        <Grid columns="2" gap="16" s={{ columns: "1" }}>
          <Fact label="Dates" value={r.date_end ? `${r.date_start} to ${r.date_end}` : r.date_start} />
          <Fact label="Place" value={`${r.city}, ${r.country}`} />
          <Fact label="Start pin" value={r.position ? `${r.position[1].toFixed(4)}, ${r.position[0].toFixed(4)}` : "None (GPX start, then the town)"} />
          <Fact label="Website" value={r.website || "–"} href={r.website || undefined} />
          <Fact label="Registration" value={r.registration_url || "–"} href={r.registration_url || undefined} />
        </Grid>
        {r.description && (
          <Text textVariant="body-default-m" onBackground="neutral-medium" wrap="pretty">
            {r.description}
          </Text>
        )}
      </Panel>

      <Panel title={`Distances (${r.distances.length})`}>
        <Column as="ul" gap="12">
          {r.distances.map((d, i) => {
            const b = buckets[bucketOf(d.distance_km ?? undefined)];
            return (
              <Column as="li" key={i} gap="4" borderTop={i > 0} paddingTop={i > 0 ? "12" : "0"}>
                <Row gap="8" vertical="center" wrap>
                  <Text textVariant="label-strong-m">{d.name || `Distance ${i + 1}`}</Text>
                  <Tag size="s" tone={b.tone}>
                    {b.label}
                  </Tag>
                </Row>
                <Text textVariant="body-default-s" onBackground="neutral-weak" data-tabular>
                  {formatKm(d.distance_km ?? undefined)} · {formatGain(d.elevation_gain_m ?? undefined)}
                  {d.time_limit_hours ? ` · ${d.time_limit_hours} h cut-off` : ""}
                  {d.start_time ? ` · starts ${d.start_time}` : ""}
                </Text>
                {d.aid_stations.length > 0 && (
                  <Text textVariant="body-default-s" onBackground="neutral-weak" data-tabular>
                    Aid: {d.aid_stations.map((a) => `${a.name} (km ${a.km})`).join(", ")}
                  </Text>
                )}
                {d.gpx_url && (
                  <SmartLink href={d.gpx_url} suffixIcon="download">
                    GPX file
                  </SmartLink>
                )}
              </Column>
            );
          })}
        </Column>
      </Panel>

      {track && withGpx?.gpx_url && (
        <Panel title="Elevation profile the race page will show">
          <ElevationProfile
            points={track.profile}
            profile={{ ...track, url: withGpx.gpx_url, distance_name: withGpx.name || null }}
          />
        </Panel>
      )}

      {r.photos && r.photos.length > 0 && (
        <Panel title={`Photos (${r.photos.length})`}>
          <Grid columns="3" gap="12" s={{ columns: "2" }}>
            {r.photos.map((src, i) => (
              <Column key={src} gap="4">
                <Column radius="m" overflow="hidden" border>
                  <Media src={src} alt={`Photo ${i + 1}`} aspectRatio="16 / 9" unoptimized enlarge />
                </Column>
                <Text textVariant="label-default-s" onBackground="neutral-weak">
                  {i === 0 ? "Cover" : `Photo ${i + 1}`}
                </Text>
              </Column>
            ))}
          </Grid>
        </Panel>
      )}

      {s.status === "pending" ? (
        <ReviewActions id={s.id} kind={s.kind} />
      ) : (
        <Panel title={s.status === "approved" ? "Published" : "Rejected"}>
          {s.review_note && <Text textVariant="body-default-m">{s.review_note}</Text>}
          {s.published_slug && (
            <Row>
              <Button href={`/races/${s.published_slug}`} variant="secondary" suffixIcon="arrowRight">
                Open the race page
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
