const icons = require("./splitter-icons.cjs");
const escape = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const icon = name => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name].map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${escape(v)}"`).join(" ")}></${tag}>`).join("")}</svg>`;
module.exports = function splitterMarkup(copy) {
  const t = key => escape(copy.labels[key]);
  return `<section class="splitter" id="splitter" aria-label="${escape(copy.title)}">
    <div class="split-filebar"><div><p class="eyebrow">${t("privacy")}</p><strong id="splitFileName">MP3</strong></div>
      <button type="button" id="splitChoose">${icon("FolderOpen")}<span>${t("choose")}</span></button>
      <input type="file" id="splitFile" accept="audio/mpeg,.mp3" hidden>
    </div>
    <p id="splitStatus" role="status" aria-live="polite">${t("empty")}</p>
    <progress id="splitProgress" hidden aria-label="${t("loading")}"></progress>
    <div id="splitWorkspace" hidden>
      <audio id="splitSource" controls preload="metadata" aria-label="${escape(copy.title)}"></audio>
      <form id="splitForm">
        <fieldset><legend>${t("mode")}</legend><div class="split-modes">
          <label><input type="radio" name="splitMode" value="interval" checked>${t("interval")}</label>
          <label><input type="radio" name="splitMode" value="custom">${t("custom")}</label>
        </div></fieldset>
        <div id="splitIntervalFields"><label for="splitInterval">${t("seconds")}</label><input type="number" id="splitInterval" min="1" step="any" value="30" required></div>
        <div id="splitCustomFields" hidden><label for="splitCuts">${t("cuts")}</label><textarea id="splitCuts" rows="2" aria-describedby="splitCutHint" placeholder="0:30, 1:00" disabled></textarea><p id="splitCutHint" class="split-note">${t("cutHint")}</p>
          <button type="button" id="splitMark">${icon("Plus")}${t("mark")}</button></div>
        <div class="split-commands"><button class="split-primary" type="submit" id="splitBuild">${icon("Scissors")}${t("build")}</button><button type="button" id="splitClear">${icon("RotateCcw")}${t("clear")}</button></div>
      </form>
      <section id="splitResults" hidden><div class="split-results-head"><h2>${t("parts")} <span id="splitCount"></span></h2><button type="button" id="splitZip">${icon("Download")}${t("zip")}</button></div>
        <ol id="splitList"></ol><audio id="splitPreview" controls preload="none" aria-label="${t("preview")}" hidden></audio>
      </section>
    </div>
    <p class="split-note">${t("limit")}</p><p class="split-note">${t("decoder")}</p>
  </section>
  <script id="splitCopy" type="application/json">${JSON.stringify(copy.labels).replaceAll("<", "\\u003c")}</script>
  <script type="module" src="/assets/mp3-splitter.mjs"></script>`;
};
