import './styles/main.css';
import data from './data/slides/slides.json';
import type { Slide } from './types';
import { renderCanvas,renderMobile,BASE_WIDTH,BASE_HEIGHT,assetUrl,fitCanvas } from './render';
const slides=data as Slide[];
const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const reading=$('reading'),presentation=$('presentation'),stage=$('stage'),outline=$('outline');
let current=0,presenting=false,ownedFullscreen=false,idleTimer=0,toastTimer=0,transitionAnimation:Animation|null=null;
let fullscreenExit:Promise<void>|null=null;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const frames:HTMLElement[]=[];
const pad=(n:number)=>String(n).padStart(2,'0');
const sections=[{start:1,end:10,title:'Giriş ve temel mimari'},{start:11,end:20,title:'Uygulama yönetimi ve güvenlik'},{start:21,end:30,title:'Kişiselleştirme ve güncellemeler'},{start:31,end:31,title:'Teşekkür'}];
const ro=new ResizeObserver(entries=>{for(const entry of entries)(entry.target as HTMLElement).style.setProperty('--scale',String(entry.contentRect.width/BASE_WIDTH));});
for(const slide of slides){
 const article=document.createElement('article');article.className='slide-article';article.id=`slayt-${slide.number}`;article.dataset.index=String(slide.number-1);article.setAttribute('aria-label',`${slide.number} / 31 · ${slide.title}`);article.tabIndex=-1;
 const meta=document.createElement('div');meta.className='slide-meta';
 const number=document.createElement('span');number.className='slide-number';number.textContent=pad(slide.number);
 const label=document.createElement('span');label.textContent=slide.title;
 const btn=document.createElement('button');btn.className='slide-open';btn.textContent='Sun ↗';btn.setAttribute('aria-label',`${slide.number}. slayttan sunumu başlat`);btn.onclick=()=>enter(slide.number-1);
 meta.append(number,label,btn);
 const frame=document.createElement('div');frame.className='slide-frame';frame.append(renderCanvas(slide,slide.number===1));ro.observe(frame);frames.push(frame);
 article.append(meta,frame,renderMobile(slide));$('slides').append(article);
 const a=document.createElement('a');a.href=`#slayt-${slide.number}`;a.className='slide-link';const num=document.createElement('span');num.textContent=pad(slide.number);a.append(num,document.createTextNode(slide.title));a.onclick=e=>{e.preventDefault();goReading(slide.number-1);};$('slide-links').append(a);
}
for(const s of sections){const a=document.createElement('a');a.href=`#slayt-${s.start}`;a.className='section-link';const range=document.createElement('small');range.textContent=`${pad(s.start)}${s.start!==s.end?'—'+pad(s.end):''}`;const title=document.createElement('span');title.textContent=s.title;a.append(range,title);a.onclick=e=>{e.preventDefault();goReading(s.start-1);};$('sections').append(a);}
void document.fonts.ready.then(()=>frames.forEach(frame=>fitCanvas(frame.firstElementChild as HTMLElement)));
const articles=Array.from(document.querySelectorAll<HTMLElement>('.slide-article'));
const seen=new Map<number,number>();
const observer=new IntersectionObserver(entries=>{
 for(const e of entries){const i=Number((e.target as HTMLElement).dataset.index);if(e.isIntersecting){e.target.classList.add('revealed');seen.set(i,e.intersectionRatio);}else seen.delete(i);}
 if(!presenting&&seen.size){current=[...seen.entries()].sort((a,b)=>b[1]-a[1])[0][0];markCurrent();}
},{threshold:[0,.1,.3,.5,.7,.9],rootMargin:'-78px 0px -10% 0px'});
articles.forEach(a=>observer.observe(a));
function markCurrent(){document.querySelectorAll('.slide-link').forEach((a,i)=>{if(i===current)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
function setOutline(open:boolean){outline.hidden=!open;$('outline-toggle').setAttribute('aria-expanded',String(open));}
function goReading(index:number){current=index;setOutline(false);articles[index].scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});history.replaceState(null,'',`#slayt-${index+1}`);markCurrent();}
$('outline-toggle').onclick=()=>setOutline(outline.hidden);$('outline-close').onclick=()=>{setOutline(false);$('outline-toggle').focus();};
document.addEventListener('click',e=>{if(!outline.hidden&&!outline.contains(e.target as Node)&&!$('outline-toggle').contains(e.target as Node))setOutline(false);});
$('collapse').onclick=()=>{$('topbar').hidden=true;$('expand').hidden=false;$('expand').focus();document.body.classList.add('bar-collapsed');setOutline(false);};
$('expand').onclick=()=>{$('topbar').hidden=false;$('expand').hidden=true;document.body.classList.remove('bar-collapsed');$('collapse').focus();};
$('fit').onchange=()=>document.body.classList.toggle('fit-slides',($('fit') as HTMLInputElement).checked);
function toast(message:string){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=window.setTimeout(()=>{$('toast').hidden=true;},4500);}
async function leaveFullscreen(){
 if(!document.fullscreenElement)return;
 const pending=document.exitFullscreen().catch(()=>{});fullscreenExit=pending;
 await pending;if(fullscreenExit===pending)fullscreenExit=null;
}
async function requestFullscreen(){
 const forPresentation=presenting;
 if(fullscreenExit)await fullscreenExit;
 if(forPresentation&&!presenting)return;
 if(document.fullscreenElement){if(presenting)ownedFullscreen=true;return;}
 if(forPresentation)ownedFullscreen=true;
 try{if(!document.documentElement.requestFullscreen)throw new Error('unsupported');await document.documentElement.requestFullscreen();if(forPresentation&&!presenting&&document.fullscreenElement)await leaveFullscreen();}
 catch{ownedFullscreen=false;toast('Tam ekran açılamadı. Sunum pencereyi kaplayarak çalışmaya devam eder.');}
}
async function toggleFullscreen(){if(document.fullscreenElement){if(presenting)ownedFullscreen=false;try{await leaveFullscreen();}catch{toast('Tam ekrandan çıkmak için Esc tuşunu kullanın.');}}else await requestFullscreen();}
$('fullscreen').onclick=()=>void toggleFullscreen();$('present-fullscreen').onclick=()=>{wake();void toggleFullscreen();};
$('start').onclick=()=>enter(current);
function enter(index:number){
 if(presenting)return;current=index;presenting=true;setOutline(false);presentation.hidden=false;document.body.classList.add('is-presenting');reading.inert=true;$('topbar').inert=true;$('expand').inert=true;
 showSlide();wake();presentation.focus();void requestFullscreen();
}
function exit(){
 if(!presenting)return;presenting=false;transitionAnimation?.cancel();presentation.hidden=true;document.body.classList.remove('is-presenting');reading.inert=false;$('topbar').inert=false;$('expand').inert=false;
 clearTimeout(idleTimer);stage.replaceChildren();const shouldExitFullscreen=ownedFullscreen&&document.fullscreenElement;ownedFullscreen=false;if(shouldExitFullscreen)void leaveFullscreen();
 const index=current;requestAnimationFrame(()=>{articles[index].scrollIntoView({block:'center',behavior:'instant'});articles[index].focus({preventScroll:true});markCurrent();history.replaceState(null,'',`#slayt-${index+1}`);});
}
$('exit').onclick=exit;
document.addEventListener('fullscreenchange',()=>{if(presenting&&ownedFullscreen&&!document.fullscreenElement)exit();});
function prepareNeighbors(){
 for(const i of [current-1,current,current+1]){if(!slides[i])continue;for(const sh of slides[i].shapes){if(sh.type!=='image')continue;const img=new Image();img.src=assetUrl(sh.variants!.at(-1)!.src);void img.decode().catch(()=>{});}}
}
function showSlide(){
 transitionAnimation?.cancel();const canvas=renderCanvas(slides[current],true);stage.replaceChildren(canvas);void document.fonts.ready.then(()=>{if(canvas.isConnected)fitCanvas(canvas);});stage.style.setProperty('--scale',String(Math.min(presentation.clientWidth/BASE_WIDTH,presentation.clientHeight/BASE_HEIGHT)));
 if(!reduced.matches)transitionAnimation=stage.animate([{opacity:.2,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,easing:'ease-out'});
 $('counter').textContent=`${pad(current+1)} / ${slides.length}`;$('present-title').textContent=slides[current].title;$('progress').style.width=`${(current+1)/slides.length*100}%`;
 ($('previous') as HTMLButtonElement).disabled=current===0;($('next') as HTMLButtonElement).disabled=current===slides.length-1;prepareNeighbors();markCurrent();
}
new ResizeObserver(()=>{if(presenting)stage.style.setProperty('--scale',String(Math.min(presentation.clientWidth/BASE_WIDTH,presentation.clientHeight/BASE_HEIGHT)));}).observe(presentation);
function move(delta:number){const next=Math.max(0,Math.min(slides.length-1,current+delta));if(next!==current){current=next;showSlide();}wake();}
$('previous').onclick=()=>move(-1);$('next').onclick=()=>move(1);
function wake(){presentation.classList.remove('idle');clearTimeout(idleTimer);idleTimer=window.setTimeout(()=>{if(presenting&&!presentation.matches(':focus-within') || presenting&&document.activeElement===presentation)presentation.classList.add('idle');},2800);}
presentation.addEventListener('pointermove',wake,{passive:true});presentation.addEventListener('pointerdown',wake,{passive:true});presentation.addEventListener('focusin',wake);
let touchX=0,touchY=0;
presentation.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;touchY=e.changedTouches[0].clientY;},{passive:true});
presentation.addEventListener('touchend',e=>{if((e.target as HTMLElement).closest('button'))return;const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.3)move(dx<0?1:-1);else wake();},{passive:true});
document.addEventListener('keydown',e=>{
 if(!presenting){if(e.key==='Escape'&&!outline.hidden){setOutline(false);$('outline-toggle').focus();}return;}
 if(e.key==='Tab'){wake();const buttons=Array.from(presentation.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));const first=buttons[0],last=buttons.at(-1)!;if(e.shiftKey&&(document.activeElement===first||document.activeElement===presentation)){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===presentation)){e.preventDefault();first.focus();}return;}
 if(e.key==='Escape'){e.preventDefault();exit();return;}
 if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();move(1);}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();move(-1);}else if(e.key==='Home'){e.preventDefault();current=0;showSlide();wake();}else if(e.key==='End'){e.preventDefault();current=slides.length-1;showSlide();wake();}
});
const initial=location.hash.match(/^#slayt-(\d+)$/);if(initial&&Number(initial[1])>=1&&Number(initial[1])<=31){requestAnimationFrame(()=>goReading(Number(initial[1])-1));}
// Readiness is announced only when the complete versioned cache exists.
if('serviceWorker' in navigator&&import.meta.env.PROD){
 navigator.serviceWorker.addEventListener('message',e=>{if(e.data?.type==='OFFLINE_READY')offlineReady();if(e.data?.type==='OFFLINE_FAILED')$('offline-status').textContent='Çevrimdışı yedek tamamlanamadı; bağlantıyla tekrar açın.';});
 navigator.serviceWorker.register(assetUrl('sw.js')).then(async reg=>{await navigator.serviceWorker.ready;const worker=reg.active||navigator.serviceWorker.controller;worker?.postMessage({type:'CHECK_READY'});}).catch(()=>{$('offline-status').textContent='Çevrimdışı önbellek kullanılamıyor · PDF yedeğini indirin';});
}else $('offline-status').textContent='Yerel önizleme · çevrimdışı hazırlık üretim sürümünde';
function offlineReady(){$('offline-status').textContent='Çevrimdışı hazır';$('offline-status').classList.add('ready');}
window.addEventListener('offline',()=>{if(!$('offline-status').classList.contains('ready'))$('offline-status').textContent='Bağlantı yok · çevrimdışı yedek henüz tamamlanmadı';});
