"use client";

import { Column, Media } from "@once-ui-system/core";
import { useEffect, useState } from "react";
import type { Race } from "../lib/types";
import { TopoCover } from "./TopoCover";

/**
 * The race's photo (from ITRA or its own website) when it loads, the drawn
 * topo cover otherwise. Photos are hotlinked from sites we don't control, so
 * the topo cover holds the space until the photo has actually loaded. It fills
 * its parent, which sets the size.
 */
export function RaceCover({ race }: { race: Race }) {
  const url = race.cover?.url;
  const [loaded, setLoaded] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    const img = new Image();
    img.onload = () => setLoaded(url);
    img.src = url;
    return () => {
      img.onload = null;
    };
  }, [url]);

  if (!url || loaded !== url) return <TopoCover race={race} />;

  return (
    <Column fill overflow="hidden">
      <Media
        src={url}
        alt=""
        unoptimized
        objectFit="cover"
        sizes="(max-width: 768px) 100vw, 33vw"
        style={{ height: "100%" }}
      />
    </Column>
  );
}
