// 제품 상세에 핵심성분 / 전성분 섹션 추가 (기존 Ingredients 아코디언 데이터 사용, 여러 번 실행해도 안전)
import fs from 'node:fs';
import path from 'node:path';
const SITE = path.resolve(process.argv[2] || '../site');
const dir = path.join(SITE, 'our-products');
const esc = (s) => s.replace(/&(?!amp;|lt;|gt;|quot;|#\d+;)/g, '&amp;');
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const MARK = /<!--ING-START-->[\s\S]*?<!--ING-END-->/;
let ok = 0; const miss = [];
for (const slug of fs.readdirSync(dir)) {
  const p = path.join(dir, slug, 'index.html');
  if (!fs.existsSync(p)) continue;
  let h = fs.readFileSync(p, 'utf8');
  h = h.replace(MARK, '');
  const i0 = h.indexOf('id="ingredients"');
  if (i0 < 0) { miss.push(slug + ' (no accordion)'); continue; }
  const c0 = h.indexOf('product-summary__accordions__content', i0);
  const c1 = h.indexOf('</div></li>', c0);
  let body = h.slice(h.indexOf('>', c0) + 1, c1);
  const fi = body.search(/<strong>\s*Full ingredients/i);
  let full = '', keyPart = body;
  if (fi > -1) {
    keyPart = body.slice(0, fi);
    full = body.slice(fi).replace(/<strong>\s*Full ingredients:?\s*<\/strong>:?/i, '');
    full = full.replace(/<\/div>\s*<\/div>\s*$/i, '').replace(/^[\s\d-]*(?:-\s*)?\[Ingredients\]\s*/i, '').replace(/^\s*\d+\s*-\s*/, '').trim();
  }
  const items = [];
  const re = /(?:<strong>([^<]+)<\/strong>|([^<>]+?))\s*<ul>([\s\S]*?)<\/ul>/g;
  let m;
  while ((m = re.exec(keyPart))) {
    const name = strip(m[1] || m[2] || '').replace(/^<?div>?/, '');
    const lis = [...m[3].matchAll(/<li>\s*<strong>([^<]+?):?<\/strong>\s*([\s\S]*?)<\/li>/g)].map((x) => [strip(x[1]), strip(x[2]).replace(/"$/, '')]);
    if (name) items.push({ name, lis });
  }
  if (!items.length && !full) { miss.push(slug + ' (no data)'); continue; }
  const label = (l) => (/what/i.test(l) ? '효능' : /why/i.test(l) ? '중요한 이유' : l);
  const key = items.length
    ? `<div class="ingd__grid">${items.map((it, n) => `<article class="ingd__card"><span class="ingd__no">${String(n + 1).padStart(2, '0')}</span><h3>${esc(it.name)}</h3>${it.lis.map(([l, t]) => `<p><b>${esc(label(l))}</b>${esc(t)}</p>`).join('')}</article>`).join('')}</div>`
    : '<p class="ingd__empty">등록된 핵심 성분 정보가 없습니다.</p>';
  const fullHtml = full ? esc(full).replace(/<strong>/g, '<mark>').replace(/<\/strong>/g, '</mark>') : '등록된 전성분 정보가 없습니다.';
  const sec = `<!--ING-START--><section class="ingd" id="ingredients-detail"><div class="ingd__wrap">
<div class="ingd__head"><span>KEY INGREDIENTS</span><h2>핵심 성분</h2></div>${key}
<div class="ingd__head ingd__head--2"><span>FULL INGREDIENTS</span><h2>전성분</h2></div>
<div class="ingd__table"><div class="ingd__row"><dt>전성분</dt><dd>${fullHtml}${full ? '<small>※ 강조 표시는 핵심 성분입니다.</small>' : ''}</dd></div></div>
</div></section><!--ING-END-->`;
  const depth = '../../';
  if (!h.includes('assets/ingredients.css')) h = h.replace('</head>', `<link rel="stylesheet" href="${depth}assets/ingredients.css"></head>`);
  const f = h.indexOf('<footer');
  if (f < 0) { miss.push(slug + ' (no footer)'); continue; }
  h = h.slice(0, f) + sec + h.slice(f);
  fs.writeFileSync(p, h);
  ok++;
}
console.log('updated', ok, 'missing', miss);
