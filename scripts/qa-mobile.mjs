import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const url=process.env.QA_URL||'http://localhost:4173/';
const slides=JSON.parse(await readFile('src/data/slides/slides.json','utf8'));
const digest=b=>createHash('sha256').update(b).digest('hex');
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
const page=await context.newPage(),results=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const normalize=s=>s.replace(/\s+/g,' ').trim();
async function test(name,fn){try{await fn();results.push({test:name,status:'PASS'});console.log('PASS',name);}catch(e){results.push({test:name,status:'FAIL',error:String(e)});console.error('FAIL',name,String(e));}}
try {
 await page.goto(url);await page.evaluate(()=>document.fonts.ready);
 await page.waitForFunction(()=>document.querySelector('#offline-status').textContent==='Çevrimdışı hazır',{},{timeout:60000});
 await test('Mobile replacement photographs match the visible top source layer',async()=>{
  for(const [n,asset] of [[3,'719bcba89d789c'],[4,'add85c376347e5']]){
   const photos=page.locator(`#slayt-${n} .mobile-content .mobile-image`);assert.equal(await photos.count(),1);
   assert.ok((await photos.getAttribute('src')).includes(asset));
   assert.equal(await page.locator(`#slayt-${n} .slide-frame .node-image`).count(),2);
  }
 });
 await test('Slide nine keeps four transparent layers and labels in one diagram',async()=>{
  const graphic=page.locator('#slayt-9 .mobile-cycle-graphic');await graphic.scrollIntoViewIfNeeded();
  assert.equal(await graphic.locator('img').count(),4);assert.equal(await graphic.locator('.node-text').count(),4);
  const rects=await graphic.locator('.node-image').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return [r.x,r.y,r.width,r.height];}));
  for(const rect of rects)assert.deepEqual(rect,rects[0]);
  const box=await graphic.boundingBox();assert.ok(box.width>150&&Math.abs(box.width-box.height)<1);
  for(const label of ['Yükleme','Çalıştırma','Arka Plan','Kapatma'])assert.ok((await page.locator('#slayt-9 .mobile-cycle-steps').textContent()).includes(label));
 });
 await test('Source cards retain their related text and small icons',async()=>{
  assert.equal(await page.locator('#slayt-2 .mobile-card').count(),4);
  for(const n of [13,15]){const icons=page.locator(`#slayt-${n} .mobile-card .mobile-icon`);assert.equal(await icons.count(),4);for(const icon of await icons.all())assert.ok((await icon.locator('..').textContent()).trim().length>3);}
  const title=await page.locator('#slayt-27 .mobile-title').boundingBox();const photo=await page.locator('#slayt-27 .mobile-image').boundingBox();assert.ok(title.y<photo.y);
 });
 await test('All 31 mobile slides retain source text and have no horizontal overflow',async()=>{
  for(const width of [320,390,700]){
   await page.setViewportSize({width,height:844});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`width ${width}`);
   for(const slide of slides){
    const content=normalize(await page.locator(`#slayt-${slide.number} .mobile-content`).innerText());
    for(const sh of slide.shapes.filter(s=>s.type==='text')){
     const text=normalize(sh.paragraphs.map(p=>p.text).join(' '));if(/^\d{2}$/.test(text)&&sh.y>500)continue;
     for(const p of sh.paragraphs)assert.ok(content.includes(normalize(p.text)),`Missing mobile text on slide ${slide.number}: ${p.text}`);
    }
   }
  }
  await page.setViewportSize({width:390,height:844});
  for(let n=1;n<=31;n++){const article=page.locator(`#slayt-${n}`);await article.scrollIntoViewIfNeeded();await article.locator('.mobile-content').evaluate(el=>Promise.all(Array.from(el.querySelectorAll('img'),im=>im.decode())));await article.screenshot({path:`qa/browser-mobile-${String(n).padStart(2,'0')}.png`,style:'.topbar,.skip-link,.expand-button{visibility:hidden!important}'});}
 });
 await test('PDF and PowerPoint chooser opens and closes with keyboard focus restored',async()=>{
  await page.locator('#download-toggle').click();assert.ok(await page.locator('#downloads').isVisible());
  assert.equal(await page.locator('#downloads a').count(),2);
  assert.equal(await page.locator('#downloads a').first().getAttribute('target'),'_blank');
  assert.ok((await page.locator('#downloads a').last().getAttribute('href')).endsWith('.pptx'));
  await page.keyboard.press('Escape');assert.equal(await page.locator('#downloads').isVisible(),false);assert.equal(await page.locator('#download-toggle').evaluate(el=>el===document.activeElement),true);
 });
 await test('PowerPoint download is the exact original presentation',async()=>{
  await page.locator('#download-toggle').click();const pending=page.waitForEvent('download');await page.locator('#downloads a').last().click();
  const download=await pending;assert.equal(download.suggestedFilename(),'Android-iOS-Sunum.pptx');assert.equal(digest(await readFile(await download.path())),digest(await readFile('sources/android-ios.pptx')));
 });
 await test('Both original documents remain available after an offline reload',async()=>{
  await context.setOffline(true);await page.reload();await page.locator('#download-toggle').click();assert.ok(await page.locator('#downloads').isVisible());
  const files=await page.evaluate(async()=>Promise.all(['android-ios.pdf','android-ios.pptx'].map(async name=>{const r=await fetch(new URL(`./documents/${name}`,location.href));const bytes=await r.arrayBuffer();return {name,status:r.status,sha256:Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('')};})));
  for(const file of files){assert.equal(file.status,200);assert.equal(file.sha256,digest(await readFile(`public/documents/${file.name}`)));}
  await page.keyboard.press('Escape');await context.setOffline(false);
 });
 await test('No mobile console or JavaScript errors',async()=>assert.deepEqual(errors,[]));
 await writeFile(process.env.MOBILE_QA_REPORT_PATH||'qa/mobile-results.json',JSON.stringify({date:new Date().toISOString(),url,platform:process.platform,browser:browser.version(),results,errors},null,2));
 if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
} finally {await browser.close();}
