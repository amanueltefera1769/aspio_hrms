import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

// Offline, one-time depth maps for the campus parallax. The browser only loads the
// small grayscale results; no model ships with the site.
// Usage: TRANSFORMERS_PATH=<dir containing node_modules/@huggingface/transformers> node scripts/prepare-campus-depth.mjs
const modulePath = process.env.TRANSFORMERS_PATH
  ? pathToFileURL(join(process.env.TRANSFORMERS_PATH, "node_modules/@huggingface/transformers/src/transformers.js")).href
  : "@huggingface/transformers";
const { pipeline, RawImage, env } = await import(modulePath);
if (process.env.MODEL_CACHE) env.cacheDir = process.env.MODEL_CACHE; // short path for Windows
const estimate = await pipeline("depth-estimation", "onnx-community/depth-anything-v2-small", { dtype: "fp32" });
const base = resolve("public/images/campus/sequences-v1");
await mkdir(join(base, "depth"), { recursive: true });
for (const [input, name] of [["overview", "overview"], ["attendance/05", "attendance"], ["team/04", "team"], ["records/04", "records"]]) {
  const png = await sharp(join(base, `${input}.webp`)).png().toBuffer();
  const { depth } = await estimate(await RawImage.fromBlob(new Blob([png], { type: "image/png" })));
  // Near is bright. A light blur keeps displacement smooth at object edges.
  const info = await sharp(Buffer.from(depth.data), { raw: { width: depth.width, height: depth.height, channels: 1 } })
    .resize(640, 360).normalise().blur(2.2).webp({ quality: 85 }).toFile(join(base, "depth", `${name}.webp`));
  console.log(`depth/${name}.webp: ${info.width} × ${info.height}, ${info.size} bytes`);
}
