import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { setTimeout } from "node:timers/promises";
const { locales, routes, sitePath } = createRequire(import.meta.url)("../content-pages.cjs");
const origin = "https://www.tomp3.xyz";
const checks = locales.flatMap((locale) => [undefined, ...Object.keys(routes)].map((key) => ({
  route: sitePath(locale, key),
  check: (html) => {
    assert.ok(html.includes(`rel="canonical" href="${origin}${sitePath(locale, key)}"`));
    assert.ok(html.includes(`href="${key ? sitePath(locale) : ""}#workbenchMain"`));
    assert.ok(html.includes('type="application/ld+json"'));
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
    assert.ok(html.includes("max-image-preview:large"));
    for (const alternate of locales) assert.ok(html.includes(`hreflang="${alternate === "zh" ? "zh-CN" : alternate}" href="${origin}${sitePath(alternate, key)}"`));
  }
})));
checks.push({ route: "/sitemap.xml", check: (xml) => {
  for (const locale of locales) for (const key of Object.keys(routes)) assert.ok(xml.includes(`<loc>${origin}${sitePath(locale, key)}</loc>`));
} });
checks.push({ route: "/robots.txt", check: (text) => assert.ok(text.includes(`Sitemap: ${origin}/sitemap.xml`)) });
checks.push({ route: "/favicon.ico", binary: true, contentType: /image\/(?:x-icon|vnd\.microsoft\.icon)/i,
  check: data => { assert.equal(data.readUInt16LE(2), 1); assert.equal(data.readUInt16LE(4), 3); } });
checks.push({ route: "/favicon.svg", contentType: /image\/svg\+xml/i,
  check: text => { assert.ok(text.includes("<svg")); assert.ok(text.includes("#7643e8")); } });
checks.push({ route: "/apple-touch-icon.png", binary: true, contentType: /image\/png/i,
  check: data => { assert.equal(data.readUInt32BE(0), 0x89504e47); assert.equal(data.readUInt32BE(16), 180); } });
for (const { route, check, binary, contentType } of checks) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(origin + route, { signal: AbortSignal.timeout(15000) });
      assert.equal(response.status, 200, `${route} status ${response.status}`);
      if (route.endsWith("/")) assert.ok(!/noindex/i.test(response.headers.get("x-robots-tag") || ""), `${route} unexpectedly noindex`);
      if (contentType) assert.match(response.headers.get("content-type") || "", contentType, `${route} content type`);
      check(binary ? Buffer.from(await response.arrayBuffer()) : await response.text());
      break;
    } catch (error) {
      if (attempt === 5) throw new Error(`Published content check failed: ${route}`, { cause: error });
      await setTimeout(3000);
    }
  }
}
console.log(`Verified ${checks.length} published content, sitemap, robots and icon routes.`);
