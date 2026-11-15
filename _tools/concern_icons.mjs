import fs from 'node:fs';
const IMG=n=>`<img src="assets/icons/${n}.png" width="54" height="54" alt="" style="display:block">`;
export const ICON={'건조':IMG('dry'),'트러블':IMG('trouble'),'민감':IMG('sensitive'),'자외선':IMG('uv'),'밸런스':IMG('balance'),'탄력':IMG('aging')};
if(process.argv[1]?.endsWith('concern_icons.mjs')){const f='../site/index.html';let h=fs.readFileSync(f,'utf8');
for(const [k,v] of Object.entries(ICON))h=h.replace(`class="gp-concern__icon">${k}<`,`class="gp-concern__icon">${v}<`);
fs.writeFileSync(f,h);console.log('ok');}
