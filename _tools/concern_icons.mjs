import fs from 'node:fs';
const S=(b)=>`<svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="#005031" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${b}</svg>`;
export const ICON={
'건조':S('<path d="M24 6c6 8 11 14 11 21a11 11 0 0 1-22 0c0-7 5-13 11-21z"/><path d="M18 30c.6 3 3 5 6 5" opacity=".6"/><path d="M12 42h6m4 0h4m4 0h6" opacity=".5"/>'),
'트러블':S('<circle cx="24" cy="24" r="16"/><circle cx="19" cy="20" r="2.6" fill="#005031" stroke="none"/><circle cx="29.5" cy="27" r="2" fill="#005031" stroke="none"/><path d="M17 30c2 3 5 4 8 3"/>'),
'민감':S('<path d="M24 41S8 31 8 19a8 8 0 0 1 16-2 8 8 0 0 1 16 2c0 12-16 22-16 22z"/><path d="M24 17v8m-4-4h8" opacity=".7"/>'),
'자외선':S('<circle cx="24" cy="24" r="8"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2"/>'),
'밸런스':S('<path d="M24 8v32M14 40h20"/><path d="M10 14h28"/><path d="M10 14l-5 12a5 5 0 0 0 10 0zM38 14l-5 12a5 5 0 0 0 10 0z"/>'),
'탄력':S('<path d="M24 6l3.2 9.2L37 18l-9.8 2.8L24 30l-3.2-9.2L11 18l9.8-2.8z"/><path d="M36 30l1.6 4.4L42 36l-4.4 1.6L36 42l-1.6-4.4L30 36l4.4-1.6z"/>'),
};
if(process.argv[1]?.endsWith('concern_icons.mjs')){const f='../site/index.html';let h=fs.readFileSync(f,'utf8');
for(const [k,v] of Object.entries(ICON))h=h.replace(`class="gp-concern__icon">${k}<`,`class="gp-concern__icon">${v}<`);
fs.writeFileSync(f,h);console.log('ok');}
