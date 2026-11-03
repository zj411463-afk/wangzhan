import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const workerSource = readFileSync(new URL("../../_worker.js", import.meta.url), "utf8");
const worker = (await import(`data:text/javascript,${encodeURIComponent(workerSource)}`)).default;

const origin = "https://www.tomp3.xyz";
const points = [];
const env = {
  FUNNEL: { writeDataPoint: (point) => points.push(point) },
  ASSETS: { fetch: () => new Response("site") }
};

function eventRequest(event, options = {}) {
  return new Request(`${origin}/__events`, {
    method: options.method || "POST",
    headers: {
      Origin: options.origin || origin,
      "Content-Type": "application/json"
    },
    body: options.method === "GET" ? undefined : JSON.stringify(event)
  });
}

test("records only fixed, anonymous funnel events", async () => {
  for (const name of ["page_open", "file_ready", "preview_started", "download_started"]) {
    const response = await worker.fetch(eventRequest({ event: name }), env);
    assert.equal(response.status, 204);
  }
  assert.deepEqual(points.map((point) => point.blobs[0]), [
    "page_open", "file_ready", "preview_started", "download_started"
  ]);
  assert.ok(points.every((point) => point.blobs.length === 1 && point.doubles[0] === 1));
});

test("rejects unexpected event data and cross-origin posts", async () => {
  assert.equal((await worker.fetch(eventRequest({ event: "page_open", fileName: "private.mp3" }), env)).status, 400);
  assert.equal((await worker.fetch(eventRequest({ event: "unknown" }), env)).status, 400);
  assert.equal((await worker.fetch(eventRequest({ event: "page_open" }, { origin: "https://example.com" }), env)).status, 403);
  assert.equal((await worker.fetch(eventRequest(null, { method: "GET" }), env)).status, 405);
  assert.equal((await worker.fetch(eventRequest({ event: "page_open" }), { ASSETS: env.ASSETS })).status, 503);
});

test("keeps the existing site route intact", async () => {
  assert.equal((await worker.fetch(new Request(`${origin}/`), env)).status, 200);
  const redirect = await worker.fetch(new Request("https://tomp3.xyz/"), env);
  assert.equal(redirect.status, 301);
  assert.equal(redirect.headers.get("Location"), `${origin}/`);
});

test("page sends only event names and skips local file previews", () => {
  const page = readFileSync("index.html", "utf8");
  assert.match(page, /location\.protocol === "file:"/);
  assert.match(page, /body: JSON\.stringify\(\{ event \}\)/);
  for (const name of ["page_open", "file_ready", "preview_started", "download_started"]) {
    assert.match(page, new RegExp(`trackFunnel\\("${name}"\\)`));
  }
});
