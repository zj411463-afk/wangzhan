// Isolated HTTP fixtures: no production analytics or third-party IP requests.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const { locales, routes, sitePath } = require("../content-pages.cjs");

(async () => {
  const browser = await chromium.launch({ headless: true,
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    for (const locale of locales) {
      const context = await browser.newContext({ locale: "en-US", viewport: { width: 390, height: 844 } });
      await context.addInitScript(() => localStorage.setItem("sonic-cutter-language", "de"));
      await context.route("**/*", async route => {
        const url = new URL(route.request().url());
        if (url.hostname === "ipapi.co") return route.fulfill({ json: { country_code: "US" } });
        if (url.pathname === "/__events") return route.fulfill({ status: 204 });
        if (url.hostname !== "www.tomp3.xyz") return route.abort();
        const file = path.resolve(`.${url.pathname}${url.pathname.endsWith("/") ? "index.html" : ""}`);
        return route.fulfill({ path: file });
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(`https://www.tomp3.xyz${sitePath(locale)}`);
      await page.waitForFunction(() => document.querySelector('#languageSelect option[value="auto"]').textContent.includes("Deutsch"));
      assert.equal(await page.locator("html").getAttribute("lang"), locale === "zh" ? "zh-CN" : locale);
      assert.equal(new URL(page.url()).pathname, sitePath(locale));
      const info = await page.evaluate(() => {
        const graph = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)["@graph"];
        return { description: document.querySelector('meta[name="description"]').content,
          app: graph.find(item => item["@type"] === "WebApplication"),
          question: graph.find(item => item["@type"] === "FAQPage").mainEntity[0].name,
          visibleQuestion: document.querySelector(".faq summary").textContent,
          overflow: document.documentElement.scrollWidth > innerWidth };
      });
      assert.equal(info.app.description, info.description);
      assert.equal(info.app.inLanguage, locale === "zh" ? "zh-CN" : locale);
      assert.equal(info.question, info.visibleQuestion);
      assert.equal(info.overflow, false);
      await page.selectOption("#languageSelect", locale === "en" ? "fr" : "en");
      await page.waitForURL(`https://www.tomp3.xyz${locale === "en" ? "/fr/" : "/en/"}`);
      for (const key of Object.keys(routes)) {
        await page.goto(`https://www.tomp3.xyz${sitePath(locale, key)}`);
        for (const colorScheme of ["light", "dark"]) {
          await page.emulateMedia({ colorScheme });
          for (const width of [320, 390, 768, 1440]) {
            await page.setViewportSize({ width, height: 844 });
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false,
              `${locale}/${key} overflow at ${width}, ${colorScheme}`);
          }
        }
      }
      assert.deepEqual(errors, []);
      await context.close();
    }
    // An explicit Auto action may change the URL, but a plain visit must not.
    const context = await browser.newContext({ locale: "en-US" });
    await context.route("**/*", route => {
      const url = new URL(route.request().url());
      if (url.hostname === "ipapi.co") return route.fulfill({ json: { country_code: "US" } });
      if (url.pathname === "/__events") return route.fulfill({ status: 204 });
      if (url.hostname !== "www.tomp3.xyz") return route.abort();
      return route.fulfill({ path: path.resolve(`.${url.pathname}${url.pathname.endsWith("/") ? "index.html" : ""}`) });
    });
    const page = await context.newPage();
    await page.goto("https://www.tomp3.xyz/");
    await page.waitForFunction(() => document.querySelector('#languageSelect option[value="auto"]').textContent.includes("English"));
    assert.equal(await page.locator("html").getAttribute("lang"), "zh-CN");
    await page.selectOption("#languageSelect", "auto");
    await page.waitForURL("https://www.tomp3.xyz/en/");
    await context.close();
    console.log("PASS: seven stable locale URLs, metadata/schema consistency, 28 content pages at 320/390/768/1440px in light/dark, manual language navigation and explicit Auto.");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
