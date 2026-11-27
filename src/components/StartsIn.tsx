"use client";

import { Text } from "@once-ui-system/core";
import { useI18n } from "../i18n/I18nProvider";
import { startsIn } from "../i18n/words";
import { daysUntil } from "../lib/race-utils";

// "Today" depends on the visitor's clock, so it is worked out in the browser,
// not baked into the prerendered page.
export function StartsIn({ date }: { date: string }) {
  const { lang } = useI18n();
  return (
    <Text textVariant="heading-strong-l" suppressHydrationWarning>
      {startsIn(lang, daysUntil(date))}
    </Text>
  );
}
