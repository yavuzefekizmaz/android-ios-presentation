import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const url=process.env.QA_URL||'http://localhost:4173/';
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'light',reducedMotion:'reduce'});
const page=await context.newPage(),results=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const theme=()=>page.locator('.reading-controls [data-theme-toggle]');
const count=async n=>page.waitForFunction(n=>document.querySelector('#counter').textContent===`${String(n).padStart(2,'0')} / 31`,n);
async function test(name,fn){try{await fn();results.push({test:name,status:'PASS'});console.log('PASS',name);}catch(e){results.push({test:name,status:'FAIL',error:String(e)});console.error('FAIL',name,String(e));}}
try{
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await test('Fresh visits default to original dark theme even with a light OS preference',async()=>{
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  assert.equal(await page.locator('#slayt-1 .slide-frame .canvas').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(10, 13, 20)');
 });
 const photos=await page.locator('.slide-frame img').evaluateAll(imgs=>imgs.map(img=>img.getAttribute('src')));
 await test('Light theme changes all 31 slides, text, tables and page while preserving images',async()=>{
  await theme().click();assert.equal(await theme().getAttribute('aria-pressed'),'true');
  const colors=await page.locator('.slide-frame>.canvas').evaluateAll(els=>els.map(el=>getComputedStyle(el).backgroundColor));
  assert.equal(colors.length,31);assert.ok(colors.every(c=>c==='rgb(194, 200, 205)'));
  assert.equal(await page.locator('#slayt-1 .slide-title span').first().evaluate(el=>getComputedStyle(el).color),'rgb(32, 40, 47)');
  assert.equal(await page.locator('.slide-frame table').count(),6);
  const cells=await page.locator('.slide-frame td,.slide-frame th').evaluateAll(els=>els.map(el=>getComputedStyle(el).backgroundColor));assert.ok(cells.length>0);assert.ok(cells.every(c=>c!=='rgb(24, 33, 45)'));
  assert.deepEqual(await page.locator('.slide-frame img').evaluateAll(imgs=>imgs.map(img=>img.getAttribute('src'))),photos);
  assert.ok(await page.locator('.slide-frame img').evaluateAll(imgs=>imgs.every(img=>getComputedStyle(img).filter==='none')));
  assert.equal(await page.locator('#slayt-9 .slide-frame .image-overlay-label span').first().evaluate(el=>getComputedStyle(el).color),'rgb(232, 235, 240)');
 });
 await test('Theme preference survives reload and presentation changes it without moving slides',async()=>{
  await page.reload({waitUntil:'domcontentloaded'});assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  await page.locator('#slayt-4 .slide-open').click();await count(4);await page.waitForFunction(()=>Boolean(document.fullscreenElement));
  const toggle=page.locator('.presentation-tools [data-theme-toggle]');await toggle.click();await count(4);
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');assert.ok(await page.locator('#presentation').isVisible());
  await toggle.click();await count(4);assert.equal(await page.locator('#stage .canvas').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(194, 200, 205)');
 });
 await test('Mouse left click advances and right click returns on slide content',async()=>{
  await page.locator('#stage').click({position:{x:500,y:250}});await count(5);
  await page.locator('#stage').click({button:'right',position:{x:500,y:250}});await count(4);
  await page.locator('#next').click();await count(5);await page.locator('#previous').click();await count(4);
 });
 await test('Mouse wheel navigates one slide per gesture and ignores horizontal scrolling',async()=>{
  await page.mouse.move(720,500);await page.mouse.wheel(0,120);await count(5);
  await page.mouse.wheel(0,120);await page.mouse.wheel(0,120);await count(5);
  await page.waitForTimeout(260);await page.mouse.wheel(0,-120);await count(4);
  await page.waitForTimeout(260);await page.mouse.wheel(120,0);await count(4);
 });
 await test('Mouse navigation clamps first/last slides and controls avoid double navigation',async()=>{
  await page.keyboard.press('End');await count(31);await page.locator('#stage').click({position:{x:500,y:250}});await count(31);
  await page.keyboard.press('Home');await count(1);await page.locator('#stage').click({button:'right',position:{x:500,y:250}});await count(1);
  await page.locator('#exit').click();assert.equal(await page.locator('#presentation').isVisible(),false);await page.waitForFunction(()=>!document.fullscreenElement);
 });
 await test('Light mobile reading retains all slides and has no horizontal overflow',async()=>{
  for(const width of [320,390,700]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.ok(await theme().isVisible());}
  assert.equal(await page.locator('.mobile-content').count(),31);
  assert.equal(await page.locator('#slayt-1 .mobile-content').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(194, 200, 205)');
 });
 await test('Saved light theme and mouse presentation work after an offline reload',async()=>{
  await page.waitForFunction(()=>document.querySelector('#offline-status').textContent==='Çevrimdışı hazır',{},{timeout:60000});
  await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  await page.locator('#slayt-1 .slide-open').click();await count(1);await page.locator('#stage').click({position:{x:180,y:90}});await count(2);await page.keyboard.press('Escape');await context.setOffline(false);
 });
 await test('Theme and mouse controls produce no console or JavaScript errors',async()=>assert.deepEqual(errors,[]));
 await writeFile(process.env.THEME_QA_REPORT_PATH||'qa/theme-mouse-results.json',JSON.stringify({date:new Date().toISOString(),url,platform:process.platform,browser:browser.version(),results,errors},null,2));
 if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
}finally{await browser.close();}
