import { MAX_BYTES, MAX_SECONDS, formatTime, parseTime, sampleRange, peaksFor } from "./audio-reverser-core.mjs";
const copy = JSON.parse(document.getElementById("revCopy").textContent);
const $ = name => document.getElementById(`rev${name}`);
let buffer, file, context, worker, generation = 0, busy = false, sourceUrl, originalUrl, reversedUrl, sourcePeaks;
let start = 0, end = 0, resultDuration = 0, reversedBlob;
const pendingDownloads = new Map(), sent = new Set();
function track(name) {
  const event = `reverser_${name}`;
  if (location.protocol === "file:" || !["www.tomp3.xyz", "tomp3.xyz"].includes(location.hostname) || sent.has(event)) return;
  sent.add(event);
  fetch("/__events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event }), keepalive: true }).catch(() => {});
}
function status(key, error = false) {
  $("Status").textContent = copy[key]; $("Status").toggleAttribute("data-error", error);
}
function stopAudio(except) {
  for (const name of ["Source", "Original", "Reversed"]) if (name !== except) $(name).pause();
}
function clearResults() {
  for (const name of ["Original", "Reversed"]) {
    $(name).pause(); $(name).removeAttribute("src"); $(name).load();
    $(name + "Seek").value = 0; $(name + "Time").textContent = "00:00 / 00:00";
  }
  for (const url of [originalUrl, reversedUrl]) if (url) URL.revokeObjectURL(url);
  originalUrl = reversedUrl = null; reversedBlob = null; resultDuration = 0; $("Results").hidden = true;
  $("Download").disabled = true;
}
function setBusy(value, loading = false) {
  busy = value; $("Processing").hidden = !value;
  $("Empty").hidden = Boolean(buffer) || value;
  for (const control of document.querySelectorAll('#revWorkspace button, #revWorkspace input')) control.disabled = value;
  for (const control of document.querySelectorAll('[name="revMode"]')) control.disabled = value;
  $("Source").toggleAttribute("inert", value);
  $("Download").disabled = value || !reversedBlob;
  if (value && loading) $("Progress").removeAttribute("value");
  else if (value) { $("Progress").max = 1; $("Progress").value = 0; }
}
function cancelJob() {
  generation++; worker?.terminate(); worker = null;
  context?.close().catch(() => {}); context = null;
  setBusy(false); status("cancelled");
}
function resetFile() {
  cancelJob(); clearResults(); buffer = file = sourcePeaks = null;
  $("Source").pause(); $("Source").removeAttribute("src"); $("Source").load();
  if (sourceUrl) URL.revokeObjectURL(sourceUrl); sourceUrl = null;
  $("SourceSeek").value = 0; $("SourceTime").textContent = formatTime(0); $("Playhead").style.left = "0%";
  $("Workspace").hidden = true; $("Empty").hidden = false;
  $("FileName").textContent = copy.empty; $("FileInfo").textContent = `${copy.privacy} · ${copy.output}`;
  $("Choose").querySelector("span").textContent = copy.choose; $("File").value = "";
}
async function metadata(blob) {
  const audio = new Audio(); audio.preload = "metadata";
  const url = URL.createObjectURL(blob);
  try {
    return await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("invalid")), 15000);
      const settle = fn => value => { clearTimeout(timeout); audio.onloadedmetadata = audio.onerror = null; fn(value); };
      audio.onloadedmetadata = settle(() => Number.isFinite(audio.duration) && audio.duration > 0 ? resolve(audio.duration) : reject(new Error("invalid")));
      audio.onerror = settle(() => reject(new Error("invalid")));
      audio.src = url;
    });
  } finally { audio.pause(); audio.removeAttribute("src"); audio.load(); URL.revokeObjectURL(url); }
}
async function load(selected) {
  resetFile();
  if (!selected.size || (!selected.type.startsWith("audio/") && !/\.(mp3|wav|m4a|aac|ogg|flac|opus|aif|aiff)$/i.test(selected.name))) return status("invalid", true);
  if (selected.size > MAX_BYTES) return status("large", true);
  const ticket = generation; setBusy(true, true); status("loading");
  try {
    const duration = await metadata(selected);
    if (ticket !== generation) return;
    if (duration > MAX_SECONDS + 0.1) throw new Error("long");
    const bytes = await selected.arrayBuffer();
    if (ticket !== generation) return;
    // Preserve a standard WAV sample rate when known; other formats use the context's rate.
    const header = new DataView(bytes);
    let rate;
    if (bytes.byteLength >= 28 && header.getUint32(0) === 0x52494646 && header.getUint32(8) === 0x57415645 && header.getUint32(12) === 0x666d7420) rate = header.getUint32(24, true);
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const localContext = new AudioContext(rate >= 8000 && rate <= 96000 ? { sampleRate: rate } : undefined);
    context = localContext;
    let decoded;
    try { decoded = await localContext.decodeAudioData(bytes); }
    finally { await localContext.close().catch(() => {}); if (context === localContext) context = null; }
    if (ticket !== generation) return;
    if (decoded.duration > MAX_SECONDS || decoded.numberOfChannels > 2 || !decoded.length) throw new Error("long");
    buffer = decoded; file = selected; start = 0; end = buffer.duration;
    sourcePeaks = peaksFor(Array.from({ length: buffer.numberOfChannels }, (_, c) => buffer.getChannelData(c)));
    sourceUrl = URL.createObjectURL(file); $("Source").src = sourceUrl;
    $("SourceSeek").max = buffer.duration;
    $("FileName").textContent = file.name;
    $("FileInfo").textContent = `${formatTime(buffer.duration)} · ${(file.size / 1048576).toFixed(1)} MB · ${buffer.sampleRate} Hz`;
    $("ExportName").value = file.name.replace(/\.[^.]+$/, "") + "-reversed.wav";
    $("Choose").querySelector("span").textContent = copy.replace;
    document.querySelector('[name="revMode"][value="whole"]').checked = true;
    $("Workspace").hidden = false; setBusy(false); updateSelection(); drawSource(); status("ready"); track("file_ready");
  } catch (error) {
    if (ticket !== generation) return;
    resetFile(); status(["long", "invalid"].includes(error.message) ? error.message : "error", true);
  } finally { if (ticket === generation) setBusy(false); }
}
function draw(canvas, peaks, color) {
  const width = canvas.clientWidth || 600, height = canvas.clientHeight || 60, dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext("2d"); ctx.scale(dpr, dpr); ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1, width / peaks.length * .65); ctx.beginPath();
  for (let i = 0; i < peaks.length; i++) {
    const x = (i + .5) * width / peaks.length, amplitude = Math.max(1, peaks[i] * height * .46);
    ctx.moveTo(x, height / 2 - amplitude); ctx.lineTo(x, height / 2 + amplitude);
  }
  ctx.stroke();
}
let resultPeaks;
function drawSource() {
  const style = getComputedStyle(document.documentElement);
  if (sourcePeaks) draw($("Canvas"), sourcePeaks, style.getPropertyValue("--wave"));
  if (resultPeaks && !$("Results").hidden) {
    draw($("OriginalPeaks"), resultPeaks, style.getPropertyValue("--teal"));
    draw($("ReversedPeaks"), Float32Array.from(resultPeaks).reverse(), style.getPropertyValue("--primary"));
  }
}
function updateSelection(preserveInputs = false) {
  if (!buffer) return;
  if (!preserveInputs) { $("Start").value = formatTime(start); $("End").value = formatTime(end); }
  $("Duration").textContent = formatTime(end - start);
  $("Start").removeAttribute("aria-invalid"); $("End").removeAttribute("aria-invalid");
  $("Build").disabled = busy;
  const a = start / buffer.duration * 100, b = end / buffer.duration * 100;
  $("Region").style.left = `${a}%`; $("Region").style.width = `${b - a}%`;
  for (const [name, value, percent] of [["Start", start, a], ["End", end, b]]) {
    const handle = $(name + "Handle"); handle.style.left = `${percent}%`;
    handle.setAttribute("aria-valuemax", String(buffer.duration)); handle.setAttribute("aria-valuenow", String(value)); handle.setAttribute("aria-valuetext", formatTime(value));
  }
  $("Ruler").replaceChildren(...Array.from({ length: 5 }, (_, i) => { const span = document.createElement("span"); span.textContent = formatTime(buffer.duration * i / 4).slice(0, -4); return span; }));
}
function invalidate() { clearResults(); resultPeaks = null; status("ready"); }
function setSelection(a, b, preserveInputs = false) {
  const [first, last] = sampleRange(a, b, buffer.length, buffer.sampleRate);
  start = first / buffer.sampleRate; end = last / buffer.sampleRate;
  invalidate(); updateSelection(preserveInputs);
}
function readTimes() {
  if (!buffer || busy) return;
  invalidate();
  let a = parseTime($("Start").value), b = parseTime($("End").value);
  // Millisecond display can round the final sample slightly beyond the decoded duration.
  if (Math.abs(b - buffer.duration) < .00051) b = buffer.duration;
  try {
    sampleRange(a, b, buffer.length, buffer.sampleRate);
    document.querySelector('[name="revMode"][value="selection"]').checked = true;
    setSelection(a, b, true);
  } catch {
    $("Start").setAttribute("aria-invalid", "true"); $("End").setAttribute("aria-invalid", "true"); $("Build").disabled = true; status("range", true);
  }
}
function build() {
  if (!buffer || busy) return;
  clearResults(); stopAudio();
  const ticket = ++generation;
  setBusy(true); status("processing");
  try {
    const [first, last] = sampleRange(start, end, buffer.length, buffer.sampleRate);
    const channels = Array.from({ length: buffer.numberOfChannels }, (_, c) => buffer.getChannelData(c).slice(first, last));
    worker = new Worker(new URL("./audio-reverser-worker.mjs", import.meta.url), { type: "module" });
    const failure = () => { if (ticket !== generation) return; worker?.terminate(); worker = null; clearResults(); setBusy(false); status("error", true); };
    worker.onerror = failure;
    worker.onmessage = ({ data }) => {
      if (ticket !== generation) return;
      if (data.error) return failure();
      if (data.progress !== undefined) { $("Progress").value = data.progress; return; }
      worker.terminate(); worker = null;
      try {
        originalUrl = URL.createObjectURL(new Blob([data.original], { type: "audio/wav" }));
        reversedBlob = new Blob([data.reversed], { type: "audio/wav" });
        reversedUrl = URL.createObjectURL(reversedBlob);
        resultDuration = (last - first) / buffer.sampleRate; resultPeaks = data.peaks;
        $("Original").src = originalUrl; $("Reversed").src = reversedUrl;
        for (const name of ["Original", "Reversed"]) { $(name + "Seek").max = resultDuration; $(name + "Time").textContent = `00:00 / ${formatTime(resultDuration).slice(0, -4)}`; }
        $("Results").hidden = false; setBusy(false); status("done"); drawSource();
      } catch { failure(); }
    };
    worker.postMessage({ channels, rate: buffer.sampleRate }, channels.map(channel => channel.buffer));
  } catch { worker?.terminate(); worker = null; setBusy(false); status("error", true); }
}
$("File").addEventListener("change", event => { if (event.target.files[0]) load(event.target.files[0]); });
for (const name of ["Choose", "EmptyChoose"]) $(name).addEventListener("click", () => { $("File").value = ""; $("File").click(); });
$("Cancel").addEventListener("click", cancelJob);
$("Build").addEventListener("click", build);
for (const name of ["Start", "End"]) {
  $(name).addEventListener("input", readTimes);
  $(name).addEventListener("blur", () => { if (buffer && !busy && !$("Build").disabled) updateSelection(); });
}
$("Reset").addEventListener("click", () => { if (buffer && !busy) { document.querySelector('[name="revMode"][value="whole"]').checked = true; setSelection(0, buffer.duration); } });
for (const mode of document.querySelectorAll('[name="revMode"]')) mode.addEventListener("change", () => {
  if (!buffer || busy) return;
  setSelection(mode.value === "whole" ? 0 : buffer.duration * .2, mode.value === "whole" ? buffer.duration : buffer.duration * .7);
});
for (const name of ["Start", "End"]) {
  const handle = $(name + "Handle");
  const move = value => {
    if (!buffer || busy) return;
    const step = 1 / buffer.sampleRate;
    const a = name === "Start" ? Math.max(0, Math.min(value, end - step)) : start;
    const b = name === "End" ? Math.min(buffer.duration, Math.max(value, start + step)) : end;
    document.querySelector('[name="revMode"][value="selection"]').checked = true; setSelection(a, b);
  };
  handle.addEventListener("pointerdown", event => { if (buffer && !busy) { event.preventDefault(); handle.setPointerCapture(event.pointerId); } });
  handle.addEventListener("pointermove", event => { if (!handle.hasPointerCapture(event.pointerId)) return; const rect = $("Wave").getBoundingClientRect(); move((event.clientX - rect.left) / rect.width * buffer.duration); });
  handle.addEventListener("pointerup", event => { if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId); });
  handle.addEventListener("keydown", event => {
    if (!buffer || busy) return;
    const current = name === "Start" ? start : end, step = event.shiftKey ? 1 : .1;
    const values = { ArrowLeft: current - step, ArrowDown: current - step, ArrowRight: current + step, ArrowUp: current + step, Home: 0, End: buffer.duration };
    if (event.key in values) { event.preventDefault(); move(values[event.key]); }
  });
}
$("Wave").addEventListener("click", event => {
  if (!buffer || busy || event.target.closest("button")) return;
  const rect = $("Wave").getBoundingClientRect(); $("Source").currentTime = Math.max(0, Math.min(buffer.duration, (event.clientX - rect.left) / rect.width * buffer.duration));
});
$("Source").addEventListener("play", () => stopAudio("Source"));
$("SourcePlay").addEventListener("click", async () => {
  const audio = $("Source");
  if (!buffer || busy) return;
  if (!audio.paused) return audio.pause();
  stopAudio("Source");
  if (audio.ended) audio.currentTime = 0;
  try { await audio.play(); } catch (error) { if (error.name !== "AbortError") status("error", true); }
});
for (const event of ["play", "pause", "ended"]) $("Source").addEventListener(event, () => {
  const playing = !$("Source").paused;
  $("SourcePlay").toggleAttribute("data-playing", playing);
  $("SourcePlay").setAttribute("aria-label", `${copy[playing ? "pause" : "play"]} · ${copy.source}`);
  $("SourcePlay").title = copy[playing ? "pause" : "play"];
});
$("Source").addEventListener("timeupdate", () => {
  const time = $("Source").currentTime;
  $("SourceSeek").value = time; $("SourceTime").textContent = formatTime(time);
  $("Playhead").style.left = `${buffer ? Math.min(100, time / buffer.duration * 100) : 0}%`;
});
$("SourceSeek").addEventListener("input", () => {
  if (!buffer || busy || !$("Source").readyState) return;
  $("Source").currentTime = Number($("SourceSeek").value);
  $("SourceTime").textContent = formatTime($("Source").currentTime);
});
for (const name of ["Original", "Reversed"]) {
  const audio = $(name), play = $(name + "Play"), seek = $(name + "Seek");
  play.addEventListener("click", async () => {
    if (!audio.src || busy) return;
    if (!audio.paused) return audio.pause();
    stopAudio(name);
    if (audio.ended) audio.currentTime = 0;
    try { await audio.play(); if (name === "Reversed") track("preview_started"); }
    catch (error) { if (error.name !== "AbortError") status("error", true); }
  });
  for (const event of ["play", "pause", "ended"]) audio.addEventListener(event, () => {
    play.toggleAttribute("data-playing", !audio.paused); play.setAttribute("aria-label", `${copy[audio.paused ? "play" : "pause"]} · ${copy[name === "Original" ? "original" : "reversed"]}`);
    play.title = copy[audio.paused ? "play" : "pause"];
  });
  audio.addEventListener("timeupdate", () => { seek.value = audio.currentTime; $(name + "Time").textContent = `${formatTime(audio.currentTime).slice(0, -4)} / ${formatTime(resultDuration).slice(0, -4)}`; });
  audio.addEventListener("error", () => { if (audio.getAttribute("src")) status("error", true); });
  seek.addEventListener("input", () => { if (audio.readyState) audio.currentTime = Number(seek.value); });
}
$("Download").addEventListener("click", () => {
  if (!reversedBlob || busy) return;
  const url = URL.createObjectURL(reversedBlob), link = document.createElement("a");
  const filename = $("ExportName").value.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").replace(/\.wav$/i, "").trim().slice(0, 100) || "reversed";
  link.href = url; link.download = filename + ".wav"; document.body.append(link); link.click(); link.remove(); track("download_started");
  pendingDownloads.set(url, setTimeout(() => { URL.revokeObjectURL(url); pendingDownloads.delete(url); }, 60000));
});
$("Language").addEventListener("change", () => { location.href = $("Language").value; });
function applyTheme(theme) { document.documentElement.dataset.theme = theme; $("Theme").setAttribute("aria-pressed", String(theme === "dark")); drawSource(); }
try { applyTheme(localStorage.getItem("sonic-reverser-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")); } catch { applyTheme("light"); }
$("Theme").addEventListener("click", () => { const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; applyTheme(theme); try { localStorage.setItem("sonic-reverser-theme", theme); } catch {} });
new ResizeObserver(drawSource).observe($("Wave"));
const tool = document.getElementById("reverser");
for (const event of ["dragenter", "dragover"]) tool.addEventListener(event, e => { e.preventDefault(); tool.setAttribute("data-drag", ""); });
tool.addEventListener("dragleave", event => { if (!tool.contains(event.relatedTarget)) tool.removeAttribute("data-drag"); });
tool.addEventListener("drop", event => { event.preventDefault(); tool.removeAttribute("data-drag"); if (event.dataTransfer.files[0]) load(event.dataTransfer.files[0]); });
document.addEventListener("visibilitychange", () => { if (document.hidden) stopAudio(); });
window.addEventListener("pagehide", event => { stopAudio(); if (event.persisted) return; cancelJob(); clearResults(); if (sourceUrl) URL.revokeObjectURL(sourceUrl); for (const [url, timer] of pendingDownloads) { clearTimeout(timer); URL.revokeObjectURL(url); } pendingDownloads.clear(); });
track("page_open");
