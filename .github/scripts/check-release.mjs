import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { createRequire } from "node:module";
const { contentFiles, locales: contentLocales, routes, sitePath } = createRequire(import.meta.url)("../content-pages.cjs");

test("deployment contains only public site files", () => {
  const output = mkdtempSync(path.join(tmpdir(), "sonic-pages-"));
  try {
    const result = spawnSync(process.execPath, [".github/scripts/build-pages.js", output], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    const locales = ["en", "ja", "ko", "fr", "de", "es"];
    assert.deepEqual(readdirSync(output).sort(), [
      "404.html", "_worker.js", "assets", ...locales, "scenes", "guides", "mp3-splitter", "audio-reverser", "index.html", "robots.txt", "sitemap.xml", "video-to-audio.html",
      "favicon.ico", "favicon.svg", "apple-touch-icon.png"
    ].sort());
    assert.deepEqual(readdirSync(path.join(output, "assets")).sort(), ["audio-selection.png", "reading.css", "sonic-hero.jpg", "sonic-lavender.jpg", "sonic-studio.jpg", "mp3-frames.mjs", "mp3-splitter.mjs", "mp3-splitter-worker.mjs", "mp3-splitter.css", "mp3-splitter.png", "audio-reverser.mjs", "audio-reverser-core.mjs", "audio-reverser-worker.mjs", "audio-reverser.css", "audio-reverser.png", "vendor"].sort());
    assert.deepEqual(readdirSync(path.join(output, "assets/vendor")).sort(), ["jszip-3.10.1.min.js", "jszip-LICENSE.txt", "lucide-LICENSE.txt"].sort());
    assert.match(readFileSync(path.join(output, "404.html"), "utf8"), /name="robots" content="noindex"/);
    const home = readFileSync(path.join(output, "index.html"), "utf8");
    const script = (html) => html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    assert.ok(script(home));
    const style = (html) => html.match(/<style>([\s\S]*?)<\/style>/)?.[1];
    const ids = (html) => [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]).sort();
    assert.equal(new Set(ids(home)).size, ids(home).length, "Editor controls must keep unique IDs for event wiring");
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

    const titles = new Set();
    const descriptions = new Set();
    const publicPages = ["index.html", ...locales.map((locale) => `${locale}/index.html`), ...contentFiles];
    const pages = new Map(publicPages.map((file) => [file, readFileSync(path.join(output, file), "utf8")]));
    for (const [file, html] of [...pages, ...["404.html", "video-to-audio.html"].map(file => [file, readFileSync(path.join(output, file), "utf8")])]) {
      for (const icon of ["favicon.ico", "favicon.svg", "apple-touch-icon.png"]) {
        assert.ok(html.includes(`href="/${icon}"`), `Missing shared icon in ${file}: ${icon}`);
      }
    }
    const ico = readFileSync(path.join(output, "favicon.ico"));
    assert.equal(ico.readUInt16LE(0), 0);
    assert.equal(ico.readUInt16LE(2), 1);
    assert.equal(ico.readUInt16LE(4), 3);
    [16, 32, 48].forEach((size, index) => {
      const entry = 6 + index * 16;
      assert.equal(ico[entry], size);
      assert.equal(ico[entry + 1], size);
      const start = ico.readUInt32LE(entry + 12), length = ico.readUInt32LE(entry + 8);
      assert.ok(start + length <= ico.length);
      assert.equal(ico.readUInt32BE(start), 0x89504e47);
      assert.equal(ico.readUInt32BE(start + 16), size);
      assert.equal(ico.readUInt32BE(start + 20), size);
    });
    const touch = readFileSync(path.join(output, "apple-touch-icon.png"));
    assert.equal(touch.readUInt32BE(0), 0x89504e47);
    assert.equal(touch.readUInt32BE(16), 180);
    assert.equal(touch.readUInt32BE(20), 180);
    for (const [file, html] of pages) {
      const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
      const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
      assert.ok(title && description, `Missing metadata: ${file}`);
      assert.ok(!titles.has(title), `Duplicate title: ${file}`);
      assert.ok(!descriptions.has(description), `Duplicate description: ${file}`);
      titles.add(title);
      descriptions.add(description);
      assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `Expected one H1: ${file}`);
      const route = `/${file.replace(/index\.html$/, "")}`;
      assert.ok(sitemap.includes(`<loc>https://www.tomp3.xyz${route}</loc>`), `Not in sitemap: ${file}`);
      assert.ok(html.includes(`rel="canonical" href="https://www.tomp3.xyz${route}"`), `Invalid canonical: ${file}`);
      assert.ok(!html.includes('name="robots" content="noindex'), `Unexpected noindex: ${file}`);
      assert.ok(html.includes("max-image-preview:large"), `Missing image preview permission: ${file}`);
      const application = schema(html)["@graph"].find(item => item["@type"] === "WebApplication");
      if (application && !file.includes("mp3-splitter")) {
        assert.equal(application.inLanguage, html.match(/<html lang="([^"]+)"/)[1], `Schema language: ${file}`);
        assert.equal(application.description, description, `Schema description: ${file}`);
        assert.ok(html.includes(`data-page-language="${file === "index.html" || file.startsWith("audio-reverser/") ? "zh" : file.split("/")[0]}"`));
      }
      const shareImage = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
      assert.equal(shareImage, `https://www.tomp3.xyz/assets/${file.includes("audio-reverser/") ? "audio-reverser.png" : file.includes("mp3-splitter/") ? "mp3-splitter.png" : "audio-selection.png"}`, `Use a real tool preview: ${file}`);
      assert.ok(readFileSync(path.join(output, new URL(shareImage).pathname)).length);
      const base = new URL(route, "https://www.tomp3.xyz");
      for (const match of html.matchAll(/<(a|img)\b[^>]*\b(href|src)="([^"]+)"/g)) {
        const target = new URL(match[3], base);
        if (target.origin !== base.origin) continue;
        const targetFile = target.pathname.endsWith("/") ? `${target.pathname}index.html` : target.pathname;
        const absolute = path.join(output, targetFile);
        assert.ok(readFileSync(absolute).length, `Broken link in ${file}: ${match[3]}`);
        if (target.hash && targetFile.endsWith(".html")) {
          assert.ok(readFileSync(absolute, "utf8").includes(`id="${target.hash.slice(1)}"`), `Broken fragment in ${file}: ${match[3]}`);
        }
      }
      for (const image of html.matchAll(/<img\b[^>]*>/g)) assert.match(image[0], /\balt="[^"]*"/, `Missing image alt: ${file}`);
      for (const image of html.matchAll(/<img\b[^>]*>/g)) {
        assert.match(image[0], /\bwidth="\d+"/, `Reserve image width: ${file}`);
        assert.match(image[0], /\bheight="\d+"/, `Reserve image height: ${file}`);
      }
    }
    for (const locale of contentLocales) {
      const homeFile = `${sitePath(locale).slice(1)}index.html`;
      const homeHtml = pages.get(homeFile);
      for (const key of Object.keys(routes)) {
        const file = `${sitePath(locale, key).slice(1)}index.html`;
        const html = pages.get(file);
        assert.ok(homeHtml.includes(`href="${sitePath(locale, key)}"`), `Homepage must link to ${file}`);
        assert.ok(html.includes(`href="${sitePath(locale)}#workbenchMain"`), `Missing tool link: ${file}`);
        const contextual = { ringtone: "mp3", podcast: "speech", mp3: "ringtone", speech: "podcast", splitter: "edit", edit: "splitter", reverser: "mp3" };
        assert.ok(html.includes(`href="${sitePath(locale, contextual[key])}"`), `Missing contextual link: ${file}`);
        assert.match(html, /<p class="context-link"><a href="[^"]+">[^<]+<\/a><\/p><\/section>/, `Missing in-body contextual link: ${file}`);
        for (const alternate of contentLocales) assert.ok(html.includes(`href="https://www.tomp3.xyz${sitePath(alternate, key)}"`), `Missing language alternate: ${file}`);
        const graph = schema(html)["@graph"];
        assert.ok(graph.some((item) => item["@type"] === "BreadcrumbList"));
        if (["mp3", "speech", "edit"].includes(key)) {
          assert.ok(graph.some((item) => item["@type"] === "Article"));
          const howTo = graph.find((item) => item["@type"] === "HowTo");
          assert.equal(howTo.step.length, 4);
          for (const step of howTo.step) assert.ok(html.includes(step.url.split("#")[1]));
        }
      }
    }
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
});
