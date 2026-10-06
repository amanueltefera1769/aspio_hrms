import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const base = process.argv[2] || process.env.PREVIEW_URL || "http://localhost:3020";
const campusRoute = process.argv[3] || "/";
const errors = [];
await mkdir("artifacts", { recursive: true });
const waitReady = page => page.waitForFunction(() => document.querySelector(".mc-hero")?.dataset.ready === "true");
const waitView = (page, view) => page.waitForFunction(value => {
  const hero = document.querySelector(".mc-hero");
  return hero?.dataset.view === value && hero.dataset.travelling === "false";
}, view);
const control = (page, name) => page.locator(".mc-view-controls").getByRole("button", { name });
const attendance = page => control(page, "Attendance");
const team = page => control(page, /^Team/);
const records = page => control(page, /^(Staff records|Records)$/);
const opacity = (page, selector) => page.locator(selector).evaluate(element => getComputedStyle(element).opacity);
const returnToOverview = page => page.getByRole("button", { name: "Back to overview", exact: true });
const overflow = async (page, width) => {
  const bounds = await page.evaluate(() => [innerWidth, document.documentElement.scrollWidth]);
  assert.ok(bounds[1] <= bounds[0] + 1, `Overflow at ${width}px: ${bounds}`);
};
try {
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 940 }, reducedMotion: "reduce" });
    const requests = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("request", request => requests.push(request.url()));
    const response = await page.goto(`${base}${campusRoute}`, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    await waitReady(page);
    assert.equal(await page.locator("h1").count(), 1);
    const robots = await page.locator('meta[name="robots"]').count() ? await page.locator('meta[name="robots"]').getAttribute("content") : "";
    assert.equal(robots.includes("noindex"), campusRoute === "/home-lab");
    assert.equal(await page.getByRole("button", { name: "Reduced motion enabled" }).isDisabled(), true);
    // The only canvases are the 2D depth layers, hidden at rest and never set up without motion.
    assert.equal(await page.locator(".mc-art canvas:not(.mc-depth)").count(), 0);
    assert.deepEqual([...new Set(await page.locator(".mc-depth").evaluateAll(elements => elements.map(element => getComputedStyle(element).visibility)))], ["hidden"]);
    assert.equal(requests.some(url => /\.glb|\.mp4|\.webm|campus-scene/.test(url)), false, "No model or video download");
    assert.equal(requests.some(url => /sequences-v1\/depth\//.test(url)), false, "Depth maps are not loaded with reduced motion");
    await overflow(page, width);
    await page.screenshot({ path: `artifacts/campus-sequence-overview-${width}.png` });
    await attendance(page).focus();
    await page.keyboard.press("Enter");
    await waitView(page, "attendance");
    assert.equal(await page.locator("#mc-title").innerText(), "Every check-in.\nIn one place.");
    assert.equal(await page.locator(".mc-example header span").textContent(), "Example data");
    assert.equal(await page.locator(".mc-service-link").getAttribute("href"), "/services#attendance");
    assert.equal(await page.locator(".mc-scene-controls").evaluate(element => element.inert), true);
    const results = await page.locator(".mc-staff-result").evaluateAll(elements => elements.map(element => getComputedStyle(element).opacity));
    assert.deepEqual(results, ["1", "1"], "Reduced motion shows all results immediately");
    await overflow(page, width);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: `artifacts/campus-sequence-attendance-${width}.png` });
    await page.getByRole("button", { name: "Replay example check-in" }).click();
    assert.equal(await page.locator(".mc-staff-row").count(), 2);
    // Feature to feature without returning to the overview.
    await team(page).click();
    await waitView(page, "team");
    assert.equal(await page.locator("#mc-title").innerText(), "Keep conversations\nwith your team.");
    assert.equal(await page.locator(".mc-example header span").textContent(), "Example conversation");
    assert.equal(await page.locator(".mc-service-link").getAttribute("href"), "/services#chat");
    assert.equal(await page.locator(".mc-message-reply .mc-message-text").evaluate(element => getComputedStyle(element).opacity), "1");
    assert.equal(await page.locator(".mc-typing").isVisible(), false, "No typing indicator without motion");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: `artifacts/campus-sequence-team-${width}.png` });
    await page.locator(".mc-next").click();
    await waitView(page, "records");
    assert.equal(await page.locator("#mc-title").innerText(), "Staff information.\nKept together.");
    assert.equal(await page.locator(".mc-example header span").textContent(), "Example data");
    assert.equal(await page.locator(".mc-service-link").getAttribute("href"), "/services#payroll");
    assert.equal(await page.locator("#mc-record-attendance").isVisible(), true);
    await page.getByRole("button", { name: "Personal details" }).click();
    assert.equal(await page.locator("#mc-record-details").isVisible(), true);
    assert.equal(await page.locator("#mc-record-attendance").isVisible(), false, "One disclosure open at a time");
    await page.getByRole("button", { name: "Replay example staff record" }).click();
    assert.equal(await page.locator("#mc-record-attendance").isVisible(), true, "Replay resets the record");
    await overflow(page, width);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: `artifacts/campus-sequence-records-${width}.png` });
    await page.getByRole("button", { name: "See the connected campus" }).click();
    await waitView(page, "overview");
    assert.equal(await page.locator(".mc-kicker").textContent(), "ONE CONNECTED WORKSPACE");
    assert.equal(await page.locator(".mc-scene-controls .mc-label-check").count(), 3);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: `artifacts/campus-sequence-connected-${width}.png` });
    await page.getByRole("button", { name: "Explore again" }).click();
    await waitView(page, "attendance");
    await returnToOverview(page).click();
    await waitView(page, "overview");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    if (width > 700) {
      for (const [label, view] of [["Attendance", "attendance"], ["Team communication", "team"], ["Staff records", "records"]]) {
        // Click the visible right side; at narrower widths the copy overlaps the left building.
        const building = page.getByRole("button", { name: `Explore ${label} building`, exact: true });
        const box = await building.boundingBox();
        await building.click({ position: { x: box.width * .85, y: box.height * .55 } });
        await waitView(page, view);
        await returnToOverview(page).click();
        await waitView(page, "overview");
      }
    } else {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page.locator("#mobile-navigation a").first().focus();
      await page.keyboard.press("Escape");
      await page.locator("#mobile-navigation").waitFor({ state: "detached" });
    }
    await page.locator(".mc-actions").getByRole("link", { name: "Request a demo" }).click();
    await page.waitForURL("**/demo");
    assert.equal(await page.locator('[name="interest"]').inputValue(), "Request a demo");
    await page.goto(`${base}${campusRoute}`, { waitUntil: "networkidle" });
    if (campusRoute === "/home-lab") {
      await page.getByRole("link", { name: "View the workspace hero" }).click();
    } else if (width <= 700) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Services" }).click();
    } else {
      await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Services" }).click();
    }
    await page.waitForURL(`${base}/services`);
    assert.equal(await page.locator(".hr-hero").count(), 1);
    assert.equal(await page.locator(".mc-hero").count(), 0);
    assert.equal(await page.locator("h1").count(), 1);
    await overflow(page, width);
    await page.screenshot({ path: `artifacts/services-workspace-hero-${width}.png` });
    assert.equal(await page.locator(".hr-lab-header").count(), 0, "Campus header treatment is removed on Services");
    await page.getByLabel("Preview branch").selectOption("Bole");
    assert.equal(await page.locator(".hr-overview-metrics > div").first().locator("b").innerText(), "10 / 12");
    await page.getByRole("banner").getByRole("link", { name: "Aspio HR home" }).click();
    await page.waitForURL(`${base}/`);
    await waitReady(page);
    assert.equal(await page.locator(".mc-hero").count(), 1);
    assert.equal(await page.locator(".hr-lab-header").count(), 1);
    assert.equal(await page.locator(".lab-comparison").count(), 0, "No preview-only labels on main Home");
    await page.close();
    console.log(`Overview, all three features, connected summary, keyboard, reduced motion, demo and Services/Home navigation passed at ${width}px`);
  }

  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 940 }, reducedMotion: "no-preference" });
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`${base}${campusRoute}`, { waitUntil: "networkidle" });
    await waitReady(page);
    // DOM click avoids scrolling the desktop toolbar below the scene.
    await attendance(page).evaluate(button => button.click());
    await page.waitForTimeout(430);
    assert.equal(await page.locator(".mc-hero").getAttribute("data-travelling"), "true");
    const scale = await page.locator(".mc-overview").evaluate(element => new DOMMatrix(getComputedStyle(element).transform).a);
    assert.ok(scale > 1.01 && scale < 2.25, `Real push-in, not just a state change: ${scale}`);
    await page.screenshot({ path: `artifacts/campus-sequence-push-in-${width}.png` });
    await returnToOverview(page).evaluate(button => button.click());
    await waitView(page, "overview");
    assert.equal(await page.locator(".mc-overview").evaluate(element => getComputedStyle(element).opacity), "1");
    assert.equal(await opacity(page, ".mc-closeup-attendance"), "0");
    await attendance(page).evaluate(button => button.click());
    await page.waitForTimeout(1050);
    await page.screenshot({ path: `artifacts/campus-sequence-dissolve-${width}.png` });
    await waitView(page, "attendance");
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `artifacts/campus-sequence-animated-attendance-${width}.png` });
    await page.getByRole("button", { name: "Replay example check-in" }).evaluate(button => button.click());
    await page.waitForTimeout(100);
    assert.ok(Number(await page.locator(".mc-staff-result").first().evaluate(element => getComputedStyle(element).opacity)) < .1);
    await page.waitForTimeout(1550);
    assert.equal(await page.locator(".mc-staff-result").first().evaluate(element => getComputedStyle(element).opacity), "1");
    // Direct dissolve between close-ups, then a reversed one.
    await team(page).evaluate(button => button.click());
    await page.waitForTimeout(450);
    assert.equal(await page.locator(".mc-hero").getAttribute("data-travelling"), "true");
    const crossing = [Number(await opacity(page, ".mc-closeup-attendance")), Number(await opacity(page, ".mc-closeup-team"))];
    assert.equal(crossing[1], 0, "Switching buildings first returns through the campus, not an unrelated close-up");
    // Where WebGL exists, the depth layer is what moves on screen during the return.
    if (await page.evaluate(() => Boolean(document.createElement("canvas").getContext("webgl")))) {
      assert.equal(await page.locator(".mc-overview .mc-depth").evaluate(element => element.dataset.ready === "true" && getComputedStyle(element).visibility === "visible"), true, "Depth layer draws during the move");
    }
    await page.screenshot({ path: `artifacts/campus-sequence-crossfade-${width}.png` });
    await attendance(page).evaluate(button => button.click());
    await waitView(page, "attendance");
    assert.equal(await opacity(page, ".mc-closeup-team"), "0");
    // Rapid retargeting across every scene settles on the last choice with nothing left visible.
    await team(page).evaluate(button => button.click());
    await page.waitForTimeout(120);
    await records(page).evaluate(button => button.click());
    await page.waitForTimeout(120);
    await returnToOverview(page).evaluate(button => button.click());
    await page.waitForTimeout(80);
    await records(page).evaluate(button => button.click());
    await waitView(page, "records");
    assert.deepEqual(await Promise.all(["overview", "closeup-attendance", "closeup-team", "closeup-records"].map(name => opacity(page, `.mc-${name}`))), ["0", "0", "0", "1"]);
    await returnToOverview(page).evaluate(button => button.click());
    await page.waitForTimeout(400);
    await attendance(page).evaluate(button => button.click());
    await waitView(page, "attendance");
    await page.getByRole("button", { name: "Disable scene motion" }).evaluate(button => button.click());
    await returnToOverview(page).evaluate(button => button.click());
    await waitView(page, "overview");
    await attendance(page).evaluate(button => button.click());
    await waitView(page, "attendance");
    assert.equal(await page.locator(".mc-hero").getAttribute("data-motion"), "still");
    await page.getByRole("button", { name: "Enable scene motion" }).evaluate(button => button.click());
    await returnToOverview(page).evaluate(button => button.click());
    await page.emulateMedia({ reducedMotion: "reduce" });
    await waitView(page, "overview");
    assert.equal(await page.getByRole("button", { name: "Reduced motion enabled" }).isDisabled(), true);
    await page.close();
    console.log(`Push-in, dissolve, reverse, interrupted reverse, crossfade, rapid retargeting, replay, motion toggle and preference changes passed at ${width}px`);
  }

  const failure = await browser.newPage({ viewport: { width: 390, height: 940 } });
  await failure.route("**/images/campus/**", route => route.abort());
  await failure.goto(`${base}${campusRoute}`, { waitUntil: "networkidle" });
  assert.equal(await failure.locator(".mc-image-error").isVisible(), true);
  await attendance(failure).click();
  await waitView(failure, "attendance");
  assert.equal(await failure.locator(".mc-service-link").isVisible(), true);
  await failure.close();
  const noJS = await browser.newPage({ viewport: { width: 1440, height: 940 }, javaScriptEnabled: false });
  await noJS.goto(`${base}${campusRoute}`, { waitUntil: "networkidle" });
  assert.equal(await noJS.getByRole("link", { name: "Explore attendance details" }).isVisible(), true);
  await noJS.close();
  const partial = await browser.newPage({ viewport: { width: 1440, height: 940 }, reducedMotion: "no-preference" });
  await partial.route("**/sequences-v1/depth/attendance.webp", route => route.abort());
  await partial.goto(`${base}${campusRoute}`, { waitUntil: "networkidle" });
  await waitReady(partial);
  await attendance(partial).evaluate(button => button.click());
  await waitView(partial, "attendance");
  // A missing depth map only removes the parallax; the move and its destination still work.
  assert.equal(await partial.locator(".mc-sequence-error").isVisible(), false);
  assert.equal(await opacity(partial, ".mc-closeup-attendance"), "1", "A missing depth map keeps the close-up");
  await returnToOverview(partial).evaluate(button => button.click());
  await waitView(partial, "overview");
  await partial.close();
  assert.deepEqual(errors, []);
  console.log("All checks passed. No emails or live HR mutations were sent.");
} finally { await browser.close(); }

