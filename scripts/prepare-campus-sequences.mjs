import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve(".");
const inputs = {
  overview: "attendance/00-overview.png",
  attendance: ["01-departure.png","02-early-approach.png","03-mid-approach.png","04-near-approach.png","05-arrival.png"].map(n => "attendance/"+n),
  team: ["01-early.png","02-middle.png","03-near.png","04-arrival.png"].map(n => "team/"+n),
  records: ["01-early.png","02-middle.png","03-near.png","04-arrival.png"].map(n => "records/"+n),
};
const output = resolve(root, "public/images/campus/sequences-v1");
await mkdir(output, { recursive: true });
const report = [];
for (const [route, input] of Object.entries(inputs)) {
  const paths = Array.isArray(input) ? input : [input];
  await mkdir(resolve(output, route), { recursive: true });
  for (const [index, path] of paths.entries()) {
    const final = index === paths.length-1;
    const name = route === "overview" ? "overview.webp" : String(index+1).padStart(2,"0")+".webp";
    const destination = route === "overview" ? resolve(output,name) : resolve(output,route,name);
    const metadata = await sharp(resolve(root,"artifacts/campus-keyframes-v1",path))
      .resize({ width: final ? 1600 : 1280, withoutEnlargement: true }).webp({quality: final ? 84 : 78}).toFile(destination);
    report.push({ route, input:path, output:destination.slice(root.length+1), ...metadata });
  }
}
await writeFile(resolve(root,"artifacts/campus-keyframes-v1/asset-report.json"),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report.map(({route,output,size,width,height})=>({route,output,size,width,height})),null,2));

