import { ICON } from './concern_icons.mjs';
// Figma "WEP > 최종" 섹션의 페이지들을 site/ 아래에 생성한다.
// 실행: node build_pages.mjs ../site && node apply_gnav.mjs ../site
import fs from 'node:fs';
import path from 'node:path';

const SITE = path.resolve(process.argv[2] || '../site');
const ASSETS = fs.readdirSync(path.join(SITE, 'assets'));
const missing = new Set();

/* ---------- 경로 도우미 ---------- */
const depthOf = (p) => (p ? p.split('/').length : 0);
const rel = (from, to) => '../'.repeat(depthOf(from)) + (to ? to + '/' : '') + 'index.html';
const img = (from, base) => {
  const f = ASSETS.find((a) => a.endsWith('_' + base));
  if (!f) { missing.add(base); return ''; }
  return '../'.repeat(depthOf(from)) + 'assets/' + f;
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---------- 제품 데이터 (기존 제품 페이지와 연결) ---------- */
const PRODUCTS = [
  { key: '클리어 히알 시카 수딩 세럼', page: 'our-products/red-blemish-hyal-cica-soothing-serum', img: 'red-blemish-hyal-cica-soothing-serum.jpg' },
  { key: '클리어 수딩 크림', page: 'our-products/red-blemish-clear-soothing-cream', img: 'red-blemish-soothing-cream.jpg' },
  { key: '수딩 업 선', page: 'our-products/red-blemish-soothing-up-sun', img: 'red-blemish-soothing-up-sun.jpg' },
  { key: '로얄 블랙스네일 크림', page: 'our-products/black-snail-cream', img: 'black-snail-cream.jpg' },
  { key: '그린딥 포어 클렌징밤', page: 'our-products/green-deep-cleansing-oil', img: 'green-deep-cleansing-oil.jpg' },
  { key: '10-시카 캡슐 수딩 토너', page: 'our-products/red-blemish-clear-soothing-toner', img: 'red-blemish-clear-soothing-toner.jpg' },
  { key: '브라이트닝 필링젤', page: 'our-products/brightening-peeling-gel', img: 'brightening-peeling-gel.jpg' },
  { key: '그린 마일드 업 선', page: 'our-products/green-mild-up-sun', img: 'green-mild-up-sun.jpg' },
];
const prod = (name) => PRODUCTS.find((p) => name.includes(p.key)) || PRODUCTS[1];

/* ---------- 컴포넌트 ---------- */
const btn = (label, href = '#', cls = '') => `<a class="gp-btn ${cls}" href="${href}">${esc(label)}</a>`;
const tags = (arr) => `<div class="gp-tags">${arr.map((t) => `<span class="gp-tag">${esc(t)}</span>`).join('')}</div>`;
const sec = (inner, { bg = '', pt = 72, pb = 72, wrap = '', id = '' } = {}) =>
  `<section class="gp-sec ${bg ? 'gp-bg-' + bg : ''}" ${id ? `id="${id}"` : ''} style="padding-top:${pt}px;padding-bottom:${pb}px"><div class="gp-wrap ${wrap}">${inner}</div></section>`;
const head = (title, sub, eyebrow) =>
  `<div class="gp-head">${eyebrow ? `<span class="gp-eyebrow">${esc(eyebrow)}</span>` : ''}<h2 class="gp-h2">${esc(title)}</h2>${sub ? `<p class="gp-lead">${esc(sub)}</p>` : ''}</div>`;
const shead = (title, sub) =>
  `<div class="gp-head gp-head--s"><h2 class="gp-h2s">${esc(title)}</h2>${sub ? `<p class="gp-sub">${esc(sub)}</p>` : ''}</div>`;
const titleBlock = (h1, sub) =>
  `<section class="gp-title"><div class="gp-wrap"><h1 class="gp-h1">${esc(h1)}</h1>${sub ? `<p>${esc(sub)}</p>` : ''}</div></section>`;
const pills = (arr, on = 0) => `<div class="gp-pills" data-filter>${arr.map((t, i) => `<button type="button" class="gp-pill ${i === on ? 'is-on' : ''}">${esc(t)}</button>`).join('')}</div>`;
const searchBox = (ph, extra = '') => `<form class="gp-search ${extra}" role="search" data-search><input type="search" placeholder="${esc(ph)}" aria-label="${esc(ph)}"><button class="gp-btn" type="submit">검색</button></form>`;

function subnav() { return ''; }
const CARE = (from, active) => subnav(from, [['고민별 관리', 'skin-concerns'], ['성분 사전', 'ingredients'], ['계절별 관리', 'seasonal-care'], ['전문의 영상', 'expert-videos'], ['피부 상식', 'skin-knowledge']], active);
const SUPPORT = (from, active) => subnav(from, [['자주 묻는 질문', 'support/faq'], ['공지사항', 'support/notices'], ['문의하기', 'support/contact']], active);
const LINES = (from, active) => subnav(from, [['전체 제품', 'our-products'], ['라인별 제품', 'product-lines']], active);

const productItems = (from, names) =>
  `<div class="gp-grid gp-grid--3 gp-grid--g32">${names.map((n) => {
    const p = prod(n);
    return `<div class="gp-item"><a href="${rel(from, p.page)}"><img src="${img(from, p.img)}" alt="${esc(n)}" loading="lazy"></a><h3>${esc(n)}</h3><div class="gp-btns gp-btns--center">${btn('제품 보기', rel(from, p.page), 'gp-btn--sm')}${btn('구매처 보기', '#', 'gp-btn--line gp-btn--sm')}</div></div>`;
  }).join('')}</div>`;

const ingCards = (from, items, cls = '') =>
  `<div class="gp-grid gp-grid--${items.length === 4 ? 4 : 3}" ${cls}>${items.map(([n, d]) =>
    `<div class="gp-card" data-ing="${esc(n)}"><div class="gp-card__body"><h3>${esc(n)}</h3><p>${esc(d)}</p>${btn('성분 자세히 보기', rel(from, 'ingredients/panthenol'), 'gp-btn--line gp-btn--sm')}</div></div>`).join('')}</div>`;

const faqList = (items) =>
  `<div class="gp-faq">${items.map(([q, a]) => `<div class="gp-faq__item"><div class="gp-faq__q"><span class="gp-faq__mark">Q</span>${esc(q)}</div><div class="gp-faq__a"><span class="gp-faq__mark">A</span>${esc(a)}</div></div>`).join('')}</div>`;

const articleCards = (from, items, target, btnLabel = '읽어보기') =>
  `<div class="gp-grid gp-grid--3">${items.map((c) =>
    `<div class="gp-card">${c.ph ? `<div class="gp-card__img">${esc(c.ph)}</div>` : ''}<div class="gp-card__body">${tags(c.tags)}<h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p>${btn(btnLabel, rel(from, target), 'gp-btn--line gp-btn--sm')}</div></div>`).join('')}</div>`;

function shell(from, title, body, desc = '') {
  const pre = '../'.repeat(depthOf(from));
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | Dr.G</title>
<meta name="description" content="${esc(desc || title)}">
<link rel="icon" href="${img(from, 'favicon.png') || pre + 'assets/favicon.png'}">
<link rel="stylesheet" href="${pre}assets/gpages.css">
</head>
<body class="gp">
<header></header>
${body}
<footer></footer>
<script src="${pre}assets/gpages.js"></script>
</body>
</html>
`;
}
const write = (from, title, body, desc) => {
  const dir = path.join(SITE, from);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), shell(from, title, body, desc));
  console.log('page', from || '(home)');
};

/* ---------- 공통 데이터 ---------- */
const CONCERNS = [
  ['건조', '건조하고 당김', '세안 후 피부가 당기거나 쉽게 건조해지는 고민'],
  ['트러블', '트러블과 과다 피지', '번들거림과 반복되는 트러블 고민'],
  ['민감', '민감한 피부와 자극', '붉어짐과 따가움, 자극이 쉬운 고민'],
  ['자외선', '칙칙한 피부톤', '자외선과 색소 침착으로 인한 피부톤 고민'],
  ['밸런스', '유수분 밸런스', 'T존은 번들, 볼은 건조한 고민'],
  ['탄력', '잔주름·탄력 저하', '잔주름과 탄력 변화 고민'],
];
const CONCERN_ICON = { '건조하고 당김': '건조', '트러블과 과다 피지': '트러블', '민감한 피부와 자극': '민감', '칙칙한 피부톤': '자외선', '유수분 밸런스': '밸런스', '잔주름·탄력 저하': '탄력' };
const ING = [['판테놀', '보습·진정'], ['세라마이드', '보습 · 장벽'], ['히알루론산', '보습'], ['병풀 추출물', '진정'], ['나이아신아마이드', '피부톤 관리'], ['살리실릭애씨드', '각질 관리']];
const SEASON_CARDS = [
  { ph: 'WINTER', tags: ['건조하고 당김', '판테놀'], title: '겨울 보습 루틴', desc: '수분과 유분 단계를 나눠 쌓는 보습 순서.' },
  { ph: 'INDOOR', tags: ['유수분 밸런스'], title: '실내 난방이 강할 때', desc: '건조한 실내에서 수분 손실을 줄이는 방법.' },
  { ph: 'WIND', tags: ['민감한 피부와 자극', '병풀 추출물'], title: '찬 바람에 붉어질 때', desc: '외출 후 자극을 줄이는 관리.' },
];
const KNOW = [
  ['유수분 밸런스', '피부 구조 이해하기', '각질층이 하는 역할을 쉽게 설명합니다.'],
  ['트러블과 과다 피지', '올바른 세안', '횟수, 온도, 거품 사용법.'],
  ['건조하고 당김', '보습의 기본', '보습제 바르는 순서와 양.'],
  ['칙칙한 피부톤', '자외선 차단의 기본', 'SPF와 PA의 의미.'],
  ['민감한 피부와 자극', 'pH와 피부 장벽', '약산성 환경이 중요한 이유.'],
  ['건조하고 당김', '스킨케어 순서 한눈에', '단계별 순서 정리.'],
];
const KNOW_SLUG = 'skin-knowledge/dry-skin-care';

/* =========================== 메인 =========================== */
{
  const F = '';
  const concerns = `<div class="gp-grid gp-grid--6">${CONCERNS.map(([ic, name]) =>
    `<a class="gp-concern" href="${rel(F, 'skin-concerns/dry')}"><div class="gp-concern__icon">${ICON[ic] || ic}</div><span>${name}</span></a>`).join('')}</div>`;
  const season = `<div class="gp-grid gp-grid--3">${[
    ['WINTER', ['건조하고 당김'], '겨울 · 한파와 난방', '찬 바람과 실내 난방으로 약해지기 쉬운 장벽을 지키는 보습 관리.'],
    ['INDOOR', ['유수분 밸런스'], '실내 난방이 강할 때', '공기가 건조한 실내에서 수분 손실을 줄이는 방법.'],
    ['ROUTINE', ['건조하고 당김', '민감한 피부와 자극'], '겨울 보습 루틴', '수분과 유분 단계를 나눠 쌓는 보습 순서를 알려드립니다.'],
  ].map(([ph, t, h, d]) => `<div class="gp-card"><div class="gp-card__img">${ph}</div><div class="gp-card__body">${tags(t)}<h3>${h}</h3><p>${d}</p>${btn('읽어보기', rel(F, 'seasonal-care/winter-moisture'), 'gp-btn--line gp-btn--sm')}</div></div>`).join('')}</div>`;
  const lines = `<div class="gp-grid gp-grid--3">${[
    ['수딩 크림 · 튜브형', '레드 블레미쉬 클리어 수딩 크림 EX', '피부 진정과 수분·장벽 케어를 위한 수딩 크림', ['민감한 피부와 자극', '트러블과 과다 피지'], 'red-blemish-clear-soothing-creamtexturex3.jpg', 'our-products/red-blemish-clear-soothing-cream'],
    ['수딩 크림 · 단지형', '레드 블레미쉬 클리어 수딩 크림', '수분을 공급하고 진정을 돕는 매일의 보습 크림', ['건조하고 당김'], 'red-blemish-soothing-cream.jpg', 'our-products/red-blemish-clear-soothing-cream'],
    ['선크림', '레드 블레미쉬 수딩 업 선', '자외선 차단에 수분 진정 케어를 더한 선크림', ['칙칙한 피부톤'], 'red-blemish-soothing-up-sun.jpg', 'our-products/red-blemish-soothing-up-sun'],
  ].map(([cat, name, d, t, im, pg]) => {
    const src = img(F, im) || img(F, 'red-blemish-soothing-cream.jpg');
    return `<div class="gp-card"><img class="gp-product__img" src="${src}" alt="${name}" loading="lazy"><div class="gp-card__body"><span class="gp-product__cat">${cat}</span><h3>${name}</h3><p>${d}</p>${tags(t)}<div class="gp-btns">${btn('제품 상세', rel(F, pg), 'gp-btn--sm')}${btn('구매처 보기', '#', 'gp-btn--line gp-btn--sm')}</div></div></div>`;
  }).join('')}</div>`;
  const ingr = `<div class="gp-grid gp-grid--4">${ING.slice(0, 3).concat([['병풀 추출물', '피부 진정 성분']]).map(([n, d], i) => {
    const desc = ['보습·진정 성분', '피부 장벽 보습 성분', '수분을 머금는 보습 성분', '피부 진정 성분'][i];
    const name = ['판테놀', '세라마이드', '히알루론산', '병풀 추출물'][i];
    return `<div class="gp-card" data-ing="${name}"><div class="gp-card__body"><h3>${name}</h3><p>${desc}</p>${btn('성분 자세히 보기', rel(F, 'ingredients/panthenol'), 'gp-btn--line gp-btn--sm')}</div></div>`;
  }).join('')}</div>`;

  const body = `
<section class="gp-hero">
<img src="assets/photos/hero_home.jpg" alt="">
<div class="gp-hero__msg">
<span class="gp-eyebrow" style="color:#fff">DR.G · SKIN CARE HUB</span>
<h1>피부과학으로 이해하고,<br>건강한 변화를 만듭니다.</h1>
<span class="gp-hero__accent"></span>
<p>내 피부 고민부터 알아보세요. 고민을 선택하면 관리 방법과 관련 성분, 제품까지 이어서 확인할 수 있습니다.</p>
<div class="gp-btns">${btn('고민별 관리 보기', rel(F, 'skin-concerns'), 'gp-btn--white gp-btn--lg')}${btn('G:ROW 시작하기', rel(F, 'grow'), 'gp-btn--ghost gp-btn--lg')}</div>
</div>
</section>
${sec(`<div class="gp-head"><span class="gp-eyebrow">SKIN CONCERNS</span><h2 class="gp-h2">어떤 피부 고민이 있나요?</h2><p class="gp-lead">고민을 선택하면 고민별 관리로 바로 이동합니다.</p></div>${concerns}`, { pt: 64, pb: 64 })}
${sec(`<div class="gp-head"><span class="gp-eyebrow">THIS SEASON</span><h2 class="gp-h2">이번 계절 관리</h2><p class="gp-lead">지금 시기에 맞는 관리 글을 모았습니다.</p></div>${season}<div class="gp-btns gp-btns--center">${btn('더 보기 → 계절별 관리', rel(F, 'seasonal-care'), 'gp-btn--lg')}</div>`, { bg: 'mint' })}
${sec(`<div class="gp-head"><span class="gp-eyebrow">SIGNATURE LINE</span><h2 class="gp-h2">대표 제품 라인</h2><p class="gp-lead">라인별 대표 제품과 잘 맞는 고민을 확인하세요.</p></div>${lines}`)}
${sec(`<div class="gp-head"><span class="gp-eyebrow">INGREDIENT DICTIONARY</span><h2 class="gp-h2">성분 사전</h2><p class="gp-lead">궁금한 성분을 검색하거나 대표 성분부터 살펴보세요.</p></div>${searchBox('성분 이름을 검색해 보세요 (예: 판테놀)')}${ingr}`, { bg: 'mint', pt: 100, pb: 100 })}
${sec(`<div class="gp-grow"><div class="gp-grow__txt"><span class="gp-eyebrow" style="color:#fff">G:ROW</span><h2>정보를 본 뒤에는<br>G:ROW로 계속 관리하세요</h2><p>6문항 설문이나 로이와의 대화로 시작해, 매일 기록하고 리포트로 변화를 확인합니다.</p><div class="gp-grow__flow"><span>설문 · 로이와 대화</span><em>→</em><span>기록</span><em>→</em><span>리포트</span></div><div class="gp-btns">${btn('G:ROW 시작하기', rel(F, 'grow'), 'gp-btn--white gp-btn--lg')}${btn('앱 내려받기', rel(F, 'grow') + '#download', 'gp-btn--ghost gp-btn--lg')}</div></div><div class="gp-qr">QR CODE</div></div>`, { bg: 'green' })}
${sec(`<div class="gp-two"><div><div class="gp-two__head"><h2>전문의 영상</h2>${btn('더 보기', rel(F, 'expert-videos'), 'gp-btn--line gp-btn--sm')}</div><a class="gp-video" href="${rel(F, 'expert-videos')}"><div class="gp-video__thumb"><span class="gp-play">▶</span></div><div class="gp-video__body">${tags(['건조하고 당김', '세라마이드'])}<h3>세안 후 당김, 이렇게 관리해요</h3><small>전문의 · 4:32</small></div></a></div><div><div class="gp-two__head"><h2>피부 상식</h2>${btn('더 보기', rel(F, 'skin-knowledge'), 'gp-btn--line gp-btn--sm')}</div><div class="gp-rows">${[['기초 지식', '피부 구조 이해하기'], ['세안', '올바른 세안'], ['보습', '보습의 기본'], ['자외선 차단', '자외선 차단의 기본']].map(([t, h]) => `<a class="gp-row" href="${rel(F, KNOW_SLUG)}"><span class="gp-tag">${t}</span><b>${h}</b><i>→</i></a>`).join('')}</div></div></div>`)}
${sec(`<div class="gp-story"><div><span class="gp-eyebrow">BRAND STORY</span><h2>피부과 전문의의 연구에서<br>시작된 브랜드</h2><p class="gp-lead">피부과 전문의가 임상 현장에서 마주한 피부 고민을 출발점으로, 피부과학을 바탕으로 한 관리 원칙을 세워 제품과 정보를 만듭니다</p>${btn('브랜드 이야기 보기', rel(F, 'drg-story'), 'gp-btn--lg')}</div><div class="gp-summary"><small>창업 배경 요약</small><div class="gp-dot">피부과 전문의가 창업한 브랜드</div><div class="gp-dot">피부과학을 바탕으로 한 관리 원칙</div><div class="gp-dot">매일 쓰는 피부 관리를 함께 설계</div></div></div>`, { bg: 'mint' })}
`;
  write(F, 'Dr.G - 피부과학으로 이해하는 스킨케어', body, '피부과학으로 이해하고, 건강한 변화를 만듭니다. Dr.G 스킨케어 허브.');
}

/* =========================== 라인별 제품 =========================== */
{
  const F = 'product-lines';
  const body = `${LINES(F, F)}${titleBlock('제품 라인')}
${sec(pills(['레드 블레미쉬', '로얄 블랙스네일', '클렌징', '그린 마일드 업']), { pt: 0, pb: 24 })}
${sec(`<div class="gp-split"><div style="display:flex;flex-direction:column;gap:14px"><span class="gp-eyebrow">레드 블레미쉬</span><h2 class="gp-h2">붉고 예민해진 피부를 위한 진정 라인</h2><p class="gp-lead">피부 진정과 수분 케어를 콘셉트로, 예민해진 피부를 편안하게 관리하는 라인입니다.</p>${tags(['민감한 피부', '트러블'])}<p style="font-size:14px;font-weight:500">핵심 성분 · 시카 콤플렉스 · 판테놀</p></div><img src="${img(F, 'red-blemish-soothing-cream.jpg')}" alt="레드 블레미쉬" style="height:280px;width:100%;object-fit:contain;background:#fff"></div>`, { bg: 'mint' })}
${sec(`${shead('라인 제품', '사용 순서대로 만나보세요')}<div class="gp-grid gp-grid--3 gp-grid--g32">${[
    ['STEP 1', '닥터지 레드 블레미쉬 클리어 수딩 크림 70ml'],
    ['STEP 2', '닥터지 레드 블레미쉬 클리어 히알 시카 수딩 세럼 50ml'],
    ['STEP 3', '닥터지 레드 블레미쉬 수딩 업 선 50ml']].map(([s, n]) => {
    const p = prod(n);
    return `<div class="gp-item"><img src="${img(F, p.img)}" alt="${n}" loading="lazy"><span class="gp-eyebrow gp-eyebrow--red">${s}</span><h3>${n}</h3><div class="gp-btns gp-btns--center">${btn('제품 보기', rel(F, p.page), 'gp-btn--sm')}${btn('구매처 보기', '#', 'gp-btn--line gp-btn--sm')}</div></div>`;
  }).join('')}</div>`)}
${sec(`${shead('이 라인으로 만든 루틴', '고민별 관리에서 아침·저녁 루틴을 확인하세요.')}<div class="gp-btns gp-btns--center">${btn('루틴 보기', rel(F, 'skin-concerns/dry') + '#routine', 'gp-btn--lg')}</div>`, { bg: 'mint', pt: 56, pb: 56 })}`;
  write(F, '라인별 제품', body, '닥터지 제품 라인과 사용 순서를 확인하세요.');
}

/* =========================== 고민별 관리 =========================== */
{
  const F = 'skin-concerns';
  const items = `<div class="gp-grid gp-grid--3 gp-grid--g32">${CONCERNS.map(([, name, d]) =>
    `<div class="gp-item gp-item--left"><div class="gp-item__ph">CONCERN</div><h3>${name}</h3><p>${d}</p>${btn('관리 방법 보기', rel(F, 'skin-concerns/dry'), 'gp-btn--sm')}</div>`).join('')}</div>`;
  write(F, '고민별 관리', `${CARE(F, F)}${titleBlock('고민별 관리', '지금 느끼는 피부 고민을 선택해 보세요.')}${sec(items, { pt: 0, pb: 56 })}`, '지금 느끼는 피부 고민을 선택해 관리 방법을 확인하세요.');
}
{
  const F = 'skin-concerns/dry';
  const prods = ['닥터지 로얄 블랙스네일 크림 50ml', '닥터지 그린딥 포어 클렌징밤 100ml', '닥터지 레드 블레미쉬 10-시카 캡슐 수딩 토너 300ml'];
  const steps = [['01', '순한 세안', '미지근한 물로 짧게 세안합니다.'], ['02', '보습 유지', '세안 직후 보습 단계를 바로 이어갑니다.'], ['03', '환경 관리', '실내 습도를 적당히 유지합니다.']];
  const body = `${CARE(F, 'skin-concerns')}${titleBlock('건조하고 당김', '세안 후 피부가 당기거나 쉽게 건조해지는 고민')}
${sec(`${shead('고민 설명')}<p class="gp-lead gp-center">피부 수분이 부족하고 장벽이 약해지면 세안 후 당김이 느껴질 수 있습니다. 겨울철, 실내 난방 환경, 잦은 세안 후 자주 생깁니다.</p>`, { bg: 'mint' })}
${sec(`${shead('관리 방법')}<div class="gp-grid gp-grid--3">${steps.map(([n, h, d]) => `<div class="gp-step"><b>${n}</b><i></i><h3>${h}</h3><p>${d}</p></div>`).join('')}</div>`)}
${sec(`${shead('루틴')}<div class="gp-grid gp-grid--2 gp-grid--g32">${[['아침', '세안 → 토너 → 크림 → 자외선 차단'], ['저녁', '클렌징 → 토너 → 세럼 → 크림']].map(([t, r]) => `<div class="gp-tile"><small>${t}</small><strong>${r}</strong></div>`).join('')}</div>`, { bg: 'mint', id: 'routine' })}
${sec(`${shead('관련 제품')}${productItems(F, prods)}`)}
${sec(`${shead('관련 성분')}${ingCards(F, [['판테놀', '보습과 진정을 돕는 성분'], ['세라마이드', '피부 장벽을 이루는 지질 성분'], ['히알루론산', '수분을 머금는 성분']])}`, { bg: 'mint' })}
${sec(`${shead('관련 콘텐츠')}<div class="gp-xlinks"><a href="${rel(F, 'seasonal-care/winter-moisture')}">계절별 관리 → 겨울 보습</a><a href="${rel(F, 'expert-videos')}">전문의 영상 → 세안 후 당김</a><a href="${rel(F, KNOW_SLUG)}">피부 상식 → 보습의 기본</a></div>`, { pt: 48, pb: 48 })}
${sec(`<div class="gp-guide"><h2>이 고민의 변화를 기록해 보세요</h2>${btn('G:ROW 시작하기', rel(F, 'grow'), 'gp-btn--white')}</div>`, { bg: 'mint', pt: 56, pb: 80 })}`;
  write(F, '건조하고 당김 | 고민별 관리', body, '세안 후 피부가 당기거나 쉽게 건조해지는 고민의 관리 방법.');
}

/* =========================== 성분 사전 =========================== */
{
  const F = 'ingredients';
  const body = `${CARE(F, F)}${titleBlock('성분 사전', '성분 이름으로 찾거나 역할별로 살펴보세요.')}
${sec(`${searchBox('성분 이름을 검색해 보세요')}<div class="gp-chips">${['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'].map((c) => `<button class="gp-chip" type="button">${c}</button>`).join('')}</div>`, { pt: 0, pb: 24 })}
${sec(pills(['전체', '보습', '진정', '각질 관리', '자외선 차단']), { pt: 16, pb: 24 })}
${sec(`${shead('자주 찾는 성분')}${ingCards(F, ING)}`, { bg: 'mint', pb: 80 })}`;
  write(F, '성분 사전', body, '성분 이름으로 찾거나 역할별로 살펴보는 닥터지 성분 사전.');
}
{
  const F = 'ingredients/panthenol';
  const body = `${CARE(F, 'ingredients')}${titleBlock('판테놀', '보습과 진정을 돕는 성분')}
${sec(`${shead('성분 설명')}<p class="gp-lead gp-center">판테놀은 피부에 수분을 공급하고 건조하고 예민한 피부를 편안하게 가꾸는 데 쓰이는 성분입니다. 역할: 보습 · 진정</p>`, { bg: 'mint' })}
${sec(`${shead('들어간 제품')}${productItems(F, ['닥터지 레드 블레미쉬 클리어 수딩 크림 70ml', '닥터지 레드 블레미쉬 클리어 히알 시카 수딩 세럼 50ml', '닥터지 그린딥 포어 클렌징밤 100ml'])}`, { bg: 'mint' })}
${sec(`${shead('관련 콘텐츠', '이 성분 태그가 붙은 영상·글')}<div class="gp-grid gp-grid--2">${[['환절기 피부 장벽 지키는 법', 'expert-videos', '보기'], ['보습의 기본', KNOW_SLUG, '보기']].map(([t, to, b]) => `<div class="gp-card"><div class="gp-card__body">${tags(['판테놀'])}<h3>${t}</h3>${btn(b, rel(F, to), 'gp-btn--line gp-btn--sm')}</div></div>`).join('')}</div>`, { pb: 80 })}`;
  write(F, '판테놀 | 성분 사전', body, '판테놀 성분 설명과 들어간 제품.');
}

/* =========================== 계절별 관리 =========================== */
{
  const F = 'seasonal-care';
  const body = `${CARE(F, F)}${titleBlock('계절별 관리', '계절과 환경이 바뀔 때의 관리 방법')}
${sec(pills(['겨울', '봄', '여름', '가을']), { pt: 0, pb: 16 })}
${sec(`${shead('겨울, 피부가 겪는 환경 변화')}<p class="gp-lead gp-center">찬 바람과 낮은 습도, 실내 난방으로 수분 손실이 늘고 피부 장벽이 약해지기 쉽습니다.</p>`, { bg: 'mint' })}
${sec(`${shead('관리 글')}${articleCards(F, SEASON_CARDS, 'seasonal-care/winter-moisture')}`, { pb: 80 })}`;
  write(F, '계절별 관리', body, '계절과 환경이 바뀔 때의 피부 관리 방법.');
}
{
  const F = 'seasonal-care/winter-moisture';
  const body = `${CARE(F, 'seasonal-care')}${titleBlock('겨울 보습 루틴', '계절별 관리 · 겨울')}
${sec(`<p class="gp-body" style="font-size:17px">겨울에는 세안 후 곧바로 보습 단계를 이어가고, 수분 단계와 유분 단계를 나눠 쌓는 것이 좋습니다. 실내 습도도 함께 관리해 주세요.</p><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span style="font-size:13px;color:var(--mute)">태그</span>${['건조하고 당김', '판테놀', '세라마이드'].map((t) => `<span class="gp-tag">${t}</span>`).join('')}</div>`, { pt: 8, pb: 48 })}
${sec(`${shead('관련 제품')}${productItems(F, ['닥터지 로얄 블랙스네일 크림 50ml', '닥터지 그린딥 포어 클렌징밤 100ml', '닥터지 레드 블레미쉬 10-시카 캡슐 수딩 토너 300ml'])}`, { bg: 'mint', pb: 80 })}`;
  write(F, '겨울 보습 루틴 | 계절별 관리', body, '겨울철 수분과 유분 단계를 나눠 쌓는 보습 루틴.');
}

/* =========================== 전문의 영상 =========================== */
{
  const F = 'expert-videos';
  const vids = [
    ['민감한 피부와 자극', '판테놀', '환절기 피부 장벽 지키는 법', '전문의 · 5:10'],
    ['칙칙한 피부톤', null, '자외선 차단제, 올바르게 바르기', '전문의 · 3:48'],
    ['트러블과 과다 피지', null, '트러블 피부의 세안 순서', '전문의 · 6:02'],
  ];
  const body = `${CARE(F, F)}${titleBlock('전문의 영상', '전문의가 설명하는 피부 관리 영상')}
${sec(`<div class="gp-feature"><div class="gp-feature__thumb"><span class="gp-play">▶</span></div><div class="gp-feature__info"><span class="gp-eyebrow gp-eyebrow--red">추천 영상</span><h2>세안 후 당김, 이렇게 관리해요</h2><small>전문의 · 4:32</small>${tags(['건조하고 당김', '세라마이드'])}${btn('영상 보기', '#', '')}</div></div>`, { pt: 0, pb: 32 })}
${sec(pills(['전체', '고민별', '성분별']), { pt: 8, pb: 16 })}
${sec(`<div class="gp-grid gp-grid--3">${vids.map(([t1, t2, h, m]) => `<div class="gp-vcard"><div class="gp-vcard__thumb"><span class="gp-play gp-play--sm">▶</span></div><div class="gp-vcard__body">${tags([t1].concat(t2 ? [t2] : []))}<h3>${h}</h3><p>전문의가 알려주는 관리 방법</p><small>${m}</small></div></div>`).join('')}</div>`, { bg: 'mint', pb: 80 })}`;
  write(F, '전문의 영상', body, '전문의가 설명하는 피부 관리 영상.');
}

/* =========================== 피부 상식 =========================== */
{
  const F = 'skin-knowledge';
  const body = `${CARE(F, F)}${titleBlock('피부 상식', '매일의 관리를 위한 기초 지식')}
${sec(pills(['전체', '피부 구조', '세안', '보습', '자외선 차단']), { pt: 0, pb: 16 })}
${sec(`<div class="gp-grid gp-grid--3">${KNOW.map(([t, h, d]) => `<div class="gp-card"><div class="gp-card__body">${tags([t])}<h3>${h}</h3><p>${d}</p>${btn('읽어보기', rel(F, KNOW_SLUG), 'gp-btn--line gp-btn--sm')}</div></div>`).join('')}</div>`, { bg: 'mint', pb: 80 })}`;
  write(F, '피부 상식', body, '매일의 관리를 위한 기초 지식.');
}
{
  const F = KNOW_SLUG;
  const toc = [['01', '건조한 피부의 주된 원인'], ['02', '건조한 피부를 위한 핵심 성분'], ['03', '닥터지 건조 피부 루틴'], ['04', '루틴 따라하기'], ['05', '참고 및 출처'], ['06', '자주 묻는 질문']];
  const anchor = ['cause', 'ingredients', 'routine-table', 'follow', 'refs', 'faq'];
  const sh = (n, t) => `<div class="gp-sh"><b>${n}</b><h2>${t}</h2></div>`;
  const routineRows = [
    ['제품', '닥터지 브라이트닝 필링젤', '닥터지 레드 블레미쉬 클리어 수딩 크림', '닥터지 그린 마일드 업 선 플러스'],
    ['효과', '부드럽게 각질을 정리해 수분이 잘 스며들도록 돕습니다.', '수분을 채우고 피부 장벽을 단단하게 합니다.', '자외선과 외부 자극으로부터 피부를 지킵니다.'],
    ['주요 성분', '코튼 셀룰로오스', '시카 복합체 10종', '100% 미네랄 자외선 차단 성분, 징크옥사이드, 엑토인'],
    ['사용 빈도', '건조한 피부는 주 1회', '아침 · 저녁', '매일 아침'],
    ['검증 결과', '1회 사용 후 각질 -74%, 매끄러움 +18.8%, 헹군 뒤에도 수분 +13.5%†', '수분 +100시간, 붉은기 -64%, 열감 -6°C†', '민감한 피부 대상 순한 사용감 시험 완료‡'],
  ];
  const faq = [
    ['건조한 피부에는 어떤 제품이 좋나요?', '순한 세안제와, 글리세린 · 히알루론산 같은 수분 성분과 세라마이드 같은 지질 성분을 함께 담은 보습제를 아침저녁으로 쓰세요.'],
    ['내 피부가 건성인지 수분 부족인지 어떻게 알 수 있나요?', '하루 종일 거칠고 당기면 건성, 세안 후에 주로 당기면 수분 부족일 가능성이 큽니다. 대부분은 둘 다 필요합니다.'],
    ['보습제는 얼마나 자주 발라야 하나요?', '아침과 저녁, 하루 두 번 바르는 것이 기본입니다. 세안 직후 바로 바르면 좋습니다.'],
    ['건조한 피부를 촉촉하게 하는 성분은 무엇인가요?', '글리세린 · 히알루론산 · 판테놀은 수분을 끌어오고, 세라마이드 · 스쿠알란은 수분을 붙잡아 줍니다.'],
    ['건조한 피부에도 닥터지 브라이트닝 필링젤을 써도 되나요?', '주 1회 정도로 가볍게 쓰세요. 피부가 이미 일어나 있는 주에는 횟수를 줄이는 것이 좋습니다.'],
    ['건조한 피부라면 닥터지 제품 중 무엇부터 써야 하나요?', '레드 블레미쉬 클리어 수딩 크림부터 시작하고, 아침에는 그린 마일드 업 선 플러스로 마무리하세요.'],
  ];
  const body = `${CARE(F, 'skin-knowledge')}${titleBlock('건조한 피부 관리, 실제로 효과 있는 방법', '피부 상식 · 보습')}
${sec(`<div class="gp-summary-box"><small>한눈에 보기</small><p class="gp-body">건조한 피부에는 순한 세안제와, 수분을 끌어오고 붙잡아 주는 보습제를 아침저녁으로 쓰는 것이 기본입니다. 건조함은 보통 피부 장벽에 지질이 부족해서 생기고, 뜨거운 물과 강한 세안제가 이를 더 악화시킵니다.</p></div><div class="gp-toc"><strong>이 글의 목차</strong>${toc.map(([n, t], i) => `<a href="#${anchor[i]}"><b>${n}</b>${t}</a>`).join('')}</div>`, { wrap: 'gp-wrap--narrow', pt: 8, pb: 56, })}
${sec(`${sh('01', '건조한 피부의 주된 원인')}<p class="gp-body">건조한 피부는 수분을 붙잡아 두는 지질이 피부 장벽에서 부족해질 때 생깁니다. 이 지질은 30대 후반부터 자연스럽게 줄어들고, 뜨거운 물, 자극이 센 거품 세안제, 건조한 실내 환경이 이를 더 빠르게 줄입니다.</p><p class="gp-body">세안제 선택도 중요합니다. 건조한 피부를 대상으로 한 임상시험에서 순한 세안제로 바꾸는 것만으로 건조함이 좋아졌고, 보습제를 더하자 훨씬 더 좋아졌습니다.</p><div class="gp-cmp"><div><h3>건성 피부</h3><p>지질이 부족한 상태입니다. 하루 종일 거칠고 당기는 느낌이 듭니다.</p></div><div><h3>수분 부족 피부</h3><p>수분이 부족한 상태입니다. 주로 세안 후에 당기며, 지성 피부에도 생길 수 있습니다.</p></div></div><p class="gp-body">대부분의 건조한 피부는 수분과, 그 수분을 붙잡는 지질이 모두 필요합니다.</p>`, { wrap: 'gp-wrap--narrow', pt: 48, pb: 56, id: 'cause' })}
${sec(`<div style="display:flex;flex-direction:column;gap:16px;max-width:800px">${sh('02', '건조한 피부를 위한 핵심 성분')}<p class="gp-body">건조한 피부에 좋은 성분은 짝으로 작용합니다. 수분 성분은 피부에 물을 끌어오고, 지질 성분은 그 물을 붙잡아 줍니다. 붉어지거나 따가울 때는 진정 성분을 더한 제품이 도움이 됩니다.</p></div>${ingCards(F, [['글리세린', '수분을 끌어오는 보습 성분'], ['히알루론산', '수분을 끌어오는 보습 성분'], ['판테놀', '수분을 끌어오고 피부를 편안하게'], ['세라마이드', '장벽에서 줄어드는 지질을 보충'], ['스쿠알란', '가볍게 덮어 수분을 지켜 줌'], ['시카', '예민하게 반응하는 건조 피부를 진정']])}<div class="gp-call"><small>임상시험 사례</small><p>피부가 중등도~심한 건조 상태인 성인 52명을 대상으로 2주간 진행한 시험에서, 순한 세안제와 글리세린이 풍부한 보습제를 하루 두 번 쓴 쪽이 세안제만 쓴 쪽보다 건조함이 더 크게 개선되었습니다.</p></div><div class="gp-btns gp-btns--center">${btn('성분 사전 보기', rel(F, 'ingredients'), 'gp-btn--line')}</div>`, { bg: 'mint', id: 'ingredients' })}
${sec(`${sh('03', '닥터지 건조 피부 루틴')}<table class="gp-table"><thead><tr><th></th><th>1단계 · 준비</th><th>2단계 · 진정</th><th>3단계 · 보호</th></tr></thead><tbody>${routineRows.map(([h, a, b, c]) => `<tr><th scope="row">${h}</th><td>${a}</td><td>${b}</td><td>${c}</td></tr>`).join('')}</tbody></table><p class="gp-note">닥터지 필링젤은 주 1~2회 사용을 권장합니다.</p>`, { id: 'routine-table' })}
${sec(`${shead('루틴 따라하기', '준비 · 진정 · 보호, 닥터지 3단계를 순서대로 따라해 보세요.')}<div class="gp-grid gp-grid--3">${[
    ['1단계 · 준비', '닥터지 브라이트닝 필링젤', '주 1~2회'],
    ['2단계 · 진정', '닥터지 레드 블레미쉬 클리어 수딩 크림', '아침 · 저녁'],
    ['3단계 · 보호', '닥터지 그린 마일드 업 선 플러스', '매일 아침']].map(([s, n, f]) => `<div class="gp-card"><div class="gp-card__img" style="height:200px">${s}</div><div class="gp-card__body" style="gap:8px"><h3 style="font-size:18px">${n}</h3><p>${f}</p>${btn('제품 보기', rel(F, prod(n).page), 'gp-btn--line gp-btn--sm')}</div></div>`).join('')}</div><div class="gp-btns gp-btns--center">${btn('루틴 보기', rel(F, 'skin-concerns/dry') + '#routine')}</div>`, { bg: 'mint', id: 'follow' })}
${sec(`${sh('05', '참고 및 출처')}<p class="gp-note">† 닥터지 임상시험 자료(보관 중).</p><p class="gp-note">‡ 그린 마일드 업 선 플러스: 피부과 테스트, 논코메도제닉, 민감한 피부, 저자극, 안자극, 소아 · 피부 시술 후 자극 시험 완료. 닥터지 임상시험 자료(보관 중).</p><p class="gp-note">[1] Kim 등: 연구자 눈가림 무작위 임상시험, 중등도~심한 건조 피부 52명, 2주, 세안제 + 보습제 하루 2회 대 세안제만 사용.</p><p class="gp-note">[2] Sherban, Wang: 병풀(시카) 관련 발표 연구를 정리한 리뷰입니다. 닥터지 제품을 시험한 연구는 아닙니다. (SKINmed, 2022)</p><p class="gp-note">[3] 지질은 30대 후반부터 줄어듭니다. (35th IFSCC Congress 2025 닥터지 포스터 발표 보도)</p>`, { wrap: 'gp-wrap--narrow', pt: 72, pb: 56, id: 'refs' })}
${sec(`${sh('06', '자주 묻는 질문')}${faqList(faq)}`, { bg: 'gray', wrap: 'gp-wrap--narrow', id: 'faq' })}
${sec(`${shead('다음에 읽을 글')}<div class="gp-grid gp-grid--2">${[['고민별 관리', '트러블이 잦은 피부를 위한 관리법', '글 읽기'], ['고민별 관리', '예민한 피부를 진정시키는 방법', '글 읽기'], ['루틴', '피부과에서 시작한 3단계 케어', '글 읽기']].map(([t, h, b]) => `<div class="gp-card"><div class="gp-card__body">${tags([t])}<h3>${h}</h3>${btn(b, rel(F, 'skin-knowledge'), 'gp-btn--line gp-btn--sm')}</div></div>`).join('')}</div><div class="gp-btns gp-btns--center">${btn('피부 상식 목록 보기', rel(F, 'skin-knowledge'), 'gp-btn--line')}</div>`)}`;
  write(F, '건조한 피부 관리, 실제로 효과 있는 방법 | 피부 상식', body, '건조한 피부 원인과 성분, 닥터지 루틴을 정리한 피부 상식.');
}

/* =========================== G:ROW =========================== */
{
  const F = 'grow';
  const steps = (arr) => `<div class="gp-grid gp-grid--3">${arr.map(([n, h, d]) => `<div class="gp-step"><b>${n}</b><i></i><h3>${h}</h3><p>${d}</p></div>`).join('')}</div>`;
  const body = `
${sec(`<div class="gp-growhero"><div><h1>G:ROW</h1><p>내 피부를 알아가고 이어서 관리하는 앱</p><div class="gp-btns">${btn('앱 내려받기', '#download', 'gp-btn--white gp-btn--lg')}</div></div><div class="gp-app">APP SCREEN</div></div>`, { pt: 0, pb: 0, wrap: '' })}
${sec(`${shead('핵심 경험')}${steps([['01', '가볍게 시작하기', '부담 없이 몇 가지 질문으로 시작해요.'], ['02', '함께 알아가기', '로이와 대화하며 내 피부를 이해해요.'], ['03', '이해하고 이어가기', '기록과 리포트로 관리를 이어가요.']])}`)}
${sec(`${shead('시작하는 방법')}${steps([['01', '6문항 설문 또는 로이와 대화', '현재 피부 상태를 알려주세요.'], ['02', '매일 간단한 기록', '하루 1분, 피부 컨디션을 남겨요.'], ['03', '리포트 확인', '한 주의 변화를 확인해요.']])}`, { bg: 'mint' })}
${sec(`${shead('이런 분께')}<div class="gp-grid gp-grid--2">${[['고민이 생겼어요', '고민 발생형 · 지금 상태를 확인하고 관리 방향을 찾고 싶을 때'], ['꾸준히 관리하고 싶어요', '지속 관리형 · 매일 기록하며 변화를 이해하고 싶을 때']].map(([h, d]) => `<div class="gp-card"><div class="gp-card__body"><h3>${h}</h3><p>${d}</p></div></div>`).join('')}</div>`, { bg: 'mint', id: 'for' })}
${sec(`${shead('앱 내려받기')}<div class="gp-dl"><div class="gp-dl__qr">QR</div><div class="gp-dl__btns">${btn('App Store', '#')}${btn('Google Play', '#')}</div></div>`, { id: 'download' })}`;
  write(F, 'G:ROW', body, '내 피부를 알아가고 이어서 관리하는 앱 G:ROW.');
}

/* =========================== 고객센터 =========================== */
{
  const F = 'support';
  const cards = [['자', '자주 묻는 질문', '제품, 구매처, G:ROW 이용에 대해 자주 묻는 질문을 모았습니다.', '질문 보기', 'support/faq'], ['공', '공지사항', '서비스 소식과 운영 안내를 확인할 수 있습니다.', '공지 보기', 'support/notices'], ['문', '문의하기', '찾는 답이 없다면 문의를 남겨 주세요.', '문의하기', 'support/contact']];
  const body = `${SUPPORT(F, '')}${titleBlock('고객센터')}
${sec(searchBox('궁금한 질문을 검색해 보세요'), { pt: 0, pb: 32 })}
${sec(`${shead('무엇을 도와드릴까요?')}<div class="gp-grid gp-grid--3">${cards.map(([ic, h, d, b, to]) => `<div class="gp-card gp-menu-card"><div class="gp-ic">${ic}</div><h3>${h}</h3><p>${d}</p>${btn(b, rel(F, to), 'gp-btn--line gp-btn--sm')}</div>`).join('')}</div>`, { pt: 24, pb: 72 })}
${sec(`<p class="gp-sub" style="font-size:14px">답변까지는 영업일 기준 2~3일이 걸릴 수 있습니다. 구매 관련 문의는 각 구매처로 문의해 주세요.</p>`, { pt: 48, pb: 72 })}`;
  write(F, '고객센터', body, '자주 묻는 질문, 공지사항, 문의하기.');
}
{
  const F = 'support/faq';
  const faq = [
    ['제품은 어디에서 구매할 수 있나요?', '구매처 보기에서 외부 판매처를 확인하세요.'],
    ['G:ROW 앱은 무료인가요?', '기본 기능은 무료로 이용할 수 있습니다.'],
    ['피부가 민감한데 어떤 제품부터 써야 할까요?', '고민별 관리에서 고민을 선택해 확인하세요.'],
    ['제품 사용 중 피부가 붉어지면 어떻게 하나요?', '사용을 중단하고 증상이 계속되면 전문의와 상담하세요.'],
    ['제품 사용기한은 어떻게 확인하나요?', '제품 용기 하단 또는 포장 상자에서 확인할 수 있습니다.'],
    ['G:ROW 앱은 어디에서 내려받나요?', 'G:ROW 페이지의 앱 내려받기 버튼에서 이동할 수 있습니다.'],
    ['구매한 제품 교환·환불은 어디에 문의하나요?', '구매하신 판매처의 고객센터로 문의해 주세요.'],
  ];
  const body = `${SUPPORT(F, F)}${titleBlock('자주 묻는 질문')}
${sec(searchBox('궁금한 질문을 검색해 보세요', 'gp-search--on'), { pt: 8, pb: 24 })}
${sec(`${pills(['전체', '제품', '구매처', 'G:ROW', '기타'])}<div data-faq>${faqList(faq)}</div><div class="gp-btns gp-btns--center">${btn('더 보기', '#', 'gp-btn--line')}</div>`, { pt: 16, pb: 72 })}
${sec(`<p class="gp-callout-title">원하는 답을 찾지 못하셨나요?</p><div class="gp-btns gp-btns--center">${btn('문의하기', rel(F, 'support/contact'))}</div>`, { bg: 'mint', pt: 48, pb: 48 })}`;
  write(F, '자주 묻는 질문 | 고객센터', body, '제품, 구매처, G:ROW 이용에 대해 자주 묻는 질문.');
}
{
  const F = 'support/notices';
  const list = [['공지', 'G:ROW 앱 업데이트 안내', '2026.11.01'], ['안내', '고객센터 운영 안내', '2026.10.24'], ['공지', '개인정보처리방침 개정 안내', '2026.10.15'], ['안내', '구매처 목록 업데이트', '2026.10.02'], ['안내', '제품 패키지 변경 안내', '2026.09.20'], ['공지', '서비스 이용약관 개정 안내', '2026.09.05'], ['안내', '추석 연휴 고객센터 운영 안내', '2026.08.28'], ['공지', 'G:ROW 앱 점검 안내', '2026.08.12']];
  const body = `${SUPPORT(F, F)}${titleBlock('공지사항')}
${sec(`${pills(['전체', '공지', '안내'])}<div style="border-top:1px solid var(--line)">${list.map(([t, h, d]) => `<a class="gp-notice" href="${rel(F, 'support/notices/app-update')}"><span class="gp-tag">${t}</span><b>${h}</b><time>${d}</time></a>`).join('')}</div><div class="gp-pager"><a class="is-on" href="#">1</a><a href="#">2</a><a href="#">3</a></div>`, { pt: 8, pb: 72, wrap: '' })}`;
  write(F, '공지사항 | 고객센터', body, '서비스 소식과 운영 안내.');
}
{
  const F = 'support/notices/app-update';
  const body = `${SUPPORT(F, 'support/notices')}${titleBlock('공지사항')}
${sec(`<div class="gp-nhead"><span class="gp-tag">공지</span><h2>G:ROW 앱 업데이트 안내</h2><time>2026.11.01</time></div><div class="gp-nbody"><p>안녕하세요, 닥터지입니다.</p><p>G:ROW 앱이 더 편하게 바뀌었습니다. 이번 업데이트에서는 루틴 확인 화면을 정리하고 성분 정보를 보기 쉽게 개선했습니다.</p><p>업데이트는 앱 스토어에서 최신 버전으로 받으실 수 있습니다. 이용에 궁금한 점은 문의하기로 남겨 주세요.</p><p>감사합니다.</p></div><div class="gp-pn"><div><b>이전글</b><a href="${rel(F, 'support/notices/app-update')}">고객센터 운영 안내</a></div><div><b>다음글</b><span style="color:var(--mute)">다음 글이 없습니다.</span></div></div><div class="gp-btns gp-btns--center">${btn('목록으로', rel(F, 'support/notices'), 'gp-btn--line')}</div>`, { wrap: 'gp-wrap--narrow', pt: 8, pb: 72 })}`;
  write(F, 'G:ROW 앱 업데이트 안내 | 공지사항', body, 'G:ROW 앱 업데이트 안내.');
}
{
  const F = 'support/contact';
  const field = (l, ph, tag = 'input') => `<div class="gp-field"><label>${l}</label>${tag === 'textarea' ? `<textarea placeholder="${ph}"></textarea>` : tag === 'select' ? `<select><option value="">${ph}</option><option>제품</option><option>G:ROW</option><option>기타</option></select>` : `<input type="${tag === 'file' ? 'file' : 'text'}" placeholder="${ph}">`}</div>`;
  const body = `${SUPPORT(F, F)}${titleBlock('문의하기')}
${sec(`<form class="gp-form" data-contact>${field('문의 유형', '제품 · G:ROW · 기타 중 선택', 'select')}${field('이름', '이름을 입력해 주세요')}${field('이메일', '답변 받을 이메일')}${field('제목', '제목을 입력해 주세요')}${field('내용', '문의 내용을 자세히 적어 주세요', 'textarea')}${field('사진 첨부 (선택)', '', 'file')}<label class="gp-agree"><input type="checkbox" required>개인정보 수집·이용에 동의합니다. (필수)</label><div class="gp-btns gp-btns--center"><button class="gp-btn" type="submit">문의 접수하기</button></div></form>`, { wrap: 'gp-wrap--narrow', pt: 8, pb: 48 })}
${sec(`<p class="gp-info">구매·배송·교환 관련 문의는 구매하신 판매처로 문의해 주세요.</p>`, { bg: 'mint', pt: 40, pb: 40 })}`;
  write(F, '문의하기 | 고객센터', body, '찾는 답이 없다면 문의를 남겨 주세요.');
}

if (missing.size) console.log('MISSING IMAGES:', [...missing].join(', '));
