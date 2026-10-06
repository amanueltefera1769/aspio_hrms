import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";

const baseURL = process.env.PREVIEW_URL || "http://localhost:3020";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
await mkdir("artifacts", { recursive: true });
const errors = [];
try {
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(`${baseURL}/services`, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator("h1").count(), 1);
    assert.equal(await page.locator(".svc-stories > section").count(), 5);
    assert.equal(await page.locator(".svc-tools article").count(), 7);
    assert.ok((await page.locator(".hr-services img").evaluateAll(images => images.map(image => image.alt))).every(alt => alt === "Aspio"), "Only Aspio logos should appear on Services, not campaign graphics");
    assert.equal(await page.locator(".hr-hero #hr-hero-screen").count(), 1, "Services uses the original interactive workspace hero");
    for (const logo of await page.locator(".hr-hero-stage").getByRole("img", { name: "Aspio", exact: true }).all()) {
      if (await logo.isVisible()) await logo.evaluate(element => element.decode());
    }
    const index = page.getByRole("navigation", { name: "Explore services" });
    for (const [id, label] of [["attendance", "Attendance"], ["chat", "Team chat"], ["payroll", "Payroll preparation"], ["reports", "Reports"], ["branches", "Branches"], ["workspace", "More tools"]]) {
      const link = index.getByRole("link", { name: label, exact: true });
      await link.click();
      await page.waitForFunction((sectionId) => {
        const section = document.getElementById(sectionId);
        const header = document.querySelector(".site-header");
        const menu = document.querySelector(".svc-index");
        const top = section.getBoundingClientRect().top;
        return top >= header.offsetHeight + menu.offsetHeight - 1 && top < 250;
      }, id);
      assert.equal(await link.getAttribute("aria-current"), "location", `${id} at ${width}px`);
      const overflow = await page.evaluate(() => [innerWidth, document.documentElement.scrollWidth]);
      assert.ok(overflow[1] <= overflow[0] + 1, `Services/${id} overflows at ${width}px: ${overflow}`);
    }
    await index.getByRole("link", { name: "Attendance", exact: true }).click();
    for (const name of ["Biometric", "App check-in"]) {
      const button = page.getByRole("button", { name, exact: true });
      await button.focus();
      await page.keyboard.press("Enter");
      assert.equal(await button.getAttribute("aria-pressed"), "true");
      // The terminal scans and the phone sends before the shared record updates.
      await page.waitForFunction(method => document.querySelector(".att-record")?.innerText.includes(method), name, { timeout: 4000 });
      const target = await button.boundingBox();
      assert.ok(target.width >= 44 && target.height >= 44, `${name} needs a usable touch target at ${width}px`);
    }
    for (const summary of await page.locator(".svc-faq summary").all()) {
      await summary.focus();
      await page.keyboard.press("Enter");
      assert.equal(await summary.evaluate((element) => element.parentElement.open), true);
      await page.keyboard.press("Enter");
      assert.equal(await summary.evaluate((element) => element.parentElement.open), false);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForFunction(() => document.querySelector('.svc-index a[aria-current]')?.getAttribute('href') === '#attendance');
    await page.locator(".svc-faq summary").last().blur();
    await page.screenshot({ path: `artifacts/services-${width}.png`, fullPage: true });
    if (width === 390 || width === 1440) {
      await page.screenshot({ path: `artifacts/services-hero-${width}.png` });
      await index.getByRole("link", { name: "Attendance", exact: true }).click();
      await page.waitForFunction(() => document.getElementById("attendance").getBoundingClientRect().top < 250);
      await page.screenshot({ path: `artifacts/services-attendance-${width}.png` });
      await page.locator(".att-experience").screenshot({ path: `artifacts/attendance-devices-${width}.png` });
      await index.getByRole("link", { name: "Team chat", exact: true }).click();
      await page.waitForFunction(() => document.getElementById("chat").getBoundingClientRect().top < 250);
      await page.screenshot({ path: `artifacts/services-chat-${width}.png` });
      await page.evaluate(() => document.getElementById("branches").scrollIntoView());
      await page.waitForFunction(() => document.querySelector('.svc-index a[aria-current]')?.getAttribute('href') === '#branches');
      await page.screenshot({ path: `artifacts/services-branches-${width}.png` });
    }
    await page.locator(".svc-final").getByRole("link", { name: "Request your demo" }).click();
    await page.waitForURL("**/demo");
    assert.equal(await page.locator('[name="interest"]').inputValue(), "Request a demo");
    await page.goto(`${baseURL}/services#reports`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => document.getElementById("reports").getBoundingClientRect().top < 250);
    await page.close();
    console.log(`Services verified at ${width}px`);
  }
  assert.deepEqual(errors, []);
  console.log("Services: all sections, sticky navigation, anchor visibility, keyboard controls, FAQs, logos and demo links passed. No campaign artwork or live data mutations.");
} finally { await browser.close(); }
