"use client";

import { Button, Column, Feedback } from "@once-ui-system/core";
import { useI18n } from "../../i18n/I18nProvider";

export default function RacesError({ reset }: { error: Error; reset: () => void }) {
  const { t } = useI18n();
  return (
    <Column as="main" fillWidth horizontal="center" paddingX="24" paddingY="104">
      <Column maxWidth="s" gap="16">
        <Feedback
          tone="danger"
          title={t.states.errorTitle}
          description={t.states.errorText}
        >
          <Button size="s" variant="secondary" prefixIcon="refresh" onClick={reset}>
            {t.common.retry}
          </Button>
        </Feedback>
      </Column>
    </Column>
  );
}
