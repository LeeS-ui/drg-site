// Figma 플러그인 샌드박스에서 실행: 압축 JSON → 노드 (figma_execute에 붙여 사용)
const hx=(s)=>({c:{r:parseInt(s.slice(0,2),16)/255,g:parseInt(s.slice(2,4),16)/255,b:parseInt(s.slice(4,6),16)/255},a:s.length>6?parseInt(s.slice(6,8),16)/255:1});
const solid=(s)=>{const h=hx(s);return {type:'SOLID',color:h.c,opacity:h.a}};
const WT={300:'Light',400:'Regular',500:'Medium',600:'SemiBold',700:'Bold'};
async function fonts(){for(const s of Object.values(WT)){try{await figma.loadFontAsync({family:'Pretendard',style:s})}catch(e){}}}
function fill(parent,items,oy){
  let last=null;
  for(const it of items){
    const k=it[0];
    if(k==='i'){
      if(/logo/.test(it[5])){const t=figma.createText();t.fontName={family:'Pretendard',style:'Bold'};t.characters='Dr.G';t.fontSize=26;t.fills=[solid('005031')];parent.appendChild(t);t.x=it[1]+8;t.y=it[2]+4-(oy||0);continue}
      if(last&&last[1]===it[1]&&last[2]===it[2]&&last[3]===it[3]&&last[4]===it[4]&&last[5]){continue}
      const r=figma.createRectangle();parent.appendChild(r);r.x=it[1];r.y=it[2]-(oy||0);r.resize(Math.max(it[3],1),Math.max(it[4],1));r.name='이미지:'+it[5];r.fills=[solid('dfe9e4')];r.cornerRadius=Math.min(it[6]||0,it[4]/2);
    }else if(k==='r'){
      last=it;
      const r=figma.createRectangle();parent.appendChild(r);r.x=it[1];r.y=it[2]-(oy||0);r.resize(Math.max(it[3],1),Math.max(it[4],1));
      const f=it[5],rad=it[6]||0,sc=it[7],sw=it[8],img=it[9];
      r.name=img?'이미지배경:'+String(img).slice(0,30):'box';
      r.fills=f?[solid(f)]:(img&&img!=='grad'?[solid('dfe9e4')]:(img==='grad'?[solid('005031cc')]:[]));
      r.cornerRadius=Math.min(rad,it[4]/2);
      if(sc&&sw){r.strokes=[solid(sc)];r.strokeWeight=sw;r.strokeAlign='INSIDE'}
    }else if(k==='t'){
      const [,x,y,w,h,txt,fs,wt,col,al,lh,ls,up]=it;
      const t=figma.createText();t.fontName={family:'Pretendard',style:WT[wt]||'Regular'};t.fontSize=fs;
      t.characters=up?txt.toUpperCase():txt;t.fills=[solid(col||'000000')];
      const LH=lh||Math.round(fs*1.4);t.lineHeight={unit:'PIXELS',value:LH};
      if(ls)t.letterSpacing={unit:'PIXELS',value:ls};
      t.textAlignHorizontal=al==='c'?'CENTER':(al==='e'||al==='r')?'RIGHT':'LEFT';
      parent.appendChild(t);
      const lines=Math.max(1,Math.round(h/(fs*1.15)));
      if(lines<=1){t.textAutoResize='WIDTH_AND_HEIGHT'}else{t.textAutoResize='HEIGHT';t.resize(w+3,t.height)}
      t.x=x;t.y=y-(oy||0)-(LH-fs*1.15)/2;
      if(lines<=1&&al==='c')t.x=x+w/2-t.width/2;
    }
  }
}
async function getPage(){let pg=figma.root.children.find(p=>p.name==='Dr.G 사이트 (구현본)');if(!pg){pg=figma.createPage();pg.name='Dr.G 사이트 (구현본)'}await figma.setCurrentPageAsync(pg);return pg}
async function comps(pg,H,F){
  for(const [nm,D,x] of [['Header',H,-1800],['Footer',F,-1800]]){
    if(!D)continue;let c=pg.children.find(n=>n.name===nm&&n.type==='COMPONENT');if(c)c.remove();
    c=figma.createComponent();c.name=nm;c.resize(D.w,D.rh);c.clipsContent=true;c.fills=[];pg.appendChild(c);c.x=x;c.y=nm==='Header'?0:200;fill(c,D.n,0);
  }
}
async function page(pg,name,D,col){
  const o=pg.children.find(n=>n.name===name&&n.type==='FRAME');let ox=null;if(o){ox=[o.x,o.y];o.remove()}
  const fr=figma.createFrame();fr.name=name;fr.resize(D.w,D.h);fr.clipsContent=true;fr.fills=[solid('ffffff')];pg.appendChild(fr);
  if(ox){fr.x=ox[0];fr.y=ox[1]}else{const n=pg.children.filter(c=>c.type==='FRAME').length-1;fr.x=(n%4)*(D.w+120);fr.y=Math.floor(n/4)*7200}
  fill(fr,D.n.slice(1),0);
  const H=pg.children.find(n=>n.name==='Header'&&n.type==='COMPONENT'),F=pg.children.find(n=>n.name==='Footer'&&n.type==='COMPONENT');
  if(F){const fi=F.createInstance();fr.appendChild(fi);fi.x=0;fi.y=D.h-F.height}
  if(H){const hi=H.createInstance();fr.appendChild(hi);hi.x=0;hi.y=0}
  return fr;
}
