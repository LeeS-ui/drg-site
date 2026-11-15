// Figma "최종" 헤더/풋터를 모든 페이지에 적용 (여러 번 실행해도 안전)
import fs from 'node:fs';
import path from 'node:path';

const SITE = path.resolve(process.argv[2] || '../site');
const LOGO = 'assets/fdf7b26957_dr-g-logo--green.png';

const SEC = { 'our-products': 0, 'product-lines': 0, 'best-sellers': 0, 'skin-concerns': 1, 'ingredients': 1, 'seasonal-care': 1, 'expert-videos': 1, 'skin-knowledge': 1, 'doctors-advice': 1, 'grow': 2, 'drg-story': 3 };
function build(prefix, top) {
  const act = SEC[top]; const on = (i) => (act === i ? ' is-active' : '');
  const u = (p) => prefix + p;
  const header = `<header class="gdr-header${top ? ' gdr-header--sub' : ''}" role="banner">
<a class="gdr-header__logo" href="${u('index.html')}" aria-label="Dr.G 홈"><img src="${u(LOGO)}" alt="Dr.G"></a>
<nav class="gdr-header__nav" aria-label="주 메뉴">
<div class="gdr-header__item"><a class="gdr-header__link${on(0)}" href="${u('our-products/index.html')}">제품</a><div class="gdr-header__menu"><a href="${u('our-products/index.html')}">전체 제품</a><a href="${u('product-lines/index.html')}">라인별 제품</a></div></div>
<div class="gdr-header__item"><a class="gdr-header__link${on(1)}" href="${u('skin-concerns/index.html')}">피부 관리</a><div class="gdr-header__menu"><a href="${u('skin-concerns/index.html')}">고민별 관리</a><a href="${u('ingredients/index.html')}">성분 사전</a><a href="${u('seasonal-care/index.html')}">계절별 관리</a><a href="${u('expert-videos/index.html')}">전문의 영상</a><a href="${u('skin-knowledge/index.html')}">피부 상식</a></div></div>
<a class="gdr-header__link${on(2)}" href="${u('grow/index.html')}">G:ROW</a>
<a class="gdr-header__link${on(3)}" href="${u('drg-story/index.html')}">Dr.G 스토리</a>
</nav>
<div class="gdr-header__spacer"></div>
<a class="gdr-header__search" href="${u('search/index.html')}" aria-label="통합 검색"><em style="font-style:normal">통합 검색</em><span aria-hidden="true">⌕</span></a>
</header>`;
  const footer = `<footer class="gdr-footer">
<div class="gdr-footer__container">
<div class="gdr-footer__top">
<div class="gdr-footer__brand">
<img src="${u(LOGO)}" alt="Dr.G">
<p>닥터지는 누구나 건강하고 아름다운 피부를 유지할 수 있도록<br>피부과학에 기반한 진정성 있는 스킨케어 솔루션을 제시합니다.</p>
</div>
<div class="gdr-footer__help">
<h2>고객센터</h2>
<div class="gdr-footer__links"><a href="${u('support/faq/index.html')}">자주 묻는 질문</a><a href="${u('support/notices/index.html')}">공지사항</a><a href="${u('support/contact/index.html')}">문의하기</a></div>
<p>문의 답변은 영업일 기준 2~3일이 걸릴 수 있습니다. 구매 관련 문의는 각 구매처로 문의해 주세요.</p>
</div>
</div>
<div class="gdr-footer__bottom">
<span>© Dr.G. All rights reserved.</span>
<span class="gdr-footer__legal"><a href="${u('privacy-policy/index.html')}">개인정보처리방침</a><span>·</span><a href="#">이용약관</a></span>
</div>
</div>
</footer>`;
  return { header, footer };
}

let n = 0;
function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) { if (f.name !== 'assets') walk(p); continue; }
    if (f.name !== 'index.html') continue;
    let h = fs.readFileSync(p, 'utf8');
    const depth = path.relative(SITE, d).split(path.sep).filter(Boolean).length;
    const prefix = '../'.repeat(depth);
    const top = path.relative(SITE, d).split(path.sep).filter(Boolean)[0] || '';
    const { header, footer } = build(prefix, top);
    h = h.replace(/<header\b[\s\S]*?<\/header>/, () => header);
    h = h.replace(/<footer\b[\s\S]*?<\/footer>/, () => footer);
    if (!h.includes('assets/gnav.css')) h = h.replace('</head>', `<link rel="stylesheet" href="${prefix}assets/gnav.css"></head>`);
    fs.writeFileSync(p, h);
    n++;
  }
}
walk(SITE);
console.log('updated', n);
