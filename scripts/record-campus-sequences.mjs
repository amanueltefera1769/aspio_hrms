import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { sequences } from "../src/components/home/campus-sequence.ts";
const base = process.argv[2] || "http://localhost:3020";
const directory = "artifacts/campus-keyframes-v1/videos";
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless:true });
try {
  const page = await browser.newPage();
  await page.goto(base, {waitUntil:"networkidle"});
  for (const [feature, route] of Object.entries(sequences)) {
    const bytes = await page.evaluate(async ({route}) => {
      const pictures = await Promise.all(route.map(frame => new Promise((resolve,reject) => {
        const image = new Image(); image.onload=()=>image.decode().then(()=>resolve(image),reject);
        image.onerror=reject; image.src=frame.src;
      })));
      const canvas = document.createElement("canvas");
      canvas.width=1280; canvas.height=720;
      document.body.appendChild(canvas);
      const ctx=canvas.getContext("2d");
      const mime=["video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"].find(type=>MediaRecorder.isTypeSupported(type));
      if(!mime) throw new Error("This browser cannot record WebM");
      const stream=canvas.captureStream(30);
      const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:5000000});
      const chunks=[];
      const done=new Promise((resolve,reject)=>{
        recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data)};
        recorder.onerror=reject;
        recorder.onstop=async()=>resolve(Array.from(new Uint8Array(await new Blob(chunks,{type:mime}).arrayBuffer())));
      });
      const draw=(image,alpha=1,scale=1,x=0,y=0)=>{
        ctx.save();ctx.globalAlpha=alpha;ctx.translate(x*1280,y*720);ctx.scale(scale,scale);ctx.drawImage(image,0,0,1280,720);ctx.restore();
      };
      const ease=value=>value*value*(3-2*value);
      const hold=450, segment=620, duration=hold+(route.length-1)*segment+700;
      draw(pictures[0]);recorder.start();
      const start=performance.now();
      await new Promise(resolve=>{
        function tick(now) {
          const elapsed=now-start;
          ctx.fillStyle="#fff";ctx.fillRect(0,0,1280,720);
          if(elapsed<hold)draw(pictures[0]);
          else {
            const progress=(elapsed-hold)/segment;
            const index=Math.min(Math.floor(progress),route.length-2);
            const fraction=Math.min(progress-index,1);
            const from=route[index],to=route[index+1];
            const move=ease(Math.min(fraction/.77,1));
            const scale=1+(to.extent/from.extent-1)*move;
            const x=(to.focus[0]-from.focus[0]*(to.extent/from.extent))*move;
            const y=(to.focus[1]-from.focus[1]*(to.extent/from.extent))*move;
            draw(pictures[index],1,scale,x,y);
            if(fraction>.77)draw(pictures[index+1],ease((fraction-.77)/.23));
          }
          if(elapsed>=duration)resolve();else requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
      recorder.stop();
      const output=await done;
      stream.getTracks().forEach(track=>track.stop());
      canvas.remove();
      return output;
    },{route});
    const path=`${directory}/${feature}-motion.webm`;
    await writeFile(path,Buffer.from(bytes));
    console.log(`${path}: ${bytes.length} bytes`);
  }
  await page.close();
} finally { await browser.close(); }
