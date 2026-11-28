import { Button, Column, Grid, Heading, Icon, Row, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { ClaimSearch } from "../../../components/organizer/ClaimSearch";
import { OrganizerShell } from "../../../components/organizer/OrganizerShell";
import { PageIntro } from "../../../components/organizer/PageIntro";
import { formatDates, place } from "../../../lib/race-utils";
import { getRaces } from "../../../lib/races";
import { fill, localePath } from "../../../i18n";
import { pageLang } from "../../../i18n/server";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await pageLang(params);
  return { title: t.org.crumb };
}

export default async function OrganizersPage({ params }: Props) {
  const { lang, t } = await pageLang(params);
  const { races } = await getRaces();
  const options = races.map((r) => ({
    slug: r.slug,
    name: r.name,
    meta: `${formatDates(r, lang, false, "always")} · ${place(r, lang)}`,
    claimed: !!r.organizer,
  }));

  return (
    <OrganizerShell>
      <PageIntro
        crumbs={[{ label: t.common.allRaces, href: localePath(lang, "/") }, { label: t.org.crumb }]}
        title={t.org.landingTitle}
        lead={t.org.landingLead}
      />

      <Column background="surface" border radius="l" padding="24" gap="16" s={{ padding: "16" }}>
        <Column gap="4">
          <Heading as="h2" textVariant="heading-strong-l">
            {t.org.listedTitle}
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {fill(t.org.listedText, { n: races.length })}
          </Text>
        </Column>
        <ClaimSearch races={options} />
      </Column>

      <Row background="surface" border radius="l" padding="24" gap="16" vertical="center" horizontal="between" s={{ direction: "column", horizontal: "start", padding: "16" }}>
        <Column gap="4">
          <Heading as="h2" textVariant="heading-strong-l">
            {t.org.notListedTitle}
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {t.org.notListedText}
          </Text>
        </Column>
        <Button href={localePath(lang, "/organizers/new")} prefixIcon="plus">
          {t.org.addRace}
        </Button>
      </Row>

      <Grid columns="3" gap="16" s={{ columns: "1" }}>
        <Step icon="edit" title={t.org.step1Title} text={t.org.step1Text} />
        <Step icon="checkCircle" title={t.org.step2Title} text={t.org.step2Text} />
        <Step icon="map" title={t.org.step3Title} text={t.org.step3Text} />
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
