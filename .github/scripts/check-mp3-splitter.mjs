import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { parseMP3, parseTime, planParts } from "../../assets/mp3-frames.mjs";
const require = createRequire(import.meta.url);
const ZIP = require("../../assets/vendor/jszip-3.10.1.min.js");

function fixture(count = 500, variable = false) {
  const frames = Array.from({ length: count }, (_, i) => {
    const bitrate = variable && i % 2 ? 160 : 128;
    const frame = Buffer.alloc(Math.floor(144 * bitrate * 1000 / 44100));
    frame.set([255, 251, bitrate === 160 ? 160 : 144, 100]);
    frame.fill(i % 255, 50);
    return frame;
  });
  return Buffer.concat(frames);
}

test("constant and variable bitrate MP3 parts preserve every original audio frame exactly once", () => {
  for (const variable of [false, true]) {
    const bytes = fixture(500, variable), index = parseMP3(bytes);
    const parts = planParts(index, "interval", 3);
    assert.equal(parts.length, 5);
    assert.equal(parts[0].startByte, 0);
    assert.equal(parts.at(-1).endByte, bytes.length);
    assert.deepEqual(Buffer.concat(parts.map(p => bytes.subarray(p.startByte, p.endByte))), bytes);
    for (let i = 1; i < parts.length; i++) {
      assert.equal(parts[i - 1].endByte, parts[i].startByte);
      assert.equal(parts[i - 1].end, parts[i].start);
    }
    parts.forEach(part => assert.doesNotThrow(() => parseMP3(bytes.subarray(part.startByte, part.endByte))));
  }
});
test("timestamps sort, preserve the remainder and reject invalid or colliding boundaries", () => {
  const index = parseMP3(fixture());
  assert.equal(parseTime("1:02.5"), 62.5);
  assert.equal(parseTime("1:01:02"), 3662);
  assert.equal(planParts(index, "custom", "6, 0:03").length, 3);
  for (const value of ["0", "99", "3,3", "-1", "1:99", "NaN", "3,3.001", "3,"]) assert.throws(() => planParts(index, "custom", value));
  for (const value of [0, -1, .5, Infinity, "bad"]) assert.throws(() => planParts(index, "interval", value));
  assert.equal(planParts(index, "interval", 100).length, 1);
  assert.equal(planParts(index, "custom", "").length, 1);
});
test("tags and stale Xing frame are excluded, corrupt and unsupported input rejected", () => {
  const bytes = fixture();
  const info = Buffer.from(bytes.subarray(0, 417)); info.write("Xing", 36);
  const id3 = Buffer.from([73, 68, 51, 4, 0, 0, 0, 0, 0, 0]);
  const tagged = Buffer.concat([id3, info, bytes, Buffer.from("TAG".padEnd(128, "\0"))]);
  const index = parseMP3(tagged);
  assert.equal(index.frames.length, 500);
  const [part] = planParts(index, "interval", 100);
  assert.deepEqual(tagged.subarray(part.startByte, part.endByte), bytes);
  const footer = Buffer.from(id3); footer[5] = 16;
  assert.equal(parseMP3(Buffer.concat([footer, Buffer.alloc(10), bytes])).frames.length, 500);
  for (const input of [Buffer.alloc(100), Buffer.from("not mp3"), Buffer.concat([bytes.subarray(0, 417 * 3), Buffer.alloc(20), bytes])]) assert.throws(() => parseMP3(input));
});
test("packaged ZIP uses the existing JSZip library and round-trips each MP3", async () => {
  const bytes = fixture(), index = parseMP3(bytes), parts = planParts(index, "interval", 5);
  const zip = new ZIP();
  parts.forEach((part, i) => zip.file(`part-${i + 1}.mp3`, bytes.subarray(part.startByte, part.endByte)));
  const restored = await ZIP.loadAsync(await zip.generateAsync({ type: "nodebuffer", compression: "STORE" }));
  assert.equal(Object.keys(restored.files).length, parts.length);
  assert.deepEqual(await restored.file("part-1.mp3").async("nodebuffer"), bytes.subarray(parts[0].startByte, parts[0].endByte));
});
test("splitter analytics are separate and contain only fixed event names", async () => {
  const source = readFileSync("_worker.js", "utf8");
  const worker = (await import(`data:text/javascript,${encodeURIComponent(source)}`)).default;
  const events = [], env = { FUNNEL: { writeDataPoint: p => events.push(p) } };
  for (const event of ["splitter_page_open", "splitter_file_ready", "splitter_preview_started", "splitter_download_started"]) {
    const response = await worker.fetch(new Request("https://www.tomp3.xyz/__events", { method: "POST", headers: { Origin: "https://www.tomp3.xyz", "Content-Type": "application/json" }, body: JSON.stringify({ event }) }), env);
    assert.equal(response.status, 204);
  }
  assert.equal(events.length, 4);
  assert.ok(events.every(p => p.blobs.length === 1 && p.blobs[0].startsWith("splitter_") && p.doubles[0] === 1));
});
