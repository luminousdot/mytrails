"use client";

import { IconButton, Row, useTheme } from "@once-ui-system/core";
import { useI18n } from "../i18n/I18nProvider";

const options = [
  { value: "system", icon: "computer", key: "themeSystem" },
  { value: "light", icon: "light", key: "themeLight" },
  { value: "dark", icon: "dark", key: "themeDark" },
] as const;

/**
 * Light, dark or device theme as three icon buttons, each with a tooltip in the
 * visitor's language (Once UI's ThemeSwitcher has labels but no tooltips).
 */
export function ThemeToggle() {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  return (
    <Row role="radiogroup" aria-label={t.nav.theme} gap="2" border radius="full" padding="2">
      {options.map((o) => (
        <IconButton
          key={o.value}
          icon={o.icon}
          size="s"
          rounded
          variant={theme === o.value ? "secondary" : "tertiary"}
          tooltip={t.nav[o.key]}
          tooltipPosition="bottom"
          aria-label={t.nav[o.key]}
          role="radio"
          aria-checked={theme === o.value}
          onClick={() => setTheme(o.value)}
        />
      ))}
    </Row>
  );
}
