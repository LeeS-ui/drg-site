import fs from 'node:fs';import path from 'node:path';
const SITE=path.resolve('../site'),PH=path.join(SITE,'assets','photos');
// PNG → JPG(가로 1200)
const have=n=>fs.existsSync(path.join(PH,n+'.jpg'));
const CARD={'겨울':'winter','실내':'indoor','바람':'wind','루틴':'routine','1단계 · 준비':'step1','2단계 · 진정':'step2','3단계 · 보호':'step3'};
const CONC=['c_dry','c_trouble','c_sensitive','c_tone','c_balance','c_aging'];
let n=0,miss=new Set();
(function w(d){for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);if(f.isDirectory()){if(f.name!=='assets')w(p);continue}if(f.name!=='index.html')continue;
 let h=fs.readFileSync(p,'utf8');const o=h;const pre='../'.repeat(path.relative(SITE,d).split(path.sep).filter(Boolean).length)+'assets/photos/';
 const bg=(k)=>{if(!have(k)){miss.add(k);return null}return `background:url(${pre}${k}.jpg) center/cover no-repeat`};
 h=h.replace(/<div class="gp-card__img"( style="([^"]*)")?>([^<]*)<\/div>/g,(m,_a,st,label)=>{const b=bg(CARD[label.trim()]||'');return b?`<div class="gp-card__img" style="${st?st+';':''}${b};font-size:0"></div>`:m});
 let ci=0;h=h.replace(/<div class="gp-item__ph">[^<]*<\/div>/g,m=>{const b=bg(CONC[ci++]);return b?`<div class="gp-item__ph" style="${b};font-size:0"></div>`:m});
 let vi=0;const V=['v_sensitive','v_uv','v_trouble'];
 h=h.replace(/<div class="gp-vcard__thumb">/g,m=>{const b=bg(V[vi++]);return b?`<div class="gp-vcard__thumb" style="${b}">`:m});
 h=h.replace(/<div class="gp-(feature|video)__thumb">/g,(m,k)=>{const b=bg('v_feature');return b?`<div class="gp-${k}__thumb" style="${b}">`:m});
 if(h!==o){fs.writeFileSync(p,h);n++}}})(SITE);
console.log('pages',n,'missing',[...miss]);
