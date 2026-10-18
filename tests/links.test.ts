import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { APP_HOST, APP_URL, SITE_URL } from "../src/shared/config/links.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".css", ".html"]);

function sourceFiles(): string[] {
  const files = readdirSync(join(root, "src"), {
    recursive: true,
    encoding: "utf8",
  })
    .filter((path) => SOURCE_EXTENSIONS.has(extname(path)))
    .map((path) => join(root, "src", path));
  return [...files, join(root, "index.html")];
}

describe("web version address", () => {
  it("is web.kyrelix.org", () => {
    assert.equal(APP_HOST, "web.kyrelix.org");
    assert.equal(APP_URL, "https://web.kyrelix.org");
  });

  it("uses only the marketing and messenger hosts", () => {
    const allowedHosts = new Set([APP_HOST, new URL(SITE_URL).hostname]);
    for (const file of sourceFiles()) {
      const text = readFileSync(file, "utf8");
      const hosts =
        text.match(/[a-z0-9.-]*kyrelix\.(?:org|com|net|app|io|ru)\b/gi) ?? [];
      for (const host of hosts)
        assert.ok(allowedHosts.has(host.toLowerCase()), `${file}: ${host}`);
    }
  });

  it("is not hard-coded outside the config and the dictionaries", () => {
    const allowed =
      /src[\\/](shared[\\/]config[\\/]links\.ts|shared[\\/]i18n[\\/]dictionaries[\\/])|index\.html$/;
    for (const file of sourceFiles()) {
      if (allowed.test(file)) continue;
      assert.ok(
        !/kyrelix\.org/i.test(readFileSync(file, "utf8")),
        `${file} hard-codes the address`,
      );
    }
  });
});
