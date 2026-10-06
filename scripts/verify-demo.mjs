import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
import { validateContact } from "../src/lib/contact-validation.ts";

const base = process.env.PREVIEW_URL || "http://localhost:3020";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const errors = [];
await mkdir("artifacts", { recursive: true });
try {
  for (const width of [320, 390, 768, 1440, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
    page.on("pageerror", error => errors.push(error.message));
    assert.equal((await page.goto(`${base}/demo`, { waitUntil: "networkidle" })).status(), 200);
    assert.equal(await page.locator("h1").count(), 1);
    assert.equal(await page.locator('textarea, [name="message"]').count(), 0, "Demo does not have a visible or fabricated hidden description");
    assert.equal(await page.getByRole("checkbox").count(), 0, "Demo has no agreement checkbox");
    assert.equal(await page.locator('[name="consent"]').count(), 0, "Demo has no hidden agreement");
    assert.equal(await page.getByText("I agree", { exact: false }).count(), 0);
    assert.equal(await page.locator('[name="formType"]').inputValue(), "demo");
    assert.equal(await page.locator('[name="interest"]').inputValue(), "Request a demo");
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: `artifacts/demo-short-form-${width}.png`, fullPage: true });
    if (width === 390 || width === 1440) {
      await page.setViewportSize({ width, height: 1400 });
      await page.locator(".demo-form").screenshot({ path: `artifacts/demo-form-detail-${width}.png` });
      await page.setViewportSize({ width, height: 1000 });
    }
    await page.getByLabel("Your name").fill("Example visitor");
    await page.getByLabel("Email address").fill("visitor@example.com");
    await page.getByLabel("Company / organization").fill("Sample company");
    await page.getByLabel("Team size").selectOption("11–50 people");
    let count = 0;
    await page.route("**/api/contact", async route => {
      const body = route.request().postDataJSON();
      assert.equal(body.formType, "demo");
      assert.equal(body.message, undefined);
      assert.equal(body.consent, undefined, "Removing the checkbox does not manufacture agreement");
      assert.equal(validateContact(body).ok, true, "Actual browser payload passes the server validator without a description");
      assert.equal(validateContact(body).data.consent, false);
      count++;
      await route.fulfill({ status: count === 1 ? 503 : 200, contentType: "application/json", body: JSON.stringify({ message: count === 1 ? "Online sending is temporarily unavailable. Please email our team." : "Sent" }) });
    });
    await page.getByRole("button", { name: "Request my demo" }).click();
    await page.locator(".form-error[role=alert]").waitFor();
    assert.equal(await page.getByLabel("Company / organization").inputValue(), "Sample company");
    const fallback = decodeURIComponent(await page.getByRole("link", { name: "Send these details by email" }).getAttribute("href"));
    assert.ok(fallback.includes("Sample company") && !fallback.includes("undefined"));
    await page.getByRole("button", { name: "Request my demo" }).click();
    await page.getByText("You’re on our radar.").waitFor();
    assert.equal(count, 2);
    await page.getByRole("link", { name: "Back to home" }).click();
    await page.waitForURL(`${base}/`);
    await page.goto(`${base}/contact`, { waitUntil: "networkidle" });
    assert.equal(await page.getByLabel("A little about your needs").count(), 1);
    assert.equal(await page.getByLabel("A little about your needs").getAttribute("required"), "");
    assert.equal(await page.locator('[name="formType"]').inputValue(), "contact");
    assert.equal(await page.getByRole("checkbox").count(), 1);
    assert.equal(await page.getByRole("checkbox").getAttribute("required"), "");
    assert.equal(await page.getByRole("checkbox").isChecked(), false);
    await page.close();
    console.log(`Demo: short form, server validation, error recovery, email fallback, success and unchanged Contact passed at ${width}px`);
  }
  assert.deepEqual(errors, []);
} finally { await browser.close(); }
console.log("No real emails or lead submissions were sent.");
