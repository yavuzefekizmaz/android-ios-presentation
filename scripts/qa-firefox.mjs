import {firefox} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await firefox.launch();const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.QA_URL||'http://localhost:4173/');await page.evaluate(()=>document.fonts.ready);
assert.equal(await page.locator('.slide-article').count(),31);assert.equal(await page.locator('.slide-frame table').count(),6);
await page.waitForFunction(()=>document.querySelector('#offline-status').textContent==='Çevrimdışı hazır',{},{timeout:60000});
await page.locator('#start').click();for(let i=1;i<=31;i++){if(i>1)await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#counter').textContent(),`${String(i).padStart(2,'0')} / 31`);await page.locator('#stage').evaluate(async el=>{await Promise.all(Array.from(el.querySelectorAll('img'),img=>img.decode()));});}
await page.keyboard.press('Home');assert.equal(await page.locator('#counter').textContent(),'01 / 31');await page.keyboard.press('End');await page.keyboard.press('Escape');assert.equal(await page.locator('#presentation').isVisible(),false);
await context.setOffline(true);await page.reload();await page.waitForSelector('#slayt-31');await page.locator('#slayt-31 .slide-open').click();await page.locator('#stage').evaluate(async el=>{await Promise.all(Array.from(el.querySelectorAll('img'),im=>im.decode()));});assert.equal(await page.locator('#counter').textContent(),'31 / 31');await page.locator('#exit').click();await context.setOffline(false);
await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
const result={date:new Date().toISOString(),browser:browser.version(),status:'PASS',checks:['31 reading slides','6 HTML tables','31 presentation slides and images','Home/End/Escape','Complete offline cache','Offline reload and presentation','390px reading layout','No JavaScript errors']};await writeFile('qa/firefox-results.json',JSON.stringify(result,null,2));console.log(result);await browser.close();
