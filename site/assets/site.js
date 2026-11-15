/* 닥터지 정적 복제본 - 클라이언트 동작 (메뉴 / 캐러셀 / 아코디언 / 검색) */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- 원본 JS가 넣어주던 CSS 변수 ---------- */
  var header = $('.gdr-header') || $('.header-mega-menu__root');
  function setVars() {
    var root = document.documentElement;
    root.style.setProperty('--viewport-width', root.clientWidth + 'px');
    if (header) root.style.setProperty('--header-height', header.offsetHeight + 'px');
  }
  setVars();
  window.addEventListener('resize', setVars);
  window.addEventListener('load', setVars);

  /* ---------- 모바일 메뉴 ---------- */
  var mobileBtn = $('.mobile-nav__root > button');
  var mobileNav = $('#mobile-nav');
  function setMobile(open) {
    if (!mobileBtn || !mobileNav) return;
    mobileBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileNav.style.visibility = open ? 'visible' : '';
    mobileNav.style.translate = open ? '0 0' : '';
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (!open) $$('.mobile-nav__submenu[open]').forEach(function (s) { s.removeAttribute('open'); });
  }
  if (mobileBtn) {
    mobileBtn.addEventListener('click', function () {
      setMobile(mobileBtn.getAttribute('aria-expanded') !== 'true');
    });
  }
  // 하위 메뉴 열기 / 뒤로
  $$('.mobile-nav__link-container > button').forEach(function (b) {
    b.addEventListener('click', function () {
      var sub = document.getElementById(b.getAttribute('aria-controls'));
      if (sub) { sub.setAttribute('open', ''); b.setAttribute('aria-expanded', 'true'); }
    });
  });
  $$('.mobile-nav__submenu__header > button').forEach(function (b) {
    b.addEventListener('click', function () {
      var sub = b.closest('.mobile-nav__submenu');
      if (sub) sub.removeAttribute('open');
    });
  });
  // 아코디언
  $$('.mobile-nav__submenu__item__toggle').forEach(function (b) {
    b.addEventListener('click', function () {
      var c = document.getElementById(b.getAttribute('aria-controls'));
      if (!c) return;
      var open = c.hasAttribute('open');
      if (open) { c.removeAttribute('open'); c.setAttribute('aria-hidden', 'true'); }
      else { c.setAttribute('open', ''); c.setAttribute('aria-hidden', 'false'); }
      b.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });
  window.addEventListener('resize', function () { if (innerWidth >= 1024) setMobile(false); });

  /* ---------- 캐러셀 공통: 드래그 + 스크롤 ---------- */
  function enableDrag(container, onEnd) {
    var down = false, sx = 0, sl = 0, moved = false;
    container.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      down = true; moved = false; sx = e.clientX; sl = container.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 5) moved = true;
      if (moved) container.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return; down = false;
      if (moved && onEnd) onEnd();
    });
    container.addEventListener('click', function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
    container.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }
  function smooth(container, left) { container.scrollTo({ left: left, behavior: 'smooth' }); }

  /* ---------- 히어로 / MOST LOVED 캐러셀 ---------- */
  $$('.carousel__root').forEach(function (root) {
    var cont = $('.carousel__container', root);
    var slides = $$('.carousel__slide', root);
    if (!cont || !slides.length) return;
    cont.style.overflow = 'hidden';
    var ol = $('.carousel__bullets', root);
    if (ol && ol.children.length && ol.children.length < slides.length) {
      var tpl = ol.children[0];
      for (var n = ol.children.length; n < slides.length; n++) {
        var li = tpl.cloneNode(true), bb = li.querySelector('button');
        bb.setAttribute('aria-current', 'false');
        bb.setAttribute('aria-label', 'Go to the ' + (n + 1) + ' diapositive');
        ol.appendChild(li);
      }
    }
    var bullets = $$('.carousel__bullets button', root);
    var idx = 0, timer = null;
    function slideLeft(i) { return slides[i].offsetLeft - slides[0].offsetLeft; }
    function go(i) {
      idx = (i + slides.length) % slides.length;
      smooth(cont, slideLeft(idx));
      bullets.forEach(function (b, k) { b.setAttribute('aria-current', k === idx ? 'true' : 'false'); });
    }
    function nearest() {
      var best = 0, d = 1e9;
      slides.forEach(function (s, k) {
        var dd = Math.abs(slideLeft(k) - cont.scrollLeft);
        if (dd < d) { d = dd; best = k; }
      });
      return best;
    }
    bullets.forEach(function (b, k) { b.addEventListener('click', function () { go(k); restart(); }); });
    $$('button[aria-controls="carousel-slides"]', root).forEach(function (b) {
      var prev = /prev/i.test(b.getAttribute('aria-label') || '');
      b.addEventListener('click', function () { go(idx + (prev ? -1 : 1)); restart(); });
    });
    enableDrag(cont, function () { go(nearest()); restart(); });
    function restart() {
      clearInterval(timer);
      if (slides.length > 1 && !root.closest('#most-loved')) timer = setInterval(function () { go(idx + 1); }, 5000);
    }
    root.addEventListener('mouseenter', function () { clearInterval(timer); });
    root.addEventListener('mouseleave', restart);
    restart();
  });

  /* ---------- 제품 캐러셀 ---------- */
  $$('.products-carousel__container').forEach(function (cont) {
    cont.style.overflow = 'hidden';
    var items = $$('.products-carousel__track > li', cont);
    function step() { return items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : cont.clientWidth; }
    enableDrag(cont, function () {
      var s = step();
      smooth(cont, Math.round(cont.scrollLeft / s) * s);
    });
    var root = cont.closest('.products-carousel__root') || cont.parentElement;
    $$('button', root).forEach(function (b) {
      var l = (b.getAttribute('aria-label') || '') + ' ' + (b.className || '');
      if (/prev/i.test(l)) b.addEventListener('click', function () { smooth(cont, cont.scrollLeft - step()); });
      else if (/next/i.test(l)) b.addEventListener('click', function () { smooth(cont, cont.scrollLeft + step()); });
    });
  });

  /* ---------- 제품 상세: 썸네일 ---------- */
  $$('.product-summary__preview').forEach(function (pv) {
    var cur = $('.product-summary__current-img', pv);
    var big = $('.product-summary__current-img__img', pv);
    if (!cur || !big) return;
    $$('.product-summary__thumbnails_img', pv).forEach(function (t) {
      t.style.cursor = 'pointer';
      t.addEventListener('click', function () {
        var src = t.getAttribute('src');
        big.setAttribute('src', src);
        big.removeAttribute('srcset');
        cur.style.setProperty('--background-image', 'image-set(url("' + src + '") 1x)');
      });
    });
  });

  /* ---------- 비디오 배너 ---------- */
  $$('.video-banner__root').forEach(function (root) {
    var v = $('video', root);
    if (!v) return;
    v.muted = true; v.loop = true; v.playsInline = true;
    var p = v.play(); if (p && p.catch) p.catch(function () {});
    var btn = $('.video-play-button', root);
    if (btn) btn.addEventListener('click', function () { v.paused ? v.play() : v.pause(); });
  });

  /* ---------- 검색 페이지 ---------- */
  var sInput = $('input[type="search"], input[name="q"], input[type="text"]');
  if (sInput && /search/.test(location.pathname)) {
    var idxData = null;
    var base = location.pathname.replace(/search\/(index\.html)?$/, '');
    var res = document.createElement('div');
    res.style.cssText = 'max-width:960px;margin:24px auto;padding:0 16px;display:grid;gap:12px';
    sInput.closest('form') ? sInput.closest('form').after(res) : sInput.after(res);
    var pages = ['best-sellers', 'our-products', 'doctors-advice', 'drg-story'];
    var sc = document.createElement('script'); sc.src = base + 'assets/search-index.js'; sc.onload = function () { idxData = window.__DRG_INDEX; render(); }; document.head.appendChild(sc);
    var render = function () {
      var q = sInput.value.trim().toLowerCase();
      res.innerHTML = '';
      if (!q || !idxData) return;
      idxData.filter(function (p) { return (p.title + ' ' + p.desc).toLowerCase().indexOf(q) > -1; })
        .slice(0, 30).forEach(function (p) {
          var a = document.createElement('a');
          a.href = base + p.url; a.style.cssText = 'display:block;padding:12px 0;border-bottom:1px solid #ddd;color:inherit;text-decoration:none';
          a.innerHTML = '<strong></strong><br><span style="font-size:14px;color:#666"></span>';
          a.firstChild.textContent = p.title; a.lastChild.textContent = p.desc;
          res.appendChild(a);
        });
    };
    sInput.addEventListener('input', render);
    var f = sInput.closest('form'); if (f) f.addEventListener('submit', function (e) { e.preventDefault(); render(); });
  }
})();
