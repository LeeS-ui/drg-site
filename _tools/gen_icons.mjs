import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';
const OUT=path.resolve('../site/assets/icons_raw');fs.mkdirSync(OUT,{recursive:true});
const GEN=path.join(process.env.USERPROFILE,'.codex','generated_images');
const style='스킨케어 브랜드용 단일 아이콘 일러스트 1개, 진한 초록(#005031) 단색 얇은 선(line) 스타일, 둥근 선 끝, 순백(#FFFFFF) 단색 배경 정중앙, 그림자·그라데이션·글자·테두리 없음, 정사각형 1:1';
const J={
i_dry:'건조하고 당기는 피부를 상징하는 물방울 아이콘(물방울 안에 작은 반짝임)',
i_trouble:'트러블과 과다 피지를 상징하는 아이콘(얼굴 윤곽에 작은 뾰루지 점들과 번들거림 표시)',
i_sensitive:'민감하고 붉어진 피부를 상징하는 아이콘(보호막 방패 안의 하트 또는 잎사귀)',
i_uv:'자외선 차단을 상징하는 아이콘(해와 방패 또는 햇살)',
i_balance:'유수분 밸런스를 상징하는 아이콘(물방울과 기름방울이 균형을 이루는 저울)',
i_aging:'잔주름과 탄력 저하를 상징하는 아이콘(탄탄한 얼굴 곡선과 위로 올라가는 화살표 또는 반짝임)',
};
const only=process.argv.slice(2);const names=Object.keys(J).filter(n=>!only.length||only.includes(n)).filter(n=>!fs.existsSync(path.join(OUT,n+'.png')));
const list=()=>{const r=[];const w=d=>{if(!fs.existsSync(d))return;for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);f.isDirectory()?w(p):/\.(png|jpg|webp)$/i.test(f.name)&&r.push(p)}};w(GEN);return r};
let i=0;
async function run(n){return new Promise(res=>{
 const prompt='이미지 생성 도구로 아이콘 이미지 1장만 만들어줘. '+style+'. 내용: '+J[n]+'. 만들 수 없으면 추측하지 말고 못 만들었다고 말해줘';
 const t0=Date.now();const c=spawn('codex',['exec','--skip-git-repo-check','--disable','apps','-'],{cwd:OUT,shell:true});
 let out='';c.stdout.on('data',d=>out+=d);c.stderr.on('data',d=>out+=d);
 c.stdin.end(prompt);
 const t=setTimeout(()=>c.kill(),600000);
 c.on('close',()=>{clearTimeout(t);const m=[...out.matchAll(/generated_images[\/][^)s]+?.(?:png|jpg|webp)/gi)].pop();
  if(m){const src=path.join(process.env.USERPROFILE,'.codex',m[0].replace(/[\/]/g,path.sep));if(fs.existsSync(src)){fs.copyFileSync(src,path.join(OUT,n+'.png'));console.log('ok',n);return res()}}
  const nw=list().filter(p=>fs.statSync(p).mtimeMs>=t0-2000).sort((x,y)=>fs.statSync(y).mtimeMs-fs.statSync(x).mtimeMs);
  if(nw.length){fs.copyFileSync(nw[0],path.join(OUT,n+'.png'));console.log('ok(mtime)',n);return res()}
  console.log('FAIL',n,out.slice(-200).replace(/s+/g,' '));res()})})}
async function w(){while(i<names.length){await run(names[i++])}}
await Promise.all([1].map(w));console.log('done');
