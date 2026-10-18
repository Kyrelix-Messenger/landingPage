/**
 * Boot kernel. One self-contained file used twice:
 *  1. compiled by vite.config.ts and inlined into <head>, where `bootstrap()` runs before the
 *     first paint, so the page never flashes the wrong theme and the browser sees the final
 *     <html lang>, dir and translate hints before its own language detection (and the
 *     Google Translate bar) runs;
 *  2. imported by the React app, which reuses the same pure functions to switch language/theme.
 *
 * It must stay free of imports (the inline copy is compiled on its own).
 *
 * Language: legacy ?lang=xx → the static page's locale. Browser/storage detection remains a
 * fallback for callers without a page locale. Public pages keep a stable language per URL.
 *
 * Translation hints: when the site is shown in a language it supports natively (or the
 * visitor's own language is supported), machine translation is switched off
 * (<meta name="google" content="notranslate">, translate="no", class="notranslate"), so
 * Chrome/Edge/Google Translate do not show their bar. Only when none of the visitor's
 * languages is supported does the site fall back to English and keep translation available
 * to the browser or any translator extension.
 */

export type LocaleCode =
  "ru" | "en" | "zh" | "es" | "fr" | "de" | "ar" | "pt" | "ja" | "pl";
export type Theme = "light" | "dark";
export type LocaleSource = "url" | "saved" | "browser" | "default";
export type ThemeSource = "system" | "saved";

export interface LocaleInfo {
  readonly code: LocaleCode;
  /** Name in its own language. */
  readonly name: string;
  /** Value for <html lang>. */
  readonly html: string;
  readonly dir: "ltr" | "rtl";
}

/** The messenger's languages, with their names and order. Every one needs a dictionary (tests/locales.test.ts checks). */
export const LOCALES: readonly LocaleInfo[] = [
  { code: "ru", name: "Русский", html: "ru", dir: "ltr" },
  { code: "en", name: "English", html: "en", dir: "ltr" },
  { code: "zh", name: "中文", html: "zh-CN", dir: "ltr" },
  { code: "es", name: "Español", html: "es", dir: "ltr" },
  { code: "fr", name: "Français", html: "fr", dir: "ltr" },
  { code: "de", name: "Deutsch", html: "de", dir: "ltr" },
  { code: "ar", name: "العربية", html: "ar", dir: "rtl" },
  { code: "pt", name: "Português", html: "pt", dir: "ltr" },
  { code: "ja", name: "日本語", html: "ja", dir: "ltr" },
  { code: "pl", name: "Polski", html: "pl", dir: "ltr" },
];

export const DEFAULT_LOCALE: LocaleCode = "en";
export const STORAGE_KEYS = {
  locale: "kyrelix-site-locale",
  theme: "kyrelix-site-theme",
} as const;
const THEME_COLOR: Record<Theme, string> = {
  light: "#e0e7ff",
  dark: "#0f172a",
};

export interface BootState {
  locale: LocaleCode;
  source: LocaleSource;
  /** Does the visitor's browser list at least one language the site supports? */
  userSupported: boolean;
  /** Machine translation is wanted: English is shown because nothing else matched. */
  allowMachineTranslation: boolean;
  theme: Theme;
  themeSource: ThemeSource;
}

export function findLocale(code: string | null | undefined): LocaleInfo | null {
  return LOCALES.find((locale) => locale.code === code) ?? null;
}

/** "de-AT" / "zh_TW" / "PT" → "de" / "zh" / "pt"; null when the site has no such language. */
export function matchTag(tag: unknown): LocaleCode | null {
  if (typeof tag !== "string") return null;
  const primary = tag.replace(/_/g, "-").toLowerCase().split("-")[0];
  return findLocale(primary)?.code ?? null;
}

/** First entry of an Accept-Language-like list that the site supports. */
export function matchLanguages(list: readonly string[]): LocaleCode | null {
  for (const tag of list) {
    const hit = matchTag(tag);
    if (hit) return hit;
  }
  return null;
}

export interface LocaleInput {
  languages: readonly string[];
  saved: string | null;
  query: string | null;
  page?: string | null;
}

/** A translated directory, including /ru/index.html and GitHub Pages project paths. */
export function pathLocale(pathname: string): LocaleCode | null {
  const directory = pathname.replace(/\/index\.html$/, "").replace(/\/$/, "");
  return findLocale(directory.split("/").pop())?.code ?? null;
}

export function resolveLocale(input: LocaleInput) {
  const browser = matchLanguages(input.languages);
  const fromUrl = matchTag(input.query);
  const page = findLocale(input.page)?.code ?? null;
  const saved = findLocale(input.saved)?.code ?? null;

  let code: LocaleCode = DEFAULT_LOCALE;
  let source: LocaleSource = "default";
  if (fromUrl) {
    code = fromUrl;
    source = "url";
  } else if (page) {
    code = page;
    source = "url";
  } else if (saved) {
    code = saved;
    source = "saved";
  } else if (browser) {
    code = browser;
    source = "browser";
  }
  return { code, source, userSupported: browser !== null, browser };
}

/**
 * Machine translation stays available only when English is shown because the visitor's own
 * language is not supported (or a dictionary failed to load).
 */
export function allowsMachineTranslation(
  code: LocaleCode,
  userSupported: boolean,
  failed = false,
): boolean {
  return code === DEFAULT_LOCALE && (!userSupported || failed);
}

export function resolveTheme(
  saved: string | null,
  system: Theme,
): { theme: Theme; source: ThemeSource } {
  if (saved === "light" || saved === "dark")
    return { theme: saved, source: "saved" };
  return { theme: system, source: "system" };
}

/* ------------------------------ browser side ------------------------------ */

export function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null; // private mode / blocked storage
  }
}

export function writeStored(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* the choice just is not remembered */
  }
}

export function browserLanguages(): string[] {
  const nav = window.navigator;
  if (nav.languages && nav.languages.length > 0)
    return Array.from(nav.languages);
  return nav.language ? [nav.language] : [];
}

export function systemTheme(): Theme {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

function setTranslatable(allow: boolean): void {
  const root = document.documentElement;
  const existing = document.querySelector(
    'meta[name="google"][content="notranslate"]',
  );
  if (allow) {
    existing?.remove();
    root.removeAttribute("translate");
    root.classList.remove("notranslate");
    return;
  }
  if (!existing) {
    const meta = document.createElement("meta");
    meta.name = "google";
    meta.content = "notranslate";
    document.head.appendChild(meta);
  }
  root.setAttribute("translate", "no");
  root.classList.add("notranslate");
}

/** lang, dir and the translation hints. Called before first paint and again on every language switch. */
export function applyLocaleAttributes(
  code: LocaleCode,
  allowMachineTranslation: boolean,
): void {
  const locale = findLocale(code) ?? LOCALES[1];
  document.documentElement.setAttribute("lang", locale.html);
  document.documentElement.setAttribute("dir", locale.dir);
  setTranslatable(allowMachineTranslation);
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  // one <meta name="theme-color"> that follows the effective theme, including a manual override
  let meta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"][data-kx]',
  );
  if (!meta) {
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((old) => old.remove());
    meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.setAttribute("data-kx", "");
    document.head.appendChild(meta);
  }
  meta.content = THEME_COLOR[theme];
}

/** Runs inline in <head>. Never touches the DOM body, never throws. */
export function bootstrap(): void {
  let query: string | null = null;
  try {
    query = new URLSearchParams(window.location.search).get("lang");
  } catch {
    /* ignore */
  }

  const locale = resolveLocale({
    languages: browserLanguages(),
    saved: readStored(STORAGE_KEYS.locale),
    query,
    page:
      pathLocale(window.location.pathname) ??
      document.documentElement.dataset.locale ??
      DEFAULT_LOCALE,
  });
  const allow = allowsMachineTranslation(locale.code, locale.userSupported);
  applyLocaleAttributes(locale.code, allow);

  const theme = resolveTheme(readStored(STORAGE_KEYS.theme), systemTheme());
  applyTheme(theme.theme);

  const state: BootState = {
    locale: locale.code,
    source: locale.source,
    userSupported: locale.userSupported,
    allowMachineTranslation: allow,
    theme: theme.theme,
    themeSource: theme.source,
  };
  window.__KYRELIX_BOOT__ = state;
}
