import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { pcm16, renderPair, sampleRange, parseTime, formatTime, wavHeader } from "../../assets/audio-reverser-core.mjs";

test("reversed WAV reverses sample frames, not bytes or stereo channels", async () => {
  const channels = [Float32Array.of(-1, -.7, -.1, .2, .9), Float32Array.of(.3, .8, -.4, -.2, 1)];
  const { original, reversed } = await renderPair(channels, 44100);
  const a = new DataView(original), b = new DataView(reversed);
  assert.equal(a.getUint32(24, true), 44100); assert.equal(a.getUint16(22, true), 2); assert.equal(a.getUint16(34, true), 16);
  assert.deepEqual(new Uint8Array(original, 0, 44), new Uint8Array(reversed, 0, 44));
  for (let i = 0; i < 5; i++) for (let c = 0; c < 2; c++) {
    assert.equal(a.getInt16(44 + (i * 2 + c) * 2, true), pcm16(channels[c][i]));
    assert.equal(b.getInt16(44 + (i * 2 + c) * 2, true), a.getInt16(44 + ((4 - i) * 2 + c) * 2, true));
  }
  assert.equal(pcm16(-2), -32768); assert.equal(pcm16(2), 32767); assert.equal(pcm16(NaN), 0);
});
test("time validation, sample alignment, mono and constraints", async () => {
  assert.equal(parseTime("01:02.125"), 62.125); assert.equal(parseTime("1:01:00"), 3660);
  for (const value of ["", "-2", "00:90", "Infinity", "1.2.3", "1:2", "1:20junk"]) assert.ok(Number.isNaN(parseTime(value)));
  assert.equal(formatTime(62.125), "01:02.125");
  assert.deepEqual(sampleRange(.001, .003, 200, 44100), [44, 132]);
  for (const args of [[-1, 2, 100, 44100], [0, 0, 100, 44100], [0, 2, 100, 44100], [NaN, 1, 100, 44100]]) assert.throws(() => sampleRange(...args));
  const { reversed } = await renderPair([Float32Array.of(.2, -.4, .6)], 48000);
  assert.equal(reversed.byteLength, 50); assert.equal(new DataView(reversed).getUint16(22, true), 1);
  assert.throws(() => wavHeader(48000 * 301, 2, 48000));
  await assert.rejects(renderPair([new Float32Array(2), new Float32Array(3)], 44100));
});
test("reverser telemetry is fixed, anonymous and isolated from existing funnels", async () => {
  const code = readFileSync("_worker.js", "utf8"), worker = (await import(`data:text/javascript,${encodeURIComponent(code)}`)).default;
  const points = [], env = { FUNNEL: { writeDataPoint: point => points.push(point) } };
  for (const suffix of ["page_open", "file_ready", "preview_started", "download_started"]) {
    const event = `reverser_${suffix}`;
    const request = new Request("https://www.tomp3.xyz/__events", { method: "POST", headers: { Origin: "https://www.tomp3.xyz", "Content-Type": "application/json" }, body: JSON.stringify({ event }) });
    assert.equal((await worker.fetch(request, env)).status, 204);
    assert.deepEqual(points.at(-1), { blobs: [event], doubles: [1] });
  }
});
test("seven reversal pages keep real localized FAQ content and keyword-specific titles", () => {
  const { data } = createRequire(import.meta.url)("../reverser-pages.cjs");
  for (const [locale, copy] of Object.entries(data)) {
    const route = `${locale === "zh" ? "" : locale + "/"}audio-reverser/index.html`;
    const html = readFileSync(route, "utf8");
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"];
    const faq = graph.find(item => item["@type"] === "FAQPage");
    assert.equal(faq.mainEntity.length, 3);
    assert.equal((html.match(/<details>/g) || []).length, 3);
    assert.equal(faq.inLanguage, locale === "zh" ? "zh-CN" : locale);
    for (const [question, answer] of copy.faqs) {
      const escape = text => text.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
      assert(html.includes(`<summary>${escape(question)}</summary><p>${escape(answer)}</p>`));
    }
    if (locale === "en") assert(html.includes("<title>Audio Reverser Online - Reverse MP3 &amp; WAV Free | Sonic Cutter</title>"));
  }
});
