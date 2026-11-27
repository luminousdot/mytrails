import type { Metadata } from "next";
import { OrganizerShell } from "../../../components/organizer/OrganizerShell";
import { PageIntro } from "../../../components/organizer/PageIntro";
import { RaceForm } from "../../../components/organizer/RaceForm";
import { emptyDraft } from "../../../lib/organizer-types";

export const metadata: Metadata = { title: "Add your race" };

export default function NewRacePage() {
  return (
    <OrganizerShell>
      <PageIntro
        crumbs={[
          { label: "For organisers", href: "/organizers" },
          { label: "Add your race" },
        ]}
        title="Add your race"
        lead="Tell runners what they're signing up for: dates, every distance with its climb, the course file and photos. We review each race before it goes live."
      />
      <RaceForm mode="new" initial={emptyDraft()} />
    </OrganizerShell>
  );
}
