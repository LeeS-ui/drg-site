/* 새 페이지(Figma 최종) 공통 동작 */
(function () {
  'use strict';
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // 분류 버튼: 선택 상태 전환
  $$('[data-filter]').forEach(function (g) {
    g.addEventListener('click', function (e) {
      var b = e.target.closest('.gp-pill');
      if (!b) return;
      $$('.gp-pill', g).forEach(function (x) { x.classList.toggle('is-on', x === b); });
    });
  });

  // 검색 입력: 같은 페이지의 성분 카드 / FAQ 항목을 걸러냄
  $$('[data-search]').forEach(function (f) {
    var input = f.querySelector('input');
    function run(e) {
      if (e) e.preventDefault();
      var q = input.value.trim().toLowerCase();
      $$('[data-ing], .gp-faq__item').forEach(function (el) {
        el.style.display = !q || el.textContent.toLowerCase().indexOf(q) > -1 ? '' : 'none';
      });
    }
    f.addEventListener('submit', run);
    input.addEventListener('input', run);
  });

  // 문의하기: 실제 전송 없이 접수 안내만
  $$('[data-contact]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      f.innerHTML = '<p class="gp-sub" style="font-size:18px;color:#005031;font-weight:600;padding:48px 0">문의가 접수되었습니다. (연습용 화면이라 실제로 전송되지는 않습니다.)</p>';
    });
  });
})();
