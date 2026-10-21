/* SID CORP Coffee - tương tác dùng chung cho mọi trang.
   Thuộc tính khai báo trên HTML:
   [data-anim]                 hiện dần khi cuộn tới (--y, --s, --d, --dur tùy chỉnh qua style)
   [data-anim="load"]          chạy ngay khi tải trang thay vì chờ cuộn
   [data-stagger="0.13"]       đặt độ trễ tăng dần cho các con trực tiếp có [data-anim]
   [data-cups]                 3 ly ở hero xòe ra khi cuộn 0-560px (desktop)
   [data-recede="0.94"]        thẻ thu nhỏ khi thẻ kế tiếp trượt lên (desktop)
   [data-settle]               ảnh co từ 1.1 về 1 khi khung đi qua màn hình (desktop)
   [data-parallax="40"]        ảnh trượt dọc tối đa N px theo cuộn (desktop)
   [data-slider]               slider có .slider-track, .slide, [data-prev], [data-next]
   [data-stage]                khung ảnh đổi theo [data-stage-step="i"] đang ở giữa màn hình
   form[data-inquiry]          kiểm tra form, trạng thái đang gửi / thành công */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop = window.matchMedia('(min-width: 992px)');
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Menu di động ---------- */
  $$('.mobile-menu').forEach(function (menu) {
    var summary = menu.querySelector('summary');
    var sync = function () { summary.setAttribute('aria-label', menu.open ? 'Đóng menu' : 'Mở menu'); };
    menu.addEventListener('toggle', sync);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.open) { menu.open = false; summary.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (menu.open && !menu.contains(e.target)) menu.open = false;
    });
  });

  /* ---------- Hiện dần ---------- */
  $$('[data-stagger]').forEach(function (group) {
    var step = parseFloat(group.getAttribute('data-stagger')) || 0.12;
    var base = parseFloat(group.getAttribute('data-stagger-base')) || 0;
    $$(':scope > [data-anim]', group).forEach(function (el, i) {
      el.style.setProperty('--d', (base + i * step).toFixed(2) + 's');
    });
  });

  var anims = $$('[data-anim]');
  if (reduce || !('IntersectionObserver' in window)) {
    anims.concat($$('[data-load]')).forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var loadEls = anims.filter(function (el) { return el.getAttribute('data-anim') === 'load'; }).concat($$('[data-load]'));
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { loadEls.forEach(function (el) { el.classList.add('is-in'); }); });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -15% 0px' });
    anims.forEach(function (el) { if (el.getAttribute('data-anim') !== 'load') io.observe(el); });
  }

  /* ---------- Hiệu ứng gắn với vị trí cuộn ---------- */
  var scrubbers = [];
  var vh = window.innerHeight;

  // Tiến độ 0..1 khi mép trên phần tử đi từ startY xuống endY (tính theo px trong viewport)
  var progress = function (top, startY, endY) { return clamp((startY - top) / (startY - endY), 0, 1); };

  var cups = document.querySelector('[data-cups]');
  if (cups) {
    var left = cups.querySelector('.hero-cup--left');
    var center = cups.querySelector('.hero-cup--center');
    var right = cups.querySelector('.hero-cup--right');
    scrubbers.push(function (on) {
      if (!on) { left.style.transform = right.style.transform = center.style.transform = ''; return; }
      var p = clamp(window.scrollY / 560, 0, 1);
      left.style.transform = 'translate(' + (-18 * p) + '%,' + (-22 * p) + '%) rotate(' + lerp(-7, -25, p) + 'deg)';
      center.style.transform = 'translateY(' + (-36 * p) + '%)';
      right.style.transform = 'translate(' + (18 * p) + '%,' + (-14 * p) + '%) rotate(' + lerp(7, 25, p) + 'deg)';
    });
  }

  $$('[data-recede]').forEach(function (card) {
    var to = parseFloat(card.getAttribute('data-recede')) || 0.95;
    var next = card.nextElementSibling;
    if (!next) return;
    var endTop = parseFloat(getComputedStyle(next).top) || 120;
    scrubbers.push(function (on) {
      if (!on) { card.style.transform = ''; return; }
      var p = progress(next.getBoundingClientRect().top, vh * 0.85, endTop);
      card.style.transform = 'scale(' + lerp(1, to, p) + ')';
    });
  });

  $$('[data-settle]').forEach(function (img) {
    var wrap = img.parentElement;
    scrubbers.push(function (on) {
      if (!on) { img.style.transform = ''; return; }
      var r = wrap.getBoundingClientRect();
      // mép trên ở 90% màn hình -> mép dưới ở 30% màn hình
      var p = clamp((vh * 0.9 - r.top) / (vh * 0.9 - (vh * 0.3 - r.height)), 0, 1);
      img.style.transform = 'scale(' + lerp(1.1, 1, p) + ')';
    });
  });

  $$('[data-parallax]').forEach(function (img) {
    var amount = parseFloat(img.getAttribute('data-parallax')) || 40;
    var wrap = img.parentElement;
    scrubbers.push(function (on) {
      if (!on) { img.style.transform = ''; return; }
      var r = wrap.getBoundingClientRect();
      var p = clamp((vh - r.top) / (vh + r.height), 0, 1);
      img.style.transform = 'translateY(' + lerp(-amount, amount, p).toFixed(1) + 'px) scale(1.12)';
    });
  });

  if (scrubbers.length && !reduce) {
    var ticking = false;
    var run = function () {
      ticking = false;
      var on = desktop.matches;
      for (var i = 0; i < scrubbers.length; i++) scrubbers[i](on);
    };
    var request = function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', function () { vh = window.innerHeight; request(); });
    run();
  }

  /* ---------- Slider ---------- */
  $$('[data-slider]').forEach(function (slider) {
    var track = slider.querySelector('.slider-track');
    var slides = $$('.slide', track);
    var prev = slider.querySelector('[data-prev]');
    var next = slider.querySelector('[data-next]');
    var status = slider.querySelector('[data-status]');
    var index = 0;

    var go = function (i, announce) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      slides.forEach(function (s, k) {
        var active = k === index;
        s.classList.toggle('is-active', active);
        s.setAttribute('aria-hidden', active ? 'false' : 'true');
        $$('a, button', s).forEach(function (f) { f.tabIndex = active ? 0 : -1; });
      });
      if (status && announce) status.textContent = 'Thẻ ' + (index + 1) + ' trên ' + slides.length;
    };

    prev.addEventListener('click', function () { go(index - 1, true); });
    next.addEventListener('click', function () { go(index + 1, true); });
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1, true); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1, true); }
    });

    // vuốt trên màn hình cảm ứng
    var startX = null;
    track.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    window.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1), true);
    });
    go(0, false);
  });

  /* ---------- Khung ảnh đổi theo bước ---------- */
  $$('[data-stage]').forEach(function (stage) {
    var frames = $$('[data-stage-frame]', stage);
    var steps = $$('[data-stage-step]');
    if (!frames.length || !steps.length || !('IntersectionObserver' in window)) return;
    var set = function (i) {
      frames.forEach(function (f, k) { f.classList.toggle('is-active', k === i); });
      steps.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
    };
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) set(parseInt(en.target.getAttribute('data-stage-step'), 10) || 0);
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { sio.observe(s); });
    set(0);
  });

  /* ---------- Form liên hệ ---------- */
  $$('form[data-inquiry]').forEach(function (form) {
    var submit = form.querySelector('[type="submit"]');
    var success = document.getElementById(form.getAttribute('data-success'));
    var errorBox = document.getElementById(form.getAttribute('data-error'));
    var messages = {
      valueMissing: 'Vui lòng điền thông tin này.',
      typeMismatch: 'Email chưa đúng định dạng, ví dụ: ten@quancafe.vn',
      tooLong: 'Nội dung quá dài.'
    };

    var check = function (field) {
      var msgEl = document.getElementById(field.getAttribute('aria-describedby') && field.getAttribute('aria-describedby').split(' ')[0]);
      var key = ['valueMissing', 'typeMismatch', 'tooLong'].filter(function (k) { return field.validity[k]; })[0];
      field.setAttribute('aria-invalid', key ? 'true' : 'false');
      if (msgEl && msgEl.classList.contains('field-error')) msgEl.textContent = key ? messages[key] : '';
      return !key;
    };

    form.setAttribute('novalidate', '');
    $$('input, textarea, select', form).forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value) check(f); });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid') === 'true') check(f); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = $$('input:not([type="submit"]), textarea, select', form);
      var bad = fields.filter(function (f) { return !check(f); });
      if (errorBox) errorBox.hidden = !bad.length;
      if (bad.length) { bad[0].focus(); return; }

      // Chưa có máy chủ nhận form: mô phỏng gửi. Thay đoạn này bằng fetch() tới endpoint thật.
      submit.setAttribute('aria-busy', 'true');
      submit.disabled = true;
      submit.dataset.label = submit.textContent;
      submit.textContent = 'Đang gửi...';
      setTimeout(function () {
        form.hidden = true;
        if (success) { success.hidden = false; success.focus(); }
      }, 900);
    });
  });
})();
