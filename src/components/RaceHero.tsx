"use client";

import { Background, Column, Heading, Mask, Media, Row, SegmentedControl, Text } from "@once-ui-system/core";
import { useSyncExternalStore } from "react";
import { daysUntil } from "../lib/race-utils";
import type { Race } from "../lib/types";

/**
 * The page header over a decorative layer. The layer is still being chosen,
 * so the header carries a switcher; the pick is remembered in this browser.
 */
const looks = ["gradient", "dots", "lines", "grid", "photo", "none"] as const;
type Look = (typeof looks)[number];

const LOOK_KEY = "mytrails:hero-look";
let memoryLook: Look = "gradient";

function readLook(): Look {
  try {
    const saved = localStorage.getItem(LOOK_KEY) as Look | null;
    if (saved && looks.includes(saved)) return saved;
  } catch {}
  return memoryLook;
}

function subscribeLook(onChange: () => void) {
  window.addEventListener(LOOK_KEY, onChange);
  return () => window.removeEventListener(LOOK_KEY, onChange);
}

function saveLook(look: Look) {
  memoryLook = look;
  try {
    localStorage.setItem(LOOK_KEY, look);
  } catch {}
  window.dispatchEvent(new Event(LOOK_KEY));
}

const updatedFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

export function RaceHero({
  races,
  countries,
  crawledAt,
  photo,
}: {
  races: Race[];
  countries: number;
  crawledAt: string;
  photo?: string;
}) {
  const look = useSyncExternalStore(subscribeLook, readLook, () => "gradient" as Look);
  const next = races.find((r) => daysUntil(r.date_start) >= 0);
  const days = next ? daysUntil(next.date_start) : null;
  const nextLine =
    days === null ? "no upcoming starts" : days === 0 ? `${next?.name} is today` : `next start in ${days} ${days === 1 ? "day" : "days"}`;

  return (
    <Column as="section" fillWidth horizontal="center" overflow="hidden" borderBottom>
      {look === "photo" && photo ? (
        <Column position="absolute" top="0" left="0" fill pointerEvents="none" aria-hidden>
          {/* A radial mask fades the photo out towards the edges and into the page. */}
          <Mask x="80%" y="40%" radius="40vw" feather={100} style={{ width: "100%", height: "100%" }}>
            <Media src={photo} alt="" unoptimized objectFit="cover" style={{ height: "100%" }} />
          </Mask>
        </Column>
      ) : look !== "none" ? (
        <Background
          position="absolute"
          top="0"
          left="0"
          fill
          pointerEvents="none"
          mask={{ x: 50, y: 0, radius: "60rem" }}
          gradient={{
            display: look === "gradient",
            colorStart: "brand-alpha-strong",
            colorEnd: "static-transparent",
            x: "70%",
            y: "0%",
            width: "120%",
            height: "120%",
            tilt: -15,
            opacity: 70,
          }}
          dots={{ display: look === "dots", color: "brand-alpha-strong", size: "16", opacity: 90 }}
          lines={{ display: look === "lines", color: "brand-alpha-medium", size: "12", thickness: 1, angle: -30, opacity: 90 }}
          grid={{ display: look === "grid", color: "neutral-alpha-medium", width: "48px", height: "48px", opacity: 60 }}
        />
      ) : null}

      <Column zIndex={1} maxWidth="l" paddingX="24" paddingTop="80" paddingBottom="56" gap="24">
        <Column gap="12">
          <Text textVariant="label-default-s" onBackground="brand-medium">
            Southeast Europe · trail &amp; mountain races
          </Text>
          <Heading as="h1" textVariant="display-strong-m" wrap="balance">
            Find your next start line
          </Heading>
          <Text textVariant="body-default-l" onBackground="neutral-medium" wrap="pretty">
            {races.length} races in {countries} countries, {nextLine}. Updated from ITRA on{" "}
            {updatedFmt.format(new Date(crawledAt))}.
          </Text>
        </Column>

        <Row gap="8" vertical="center" wrap>
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            Header style
          </Text>
          <SegmentedControl
            // The saved look is only known after hydration; remount so the indicator follows it.
            key={look}
            fillWidth={false}
            compact
            aria-label="Header style"
            value={look}
            onValueChange={(v) => saveLook(v as Look)}
            buttons={[
              { value: "gradient", label: "Gradient" },
              { value: "dots", label: "Dots" },
              { value: "lines", label: "Lines" },
              { value: "grid", label: "Grid" },
              ...(photo ? [{ value: "photo", label: "Photo fade" }] : []),
              { value: "none", label: "None" },
            ]}
          />
        </Row>
      </Column>
    </Column>
  );
}
