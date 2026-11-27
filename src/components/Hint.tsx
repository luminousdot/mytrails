"use client";

import { Row, Tooltip } from "@once-ui-system/core";

/**
 * A label with a small info icon that explains it on hover and focus
 * (ITRA points, D+, cut-off). Once UI's Tooltip with no children is that icon.
 */
export function Hint({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <Row gap="4" vertical="center" as="span">
      {children}
      <Tooltip content={text} size="xs" />
    </Row>
  );
}
