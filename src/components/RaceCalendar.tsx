"use client";

import { Column, Row } from "@once-ui-system/core";
import { Calendar, type CalendarEvent } from "@once-ui-system/core/calendar";
import { useMemo } from "react";
import { buckets, formatKm, longest, raceBucket, toDate } from "../lib/race-utils";
import type { Race } from "../lib/types";

export function RaceCalendar({
  races,
  month,
  onMonthChange,
  onSelect,
}: {
  races: Race[];
  month: Date;
  onMonthChange: (month: Date) => void;
  onSelect: (id: string) => void;
}) {
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
        onEventSelect={(event) => onSelect(event.id)}
      />
      <Legend />
    </Column>
  );
}

function Legend() {
  return (
    <Row as="ul" gap="16" paddingX="4" wrap aria-label="Colour key: longest distance at the event">
      {(Object.keys(buckets) as (keyof typeof buckets)[]).map((b) => (
        <Row as="li" key={b} gap="8" vertical="center" textVariant="body-default-s" onBackground="neutral-medium">
          <Row width="12px" height="12px" radius="full" solid={`${buckets[b].tone}-medium`} />
          {buckets[b].label} · {buckets[b].range}
        </Row>
      ))}
    </Row>
  );
}
