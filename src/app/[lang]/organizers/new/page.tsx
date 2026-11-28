import type { Metadata } from "next";
import { OrganizerShell } from "../../../../components/organizer/OrganizerShell";
import { PageIntro } from "../../../../components/organizer/PageIntro";
import { RaceForm } from "../../../../components/organizer/RaceForm";
import { emptyDraft } from "../../../../lib/organizer-types";
import { localePath } from "../../../../i18n";
import { pageLang } from "../../../../i18n/server";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await pageLang(params);
  return { title: t.org.addRace };
}

export default async function NewRacePage({ params }: Props) {
  const { lang, t } = await pageLang(params);
  return (
    <OrganizerShell>
      <PageIntro
        crumbs={[
          { label: t.org.crumb, href: localePath(lang, "/organizers") },
          { label: t.org.addRace },
        ]}
        title={t.org.addRace}
        lead={t.org.newLead}
      />
      <RaceForm mode="new" initial={emptyDraft()} />
    </OrganizerShell>
  );
}
