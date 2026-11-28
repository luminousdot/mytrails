"use client";

import { Button, Column, Heading, Icon, Row, Text } from "@once-ui-system/core";
import { useSearchParams } from "next/navigation";
import { localePath } from "../../i18n";
import { useI18n } from "../../i18n/I18nProvider";

export function ThanksBody() {
  const { lang, t } = useI18n();
  const id = useSearchParams().get("id");
  return (
    <Column background="surface" border radius="l" padding="32" gap="24" s={{ padding: "20" }}>
      <Row gap="12" vertical="center">
        <Icon name="checkCircle" size="l" onBackground="success-medium" />
        <Heading as="h1" textVariant="display-strong-xs">
          {t.org.thanksTitle}
        </Heading>
      </Row>
      <Column gap="12">
        <Text textVariant="body-default-l" wrap="pretty">
          {t.org.thanksText}
        </Text>
        {id && (
          <Text textVariant="body-default-m" onBackground="neutral-medium">
            {t.org.reference}<Text as="span" textVariant="label-strong-m" data-tabular>{id}</Text>{t.org.referenceTail}
          </Text>
        )}
      </Column>
      <Row gap="8" wrap>
        <Button href={localePath(lang, "/")} variant="secondary">
          {t.org.backToCalendar}
        </Button>
        <Button href={localePath(lang, "/organizers/new")} variant="tertiary" prefixIcon="plus">
          {t.org.addAnother}
        </Button>
      </Row>
    </Column>
  );
}
