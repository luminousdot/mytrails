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
import { useMemo, useState, useSyncExternalStore } from "react";
import { buckets, daysUntil, matches, toDate } from "../lib/race-utils";
import type { DistanceBucket, Race, RaceFilters } from "../lib/types";
import { RaceCalendar } from "./RaceCalendar";
import { RaceCards } from "./RaceCards";
import { RaceList } from "./RaceList";
import { RaceMap } from "./RaceMap";
import { SeasonStrip } from "./SeasonStrip";

type View = "list" | "cards" | "map" | "calendar";

const views: View[] = ["list", "cards", "map", "calendar"];
// Remembered per tab, so coming back from a race page lands on the same view.
const VIEW_KEY = "mytrails:view";

// Fallback for when storage is blocked (private windows), so the toggle still works.
let memoryView: View = "list";

function readView(): View {
  try {
    const saved = sessionStorage.getItem(VIEW_KEY) as View | null;
    if (saved && views.includes(saved)) return saved;
  } catch {}
  return memoryView;
}

function subscribeView(onChange: () => void) {
  window.addEventListener(VIEW_KEY, onChange);
  return () => window.removeEventListener(VIEW_KEY, onChange);
}

function saveView(view: View) {
  memoryView = view;
  try {
    sessionStorage.setItem(VIEW_KEY, view);
  } catch {}
  window.dispatchEvent(new Event(VIEW_KEY));
}

const defaultFilters: RaceFilters = { country: "all", distance: "all", itraOnly: false, search: "" };

const monthName = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
const updatedFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

export function RaceExplorer({ races, crawledAt }: { races: Race[]; crawledAt: string }) {
  const view = useSyncExternalStore(subscribeView, readView, () => "list" as View);
  const [filters, setFilters] = useState<RaceFilters>(defaultFilters);
  const [month, setMonth] = useState<Date>(() => {
    const first = races[0] ? toDate(races[0].date_start) : new Date();
    return new Date(first.getFullYear(), first.getMonth(), 1);
  });
  // A month picked in the season strip narrows the list, cards and map; the calendar just shows it.
  const [monthOnly, setMonthOnly] = useState(false);


  const countries = useMemo(
    () =>
      [...new Set(races.map((r) => r.country))]
        .sort()
        .map((c) => ({ value: c, label: `${c} (${races.filter((r) => r.country === c).length})` })),
    [races],
  );
  const matching = useMemo(() => races.filter((r) => matches(r, filters)), [races, filters]);
  const shown = useMemo(() => {
    if (!monthOnly || view === "calendar") return matching;
    return matching.filter((r) => {
      const d = toDate(r.date_start);
      return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth();
    });
  }, [matching, monthOnly, month, view]);
  const next = races.find((r) => daysUntil(r.date_start) >= 0);
  const filtered =
    monthOnly || filters.country !== "all" || filters.distance !== "all" || filters.itraOnly || filters.search !== "";
  const clearAll = () => {
    setFilters(defaultFilters);
    setMonthOnly(false);
  };

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
        races={matching}
        month={monthOnly || view === "calendar" ? month : null}
        onPick={(m) => {
          const same = monthOnly && m.getTime() === month.getTime();
          setMonth(m);
          setMonthOnly(!same);
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
            onValueChange={(v) => saveView(v as View)}
            buttons={[
              { value: "list", label: "List", prefixIcon: "list" },
              { value: "cards", label: "Cards", prefixIcon: "grid" },
              { value: "map", label: "Map", prefixIcon: "map" },
              { value: "calendar", label: "Calendar", prefixIcon: "calendar" },
            ]}
          />
        </Row>

        <Row gap="8" vertical="center" horizontal="between" wrap>
          <Text textVariant="body-default-s" onBackground="neutral-weak" aria-live="polite">
            {shown.length === races.length
              ? `Showing all ${races.length} races`
              : `Showing ${shown.length} of ${races.length} races`}
            {monthOnly && view !== "calendar" ? ` in ${monthName.format(month)}` : ""}
          </Text>
          {filtered && (
            <Button size="s" variant="tertiary" prefixIcon="close" onClick={clearAll}>
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
              <Button variant="secondary" onClick={clearAll}>
                Show all races
              </Button>
            }
          />
        </Column>
      ) : view === "list" ? (
        <RaceList races={shown} />
      ) : view === "cards" ? (
        <RaceCards races={shown} />
      ) : view === "map" ? (
        <RaceMap races={shown} />
      ) : (
        <RaceCalendar races={shown} month={month} onMonthChange={setMonth} />
      )}
    </Column>
  );
}
