import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
await mkdir("artifacts", { recursive: true });
const errors = [];
try {
  for (const width of [1440, 390, 320, 1024, 768]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${process.env.PREVIEW_URL || "http://localhost:3020"}/services`, { waitUntil: "networkidle" });
    const nav = page.getByRole("navigation", { name: width <= 650 ? "Mobile hero preview" : "Hero preview", exact: true });
    const stage = page.locator(".hr-hero-stage");
    const screen = page.locator("#hr-hero-screen");
    for (const logo of await stage.getByRole("img", { name: "Aspio", exact: true }).all()) {
      if (await logo.isVisible()) await logo.evaluate((element) => element.decode());
    }
    await page.screenshot({ path: `artifacts/interactive-hero-${width}.png` });
    await page.getByLabel("Preview branch").selectOption("Bole");
    assert.match(await screen.locator(".hr-overview-metrics").innerText(), /10\s*\/ 12/);
    assert.equal(await screen.locator(".hr-staff-row").count(), 1);
    await page.getByLabel("Preview branch").selectOption("all");
    for (const label of ["Dashboard", "Attendance", "Chat", "Staff CRM", "Files", "Reports", "Branches"]) {
      const control = nav.getByRole("button", { name: label, exact: true });
      await control.click();
      assert.equal(await control.getAttribute("aria-pressed"), "true");
      assert.equal(await screen.getAttribute("aria-label"), `${label} preview`);
      const sizes = await screen.evaluate((element) => [element.clientWidth, element.scrollWidth]);
      assert.ok(sizes[1] <= sizes[0] + 1, `${label} overflows at ${width}px: ${sizes}`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      if ([1440, 390].includes(width)) {
        await stage.scrollIntoViewIfNeeded();
        await page.screenshot({ path: `artifacts/hero-${label.toLowerCase().replaceAll(" ", "-")}-${width}.png` });
      }
    }
    await nav.getByRole("button", { name: "Attendance", exact: true }).click();
    await screen.getByLabel("Hero check-in method").selectOption("Biometric");
    await screen.getByRole("button", { name: "Try a check-in" }).click();
    assert.match(await screen.getByRole("status").innerText(), /Biometric recorded/);
    await nav.getByRole("button", { name: "Dashboard", exact: true }).click();
    assert.match(await screen.locator(".hr-overview-metrics").innerText(), /25\s*\/ 28/);
    await screen.getByRole("button", { name: /Your week, at a glance/ }).click();
    await screen.getByLabel("Preview report period").selectOption("month");
    assert.match(await screen.locator(".hr-hero-report-stat").innerText(), /1546.0/);
    await nav.getByRole("button", { name: "Staff CRM", exact: true }).click();
    await screen.getByLabel("Search preview staff").fill("Liya");
    assert.equal(await screen.locator("details").count(), 1);
    await screen.locator("summary").click();
    assert.equal(await screen.locator("details[open]").count(), 1);
    await screen.getByLabel("Search preview staff").fill("nonexistent");
    assert.match(await screen.innerText(), /No matching staff/);
    await screen.getByLabel("Search preview staff").fill("");
    await nav.getByRole("button", { name: "Chat", exact: true }).click();
    await screen.getByLabel("Preview message", { exact: true }).fill("Let’s review the schedule.");
    await screen.getByRole("button", { name: "Send preview message" }).click();
    assert.match(await screen.getByRole("log").innerText(), /Let’s review the schedule/);
    await screen.getByLabel("Preview conversation").selectOption("Dawit Alemu");
    assert.ok(!(await screen.getByRole("log").innerText()).includes("Let’s review the schedule"));
    await nav.getByRole("button", { name: "Files", exact: true }).click();
    await screen.getByRole("button", { name: /Branch schedule/ }).click();
    assert.match(await screen.locator(".hr-hero-file-detail").innerText(), /Monday team catch-up/);
    const branchControl = nav.getByRole("button", { name: "Branches", exact: true });
    await branchControl.focus();
    await page.keyboard.press("Enter");
    await screen.getByRole("button", { name: /Piassa/ }).click();
    assert.equal(await page.getByLabel("Preview branch").inputValue(), "Piassa");
    await nav.getByRole("button", { name: "Dashboard", exact: true }).click();
    assert.match(await screen.locator(".hr-staff-rows").innerText(), /Hana Tadesse/);
    await page.close();
    console.log(`Hero controls, logo, branch filtering, messaging and keyboard navigation verified at ${width}px`);
  }
  assert.deepEqual(errors, []);
} finally { await browser.close(); }
