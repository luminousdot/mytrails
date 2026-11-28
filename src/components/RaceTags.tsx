"use client";

import { Tag, Tooltip } from "@once-ui-system/core";
import { fill } from "../i18n";
import { useI18n } from "../i18n/I18nProvider";
import { buckets, seriesName } from "../lib/race-utils";
import type { DistanceBucket } from "../lib/types";

// The small tags on cards, rows and race pages, each explaining itself on hover and focus.
// Series and ITRA use the accent (cyan); distance tags keep their fixed key colours.

export function BucketTag({ bucket }: { bucket: DistanceBucket }) {
  const { t } = useI18n();
  return (
    <Tooltip content={fill(t.hints.bucket, { label: t.buckets[bucket].label, range: t.buckets[bucket].range })}>
      <Tag size="s" tone={buckets[bucket].tone}>
        {t.buckets[bucket].label}
      </Tag>
    </Tooltip>
  );
}

export function ItraTag({ points }: { points: number }) {
  const { t } = useI18n();
  return (
    <Tooltip content={t.hints.itra}>
      <Tag size="s" tone="accent" prefixIcon="medal">
        {fill(t.common.itra, { n: points })}
      </Tag>
    </Tooltip>
  );
}

export function SeriesTag({ title }: { title: string }) {
  const { t } = useI18n();
  const name = seriesName(title);
  return (
    <Tooltip content={fill(t.hints.series, { name: `${name.short} (${name.long})` })}>
      <Tag size="s" tone="accent" prefixIcon="flag">
        {name.short}
      </Tag>
    </Tooltip>
  );
}
