"use client";

import { Column, Row, Skeleton } from "@once-ui-system/core";
import { useI18n } from "../../i18n/I18nProvider";

export default function Loading() {
  const { t } = useI18n();
  return (
    <Column fillWidth horizontal="center" paddingX="24" paddingTop="104" paddingBottom="80">
      <Column maxWidth="l" gap="32" aria-busy="true" aria-label={t.states.loading}>
        <Column gap="12">
          <Skeleton shape="line" width="16rem" />
          <Skeleton shape="line" size="xl" width="24rem" />
          <Skeleton shape="line" width="32rem" />
        </Column>
        <Row gap="4" fillWidth>
          {Array.from({ length: 12 }, (_, i) => (
            <Skeleton key={i} shape="block" height="104" style={{ flex: 1 }} />
          ))}
        </Row>
        <Skeleton shape="block" height="40rem" />
      </Column>
    </Column>
  );
}
