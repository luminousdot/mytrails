import { Button, Column, Grid, Heading, Icon, Row, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { ClaimSearch } from "../../components/organizer/ClaimSearch";
import { OrganizerShell } from "../../components/organizer/OrganizerShell";
import { PageIntro } from "../../components/organizer/PageIntro";
import { formatDates, place } from "../../lib/race-utils";
import { getRaces } from "../../lib/races";

export const metadata: Metadata = { title: "For organisers" };

export default async function OrganizersPage() {
  const { races } = await getRaces();
  const options = races.map((r) => ({ slug: r.slug, name: r.name, meta: `${formatDates(r, false, true)} · ${place(r)}`, claimed: !!r.organizer }));

  return (
    <OrganizerShell>
      <PageIntro
        crumbs={[{ label: "All races", href: "/" }, { label: "For organisers" }]}
        title="Put your race in front of runners"
        lead="Runners across Serbia and the region plan their season here. Give them your real course: every distance, the climb, the GPX and your photos."
      />

      <Column background="surface" border radius="l" padding="24" gap="16" s={{ padding: "16" }}>
        <Column gap="4">
          <Heading as="h2" textVariant="heading-strong-l">
            Is your race already listed?
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            We list {races.length} races from ITRA and organisers’ own sites. Find yours and claim it to update the page.
          </Text>
        </Column>
        <ClaimSearch races={options} />
      </Column>

      <Row background="surface" border radius="l" padding="24" gap="16" vertical="center" horizontal="between" s={{ direction: "column", horizontal: "start", padding: "16" }}>
        <Column gap="4">
          <Heading as="h2" textVariant="heading-strong-l">
            Not listed yet?
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Add it from scratch. It takes about ten minutes with your course files at hand.
          </Text>
        </Column>
        <Button href="/organizers/new" prefixIcon="plus">
          Add your race
        </Button>
      </Row>

      <Grid columns="3" gap="16" s={{ columns: "1" }}>
        <Step icon="edit" title="Send your details" text="Dates, distances, climb, aid stations, GPX and photos." />
        <Step icon="checkCircle" title="We review it" text="We confirm it's your race and check the details, usually within a few days." />
        <Step icon="map" title="Runners find it" text="Your page shows the course, elevation profile and your registration link." />
      </Grid>
    </OrganizerShell>
  );
}

function Step({ icon, title, text }: { icon: "edit" | "checkCircle" | "map"; title: string; text: string }) {
  return (
    <Column gap="8" padding="4">
      <Icon name={icon} onBackground="brand-medium" />
      <Text textVariant="label-strong-m">{title}</Text>
      <Text textVariant="body-default-s" onBackground="neutral-weak" wrap="pretty">
        {text}
      </Text>
    </Column>
  );
}
