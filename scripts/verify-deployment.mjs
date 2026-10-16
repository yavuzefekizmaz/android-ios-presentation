import {chromium, request} from 'playwright';
import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const url=process.env.QA_URL||'http://localhost:4173/';
const reportPath=process.env.DEPLOYMENT_REPORT_PATH||'qa/deployment-results.json';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
async function walk(dir){const files=[];for(const e of await readdir(dir,{withFileTypes:true})){const path=`${dir}/${e.name}`;if(e.isDirectory())files.push(...await walk(path));else files.push(path);}return files;}
const files=(await walk('dist')).filter(p=>!p.endsWith('/_headers'));
const client=await request.newContext();
const assets=[];
for(let i=0;i<files.length;i+=8){
 await Promise.all(files.slice(i,i+8).map(async file=>{
  const path=file.slice(5),response=await client.get(new URL(path,url).href);
  assert.equal(response.status(),200,path);
  const actual=hash(await response.body()),expected=hash(await readFile(file));
  assert.equal(actual,expected,`Deployed content differs: ${path}`);
  assets.push({path,status:response.status(),sha256:actual});
 }));
}
const swResponse=await client.get(new URL('sw.js',url).href);
const expectedCache=(await swResponse.text()).match(/const CACHE="([^"]+)"/)[1];
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
// Seed an obsolete app cache before the first service worker installation.
// The current worker must discard it and use the exact deployed version.
await page.route('**/*',route=>route.request().isNavigationRequest()?route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Cache upgrade preparation</title>'}):route.continue());
await page.goto(url);
await page.evaluate(async()=>{const cache=await caches.open('obsidian-obsolete-qa');await cache.put('./index.html',new Response('obsolete content'));});
await page.unroute('**/*');
await page.reload();
await page.waitForFunction(()=>document.querySelector('#offline-status')?.textContent==='Çevrimdışı hazır',{},{timeout:60000});
const worker=await page.evaluate(async()=>{const r=await navigator.serviceWorker.ready;return {scope:r.scope,scriptURL:r.active.scriptURL,caches:await caches.keys(),controlled:Boolean(navigator.serviceWorker.controller)};});
assert.equal(worker.scope,new URL('./',url).href);
assert.equal(worker.scriptURL,new URL('sw.js',url).href);
assert.equal(worker.controlled,true);
assert.deepEqual(worker.caches.filter(k=>k.startsWith('obsidian-')),[expectedCache]);
assert.equal(await page.locator('.slide-article').count(),31);
await page.screenshot({path:'qa/browser-reading.png'});
await page.locator('#start').click();
await page.waitForFunction(()=>Boolean(document.fullscreenElement));
await page.locator('#stage').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));
await page.screenshot({path:'qa/browser-presentation.png'});
await page.keyboard.press('Escape');
await context.setOffline(true);
await page.reload();
await page.locator('#slayt-31 .slide-open').click();
await page.waitForFunction(()=>document.querySelector('#counter').textContent==='31 / 31');
await page.keyboard.press('Home');
await page.waitForFunction(()=>document.querySelector('#counter').textContent==='01 / 31');
await page.keyboard.press('Escape');
await context.setOffline(false);
const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const mp=await mobile.newPage();await mp.goto(url);await mp.evaluate(()=>document.fonts.ready);
assert.equal(await mp.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
await mp.screenshot({path:'qa/browser-mobile.png'});
const result={date:new Date().toISOString(),platform:process.platform,node:process.version,url,browser:browser.version(),status:'PASS',assets:assets.sort((a,b)=>a.path.localeCompare(b.path)),worker,expectedCache,checks:['Every deployed file SHA-256 matches dist','31 slides','Fullscreen','390px mobile layout','Service worker root scope and controlled page','Obsolete cache removed','Offline reload and Home/End navigation']};
await writeFile(reportPath,JSON.stringify(result,null,2));
console.log(`PASS: ${assets.length} deployed files match dist; service worker scope/version, obsolete cache removal, offline navigation, fullscreen and mobile verified.`);
await browser.close();await client.dispose();
