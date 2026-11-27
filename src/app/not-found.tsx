import { Button, Column, EmptyState } from "@once-ui-system/core";

export default function NotFound() {
  return (
    <Column as="main" fillWidth horizontal="center" paddingX="24" paddingY="104">
      <EmptyState
        icon="map"
        title="We couldn't find that race"
        description="It may have been renamed on ITRA or dropped from the calendar."
        action={<Button href="/">See all races</Button>}
      />
    </Column>
  );
}
