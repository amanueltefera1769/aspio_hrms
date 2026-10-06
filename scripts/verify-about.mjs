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
    const response = await page.goto(`${baseURL}/about`, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator("h1").count(), 1);
    // The About hero uses its own new image, not the landing campus or campaign graphics.
    const image = page.locator(".abt-hero-visual img");
    assert.ok(decodeURIComponent(await image.getAttribute("src")).includes("/images/about/connections-v1.png"));
    await image.evaluate((element) => element.decode());
    assert.match(await page.locator("#about-title").innerText(), /A clearer workday\.\s+A more connected team\./);
    assert.equal(await page.locator(".abt-float, .abt-ticker, .abt-window, .abt-team-scene, .abt-hero-belief").count(), 0, "No old hero cards or decorative strips remain");
    assert.equal(await page.locator(".hr-about-header").count(), 1);
    assert.equal(await page.locator('.hr-about img[src*="people-first"]').count(), 0, "No previous hero artwork remains on About");
    if (width <= 650) {
      const menu = page.getByRole("button", { name: "Open navigation" });
      await menu.click();
      assert.equal(await page.getByRole("button", { name: "Close navigation" }).getAttribute("aria-expanded"), "true");
      await page.locator("#mobile-navigation").getByRole("link", { name: "About", exact: true }).focus();
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#mobile-navigation").count(), 0);
    }
    assert.equal(await page.locator(".abt-discover svg").evaluate(element => getComputedStyle(element).transitionDuration), "0s", "The hero respects reduced motion");
    if (width <= 900) {
      const copy = await page.locator(".abt-hero-copy").boundingBox();
      const visual = await page.locator(".abt-hero-visual").boundingBox();
      assert.ok(visual.y >= copy.y + copy.height, "Mobile presents the message and discovery action before the image");
    } else {
      assert.equal(await page.locator(".abt-hero-visual").evaluate(element => getComputedStyle(element).position), "absolute");
      assert.notEqual(await page.locator(".abt-hero-curve").evaluate(element => getComputedStyle(element).display), "none");
    }
    assert.equal(await page.locator(".abt-principles article").count(), 3);
    for (const section of await page.locator(".hr-about > section").all()) {
      await section.scrollIntoViewIfNeeded();
      const overflow = await page.evaluate(() => [innerWidth, document.documentElement.scrollWidth]);
      assert.ok(overflow[1] <= overflow[0] + 1, `About overflows at ${width}px: ${overflow}`);
    }
    assert.equal(await page.locator('.abt-contact a[href="mailto:semere.e@aspio.se"]').count(), 1);
    assert.equal(await page.locator('a[href*="amanuel"]').count(), 0, "The local contact address is no longer published");
    assert.equal((await page.content()).includes("amanuel"), false);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `artifacts/about-${width}.png`, fullPage: true });
    if (width === 390 || width === 1440) await page.screenshot({ path: `artifacts/about-hero-${width}.png` });
    await page.getByRole("link", { name: "Discover Aspio" }).focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => document.getElementById("our-purpose").getBoundingClientRect().top < 200);
    assert.ok(await page.locator("#our-purpose").isVisible());
    const purposeTop = await page.locator("#our-purpose").evaluate(element => element.getBoundingClientRect().top);
    assert.ok(purposeTop >= 75, "Purpose heading remains below the sticky navigation");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.locator(".abt-purpose").getByRole("link", { name: "See how it comes together" }).click();
    await page.waitForURL("**/services");
    assert.equal(await page.locator(".hr-about-header").count(), 0, "About header styling does not leak to Services");
    assert.equal(await page.locator(".hr-hero #hr-hero-screen").count(), 1);
    await page.goto(`${baseURL}/about`, { waitUntil: "networkidle" });
    await page.getByRole("link", { name: "Discover Aspio" }).click();
    await page.waitForFunction(() => document.getElementById("our-purpose").getBoundingClientRect().top < 200);
    await page.locator(".abt-workday-path a").first().click();
    await page.waitForURL("**/services#attendance");
    await page.locator(".att-reader").waitFor();
    await page.goto(`${baseURL}/about`, { waitUntil: "networkidle" });
    await page.locator(".abt-contact").getByRole("link", { name: "Let’s meet in a demo" }).click();
    await page.waitForURL("**/demo");
    assert.equal(await page.locator('[name="interest"]').inputValue(), "Request a demo");
    await page.close();
    console.log(`About verified at ${width}px`);
  }
  const motion = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference" });
  motion.on("pageerror", error => errors.push(error.message));
  await motion.goto(`${baseURL}/about`, { waitUntil: "networkidle" });
  assert.equal(await motion.locator(".abt-discover svg").evaluate(element => getComputedStyle(element).transitionDuration), "0.2s");
  await motion.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(await motion.locator(".abt-discover svg").evaluate(element => getComputedStyle(element).transitionDuration), "0s");
  await motion.close();
  assert.deepEqual(errors, []);
  console.log("About: layout, logo, feature links, purpose anchor, contact addresses and demo flow passed at all six widths.");
} finally { await browser.close(); }
