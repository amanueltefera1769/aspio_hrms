import { chromium } from "@playwright/test";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
    await page.goto("http://localhost:3020", { waitUntil: "networkidle" });
    await page.screenshot({ path: `artifacts/home-viewport-${width}.png` });
    if (width === 390) {
      await page.locator(".hr-hero-stage").scrollIntoViewIfNeeded();
      await page.screenshot({ path: "artifacts/product-mobile.png" });
      await page.locator(".hr-feature-panel").scrollIntoViewIfNeeded();
      await page.screenshot({ path: "artifacts/feature-mobile.png" });
      await page.goto("http://localhost:3020/contact", { waitUntil: "networkidle" });
      await page.locator(".contact-form-shell").scrollIntoViewIfNeeded();
      await page.screenshot({ path: "artifacts/contact-form-mobile.png" });
    }
    await page.close();
  }
} finally { await browser.close(); }
