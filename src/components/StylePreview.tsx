"use client";

import { Button, Column, Dropdown, SegmentedControl, Text, useStyle } from "@once-ui-system/core";
import { useEffect, useSyncExternalStore } from "react";

/**
 * A temporary switcher for two open design decisions, depth and feel, so they
 * can be compared on the real pages. Remove it once both are decided and the
 * winners are written into once-ui.config.ts and custom.css.
 */

type Depth = "flat" | "soft";
type Feel = "sturdy" | "airy";

const DEPTH_KEY = "mytrails:depth";
let memoryDepth: Depth = "flat";

function readDepth(): Depth {
  try {
    const saved = localStorage.getItem(DEPTH_KEY);
    if (saved === "flat" || saved === "soft") return saved;
  } catch {}
  return memoryDepth;
}

function subscribeDepth(onChange: () => void) {
  window.addEventListener(DEPTH_KEY, onChange);
  return () => window.removeEventListener(DEPTH_KEY, onChange);
}

function saveDepth(depth: Depth) {
  memoryDepth = depth;
  try {
    localStorage.setItem(DEPTH_KEY, depth);
  } catch {}
  window.dispatchEvent(new Event(DEPTH_KEY));
}

// Feel is Once UI's own style: shape, surface and how roomy the controls are.
const feels = {
  sturdy: { border: "conservative", surface: "filled", density: "normal" },
  airy: { border: "playful", surface: "translucent", density: "spacious" },
} as const;

export function StylePreview() {
  const depth = useSyncExternalStore(subscribeDepth, readDepth, () => "flat" as Depth);
  const style = useStyle();
  const feel: Feel = style.border === "playful" ? "airy" : "sturdy";

  // custom.css keys the soft shadows off this attribute.
  useEffect(() => {
    document.documentElement.setAttribute("data-mt-depth", depth);
  }, [depth]);

  return (
    <Dropdown
      placement="bottom-end"
      trigger={
        <Button size="s" variant="tertiary" prefixIcon="swatch" suffixIcon="chevronDown">
          Style
        </Button>
      }
    >
      <Column padding="16" gap="16" minWidth="16rem">
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          Design preview · not decided yet
        </Text>
        <Column gap="8">
          <Text textVariant="label-strong-s">Depth</Text>
          <SegmentedControl
            key={`depth-${depth}`}
            aria-label="Depth"
            value={depth}
            onValueChange={(v) => saveDepth(v as Depth)}
            buttons={[
              { value: "flat", label: "Flat" },
              { value: "soft", label: "Soft shadows" },
            ]}
          />
        </Column>
        <Column gap="8">
          <Text textVariant="label-strong-s">Feel</Text>
          <SegmentedControl
            key={`feel-${feel}`}
            aria-label="Feel"
            value={feel}
            onValueChange={(v) => style.setStyle({ ...feels[v as Feel] })}
            buttons={[
              { value: "sturdy", label: "Sturdy & plain" },
              { value: "airy", label: "Light & airy" },
            ]}
          />
        </Column>
      </Column>
    </Dropdown>
  );
}
