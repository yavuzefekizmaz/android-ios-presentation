import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const url=process.env.QA_URL||'https://android-ios-presentation.pages.dev/';
const browser=await chromium.launch();
try {
 const context=await browser.newContext();const page=await context.newPage();
 await page.goto(url);
 await page.waitForFunction(()=>document.querySelector('#offline-status')?.textContent==='Çevrimdışı hazır',{},{timeout:60000});
 const before=await page.evaluate(async()=>{const names=await caches.keys();const cache=await caches.open(names.find(n=>n.startsWith('obsidian-')));const index=await cache.match('./index.html');return {cache:names.find(n=>n.startsWith('obsidian-')),indexRedirected:index.redirected};});
 console.log('READY: previous deployed service worker installed',JSON.stringify(before));
 let newCache;
 const deadline=Date.now()+180000;
 while(Date.now()<deadline){
  const response=await context.request.get(new URL('sw.js',url).href);
  newCache=(await response.text()).match(/const CACHE="([^"]+)"/)[1];
  if(newCache!==before.cache)break;
  await new Promise(resolve=>setTimeout(resolve,3000));
 }
 assert.notEqual(newCache,before.cache,'No new deployment observed within three minutes');
 await page.evaluate(async expected=>{
  const ready=new Promise((resolve,reject)=>{
   const listener=e=>{if(e.data?.type==='OFFLINE_READY'&&e.data.cache===expected){clearTimeout(timer);navigator.serviceWorker.removeEventListener('message',listener);resolve();}};
   const timer=setTimeout(()=>{navigator.serviceWorker.removeEventListener('message',listener);reject(new Error('Updated worker did not acknowledge readiness'));},60000);
   navigator.serviceWorker.addEventListener('message',listener);
  });
  const r=await navigator.serviceWorker.getRegistration();await r.update();
  navigator.serviceWorker.controller?.postMessage({type:'CHECK_READY'});
  await ready;
 },newCache);
 await page.waitForFunction(async expected=>(await caches.keys()).filter(n=>n.startsWith('obsidian-')).join(',')===expected,newCache,{timeout:60000});
 await context.setOffline(true);await page.reload();
 await page.locator('#slayt-1 .slide-open').click();
 for(let i=1;i<=31;i++){
  if(i>1)await page.keyboard.press('ArrowRight');
  await page.waitForFunction(n=>document.querySelector('#counter').textContent===`${String(n).padStart(2,'0')} / 31`,i);
  await page.locator('#stage').evaluate(el=>Promise.all(Array.from(el.querySelectorAll('img'),im=>im.decode())));
 }
 await page.keyboard.press('Escape');
 const after=await page.evaluate(async()=>{const names=await caches.keys();const cache=await caches.open(names.find(n=>n.startsWith('obsidian-')));const index=await cache.match('./index.html');return {cache:names.find(n=>n.startsWith('obsidian-')),indexRedirected:index.redirected};});
 assert.equal(after.indexRedirected,false);
 const result={date:new Date().toISOString(),url,status:'PASS',before,after,checks:['Existing production service worker upgraded in the same browser context','Old cache removed','Cached HTML is not a redirected response','Offline reload','All 31 slides and images navigable offline']};
 await writeFile('qa/sw-upgrade-results.json',JSON.stringify(result,null,2));
 console.log('PASS: existing production cache upgraded; offline reload and all 31 slides/images passed.');
} finally {await browser.close();}
