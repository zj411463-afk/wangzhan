const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {})
  });
  try {
    const page = await browser.newPage({ locale: "en-US", reducedMotion: "reduce" });
    await page.route("https://**/*", (route) => route.abort());
    await page.goto(pathToFileURL(path.resolve("index.html")).href, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      document.documentElement.dataset.pageLanguage = "en";
      applyLanguage("en");
      const englishUrl = "https://www.tomp3.xyz/en/";
      document.querySelector('link[rel="canonical"]').href = englishUrl;
      document.querySelector('meta[property="og:url"]').content = englishUrl;
      document.querySelector('meta[property="og:title"]').content = document.title;
      document.querySelector('meta[name="twitter:title"]').content = document.title;
      document.querySelector('meta[name="keywords"]').content = "audio cutter, MP3 cutter, WAV trimmer, online audio editing, ringtone maker";
      document.querySelector('.locale-links a[hreflang="zh-CN"]').setAttribute("href", "../");
      document.querySelector('.locale-links a[hreflang="en"]').setAttribute("href", "./");
      document.querySelector(".hero-art").setAttribute("src", "../assets/sonic-hero.jpg");
      document.querySelector(".hero-art").setAttribute("alt", "Sonic Cutter waveform editor preview");
      const style = document.querySelector("head style");
      style.textContent = style.textContent.replaceAll('url("assets/sonic-hero.jpg")', 'url("../assets/sonic-hero.jpg")');

      const schema = document.querySelector('script[type="application/ld+json"]');
      const data = JSON.parse(schema.textContent);
      const application = data["@graph"].find((item) => item["@type"] === "WebApplication");
      application.url = englishUrl;
      application.description = document.querySelector('meta[name="description"]').content;
      const faq = data["@graph"].find((item) => item["@type"] === "FAQPage");
      faq.mainEntity = Array.from(document.querySelectorAll(".faq details"), (item) => ({
        "@type": "Question",
        name: item.querySelector("summary").textContent,
        acceptedAnswer: { "@type": "Answer", text: item.querySelector("p").textContent }
      }));
      const howTo = data["@graph"].find((item) => item["@type"] === "HowTo");
      howTo.name = "How to cut MP3 or WAV audio without recompression";
      howTo.description = "Choose an audio file, select a waveform range, preview it, and save the clip locally.";
      howTo.step = Array.from(document.querySelectorAll(".step-card"), (item) => ({
        "@type": "HowToStep", name: item.querySelector("h3").textContent, text: item.querySelector("p").textContent
      }));
      schema.textContent = `\n${JSON.stringify(data, null, 2)}\n`;
    });
    fs.mkdirSync("en", { recursive: true });
    fs.writeFileSync("en/index.html", await page.content());
    console.log("Generated en/index.html from the shared audio editor.");
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
