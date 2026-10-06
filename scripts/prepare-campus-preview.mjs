import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";

// Mechanical crops only: no generation, retouching, or changes to the originals.
// Close-ups share a 1.315 aspect and cover the overview's art window with little trimming.
const source = process.argv[2];
if (!source) throw new Error("Usage: node scripts/prepare-campus-preview.mjs <reference-directory>");
const output = resolve("public/images/campus");
await mkdir(output, { recursive: true });
for (const [input, name, crop] of [
  // Starts below the baked nav and right of the baked headline; live controls cover the baked labels.
  ["One connected team campus-1.png", "overview.webp", { left: 730, top: 88, width: 942, height: 764 }],
  // Close-ups omit the baked feature labels, page copy, header and bottom navigation.
  ["Aspio attendance check-in reception-3.png", "attendance.webp", { left: 917, top: 278, width: 755, height: 574 }],
  ["Aspio team communication room-2.png", "team.webp", { left: 852, top: 228, width: 820, height: 624 }],
  ["Aspio staff records office-5.png", "records.webp", { left: 732, top: 145, width: 940, height: 715 }],
]) {
  const info = await sharp(join(source, input)).extract(crop).webp({ quality: 90 }).toFile(join(output, name));
  console.log(`${name}: ${info.width} × ${info.height}, ${info.size} bytes`);
}
