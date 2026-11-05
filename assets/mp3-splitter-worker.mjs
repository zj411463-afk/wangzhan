import { parseMP3 } from "./mp3-frames.mjs";
self.onmessage = async ({ data }) => {
  try {
    const bytes = new Uint8Array(await data.file.arrayBuffer());
    self.postMessage({ index: parseMP3(bytes) });
  } catch (error) { self.postMessage({ error: error.message === "invalidFile" ? "invalidFile" : "readError" }); }
};
