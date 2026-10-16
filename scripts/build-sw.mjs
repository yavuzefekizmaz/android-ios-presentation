import { readdir,readFile,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
async function walk(dir){const entries=await readdir(dir,{withFileTypes:true});const result=[];for(const e of entries){if(e.isDirectory())result.push(...await walk(`${dir}/${e.name}`));else result.push(`${dir}/${e.name}`);}return result;}
const files=(await walk('dist')).filter(p=>!p.endsWith('/sw.js')&&!p.endsWith('/_headers')).sort();
const hash=createHash('sha256');for(const f of files)hash.update(await readFile(f));
// Worker logic changes must invalidate an existing cache even when assets are unchanged.
hash.update((await readFile(new URL(import.meta.url),'utf8')).replace(/\r\n/g,'\n'));
const version=`obsidian-${hash.digest('hex').slice(0,14)}`;
const urls=files.map(p=>`./${p.replace(/^dist\//,'')}`);
await writeFile('dist/sw.js',`const CACHE=${JSON.stringify(version)};
const FILES=${JSON.stringify(urls)};
const READY='./__offline-ready__';
async function notify(type){for(const client of await self.clients.matchAll({includeUncontrolled:true}))client.postMessage({type,cache:CACHE});}
self.addEventListener('install',event=>event.waitUntil((async()=>{try{const cache=await caches.open(CACHE);await cache.addAll(FILES);const html=await cache.match('./index.html');if(!html)throw new Error('Missing app shell');const headers=new Headers(html.headers);headers.delete('content-encoding');headers.delete('content-length');const shell=new Response(await html.arrayBuffer(),{status:html.status,statusText:html.statusText,headers});await cache.put('./index.html',shell.clone());await cache.put('./',shell);await cache.put(READY,new Response('complete'));await self.skipWaiting();}catch(error){await caches.delete(CACHE);await notify('OFFLINE_FAILED');throw error;}})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{await self.clients.claim();for(const key of await caches.keys())if(key.startsWith('obsidian-')&&key!==CACHE)await caches.delete(key);await notify('OFFLINE_READY');})()));
self.addEventListener('message',event=>{if(event.data?.type==='CHECK_READY')event.waitUntil((async()=>{const cache=await caches.open(CACHE);if(await cache.match(READY))event.source?.postMessage({type:'OFFLINE_READY',cache:CACHE});})());});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith((async()=>{const cache=await caches.open(CACHE);const hit=await cache.match(event.request,{ignoreVary:true});if(hit)return hit;try{return await fetch(event.request);}catch(error){if(event.request.mode==='navigate')return await cache.match('./')||Response.error();throw error;}})());});
`);
console.log(`Service Worker: ${files.length} files, ${version}`);
