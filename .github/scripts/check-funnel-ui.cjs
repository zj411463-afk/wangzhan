const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { chromium } = require("playwright");

(async () => {
  const events = [];
  const server = http.createServer((request, response) => {
    if (request.method === "POST" && request.url === "/__events") {
      let body = "";
      request.on("data", part => { body += part; });
      request.on("end", () => {
        events.push(JSON.parse(body));
        response.writeHead(204).end();
      });
      return;
    }
    const pathname = new URL(request.url, "http://localhost").pathname;
    const file = path.resolve(".", `.${pathname === "/" ? "/index.html" : pathname}`);
    if (!file.startsWith(`${process.cwd()}${path.sep}`) || !fs.existsSync(file)) {
      response.writeHead(404).end(); return;
    }
    response.setHeader("Content-Type", file.endsWith(".html") ? "text/html; charset=utf-8" : "image/jpeg");
    response.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  let browser;
  try {
    browser = await chromium.launch({ headless: true,
      ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
    const page = await browser.newPage();
    await page.route("https://**/*", route => route.abort());
    const waitEvent = name => page.waitForResponse(response => response.url().endsWith("/__events")
      && response.request().postDataJSON()?.event === name);
    const opened = waitEvent("page_open");
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await opened;
    const samples = 22050 * 4, wav = Buffer.alloc(44 + samples * 2);
    wav.write("RIFF"); wav.writeUInt32LE(wav.length - 8, 4); wav.write("WAVEfmt ", 8);
    wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
    wav.writeUInt32LE(22050, 24); wav.writeUInt32LE(44100, 28);
    wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write("data", 36);
    wav.writeUInt32LE(samples * 2, 40);
    for (let i = 0; i < samples; i++) wav.writeInt16LE(Math.round(Math.sin(i * .1) * 8000), 44 + i * 2);
    const ready = waitEvent("file_ready");
    await page.setInputFiles("#fileInput", { name: "private-recording.wav", mimeType: "audio/wav", buffer: wav });
    await ready;
    const preview = waitEvent("preview_started");
    await page.locator("#previewBtn").click();
    await preview;
    await page.locator("#previewBtn").click();
    const saved = waitEvent("download_started"), downloaded = page.waitForEvent("download");
    await page.locator("#saveBtn").click();
    await saved; await downloaded;
    const repeat = page.waitForEvent("download");
    await page.locator("#saveBtn").click(); await repeat;
    await page.waitForTimeout(200);
    assert.deepEqual(events, ["page_open", "file_ready", "preview_started", "download_started"].map(event => ({ event })));
    assert(!JSON.stringify(events).includes("private-recording"));
    console.log("PASS: original four anonymous funnel events, no duplicate download count, no filename or audio data sent.");
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
