import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { setTimeout } from "node:timers/promises";
const { locales, routes, sitePath } = createRequire(import.meta.url)("../content-pages.cjs");
const origin = "https://www.tomp3.xyz";
const checks = locales.flatMap((locale) => Object.keys(routes).map((key) => ({
  route: sitePath(locale, key),
  check: (html) => {
    assert.ok(html.includes(`rel="canonical" href="${origin}${sitePath(locale, key)}"`));
    assert.ok(html.includes(`href="${sitePath(locale)}#workbenchMain"`));
    assert.ok(html.includes('type="application/ld+json"'));
  }
})));
checks.push({ route: "/sitemap.xml", check: (xml) => {
  for (const locale of locales) for (const key of Object.keys(routes)) assert.ok(xml.includes(`<loc>${origin}${sitePath(locale, key)}</loc>`));
} });
checks.push({ route: "/robots.txt", check: (text) => assert.ok(text.includes(`Sitemap: ${origin}/sitemap.xml`)) });
for (const { route, check } of checks) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(origin + route, { signal: AbortSignal.timeout(15000) });
      assert.equal(response.status, 200, `${route} status ${response.status}`);
      check(await response.text());
      break;
    } catch (error) {
      if (attempt === 5) throw new Error(`Published content check failed: ${route}`, { cause: error });
      await setTimeout(3000);
    }
  }
}
console.log(`Verified ${checks.length} published content, sitemap and robots routes.`);
