import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';
const OUT=path.resolve('../site/assets/photos');fs.mkdirSync(OUT,{recursive:true});
const GEN=path.join(process.env.USERPROFILE,'.codex','generated_images');
const style='실사(photorealistic) 에디토리얼 뷰티 사진, 자연광, 얕은 심도, 차분한 미니멀 톤(흰색·연한 민트·베이지), 글자·로고·워터마크 없음, 가로 16:10 비율';
const J={
winter:'겨울 아침 창가, 보습 크림 용기(무지, 로고 없음)와 흰 니트·따뜻한 머그잔, 창밖은 눈 내리는 풍경',
indoor:'난방이 켜진 건조한 실내 거실, 가습기에서 수증기가 올라오고 보습 크림이 놓인 협탁',
wind:'찬 바람이 부는 겨울 도시 거리, 목도리를 두른 사람의 뺨 클로즈업(얼굴 일부만), 붉어진 뺨과 입김',
routine:'욕실 선반 위에 정돈된 무지 스킨케어 제품(토너·크림·선크림) 정물, 아침 햇살',
step1:'미온수로 세안하는 손과 물방울, 맑은 물이 흐르는 세면대, 신선한 피부 준비 단계',
step2:'손가락으로 진정 크림을 뺨에 부드럽게 펴 바르는 클로즈업(얼굴 일부), 촉촉한 피부결',
step3:'야외 햇빛 아래 선크림을 손등에 짜서 바르는 장면, 자외선 차단 단계',
c_dry:'건조하고 당기는 피부를 상징하는 마른 피부결 클로즈업과 수분 크림 텍스처, 부드러운 빛',
c_trouble:'번들거림과 트러블이 있는 피부를 위한 가벼운 젤 텍스처와 초록 병풀잎, 깨끗한 배경',
c_sensitive:'민감하고 붉어진 피부를 진정시키는 알로에·병풀 잎과 시원한 물방울, 연한 분홍·민트 톤',
c_tone:'칙칙한 피부톤 케어를 위한 비타민C 오렌지 슬라이스와 선크림, 밝은 햇살',
c_balance:'T존은 번들·볼은 건조한 유수분 균형을 상징하는 물방울과 오일 방울 정물, 두 가지 텍스처',
c_aging:'잔주름과 탄력 케어를 위한 에센스 앰플과 스포이드, 탄탄한 피부결 클로즈업',
v_feature:'세안 후 수건으로 얼굴을 감싼 여성의 옆모습(얼굴 일부), 욕실 자연광, 전문 스킨케어 영상 썸네일 분위기',
v_sensitive:'환절기 가을 햇살 아래 목도리를 두르고 뺨을 만지는 사람, 피부 장벽 관리 영상 썸네일 분위기',
v_uv:'해변·야외 햇빛 속에서 선크림을 바르는 사람의 팔 클로즈업, 올바른 자외선 차단제 사용 영상 썸네일',
v_trouble:'세안 폼 거품을 손에 올린 클로즈업, 트러블 피부 세안 순서 영상 썸네일 분위기',
};
const only=process.argv.slice(2);const names=Object.keys(J).filter(n=>!only.length||only.includes(n)).filter(n=>!fs.existsSync(path.join(OUT,n+'.png')));
const list=()=>{const r=[];const w=d=>{if(!fs.existsSync(d))return;for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);f.isDirectory()?w(p):/\.(png|jpg|webp)$/i.test(f.name)&&r.push(p)}};w(GEN);return r};
let i=0;
async function run(n){return new Promise(res=>{
 const prompt='이미지 생성 도구로 사진 1장만 만들어줘. '+style+'. 내용: '+J[n]+'. 만들 수 없으면 추측하지 말고 못 만들었다고 말해줘';
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
