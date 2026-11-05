const fs = require("node:fs");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true,
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const svg = fs.readFileSync("favicon.svg", "utf8");
    const page = await browser.newPage({ deviceScaleFactor: 1 });
    const sizes = [16, 32, 48], images = [];
    for (const size of [...sizes, 180]) {
      await page.setViewportSize({ width: size, height: size });
      await page.setContent(`<style>body{margin:0;background:${size === 180 ? "#7643e8" : "transparent"}}svg{display:block;width:100%;height:100%}</style>${svg}`);
      const png = await page.screenshot({ type: "png", omitBackground: size !== 180 });
      if (size === 180) fs.writeFileSync("apple-touch-icon.png", png);
      else images.push(png);
    }
    // ICO directory entries point to the PNG-encoded images at each native size.
    const directory = Buffer.alloc(6 + sizes.length * 16);
    directory.writeUInt16LE(1, 2);
    directory.writeUInt16LE(sizes.length, 4);
    let offset = directory.length;
    images.forEach((png, index) => {
      const entry = 6 + index * 16;
      directory[entry] = directory[entry + 1] = sizes[index];
      directory.writeUInt16LE(1, entry + 4);
      directory.writeUInt16LE(32, entry + 6);
      directory.writeUInt32LE(png.length, entry + 8);
      directory.writeUInt32LE(offset, entry + 12);
      offset += png.length;
    });
    fs.writeFileSync("favicon.ico", Buffer.concat([directory, ...images]));
    console.log("Generated favicon.ico (16/32/48px) and apple-touch-icon.png (180px).");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
