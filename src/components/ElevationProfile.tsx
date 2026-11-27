"use client";

import { Column, Row, SmartLink, Text } from "@once-ui-system/core";
import { LineChart } from "@once-ui-system/core/data";
import { useMemo } from "react";
import { fill } from "../i18n";
import { useI18n } from "../i18n/I18nProvider";
import { formatKm, formatNumber } from "../lib/race-utils";
import { Hint } from "./Hint";
import type { Race } from "../lib/types";

type Point = { km: number; elevation: number };

export function ElevationProfile({
  points,
  profile,
}: {
  points: [number, number][];
  profile: NonNullable<Race["profile"]>;
}) {
  const { lang, t } = useI18n();
  const m = (v: number) => `${formatNumber(v, lang)} m`;
  const data = useMemo<Point[]>(() => points.map(([km, elevation]) => ({ km, elevation })), [points]);
  const summit = data.reduce((top, p) => (p.elevation > top.elevation ? p : top), data[0]);
  const total = Math.round(data[data.length - 1].km * 10) / 10;

  return (
    <Column gap="16">
      <Row background="surface" border radius="l" paddingX="20" paddingY="12" gap="24" wrap>
        <Stat label={t.profile.track} value={formatKm(profile.distance_km, lang)} />
        <Stat label={t.profile.climb} hint={t.hints.climb} value={`+${m(profile.elevation_gain_m)}`} />
        <Stat label={t.profile.descent} hint={t.hints.descent} value={`−${m(profile.elevation_loss_m)}`} />
        <Stat label={t.profile.highest} value={m(profile.max_m)} />
        <Stat label={t.profile.lowest} value={m(profile.min_m)} />
      </Row>
      <LineChart
        data={data}
        xKey="km"
        xAxisType="number"
        xDomain={[0, total]}
        series={{ key: "elevation", label: t.profile.elevation, color: "brand", format: (v) => m(Math.round(v)) }}
        locale={lang === "sr" ? "sr-Latn-RS" : "en-GB"}
        valueFormat={(v) => `${Math.round(v)}`}
        curve="monotone"
        variant="gradient"
        legend={{ display: false }}
        grid="y"
        // Start the axis near the course's own low point, not at sea level, so the climbs read.
        yDomain={[Math.max(0, Math.floor((profile.min_m - 50) / 100) * 100), Math.ceil((profile.max_m + 50) / 100) * 100]}
        height="18rem"
        annotations={[
          { x: 0, label: t.profile.start },
          { x: summit.km, label: fill(t.profile.highPoint, { m: formatNumber(summit.elevation, lang) }), tone: "warning" },
          { x: total, label: t.profile.finish },
        ]}
        aria-label={fill(t.profile.aria, {
          km: formatKm(profile.distance_km, lang),
          gain: profile.elevation_gain_m,
          min: profile.min_m,
          max: profile.max_m,
        })}
      />
      <Row horizontal="between" wrap gap="8">
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          {profile.distance_name ? fill(t.profile.course, { name: profile.distance_name }) : ""}
          {t.profile.note}
        </Text>
        <SmartLink href={profile.url} suffixIcon="download">
          {t.profile.download}
        </SmartLink>
      </Row>
    </Column>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  const text = (
    <Text textVariant="label-default-s" onBackground="neutral-weak">
      {label}
    </Text>
  );
  return (
    <Column gap="2">
      {hint ? <Hint text={hint}>{text}</Hint> : text}
      <Text textVariant="heading-strong-s">{value}</Text>
    </Column>
  );
}
