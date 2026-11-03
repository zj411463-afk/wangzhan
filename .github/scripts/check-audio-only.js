const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");

const home = readFileSync("index.html", "utf8");
const video = readFileSync("video-to-audio.html", "utf8");
const sitemap = readFileSync("sitemap.xml", "utf8");

assert.doesNotMatch(home, /href=["']video-to-audio\.html["']/);
assert.doesNotMatch(home + video, /api\.tomp3\.xyz/);
assert.match(video, /<meta name="robots" content="noindex, follow">/);
assert.match(video, /<section class="grid" id="details" hidden>/);
assert.match(video, /const API_ENDPOINT = null;/);
assert.match(video, /if \(!API_ENDPOINT\) return;/);
assert.doesNotMatch(sitemap, /video-to-audio\.html/);

console.log("Audio-only release checks passed.");
