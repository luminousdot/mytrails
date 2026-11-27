"use client";

import { Column, Row, SmartLink, Text } from "@once-ui-system/core";
import { LineChart } from "@once-ui-system/core/data";
import { useMemo } from "react";
import { formatKm } from "../lib/race-utils";
import type { Race } from "../lib/types";

type Point = { km: number; elevation: number };

export function ElevationProfile({
  points,
  profile,
}: {
  points: [number, number][];
  profile: NonNullable<Race["profile"]>;
}) {
  const data = useMemo<Point[]>(() => points.map(([km, elevation]) => ({ km, elevation })), [points]);
  const summit = data.reduce((top, p) => (p.elevation > top.elevation ? p : top), data[0]);
  const total = Math.round(data[data.length - 1].km * 10) / 10;

  return (
    <Column gap="16">
      <Row background="surface" border radius="l" paddingX="20" paddingY="12" gap="24" wrap>
        <Stat label="Track" value={formatKm(profile.distance_km)} />
        <Stat label="Climb" value={`+${profile.elevation_gain_m.toLocaleString("en-GB")} m`} />
        <Stat label="Descent" value={`−${profile.elevation_loss_m.toLocaleString("en-GB")} m`} />
        <Stat label="Highest" value={`${profile.max_m.toLocaleString("en-GB")} m`} />
        <Stat label="Lowest" value={`${profile.min_m.toLocaleString("en-GB")} m`} />
      </Row>
      <LineChart
        data={data}
        xKey="km"
        xAxisType="number"
        xDomain={[0, total]}
        series={{ key: "elevation", label: "Elevation", color: "brand", format: (v) => `${Math.round(v)} m` }}
        valueFormat={(v) => `${Math.round(v)}`}
        curve="monotone"
        variant="gradient"
        legend={{ display: false }}
        grid="y"
        // Start the axis near the course's own low point, not at sea level, so the climbs read.
        yDomain={[Math.max(0, Math.floor((profile.min_m - 50) / 100) * 100), Math.ceil((profile.max_m + 50) / 100) * 100]}
        height="18rem"
        annotations={[
          { x: 0, label: "Start" },
          { x: summit.km, label: `High point ${summit.elevation} m`, tone: "warning" },
          { x: total, label: "Finish" },
        ]}
        aria-label={`Elevation profile: ${formatKm(profile.distance_km)}, climbing ${profile.elevation_gain_m} m, from ${profile.min_m} m to ${profile.max_m} m.`}
      />
      <Row horizontal="between" wrap gap="8">
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          {profile.distance_name ? `${profile.distance_name} course. ` : ""}Distance in km along the course;
          climb smoothed from the GPX track.
        </Text>
        <SmartLink href={profile.url} suffixIcon="download">
          Download GPX
        </SmartLink>
      </Row>
    </Column>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Column gap="2">
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
      <Text textVariant="heading-strong-s">{value}</Text>
    </Column>
  );
}
