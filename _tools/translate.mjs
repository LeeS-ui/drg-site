import fs from 'node:fs';import {pre} from './glossary.mjs';
const arr=JSON.parse(fs.readFileSync('texts.json'));
const skip=t=>/^@(https?:|width=|website|Google|summary|index|follow|max-|#)/.test(t)||/^[A-Z0-9 ,\/\-\(\)\.\[\]%']{40,}/.test(t)||/\[Ingredients\]/.test(t)||((t.match(/,/g)||[]).length>12&&t===t.toUpperCase());
let C={};try{C=JSON.parse(fs.readFileSync('translations.json'))}catch{}
const todo=arr.map(x=>x[0]).filter(t=>!skip(t)&&!(t in C)&&/[A-Za-z]{2}/.test(t.replace(/^@/,'')));
console.log('todo',todo.length);
async function tr(q){for(let k=0;k<6;k++){try{const r=await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q='+encodeURIComponent(q));if(!r.ok)throw new Error(r.status);const j=await r.json();return j[0].map(x=>x[0]).join('')}catch(e){await new Promise(r=>setTimeout(r,20000*(k+1)))}}return null}
let i=0,done=0;
async function w(){while(i<todo.length){const t=todo[i++];await new Promise(r=>setTimeout(r,400));const at=t[0]==='@';const src=at?t.slice(1):t;const p=pre(src.replace(/&amp;/g,'&'));
 let o=/[A-Za-z]{2}/.test(p.replace(/닥터지/g,''))?await tr(p):p;if(o==null)continue;C[t]=(at?'@':'')+o;if(++done%100==0){fs.writeFileSync('translations.json',JSON.stringify(C));console.log(done)}}}
await Promise.all([1,2].map(w));fs.writeFileSync('translations.json',JSON.stringify(C));console.log('saved',Object.keys(C).length);
