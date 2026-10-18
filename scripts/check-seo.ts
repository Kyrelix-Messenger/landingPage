import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALES } from "../src/shared/boot/boot";
import { loadDictionary } from "../src/shared/i18n/loadDictionary";
import { localeHref, localeUrl } from "../src/shared/seo/localeUrls";
import { escapeHtml } from "../src/shared/seo/metadata";

const output = fileURLToPath(new URL("../dist", import.meta.url));
const sitemap = await readFile(join(output, "sitemap.xml"), "utf8");
const robots = await readFile(join(output, "robots.txt"), "utf8");
assert.match(robots, /User-agent: \*\s+Allow: \//);
assert.match(robots, /Sitemap: https:\/\//);
assert.equal((sitemap.match(/<loc>/g) ?? []).length, LOCALES.length);

for (const locale of LOCALES) {
  const directory = locale.code === "en" ? output : join(output, locale.code);
  const html = await readFile(join(directory, "index.html"), "utf8");
  const dict = await loadDictionary(locale.code);
  assert.ok(
    html.includes(`lang="${locale.html}" dir="${locale.dir}"`),
    `${locale.code}: document language`,
  );
  assert.equal(
    (html.match(/<h1\b/g) ?? []).length,
    1,
    `${locale.code}: one H1`,
  );
  assert.equal(
    (html.match(/<main\b/g) ?? []).length,
    1,
    `${locale.code}: one main region`,
  );
  let previousHeading = 0;
  for (const heading of html.matchAll(/<h([1-6])\b/g)) {
    const level = Number(heading[1]);
    assert.ok(
      level <= previousHeading + 1,
      `${locale.code}: heading order skips H${previousHeading} to H${level}`,
    );
    previousHeading = level;
  }
  assert.ok(
    html.includes("<style data-kyrelix-styles>"),
    `${locale.code}: inline page styles`,
  );
  assert.ok(
    !/<link\b[^>]*\brel="stylesheet"/.test(html),
    `${locale.code}: no render-blocking stylesheet request`,
  );
  assert.ok(
    !/<link\b[^>]*\brel="modulepreload"[^>]*(?:vendor-three|vendor-r3f|\/Scene-)/.test(
      html,
    ),
    `${locale.code}: no eager 3D preload`,
  );
  for (const key of [
    "hero.title1",
    "hero.title2",
    "features.title",
    "features.groups.text",
    "faq.q1",
    "faq.a3",
  ] as const)
    assert.ok(
      html.includes(escapeHtml(dict[key])),
      `${locale.code}: missing static text ${key}`,
    );
  assert.ok(html.includes(`<title>${escapeHtml(dict["meta.title"])}</title>`));
  assert.ok(html.includes(`rel="canonical" href="${localeUrl(locale.code)}"`));
  assert.ok(
    html.includes(`property="og:url" content="${localeUrl(locale.code)}"`),
  );
  assert.ok(!html.includes("noindex"), `${locale.code}: indexable`);
  assert.ok(!html.includes("Kyrelix needs JavaScript"));
  assert.ok(sitemap.includes(`<loc>${localeUrl(locale.code)}</loc>`));
  assert.equal(
    (html.match(/rel="alternate" hreflang=/g) ?? []).length,
    LOCALES.length + 1,
  );
  for (const alternate of LOCALES) {
    assert.ok(
      html.includes(
        `hreflang="${alternate.html}" href="${localeUrl(alternate.code)}"`,
      ),
    );
    assert.ok(
      html.includes(`href="${localeHref(alternate.code, locale.code)}"`),
      `${locale.code}: crawlable ${alternate.code} link`,
    );
  }
  const json = html.match(
    /<script id="kyrelix-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/,
  )?.[1];
  assert.ok(json, `${locale.code}: JSON-LD`);
  const schema = JSON.parse(json) as {
    "@graph": Array<{ "@type": string; url?: string; inLanguage?: string }>;
  };
  const page = schema["@graph"].find((entry) => entry["@type"] === "WebPage");
  assert.equal(page?.url, localeUrl(locale.code));
  assert.equal(page?.inLanguage, locale.html);
  // Verify actual built asset paths, especially the ../ references in translated HTML.
  for (const match of html.matchAll(
    /(?:src|href)="([^"#?]+\.(?:js|css|svg|png))"/g,
  )) {
    if (match[1].startsWith("http")) continue;
    await access(join(directory, match[1]));
  }
}

const image = await readFile(join(output, "og-image.png"));
assert.equal(image.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
assert.equal(image.readUInt32BE(16), 1200);
assert.equal(image.readUInt32BE(20), 630);
console.info(
  `SEO checks passed: ${LOCALES.length} static pages, locale links, metadata, assets, social image and sitemap.`,
);
