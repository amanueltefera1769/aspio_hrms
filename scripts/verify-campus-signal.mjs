import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const base = process.argv[2] || "http://localhost:3020";
const campusRoute = process.argv[3] || "/";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const errors = [];
const ready = page => page.waitForFunction(() => document.querySelector(".mc-hero")?.dataset.ready === "true");
const rest = (page, view) => page.waitForFunction(next => {
  const hero = document.querySelector(".mc-hero");
  return hero?.dataset.view === next && hero.dataset.travelling === "false";
}, view);
const active = (page, value) => page.waitForFunction(next => document.querySelector(".mc-signal")?.dataset.active === next, String(value));
await mkdir("artifacts", { recursive: true });

try {
  for (const width of [320, 390, 768, 1440, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 940 }, reducedMotion: "no-preference" });
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`${base}${campusRoute}`, { waitUntil: "networkidle" });
    await ready(page);
    await active(page, true);
    const svg = page.locator(".mc-signal");
    assert.equal(await svg.getAttribute("aria-hidden"), "true");
    assert.equal(await svg.getAttribute("focusable"), "false");
    assert.equal(await svg.evaluate(element => getComputedStyle(element).pointerEvents), "none");
    const bounds = await svg.boundingBox();
    const plane = await page.locator(".mc-overview").boundingBox();
    for (const dimension of ["x", "y", "width", "height"]) assert.ok(Math.abs(bounds[dimension] - plane[dimension]) < 1, `Artwork alignment at ${width}px`);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));

    // Prove a real traveling dash, then capture repeatable positions for review.
    assert.equal(await page.locator(".mc-signal-incoming.mc-signal-core").count(), 4);
    assert.equal(await page.locator(".mc-signal-outgoing.mc-signal-core").count(), 3);
    assert.equal(await page.locator(".mc-signal-arrival").count(), 3);
    const trail = page.locator('[data-route="courtyard"] .mc-signal-core');
    await svg.evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => { animation.currentTime = 1000; }));
    const offset = await trail.evaluate(element => getComputedStyle(element).strokeDashoffset);
    await page.waitForTimeout(180);
    assert.notEqual(await trail.evaluate(element => getComputedStyle(element).strokeDashoffset), offset);
    await svg.evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => { animation.currentTime = 1900; }));
    const inbound = await page.locator(".mc-signal-incoming.mc-signal-core").evaluateAll(elements => elements.map(element => Number(getComputedStyle(element).opacity)));
    assert.ok(inbound.every(value => value > .75), "Signals come toward the hub from every path");
    await page.screenshot({ path: `artifacts/campus-workflow-incoming-${width}.png` });
    await svg.evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => { animation.currentTime = 3400; }));
    assert.ok(Number(await page.locator(".mc-signal-hub").evaluate(element => getComputedStyle(element).opacity)) > .25);
    if (width === 1440 || width === 390) await page.screenshot({ path: `artifacts/campus-workflow-hub-${width}.png` });
    await svg.evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => { animation.currentTime = 5500; }));
    const outbound = page.locator(".mc-signal-outgoing.mc-signal-core");
    const outgoing = await outbound.evaluateAll(elements => elements.map(element => Number(getComputedStyle(element).opacity)));
    assert.ok(outgoing.every(value => value > .75), "All three buildings receive a signal");
    assert.ok((await page.locator(".mc-signal-incoming.mc-signal-core").evaluateAll(elements => elements.map(element => Number(getComputedStyle(element).opacity)))).every(value => value === 0), "Receive and distribute stages do not overlap");
    const before = await outbound.evaluateAll(elements => elements.map(element => Number.parseFloat(getComputedStyle(element).strokeDashoffset)));
    await svg.evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => { animation.currentTime = 5700; }));
    const after = await outbound.evaluateAll(elements => elements.map(element => Number.parseFloat(getComputedStyle(element).strokeDashoffset)));
    assert.ok(after.every((value, index) => value > before[index]), "Outgoing light travels in the opposite direction");
    await page.screenshot({ path: `artifacts/campus-workflow-outgoing-${width}.png` });
    await svg.screenshot({ path: `artifacts/campus-workflow-detail-${width}.png` });
    await svg.evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => { animation.currentTime = 7700; }));
    assert.ok((await page.locator(".mc-signal-arrival").evaluateAll(elements => elements.map(element => Number(getComputedStyle(element).opacity)))).every(value => value > .1), "Each entrance acknowledges arrival");
    if (width === 1440 || width === 390) await page.screenshot({ path: `artifacts/campus-workflow-arrival-${width}.png` });

    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await active(page, false);
    assert.equal(await trail.evaluate(element => getComputedStyle(element).animationPlayState), "paused");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await active(page, true);

    await page.getByRole("button", { name: "Disable scene motion" }).click();
    await active(page, false);
    assert.equal(await trail.evaluate(element => getComputedStyle(element).animationName), "none");
    await page.getByRole("button", { name: "Enable scene motion" }).click();
    await active(page, true);

    if (width === 1440 || width === 390) {
      for (const [name, view] of [["Attendance", "attendance"], [/^Team/, "team"], [/^(Staff records|Records)$/, "records"]]) {
        await page.locator(".mc-view-controls").getByRole("button", { name, exact: typeof name === "string" }).click();
        await active(page, false);
        await page.waitForTimeout(200);
        assert.equal(await svg.evaluate(element => getComputedStyle(element).visibility), "hidden", "Signal does not drift during camera travel");
        await rest(page, view);
        assert.equal(await svg.getAttribute("data-active"), "false");
        await page.getByRole("button", { name: "Back to overview", exact: true }).click();
        await rest(page, "overview");
        await active(page, true);
      }
    }

    await page.emulateMedia({ reducedMotion: "reduce" });
    await active(page, false);
    assert.equal(await svg.evaluate(element => getComputedStyle(element).display), "none");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await active(page, true);
    await page.close();
    console.log(`${width}px: every path, bidirectional workflow, arrival glows, alignment, pause, reduced motion and recovery passed`);
  }

  const failure = await browser.newPage({ reducedMotion: "no-preference" });
  failure.on("pageerror", error => errors.push(error.message));
  await failure.route("**/images/campus/**", route => route.abort());
  await failure.goto(`${base}${campusRoute}`, { waitUntil: "networkidle" });
  await failure.locator(".mc-image-error").waitFor();
  assert.equal(await failure.locator(".mc-signal").getAttribute("data-active"), "false");
  assert.equal(await failure.locator(".mc-actions a").isVisible(), true);
  await failure.close();
  assert.deepEqual(errors, []);
  console.log("All signal checks passed. No submissions or live HR changes.");
} finally {
  await browser.close();
}
