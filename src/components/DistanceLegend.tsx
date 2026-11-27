"use client";

import { Row } from "@once-ui-system/core";
import { useI18n } from "../i18n/I18nProvider";
import { bucketKeys, buckets } from "../lib/race-utils";

/** Colour key for agenda dots and map pins: the longest distance at the event. */
export function DistanceLegend() {
  const { t } = useI18n();
  return (
    <Row as="ul" gap="16" paddingX="4" wrap aria-label={t.legendLabel}>
      {bucketKeys.map((b) => (
        <Row as="li" key={b} gap="8" vertical="center" textVariant="body-default-s" onBackground="neutral-medium">
          <Row width="12px" height="12px" radius="full" solid={`${buckets[b].tone}-medium`} />
          {t.buckets[b].label} · {t.buckets[b].range}
        </Row>
      ))}
    </Row>
  );
}
