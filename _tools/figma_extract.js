// 브라우저에서 실행: 현재 페이지를 Figma용 compact JSON으로 추출
window.__ext = (part) => {
  const hex = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null;
    const p = m[1].split(',').map(s => parseFloat(s));
    const a = p.length > 3 ? p[3] : 1; if (a < 0.05) return null;
    const h = (n) => Math.round(n).toString(16).padStart(2, '0');
    return h(p[0]) + h(p[1]) + h(p[2]) + (a < 0.98 ? h(a * 255) : '');
  };
  const out = [];
  const R = (n) => Math.round(n * 10) / 10;
  let sx = window.scrollX, sy = window.scrollY;
  const root = part === 'header' ? document.querySelector('header') : part === 'footer' ? document.querySelector('footer') : document.body;
  if (part === 'header' || part === 'footer') { const rb = root.getBoundingClientRect(); sx -= rb.left + window.scrollX; sy -= rb.top + window.scrollY; sx += window.scrollX; sy += window.scrollY; sx = -(rb.left); sy = -(rb.top); }
  const walk = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return;
    const b = el.getBoundingClientRect();
    if (b.width < 1 || b.height < 1) { if (el.tagName !== 'svg') return; }
    const x = b.left + sx, y = b.top + sy;
    const tag = el.tagName;
    if (part === 'body' && (tag === 'HEADER' || tag === 'FOOTER')) return;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'LINK' || tag === 'META') return;
    if (tag === 'IMG' || tag === 'VIDEO' || tag === 'SVG' || tag === 'svg' || tag === 'PICTURE' && false) {
      if (tag === 'IMG') out.push(['i', R(x), R(y), R(b.width), R(b.height), el.currentSrc || el.src, parseFloat(cs.borderTopLeftRadius) || 0, cs.objectFit]);
      else if (b.width > 1) out.push(['v', R(x), R(y), R(b.width), R(b.height), hex(cs.color) || '000000']);
      return;
    }
    const bg = hex(cs.backgroundColor);
    const bgi = cs.backgroundImage !== 'none';
    const bw = parseFloat(cs.borderTopWidth) || 0, bc = hex(cs.borderTopColor);
    const rad = parseFloat(cs.borderTopLeftRadius) || 0;
    if (bg || bgi || (bw && bc)) {
      const url = bgi && (cs.backgroundImage.match(/url\("?([^")]+)"?\)/) || [])[1];
      out.push(['r', R(x), R(y), R(b.width), R(b.height), bg, rad, bw && bc ? bc : null, bw, url || (bgi ? 'grad:' + cs.backgroundImage.slice(0, 200) : null)]);
    } else if (bw === 0 && parseFloat(cs.borderBottomWidth)) {
      out.push(['r', R(x), R(y + b.height - parseFloat(cs.borderBottomWidth)), R(b.width), parseFloat(cs.borderBottomWidth), hex(cs.borderBottomColor), 0, null, 0, null]);
    }
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      const t = el.value || el.placeholder; if (t) out.push(['t', R(x + 12), R(y), R(b.width - 24), R(b.height), t, parseFloat(cs.fontSize), +cs.fontWeight, hex(cs.color) || '000000', 'left', parseFloat(cs.lineHeight) || 0, cs.letterSpacing]);
    }
    for (const n of el.childNodes) {
      if (n.nodeType === 3) {
        const t = n.textContent.replace(/\s+/g, ' ').trim(); if (!t) continue;
        const rg = document.createRange(); rg.selectNodeContents(n);
        const rs = rg.getBoundingClientRect(); if (rs.width < 1) continue;
        const fs = parseFloat(cs.fontSize);
        let lh = parseFloat(cs.lineHeight); if (isNaN(lh)) lh = fs * 1.4;
        out.push(['t', R(rs.left + sx), R(rs.top + sy), R(rs.width), R(rs.height), t, fs, +cs.fontWeight, hex(cs.color) || '000000', cs.textAlign, R(lh), cs.letterSpacing, cs.textTransform]);
      } else if (n.nodeType === 1) walk(n);
    }
  };
  walk(root);
  const I = (v) => (typeof v === 'number' ? Math.round(v) : v);
  const rb2 = root.getBoundingClientRect();
  const comp = out.filter(x => x[0] !== 'v').map(x => {
    let a = x.slice();
    if (a[0] === 'i') a[5] = /logo/.test(a[5]) ? 'logo' : '';
    if (a[0] === 'r' && a[9]) a[9] = a[9].startsWith('grad:') ? 'grad' : 'img';
    if (a[0] === 't') { a = ['t', a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9][0], a[10], a[11] === 'normal' ? 0 : parseFloat(a[11]) || 0, a[12] === 'uppercase' ? 1 : 0]; }
    a = a.map(I);
    while (a.length > 5 && (a[a.length - 1] === null || a[a.length - 1] === 0)) a.pop();
    return a;
  });
  return JSON.stringify({ w: Math.round(document.documentElement.clientWidth), h: Math.round(document.documentElement.scrollHeight), rh: Math.round(rb2.height), n: comp });
};