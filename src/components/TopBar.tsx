"use client";

import { Button, IconButton, Logo, Row, SegmentedControl, ThemeSwitcher, VisuallyHidden } from "@once-ui-system/core";
import { usePathname, useRouter } from "next/navigation";
import { localePath, locales, switchLocale, type Locale } from "../i18n";
import { useI18n } from "../i18n/I18nProvider";
import { app } from "../resources/app";

export function TopBar() {
  const { lang, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
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
        {t.nav.skip}
      </VisuallyHidden>
      <Row maxWidth="l" vertical="center" horizontal="between" gap="16" s={{ gap: "8" }}>
        <Logo text={app.name} monogram="MT" href={localePath(lang, "/")} />
        <Row gap="8" vertical="center">
          <Row s={{ hide: true }}>
            <Button variant="tertiary" size="s" href={localePath(lang, "/organizers")}>
              {t.nav.organizers}
            </Button>
          </Row>
          {/* Phones: an icon, so the language and theme switches still fit. */}
          <Row hide s={{ hide: false }}>
            <IconButton
              variant="tertiary"
              size="s"
              icon="people"
              href={localePath(lang, "/organizers")}
              tooltip={t.nav.organizers}
              tooltipPosition="bottom"
              aria-label={t.nav.organizers}
            />
          </Row>
          <SegmentedControl
            fillWidth={false}
            compact
            semantics="radio"
            aria-label={t.nav.language}
            value={lang}
            onValueChange={(v) => router.push(switchLocale(pathname, v as Locale))}
            buttons={locales.map((l) => ({ value: l, label: l.toUpperCase() }))}
          />
          <ThemeSwitcher
            collapsed
            labels={{ system: t.nav.themeSystem, light: t.nav.themeLight, dark: t.nav.themeDark }}
          />
        </Row>
      </Row>
    </Row>
  );
}
