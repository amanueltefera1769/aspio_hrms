import { chromium } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import assert from "node:assert/strict";
const directory="artifacts/campus-keyframes-v1/videos";
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||"C:/Program Files/Google/Chrome/Application/chrome.exe",headless:true});
try {
  for(const feature of ["attendance","team","records"]) {
    const page=await browser.newPage({viewport:{width:1280,height:800}});
    await page.goto(pathToFileURL(resolve(directory,`${feature}-motion.webm`)).href);
    await page.waitForFunction(()=>document.querySelector("video")?.readyState>=2);
    const metadata=await page.locator("video").evaluate(video=>({width:video.videoWidth,height:video.videoHeight,duration:video.duration}));
    assert.equal(metadata.width,1280);assert.equal(metadata.height,720);
    assert.ok(metadata.duration>3,"Clip must include the full approach, not just a still");
    await page.locator("video").evaluate(video=>{video.pause();video.currentTime=1.7;});
    await page.waitForFunction(()=>!document.querySelector("video").seeking);
    await page.screenshot({path:`${directory}/${feature}-midpoint.png`});
    await page.locator("video").evaluate(video=>{video.currentTime=Number.isFinite(video.duration)?video.duration-.25:10;});
    await page.waitForFunction(()=>!document.querySelector("video").seeking);
    await page.screenshot({path:`${directory}/${feature}-arrival.png`});
    console.log(`${feature}: ${JSON.stringify(metadata)}, midpoint and arrival decoded`);
    await page.close();
  }
} finally {await browser.close();}
