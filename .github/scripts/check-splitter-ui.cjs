const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const http = require("node:http");
const { spawnSync } = require("node:child_process");
const { chromium } = require("playwright");
const ZIP = require("../../assets/vendor/jszip-3.10.1.min.js");
const { locales, sitePath } = require("../content-pages.cjs");

(async () => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "sonic-splitter-"));
  const run = (command, args) => {
    const result = spawnSync(command, args, { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr || result.error?.message);
    return result.stdout;
  };
  for (const format of ["cbr", "vbr"]) {
    run(process.env.FFMPEG_PATH || "ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=8", "-c:a", "libmp3lame",
      ...(format === "cbr" ? ["-b:a", "128k"] : ["-q:a", "2"]), "-y", path.join(output, `${format}.mp3`)]);
  }
  const { parseMP3, planParts } = await import("../../assets/mp3-frames.mjs");
  const mime = { ".html": "text/html; charset=utf-8", ".mjs": "text/javascript", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
  const events = [];
  const server = http.createServer((request, response) => {
    if (request.url === "/__events") {
      let body = ""; request.on("data", chunk => { body += chunk; });
      request.on("end", () => { events.push(JSON.parse(body)); response.writeHead(204).end(); }); return;
    }
    const pathname = new URL(request.url, "http://localhost").pathname;
    const file = path.resolve(`.${pathname}${pathname.endsWith("/") ? "index.html" : ""}`);
    if (!file.startsWith(process.cwd() + path.sep) || !fs.existsSync(file)) return response.writeHead(404).end();
    response.setHeader("Content-Type", mime[path.extname(file)] || "application/octet-stream");
    response.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ headless: true,
      ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
    for (const locale of locales) {
      const context = await browser.newContext();
      // Exercise production event routing entirely against the local fixture server.
      await context.route("https://www.tomp3.xyz/**", async route => {
        const url = new URL(route.request().url());
        const response = await route.fetch({ url: origin + url.pathname });
        await route.fulfill({ response });
      });
      await context.route("https://ipapi.co/**", route => route.abort());
      const page = await context.newPage({ viewport: { width: 1440, height: 1000 } });
      const errors = []; page.on("pageerror", error => errors.push(error.message));
      await page.goto(`https://www.tomp3.xyz${sitePath(locale, "splitter")}`);
      for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      }
      await page.setInputFiles("#splitFile", { name: "bad.mp3", mimeType: "audio/mpeg", buffer: Buffer.from("not audio") });
      await page.waitForSelector("#splitStatus[data-error]");
      assert.equal(await page.locator("#splitWorkspace").isVisible(), false);
      const bytes = fs.readFileSync(path.join(output, "cbr.mp3"));
      await page.setInputFiles("#splitFile", { name: "sample-tone.mp3", mimeType: "audio/mpeg", buffer: bytes });
      await page.waitForSelector("#splitWorkspace:visible");
      await page.locator("#splitInterval").fill("3");
      await page.locator("#splitBuild").click();
      assert.equal(await page.locator("#splitList li").count(), 3);
      const previewStarted = page.waitForResponse(response => response.url().endsWith("/__events")
        && response.request().postDataJSON()?.event === "splitter_preview_started");
      await page.locator('#splitList [data-action="preview"]').first().click();
      await previewStarted;
      await page.waitForFunction(() => !document.getElementById("splitPreview").paused);
      assert(await page.locator("#splitPreview").evaluate(audio => audio.duration > 2 && audio.duration < 4), "Preview must play the exported part, not the whole source");
      await page.evaluate(() => document.getElementById("splitPreview").pause());
      const download = page.waitForEvent("download");
      await page.locator('#splitList [data-action="download"]').nth(1).click();
      const partFile = await download, destination = path.join(output, `${locale}-part.mp3`);
      await partFile.saveAs(destination);
      const sourceIndex = parseMP3(bytes), expectedParts = planParts(sourceIndex, "interval", 3);
      assert.deepEqual(fs.readFileSync(destination), bytes.subarray(expectedParts[1].startByte, expectedParts[1].endByte));
      run(process.env.FFMPEG_PATH || "ffmpeg", ["-v", "error", "-i", destination, "-f", "null", "-"]);
      if (locale === "en") {
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.locator("#splitter").screenshot({ path: "assets/mp3-splitter.png" });
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: path.join(output, "desktop.png") });
        const zipDownload = page.waitForEvent("download");
        await page.locator("#splitZip").click();
        const zipped = await zipDownload; const zipPath = path.join(output, "parts.zip"); await zipped.saveAs(zipPath);
        const zip = await ZIP.loadAsync(fs.readFileSync(zipPath));
        assert.equal(Object.keys(zip.files).length, 3);
        for (let i = 0; i < expectedParts.length; i++) {
          const data = await zip.file(`sample-tone-part-${String(i + 1).padStart(3, "0")}.mp3`).async("nodebuffer");
          assert.deepEqual(data, bytes.subarray(expectedParts[i].startByte, expectedParts[i].endByte));
        }
      }
      for (const scheme of ["light", "dark"]) {
        await page.emulateMedia({ colorScheme: scheme });
        for (const width of [320, 390, 768, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${locale} loaded ${width} ${scheme}`);
          assert(await page.locator("#splitBuild").evaluate(button => button.getBoundingClientRect().height >= 44));
        }
      }
      if (locale === "zh") {
        await page.emulateMedia({ colorScheme: "light" }); await page.setViewportSize({ width: 390, height: 844 });
        await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
        await page.screenshot({ path: path.join(output, "mobile.png"), fullPage: true });
      }
      await page.check('input[value="custom"]');
      assert.equal(await page.locator("#splitResults").isVisible(), false, "Mode changes must invalidate old results");
      await page.locator("#splitCuts").fill("0:05, 0:02"); await page.locator("#splitBuild").click();
      assert.equal(await page.locator("#splitList li").count(), 3);
      await page.evaluate(() => { document.getElementById("splitSource").currentTime = 1; });
      await page.locator("#splitMark").click();
      await page.locator("#splitBuild").click();
      assert.equal(await page.locator("#splitList li").count(), 4);
      await page.locator("#splitCuts").fill("999"); await page.locator("#splitBuild").click();
      await page.waitForSelector("#splitStatus[data-error]");
      assert.equal(await page.locator("#splitResults").isVisible(), false);
      await page.locator("#splitClear").click(); assert.equal(await page.locator("#splitWorkspace").isVisible(), false);
      if (locale === "en") {
        const variable = fs.readFileSync(path.join(output, "vbr.mp3"));
        await page.setInputFiles("#splitFile", { name: "vbr.mp3", mimeType: "audio/mpeg", buffer: variable });
        await page.waitForSelector("#splitWorkspace:visible");
        await page.locator("#splitCuts").fill("3, 6"); await page.locator("#splitBuild").click();
        assert.equal(await page.locator("#splitList li").count(), 3);
        const vbrDownload = page.waitForEvent("download"); await page.locator('[data-action="download"]').first().click();
        const vbrPart = path.join(output, "vbr-part.mp3"); await (await vbrDownload).saveAs(vbrPart);
        run(process.env.FFMPEG_PATH || "ffmpeg", ["-v", "error", "-i", vbrPart, "-f", "null", "-"]);
      }
      assert.deepEqual(errors, []); await context.close();
    }
    assert.equal(events.length, locales.length * 4, JSON.stringify(events));
    for (const event of events) assert.deepEqual(Object.keys(event), ["event"]);
    for (const name of ["page_open", "file_ready", "preview_started", "download_started"]) {
      assert.equal(events.filter(event => event.event === `splitter_${name}`).length, locales.length);
    }
    assert(!JSON.stringify(events).includes("sample-tone"));
    console.log(`PASS: real CBR/VBR MP3s, seven locales, actual-part preview, byte-preserving export, ZIP, invalid files/cuts, responsive light/dark and separate deduplicated analytics. Screenshots: ${output}`);
  } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
