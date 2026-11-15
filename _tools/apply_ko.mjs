import fs from 'node:fs';import path from 'node:path';
const SITE=path.resolve(process.argv[2]||'../site');
const C=JSON.parse(fs.readFileSync('translations.json'));
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
let n=0;
function walk(d){for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);if(f.isDirectory()){if(f.name!=='assets')walk(p);continue}if(f.name!=='index.html')continue;
let h=fs.readFileSync(p,'utf8');
const parts=h.split(/(<(?:script|style|svg)\b[\s\S]*?<\/(?:script|style|svg)>)/);
h=parts.map((seg,k)=>{if(k%2)return seg;
 seg=seg.replace(/>([^<>]+)</g,(m,t)=>{const key=t.replace(/\s+/g,' ').trim();const v=C[key];if(!v||v[0]==='@')return m;const lead=t.match(/^\s*/)[0],trail=t.match(/\s*$/)[0];return '>'+lead+esc(v)+trail+'<'});
 seg=seg.replace(/\b(alt|title|aria-label|placeholder|content)="([^"]*)"/g,(m,a,v)=>{const x=C['@'+v.trim()];return x?`${a}="${x.slice(1).replace(/"/g,'&quot;')}"`:m});
 return seg}).join('');
h=h.replace(/<html([^>]*?)\blang="[^"]*"/,'<html$1lang="ko"');
fs.writeFileSync(p,h);n++}}
walk(SITE);console.log('updated',n);
