import { planParts } from "./mp3-frames.mjs";
const copy = JSON.parse(document.getElementById("splitCopy").textContent);
const byId = name => document.getElementById(`split${name}`);
let file, index, worker, sourceUrl, previewUrl, parts = [], generation = 0, busy = false;
const sent = new Set(), urls = new Set();
function track(name) {
  const event = `splitter_${name}`;
  if (location.protocol === "file:" || !["www.tomp3.xyz", "tomp3.xyz"].includes(location.hostname) || sent.has(event)) return;
  sent.add(event);
  fetch("/__events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event }), keepalive: true }).catch(() => {});
}
function status(key, error = false) {
  byId("Status").textContent = copy[key] || copy.readError;
  byId("Status").toggleAttribute("data-error", error);
}
function resetParts() {
  generation++;
  byId("Preview").pause(); byId("Preview").removeAttribute("src"); byId("Preview").load(); byId("Preview").hidden = true;
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
  for (const url of urls) URL.revokeObjectURL(url);
  urls.clear(); parts = [];
  byId("List").replaceChildren(); byId("Results").hidden = true;
}
function reset() {
  worker?.terminate(); worker = null;
  resetParts();
  byId("Source").pause(); byId("Source").removeAttribute("src"); byId("Source").load();
  if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  sourceUrl = null; file = null; index = null;
  byId("Workspace").hidden = true; byId("Progress").hidden = true;
  byId("FileName").textContent = "MP3"; byId("Choose").querySelector("span").textContent = copy.choose;
  byId("File").value = ""; status("empty");
}
function load(selected) {
  if (busy) return;
  reset();
  if (selected.size > 256 * 1024 * 1024) return status("tooLarge", true);
  if (!/\.mp3$/i.test(selected.name) && selected.type !== "audio/mpeg") return status("invalidFile", true);
  status("loading"); byId("Progress").hidden = false;
  const ticket = generation;
  worker = new Worker(new URL("./mp3-splitter-worker.mjs", import.meta.url), { type: "module" });
  const failure = key => { if (ticket !== generation) return; worker?.terminate(); worker = null; byId("Progress").hidden = true; status(key, true); };
  worker.onerror = () => failure("readError");
  worker.onmessage = ({ data }) => {
    if (ticket !== generation) return;
    if (data.error) return failure(data.error);
    index = data.index; file = selected;
    worker.terminate(); worker = null;
    sourceUrl = URL.createObjectURL(file); byId("Source").src = sourceUrl;
    byId("FileName").textContent = `${file.name} · ${time(index.duration)}`;
    byId("Choose").querySelector("span").textContent = copy.replace;
    byId("Progress").hidden = true; byId("Workspace").hidden = false;
    status("ready"); track("file_ready");
  };
  worker.postMessage({ file: selected });
}
function time(seconds) {
  const ms = Math.round(seconds * 1000);
  return `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`;
}
function filename(i) {
  const stem = file.name.replace(/\.[^.]+$/, "").replace(/[^\p{L}\p{N}_.-]/gu, "_").replace(/^\.+/, "").slice(0, 80) || "audio";
  return `${stem}-part-${String(i + 1).padStart(3, "0")}.mp3`;
}
function blob(part) { return file.slice(part.startByte, part.endByte, "audio/mpeg"); }
function download(data, name) {
  const url = URL.createObjectURL(data); urls.add(url);
  const link = document.createElement("a"); link.href = url; link.download = name;
  document.body.append(link); link.click(); link.remove();
  track("download_started");
  setTimeout(() => { URL.revokeObjectURL(url); urls.delete(url); }, 60000);
}
function build() {
  resetParts();
  if (!index) return;
  try {
    const mode = document.querySelector('input[name="splitMode"]:checked').value;
    parts = planParts(index, mode, mode === "interval" ? byId("Interval").value : byId("Cuts").value);
    const fragment = document.createDocumentFragment();
    parts.forEach((part, i) => {
      const row = document.createElement("li"), info = document.createElement("div"), strong = document.createElement("strong"), small = document.createElement("small");
      info.className = "part-info"; strong.textContent = `${copy.parts} ${i + 1}`;
      small.textContent = `${time(part.start)} – ${time(part.end)} · ${((part.endByte - part.startByte) / 1024).toFixed(1)} KB`;
      info.append(strong, small);
      const actions = document.createElement("div"); actions.className = "part-actions";
      for (const action of ["preview", "download"]) {
        const button = document.createElement("button"); button.type = "button"; button.textContent = copy[action]; button.dataset.action = action;
        button.addEventListener("click", async () => {
          if (action === "download") return download(blob(part), filename(i));
          byId("Source").pause(); byId("Preview").pause();
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          previewUrl = URL.createObjectURL(blob(part)); byId("Preview").src = previewUrl; byId("Preview").hidden = false;
          try { await byId("Preview").play(); status("ready"); track("preview_started"); }
          catch (error) { if (error.name !== "AbortError") status("previewError", true); }
        });
        actions.append(button);
      }
      row.append(info, actions); fragment.append(row);
    });
    byId("List").append(fragment); byId("Count").textContent = `(${parts.length})`; byId("Results").hidden = false; status("ready");
  } catch (error) { status(error.message, true); }
}
let zipLibrary;
function loadZIP() {
  if (globalThis.JSZip) return Promise.resolve(globalThis.JSZip);
  if (!zipLibrary) zipLibrary = new Promise((resolve, reject) => {
    const script = document.createElement("script"); script.src = "/assets/vendor/jszip-3.10.1.min.js";
    script.onload = () => resolve(globalThis.JSZip);
    script.onerror = () => { script.remove(); zipLibrary = null; reject(new Error("archiveError")); };
    document.head.append(script);
  });
  return zipLibrary;
}
byId("Zip").addEventListener("click", async () => {
  if (busy || !parts.length) return;
  busy = true; const ticket = generation;
  const buttons = Array.from(document.querySelectorAll(".splitter button, .splitter input, .splitter textarea"));
  const oldDisabled = buttons.map(button => button.disabled);
  buttons.forEach(button => { button.disabled = true; }); status("working");
  byId("Progress").hidden = false;
  try {
    const ZIP = await loadZIP(), zip = new ZIP();
    parts.forEach((part, i) => zip.file(filename(i), blob(part)));
    const result = await zip.generateAsync({ type: "blob", compression: "STORE", streamFiles: true });
    if (ticket === generation) { download(result, "mp3-parts.zip"); status("ready"); }
  } catch { status("archiveError", true); }
  finally { busy = false; byId("Progress").hidden = true; buttons.forEach((button, i) => { button.disabled = oldDisabled[i]; }); }
});
byId("Choose").addEventListener("click", () => byId("File").click());
byId("File").addEventListener("change", event => { if (event.target.files[0]) load(event.target.files[0]); });
byId("Clear").addEventListener("click", reset);
byId("Form").addEventListener("submit", event => { event.preventDefault(); build(); });
byId("Form").addEventListener("input", () => { resetParts(); if (index) status("ready"); });
document.querySelectorAll('input[name="splitMode"]').forEach(radio => radio.addEventListener("change", () => {
  const custom = radio.value === "custom";
  byId("CustomFields").hidden = !custom; byId("IntervalFields").hidden = custom;
  byId("Cuts").disabled = !custom; byId("Interval").disabled = custom;
}));
byId("Mark").addEventListener("click", () => {
  const position = byId("Source").currentTime;
  if (!index || position <= 0 || position >= index.duration) return status("invalidCuts", true);
  byId("Cuts").value = [byId("Cuts").value.trim(), position.toFixed(3)].filter(Boolean).join(", ");
  resetParts(); status("ready");
});
byId("Preview").addEventListener("error", () => { if (previewUrl) status("previewError", true); });
byId("Source").addEventListener("play", () => byId("Preview").pause());
window.addEventListener("pagehide", () => { if (!busy) reset(); });
track("page_open");
