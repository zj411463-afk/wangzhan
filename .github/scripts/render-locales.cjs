// Generate localized pages from the shared editor and translation strings.
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const locales = ["en", "ja", "ko", "fr", "de", "es"];
const imageAlts = {
  en: "Headphones and mixing console in a recording studio",
  ja: "録音スタジオのヘッドホンとミキサー",
  ko: "녹음실의 헤드폰과 믹싱 콘솔",
  fr: "Casque et console de mixage dans un studio",
  de: "Kopfhörer und Mischpult in einem Tonstudio",
  es: "Auriculares y mesa de mezclas en un estudio"
};

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {})
  });
  try {
    for (const locale of locales) {
      const page = await browser.newPage({ locale, reducedMotion: "reduce" });
      await page.route("https://**/*", (route) => route.abort());
      await page.goto(pathToFileURL(path.resolve("index.html")).href, { waitUntil: "domcontentloaded" });
      await page.evaluate(({ locale, imageAlt }) => {
      document.documentElement.dataset.pageLanguage = locale;
      applyLanguage(locale);
      const pageUrl = `https://www.tomp3.xyz/${locale}/`;
      document.querySelector('link[rel="canonical"]').href = pageUrl;
      document.querySelector('meta[property="og:url"]').content = pageUrl;
      document.querySelector('meta[property="og:title"]').content = document.title;
      document.querySelector('meta[name="twitter:title"]').content = document.title;
      document.querySelector('meta[name="keywords"]').remove();
      document.querySelectorAll(".locale-links a[data-locale]").forEach((link) => {
        link.setAttribute("href", link.dataset.locale === "zh" ? "../" : `../${link.dataset.locale}/`);
      });
      document.querySelector(".hero-art").setAttribute("src", "../assets/sonic-studio.jpg");
      document.querySelector(".hero-art").setAttribute("alt", imageAlt);
      const style = document.querySelector("head style");
      style.textContent = style.textContent.replaceAll('url("assets/sonic-hero.jpg")', 'url("../assets/sonic-hero.jpg")');

      const schema = document.querySelector('script[type="application/ld+json"]');
      const data = JSON.parse(schema.textContent);
      const application = data["@graph"].find((item) => item["@type"] === "WebApplication");
      application.url = pageUrl;
      application.description = document.querySelector('meta[name="description"]').content;
      application.featureList = Array.from(document.querySelectorAll('[data-i18n="feature1Title"], [data-i18n="feature2Title"], [data-i18n="feature3Title"]'), (item) => item.textContent);
      const faq = data["@graph"].find((item) => item["@type"] === "FAQPage");
      faq.mainEntity = Array.from(document.querySelectorAll(".faq details"), (item) => ({
        "@type": "Question",
        name: item.querySelector("summary").textContent,
        acceptedAnswer: { "@type": "Answer", text: item.querySelector("p").textContent }
      }));
      const howTo = data["@graph"].find((item) => item["@type"] === "HowTo");
      howTo.name = document.querySelector(".step-list").getAttribute("aria-label");
      delete howTo.description;
      howTo.step = Array.from(document.querySelectorAll(".step-card"), (item) => ({
        "@type": "HowToStep", name: item.querySelector("h3").textContent, text: item.querySelector("p").textContent
      }));
      schema.textContent = `\n${JSON.stringify(data, null, 2)}\n`;
      }, { locale, imageAlt: imageAlts[locale] });
      fs.mkdirSync(locale, { recursive: true });
      fs.writeFileSync(`${locale}/index.html`, await page.content());
      await page.close();
      console.log(`Generated ${locale}/index.html from the shared audio editor.`);
    }
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
