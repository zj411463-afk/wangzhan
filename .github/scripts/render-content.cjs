const fs = require("node:fs");
const path = require("node:path");
const { locales, languageNames, routes, sitePath, content, mobileTips } = require("../content-pages.cjs");
const { data: splitterCopy } = require("../splitter-pages.cjs");
const splitterMarkup = require("../splitter-markup.cjs");
const origin = "https://www.tomp3.xyz";
const published = "2026-11-04";
const updated = "2026-11-05";
const image = fs.readFileSync("assets/audio-selection.png");
const imageWidth = image.readUInt32BE(16);
const imageHeight = image.readUInt32BE(20);
const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const lang = (locale) => locale === "zh" ? "zh-CN" : locale;
const link = (url, text) => `<a href="${escape(url)}">${escape(text)}</a>`;
const related = { ringtone: ["mp3", "podcast", "splitter"], podcast: ["speech", "ringtone", "splitter"], mp3: ["ringtone", "speech", "edit"], speech: ["podcast", "mp3", "splitter"], splitter: ["edit", "mp3"], edit: ["splitter", "mp3"] };
const references = [
  ["https://support.apple.com/120692", "Apple · GarageBand"],
  ["https://support.google.com/pixelphone/answer/2819577", "Google · Pixel"],
  ["https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs", "MDN · MP3 / WAV"]
];
const alternates = (key) => locales.map((locale) => `  <link rel="alternate" hreflang="${lang(locale)}" href="${origin}${sitePath(locale, key)}">`).join("\n") + `\n  <link rel="alternate" hreflang="x-default" href="${origin}${sitePath("en", key)}">`;

for (const locale of locales) {
  const copy = content[locale];
  const [tool, scenes, guides, open, more, refs, toc, skip, date] = copy.ui;
  for (const key of Object.keys(routes)) {
    const page = copy.pages[key];
    const isGuide = Boolean(page.steps);
    const isSplitter = key === "splitter";
    const splitterLabel = { zh: "MP3 分割", en: "MP3 Splitter", ja: "MP3分割", ko: "MP3 분할", fr: "Division MP3", de: "MP3 Splitter", es: "Divisor MP3" }[locale];
    const kindLabel = isSplitter ? splitterLabel : isGuide ? guides : scenes;
    const previewImage = isSplitter ? "mp3-splitter.png" : "audio-selection.png";
    const previewAlt = isSplitter ? page.title : copy.image;
    const previewBytes = fs.existsSync(`assets/${previewImage}`) ? fs.readFileSync(`assets/${previewImage}`) : image;
    const pagePublished = ["splitter", "edit"].includes(key) ? "2026-11-05" : published;
    const url = `${origin}${sitePath(locale, key)}`;
    const sections = [...(page.steps || []), ...page.sections, ...(key === "mp3" ? [mobileTips[locale]] : [])];
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebPage", "@id": url, url, name: page.title, description: page.description, inLanguage: lang(locale), dateModified: updated,
          ...(isGuide ? { mainEntity: { "@id": `${url}#article` } } : isSplitter ? { mainEntity: { "@id": `${url}#application` } } : {}),
          isPartOf: { "@type": "WebSite", name: "Sonic Cutter", url: origin + "/" } },
        { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: tool, item: origin + sitePath(locale) },
          { "@type": "ListItem", position: 2, name: page.title, item: url }
        ] },
        ...(isSplitter ? [{ "@type": "WebApplication", "@id": `${url}#application`, name: "Sonic Cutter MP3 Splitter", url, inLanguage: lang(locale), description: page.description,
          applicationCategory: "MultimediaApplication", operatingSystem: "Web browser", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }] : []),
        ...(isGuide ? [{ "@type": "Article", "@id": `${url}#article`, headline: page.title, description: page.description,
          inLanguage: lang(locale), datePublished: pagePublished, dateModified: updated,
          author: { "@type": "Organization", name: "Sonic Cutter", url: origin + "/" },
          mainEntityOfPage: { "@id": url }, image: [origin + "/assets/audio-selection.png"],
          publisher: { "@type": "Organization", name: "Sonic Cutter", url: origin + "/" } },
        { "@type": "HowTo", name: page.title, description: page.intro, inLanguage: lang(locale),
          step: page.steps.map(([name, text], index) => ({ "@type": "HowToStep", name, text, url: `${url}#section-${index + 1}` })) }] : [])
      ]
    };
    const html = `<!doctype html>
<html lang="${lang(locale)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">
  <title>${escape(page.title)} | Sonic Cutter</title>
  <meta name="description" content="${escape(page.description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#7643e8">
  <link rel="canonical" href="${url}">
${alternates(key)}
  <meta property="og:type" content="${isGuide ? "article" : "website"}">
  <meta property="og:title" content="${escape(page.title)}">
  <meta property="og:description" content="${escape(page.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${origin}/assets/${previewImage}">
  <meta property="og:image:width" content="${previewBytes.readUInt32BE(16)}">
  <meta property="og:image:height" content="${previewBytes.readUInt32BE(20)}">
  <meta property="og:image:alt" content="${escape(previewAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escape(page.title)}">
  <meta name="twitter:description" content="${escape(page.description)}">
  <meta name="twitter:image" content="${origin}/assets/${previewImage}">
  <meta name="twitter:image:alt" content="${escape(previewAlt)}">
  <link rel="stylesheet" href="/assets/reading.css">
  ${isSplitter ? '<link rel="stylesheet" href="/assets/mp3-splitter.css">' : ""}
  <script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>
</head>
<body${isSplitter ? ' class="splitter-page"' : ""}>
  <a class="skip-link" href="#content">${escape(skip)}</a>
  <header class="site-header">
    <a class="brand" href="${sitePath(locale)}">Sonic Cutter<span>${escape(tool)}</span></a>
    <nav aria-label="${escape(copy.ui[9])}">
      ${link(sitePath(locale, "ringtone"), scenes)}
      ${link(sitePath(locale, "mp3"), guides)}
      <a class="tool-link" href="${sitePath(locale)}#workbenchMain">${escape(open)}</a>
    </nav>
  </header>
  <div class="reading-layout">
    <aside>
      <p class="eyebrow">${escape(toc)}</p>
      <nav aria-label="${escape(toc)}">${sections.map(([heading], index) => link(`#section-${index + 1}`, heading)).join("\n")}</nav>
      <div class="aside-related"><p class="eyebrow">${escape(more)}</p>${related[key].map((other) => link(sitePath(locale, other), copy.pages[other].title)).join("\n")}</div>
    </aside>
    <main id="content">
      <nav class="breadcrumbs" aria-label="${escape(tool)}">${link(sitePath(locale), tool)}<span aria-hidden="true">/</span><span>${escape(kindLabel)}</span></nav>
      <article>
        <p class="eyebrow">${escape(kindLabel)} · <span>${escape(date)} <time datetime="${updated}">${updated}</time></span></p>
        <h1>${escape(page.title)}</h1>
        <p class="lead">${escape(page.intro)}</p>
        ${isSplitter ? splitterMarkup(splitterCopy[locale]) : ""}
        <a class="tool-link" href="${sitePath(locale)}#workbenchMain">${escape(open)}</a>
        ${isSplitter ? "" : `<figure><a href="${sitePath(locale)}#workbenchMain"><img src="/assets/audio-selection.png" width="${imageWidth}" height="${imageHeight}" alt="${escape(copy.image)}" decoding="async" loading="lazy"></a><figcaption>${escape(copy.caption)}</figcaption></figure>`}
        ${sections.map(([heading, body], index) => `<section id="section-${index + 1}"><h2>${isGuide && index < page.steps.length ? `${index + 1}. ` : ""}${escape(heading)}</h2><p>${escape(body)}</p>${index === 0 ? `<p class="context-link">${link(sitePath(locale, related[key][0]), copy.pages[related[key][0]].title)}</p>` : ""}</section>`).join("\n")}
        <section class="related"><h2>${escape(more)}</h2><ul>${related[key].map((other) => `<li>${link(sitePath(locale, other), copy.pages[other].title)}</li>`).join("")}</ul><p>${link(`${sitePath(locale)}#workbenchMain`, open)}</p></section>
        <section class="references"><h2>${escape(refs)}</h2><ul>${references.filter((_, index) => key === "ringtone" || key === "mp3" || index === 2).map(([href, title]) => `<li>${link(href, title)}</li>`).join("")}</ul></section>
      </article>
    </main>
  </div>
  <footer>
    <a href="${sitePath(locale)}">Sonic Cutter · ${escape(tool)}</a>
    <nav class="locale-links" aria-label="Language">${locales.map((other) => `<a href="${sitePath(other, key)}" hreflang="${lang(other)}" lang="${lang(other)}"${other === locale ? ' aria-current="page"' : ""}>${languageNames[other]}</a>`).join("\n")}</nav>
  </footer>
</body>
</html>
`;
    const filename = path.join(sitePath(locale, key).slice(1), "index.html");
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, html);
  }
}

// The same content directory supplies the editor links and the crawlable pages.
const resourceCopy = Object.fromEntries(locales.map((locale) => [locale, {
  heading: content[locale].ui[9],
  ringtone: content[locale].pages.ringtone.title,
  podcast: content[locale].pages.podcast.title,
  mp3: content[locale].pages.mp3.title,
  speech: content[locale].pages.speech.title,
  splitter: content[locale].pages.splitter.title,
  edit: content[locale].pages.edit.title
}]));
const resourceMarkup = `<section class="resource-section" aria-labelledby="resourceHeading">
      <h2 id="resourceHeading" data-resource="heading">${escape(resourceCopy.zh.heading)}</h2>
      <div class="resource-grid">${Object.keys(routes).map((key) => `<a data-resource="${key}" href="${sitePath("zh", key)}">${escape(resourceCopy.zh[key])}</a>`).join("\n      ")}</div>
    </section>`;
const index = fs.readFileSync("index.html", "utf8");
if (!index.includes("<!-- resources:start -->") || !index.includes("// resource-copy:start")) throw new Error("Editor resource markers missing");
fs.writeFileSync("index.html", index
  .replace(/<!-- resources:start -->[\s\S]*?<!-- resources:end -->/, `<!-- resources:start -->\n    ${resourceMarkup}\n    <!-- resources:end -->`)
  .replace(/\/\/ resource-copy:start[\s\S]*?\/\/ resource-copy:end/, `// resource-copy:start\n    const resourceTranslations = ${JSON.stringify(resourceCopy)};\n    // resource-copy:end`));
const urls = locales.flatMap((locale) => [sitePath(locale), ...Object.keys(routes).map((key) => sitePath(locale, key))]);
fs.writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${origin}${url}</loc></url>`).join("\n")}\n</urlset>\n`);
console.log(`Generated ${locales.length * Object.keys(routes).length} localized content pages and ${urls.length} sitemap URLs.`);
