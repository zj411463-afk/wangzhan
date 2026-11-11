import { renderPair, peaksFor } from "./audio-reverser-core.mjs";
self.onmessage = async ({ data }) => {
  try {
    const pair = await renderPair(data.channels, data.rate, progress => self.postMessage({ progress }), () => new Promise(resolve => setTimeout(resolve, 0)));
    const peaks = peaksFor(data.channels, 350);
    self.postMessage({ ...pair, peaks }, [pair.original, pair.reversed, peaks.buffer]);
  } catch {
    self.postMessage({ error: "error" });
  }
};
