import "server-only";

// GPX → elevation profile, the same processing as crawler/gpx.py: smoothed
// climb (raw GPS elevation jitters and inflates D+), ~300 evenly spaced points.

export type Track = {
  distance_km: number;
  elevation_gain_m: number;
  elevation_loss_m: number;
  max_m: number;
  min_m: number;
  start: [number, number]; // [lat, lng]
  profile: [number, number][]; // [km, m]
};

const POINTS = 300;
const SMOOTH = 5;

function haversine(a: [number, number], b: [number, number]) {
  const rad = Math.PI / 180;
  const dLat = (b[0] - a[0]) * rad;
  const dLon = (b[1] - a[1]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export function parseGpx(xml: string): Track | null {
  const pts: [number, number, number][] = [];
  // trkpt or rtept with lat/lon attributes and an <ele> child, in any namespace prefix.
  const re = /<(?:\w+:)?(?:trkpt|rtept)\b([^>]*)>([\s\S]*?)<\/(?:\w+:)?(?:trkpt|rtept)>/g;
  for (let m = re.exec(xml); m; m = re.exec(xml)) {
    const lat = /lat="([-\d.]+)"/.exec(m[1]);
    const lon = /lon="([-\d.]+)"/.exec(m[1]);
    const ele = /<(?:\w+:)?ele>([-\d.]+)</.exec(m[2]);
    if (lat && lon && ele) pts.push([Number(lat[1]), Number(lon[1]), Number(ele[1])]);
  }
  if (pts.length < 20) return null;

  const dist = [0];
  for (let i = 1; i < pts.length; i++) dist.push(dist[i - 1] + haversine([pts[i - 1][0], pts[i - 1][1]], [pts[i][0], pts[i][1]]));
  const total = dist[dist.length - 1];
  if (total < 2) return null;

  const ele = pts.map((p) => p[2]);
  const smooth = ele.map((_, i) => {
    const win = ele.slice(Math.max(0, i - SMOOTH), i + SMOOTH + 1);
    return win.reduce((s, v) => s + v, 0) / win.length;
  });
  let gain = 0;
  let loss = 0;
  for (let i = 1; i < smooth.length; i++) {
    const d = smooth[i] - smooth[i - 1];
    if (d > 0) gain += d;
    else loss -= d;
  }

  const profile: [number, number][] = [];
  let j = 0;
  for (let k = 0; k < POINTS; k++) {
    const target = (total * k) / (POINTS - 1);
    while (j < dist.length - 2 && dist[j + 1] < target) j++;
    const span = dist[j + 1] - dist[j] || 1;
    const t = Math.min(1, Math.max(0, (target - dist[j]) / span));
    profile.push([Math.round(target * 100) / 100, Math.round(smooth[j] + (smooth[j + 1] - smooth[j]) * t)]);
  }

  return {
    distance_km: Math.round(total * 10) / 10,
    elevation_gain_m: Math.round(gain),
    elevation_loss_m: Math.round(loss),
    max_m: Math.round(Math.max(...smooth)),
    min_m: Math.round(Math.min(...smooth)),
    start: [pts[0][0], pts[0][1]],
    profile,
  };
}
