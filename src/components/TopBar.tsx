"use client";

import { Button, Logo, Row, ThemeSwitcher, VisuallyHidden } from "@once-ui-system/core";
import { app } from "../resources/app";
import { StylePreview } from "./StylePreview";

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
            <Button
              variant="tertiary"
              size="s"
              suffixIcon="arrowUpRight"
              href="https://itra.run/Races/RaceMap"
            >
              Data: ITRA
            </Button>
          </Row>
          <StylePreview />
          <ThemeSwitcher collapsed />
        </Row>
      </Row>
    </Row>
  );
}
