import sharp from "sharp";
import { mkdir, copyFile } from "node:fs/promises";
import { join, resolve } from "node:path";
const [graphicsDirectory, brandDirectory, fontFile] = process.argv.slice(2);
if (!graphicsDirectory || !brandDirectory || !fontFile) throw new Error("Usage: node scripts/prepare-assets.mjs <graphics-directory> <brand-directory> <font-file>");
const images = {
  attendance: "Aspio HR attendance check-in-1.png",
  chat: "Aspio HR conversations in one place-2.png",
  payroll: "Effortless month-end payroll-3.png",
  reports: "Aspio HR_ A clearer picture-4.png",
  branches: "One HR system for every branch-5.png",
};
await mkdir("public/images", { recursive: true });
await mkdir("public/fonts", { recursive: true });
for (const [name, filename] of Object.entries(images)) {
  await sharp(join(resolve(graphicsDirectory), filename)).resize({ width: 1122, withoutEnlargement: true }).webp({ quality: 86 }).toFile(`public/images/${name}.webp`);
}
await sharp(join(resolve(brandDirectory), "assets/aspio-logo.png")).resize({ width: 444 }).webp({ quality: 95 }).toFile("public/images/aspio-logo.webp");
await copyFile(join(resolve(brandDirectory), "aspio-favicon.png"), "public/favicon.png");
await copyFile(resolve(fontFile), "public/fonts/geist-latin.woff2");
console.log("Prepared five supplied graphics, logo, favicon and a local font.");
