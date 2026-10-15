import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  allowsMachineTranslation,
  matchLanguages,
  matchTag,
  resolveLocale,
  resolveTheme,
  type LocaleCode,
} from "../src/shared/boot/boot.ts";

describe("matchTag", () => {
  const cases: [unknown, LocaleCode | null][] = [
    ["ru", "ru"],
    ["de-AT", "de"],
    ["zh_TW", "zh"],
    ["zh-Hans-CN", "zh"],
    ["PT", "pt"],
    ["pt-BR", "pt"],
    ["ar-EG", "ar"],
    ["ko", null],
    ["", null],
    [undefined, null],
    [null, null],
    [42, null],
  ];
  for (const [tag, expected] of cases) {
    it(`${JSON.stringify(tag)} → ${expected}`, () =>
      assert.equal(matchTag(tag), expected));
  }
});

describe("matchLanguages", () => {
  it("takes the first supported entry, skipping unknown ones", () => {
    assert.equal(matchLanguages(["ko-KR", "ja-JP", "en-US"]), "ja");
  });
  it("returns null when nothing is supported or the list is empty", () => {
    assert.equal(matchLanguages(["ko", "th"]), null);
    assert.equal(matchLanguages([]), null);
  });
});

describe("resolveLocale", () => {
  const none = { saved: null, query: null };

  it("follows the browser language", () => {
    const result = resolveLocale({ languages: ["fr-CA", "en"], ...none });
    assert.deepEqual(
      {
        code: result.code,
        source: result.source,
        userSupported: result.userSupported,
      },
      { code: "fr", source: "browser", userSupported: true },
    );
  });

  it("falls back to English when nothing matches", () => {
    for (const languages of [["ko-KR", "th"], []]) {
      const result = resolveLocale({ languages, ...none });
      assert.deepEqual(
        {
          code: result.code,
          source: result.source,
          userSupported: result.userSupported,
        },
        { code: "en", source: "default", userSupported: false },
      );
    }
  });

  it("prefers ?lang= over the saved language over the browser", () => {
    assert.equal(
      resolveLocale({ languages: ["fr"], saved: "de", query: "ru" }).code,
      "ru",
    );
    assert.equal(
      resolveLocale({ languages: ["fr"], saved: "de", query: null }).code,
      "de",
    );
    assert.equal(
      resolveLocale({ languages: ["fr"], saved: null, query: null }).code,
      "fr",
    );
  });

  it("ignores values it does not support", () => {
    assert.equal(
      resolveLocale({ languages: ["fr"], saved: "de", query: "xx" }).code,
      "de",
    );
    assert.equal(
      resolveLocale({ languages: ["fr"], saved: "klingon", query: null }).code,
      "fr",
    );
  });

  it("still reports whether the browser itself is supported", () => {
    assert.equal(
      resolveLocale({ languages: ["ko"], saved: "de", query: null })
        .userSupported,
      false,
    );
    assert.equal(
      resolveLocale({ languages: ["pl"], saved: "de", query: null })
        .userSupported,
      true,
    );
  });
});

describe("allowsMachineTranslation", () => {
  const cases: [string, LocaleCode, boolean, boolean, boolean][] = [
    // [scenario, shown language, browser supported, dictionary failed, translation allowed]
    ["supported language shown natively", "ru", true, false, false],
    ["supported language, chosen by hand", "de", true, false, false],
    ["unsupported browser, English fallback", "en", false, false, true],
    ["English browser, English shown", "en", true, false, false],
    [
      "unsupported browser, picked a supported language",
      "fr",
      false,
      false,
      false,
    ],
    ["dictionary failed, English shown instead", "en", true, true, true],
    ["failed flag only matters for English", "ru", true, true, false],
  ];
  for (const [scenario, code, userSupported, failed, expected] of cases) {
    it(`${scenario}: ${expected ? "translator allowed" : "translator blocked"}`, () => {
      assert.equal(
        allowsMachineTranslation(code, userSupported, failed),
        expected,
      );
    });
  }
});

describe("resolveTheme", () => {
  it("uses the saved choice first", () => {
    assert.deepEqual(resolveTheme("dark", "light"), {
      theme: "dark",
      source: "saved",
    });
    assert.deepEqual(resolveTheme("light", "dark"), {
      theme: "light",
      source: "saved",
    });
  });
  it("follows the system when nothing valid is saved", () => {
    assert.deepEqual(resolveTheme(null, "dark"), {
      theme: "dark",
      source: "system",
    });
    assert.deepEqual(resolveTheme("sepia", "light"), {
      theme: "light",
      source: "system",
    });
  });
});
