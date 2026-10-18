import { LOCALES, findLocale, type LocaleCode } from "../boot/boot";
import { APP_URL, SITE_URL } from "../config/links";
import type { Dictionary } from "../i18n/dictionaries/en";
import { localeUrl } from "./localeUrls";

const OG_LOCALES: Record<LocaleCode, string> = {
  en: "en_US",
  ru: "ru_RU",
  zh: "zh_CN",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
  ar: "ar_SA",
  pt: "pt_PT",
  ja: "ja_JP",
  pl: "pl_PL",
};

export const SOCIAL_IMAGE = `${SITE_URL}/og-image.png`;

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export function structuredData(locale: LocaleCode, dict: Dictionary) {
  const url = localeUrl(locale);
  const languages = LOCALES.map((item) => item.html);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Kyrelix",
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/favicon.svg`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "Kyrelix",
        url: `${SITE_URL}/`,
        inLanguage: languages,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: dict["meta.title"],
        description: dict["meta.description"],
        inLanguage: findLocale(locale)!.html,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#app` },
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#app`,
        name: "Kyrelix",
        url: APP_URL,
        description: dict["meta.description"],
        applicationCategory: "CommunicationApplication",
        operatingSystem: "Web",
        inLanguage: languages,
        featureList: [
          dict["features.chats.title"],
          dict["features.groups.title"],
          dict["features.channels.title"],
          dict["appearance.title"],
        ],
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
}

/** JSON inside a script must not be able to terminate that script. */
export function serializeJson(value: unknown): string {
  return JSON.stringify(value).replace(
    /[<>&\u2028\u2029]/g,
    (character) =>
      `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
}

export function renderSeoHead(locale: LocaleCode, dict: Dictionary): string {
  const title = escapeHtml(dict["meta.title"]);
  const description = escapeHtml(dict["meta.description"]);
  const url = localeUrl(locale);
  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    '<meta name="robots" content="index, follow, max-image-preview:large" />',
    `<link rel="canonical" href="${url}" />`,
    ...LOCALES.map(
      (item) =>
        `<link rel="alternate" hreflang="${item.html}" href="${localeUrl(item.code)}" />`,
    ),
    `<link rel="alternate" hreflang="x-default" href="${localeUrl("en")}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="Kyrelix" />',
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:locale" content="${OG_LOCALES[locale]}" />`,
    ...LOCALES.filter((item) => item.code !== locale).map(
      (item) =>
        `<meta property="og:locale:alternate" content="${OG_LOCALES[item.code]}" />`,
    ),
    `<meta property="og:image" content="${SOCIAL_IMAGE}" />`,
    '<meta property="og:image:type" content="image/png" />',
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta property="og:image:alt" content="Kyrelix" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${SOCIAL_IMAGE}" />`,
    '<meta name="twitter:image:alt" content="Kyrelix" />',
    `<script id="kyrelix-schema" type="application/ld+json">${serializeJson(structuredData(locale, dict))}</script>`,
  ].join("\n    ");
}

/** Used after a client-side language change, without replacing the page or its styles. */
export function updateSeo(locale: LocaleCode, dict: Dictionary): void {
  const template = document.createElement("template");
  template.innerHTML = renderSeoHead(locale, dict);
  document.head
    .querySelectorAll(
      'title, meta[name="description"], meta[name="robots"], link[rel="canonical"], link[rel="alternate"][hreflang], meta[property^="og:"], meta[name^="twitter:"], #kyrelix-schema',
    )
    .forEach((element) => element.remove());
  document.head.append(template.content);
}

export function renderSitemap(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${LOCALES.map((item) => `  <url><loc>${localeUrl(item.code)}</loc></url>`).join("\n")}\n</urlset>\n`;
}

export function renderRobots(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}
