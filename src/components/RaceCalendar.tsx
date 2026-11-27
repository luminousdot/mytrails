"use client";

import { Column } from "@once-ui-system/core";
import { Calendar, type CalendarEvent } from "@once-ui-system/core/calendar";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { buckets, formatKm, longest, raceBucket, toDate } from "../lib/race-utils";
import type { Race } from "../lib/types";
import { DistanceLegend } from "./DistanceLegend";

export function RaceCalendar({
  races,
  month,
  onMonthChange,
}: {
  races: Race[];
  month: Date;
  onMonthChange: (month: Date) => void;
}) {
  const router = useRouter();
  const slugs = useMemo(() => Object.fromEntries(races.map((r) => [r.id, r.slug])), [races]);
  const events = useMemo<CalendarEvent[]>(
    () =>
      races.map((race) => {
        const start = toDate(race.date_start);
        const last = race.date_end ? toDate(race.date_end) : start;
        // Calendar ends are exclusive: an all-day race on the 12th ends at midnight on the 13th.
        const end = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
        return {
          id: race.id,
          title: `${race.name} · ${formatKm(longest(race)?.distance_km)}`,
          start,
          end,
          allDay: true,
          editable: false,
          tone: buckets[raceBucket(race)].tone,
          description: race.country,
        };
      }),
    [races],
  );

  return (
    <Column background="surface" border radius="l" padding="16" gap="16">
      <Calendar
        aria-label="Race calendar"
        events={events}
        views={["month"]}
        date={month}
        onDateChange={onMonthChange}
        weekStartsOn={1}
        locale="en-GB"
        maxEventsPerDay={3}
        height="44rem"
        onEventSelect={(event) => router.push(`/races/${slugs[event.id]}`)}
      />
      <DistanceLegend />
    </Column>
  );
}
