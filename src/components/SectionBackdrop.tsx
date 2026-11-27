"use client";

import { Background, Column, Mask, Media } from "@once-ui-system/core";
import { useSyncExternalStore } from "react";
import { readLook, subscribeLook, type Look } from "../lib/backdrop";

/**
 * A decorative layer behind one section. Put it first inside a section that
 * clips (overflow hidden); the section's content follows it and paints above it.
 */
export function SectionBackdrop({ photo }: { photo?: string }) {
  const look = useSyncExternalStore(subscribeLook, readLook, () => "gradient" as Look);
  return (
    <>
      {look === "photo" && photo ? (
        <Column position="absolute" top="0" left="0" fill pointerEvents="none" aria-hidden>
          {/* A radial mask fades the photo out towards the edges and into the section. */}
          <Mask x="90%" y="40%" radius="28rem" feather={100} style={{ width: "100%", height: "100%" }}>
            <Media src={photo} alt="" unoptimized objectFit="cover" style={{ height: "100%" }} opacity={70} />
          </Mask>
        </Column>
      ) : look !== "none" ? (
        <Background
          position="absolute"
          top="0"
          left="0"
          fill
          pointerEvents="none"
          mask={{ x: 80, y: 0, radius: "48rem" }}
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
    </>
  );
}
