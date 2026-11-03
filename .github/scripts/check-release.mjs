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
    assert.deepEqual(readdirSync(output).sort(), [
      "404.html", "_worker.js", "assets", "en", "index.html", "robots.txt", "sitemap.xml", "video-to-audio.html"
    ].sort());
    assert.deepEqual(readdirSync(path.join(output, "assets")), ["sonic-hero.jpg"]);
    assert.match(readFileSync(path.join(output, "404.html"), "utf8"), /name="robots" content="noindex"/);
    const home = readFileSync(path.join(output, "index.html"), "utf8");
    const english = readFileSync(path.join(output, "en/index.html"), "utf8");
    const script = (html) => html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    assert.ok(script(home));
    assert.equal(script(english), script(home), "English editor must use the same script as the homepage");
    const style = (html) => html.match(/<style>([\s\S]*?)<\/style>/)?.[1];
    assert.equal(style(english).replaceAll("../assets/sonic-hero.jpg", "assets/sonic-hero.jpg"), style(home), "Regenerate English styles after homepage changes");
    const ids = (html) => [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]).sort();
    assert.deepEqual(ids(english), ids(home), "Regenerate the English page after structural changes");
    assert.match(english, /<html lang="en" data-page-language="en"/);
    assert.match(english, /rel="canonical" href="https:\/\/www\.tomp3\.xyz\/en\/"/);
    assert.match(english, /Online <span>MP3 &amp; WAV<\/span> Audio Cutter/);
    assert.match(english, /Cutting without recompression preserves the existing encoded data/);
    assert.match(home, /hreflang="en" href="https:\/\/www\.tomp3\.xyz\/en\/"/);
    assert.match(english, /hreflang="zh-CN" href="https:\/\/www\.tomp3\.xyz\/"/);
    const schema = (html) => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    for (const [html, expected] of [[home, "无重新压缩能恢复 MP3 音质吗？"], [english, "Can cutting without recompression restore MP3 quality?"]]) {
      const faq = schema(html)["@graph"].find((item) => item["@type"] === "FAQPage");
      assert.ok(faq.mainEntity.some((item) => item.name === expected));
    }
    assert.match(readFileSync(path.join(output, "sitemap.xml"), "utf8"), /https:\/\/www\.tomp3\.xyz\/en\//);
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
});
