"use client";

import { Column, Heading, Text } from "@once-ui-system/core";
import { SectionBackdrop } from "./SectionBackdrop";
import { daysUntil } from "../lib/race-utils";
import type { Race } from "../lib/types";

const updatedFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

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
  const next = races.find((r) => daysUntil(r.date_start) >= 0);
  const days = next ? daysUntil(next.date_start) : null;
  const nextLine =
    days === null ? "no upcoming starts" : days === 0 ? `${next?.name} is today` : `next start in ${days} ${days === 1 ? "day" : "days"}`;

  // Full width under the top bar, the race photo fading in from the right.
  return (
    <Column as="section" fillWidth horizontal="center" overflow="hidden" borderBottom>
      <SectionBackdrop photo={photo} />
      <Column maxWidth="l" paddingX="24" paddingTop="80" paddingBottom="64" gap="12" s={{ paddingTop: "48", paddingBottom: "40" }}>
        <Heading as="h1" textVariant="display-strong-m" wrap="balance">
          Find your next start line
        </Heading>
        <Column maxWidth="40rem">
          <Text textVariant="body-default-l" onBackground="neutral-medium" wrap="pretty">
            {races.length} trail and mountain races across {countries} countries of Southeast Europe, {nextLine}.
            Demo data from ITRA and mountain-race.rs, {updatedFmt.format(new Date(crawledAt))}.
          </Text>
        </Column>
      </Column>
    </Column>
  );
}
