import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium'});const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
page.on('pageerror',err=>console.log('PAGEERROR',err.message));await page.goto('http://localhost:4173');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'qa/browser-desktop.png'});
await page.locator('#start').click();await page.waitForTimeout(350);
const all=[];for(let i=0;i<31;i++){
 if(i)await page.keyboard.press('ArrowRight');await page.waitForTimeout(260);
 await page.locator('#stage').screenshot({path:`qa/slide-${String(i+1).padStart(2,'0')}.png`});
 const issues=await page.locator('#stage').evaluate(stage=>{
 const result=[];
 for(const node of stage.querySelectorAll('.node-text')){
 const nr=node.getBoundingClientRect();const ps=node.querySelectorAll('.source-paragraph');let right=0,bottom=0;
 for(const p of ps)for(const span of p.querySelectorAll('span:not(.bullet-marker)')){const range=document.createRange();range.selectNodeContents(span);for(const rect of range.getClientRects()){right=Math.max(right,rect.right);bottom=Math.max(bottom,rect.bottom);}}
 if(bottom>nr.bottom+8||right>nr.right+8)result.push({shape:node.dataset.shape,bottom:Math.round(bottom-nr.bottom),right:Math.round(right-nr.right),text:node.textContent.slice(0,55)});
 }
 return result;
 });if(issues.length)all.push({slide:i+1,issues});
}
console.log('OVERFLOW',JSON.stringify(all));await page.keyboard.press('Escape');await page.setViewportSize({width:390,height:844});await page.goto('http://localhost:4173');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'qa/browser-mobile.png'});
console.log('MOBILE',await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth})));await browser.close();
