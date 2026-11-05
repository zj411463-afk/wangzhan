// Frame math follows the existing cutter's readMp3Frame implementation.
const ascii = (bytes, at, length) => String.fromCharCode(...bytes.subarray(at, at + length));

export function readFrame(bytes, offset) {
  if (offset + 4 > bytes.length || bytes[offset] !== 255 || (bytes[offset + 1] & 224) !== 224) return null;
  const versionBits = bytes[offset + 1] >> 3 & 3;
  const layerBits = bytes[offset + 1] >> 1 & 3;
  const bitrateIndex = bytes[offset + 2] >> 4;
  const sampleIndex = bytes[offset + 2] >> 2 & 3;
  if (versionBits === 1 || layerBits !== 1 || !bitrateIndex || bitrateIndex === 15 || sampleIndex === 3) return null;
  const version = versionBits === 3 ? 1 : versionBits === 2 ? 2 : 2.5;
  const rates = { 1: [44100, 48000, 32000], 2: [22050, 24000, 16000], 2.5: [11025, 12000, 8000] };
  const bitrates = version === 1
    ? [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]
    : [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
  const sampleRate = rates[version][sampleIndex];
  const length = Math.floor((version === 1 ? 144 : 72) * bitrates[bitrateIndex] * 1000 / sampleRate + (bytes[offset + 2] >> 1 & 1));
  if (offset + length > bytes.length) return null;
  const mono = (bytes[offset + 3] >> 6) === 3;
  const side = offset + 4 + ((bytes[offset + 1] & 1) ? 0 : 2);
  const sideLength = version === 1 ? (mono ? 17 : 32) : (mono ? 9 : 17);
  const info = ascii(bytes, side + sideLength, 4);
  return { start: offset, end: offset + length, duration: (version === 1 ? 1152 : 576) / sampleRate,
    sampleRate, version, mainDataBegin: version === 1 ? (bytes[side] << 1 | bytes[side + 1] >> 7) : bytes[side],
    metadata: info === "Xing" || info === "Info" || ascii(bytes, offset + 36, 4) === "VBRI" };
}

export function parseMP3(bytes) {
  let offset = 0;
  if (ascii(bytes, 0, 3) === "ID3") {
    if (bytes.length < 10 || bytes.subarray(6, 10).some(value => value & 128)) throw new Error("invalidFile");
    offset = 10 + (bytes[6] << 21) + (bytes[7] << 14) + (bytes[8] << 7) + bytes[9];
    if (bytes[3] === 4 && (bytes[5] & 16)) offset += 10;
    if (offset > bytes.length) throw new Error("invalidFile");
  }
  const frames = [];
  let duration = 0, skipped = 0, sampleRate = 0, version = 0;
  while (offset + 4 <= bytes.length) {
    const frame = readFrame(bytes, offset);
    if (!frame) {
      if (frames.length) {
        const tail = bytes.subarray(offset);
        if (ascii(bytes, offset, 3) === "TAG" || ascii(bytes, offset, 8) === "APETAGEX" || tail.every(value => value === 0)) break;
        throw new Error("invalidFile");
      }
      if (++skipped > 65536) throw new Error("invalidFile");
      offset++;
      continue;
    }
    if (!frames.length && !frame.metadata) {
      const next = readFrame(bytes, frame.end);
      if (!next || next.sampleRate !== frame.sampleRate) { offset++; continue; }
    }
    if (sampleRate && (frame.sampleRate !== sampleRate || frame.version !== version)) throw new Error("invalidFile");
    sampleRate = frame.sampleRate; version = frame.version;
    // Source Xing/VBRI lengths and seek tables describe the whole file, not each part.
    if (!frame.metadata) {
      frames.push({ start: frame.start, end: frame.end, time: duration,
        duration: frame.duration, mainDataBegin: frame.mainDataBegin });
      duration += frame.duration;
    }
    offset = frame.end;
  }
  if (frames.length < 5) throw new Error("invalidFile");
  return { frames, duration, sampleRate };
}

export function parseTime(value) {
  const text = value.trim();
  if (!/^(?:\d+:){0,2}\d+(?:\.\d+)?$/.test(text)) throw new Error("invalidCuts");
  const parts = text.split(":").map(Number);
  if (parts.length > 1 && parts.slice(1).some(part => part >= 60)) throw new Error("invalidCuts");
  return parts.reduce((seconds, part) => seconds * 60 + part, 0);
}

export function planParts(index, mode, value) {
  const { frames, duration } = index;
  let cuts;
  if (mode === "interval") {
    const interval = Number(value);
    if (!Number.isFinite(interval) || interval < 1 || Math.ceil(duration / interval) > 500) throw new Error("invalidInterval");
    cuts = Array.from({ length: Math.ceil(duration / interval) - 1 }, (_, i) => (i + 1) * interval);
  } else {
    const text = String(value).trim();
    cuts = text ? text.split(/[,;\n]+/).map(parseTime) : [];
    if (cuts.length > 499 || cuts.some(time => time <= 0 || time >= duration)) throw new Error("invalidCuts");
    cuts.sort((a, b) => a - b);
    if (cuts.some((time, i) => i && time === cuts[i - 1])) throw new Error("invalidCuts");
  }
  const boundaries = [0];
  for (const cut of cuts) {
    let low = 0, high = frames.length;
    while (low < high) { const mid = low + high >> 1; if (frames[mid].time < cut) low = mid + 1; else high = mid; }
    let at = Math.min(frames.length - 1, low);
    if (at > 0 && cut - frames[at - 1].time < frames[at].time - cut) at--;
    // Prefer a nearby independently decodable frame when one is available.
    const nearby = [];
    for (let i = Math.max(1, at - 8); i <= Math.min(frames.length - 1, at + 8); i++) {
      if (!frames[i].mainDataBegin && Math.abs(frames[i].time - cut) <= .1) nearby.push(i);
    }
    nearby.sort((a, b) => Math.abs(frames[a].time - cut) - Math.abs(frames[b].time - cut));
    at = nearby[0] ?? at;
    if (at <= boundaries[boundaries.length - 1]) throw new Error("invalidCuts");
    boundaries.push(at);
  }
  boundaries.push(frames.length);
  return boundaries.slice(0, -1).map((first, i) => {
    const end = boundaries[i + 1];
    return { startByte: frames[first].start, endByte: frames[end - 1].end,
      start: frames[first].time, end: end === frames.length ? duration : frames[end].time,
      dependent: frames[first].mainDataBegin > 0 };
  });
}
