"use client";

import { Button, Column, Feedback } from "@once-ui-system/core";

export default function RacesError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Column as="main" fillWidth horizontal="center" paddingX="24" paddingY="104">
      <Column maxWidth="s" gap="16">
        <Feedback
          tone="danger"
          title="The race calendar didn't load"
          description="Something went wrong reading the race data. Try again in a moment."
        >
          <Button size="s" variant="secondary" prefixIcon="refresh" onClick={reset}>
            Retry
          </Button>
        </Feedback>
      </Column>
    </Column>
  );
}
