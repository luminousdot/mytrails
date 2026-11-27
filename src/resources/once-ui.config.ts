import type { OnceUIDataStyleConfig, OnceUIStyleConfig } from "@once-ui-system/core";

// Trail-blaze orange on warm sand: the paint marks on rocks along a mountain path.
export const style: OnceUIStyleConfig = {
  // Keep "system" so the theme switch works; defaultTheme picks the first visit.
  theme: "system",
  defaultTheme: "system",
  neutral: "sand",
  brand: "custom",
  brandSeed: "#D9480F",
  accent: "cyan",
  solid: "color",
  solidStyle: "flat",
  border: "conservative",
  surface: "filled",
  transition: "all",
  scaling: "100",
};

export const dataStyle: OnceUIDataStyleConfig = {
  variant: "gradient",
  mode: "categorical",
  height: 24,
  axis: { stroke: "var(--neutral-alpha-weak)" },
  tick: { fill: "var(--neutral-on-background-weak)", fontSize: 11, line: false },
};
