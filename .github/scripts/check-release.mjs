import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

test("deployment contains only public site files", () => {
  const output = mkdtempSync(path.join(tmpdir(), "sonic-pages-"));
  try {
    const result = spawnSync(process.execPath, [".github/scripts/build-pages.js", output], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    const locales = ["en", "ja", "ko", "fr", "de", "es"];
    assert.deepEqual(readdirSync(output).sort(), [
      "404.html", "_worker.js", "assets", ...locales, "index.html", "robots.txt", "sitemap.xml", "video-to-audio.html"
    ].sort());
    assert.deepEqual(readdirSync(path.join(output, "assets")), ["sonic-hero.jpg"]);
    assert.match(readFileSync(path.join(output, "404.html"), "utf8"), /name="robots" content="noindex"/);
    const home = readFileSync(path.join(output, "index.html"), "utf8");
    const script = (html) => html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    assert.ok(script(home));
    const style = (html) => html.match(/<style>([\s\S]*?)<\/style>/)?.[1];
    const ids = (html) => [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]).sort();
    const schema = (html) => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const sitemap = readFileSync(path.join(output, "sitemap.xml"), "utf8");
    for (const locale of locales) {
      const localized = readFileSync(path.join(output, locale, "index.html"), "utf8");
      assert.equal(script(localized), script(home), `${locale} editor must use the shared script`);
      assert.equal(style(localized).replaceAll("../assets/sonic-hero.jpg", "assets/sonic-hero.jpg"), style(home), `Regenerate ${locale} styles after homepage changes`);
      assert.deepEqual(ids(localized), ids(home), `Regenerate ${locale} after structural changes`);
      assert.ok(localized.includes(`<html lang="${locale}" data-page-language="${locale}"`));
      assert.ok(localized.includes(`rel="canonical" href="https://www.tomp3.xyz/${locale}/"`));
      assert.ok(sitemap.includes(`<loc>https://www.tomp3.xyz/${locale}/</loc>`));
      assert.ok(localized.includes('hreflang="zh-CN" href="https://www.tomp3.xyz/"'));
      for (const alternate of locales) {
        assert.ok(localized.includes(`hreflang="${alternate}" href="https://www.tomp3.xyz/${alternate}/"`));
        assert.ok(home.includes(`hreflang="${alternate}" href="https://www.tomp3.xyz/${alternate}/"`));
      }
      const faq = schema(localized)["@graph"].find((item) => item["@type"] === "FAQPage");
      assert.equal(faq.mainEntity.length, 5);
    }
    const english = readFileSync(path.join(output, "en/index.html"), "utf8");
    assert.match(english, /Online <span>MP3 &amp; WAV<\/span> Audio Cutter/);
    assert.match(english, /Cutting without recompression preserves the existing encoded data/);
    const chineseFaq = schema(home)["@graph"].find((item) => item["@type"] === "FAQPage");
    assert.ok(chineseFaq.mainEntity.some((item) => item.name === "无重新压缩能恢复 MP3 音质吗？"));
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
});
