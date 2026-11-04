// Run with the same Playwright installation and CHROME_PATH as render-locales.cjs.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

function fixture() {
  const rate = 22050, samples = rate * 8;
  const wav = Buffer.alloc(44 + samples * 2);
  wav.write("RIFF"); wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8); wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28);
  wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
  wav.write("data", 36); wav.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) {
    const t = i / rate;
    wav.writeInt16LE(Math.round(Math.sin(t * 440 * Math.PI * 2) * (0.15 + 0.6 * Math.sin(t * 1.7) ** 2) * 28000), 44 + i * 2);
  }
  return wav;
}

(async () => {
  const browser = await chromium.launch({ headless: true,
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "sonic-c-ui-"));
  try {
    for (const locale of ["zh", "en", "ja", "ko", "fr", "de", "es"]) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.route("https://**/*", route => route.abort());
      await page.goto(pathToFileURL(path.resolve(locale === "zh" ? "index.html" : `${locale}/index.html`)).href);
      await page.selectOption("#languageSelect", locale);
      assert(await page.locator(".hero-art").evaluate(img => img.complete && img.naturalWidth > 0));
      await page.setInputFiles("#fileInput", { name: "studio-test.wav", mimeType: "audio/wav", buffer: fixture() });
      await page.waitForSelector("#editor.is-ready");
      await page.waitForFunction(() => document.querySelector("#dropzone").getAttribute("aria-busy") === "false");
      await page.locator("#startInput").fill("1");
      await page.locator("#startInput").dispatchEvent("input");
      await page.locator("#endInput").fill("3");
      await page.locator("#endInput").dispatchEvent("input");
      const geometry = await page.evaluate(() => {
        const wave = document.querySelector(".wave-wrap").getBoundingClientRect();
        const controls = document.querySelector(".controls").getBoundingClientRect();
        return { waveRight: wave.right, controlsLeft: controls.left, waveWidth: wave.width };
      });
      assert(geometry.waveWidth > 800 && geometry.controlsLeft >= geometry.waveRight - 1);
      await page.locator("#previewBtn").click();
      await page.waitForFunction(() => document.querySelector("#previewBtn").getAttribute("aria-pressed") === "true");
      await page.waitForFunction(() => document.querySelector("#previewBtn").getAttribute("aria-pressed") === "false");
      const downloadPromise = page.waitForEvent("download");
      await page.locator("#saveBtn").click();
      const download = await downloadPromise;
      assert(download.suggestedFilename().endsWith(".wav"));
      const destination = path.join(output, `${locale}.wav`);
      await download.saveAs(destination);
      const saved = fs.readFileSync(destination);
      const source = fixture();
      assert(saved.subarray(44).equals(source.subarray(44 + 22050 * 2, 44 + 22050 * 6)), "WAV export must preserve original sample bytes");
      await page.locator("#editor").scrollIntoViewIfNeeded();
      if (locale === "en") await page.locator("#editor").screenshot({ path: "assets/audio-selection.png" });
      for (const width of [320, 390, 768]) {
        await page.setViewportSize({ width, height: 844 });
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${locale} overflow at ${width}`);
        const action = await page.locator("#saveBtn").boundingBox();
        assert(action.width >= 44 && action.height >= 44);
      }
      if (locale === "zh") {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.screenshot({ path: path.join(output, "mobile.png"), fullPage: true });
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: path.join(output, "desktop.png") });
      }
      await page.emulateMedia({ reducedMotion: "reduce" });
      assert.equal(await page.locator("#heroWave").isVisible(), false);
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(`PASS: seven locales, desktop/mobile, preview endpoint, byte-preserving WAV export. Screenshots: ${output}`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
