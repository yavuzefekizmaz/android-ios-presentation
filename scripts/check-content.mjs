import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
const slides=JSON.parse(await readFile('src/data/slides/slides.json','utf8'));
assert.equal(slides.length,31);assert.deepEqual(slides.map(s=>s.number),Array.from({length:31},(_,i)=>i+1));
assert.equal(slides.filter(s=>s.shapes.some(sh=>sh.type==='table')).length,6);
for(const s of slides){assert.ok(s.title);assert.ok(s.shapes.some(sh=>sh.role==='title'));for(const sh of s.shapes){assert.ok(Number.isFinite(sh.w)&&sh.w>=0);if(sh.type==='image')for(const v of sh.variants)await access(`public/${v.src}`);}}
const last=JSON.stringify(slides.at(-1));for(const name of ['Yavuz Efe Kızmaz','Kaan İsmail Çakır','Kerem Muhammed Ece','Kaan İnan','Efe Can','Yıldız Taş','İstinye Üniversitesi','BİLGİSAYAR PROGRAMCILIĞI'])assert.ok(last.includes(name),name);
assert.ok(!JSON.stringify(slides).toLowerCase().includes('gamma'));assert.ok(!JSON.stringify(slides).includes('\ufffd'));
console.log('PASS: 31 ordered slides, 6 semantic tables, all image paths, final names, Turkish encoding.');
