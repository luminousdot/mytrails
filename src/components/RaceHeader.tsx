"use client";

import { Column, Heading, Row, SegmentedControl, Text } from "@once-ui-system/core";
import { saveHeaderLayout, saveLook, useHeaderLayout, useLook, type HeaderLayout, type Look } from "../lib/backdrop";
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
  const look = useLook();
  const layout = useHeaderLayout();
  const next = races.find((r) => daysUntil(r.date_start) >= 0);
  const days = next ? daysUntil(next.date_start) : null;
  const nextLine =
    days === null ? "no upcoming starts" : days === 0 ? `${next?.name} is today` : `next start in ${days} ${days === 1 ? "day" : "days"}`;

  const content = (
    <Column gap="24">
      <Column gap="12">
        <Heading as="h1" textVariant="display-strong-s" wrap="balance">
          Find your next start line
        </Heading>
        <Text textVariant="body-default-l" onBackground="neutral-medium" wrap="pretty">
          {races.length} trail and mountain races across {countries} countries of Southeast Europe, {nextLine}.
          Updated from ITRA on {updatedFmt.format(new Date(crawledAt))}.
        </Text>
      </Column>

      <Row gap="8" vertical="center" wrap>
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          Layout
        </Text>
        <SegmentedControl
          key={`layout-${layout}`}
          fillWidth={false}
          compact
          aria-label="Header layout"
          value={layout}
          onValueChange={(v) => saveHeaderLayout(v as HeaderLayout)}
          buttons={[
            { value: "section", label: "Section" },
            { value: "hero", label: "Hero" },
          ]}
        />
        <Text textVariant="label-default-s" onBackground="neutral-weak" marginLeft="8">
          Background
        </Text>
        <SegmentedControl
          // The saved look is only known after hydration; remount so the indicator follows it.
          key={`look-${look}`}
          fillWidth={false}
          compact
          aria-label="Background"
          value={look}
          onValueChange={(v) => saveLook(v as Look)}
          buttons={[
            { value: "gradient", label: "Gradient" },
            { value: "dots", label: "Dots" },
            { value: "lines", label: "Lines" },
            { value: "grid", label: "Grid" },
            ...(photo ? [{ value: "photo", label: "Photo fade" }] : []),
            { value: "none", label: "None" },
          ]}
        />
      </Row>
    </Column>
  );

  if (layout === "hero") {
    // Full width under the top bar; the layer runs edge to edge.
    return (
      <Column as="section" fillWidth horizontal="center" overflow="hidden" borderBottom>
        <SectionBackdrop photo={photo} />
        <Column maxWidth="l" paddingX="24" paddingTop="80" paddingBottom="56">
          {content}
        </Column>
      </Column>
    );
  }

  // A rounded section inside the page width.
  return (
    <Column fillWidth horizontal="center" paddingX="24" paddingTop="32">
      <Column
        as="section"
        maxWidth="l"
        overflow="hidden"
        radius="xl"
        border
        paddingX="32"
        paddingY="40"
        s={{ paddingX: "20", paddingY: "24" }}
      >
        <SectionBackdrop photo={photo} />
        <Column>{content}</Column>
      </Column>
    </Column>
  );
}
