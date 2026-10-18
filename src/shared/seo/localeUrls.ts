import { DEFAULT_LOCALE, type LocaleCode } from "../boot/boot";
import { SITE_URL } from "../config/links";

/** Relative links also work when the static site is hosted in a GitHub Pages subdirectory. */
export function localeHref(target: LocaleCode, current: LocaleCode): string {
  const parent = current === DEFAULT_LOCALE ? "./" : "../";
  return target === DEFAULT_LOCALE ? parent : `${parent}${target}/`;
}

export function localeUrl(locale: LocaleCode): string {
  return `${SITE_URL}/${locale === DEFAULT_LOCALE ? "" : `${locale}/`}`;
}

/** Keep campaign parameters and anchors; the old language parameter becomes a real path. */
export function languageUrl(
  currentUrl: string,
  target: LocaleCode,
  current: LocaleCode,
): URL {
  const previous = new URL(currentUrl);
  // A direct /index.html link must resolve just like its containing directory.
  previous.pathname = previous.pathname.replace(/index\.html$/, "");
  const next = new URL(localeHref(target, current), previous);
  next.search = previous.search;
  next.searchParams.delete("lang");
  next.hash = previous.hash;
  return next;
}
