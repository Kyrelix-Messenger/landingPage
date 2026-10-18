import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";
import { LOCALES, type LocaleCode } from "../src/shared/boot/boot";
import { loadDictionary } from "../src/shared/i18n/loadDictionary";
import {
  renderRobots,
  renderSeoHead,
  renderSitemap,
} from "../src/shared/seo/metadata";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = resolve(root, "dist");
const serverOutput = resolve(root, "node_modules/.cache/kyrelix-prerender");
let template = await readFile(join(output, "index.html"), "utf8");
// This landing page has a small, self-contained stylesheet and no external fonts or CSS assets.
// Inline the exact built CSS so the static page can paint without a second network round trip.
for (const [tag] of template.matchAll(
  /<link\b[^>]*\brel="stylesheet"[^>]*>/g,
)) {
  const href = tag.match(/\bhref="([^"]+)"/)?.[1];
  assert.ok(href, "Expected a stylesheet URL");
  assert.ok(href.startsWith("./assets/"), "Expected a local built stylesheet");
  const css = await readFile(join(output, href), "utf8");
  template = template.replace(
    tag,
    () =>
      `<style data-kyrelix-styles>${css.replace(/<\/style/gi, "<\\/style")}</style>`,
  );
}
const seoRegion = /<!--kyrelix:seo:start-->[\s\S]*?<!--kyrelix:seo:end-->/;
assert.match(
  template,
  seoRegion,
  "The HTML template must contain the SEO region",
);
assert.ok(
  template.includes('<div id="root"></div>'),
  "The HTML template must contain the React root",
);

await build({
  root,
  build: {
    ssr: "src/entry-server.tsx",
    outDir: serverOutput,
    emptyOutDir: true,
    copyPublicDir: false,
    rollupOptions: { output: { manualChunks: undefined } },
  },
});

const { renderPage } = (await import(
  pathToFileURL(join(serverOutput, "entry-server.js")).href
)) as { renderPage: (locale: LocaleCode) => Promise<string> };

for (const locale of LOCALES) {
  const dictionary = await loadDictionary(locale.code);
  const content = await renderPage(locale.code);
  assert.match(
    content,
    /<h1\b/,
    `${locale.code}: the main heading must be prerendered`,
  );
  const directory = locale.code === "en" ? output : join(output, locale.code);
  // Vite's relative base works for both a custom domain and a project path. Translated
  // documents sit one directory below the root and reuse the same JS, CSS and favicon.
  const assetPrefix = locale.code === "en" ? "./" : "../";
  const html = template
    .replace(/((?:src|href)=")\.\//g, `$1${assetPrefix}`)
    .replace(
      '<html lang="en">',
      `<html lang="${locale.html}" dir="${locale.dir}" data-locale="${locale.code}">`,
    )
    .replace(seoRegion, () => renderSeoHead(locale.code, dictionary))
    .replace(
      '<div id="root"></div>',
      () => `<div id="root" data-prerendered="true">${content}</div>`,
    );
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, "index.html"), html);
}

await writeFile(join(output, "robots.txt"), renderRobots());
await writeFile(join(output, "sitemap.xml"), renderSitemap());
console.info(
  `Prerendered ${LOCALES.length} languages, robots.txt and sitemap.xml.`,
);
