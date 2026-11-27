import { Column } from "@once-ui-system/core";
import { buckets, longest, raceBucket } from "../lib/race-utils";
import type { Race } from "../lib/types";

/**
 * A cover drawn from the race's own numbers, for races with no photo: contour
 * rings around a few seeded summits, packed tighter the more the race climbs
 * per kilometre, over a ridge line. The same race always draws the same map.
 */
/** Fills its parent; the parent sets the size. */
export function TopoCover({ race }: { race: Race }) {
  const top = longest(race);
  const tone = buckets[raceBucket(race)].tone;
  const rand = seeded(race.id);
  const km = top?.distance_km ?? 20;
  const gain = top?.elevation_gain_m ?? 500;
  // Metres of climb per km: ~20 is rolling, 60+ is a skyrace.
  const steep = Math.min(1, Math.max(0.15, gain / km / 70));

  const W = 400;
  const H = 225;
  const peaks = Array.from({ length: 2 + Math.floor(rand() * 2) }, () => ({
    x: 60 + rand() * (W - 120),
    y: 40 + rand() * (H - 110),
    r: 50 + rand() * 70,
    phase: rand() * Math.PI * 2,
  }));
  const rings = 4 + Math.round(steep * 7);

  const contours = peaks.flatMap((p, pi) =>
    Array.from({ length: rings }, (_, i) => {
      const radius = p.r * (1 - i / (rings + 1));
      return ring(p.x, p.y, radius, p.phase + i * 0.35, 0.18 + 0.1 * steep, `${pi}-${i}`);
    }),
  );

  const ridge = ridgePath(W, H, rand, 30 + steep * 70);

  return (
    <Column
      fill
      overflow="hidden"
      background={`${tone}-alpha-weak`}
      aria-hidden
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
      >
        <g fill="none" stroke={`var(--${tone}-alpha-strong)`} strokeWidth="1">
          {contours.map((c, i) => (
            <path key={c.key} d={c.d} opacity={0.35 + (i % rings) * (0.5 / rings)} />
          ))}
        </g>
        <path d={ridge} fill={`var(--${tone}-alpha-medium)`} />
        {peaks.slice(0, 1).map((p) => (
          <g key="summit" transform={`translate(${p.x} ${p.y})`}>
            <path d="M-6 4 L0 -6 L6 4 Z" fill={`var(--${tone}-solid-strong)`} />
          </g>
        ))}
      </svg>
    </Column>
  );
}

function seeded(key: string) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function ring(cx: number, cy: number, r: number, phase: number, wobble: number, key: string) {
  const steps = 48;
  const pts = Array.from({ length: steps }, (_, i) => {
    const a = (i / steps) * Math.PI * 2;
    const k = 1 + wobble * (Math.sin(a * 2 + phase) * 0.6 + Math.sin(a * 3 - phase * 1.7) * 0.4);
    return [cx + Math.cos(a) * r * k * 1.25, cy + Math.sin(a) * r * k * 0.8];
  });
  const d = `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L")} Z`;
  return { d, key };
}

function ridgePath(W: number, H: number, rand: () => number, amp: number) {
  const n = 9;
  const ys = Array.from({ length: n + 1 }, () => H - 20 - rand() * amp);
  const step = W / n;
  let d = `M0 ${H} L0 ${ys[0].toFixed(1)}`;
  for (let i = 1; i <= n; i++) {
    const x = i * step;
    const cx = x - step / 2;
    d += ` Q${cx.toFixed(1)} ${(Math.min(ys[i - 1], ys[i]) - amp * 0.15).toFixed(1)} ${x.toFixed(1)} ${ys[i].toFixed(1)}`;
  }
  return `${d} L${W} ${H} Z`;
}
