export const MAX_BYTES = 40 * 1024 * 1024;
export const MAX_SECONDS = 300;
export function parseTime(value) {
  const text = String(value).trim();
  if (!/^\d+(?::[0-5]\d){0,2}(?:\.\d{1,3})?$/.test(text)) return NaN;
  return text.split(":").reduce((total, part) => total * 60 + Number(part), 0);
}
export function formatTime(seconds) {
  const milliseconds = Math.round(Math.max(0, seconds) * 1000);
  return `${String(Math.floor(milliseconds / 60000)).padStart(2, "0")}:${String(Math.floor(milliseconds / 1000) % 60).padStart(2, "0")}.${String(milliseconds % 1000).padStart(3, "0")}`;
}
export function sampleRange(start, end, length, rate) {
  if (![start, end, length, rate].every(Number.isFinite) || rate <= 0 || start < 0 || end > length / rate + 0.000001 || start >= end) throw new Error("range");
  const first = Math.round(start * rate), last = Math.min(length, Math.round(end * rate));
  if (last <= first) throw new Error("range");
  return [first, last];
}
export function wavHeader(frames, channels, sampleRate) {
  if (!Number.isInteger(frames) || frames < 1 || ![1, 2].includes(channels) || !Number.isInteger(sampleRate) || sampleRate < 8000 || sampleRate > 192000 || frames / sampleRate > MAX_SECONDS) throw new Error("long");
  const size = frames * channels * 2;
  const buffer = new ArrayBuffer(44 + size), view = new DataView(buffer);
  const text = (at, value) => [...value].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)));
  text(0, "RIFF"); view.setUint32(4, 36 + size, true); text(8, "WAVE"); text(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true); text(36, "data"); view.setUint32(40, size, true);
  return buffer;
}
export function pcm16(value) {
  const sample = Math.max(-1, Math.min(1, Number.isFinite(value) ? value : 0));
  return Math.round(sample * (sample < 0 ? 32768 : 32767));
}
export async function renderPair(channels, rate, onProgress = () => {}, yieldTask = () => Promise.resolve()) {
  const frames = channels[0]?.length;
  if (!channels.every(channel => channel instanceof Float32Array && channel.length === frames)) throw new Error("invalid");
  const original = wavHeader(frames, channels.length, rate), reversed = wavHeader(frames, channels.length, rate);
  const forward = new DataView(original), backward = new DataView(reversed);
  for (let base = 0; base < frames; base += 32768) {
    for (let i = base; i < Math.min(frames, base + 32768); i++) {
      for (let c = 0; c < channels.length; c++) {
        const value = pcm16(channels[c][i]);
        forward.setInt16(44 + (i * channels.length + c) * 2, value, true);
        backward.setInt16(44 + ((frames - 1 - i) * channels.length + c) * 2, value, true);
      }
    }
    onProgress(Math.min(1, (base + 32768) / frames));
    await yieldTask();
  }
  return { original, reversed };
}
export function peaksFor(channels, bins = 700) {
  const length = channels[0].length, peaks = new Float32Array(Math.min(bins, length));
  for (let b = 0; b < peaks.length; b++) {
    const first = Math.floor(b * length / peaks.length), last = Math.floor((b + 1) * length / peaks.length);
    let peak = 0;
    for (const channel of channels) for (let i = first; i < last; i++) peak = Math.max(peak, Math.abs(channel[i]));
    peaks[b] = peak;
  }
  return peaks;
}
