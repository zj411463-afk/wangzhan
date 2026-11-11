const icons = { ...require("./splitter-icons.cjs"), ...require("./reverser-icons.cjs") };
const esc = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const icon = name => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name].map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([key, value]) => `${key}="${esc(value)}"`).join(" ")}></${tag}>`).join("")}</svg>`;
module.exports = function renderReverser({ locale, page, locales, languageNames, sitePath, content }) {
  const l = page.labels, t = key => esc(l[key]), origin = "https://www.tomp3.xyz", lang = locale === "zh" ? "zh-CN" : locale;
  const url = origin + sitePath(locale, "reverser");
  const shareImage = require("node:fs").readFileSync("assets/audio-reverser.png");
  const splitterNav = { zh: "MP3 分段", en: "MP3 Splitter", ja: "MP3分割", ko: "MP3 분할", fr: "Diviser MP3", de: "MP3 Splitter", es: "Dividir MP3" }[locale];
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebPage", "@id": url, url, name: l.title, description: l.description, inLanguage: lang, mainEntity: { "@id": url + "#app" }, dateModified: "2026-11-11" },
    { "@type": "WebApplication", "@id": url + "#app", name: l.title, description: l.description, url, inLanguage: lang, operatingSystem: "Web browser", applicationCategory: "MultimediaApplication", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Sonic Cutter", item: origin + sitePath(locale) }, { "@type": "ListItem", position: 2, name: l.nav, item: url }] },
    { "@type": "FAQPage", inLanguage: lang, mainEntity: page.faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) }
  ] };
  const listenRow = (name, label) => `<div class="listen-row ${name.toLowerCase()}"><button type="button" id="rev${name}Play" class="circle" title="${t("play")}" aria-label="${t("play")} · ${t(label)}">${icon("Play")}${icon("Pause")}</button><strong>${t(label)}</strong><canvas id="rev${name}Peaks" width="700" height="60" aria-hidden="true"></canvas><input id="rev${name}Seek" type="range" min="0" max="1" step="0.001" value="0" aria-label="${t("seek")} · ${t(label)}"><output id="rev${name}Time">00:00 / 00:00</output><audio id="rev${name}" preload="metadata" aria-label="${t(label)}"></audio></div>`;
  return `<!doctype html>
<html lang="${lang}" data-page-language="${locale}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.seoTitle)} | Sonic Cutter</title><meta name="description" content="${t("description")}">
<meta name="robots" content="index, follow, max-image-preview:large"><meta name="theme-color" content="#7643e8">
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48"><link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any"><link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">
<link rel="canonical" href="${url}">
${locales.map(other => `<link rel="alternate" hreflang="${other === "zh" ? "zh-CN" : other}" href="${origin}${sitePath(other, "reverser")}">`).join("\n")}
<link rel="alternate" hreflang="x-default" href="${origin}${sitePath("en", "reverser")}">
<meta property="og:type" content="website"><meta property="og:title" content="${t("title")}"><meta property="og:description" content="${t("description")}"><meta property="og:url" content="${url}">
<meta property="og:image" content="${origin}/assets/audio-reverser.png"><meta property="og:image:width" content="${shareImage.readUInt32BE(16)}"><meta property="og:image:height" content="${shareImage.readUInt32BE(20)}"><meta property="og:image:alt" content="${t("title")}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${t("title")}"><meta name="twitter:description" content="${t("description")}"><meta name="twitter:image" content="${origin}/assets/audio-reverser.png"><meta name="twitter:image:alt" content="${t("title")}">
<link rel="stylesheet" href="/assets/audio-reverser.css"><script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>
</head><body>
<a class="skip" href="#content">${esc(content[locale].ui[7])}</a>
<header class="rev-header"><a class="brand" href="${sitePath(locale)}"><img src="/favicon.svg" width="28" height="28" alt="">Sonic Cutter</a><nav aria-label="${esc(content[locale].ui[9])}"><a href="${sitePath(locale)}#workbenchMain">${esc(content[locale].ui[0])}</a><a href="${sitePath(locale, "splitter")}">${esc(splitterNav)}</a><a href="${sitePath(locale, "reverser")}" aria-current="page">${t("nav")}</a><a href="#how">${t("help")}</a></nav><div class="header-options"><label><span class="sr-only">${t("language")}</span><select id="revLanguage">${locales.map(other => `<option value="${sitePath(other, "reverser")}"${locale === other ? " selected" : ""}>${languageNames[other]}</option>`).join("")}</select></label><button id="revTheme" type="button" title="${t("theme")}" aria-label="${t("theme")}" aria-pressed="false">${icon("Moon")}</button></div></header>
<main id="content"><section class="rev-intro"><div><h1>${t("title")}</h1><p class="lead">${t("intro")}</p><ul class="trust"><li>${t("privacy")}</li><li>${t("registration")}</li><li>${t("output")}</li></ul></div><img src="/assets/sonic-lavender.jpg" width="600" height="360" alt="" class="rev-art" fetchpriority="low"></section>
<section class="reverser" id="reverser" aria-label="${t("nav")}">
<div class="filebar"><div class="file-info"><span class="file-icon">${icon("FolderOpen")}</span><div><strong id="revFileName">${t("empty")}</strong><p id="revFileInfo">${t("privacy")} · ${t("output")}</p></div></div><button type="button" id="revChoose">${icon("RotateCcw")}<span>${t("choose")}</span></button><input type="file" id="revFile" accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac" hidden></div>
<p id="revStatus" role="status" aria-live="polite">${t("support")}</p>
<div class="empty-state" id="revEmpty"><img src="/favicon.svg" width="48" height="48" alt=""><h2>${t("empty")}</h2><p>${t("support")}</p><button class="primary" id="revEmptyChoose" type="button">${icon("FolderOpen")}${t("choose")}</button><span>${t("drop")}</span></div>
<div class="processing" id="revProcessing" hidden><progress id="revProgress" aria-label="${t("processing")}"></progress><button id="revCancel" type="button">${t("cancel")}</button></div>
<div id="revWorkspace" hidden>
<div class="modebar"><fieldset><legend class="sr-only">${t("nav")}</legend><label><input type="radio" name="revMode" value="whole" checked><span>${t("whole")}</span></label><label><input type="radio" name="revMode" value="selection"><span>${t("selection")}</span></label></fieldset><span class="format">${t("output")} · 16-bit PCM</span></div>
<div class="wave-workspace"><p class="source-label">${t("source")}</p><div id="revRuler" class="ruler" aria-hidden="true"></div>
<div class="wave" id="revWave"><canvas id="revCanvas" width="1400" height="180" aria-hidden="true"></canvas><div id="revRegion" class="region"></div><button id="revStartHandle" class="handle" type="button" role="slider" aria-label="${t("start")}" aria-valuemin="0" aria-valuemax="1" aria-valuenow="0"><span></span></button><button id="revEndHandle" class="handle" type="button" role="slider" aria-label="${t("end")}" aria-valuemin="0" aria-valuemax="1" aria-valuenow="1"><span></span></button>
<div class="source-playhead" id="revPlayhead" aria-hidden="true"></div></div>
<audio id="revSource" preload="metadata" aria-label="${t("source")}" hidden></audio>
<div class="source-seek"><label for="revSourceSeek">${t("seek")}</label><input id="revSourceSeek" type="range" min="0" max="1" step="0.001" value="0"><output id="revSourceTime">00:00.000</output></div>
</div>
<div class="editor-footer">
<div class="source-transport"><button type="button" class="transport-play" id="revSourcePlay" title="${t("play")}" aria-label="${t("play")} · ${t("source")}">${icon("Play")}${icon("Pause")}</button><button id="revReset" type="button" class="transport-reset" title="${t("reset")}" aria-label="${t("reset")}">${icon("RotateCcw")}</button></div>
<div class="time-fields"><label>${t("start")}<input id="revStart" type="text" inputmode="decimal" value="00:00.000" spellcheck="false" autocomplete="off"></label><label>${t("end")}<input id="revEnd" type="text" inputmode="decimal" value="00:00.000" spellcheck="false" autocomplete="off"></label><label>${t("duration")}<output id="revDuration">00:00.000</output></label><label class="filename-field">${t("filename")}<input id="revExportName" type="text" maxlength="120" value="reversed.wav"></label></div>
<div class="commands"><button id="revBuild" class="preview-button" type="button">${icon("ArrowLeftRight")}${t("build")}</button></div>
</div>
<section class="results" id="revResults" hidden><h2>${t("compare")} <span class="ready">${t("done")}</span></h2><div class="comparison">${listenRow("Original", "original")}${listenRow("Reversed", "reversed")}</div><div class="result-download"><p class="result-note">${t("unchanged")}</p><button id="revDownload" class="primary" type="button" disabled>${icon("Download")}${t("download")}</button></div></section>
</div></section>
<section class="steps" id="how"><h2>${t("how")}</h2><ol><li>${t("step1")}</li><li>${t("step2")}</li><li>${t("step3")}</li></ol></section>
<div class="lower-content">${page.sections.map(([heading, body], i) => `<section id="section-${i + 1}"><h2>${esc(heading)}</h2><p>${esc(body)}</p>${i === 0 ? `<p class="context-link"><a href="${sitePath(locale, "mp3")}">${esc(content[locale].pages.mp3.title)}</a></p>` : ""}</section>`).join("")}</div>
<section class="rev-faq"><h2>${esc(page.faqTitle)}</h2>${page.faqs.map(([question, answer]) => `<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join("")}</section>
<section class="related"><h2>${t("related")}</h2><a href="${sitePath(locale)}#workbenchMain">${esc(content[locale].ui[0])}</a><a href="${sitePath(locale, "splitter")}">${esc(content[locale].pages.splitter.title)}</a></section>
</main><footer><a href="${sitePath(locale)}">Sonic Cutter</a><nav aria-label="${t("language")}">${locales.map(other => `<a href="${sitePath(other, "reverser")}" lang="${other === "zh" ? "zh-CN" : other}" hreflang="${other === "zh" ? "zh-CN" : other}"${other === locale ? ' aria-current="page"' : ""}>${languageNames[other]}</a>`).join("")}</nav></footer>
<script id="revCopy" type="application/json">${JSON.stringify(l).replaceAll("<", "\\u003c")}</script><script type="module" src="/assets/audio-reverser.mjs"></script>
</body></html>\n`;
};
