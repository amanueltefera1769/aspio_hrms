import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
await mkdir("artifacts", { recursive: true });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 940 }, reducedMotion: "reduce" });
    page.on("pageerror", error => console.log("PAGEERROR", error.message));
    await page.goto("http://localhost:3020/", { waitUntil: "networkidle" });
    await page.waitForFunction(() => document.querySelector(".mc-hero")?.dataset.ready === "true");
    await page.screenshot({ path: `artifacts/motion-campus-overview-${width}.png` });
    await page.locator(".mc-view-controls").getByRole("button", { name: "Attendance", exact: true }).click();
    await page.screenshot({ path: `artifacts/motion-campus-attendance-${width}.png` });
    console.log(`Captured ${width}px overview and attendance`);
    await page.close();
  }
} finally { await browser.close(); }
