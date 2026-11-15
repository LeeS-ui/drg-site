import fs from 'node:fs'; import path from 'node:path';
function removeBalanced(h, marker){
  let i=h.indexOf(marker); if(i<0) return h;
  let depth=0, pos=i; const re=/<(\/?)div\b[^>]*>/g; re.lastIndex=i; let m;
  while((m=re.exec(h))){ if(m[1]) depth--; else depth++; if(depth===0){ return h.slice(0,i)+h.slice(re.lastIndex);} }
  return h;
}
function walk(d){for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);
  if(f.isDirectory()){ if(f.name!=='assets') walk(p);} else if(f.name==='index.html'){
    let h=fs.readFileSync(p,'utf8'), o=h.length;
    for(const mk of ['<div id="onetrust-consent-sdk"','<div id="onetrust-banner-sdk"','<div id="onetrust-pc-sdk"','<div class="onetrust-pc-dark-filter']) h=removeBalanced(h,mk);
    h=h.replace(/<style[^>]*id="onetrust-style"[\s\S]*?<\/style>/g,'');
    if(h.length!==o){fs.writeFileSync(p,h);console.log('stripped',p,o-h.length);}
  }}}
walk(path.resolve(process.argv[2]));
