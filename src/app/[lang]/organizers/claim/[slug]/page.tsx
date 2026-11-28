import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrganizerShell } from "../../../../../components/organizer/OrganizerShell";
import { PageIntro } from "../../../../../components/organizer/PageIntro";
import { RaceForm } from "../../../../../components/organizer/RaceForm";
import { emptyDistance, type RaceDraft } from "../../../../../lib/organizer-types";
import { getRace, getRaces } from "../../../../../lib/races";
import type { Race } from "../../../../../lib/types";
import { fill, localePath, locales } from "../../../../../i18n";
import { pageLang } from "../../../../../i18n/server";

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams() {
  const { races } = await getRaces();
  return locales.flatMap((lang) => races.map((r) => ({ lang, slug: r.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await pageLang(params);
  const race = await getRace((await params).slug);
  return { title: race ? fill(t.org.claimPageTitle, { name: race.name }) : t.org.claimCrumb };
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

export default async function ClaimPage({ params }: Props) {
  const { lang, t } = await pageLang(params);
  const race = await getRace((await params).slug);
  if (!race) notFound();

  return (
    <OrganizerShell>
      <PageIntro
        crumbs={[
          { label: t.org.crumb, href: localePath(lang, "/organizers") },
          { label: race.name, href: localePath(lang, `/races/${race.slug}`) },
          { label: t.org.claimCrumb },
        ]}
        title={fill(t.org.claimPageTitle, { name: race.name })}
        lead={t.org.claimLead}
      />
      <RaceForm mode="claim" initial={toDraft(race)} claim={{ slug: race.slug, name: race.name }} />
    </OrganizerShell>
  );
}
