import fs from 'node:fs';import path from 'node:path';
const SITE=path.resolve('../site');const map=new Map();let pages=0;
function walk(d){for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);if(f.isDirectory()){if(f.name!=='assets')walk(p);continue}if(f.name!=='index.html')continue;pages++;
let h=fs.readFileSync(p,'utf8');h=h.replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/g,'');
for(const m of h.matchAll(/>([^<>]+)</g)){const t=m[1].replace(/\s+/g,' ').trim();if(t&&/[A-Za-z]{2}/.test(t))map.set(t,(map.get(t)||0)+1)}
for(const m of h.matchAll(/(?:alt|title|aria-label|placeholder|content)="([^"]*[A-Za-z]{3}[^"]*)"/g)){const t=m[1].trim();map.set('@'+t,(map.get('@'+t)||0)+1)}}}
walk(SITE);
const arr=[...map.entries()];console.log(pages,'pages',arr.length,'unique',arr.reduce((a,[t])=>a+t.length,0),'chars');
fs.writeFileSync('texts.json',JSON.stringify(arr,null,0));
