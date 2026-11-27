"use client";

import { Text } from "@once-ui-system/core";
import { daysUntil } from "../lib/race-utils";

// "Today" depends on the visitor's clock, so it is worked out in the browser,
// not baked into the prerendered page.
export function StartsIn({ date }: { date: string }) {
  const days = daysUntil(date);
  return (
    <Text textVariant="heading-strong-l" suppressHydrationWarning>
      {days === 0 ? "Today" : days === 1 ? "Tomorrow" : days < 0 ? "Finished" : `In ${days} days`}
    </Text>
  );
}
