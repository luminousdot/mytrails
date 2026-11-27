"use client";

import {
  Button,
  Checkbox,
  Drawer,
  Column,
  EmptyState,
  Icon,
  Input,
  Row,
  SegmentedControl,
  Select,
  Text,
} from "@once-ui-system/core";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import { buckets, matches, seriesName, toDate } from "../lib/race-utils";
import type { DistanceBucket, Race, RaceFilters, RaceSeries } from "../lib/types";
import { RaceAgenda } from "./RaceAgenda";
import { RaceCards } from "./RaceCards";
import { RaceList } from "./RaceList";
import { RaceMap } from "./RaceMap";
import { SeasonStrip } from "./SeasonStrip";

type View = "list" | "cards" | "map" | "calendar";

// Races-per-month strip, hidden for now; flip to bring it back.
const SHOW_SEASON_STRIP = false;

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

const defaultFilters: RaceFilters = { country: "all", series: "all", distance: "all", itraOnly: false, search: "" };

const monthName = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

export function RaceExplorer({
  races,
  series,
}: {
  races: Race[];
  series: RaceSeries[];
}) {
  const view = useSyncExternalStore(subscribeView, readView, () => "list" as View);
  // A race page links here with ?series=wst to show that series.
  const seriesParam = useSearchParams().get("series");
  const [filters, setFilters] = useState<RaceFilters>(() => ({
    ...defaultFilters,
    series: series.some((s) => s.slug === seriesParam) ? (seriesParam as string) : "all",
  }));
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
  const filtered =
    monthOnly || filters.country !== "all" || filters.series !== "all" || filters.distance !== "all" || filters.itraOnly || filters.search !== "";
  const clearAll = () => {
    setFilters(defaultFilters);
    setMonthOnly(false);
  };

  const set = (patch: Partial<RaceFilters>) => setFilters((f) => ({ ...f, ...patch }));
  const [sheetOpen, setSheetOpen] = useState(false);

  // Each control is rendered in the desktop bar and in the phone sheet, so ids carry where they live.
  type Place = "bar" | "phone" | "sheet";
  const search = (where: Place) => (
    <Input
      id={`race-search-${where}`}
      size="xxs"
      label="Search races, towns, countries"
      prefix={<Icon name="search" size="s" onBackground="neutral-weak" />}
      value={filters.search}
      onValueChange={(v) => set({ search: v })}
    />
  );
  const countrySelect = (where: Place) => (
    <Select
      id={`race-country-${where}`}
      size={where === "sheet" ? "s" : "xxs"}
      label="Country"
      searchable
      value={filters.country}
      onValueChange={(v) => set({ country: v as string })}
      options={[{ value: "all", label: "All countries" }, ...countries]}
    />
  );
  const seriesSelect = (where: Place) => (
    <Select
      id={`race-series-${where}`}
      size={where === "sheet" ? "s" : "xxs"}
      label="Series"
      value={filters.series}
      onValueChange={(v) => set({ series: v as string })}
      options={[
        { value: "all", label: "All series" },
        ...series.map((s) => ({
          value: s.slug,
          label: seriesName(s.title).short,
          description: seriesName(s.title).long,
        })),
      ]}
    />
  );
  const itraCheckbox = (where: Place) => (
    <Checkbox
      id={`race-itra-${where}`}
      label="ITRA points only"
      checked={filters.itraOnly}
      onCheckedChange={(checked) => set({ itraOnly: checked })}
    />
  );
  const distanceControl = (fill: boolean) => (
    <SegmentedControl
      fillWidth={fill}
      semantics="radio"
      aria-label="Distance"
      value={filters.distance}
      onValueChange={(v) => set({ distance: v as RaceFilters["distance"] })}
      buttons={[
        { value: "all", label: fill ? "Any" : "Any distance" },
        ...(Object.keys(buckets) as DistanceBucket[]).map((b) => ({
          value: b,
          label: buckets[b].label,
          tooltip: buckets[b].range,
        })),
      ]}
    />
  );
  const viewControl = (fill: boolean) => (
    <SegmentedControl
      // The saved view is only known after hydration; remount so the indicator follows it.
      key={`view-${view}`}
      fillWidth={fill}
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
  );
  // Filters in the sheet, counted on its button (search stays outside it).
  const activeFilters =
    Number(filters.country !== "all") + Number(filters.series !== "all") + Number(filters.distance !== "all") + Number(filters.itraOnly);



  return (
    <Column maxWidth="l" gap="32">

      {SHOW_SEASON_STRIP && (
        <SeasonStrip
          races={matching}
          month={monthOnly || view === "calendar" ? month : null}
          onPick={(m) => {
            const same = monthOnly && m.getTime() === month.getTime();
            setMonth(m);
            setMonthOnly(!same);
          }}
        />
      )}

      <Column gap="16">
        {/* Desktop and tablet: every filter in view. */}
        <Column gap="16" s={{ hide: true }}>
          <Row gap="12" vertical="center" wrap>
            <Row flex={1} minWidth="16rem">
              {search("bar")}
            </Row>
            <Row minWidth="14rem">{countrySelect("bar")}</Row>
            {series.length > 0 && <Row minWidth="12rem">{seriesSelect("bar")}</Row>}
            {itraCheckbox("bar")}
          </Row>
          <Row gap="12" vertical="center" horizontal="between" wrap>
            {distanceControl(false)}
            {viewControl(false)}
          </Row>
        </Column>

        {/* Phones: search and the view stay; the other filters open in a sheet. */}
        <Column gap="12" hide s={{ hide: false }}>
          <Row gap="8" vertical="center">
            <Row flex={1} minWidth="0">
              {search("phone")}
            </Row>
            <Button
              size="s"
              variant={activeFilters ? "primary" : "secondary"}
              prefixIcon="filter"
              onClick={() => setSheetOpen(true)}
              aria-haspopup="dialog"
            >
              {activeFilters ? `Filters · ${activeFilters}` : "Filters"}
            </Button>
          </Row>
          {viewControl(true)}
        </Column>

        <Drawer
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          side="bottom"
          title="Filters"
          footer={
            <Row gap="8" fillWidth horizontal="between">
              <Button variant="tertiary" onClick={clearAll} disabled={!filtered}>
                Clear all
              </Button>
              <Button onClick={() => setSheetOpen(false)}>
                {shown.length === 1 ? "Show 1 race" : `Show ${shown.length} races`}
              </Button>
            </Row>
          }
        >
          <Column gap="20" paddingBottom="8">
            {countrySelect("sheet")}
            {series.length > 0 && seriesSelect("sheet")}
            <Column gap="8">
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                Distance
              </Text>
              {distanceControl(true)}
            </Column>
            {itraCheckbox("sheet")}
          </Column>
        </Drawer>

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
        <RaceAgenda races={shown} month={month} onMonthChange={setMonth} />
      )}
    </Column>
  );
}
