import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pathLocale, resolveLocale } from "../src/shared/boot/boot.ts";
import { languageUrl, localeHref } from "../src/shared/seo/localeUrls.ts";
import { serializeJson } from "../src/shared/seo/metadata.ts";

describe("locale URLs", () => {
  it("keeps campaign parameters and anchors when replacing legacy language links", () => {
    const next = languageUrl(
      "https://example.com/?lang=ru&utm_source=test#faq",
      "ru",
      "en",
    );
    assert.equal(next.href, "https://example.com/ru/?utm_source=test#faq");
  });

  it("works from translated pages and a GitHub Pages project directory", () => {
    assert.equal(
      languageUrl("https://example.com/landingPage/ru/", "de", "ru").pathname,
      "/landingPage/de/",
    );
    assert.equal(
      languageUrl("https://example.com/landingPage/de/index.html", "en", "de")
        .pathname,
      "/landingPage/",
    );
    assert.equal(
      new URL(localeHref("en", "ar"), "https://example.com/ar/").pathname,
      "/",
    );
  });

  it("recognizes explicit locale directories without matching unsupported languages", () => {
    assert.equal(pathLocale("/ru/"), "ru");
    assert.equal(pathLocale("/landingPage/ja/index.html"), "ja");
    assert.equal(pathLocale("/"), null);
    assert.equal(pathLocale("/klingon/"), null);
  });

  it("keeps a translated page stable against saved and browser language preferences", () => {
    assert.equal(
      resolveLocale({ page: "ru", saved: "de", languages: ["fr"], query: null })
        .code,
      "ru",
    );
    assert.equal(
      resolveLocale({ page: "en", saved: "ru", languages: ["ru"], query: null })
        .code,
      "en",
    );
    assert.equal(
      resolveLocale({ page: "en", saved: null, languages: ["en"], query: "ru" })
        .code,
      "ru",
    );
  });
});

describe("structured data serialization", () => {
  it("cannot close the JSON-LD script, and round-trips translations unchanged", () => {
    const value = {
      text: '</script><script>alert("x")</script> & العربية\u2028中文',
    };
    const json = serializeJson(value);
    assert.ok(!json.includes("<"));
    assert.ok(!json.includes("&"));
    assert.deepEqual(JSON.parse(json), value);
  });
});
