import { Column, Media, Row, Text } from "@once-ui-system/core";
import { buckets, raceBucket } from "../lib/race-utils";
import type { Race } from "../lib/types";

// A static map from raster tiles, not a live Map: dozens of cards would each
// need a WebGL context, and browsers stop at around sixteen.
const ZOOM = 10;
const TILE = 256;
const COLS = 6;
const ROWS = 3;

// Esri's grey canvas basemaps: no API key, a light and a dark style, quiet enough to sit under text.
const styles = { light: "World_Light_Gray_Base", dark: "World_Dark_Gray_Base" } as const;

/** The start area as a map, centred on the race's pin. Fills its parent. */
export function MapCover({ race }: { race: Race }) {
  const n = 2 ** ZOOM;
  const x = ((race.lng + 180) / 360) * n * TILE;
  const lat = (race.lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2) * n * TILE;
  const tx0 = Math.floor(x / TILE) - Math.floor(COLS / 2);
  const ty0 = Math.floor(y / TILE) - Math.floor(ROWS / 2);
  // Where the race sits inside the mosaic; the mosaic is shifted so that point is the cover's centre.
  const offsetX = x - tx0 * TILE;
  const offsetY = y - ty0 * TILE;
  const tone = buckets[raceBucket(race)].tone;

  const tiles = Array.from({ length: COLS * ROWS }, (_, i) => {
    const tx = (((tx0 + (i % COLS)) % n) + n) % n;
    const ty = ty0 + Math.floor(i / COLS);
    return { key: `${tx}-${ty}`, tx, ty };
  });

  return (
    <Column
      fill
      overflow="hidden"
      background="neutral-alpha-weak"
      aria-hidden
      // 50cqw/50cqh below are half this box, wherever it is used.
      style={{ containerType: "size" }}
    >
      {(Object.keys(styles) as (keyof typeof styles)[]).map((scheme) => (
        <Row
          key={scheme}
          showIn={scheme}
          position="absolute"
          top="0"
          left="0"
          style={{
            width: COLS * TILE,
            height: ROWS * TILE,
            flexWrap: "wrap",
            transform: `translate(calc(50cqw - ${offsetX}px), calc(50cqh - ${offsetY}px))`,
          }}
        >
          {tiles.map((t) => (
            <Column key={t.key} width={`${TILE}px`} height={`${TILE}px`} flex={0} style={{ flexShrink: 0 }}>
            <Media
              src={`https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/${styles[scheme]}/MapServer/tile/${ZOOM}/${t.ty}/${t.tx}`}
              alt=""
              unoptimized
              style={{ width: TILE, height: TILE }}
            />
            </Column>
          ))}
        </Row>
      ))}
      <Row position="absolute" top="0" left="0" fill center pointerEvents="none">
        <Row
          width="16px"
          height="16px"
          radius="full"
          solid={`${tone}-strong`}
          border="surface"
          borderWidth={2}
          shadow="m"
        />
      </Row>
      <Row position="absolute" bottom="0" right="0" paddingX="8" paddingY="4" background="page" topLeftRadius="s">
        <Text textVariant="label-default-xs" onBackground="neutral-weak">
          © Esri, HERE, Garmin, OpenStreetMap
        </Text>
      </Row>
    </Column>
  );
}
