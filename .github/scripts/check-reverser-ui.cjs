const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), os = require("node:os"), http = require("node:http");
const { spawnSync } = require("node:child_process");
const { chromium } = require("playwright");
const { locales, sitePath } = require("../content-pages.cjs");
(async () => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "sonic-reverser-"));
  const { renderPair } = await import("../../assets/audio-reverser-core.mjs");
  const rate = 44100, frames = rate * 8;
  const channels = [Float32Array.from({ length: frames }, (_, i) => Math.sin(i / rate * 440 * Math.PI * 2) * (.2 + .7 * i / frames)), Float32Array.from({ length: frames }, (_, i) => Math.sin(i / rate * 660 * Math.PI * 2) * (.8 - .6 * i / frames))];
  const bytes = Buffer.from((await renderPair(channels, rate)).original);
  fs.writeFileSync(path.join(output, "fixture.wav"), bytes);
  const mp3 = path.join(output, "fixture.mp3");
  const encoded = spawnSync(process.env.FFMPEG_PATH || "ffmpeg", ["-v", "error", "-i", path.join(output, "fixture.wav"), "-c:a", "libmp3lame", "-q:a", "2", mp3]);
  assert.equal(encoded.status, 0, encoded.stderr?.toString());
  const events = [];
  const mime = { ".html": "text/html; charset=utf-8", ".mjs": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml" };
  const server = http.createServer((req, res) => {
    if (req.url === "/__events") { let body = ""; req.on("data", chunk => body += chunk); req.on("end", () => { events.push(JSON.parse(body)); res.writeHead(204).end(); }); return; }
    const url = new URL(req.url, "http://localhost"), filename = path.resolve(`.${url.pathname}${url.pathname.endsWith("/") ? "index.html" : ""}`);
    if (!filename.startsWith(process.cwd() + path.sep) || !fs.existsSync(filename)) return res.writeHead(404).end();
    res.setHeader("Content-Type", mime[path.extname(filename)] || "application/octet-stream"); res.end(fs.readFileSync(filename));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
    for (const locale of locales) {
      const eventStart = events.length, errors = [];
      const context = await browser.newContext({ colorScheme: "light", viewport: { width: 1440, height: 1050 } });
      await context.route("**/*", async route => {
        const url = new URL(route.request().url());
        if (["blob:", "data:"].includes(url.protocol)) return route.continue();
        if (url.hostname !== "www.tomp3.xyz") return route.abort();
        const response = await route.fetch({ url: origin + url.pathname }); return route.fulfill({ response });
      });
      const page = await context.newPage(); page.on("pageerror", error => errors.push(error.message));
      await page.goto(`https://www.tomp3.xyz${sitePath(locale, "reverser")}`);
      assert.equal(await page.locator("#revWorkspace .editor-footer").count(), 1, "Editing footer belongs inside the loaded workspace");
      assert.equal(await page.locator("#revDownload").isDisabled(), true);
      assert.equal(await page.locator("html").getAttribute("lang"), locale === "zh" ? "zh-CN" : locale);
      await page.setInputFiles("#revFile", { name: "bad.mp3", mimeType: "audio/mpeg", buffer: Buffer.from("not audio") });
      await page.waitForSelector("#revStatus[data-error]");
      assert.equal(await page.locator("#revWorkspace").isVisible(), false);
      if (locale === "en") {
        await page.setInputFiles("#revFile", { name: "large.wav", mimeType: "audio/wav", buffer: Buffer.alloc(40 * 1024 * 1024 + 1) });
        await page.waitForSelector("#revStatus[data-error]"); assert.equal(await page.locator("#revWorkspace").isVisible(), false);
        const long = Buffer.alloc(44 + 8000 * 301 * 2); bytes.copy(long, 0, 0, 44);
        long.writeUInt32LE(long.length - 8, 4); long.writeUInt16LE(1, 22); long.writeUInt32LE(8000, 24); long.writeUInt32LE(16000, 28); long.writeUInt16LE(2, 32); long.writeUInt32LE(long.length - 44, 40);
        await page.setInputFiles("#revFile", { name: "long.wav", mimeType: "audio/wav", buffer: long });
        await page.waitForSelector("#revStatus[data-error]"); assert.equal(await page.locator("#revWorkspace").isVisible(), false);
      }
      await page.setInputFiles("#revFile", { name: "sample-tone.wav", mimeType: "audio/wav", buffer: bytes });
      await page.waitForSelector("#revWorkspace:visible");
      await page.waitForFunction(() => document.getElementById("revSource").readyState > 0);
      assert.equal(await page.locator("#revSource").getAttribute("controls"), null, "Use cutter-style controls, not the browser toolbar");
      await page.click("#revSourcePlay"); await page.waitForFunction(() => !document.getElementById("revSource").paused);
      await page.locator("#revSourceSeek").evaluate(input => { input.value = "2"; input.dispatchEvent(new Event("input", { bubbles: true })); });
      assert(await page.locator("#revSource").evaluate(audio => audio.currentTime >= 2 && audio.currentTime < 2.5), "Custom playback seek works");
      await page.click("#revSourcePlay"); await page.waitForFunction(() => document.getElementById("revSource").paused);
      assert.equal(await page.locator("#revDownload").isDisabled(), true, "Do not allow downloads before rendering");
      await page.check('[name="revMode"][value="selection"]');
      await page.fill("#revStart", "00:01.000"); await page.fill("#revEnd", "00:04.000");
      await page.click("#revBuild"); await page.waitForSelector("#revResults:visible");
      assert.equal(await page.locator("#revResults #revDownload").count(), 1, "Download is the final step below the comparison");
      await page.waitForFunction(() => document.getElementById("revReversed").readyState > 0);
      assert.equal(await page.locator("#revReversed").evaluate(el => el.duration), 3);
      const preview = page.waitForResponse(response => response.url().endsWith("/__events") && response.request().postDataJSON()?.event === "reverser_preview_started");
      await page.click("#revReversedPlay"); await preview;
      assert.equal(await page.locator("#revReversed").evaluate(el => el.paused), false);
      await page.click("#revOriginalPlay");
      assert.equal(await page.locator("#revReversed").evaluate(el => el.paused), true);
      await page.evaluate(() => document.getElementById("revOriginal").pause());
      const expectedOriginal = await page.locator("#revOriginal").evaluate(async el => Array.from(new Uint8Array(await (await fetch(el.src)).arrayBuffer())));
      const download = page.waitForEvent("download"); await page.click("#revDownload");
      const saved = await download, filename = path.join(output, `${locale}-reverse.wav`); await saved.saveAs(filename);
      const result = fs.readFileSync(filename), original = Buffer.from(expectedOriginal);
      assert.equal(result.length, 44 + 3 * rate * 4);
      for (let i = 0; i < rate * 3; i++) for (let c = 0; c < 2; c++) assert.equal(result.readInt16LE(44 + (i * 2 + c) * 2), original.readInt16LE(44 + (((rate * 3 - 1 - i) * 2) + c) * 2));
      const decoded = spawnSync(process.env.FFMPEG_PATH || "ffmpeg", ["-v", "error", "-i", filename, "-f", "null", "-"]); assert.equal(decoded.status, 0);
      for (const theme of ["light", "dark"]) {
        if (await page.locator("html").getAttribute("data-theme") !== theme) await page.click("#revTheme");
        for (const width of [320, 390, 768, 1440]) {
          await page.setViewportSize({ width, height: 1050 });
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${locale} ${theme} ${width}`);
          for (const id of ["revBuild", "revChoose", "revDownload", "revStartHandle"]) assert(await page.locator(`#${id}`).evaluate(el => el.getBoundingClientRect().height >= 44), id);
          assert(await page.locator("#revDownload").evaluate(el => el.getBoundingClientRect().top >= document.querySelector(".comparison").getBoundingClientRect().bottom), "Download must follow both previews visually");
          if (width <= 600) assert(await page.locator("#revDownload").evaluate(el => el.getBoundingClientRect().width >= el.parentElement.getBoundingClientRect().width - 2), "Final mobile download is full width");
          if (width <= 600) assert(await page.locator("#revBuild").evaluate(el => el.getBoundingClientRect().width >= el.parentElement.getBoundingClientRect().width - 2), "Mobile actions must fill the editing column");
        }
      }
      if (locale === "zh") {
        await page.click("#revTheme");
        await page.setViewportSize({ width: 1440, height: 1150 });
        await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
        await page.screenshot({ path: path.join(output, "desktop.png"), fullPage: true, animations: "disabled" });
        await page.setViewportSize({ width: 390, height: 844 });
        await page.screenshot({ path: path.join(output, "mobile.png"), fullPage: true, animations: "disabled" });
      }
      if (locale === "en") {
        await page.click("#revTheme"); await page.setViewportSize({ width: 1440, height: 1000 });
        await page.locator("#reverser").screenshot({ path: "assets/audio-reverser.png", animations: "disabled" });
      }
      await page.fill("#revStart", "oops"); assert.equal(await page.locator("#revResults").isVisible(), false); assert.equal(await page.locator("#revBuild").isDisabled(), true); assert.equal(await page.locator("#revDownload").isDisabled(), true);
      await page.fill("#revStart", "00:01.000");
      await page.locator("#revStart").fill(""); await page.locator("#revStart").pressSequentially("00:01.000");
      assert.equal(await page.inputValue("#revStart"), "00:01.000", "Typing must not reformat the field mid-entry");
      await page.locator("#revStartHandle").focus(); await page.keyboard.press("ArrowRight");
      assert.equal(await page.inputValue("#revStart"), "00:01.100");
      await page.evaluate(() => { document.getElementById("revBuild").click(); document.getElementById("revCancel").click(); });
      assert.equal(await page.locator("#revResults").isVisible(), false);
      assert.equal(await page.locator("#revBuild").isEnabled(), true);
      await page.click("#revBuild"); await page.waitForSelector("#revResults:visible");
      await page.check('[name="revMode"][value="whole"]'); assert.equal(await page.locator("#revResults").isVisible(), false);
      await page.setViewportSize({ width: 1440, height: 1050 });
      await page.locator("#revStartHandle").scrollIntoViewIfNeeded();
      const handle = await page.locator("#revStartHandle").boundingBox(), wave = await page.locator("#revWave").boundingBox();
      await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2); await page.mouse.down();
      await page.mouse.move(wave.x + wave.width / 4, handle.y + handle.height / 2, { steps: 8 }); await page.mouse.up();
      assert(Math.abs(Number(await page.locator("#revStartHandle").getAttribute("aria-valuenow")) - 2) < .05, "Pointer drag must change the range");
      if (locale === "en") {
        await page.setInputFiles("#revFile", { name: "sample-tone.mp3", mimeType: "audio/mpeg", buffer: fs.readFileSync(mp3) });
        await page.waitForSelector("#revWorkspace:visible"); await page.click("#revBuild"); await page.waitForSelector("#revResults:visible");
        await page.waitForFunction(() => document.getElementById("revReversed").readyState > 0);
        assert(await page.locator("#revReversed").evaluate(el => el.duration > 7.9 && el.duration < 8.1));
        await page.selectOption("#revLanguage", "/fr/audio-reverser/"); await page.waitForURL("https://www.tomp3.xyz/fr/audio-reverser/");
      }
      assert.deepEqual(errors, [], `${locale} runtime errors`);
      const received = events.slice(eventStart).filter(item => item.event !== "reverser_page_open" || locale !== "en");
      for (const suffix of ["file_ready", "preview_started", "download_started"]) assert.equal(received.filter(item => item.event === `reverser_${suffix}`).length, 1, `${locale} ${suffix}`);
      assert(events.slice(eventStart).every(item => Object.keys(item).length === 1 && item.event.startsWith("reverser_")));
      await context.close();
      console.log(`PASS reverser ${locale}`);
    }
    console.log(`Screenshots and exported fixtures: ${output}`);
  } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
