"use client";

import { Column, Heading, Row, SegmentedControl, Text } from "@once-ui-system/core";
import { useSyncExternalStore } from "react";
import { readLook, saveLook, subscribeLook, type Look } from "../lib/backdrop";
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
  const look = useSyncExternalStore(subscribeLook, readLook, () => "gradient" as Look);
  const next = races.find((r) => daysUntil(r.date_start) >= 0);
  const days = next ? daysUntil(next.date_start) : null;
  const nextLine =
    days === null ? "no upcoming starts" : days === 0 ? `${next?.name} is today` : `next start in ${days} ${days === 1 ? "day" : "days"}`;

  return (
    <Column gap="24">
      <Column gap="12">
        <Text textVariant="label-default-s" onBackground="brand-medium">
          Southeast Europe · trail &amp; mountain races
        </Text>
        <Heading as="h1" textVariant="display-strong-s" wrap="balance">
          Find your next start line
        </Heading>
        <Text textVariant="body-default-l" onBackground="neutral-medium" wrap="pretty">
          {races.length} races in {countries} countries, {nextLine}. Updated from ITRA on{" "}
          {updatedFmt.format(new Date(crawledAt))}.
        </Text>
      </Column>

      <Row gap="8" vertical="center" wrap>
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          Background
        </Text>
        <SegmentedControl
          // The saved look is only known after hydration; remount so the indicator follows it.
          key={look}
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
}
