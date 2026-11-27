// Which decorative layer sits behind the home page. Still being chosen, so
// the page carries a switcher; the pick is remembered in this browser.
export const looks = ["gradient", "dots", "lines", "grid", "photo", "none"] as const;
export type Look = (typeof looks)[number];

const LOOK_KEY = "mytrails:hero-look";
let memoryLook: Look = "gradient";

export function readLook(): Look {
  try {
    const saved = localStorage.getItem(LOOK_KEY) as Look | null;
    if (saved && looks.includes(saved)) return saved;
  } catch {}
  return memoryLook;
}

export function subscribeLook(onChange: () => void) {
  window.addEventListener(LOOK_KEY, onChange);
  return () => window.removeEventListener(LOOK_KEY, onChange);
}

export function saveLook(look: Look) {
  memoryLook = look;
  try {
    localStorage.setItem(LOOK_KEY, look);
  } catch {}
  window.dispatchEvent(new Event(LOOK_KEY));
}

