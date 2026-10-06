import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const base = process.env.PREVIEW_URL || "http://localhost:3020";
await mkdir("artifacts", { recursive: true });
const errors = [];
try {
  for (const width of [1440, 390, 320, 768, 1024, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
    page.on("pageerror", (error) => errors.push(error.message));
    assert.equal((await page.goto(base, { waitUntil: "networkidle" })).status(), 200);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator("h1").count(), 1);
    assert.equal(await page.locator('.hr-home img[src*="attendance"],.hr-home img[src*="chat"],.hr-home img[src*="payroll"],.hr-home img[src*="reports"],.hr-home img[src*="branches"]').count(), 0);
    const checkOverflow = async () => {
      const dimensions = await page.evaluate(() => [innerWidth, document.documentElement.scrollWidth]);
      assert.ok(dimensions[1] <= dimensions[0] + 1, `Overflow at ${width}: ${dimensions}`);
      const content = await page.locator(".hr-demo-screen").evaluate((element) => [element.clientWidth, element.scrollWidth]);
      assert.ok(content[1] <= content[0] + 1, `Preview overflow at ${width}: ${content}`);
    };
    await checkOverflow();
    await page.screenshot({ path: `artifacts/landing-hero-${width}.png` });
    await page.screenshot({ path: `artifacts/landing-full-${width}.png`, fullPage: true });
    await page.getByLabel("Preview branch").selectOption("Kazanchis");
    assert.match(await page.locator(".hr-overview-metrics").innerText(), /8\s*\/ 9/);
    for (const feature of ["Attendance", "Team chat", "Payroll preparation", "Reports", "Branches"]) {
      const button = page.locator(".hr-feature-nav").getByRole("button", { name: feature, exact: true });
      await button.click();
      assert.equal(await button.getAttribute("aria-pressed"), "true");
      await checkOverflow();
      if ([1440, 390].includes(width)) {
        await page.locator(".hr-feature-panel").scrollIntoViewIfNeeded();
        await page.screenshot({ path: `artifacts/landing-${feature.toLowerCase().replaceAll(" ", "-")}-${width}.png` });
      }
    }
    await page.locator(".hr-feature-nav").getByRole("button", { name: "Attendance", exact: true }).click();
    const method = page.getByRole("button", { name: "Biometric", exact: true });
    await method.focus();
    await page.keyboard.press("Enter");
    assert.match(await page.locator(".hr-attendance-confirm").innerText(), /Biometric/);
    for (const branch of ["Piassa", "Kazanchis", "Bole"]) {
      await page.locator(".hr-network-nodes").getByRole("button", { name: new RegExp(branch) }).click();
      assert.match(await page.locator(".hr-network-summary").innerText(), new RegExp(`${branch} branch`));
    }
    await page.locator(".hr-faq summary").filter({ hasText: "Can we manage more than one branch?" }).click();
    assert.equal(await page.locator(".hr-faq details[open]").count(), 1);
    await page.locator(".hr-hero-copy").getByRole("link", { name: "Request a demo" }).click();
    await page.waitForURL("**/demo");
    assert.equal(await page.locator('[name="interest"]').inputValue(), "Request a demo");
    await page.close();
    console.log(`Landing page verified at ${width}px`);
  }
  assert.deepEqual(errors, []);
} finally { await browser.close(); }
