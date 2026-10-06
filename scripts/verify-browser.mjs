import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const baseURL = process.env.PREVIEW_URL || "http://localhost:3020";
const executablePath = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({ executablePath, headless: true });
await mkdir("artifacts", { recursive: true });
const errors = [];
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of ["/", "/services", "/about", "/contact"]) {
      const response = await page.goto(`${baseURL}${route}`, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200);
      await page.evaluate(() => document.fonts.ready);
      for (const image of await page.locator("img:not(dialog img)").all()) {
        if (!(await image.isVisible())) continue;
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(async (element) => { await element.decode(); });
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      assert.equal(await page.locator("h1").count(), 1);
      const overflow = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
      assert.ok(overflow.document <= overflow.viewport + 1, `${route} overflows at ${width}px: ${JSON.stringify(overflow)}`);
      await page.screenshot({ path: `artifacts/${route === "/" ? "home" : route.slice(1)}-${width}.png`, fullPage: true });
    }
    await page.goto(baseURL, { waitUntil: "networkidle" });
    for (const view of ["Team chat", "Payroll preparation", "Reports", "Branches", "Attendance"]) {
      const control = page.locator(".hr-feature-nav").getByRole("button", { name: view, exact: true });
      await control.click();
      assert.equal(await control.getAttribute("aria-pressed"), "true");
    }
    await page.getByRole("button", { name: "Biometric", exact: true }).click();
    assert.ok((await page.locator(".hr-attendance-confirm").innerText()).includes("Biometric"));
    await page.locator(".hr-network-nodes").getByRole("button", { name: "Piassa" }).click();
    assert.ok((await page.locator(".hr-network-summary").innerText()).includes("6 checked in"));
    if (width === 390) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Services" }).click();
      await page.waitForURL("**/services");
    } else { await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Services" }).click(); }
    await page.getByLabel("Preview branch").selectOption("Bole");
    assert.equal(await page.locator(".hr-overview-metrics > div").first().locator("b").innerText(), "10 / 12");
    await page.locator(".hr-hero").getByRole("link", { name: "Explore the tools" }).click();
    await page.waitForURL("**/services#attendance");
    await page.locator(".svc-faq summary").filter({ hasText: "Can we manage more than one branch?" }).click();
    assert.ok(await page.locator("details[open]").count() > 0);
    await page.getByRole("navigation", { name: "Explore services" }).getByRole("link", { name: "Attendance", exact: true }).click();
    await page.getByRole("button", { name: "Biometric", exact: true }).click();
    assert.ok((await page.locator(".hr-attendance-confirm").innerText()).includes("Biometric"));
    await page.goto(`${baseURL}/contact?request=demo`, { waitUntil: "networkidle" });
    assert.equal(await page.locator('[name="interest"]').inputValue(), "Request a demo");
    await page.getByLabel("Your name").fill("Liya Bekele");
    await page.getByLabel("Email address").fill("liya@example.com");
    await page.getByLabel("Company / organization").fill("Sample company");
    await page.getByLabel("Team size").selectOption("11–50 people");
    await page.getByLabel("A little about your needs").fill("We want a demo for our team working across two branches.");
    await page.getByRole("checkbox").check();
    await page.route("**/api/contact", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ message: "Online sending is temporarily unavailable. Please email our team." }) }));
    await page.getByRole("button", { name: "Request my demo" }).click();
    await page.locator(".form-error[role=alert]").waitFor();
    assert.equal(await page.getByLabel("Your name").inputValue(), "Liya Bekele");
    assert.ok((await page.getByRole("link", { name: "Send these details by email" }).getAttribute("href")).startsWith("mailto:"));
    await page.screenshot({ path: `artifacts/contact-error-${width}.png`, fullPage: true });
    await page.unroute("**/api/contact");
    await page.route("**/api/contact", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ message: "Sent" }) }));
    await page.getByRole("button", { name: "Request my demo" }).click();
    await page.getByText("You’re on our radar.").waitFor();
    await page.screenshot({ path: `artifacts/contact-success-${width}.png`, fullPage: true });
    await page.getByRole("link", { name: "Back to home" }).click();
    await page.waitForURL(baseURL + "/");
    for (const narrowWidth of [320, 768]) {
      await page.setViewportSize({ width: narrowWidth, height: 900 });
      const dimensions = await page.evaluate(() => [innerWidth, document.documentElement.scrollWidth]);
      assert.ok(dimensions[1] <= dimensions[0] + 1, `Home overflows at ${narrowWidth}px: ${dimensions}`);
    }
    await page.close();
  }
  assert.deepEqual(errors, []);
  console.log("Verified all four pages at desktop and mobile, preview controls, service navigation, FAQs, and contact recovery/success. No real email was sent.");
} finally { await browser.close(); }
