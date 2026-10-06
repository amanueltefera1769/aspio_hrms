import sharp from "sharp";
import { mkdir } from "node:fs/promises";
const input = process.argv[2];
if (!input) throw new Error("Provide the generated connected-workplace PNG path.");
await mkdir("public/images", { recursive: true });
await sharp(input).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 88 }).toFile("public/images/connected-workplace.webp");
console.log(await sharp("public/images/connected-workplace.webp").metadata());
