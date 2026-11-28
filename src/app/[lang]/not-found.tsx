"use client";

import { Button, Column, EmptyState } from "@once-ui-system/core";
import { localePath } from "../../i18n";
import { useI18n } from "../../i18n/I18nProvider";

export default function NotFound() {
  const { lang, t } = useI18n();
  return (
    <Column as="main" fillWidth horizontal="center" paddingX="24" paddingY="104">
      <EmptyState
        icon="map"
        title={t.states.notFoundTitle}
        description={t.states.notFoundText}
        action={<Button href={localePath(lang, "/")}>{t.states.seeAll}</Button>}
      />
    </Column>
  );
}
