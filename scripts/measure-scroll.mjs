import { chromium } from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto(process.env.QA_URL||'http://localhost:4173/');await page.evaluate(()=>document.fonts.ready);
const result=await page.evaluate(async()=>{const frames=[];let prev=0;for(let i=0;i<121;i++){const now=await new Promise(requestAnimationFrame);if(prev)frames.push(now-prev);prev=now;scrollTo({top:i*140,behavior:'instant'});}frames.sort((a,b)=>a-b);return {samples:frames.length,medianMs:frames[Math.floor(frames.length*.5)],p95Ms:frames[Math.floor(frames.length*.95)],maxMs:frames.at(-1),environment:'Headless Chromium, 1440x1000; no CPU throttling; warm local fonts; synthetic scroll'}});
await writeFile('qa/performance.json',JSON.stringify({date:new Date().toISOString(),browser:browser.version(),...result},null,2));console.log(JSON.stringify(result));await browser.close();
