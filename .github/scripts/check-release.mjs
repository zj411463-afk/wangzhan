import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

test("deployment contains only public site files", () => {
  const output = mkdtempSync(path.join(tmpdir(), "sonic-pages-"));
  try {
    const result = spawnSync(process.execPath, [".github/scripts/build-pages.js", output], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(readdirSync(output).sort(), [
      "404.html", "_worker.js", "assets", "index.html", "robots.txt", "sitemap.xml", "video-to-audio.html"
    ].sort());
    assert.deepEqual(readdirSync(path.join(output, "assets")), ["sonic-hero.jpg"]);
    assert.match(readFileSync(path.join(output, "404.html"), "utf8"), /name="robots" content="noindex"/);
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
});
