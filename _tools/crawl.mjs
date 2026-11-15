import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe';
const DYN=new RegExp('^/(best-sellers|our-products|our-products/(ingredient|product-type|skin-concern)(/[^/]+)?|doctors-advice|search)$');

const ORIGIN = 'https://www.dr-g.com';
const OUT = path.resolve('../site');
const UA = { 'User-Agent': 'Mozilla/5.0' };
fs.mkdirSync(OUT, { recursive: true });

const assetMap = new Map(); // remote url -> local rel path
async function getAsset(u) {
  if (assetMap.has(u)) return assetMap.get(u);
  let ext = (u.split('?')[0].match(/\.(\w{2,5})$/) || [])[1] || '';
  const h = crypto.createHash('md5').update(u).digest('hex').slice(0, 10);
  let base = decodeURIComponent(u.split('?')[0].split('/').pop()).replace(/[^\w.\-]/g, '_').slice(-50);
  let local = `assets/${h}_${base}`;
  assetMap.set(u, local);
  try {
    const r = await fetch(u, { headers: UA });
    if (!r.ok) { console.log('FAIL', r.status, u); return local; }
    const ct = r.headers.get('content-type') || '';
    if (!ext || !/\.\w{2,5}$/.test(local)) {
      const e = ct.includes('webp') ? 'webp' : ct.includes('png') ? 'png' : ct.includes('jpeg') ? 'jpg' : ct.includes('svg') ? 'svg' : ct.includes('gif') ? 'gif' : 'bin';
      local += '.' + e; assetMap.set(u, local);
    }
    let buf = Buffer.from(await r.arrayBuffer());
    const full = path.join(OUT, local);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    if (local.endsWith('.css')) {
      let css = buf.toString('utf8');
      css = await rewriteCss(css, u, true);
      buf = Buffer.from(css);
    }
    fs.writeFileSync(full, buf);
  } catch (e) { console.log('ERR', u, e.message); }
  return local;
}

async function rewriteCss(css, baseUrl, fromAssetsDir) {
  const re = /url\(\s*(['"]?)([^)'"]+)\1\s*\)/g;
  const found = [...css.matchAll(re)];
  for (const m of found) {
    const raw = m[2];
    if (raw.startsWith('data:')) continue;
    const abs = new URL(raw, baseUrl).href;
    const local = await getAsset(abs);
    css = css.split(m[0]).join(`url(${fromAssetsDir ? local.replace(/^assets\//, '') : local})`);
  }
  return css;
}

function normNextImage(u) {
  // /_next/image?url=ENC&w=..&q=.. -> original url
  const m = u.match(/\/_next\/image\?url=([^&"]+)/);
  if (m) {
    let orig = decodeURIComponent(m[1].replace(/&amp;/g, '&'));
    return new URL(orig, ORIGIN).href;
  }
  return null;
}

const seen = new Set();
const queue = ['/'];
const pages = [];
while (queue.length) {
  const p = queue.shift();
  if (seen.has(p)) continue;
  seen.add(p);
  const r = await fetch(ORIGIN + p, { headers: UA });
  if (!r.ok) { console.log('PAGE FAIL', r.status, p); continue; }
  let html = await r.text();
  if (DYN.test(p)) { try { html = execFileSync(CHROME,['--headless=new','--disable-gpu','--virtual-time-budget=20000','--window-size=1440,900','--dump-dom',ORIGIN+p],{maxBuffer:64*1024*1024,stdio:['ignore','pipe','ignore']}).toString('utf8'); } catch(e){ console.log('DYN FAIL',p); } }
  pages.push(p);
  // discover links
  for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const l = m[1];
    if (l.startsWith('/_next') || /\.\w{2,4}$/.test(l)) continue;
    if (!seen.has(l)) queue.push(l);
  }
  // collect urls to rewrite
  const urls = new Set();
  for (const m of html.matchAll(/(?:src|href|srcset|poster|content)="([^"]+)"/g)) {
    for (const part of m[1].split(/,\s+(?=\S)/)) {
      const u = part.trim().split(/\s+/)[0].replace(/&amp;/g, '&');
      if (!u) continue;
      if (u.includes('/_next/image?') || /\.(css|woff2?|png|jpe?g|webp|svg|gif|ico|mp4)(\?|$)/i.test(u) || u.includes('sitecorecloud.io')) urls.add(part.trim().split(/\s+/)[0]);
    }
  }
  for (const m of html.matchAll(/url\((?:&quot;|["'])?([^)"'&]+)(?:&quot;|["'])?\)/g)) urls.add(m[1]);
  const repl = new Map();
  for (const raw of urls) {
    const u = raw.replace(/&amp;/g, '&');
    if (u.startsWith('data:') || u.startsWith('#') || u.startsWith('mailto')) continue;
    let abs = normNextImage(u) || new URL(u, ORIGIN).href;
    if (!abs.startsWith(ORIGIN) && !abs.includes('sitecorecloud.io')) continue;
    if (abs.startsWith(ORIGIN) && !/\.(css|woff2?|png|jpe?g|webp|svg|gif|ico|mp4)(\?|$)/i.test(abs)) continue;
    repl.set(raw, await getAsset(abs));
  }
  // write page
  const depth = p === '/' ? 0 : p.split('/').filter(Boolean).length;
  const prefix = depth === 0 ? '' : '../'.repeat(depth);
  const sorted = [...repl.entries()].sort((a, b) => b[0].length - a[0].length);
  for (const [raw, local] of sorted) html = html.split(raw).join(prefix + local);
  html = html.replace(/<script\b[\s\S]*?<\/script>/g, (s) => /application\/ld\+json/.test(s) ? s : '');
  html = html.replace(/<link[^>]*rel="preload"[^>]*as="script"[^>]*>/g, '');
  html = html.replace(/<link rel="preload" as="image"[^>]*>/g, '').replace(/ srcSet="[^"]*"/g, '').replace(/ srcset="[^"]*"/g, '');
  // internal links -> relative
  html = html.replace(/href="(\/[^"#?]*)"/g, (m, l) => {
    if (l.startsWith('/_next') || /\.\w{2,4}$/.test(l)) return m;
    return `href="${prefix}${l === '/' ? '' : l.slice(1) + '/'}index.html"`.replace('href="index.html"', 'href="index.html"');
  });
  html = html.replace('</body>', `<script src="${prefix}assets/site.js"></script></body>`);
  const dir = path.join(OUT, p === '/' ? '' : p);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log('OK', p, repl.size);
}
fs.writeFileSync(path.join(OUT, '_pages.json'), JSON.stringify(pages, null, 1));
console.log('pages', pages.length, 'assets', assetMap.size);
