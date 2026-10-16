import type { Shape, Slide, Paragraph } from './types';
export const BASE_WIDTH=959.981;
export const BASE_HEIGHT=540;
export const assetUrl=(path:string)=>new URL(path,document.baseURI).href;
// PDF export uses Noto Sans for these PPTX font names. Keep that visual mapping.
function family(name='Inter') {
 if(name==='Inter'||name==='Inter Medium'||name==='Inter SemiBold')return 'Inter';
 return 'Noto Sans';
}
export function paragraphs(ps:Paragraph[],scale=1,mobile=false) {
 const frag=document.createDocumentFragment();
 for(const p of ps){
  const el=document.createElement('p');el.className='source-paragraph';
  const size=Math.max(...p.runs.map(r=>r.size||16))*scale;
  if(!mobile){Object.assign(el.style,{textAlign:({l:'left',ctr:'center',r:'right',just:'justify'} as Record<string,string>)[p.align]||'left',fontSize:`${size}px`,lineHeight:p.lineHeightPt?`${p.lineHeightPt}px`:String(p.lineHeight*1.2),marginTop:`${p.before}px`,marginBottom:`${p.after}px`});}
  if(p.bullet){el.classList.add('bullet');const marker=document.createElement('span');marker.className='bullet-marker';marker.textContent=p.bullet;marker.setAttribute('aria-hidden','true');el.append(marker);if(!mobile)el.style.paddingLeft=`${Math.max(12,p.marginLeft)}px`;}
  for(const r of p.runs){if(r.text==='\n'){el.append(document.createElement('br'));continue;}const span=document.createElement('span');span.textContent=r.text;const weight=r.font?.startsWith('IBM')&&!r.bold&&!r.font.endsWith(' Bold')?400:r.font?.includes('SemiBold')?600:r.bold||r.font?.includes('Bold')?700:r.font?.includes('Medium')?500:400;
   Object.assign(span.style,{fontFamily:`"${family(r.font)}", sans-serif`,fontWeight:String(weight),fontStyle:r.italic?'italic':'normal',color:r.color||'inherit'});
   if(!mobile)Object.assign(span.style,{fontSize:`${(r.size||16)*scale}px`,letterSpacing:`${r.spacing||0}px`});
   el.append(span);
  }
  frag.append(el);
 }
 return frag;
}
export function imageElement(sh:Shape,eager=false){
 const img=document.createElement('img');const vars=sh.variants!;const largest=vars[vars.length-1];
 img.src=assetUrl(largest.src);img.srcset=vars.map(v=>`${assetUrl(v.src)} ${v.width}w`).join(', ');img.sizes=`(max-width: 700px) 100vw, ${Math.ceil(sh.w/BASE_WIDTH*100)}vw`;
 img.width=sh.width!;img.height=sh.height!;img.style.aspectRatio=`${sh.width} / ${sh.height}`;
 img.alt=sh.w>150?'Kaynak sunum görseli':'';img.loading=eager?'eager':'lazy';img.decoding='async';if(eager)img.fetchPriority='high';
 return img;
}
function tableElement(sh:Shape,mobile=false){
 const table=document.createElement('table');table.className='source-table';
 const colgroup=document.createElement('colgroup');for(const w of sh.columns!){const col=document.createElement('col');col.style.width=`${w/sh.w*100}%`;colgroup.append(col);}table.append(colgroup);
 const thead=document.createElement('thead'),tbody=document.createElement('tbody');
 sh.rows!.forEach((row,i)=>{const tr=document.createElement('tr');if(!mobile)tr.style.height=`${row.height}px`;
  row.cells.forEach((c,j)=>{const td=document.createElement(i===0||j===0?'th':'td');if(i===0)td.setAttribute('scope','col');else if(j===0)td.setAttribute('scope','row');
   if(mobile&&i>0&&j>0)td.dataset.label=sh.rows![0].cells[j].paragraphs.map(p=>p.text).join(' ');
   td.style.background=c.fill;if(!mobile)td.style.padding=c.padding.map(n=>`${n}px`).join(' ');
   td.append(paragraphs(c.paragraphs,1,mobile));tr.append(td);
  });(i===0?thead:tbody).append(tr);
 });table.append(thead,tbody);return table;
}
export function renderCanvas(slide:Slide,eager=false){
 const canvas=document.createElement('div');canvas.className='canvas';canvas.style.background=slide.background;canvas.setAttribute('aria-label',`${slide.number}. slayt: ${slide.title}`);
 for(const sh of slide.shapes){
  const el=document.createElement('div');el.className=`node node-${sh.type}${sh.role==='title'?' slide-title':''}`;el.dataset.shape=String(sh.id);
  Object.assign(el.style,{left:`${sh.x}px`,top:`${sh.y}px`,width:`${sh.w}px`,height:`${sh.h}px`});
  if(sh.rotation)el.style.transform=`rotate(${sh.rotation}deg)`;
  if(sh.fill)el.style.background=sh.fill;
  if(sh.border&&sh.border!=='transparent')el.style.border=`${sh.borderWidth||.5}px solid ${sh.border}`;
  if(sh.geometry==='ellipse')el.style.borderRadius='50%';else if(sh.geometry==='roundRect')el.style.borderRadius=`${Math.min(sh.w,sh.h)*.09}px`;
  if(sh.type==='text'){
   if(sh.padding)el.style.padding=sh.padding.map(v=>`${v}px`).join(' ');
   if(!sh.wrap)el.style.whiteSpace='pre';
   if(sh.anchor==='ctr'){el.style.display='flex';el.style.flexDirection='column';el.style.justifyContent='center';}
   el.append(paragraphs(sh.paragraphs!,sh.fontScale));
  }else if(sh.type==='image'){
   const img=imageElement(sh,eager);img.alt=sh.w>150?`${slide.title} — kaynak görseli`:'';el.append(img);
  }else if(sh.type==='table')el.append(tableElement(sh));
  else el.setAttribute('aria-hidden','true');
  canvas.append(el);
 }
 return canvas;
}
export function renderMobile(slide:Slide){
 const mobile=document.createElement('div');mobile.className='mobile-content';
 for(const sh of slide.shapes){
  if(sh.type==='text'){
   const plain=sh.paragraphs!.map(p=>p.text).join(' ');
   if(/^\d{2}$/.test(plain.trim())&&sh.y>500)continue;
   const el=document.createElement(sh.role==='title'?'h2':'div');
   const maxSize=Math.max(...sh.paragraphs!.flatMap(p=>p.runs.map(r=>r.size||16)));
   el.className=sh.role==='title'?'mobile-title':maxSize<14?'mobile-label':maxSize>=18?'mobile-subtitle':'mobile-text';
   el.append(paragraphs(sh.paragraphs!,1,true));mobile.append(el);
  }else if(sh.type==='image'&&sh.w>150&&sh.h>120){const img=imageElement(sh,slide.number===1);img.className='mobile-image';img.alt=`${slide.title} — kaynak görseli`;mobile.append(img);}
  else if(sh.type==='table'){const wrap=document.createElement('div');wrap.className='mobile-table';wrap.append(tableElement(sh,true));mobile.append(wrap);}
 }
 return mobile;
}
// Match PowerPoint's fit-to-box behavior after the local fonts have loaded.
export function fitCanvas(canvas:HTMLElement){
 for(const el of canvas.querySelectorAll<HTMLElement>('.node-text')){
  if(el.style.whiteSpace==='pre'||el.clientHeight<12)continue;
  const nodes=Array.from(el.querySelectorAll<HTMLElement>('.source-paragraph, .source-paragraph span:not(.bullet-marker)'));
  for(const node of nodes){if(!node.dataset.baseSize)node.dataset.baseSize=String(parseFloat(node.style.fontSize)||16);node.style.fontSize=`${node.dataset.baseSize}px`;}
  let factor=1;
  for(let step=0;step<14&&el.scrollHeight>el.clientHeight+1;step++){
   factor*=.97;for(const node of nodes)node.style.fontSize=`${Number(node.dataset.baseSize)*factor}px`;
  }
 }
}
