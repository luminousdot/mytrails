"use client";

import { Button, Logo, Row, ThemeSwitcher, VisuallyHidden } from "@once-ui-system/core";
import { app } from "../resources/app";

export function TopBar() {
  return (
    <Row
      as="header"
      fillWidth
      horizontal="center"
      paddingX="24"
      paddingY="12"
      borderBottom
      background="page"
      position="sticky"
      top="0"
      zIndex={2}
    >
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to races
      </VisuallyHidden>
      <Row maxWidth="l" vertical="center" horizontal="between" gap="16">
        <Logo text={app.name} monogram="MT" href="/" />
        <Row gap="8" vertical="center">
          <Row s={{ hide: true }}>
            <Button variant="tertiary" size="s" href="/organizers">
              For organisers
            </Button>
          </Row>
          <Row hide s={{ hide: false }}>
            <Button variant="tertiary" size="s" href="/organizers">
              Organisers
            </Button>
          </Row>
          <ThemeSwitcher collapsed />
        </Row>
      </Row>
    </Row>
  );
}
