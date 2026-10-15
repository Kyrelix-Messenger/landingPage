import { create } from "zustand";
import {
  STORAGE_KEYS,
  applyTheme,
  readStored,
  resolveTheme,
  systemTheme,
  writeStored,
  type BootState,
  type Theme,
  type ThemeSource,
} from "@/shared/boot/boot";

interface ThemeState {
  theme: Theme;
  source: ThemeSource;
  toggle: () => void;
}

/** Surfaces cross-fade for a moment (see .theme-anim in base.css). */
function commit(theme: Theme, source: ThemeSource): void {
  const root = document.documentElement;
  root.classList.add("theme-anim");
  window.setTimeout(() => root.classList.remove("theme-anim"), 600);
  applyTheme(theme);
  useThemeStore.setState({ theme, source });
}

export const useThemeStore = create<ThemeState>((_set, get) => ({
  theme: "light",
  source: "system",

  /**
   * Flip light/dark. Landing on the system theme forgets the override, so a second click
   * returns the site to "follow my device".
   */
  toggle: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    if (next === systemTheme()) {
      writeStored(STORAGE_KEYS.theme, null);
      commit(next, "system");
    } else {
      writeStored(STORAGE_KEYS.theme, next);
      commit(next, "saved");
    }
  },
}));

/** Called once from main.tsx. Returns a cleanup for the listeners. */
export function initTheme(boot: BootState): () => void {
  useThemeStore.setState({ theme: boot.theme, source: boot.themeSource });

  // follow the system theme live, until the visitor picks one explicitly
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (useThemeStore.getState().source === "system")
      commit(systemTheme(), "system");
  };
  query.addEventListener("change", onSystemChange);

  // keep several open tabs in step
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEYS.theme) return;
    const next = resolveTheme(readStored(STORAGE_KEYS.theme), systemTheme());
    commit(next.theme, next.source);
  };
  window.addEventListener("storage", onStorage);

  return () => {
    query.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorage);
  };
}
