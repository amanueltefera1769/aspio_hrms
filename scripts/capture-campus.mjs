import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--enable-webgl", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
await mkdir("artifacts", { recursive: true });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 940 }, reducedMotion: "reduce" });
    page.on("pageerror", e => console.log("PAGEERROR", e.message));
    page.on("console", m => { if (m.type() === "error") console.log("CONSOLE", m.text().slice(0, 250)); });
    await page.goto("http://localhost:3020/", { waitUntil: "networkidle", timeout: 90000 });
    await page.waitForFunction(() => document.querySelector(".campus-journey")?.dataset.ready === "true", undefined, { timeout: 60000 });
    await page.waitForTimeout(2500);
    console.log(width, await page.locator(".campus-render").evaluate(el => ({ canvas: !!el.querySelector("canvas"), camera: el.dataset.camera, progress: el.dataset.progress })));
    for (let i = 0; i < 5; i++) {
      if (i) await page.locator('.campus-progress [aria-label="Camera journey stages"] button').nth(i).click();
      await page.waitForTimeout(250);
      await page.screenshot({ path: `artifacts/campus-${width}-${i}.png` });
    }
    await page.close();
  }
} finally { await browser.close(); }
