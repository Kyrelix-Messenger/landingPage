import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { LOCALES, type LocaleCode } from "../src/shared/boot/boot.ts";
import { en, type Dictionary } from "../src/shared/i18n/dictionaries/en.ts";
import ar from "../src/shared/i18n/dictionaries/ar.ts";
import de from "../src/shared/i18n/dictionaries/de.ts";
import es from "../src/shared/i18n/dictionaries/es.ts";
import fr from "../src/shared/i18n/dictionaries/fr.ts";
import ja from "../src/shared/i18n/dictionaries/ja.ts";
import pl from "../src/shared/i18n/dictionaries/pl.ts";
import pt from "../src/shared/i18n/dictionaries/pt.ts";
import ru from "../src/shared/i18n/dictionaries/ru.ts";
import zh from "../src/shared/i18n/dictionaries/zh.ts";

const DICTIONARIES: Record<LocaleCode, Dictionary> = {
  ru,
  en,
  zh,
  es,
  fr,
  de,
  ar,
  pt,
  ja,
  pl,
};
const SOURCE_KEYS = Object.keys(en);

/** Strings that really are the same word as in English (names, loanwords, product names). */
const SAME_AS_ENGLISH: Partial<Record<LocaleCode, readonly string[]>> = {
  es: ["chat.mia", "demo.railChats"],
  fr: [
    "chat.mia",
    "chat.alex",
    "nav.menu",
    "nav.faq",
    "faq.title",
    "demo.chats",
    "demo.input",
  ],
  de: ["chat.mia", "chat.alex", "demo.online", "demo.railChats", "hero.web"],
  pt: ["chat.mia", "chat.alex", "demo.online", "demo.railChats", "nav.menu"],
  pl: ["chat.mia", "chat.alex", "demo.online", "nav.menu"],
  ja: ["roadmap.business.title"],
};

const SCRIPT: Partial<Record<LocaleCode, RegExp>> = {
  ru: /\p{Script=Cyrillic}/u,
  zh: /\p{Script=Han}/u,
  ja: /[\p{Script=Hiragana}\p{Script=Katakana}]/u,
  ar: /\p{Script=Arabic}/u,
};

/** Figure dash, en dash, em dash, horizontal bar, plus the Unicode hyphens (built from code points to keep them visible). */
const DASHES = [0x2010, 0x2011, 0x2012, 0x2013, 0x2014, 0x2015].map((point) =>
  String.fromCodePoint(point),
);

describe("language list", () => {
  it("matches the messenger: same codes, names and order", (t) => {
    const file = new URL(
      "../../frontend/src/shared/i18n/model/localeStore.ts",
      import.meta.url,
    );
    if (!existsSync(file)) return t.skip("frontend/ is not next to site/");

    const messenger = [
      ...readFileSync(file, "utf8").matchAll(
        /\{\s*code:\s*"([a-z]+)"\s*,\s*name:\s*"([^"]+)"\s*\}/g,
      ),
    ].map((match) => ({ code: match[1], name: match[2] }));
    assert.equal(messenger.length, 10);
    assert.deepEqual(
      LOCALES.map(({ code, name }) => ({ code, name })),
      messenger,
    );
  });

  it("sets the right lang and direction", () => {
    const byCode = Object.fromEntries(
      LOCALES.map((locale) => [locale.code, locale]),
    );
    assert.equal(byCode.zh.html, "zh-CN");
    assert.deepEqual(
      LOCALES.filter((locale) => locale.dir === "rtl").map(
        (locale) => locale.code,
      ),
      ["ar"],
    );
  });

  it("has exactly one dictionary file per language", () => {
    const dir = new URL("../src/shared/i18n/dictionaries/", import.meta.url);
    const files = readdirSync(dir)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => name.replace(/\.ts$/, ""))
      .sort();
    assert.deepEqual(files, LOCALES.map((locale) => locale.code).sort());
  });
});

for (const { code, name } of LOCALES) {
  describe(`dictionary ${code} (${name})`, () => {
    const dictionary = DICTIONARIES[code] as Record<string, string>;
    const entries = Object.entries(dictionary);

    it("has the same keys as English, no more and no fewer", () => {
      assert.deepEqual(Object.keys(dictionary).sort(), [...SOURCE_KEYS].sort());
    });

    it("has no empty, padded or doubled-space strings", () => {
      for (const [key, value] of entries) {
        assert.equal(typeof value, "string", key);
        assert.ok(value.length > 0, `${key} is empty`);
        assert.equal(
          value,
          value.trim(),
          `${key} has leading or trailing whitespace`,
        );
        assert.ok(!/ {2,}/.test(value), `${key} has a double space`);
      }
    });

    it("uses no dashes as punctuation", () => {
      for (const [key, value] of entries) {
        for (const dash of DASHES) {
          assert.ok(!value.includes(dash), `${key} has a dash: ${value}`);
        }
        assert.ok(!/\s-\s/.test(value), `${key} has a spaced hyphen: ${value}`);
        assert.ok(
          !value.includes("--"),
          `${key} has a double hyphen: ${value}`,
        );
      }
    });

    it("contains no markup", () => {
      for (const [key, value] of entries) {
        assert.ok(
          !/<\/?[a-z][^>]*>/i.test(value),
          `${key} contains an HTML tag`,
        );
        assert.ok(
          !/&[a-z#0-9]+;/i.test(value),
          `${key} contains an HTML entity`,
        );
        assert.ok(!/[*`]|\]\(/.test(value), `${key} contains Markdown`);
      }
    });

    it("keeps the {placeholders} of the English string", () => {
      const tokens = (text: string) => (text.match(/\{[^}]+\}/g) ?? []).sort();
      for (const [key, value] of entries) {
        assert.deepEqual(
          tokens(value),
          tokens(en[key as keyof typeof en]),
          key,
        );
      }
    });

    it("never mentions the web address in a different form", () => {
      for (const [key, value] of entries) {
        const hosts = value.match(/[a-z0-9.-]*kyrelix\.[a-z]+/gi) ?? [];
        for (const host of hosts)
          assert.equal(host.toLowerCase(), "web.kyrelix.org", key);
      }
      assert.ok(dictionary["faq.a1"].includes("web.kyrelix.org"));
    });

    if (code === "en") return;

    it("is translated, not copied from English", () => {
      const allowed = new Set(SAME_AS_ENGLISH[code] ?? []);
      const copied = entries
        .filter(
          ([key, value]) =>
            value === en[key as keyof typeof en] && !allowed.has(key),
        )
        .map(([key]) => key);
      assert.deepEqual(copied, []);
    });

    const script = SCRIPT[code];
    if (script) {
      it("is written in its own script", () => {
        for (const key of ["hero.title1", "hero.lead", "faq.a2", "cta.text"]) {
          assert.ok(
            script.test(dictionary[key]),
            `${key} is not in the ${name} script`,
          );
        }
      });
    }
  });
}

describe("french typography", () => {
  it("keeps a non-breaking space before : ? ! ;", () => {
    // \S then a plain space then the mark: a line break could separate them
    for (const [key, value] of Object.entries(fr)) {
      assert.ok(
        !/\S [:?!;]/.test(value),
        `${key} has a breaking space before punctuation: ${value}`,
      );
    }
  });
});
