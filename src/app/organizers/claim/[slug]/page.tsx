import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrganizerShell } from "../../../../components/organizer/OrganizerShell";
import { PageIntro } from "../../../../components/organizer/PageIntro";
import { RaceForm } from "../../../../components/organizer/RaceForm";
import { emptyDistance, type RaceDraft } from "../../../../lib/organizer-types";
import { getRace, getRaces } from "../../../../lib/races";
import type { Race } from "../../../../lib/types";

export async function generateStaticParams() {
  const { races } = await getRaces();
  return races.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const race = await getRace((await params).slug);
  return { title: race ? `Claim ${race.name}` : "Claim a race" };
}

/** What we list today, as a starting point the organiser corrects. */
function toDraft(race: Race): RaceDraft {
  return {
    name: race.name,
    date_start: race.date_start,
    date_end: race.date_end ?? "",
    country: race.country,
    city: race.city ?? "",
    position: [race.lng, race.lat],
    website: race.website ?? "",
    registration_url: race.registration_url ?? "",
    description: race.description ?? "",
    distances: race.distances.length
      ? race.distances.map((d) => ({
          name: d.name ?? "",
          distance_km: d.distance_km ?? null,
          elevation_gain_m: d.elevation_gain_m ?? null,
          time_limit_hours: d.time_limit_hours ?? null,
          start_time: d.start_time ?? "",
          aid_stations: d.aid_stations ?? [],
        }))
      : [emptyDistance()],
  };
}

export default async function ClaimPage({ params }: { params: Promise<{ slug: string }> }) {
  const race = await getRace((await params).slug);
  if (!race) notFound();

  return (
    <OrganizerShell>
      <PageIntro
        crumbs={[
          { label: "For organisers", href: "/organizers" },
          { label: race.name, href: `/races/${race.slug}` },
          { label: "Claim" },
        ]}
        title={`Claim ${race.name}`}
        lead="We filled this in from what we list today. Correct anything that's wrong, add your course files, aid stations and photos, and we'll switch the page to your details once we've confirmed it's yours."
      />
      <RaceForm mode="claim" initial={toDraft(race)} claim={{ slug: race.slug, name: race.name }} />
    </OrganizerShell>
  );
}
