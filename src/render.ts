import type { Shape, Slide, Paragraph } from './types';
export const BASE_WIDTH=959.981;
export const BASE_HEIGHT=540;
export const assetUrl=(path:string)=>new URL(path,document.baseURI).href;
// Keep original source colors in dark mode; light mode supplies readable equivalents.
function sourceColor(color:string,role='surface'){return /^#[0-9a-f]{6,8}$/i.test(color)?`var(--source-${role}-${color.slice(1).toLowerCase()}, ${color})`:color;}
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
   Object.assign(span.style,{fontFamily:`"${family(r.font)}", sans-serif`,fontWeight:String(weight),fontStyle:r.italic?'italic':'normal',color:sourceColor(r.color||'inherit','ink')});
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
   td.style.background=sourceColor(c.fill);if(!mobile)td.style.padding=c.padding.map(n=>`${n}px`).join(' ');
   td.append(paragraphs(c.paragraphs,1,mobile));tr.append(td);
  });(i===0?thead:tbody).append(tr);
 });table.append(thead,tbody);return table;
}
export function renderCanvas(slide:Slide,eager=false){
 const canvas=document.createElement('div');canvas.className='canvas';canvas.style.background=sourceColor(slide.background);canvas.setAttribute('aria-label',`${slide.number}. slayt: ${slide.title}`);
 for(const sh of slide.shapes){
  const el=document.createElement('div');el.className=`node node-${sh.type}${sh.role==='title'?' slide-title':''}`;el.dataset.shape=String(sh.id);
  if(slide.number===9&&[8,12,16,20].includes(sh.id))el.classList.add('image-overlay-label');
  Object.assign(el.style,{left:`${sh.x}px`,top:`${sh.y}px`,width:`${sh.w}px`,height:`${sh.h}px`});
  if(sh.rotation)el.style.transform=`rotate(${sh.rotation}deg)`;
  if(sh.fill)el.style.background=sourceColor(sh.fill);
  if(sh.border&&sh.border!=='transparent')el.style.border=`${sh.borderWidth||.5}px solid ${sourceColor(sh.border,'line')}`;
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
const plainText=(sh:Shape)=>sh.paragraphs?.map(p=>p.text).join(' ').trim()||'';
const mobileVisualObserver=new ResizeObserver(entries=>{for(const entry of entries){const el=entry.target as HTMLElement;el.style.setProperty('--scale',String(entry.contentRect.width/Number(el.dataset.sourceWidth)));}});
function mobileText(sh:Shape,kind?:string){
 const size=Math.max(...sh.paragraphs!.flatMap(p=>p.runs.map(r=>r.size||16)));
 const el=document.createElement(sh.role==='title'?'h2':kind==='mobile-card-title'?'h3':'div');
 el.className=kind||(sh.role==='title'?'mobile-title':size>=18?'mobile-subtitle':'mobile-text');
 el.dataset.shape=String(sh.id);el.append(paragraphs(sh.paragraphs!,1,true));return el;
}
function mobileCard(slide:Slide,container:Shape,children:Shape[]){
 const card=document.createElement('section');card.className='mobile-card';card.dataset.container=String(container.id);
 if(container.fill&&container.fill!=='transparent')card.style.background=sourceColor(container.fill);
 if(container.w<140)card.classList.add('mobile-icon-card');
 let heading=false;
 for(let i=0;i<children.length;i++){
  const sh=children[i];
  if(sh.type==='image'){const img=imageElement(sh);img.className='mobile-icon';img.alt='';card.append(img);continue;}
  const text=plainText(sh),next=children[i+1];
  if(/^[✓✔✕×]$/.test(text)&&next?.type==='text'&&Math.abs(next.y-sh.y)<5){
   const row=document.createElement('div');row.className='mobile-bullet-row';row.append(mobileText(sh,'mobile-check'),mobileText(next,'mobile-text'));card.append(row);i++;continue;
  }
  if(/^\d{2}$/.test(text)){card.append(mobileText(sh,'mobile-index'));continue;}
  const isHeading=!heading&&text.length<100&&children.filter(c=>c.type==='text').length>1;
  card.append(mobileText(sh,isHeading?'mobile-card-title':'mobile-text'));heading=true;
 }
 return card;
}
function mobileCycle(slide:Slide){
 const fragment=document.createDocumentFragment();
 // These four transparent image layers and their labels form ONE source diagram.
 const indices=[6,7,10,11,14,15,18,19],bounds=slide.shapes[6];
 const graphic=document.createElement('div');graphic.className='mobile-cycle-graphic';graphic.dataset.sourceWidth=String(bounds.w);
 graphic.style.aspectRatio=`${bounds.w} / ${bounds.h}`;graphic.setAttribute('role','img');graphic.setAttribute('aria-label','Uygulama yaşam döngüsünün dört aşaması');
 const canvas=renderCanvas({...slide,shapes:indices.map(i=>({...slide.shapes[i],x:slide.shapes[i].x-bounds.x,y:slide.shapes[i].y-bounds.y}))});
 canvas.style.width=`${bounds.w}px`;canvas.style.height=`${bounds.h}px`;canvas.style.background='transparent';canvas.setAttribute('aria-hidden','true');
 graphic.append(canvas);mobileVisualObserver.observe(graphic);fragment.append(graphic);
 const steps=document.createElement('div');steps.className='mobile-cycle-steps';
 for(const [title,body] of [[4,5],[8,9],[12,13],[16,17]]){
  const card=document.createElement('section');card.className='mobile-card mobile-cycle-step';card.append(mobileText(slide.shapes[title],'mobile-card-title'),mobileText(slide.shapes[body],'mobile-text'));steps.append(card);
 }
 fragment.append(steps);return fragment;
}
export function renderMobile(slide:Slide){
 const mobile=document.createElement('div');mobile.className='mobile-content';
 const shapes=slide.shapes,consumed=new Set<number>(),photos:HTMLImageElement[]=[];
 const titleIndex=shapes.findIndex(sh=>sh.role==='title');
 // The later opaque photographs replace these fully covered source photographs.
 // Transparent diagram layers are deliberately NOT subject to this exclusion.
 const coveredPhotos=new Set(slide.number===3?[7]:slide.number===4?[8]:[]);
 const containers=shapes.map((sh,index)=>({sh,index})).filter(({sh})=>sh.type==='shape'&&!sh.background&&['rect','roundRect'].includes(sh.geometry||'')&&sh.w>=80&&sh.h>=40&&sh.h<500&&sh.fill&&sh.fill!=='transparent');
 const children=new Map<number,number[]>();
 for(const {sh:outer,index} of containers){
  const members=shapes.flatMap((sh,i)=>{
   const cx=sh.x+sh.w/2,cy=sh.y+sh.h/2;
   return i>index&&['text','image'].includes(sh.type)&&cx>=outer.x-2&&cx<=outer.x+outer.w+2&&cy>=outer.y-2&&cy<=outer.y+outer.h+2?[i]:[];
  });
  if(members.length){children.set(index,members);members.forEach(i=>consumed.add(i));}
 }
 let iconGrid:HTMLElement|null=null;
 for(let i=0;i<shapes.length;i++){
  const sh=shapes[i];
  if(slide.number===9&&i===4){mobile.append(mobileCycle(slide));}
  if(slide.number===9&&i>=4&&i<=19)continue;
  if(consumed.has(i))continue;
  const members=children.get(i);
  if(members){
   const card=mobileCard(slide,sh,members.map(n=>shapes[n]));
   if(sh.w<140){if(!iconGrid){iconGrid=document.createElement('div');iconGrid.className='mobile-icon-grid';mobile.append(iconGrid);}iconGrid.append(card);}
   else {iconGrid=null;mobile.append(card);}
  }else if(sh.type==='text'){
   const text=plainText(sh);if(/^\d{2}$/.test(text)&&sh.y>500)continue;
   mobile.append(mobileText(sh,i<titleIndex?'mobile-label':undefined));
  }else if(sh.type==='image'&&sh.w>150&&sh.h>120&&!coveredPhotos.has(sh.id)){
   const img=imageElement(sh,slide.number===1);img.className='mobile-image';img.dataset.shape=String(sh.id);img.alt=`${slide.title} — kaynak görseli`;
   if(slide.number===25)mobile.append(img);else photos.push(img);
  }else if(sh.type==='table'){
   const wrap=document.createElement('div');wrap.className='mobile-table';wrap.append(tableElement(sh,true));mobile.append(wrap);
  }
 }
 mobile.append(...photos);return mobile;
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
