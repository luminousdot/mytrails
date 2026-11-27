"use client";

import { Card, Column, Row, Text } from "@once-ui-system/core";
import { toDate } from "../lib/race-utils";
import type { Race } from "../lib/types";

const monthFmt = new Intl.DateTimeFormat("en-GB", { month: "short" });

/**
 * Twelve months from the first race, each a column whose bar is that month's
 * race count. Reads as the season's shape at a glance and jumps the calendar.
 */
export function SeasonStrip({
  races,
  month,
  onPick,
}: {
  races: Race[];
  month: Date;
  onPick: (month: Date) => void;
}) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const months = Array.from({ length: 12 }, (_, i) => new Date(start.getFullYear(), start.getMonth() + i, 1));
  const counts = months.map(
    (m) =>
      races.filter((r) => {
        const d = toDate(r.date_start);
        return d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth();
      }).length,
  );
  const max = Math.max(1, ...counts);

  return (
    <Column gap="8">
      <Text textVariant="label-default-s" onBackground="neutral-weak" id="season-label">
        Races per month · pick a month
      </Text>
      <Row as="nav" aria-labelledby="season-label" gap="4" fillWidth overflowX="auto" scrollbar="minimal">
        {months.map((m, i) => {
          const active = m.getFullYear() === month.getFullYear() && m.getMonth() === month.getMonth();
          const showYear = i === 0 || m.getMonth() === 0;
          return (
            <Card
              key={m.toISOString()}
              selected={active}
              aria-label={`${monthFmt.format(m)} ${m.getFullYear()}: ${counts[i]} races`}
              onClick={() => onPick(m)}
              flex={1}
              minWidth="48px"
              gap="8"
              paddingX="4"
              paddingY="8"
              radius="m"
              horizontal="center"
              vertical="end"
              direction="column"
              border={active ? "brand-alpha-medium" : "transparent"}
              background={active ? "brand-alpha-weak" : "transparent"}
              transition="micro-medium"
            >
              <Text textVariant="label-strong-s" onBackground={counts[i] ? "neutral-strong" : "neutral-weak"}>
                {counts[i]}
              </Text>
              <Row fillWidth height="48px" vertical="end" horizontal="center">
                <Row
                  width="16px"
                  radius="s"
                  solid={counts[i] ? (active ? "brand-strong" : "brand-medium") : "neutral-medium"}
                  style={{ height: counts[i] ? `${Math.max(8, (counts[i] / max) * 100)}%` : "2px" }}
                />
              </Row>
              <Column horizontal="center" gap="2">
                <Text textVariant="label-default-s" onBackground={active ? "brand-strong" : "neutral-medium"}>
                  {monthFmt.format(m)}
                </Text>
                <Text textVariant="label-default-xs" onBackground="neutral-weak" style={{ visibility: showYear ? "visible" : "hidden" }}>
                  {m.getFullYear()}
                </Text>
              </Column>
            </Card>
          );
        })}
      </Row>
    </Column>
  );
}
