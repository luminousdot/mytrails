---
name: My Trails
description: Trail and mountain race calendar for Southeast Europe, Serbia first
colors:
  trail-blaze: "#D9480F"
  trail-blaze-text-light: "oklch(0.4815 0.1583 37.88)"
  trail-blaze-text-dark: "oklch(0.9167 0.0441 37.88)"
  sand-page-light: "lab(98.953% -0.335 4.073)"
  sand-page-dark: "lab(2.464% -0.143 1.620)"
  surface-light: "#ffffff"
  surface-dark: "lab(7.229% -0.340 3.216)"
  ink-strong-light: "lab(2.464% -0.143 1.620)"
  ink-medium-light: "lab(27.013% -0.659 4.443)"
  ink-weak-light: "lab(38.677% -0.215 4.341)"
  ink-strong-dark: "#ffffff"
  ink-medium-dark: "lab(89.524% -0.341 4.190)"
  ink-weak-dark: "lab(73.321% -0.217 3.859)"
  border-light: "lab(89.524% -0.341 4.190)"
  border-dark: "lab(27.013% -0.659 4.443)"
  distance-short: "lab(37.827% -35.848 22.954)"
  distance-marathon: "lab(37.009% -3.041 -42.516)"
  distance-long: "lab(38.389% 32.354 47.243)"
  distance-ultra: "lab(38.674% 62.608 49.596)"
typography:
  display:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 600
    lineHeight: 1.09
  headline:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontWeight: 600
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
  label:
    fontFamily: "Inter, sans-serif"
    fontFeature: "tnum"
  code:
    fontFamily: "Geist Mono, monospace"
rounded:
  s: "0.25rem"
  m: "0.375rem"
  l: "0.625rem"
  xl: "0.75rem"
  full: "999rem"
components:
  button-primary:
    backgroundColor: "{colors.trail-blaze}"
    textColor: "{colors.surface-light}"
    rounded: "{rounded.m}"
  panel:
    backgroundColor: "{colors.surface-light}"
    rounded: "{rounded.l}"
  tag-distance-ultra:
    textColor: "{colors.distance-ultra}"
    rounded: "{rounded.s}"
---

# Design System: My Trails

## Overview

**Creative North Star: "Trail Blaze"**

The paint marks on rocks along a mountain path: you only see them where they matter, and when you see one you know where to go. The pages are calm warm sand, the content is plain and sturdy, and the orange blaze appears only where it marks the way: the primary action, the current choice, a race's date.

The system is Once UI, configured rather than overridden (`src/resources/once-ui.config.ts`): brand seed `#D9480F`, sand neutrals, cyan accent, `solid: "color"`, `border: "conservative"`, `surface: "filled"`, normal density. It is flat: depth comes from borders and tone, not shadows. Light and dark are both first-class and every screen is checked in both.

Imagery is real or functional only: an organiser's race photo, a map of the start area, an elevation profile from a GPX track. Nothing decorative stands in for course detail.

**Key Characteristics:**
- Calm sand page, white (or near-black) panels, one orange.
- Flat, bordered panels; no shadows.
- Sturdy and plain controls with conservative corners.
- Numbers (km, metres, dates) line up and read first.
- Data is honest: no fake photos, profiles or stats.

## Colors

- **Trail Blaze orange** (`#D9480F`) is the brand: primary buttons, selected states, the date block on cards, links. Brand text uses the darker step in light mode and the lightest step in dark mode, never the raw seed on the page.
- **Sand neutrals** carry everything else: page, panels, text in three weights (strong, medium, weak), borders.
- **Distance colours** are a fixed key, used on tags, map pins and agenda dots, always with their label: Short (under 21 km) green, Marathon (21–44 km) cyan accent, Long (45–79 km) amber, Ultra (80 km+) red. Never use them for anything else.
- Series tags (such as WST) use the brand tone with a flag icon.

## Typography

- **Bricolage Grotesque** for display and headings only: the page title (`display-strong-m` on the home hero, `display-strong-s` on race pages) and section titles (`display-strong-xs`).
- **Inter** for body and labels. App text a runner must read is at least `body-default-s`.
- **Geist Mono** only for code. Never JetBrains Mono.
- Tables and number rows use tabular figures (`data-tabular`, set in `custom.css`).
- No eyebrow labels above headings; context goes in the line under the title.

## Layout

- Page width `maxWidth="l"`, 24px side padding, centred.
- Home: top bar, full-width hero (title, one line of context, the race photo fading in from the right), then filters and the results.
- Results come in four views, in this order: List (default), Cards, Map, Calendar (a month agenda). The chosen view is remembered per tab.
- Phones: search and the view switch stay visible; the other filters open in a bottom sheet with a live "Show N races" button. In the list, the date and distance move into the race cell.
- Race page: breadcrumb, title with date and place under it, actions (ITRA, website, Register), photo banner only when a real photo exists, stats, elevation profile, distances and the start-area map side by side, then other races that month.

## Elevation & Depth

Flat. Panels and cards sit on the page with a 1px border and the surface tone, never a shadow. Separation inside a panel is spacing plus a top border between rows. The only layered effects are the hero's photo fade (a radial `Mask`) and Once UI's own overlays (dropdowns, the filter sheet).

## Shapes

Conservative corners: `radius-l` (0.625rem) for panels, cards and maps, `radius-m` for the date block, `radius-full` for pins and the distance dots. Covers and maps are clipped to their panel's corners.

## Components

- **Race card:** cover (photo, or a static map of the start area with a pin in the distance colour), date block (day, month, year when not this year), name, place, longest distance and climb, then a row of tags (distance, series, ITRA points) and "in N days".
- **Race list:** a Once UI `Table` whose rows are the races themselves, so every column sorts by its real value.
- **Month agenda:** each race day with weekday and date, its races with place, distance, climb and tags; previous/next month and a jump to the next month with races.
- **Map:** Once UI `Map` with clustered dot pins in the distance colours and the colour key under it.
- **Elevation profile:** one stats panel (track, climb, descent, highest, lowest) and a Once UI `LineChart` with the y axis starting near the course's low point and Start, High point and Finish marks.
- **Empty and error states:** Once UI `EmptyState` with a way back (clear filters, jump to a month with races); route errors use `Feedback` with Retry.

## Do's and Don'ts

- **Do** use Once UI components and tokens only; read `node_modules/@once-ui-system/core/AGENTS.md` before writing UI.
- **Do** keep orange for things that mark the way; let everything else be sand.
- **Do** show real course data first: distance, climb, profile, ITRA points.
- **Do** check every screen in light and dark, and at phone width.
- **Don't** add shadows, glows or glass to panels.
- **Don't** use stock photos or drawn placeholders as if they were the race.
- **Don't** use the distance colours decoratively or without their label.
- **Don't** put a small label above a heading.
