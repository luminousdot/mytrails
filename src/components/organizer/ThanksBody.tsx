"use client";

import { Button, Column, Heading, Icon, Row, Text } from "@once-ui-system/core";
import { useSearchParams } from "next/navigation";

export function ThanksBody() {
  const id = useSearchParams().get("id");
  return (
    <Column background="surface" border radius="l" padding="32" gap="24" s={{ padding: "20" }}>
      <Row gap="12" vertical="center">
        <Icon name="checkCircle" size="l" onBackground="success-medium" />
        <Heading as="h1" textVariant="display-strong-xs">
          Sent for review
        </Heading>
      </Row>
      <Column gap="12">
        <Text textVariant="body-default-l" wrap="pretty">
          Thanks. We’ll check the details and reply by email, usually within a few days. Nothing changes on My
          Trails until then.
        </Text>
        {id && (
          <Text textVariant="body-default-m" onBackground="neutral-medium">
            Your reference: <Text as="span" textVariant="label-strong-m" data-tabular>{id}</Text>. Mention it if you
            write to us.
          </Text>
        )}
      </Column>
      <Row gap="8" wrap>
        <Button href="/" variant="secondary">
          Back to the calendar
        </Button>
        <Button href="/organizers/new" variant="tertiary" prefixIcon="plus">
          Add another race
        </Button>
      </Row>
    </Column>
  );
}
