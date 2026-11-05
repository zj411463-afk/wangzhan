const { copyFileSync, existsSync, mkdirSync, readdirSync } = require("node:fs");
const path = require("node:path");
const { contentFiles } = require("../content-pages.cjs");

const output = process.argv[2] || "dist";
if (existsSync(output) && readdirSync(output).length) {
  throw new Error(`Build output must be empty: ${output}`);
}

const files = [
  "index.html", "video-to-audio.html", "404.html", "robots.txt", "sitemap.xml",
  "favicon.ico", "favicon.svg", "apple-touch-icon.png",
  "_worker.js", "assets/sonic-hero.jpg", "assets/sonic-studio.jpg", "assets/sonic-lavender.jpg", "assets/audio-selection.png", "assets/reading.css",
  "assets/mp3-frames.mjs", "assets/mp3-splitter.mjs", "assets/mp3-splitter-worker.mjs", "assets/mp3-splitter.css",
  "assets/mp3-splitter.png",
  "assets/vendor/jszip-3.10.1.min.js", "assets/vendor/jszip-LICENSE.txt", "assets/vendor/lucide-LICENSE.txt",
  ...contentFiles,
  ...["en", "ja", "ko", "fr", "de", "es"].map((locale) => `${locale}/index.html`)
];
for (const file of files) {
  const destination = path.join(output, file);
  mkdirSync(path.dirname(destination), { recursive: true });
  copyFileSync(file, destination);
}
console.log(`Prepared ${files.length} public files in ${output}`);
