"use client";

import { Column, Heading, Text } from "@once-ui-system/core";
import { fill, plural } from "../i18n";
import { useI18n } from "../i18n/I18nProvider";
import { daysUntil, formatDate, formatNumber } from "../lib/race-utils";
import type { Race } from "../lib/types";
import { SectionBackdrop } from "./SectionBackdrop";

export function RaceHeader({
  races,
  countries,
  crawledAt,
  photo,
}: {
  races: Race[];
  countries: number;
  crawledAt: string;
  photo?: string;
}) {
  const { lang, t } = useI18n();
  const next = races.find((r) => daysUntil(r.date_start) >= 0);
  const days = next ? daysUntil(next.date_start) : null;
  const nextLine =
    days === null
      ? t.home.noNext
      : days === 0
        ? fill(t.home.nextToday, { name: next?.name ?? "" })
        : plural(lang, days, t.home.nextIn);

  // Full width under the top bar, the race photo fading in from the right.
  return (
    <Column as="section" fillWidth horizontal="center" overflow="hidden" borderBottom>
      <SectionBackdrop photo={photo} />
      <Column maxWidth="l" paddingX="24" paddingTop="80" paddingBottom="64" gap="12" s={{ paddingTop: "48", paddingBottom: "40" }}>
        <Heading as="h1" textVariant="display-strong-m" wrap="balance">
          {t.home.title}
        </Heading>
        <Column maxWidth="40rem">
          <Text textVariant="body-default-l" onBackground="neutral-medium" wrap="pretty">
            {fill(t.home.lead, {
              races: formatNumber(races.length, lang),
              countries: plural(lang, countries, t.home.countries),
              next: nextLine,
              date: formatDate(lang, new Date(crawledAt), { day: "numeric", month: "long", year: "numeric" }),
            })}
          </Text>
        </Column>
      </Column>
    </Column>
  );
}
