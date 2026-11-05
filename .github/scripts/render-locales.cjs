// Generate localized pages from the shared editor and translation strings.
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const locales = ["zh", "en", "ja", "ko", "fr", "de", "es"];
const imageAlts = {
  zh: "浅紫色耳机与音浪",
  en: "Lavender headphones and flowing audio waves",
  ja: "ラベンダー色のヘッドホンと音の波",
  ko: "라벤더색 헤드폰과 오디오 파형",
  fr: "Casque lavande et ondes audio",
  de: "Lavendelfarbene Kopfhörer und Klangwellen",
  es: "Auriculares lavanda y ondas de audio"
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
      const pageUrl = `https://www.tomp3.xyz/${locale === "zh" ? "" : `${locale}/`}`;
      document.querySelector('link[rel="canonical"]').href = pageUrl;
      document.querySelector('meta[property="og:url"]').content = pageUrl;
      document.querySelector('meta[property="og:title"]').content = document.title;
      document.querySelector('meta[name="twitter:title"]').content = document.title;
      document.querySelector('meta[name="keywords"]')?.remove();
      const screenshotAlts = {
        zh: "Sonic Cutter 音频波形、选区与试听控制（英文界面）",
        en: "Audio waveform, selection and preview controls in Sonic Cutter",
        ja: "Sonic Cutter の波形、範囲選択、試聴コントロール（英語表示）",
        ko: "Sonic Cutter의 파형, 선택 영역 및 미리 듣기 제어(영어 화면)",
        fr: "Forme d’onde, sélection et écoute dans Sonic Cutter, interface en anglais",
        de: "Wellenform, Auswahl und Vorschau in Sonic Cutter, englische Oberfläche",
        es: "Onda, selección y escucha de Sonic Cutter, interfaz en inglés"
      };
      for (const selector of ['meta[property="og:image:alt"]', 'meta[name="twitter:image:alt"]']) {
        document.querySelector(selector).content = screenshotAlts[locale];
      }
      document.querySelectorAll(".locale-links a[data-locale]").forEach((link) => {
        link.setAttribute("href", locale === "zh"
          ? (link.dataset.locale === "zh" ? "./" : `${link.dataset.locale}/`)
          : (link.dataset.locale === "zh" ? "../" : `../${link.dataset.locale}/`));
        if (link.dataset.locale === locale) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
      document.querySelector(".hero-art").setAttribute("src", `${locale === "zh" ? "" : "../"}assets/sonic-lavender.jpg`);
      document.querySelector(".hero-art").setAttribute("alt", imageAlt);
      const style = document.querySelector("head style");
      if (locale !== "zh") style.textContent = style.textContent.replaceAll('url("assets/sonic-hero.jpg")', 'url("../assets/sonic-hero.jpg")');

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
      if (locale !== "zh") fs.mkdirSync(locale, { recursive: true });
      fs.writeFileSync(locale === "zh" ? "index.html" : `${locale}/index.html`, (await page.content()).replace(/[\t ]+$/gm, ""));
      await page.close();
      console.log(`Generated ${locale === "zh" ? "index.html" : `${locale}/index.html`} from the shared audio editor.`);
    }
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
