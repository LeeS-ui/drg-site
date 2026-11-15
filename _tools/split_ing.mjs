import fs from 'node:fs';import path from 'node:path';
const dir=path.resolve('../site/our-products');let ok=0;const miss=[];
for(const s of fs.readdirSync(dir)){const p=path.join(dir,s,'index.html');if(!fs.existsSync(p))continue;
let h=fs.readFileSync(p,'utf8');
h=h.replace(/<!--ING-START-->[\s\S]*?<!--ING-END-->/,'').replace(/<link rel="stylesheet" href="[^"]*assets\/ingredients\.css">/,'');
if(h.includes('id="fullingredients"')){fs.writeFileSync(p,h);continue}
const i=h.indexOf('id="ingredients"');if(i<0)continue;
const a=h.lastIndexOf('<li',i),e=h.indexOf('</div></li>',i)+11;let li=h.slice(a,e);
const m=li.match(/(?:<br>\s*)?<strong>\s*(?:전체 성분|전성분|Full ingredients)[^<]*<\/strong>/i);
li=li.replace(/(<h2[^>]*>)[^<]*(<\/h2>)/,'$1핵심 성분$2');
if(!m){fs.writeFileSync(p,h.slice(0,a)+li+h.slice(e));miss.push(s);continue}
const k=li.indexOf(m[0]);
let full=li.slice(k+m[0].length,li.length-'</div></div></li>'.length).replace(/^[\s:]*\d*\s*-?\s*\[Ingredients\]\s*/i,'').replace(/^[\s:]*\d+\s*-\s*/,'').trim();
const key=li.slice(0,k).replace(/<br>\s*$/,'')+'</div></div></li>';
const keyEmpty=!/<ul>/.test(key);
let fl=li.slice(0,li.indexOf('<div class="',li.indexOf('</label>'))).replace('id="ingredients"','id="fullingredients"').replace('for="ingredients"','for="fullingredients"').replace('핵심 성분','전성분');
const cm=li.match(/<div class="([^"]*product-summary__accordions__content)"/);const cls=cm[1];
const fullLi=fl+`<div class="${cls}"><div>${full}</div></div></li>`;
h=h.slice(0,a)+(keyEmpty?'':key)+fullLi+h.slice(e);
fs.writeFileSync(p,h);ok++;}
console.log('split',ok,'no-marker',miss);
