import { Row } from "@once-ui-system/core";
import { buckets } from "../lib/race-utils";

/** Colour key for calendar events and map pins: the longest distance at the event. */
export function DistanceLegend() {
  return (
    <Row as="ul" gap="16" paddingX="4" wrap aria-label="Colour key: longest distance at the event">
      {(Object.keys(buckets) as (keyof typeof buckets)[]).map((b) => (
        <Row as="li" key={b} gap="8" vertical="center" textVariant="body-default-s" onBackground="neutral-medium">
          <Row width="12px" height="12px" radius="full" solid={`${buckets[b].tone}-medium`} />
          {buckets[b].label} · {buckets[b].range}
        </Row>
      ))}
    </Row>
  );
}
