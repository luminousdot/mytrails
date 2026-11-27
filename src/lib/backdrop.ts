import { useSyncExternalStore } from "react";

// How the home page header looks: a decorative layer behind it, shown as a
// rounded section or a full-width hero. Still being chosen, so the header
// carries switchers; each pick is remembered in this browser.

export const looks = ["gradient", "dots", "lines", "grid", "photo", "none"] as const;
export type Look = (typeof looks)[number];

export const layouts = ["section", "hero"] as const;
export type HeaderLayout = (typeof layouts)[number];

function choice<T extends string>(key: string, options: readonly T[], fallback: T) {
  // Fallback for when storage is blocked (private windows), so the switch still works.
  let memory = fallback;
  const read = (): T => {
    try {
      const saved = localStorage.getItem(key) as T | null;
      if (saved && options.includes(saved)) return saved;
    } catch {}
    return memory;
  };
  const subscribe = (onChange: () => void) => {
    window.addEventListener(key, onChange);
    return () => window.removeEventListener(key, onChange);
  };
  const save = (value: T) => {
    memory = value;
    try {
      localStorage.setItem(key, value);
    } catch {}
    window.dispatchEvent(new Event(key));
  };
  // The server renders the fallback; the saved pick takes over after hydration.
  const use = () => useSyncExternalStore(subscribe, read, () => fallback);
  return { use, save };
}

const look = choice<Look>("mytrails:hero-look", looks, "gradient");
const layout = choice<HeaderLayout>("mytrails:header-layout", layouts, "section");

export const useLook = look.use;
export const saveLook = look.save;
export const useHeaderLayout = layout.use;
export const saveHeaderLayout = layout.save;
