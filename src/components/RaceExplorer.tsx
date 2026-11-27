"use client";

import {
  Button,
  Checkbox,
  Column,
  EmptyState,
  Icon,
  Heading,
  Input,
  Row,
  SegmentedControl,
  Select,
  Text,
} from "@once-ui-system/core";
import { useMemo, useState } from "react";
import { buckets, daysUntil, matches, toDate } from "../lib/race-utils";
import type { DistanceBucket, Race, RaceFilters } from "../lib/types";
import { RaceCalendar } from "./RaceCalendar";
import { RaceDialog } from "./RaceDialog";
import { RaceList } from "./RaceList";
import { RaceMap } from "./RaceMap";
import { SeasonStrip } from "./SeasonStrip";

type View = "calendar" | "list" | "map";

const defaultFilters: RaceFilters = { country: "all", distance: "all", itraOnly: false, search: "" };

const updatedFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

export function RaceExplorer({ races, crawledAt }: { races: Race[]; crawledAt: string }) {
  const [view, setView] = useState<View>("calendar");
  const [filters, setFilters] = useState<RaceFilters>(defaultFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [month, setMonth] = useState<Date>(() => {
    const first = races[0] ? toDate(races[0].date_start) : new Date();
    return new Date(first.getFullYear(), first.getMonth(), 1);
  });

  const countries = useMemo(
    () =>
      [...new Set(races.map((r) => r.country))]
        .sort()
        .map((c) => ({ value: c, label: `${c} (${races.filter((r) => r.country === c).length})` })),
    [races],
  );
  const shown = useMemo(() => races.filter((r) => matches(r, filters)), [races, filters]);
  const selected = races.find((r) => r.id === selectedId) ?? null;
  const next = races.find((r) => daysUntil(r.date_start) >= 0);
  const filtered =
    filters.country !== "all" || filters.distance !== "all" || filters.itraOnly || filters.search !== "";

  const set = (patch: Partial<RaceFilters>) => setFilters((f) => ({ ...f, ...patch }));

  const nextLine = next
    ? daysUntil(next.date_start) === 0
      ? `${next.name} is today`
      : `next start in ${daysUntil(next.date_start)} ${daysUntil(next.date_start) === 1 ? "day" : "days"}`
    : "no upcoming starts";

  return (
    <Column maxWidth="l" gap="32">
      <Column gap="12">
        <Text textVariant="label-default-s" onBackground="brand-medium">
          Southeast Europe · trail &amp; mountain races
        </Text>
        <Heading as="h1" textVariant="display-strong-s">
          Find your next start line
        </Heading>
        <Text textVariant="body-default-m" onBackground="neutral-weak" wrap="pretty">
          {races.length} races in {countries.length} countries, {nextLine}. Updated from ITRA on{" "}
          {updatedFmt.format(new Date(crawledAt))}.
        </Text>
      </Column>

      <SeasonStrip
        races={shown}
        month={month}
        onPick={(m) => {
          setMonth(m);
          if (view === "map") setView("calendar");
        }}
      />

      <Column gap="16">
        <Row gap="12" vertical="center" wrap s={{ direction: "column", horizontal: "start" }}>
          <Row flex={1} minWidth="16rem" s={{ minWidth: "0", width: "100%" }}>
            <Input
              id="race-search"
              size="xxs"
              label="Search races, towns, countries"
              prefix={<Icon name="search" size="s" onBackground="neutral-weak" />}
              value={filters.search}
              onValueChange={(v) => set({ search: v })}
            />
          </Row>
          <Row minWidth="14rem" s={{ minWidth: "0", width: "100%" }}>
            <Select
              id="race-country"
              size="xxs"
              label="Country"
              searchable
              value={filters.country}
              onValueChange={(v) => set({ country: v as string })}
              options={[{ value: "all", label: "All countries" }, ...countries]}
            />
          </Row>
          <Checkbox
            label="ITRA points only"
            checked={filters.itraOnly}
            onCheckedChange={(checked) => set({ itraOnly: checked })}
          />
        </Row>

        <Row gap="12" vertical="center" horizontal="between" wrap s={{ direction: "column", horizontal: "start" }}>
          <SegmentedControl
            fillWidth={false}
            semantics="radio"
            aria-label="Distance"
            value={filters.distance}
            onValueChange={(v) => set({ distance: v as RaceFilters["distance"] })}
            buttons={[
              { value: "all", label: "Any distance" },
              ...(Object.keys(buckets) as DistanceBucket[]).map((b) => ({
                value: b,
                label: buckets[b].label,
                tooltip: buckets[b].range,
              })),
            ]}
          />
          <SegmentedControl
            fillWidth={false}
            aria-label="View"
            value={view}
            onValueChange={(v) => setView(v as View)}
            buttons={[
              { value: "calendar", label: "Calendar", prefixIcon: "calendar" },
              { value: "list", label: "List", prefixIcon: "list" },
              { value: "map", label: "Map", prefixIcon: "map" },
            ]}
          />
        </Row>

        <Row gap="8" vertical="center" horizontal="between" wrap>
          <Text textVariant="body-default-s" onBackground="neutral-weak" aria-live="polite">
            {shown.length === races.length
              ? `Showing all ${races.length} races`
              : `Showing ${shown.length} of ${races.length} races`}
          </Text>
          {filtered && (
            <Button size="s" variant="tertiary" prefixIcon="close" onClick={() => setFilters(defaultFilters)}>
              Clear filters
            </Button>
          )}
        </Row>
      </Column>

      {shown.length === 0 ? (
        <Column background="surface" border radius="l" padding="40">
          <EmptyState
            icon="search"
            title="No races match these filters"
            description="Try another country or distance, or clear the filters to see the whole season."
            action={
              <Button variant="secondary" onClick={() => setFilters(defaultFilters)}>
                Show all races
              </Button>
            }
          />
        </Column>
      ) : view === "calendar" ? (
        <RaceCalendar races={shown} month={month} onMonthChange={setMonth} onSelect={setSelectedId} />
      ) : view === "list" ? (
        <RaceList races={shown} onSelect={setSelectedId} />
      ) : (
        <RaceMap races={shown} selectedId={selectedId} onSelect={setSelectedId} />
      )}

      <RaceDialog race={selected} onClose={() => setSelectedId(null)} />
    </Column>
  );
}
