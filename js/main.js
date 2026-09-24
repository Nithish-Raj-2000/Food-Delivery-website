/* ============================================================
   STACKLY — Global Engine (Vanilla JS)
   Animations · Navigation · Validation · Auth Flow
   ============================================================ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CURRENT = location.pathname.split('/').pop() || 'index.html';
  var IS_DASH = /dash/i.test(CURRENT);

  /* ---------- helpers ---------- */
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function byData(el, key) { var v = el.getAttribute('data-' + key); return v === null ? '' : v; }

  /* ---------- toast ---------- */
  window.toast = function (title, msg, type) {
    var stack = document.querySelector('.toast-stack');
    if (!stack) { stack = document.createElement('div'); stack.className = 'toast-stack'; document.body.appendChild(stack); }
    var t = document.createElement('div');
    t.className = 'toast' + (type === 'error' ? ' err' : '');
    t.setAttribute('role', 'status');
    t.innerHTML = '<span class="t-ico">' + (type === 'error' ? '&#10005;' : '&#10003;') + '</span><span><b>' + title + '</b><p>' + msg + '</p></span>';
    stack.appendChild(t);
    setTimeout(function () { t.classList.add('hide'); setTimeout(function () { t.remove(); }, 420); }, 3400);
  };
  window.go404 = function () {
    if (IS_DASH) {
      var onTab = document.querySelector('.dash-link.on');
      if (onTab) try { sessionStorage.setItem('stackly_ret_tab', byData(onTab, 'tab')); } catch (e) { }
    }
    location.href = IS_DASH ? '404dash.html' : '404.html';
  };

  /* copy helpers */
  $all('.js-copy').forEach(function (el) {
    el.addEventListener('click', function () {
      var txt = el.textContent.replace(/[^A-Za-z0-9]/g, '');
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt);
      toast('Copied!', 'Offer code ' + txt + ' is now on your clipboard.');
    });
  });

  /* ---------- loader ---------- */
  var loader = document.querySelector('.loader');
  window.addEventListener('load', function () { if (loader) { loader.classList.add('hide'); } });
  setTimeout(function () { if (loader) { loader.classList.add('hide'); } }, 1800);

  /* ---------- header state / scroll progress ---------- */
  var header = document.querySelector('.site-header');
  var progress = document.querySelector('.scroll-progress');
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('scrolled', y > 30);
    if (progress) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }
    if (window._revealObs) { /* IntersectionObserver handles its own */ }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('DOMContentLoaded', onScroll);

  /* ---------- sidebar (public) ---------- */
  var burger = document.querySelector('.burger[data-sidebar]');
  var side = document.querySelector('.sidebar');
  var overlay = document.querySelector('.sidebar-overlay');
  function setSide(open) {
    if (!side) return;
    side.classList.toggle('open', open);
    if (overlay) overlay.classList.toggle('open', open);
    if (burger) burger.classList.toggle('open', open);
    if (open) { side.setAttribute('aria-hidden', 'false'); }
    else { side.setAttribute('aria-hidden', 'true'); }
  }
  if (burger && side) {
    burger.addEventListener('click', function () { setSide(!side.classList.contains('open')); });
    $all('.sidebar-close', document).forEach(function (el) { el.addEventListener('click', function () { setSide(false); }); });
    if (overlay) overlay.addEventListener('click', function () { setSide(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setSide(false); });
    $all('.sidebar-nav .nav-link, .sidebar .btn', document).forEach(function (l) { l.addEventListener('click', function () { setSide(false); }); });
  }

  /* ---------- dashboard sidebar ---------- */
  var dashBurger = document.querySelector('.burger[data-dash-side]');
  var dashSide = document.querySelector('.dash-sidebar');
  var dashOverlay = document.querySelector('.dash-sidebar-overlay');
  function setDashSide(open) {
    if (!dashSide) return;
    dashSide.classList.toggle('open', open);
    if (dashOverlay) dashOverlay.classList.toggle('open', open);
    if (dashBurger) dashBurger.classList.toggle('open', open);
    document.body.classList.toggle('no-scroll', open);
  }
  if (dashBurger && dashSide) {
    dashBurger.addEventListener('click', function () { setDashSide(!dashSide.classList.contains('open')); });
    $all('.sidebar-close', dashSide).forEach(function (el) { el.addEventListener('click', function () { setDashSide(false); }); });
    if (dashOverlay) dashOverlay.addEventListener('click', function () { setDashSide(false); });
    $all('.dash-link', dashSide).forEach(function (l) { l.addEventListener('click', function () { setDashSide(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDashSide(false); });
  }

  /* ---------- 404 routing for generic CTAs ---------- */
  $all('.js-404').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); window.go404(); });
    if (el.tabIndex >= 0) {
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.go404(); }
      });
    }
  });
  $all('.js-404dash').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); window.go404(); });
  });
  $all('a[href="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); window.go404(); });
  });
  /* ---------- cart & wishlist icons -> 404 (demo) ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('.js-cart-open, .js-wish-open')) {
      e.preventDefault();
      location.href = IS_DASH ? '404dash.html' : '404.html';
    }
  });
  /* ---------- public catch-all: every button / CTA / link on public pages -> 404 (forms stay live) ---------- */
  var PUBLIC_PAGES = ['index.html', 'about.html', 'services.html', 'menu.html', 'blogs.html', 'contact.html'];
  if (PUBLIC_PAGES.indexOf(CURRENT) > -1) {
    document.addEventListener('click', function (e) {
      var el = e.target;
      if (!el || !el.closest) return;
      if (el.closest('form')) return;
      if (el.closest('.nav-link, a[href="login.html"], a.logo')) return;
      if (el.closest('.toast-stack, .loader, .skip-link, .scroll-progress')) return;
      if (el.closest('a[href^="tel:"], a[href^="mailto:"]')) return;
      var hit = el.closest('button, a[href], [role="button"], [tabindex]');
      if (!hit) return;
      e.preventDefault();
      e.stopPropagation();
      window.go404();
    });
  }
  /* ---------- active nav highlight ---------- */
  $all('.nav-link, .dash-link').forEach(function (l) {
    if (l.getAttribute('href') === CURRENT) l.classList.add('active', 'on');
  });

  /* ---------- reveal on scroll ---------- */
  var revealEls = $all('[data-reveal], .stagger');
  if ('IntersectionObserver' in window && !REDUCED) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { obs.observe(el); });
    window._revealObs = obs;
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- counters ---------- */
  function animateCount(el) {
    var target = parseFloat(byData(el, 'count')) || parseFloat(el.textContent.replace(/[^0-9.]/g, ''));
    var suffix = byData(el, 'suffix') || '';
    var prefix = byData(el, 'prefix') || '';
    var dur = byData(el, 'dur') || 1800;
    var dec = (target % 1 !== 0) ? 1 : 0;
    var t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toFixed(dec) + suffix;
    }
    requestAnimationFrame(step);
  }
  var countObs = ('IntersectionObserver' in window && !REDUCED) ? new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { animateCount(en.target); countObs.unobserve(en.target); } });
  }, { threshold: 0.4 }) : null;
  $all('[data-count]').forEach(function (el) { if (countObs) countObs.observe(el); else animateCount(el); });

  /* ---------- dashboard bar fills ---------- */
  var barObs = ('IntersectionObserver' in window && !REDUCED) ? new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { var w = byData(en.target, 'width'); en.target.style.width = w; barObs.unobserve(en.target); } });
  }, { threshold: 0.3 }) : null;
  $all('[data-width]').forEach(function (el) { if (barObs) barObs.observe(el); else el.style.width = byData(el, 'width'); });

  /* ---------- donut stroke ---------- */
  $all('[data-stroke]').forEach(function (el) {
    var target = byData(el, 'stroke');
    var circ = 2 * Math.PI * (parseFloat(el.getAttribute('r')) || 72);
    el.style.strokeDasharray = circ;
    el.style.strokeDashoffset = circ;
    var donObs = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { el.style.strokeDashoffset = circ - (target / 100) * circ; donObs.unobserve(el); } });
    }, { threshold: 0.4 });
    donObs.observe(el);
  });

  /* ---------- tilt cards ---------- */
  if (!REDUCED && window.matchMedia('(hover: hover)').matches) {
    $all('.tilt').forEach(function (card) {
      var inner = card.querySelector('.tilt-inner') || card;
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -8;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
        inner.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () { inner.style.transform = ''; });
    });
  }

  /* ---------- button glitter on click ---------- */
  $all('.btn-glitter').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var r = btn.getBoundingClientRect();
      var x = r.left + r.width / 2, y = r.top + r.height / 2;
      var n = 12;
      for (var i = 0; i < n; i++) {
        var s = document.createElement('i');
        s.className = 'glitter';
        var ang = (Math.PI * 2 * i) / n + Math.random() * 0.6;
        var dist = 40 + Math.random() * 50;
        s.style.left = x + 'px';
        s.style.top = y + 'px';
        s.style.setProperty('--gx', Math.cos(ang) * dist + 'px');
        s.style.setProperty('--gy', Math.sin(ang) * dist + 'px');
        document.body.appendChild(s);
        (function (el) { setTimeout(function () { el.remove(); }, 750); })(s);
      }
    });
  });

  /* ---------- hero canvas particles ---------- */
  try {
  $all('.hero-canvas').forEach(function (canvas) {
    if (REDUCED) return;
    if (!canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var W, H, parts = [], mouse = { x: -9999, y: -9999 };
    var COLORS = [['255,77,36', .5], ['124,92,255', .42], ['255,194,75', .5], ['15,185,134', .42]];
    function size() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      parts = Array.from({ length: Math.min(70, Math.floor(W / 22)) }, function () {
        return {
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 3.4 + 1, c: COLORS[Math.floor(Math.random() * COLORS.length)],
          vx: (Math.random() - 0.5) * .5, vy: (Math.random() - 0.5) * .5,
          tw: Math.random() * Math.PI * 2
        };
      });
    }
    size();
    window.addEventListener('resize', size);
    canvas.addEventListener('mousemove', function (e) { var r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    canvas.addEventListener('mouseleave', function () { mouse.x = -9999; mouse.y = -9999; });
    var raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      parts.forEach(function (p) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
        var d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        var driftX = 0, driftY = 0;
        if (d < 150 && d > 0) { driftX = ((p.x - mouse.x) / d) * 2.4; driftY = ((p.y - mouse.y) / d) * 2.4; }
        p.tw += 0.02;
        var o = .22 + Math.sin(p.tw) * .16;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(' + p.c[0] + ',' + (o * p.c[1]) + ')';
        ctx.arc(p.x + driftX, p.y + driftY, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      for (var i = 0; i < parts.length; i++) {
        for (var j = i + 1; j < parts.length; j++) {
          var a = parts[i], b = parts[j];
          var dd = Math.hypot(a.x - b.x, a.y - b.y);
          if (dd < 110) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255,122,31,' + (0.05 * (1 - dd / 110)) + ')';
            ctx.lineWidth = 1;
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
  });
  } catch (e) { }

  /* ---------- image fallback (webp safe) ---------- */
  var FALLBACK = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7a1f"/><stop offset="1" stop-color="#ff3857"/></linearGradient></defs><rect width="640" height="480" fill="#fff6ea"/><circle cx="320" cy="230" r="130" fill="url(#g)" opacity=".9"/><text x="320" y="248" font-family="Arial" font-size="44" font-weight="bold" fill="#fff" text-anchor="middle">STACKLY</text><text x="320" y="300" font-family="Arial" font-size="20" fill="#ff4d24" text-anchor="middle">Delicious &amp; Fresh</text></svg>');
  $all('img').forEach(function (img) {
    img.addEventListener('error', function () { if (this.dataset.fall) return; this.dataset.fall = 1; this.src = FALLBACK; });
  });

  /* ---------- custom premium dropdowns ---------- */
  function escHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  $all('select').forEach(function (native) {
    try {
    if (native.getAttribute('data-fd')) return;

    var opts = $all('option', native);
    if (!opts.length) return;
    native.setAttribute('data-fd', '1');

    var selIdx = native.selectedIndex < 0 ? 0 : native.selectedIndex;

    /* shell */
    var shell = document.createElement('div');
    shell.className = 'fd';

    /* trigger */
    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'fd-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    var valueEl = document.createElement('span');
    valueEl.className = 'fd-value' + ((native.options[selIdx] || {}).value ? '' : ' placeholder');
    valueEl.textContent = (native.options[selIdx] || {}).textContent || '';
    var caret = document.createElement('span');
    caret.className = 'fd-caret';
    caret.setAttribute('aria-hidden', 'true');
    trigger.appendChild(valueEl);
    trigger.appendChild(caret);

    /* menu */
    var menu = document.createElement('ul');
    menu.className = 'fd-menu';
    menu.setAttribute('role', 'listbox');
    opts.forEach(function (o, i) {
      var li = document.createElement('li');
      li.className = 'fd-option' + (i === selIdx ? ' sel' : '');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', i === selIdx ? 'true' : 'false');
      li.setAttribute('data-index', i);
      li.innerHTML = '<span class="fd-txt">' + escHTML(o.textContent) + '</span><span class="fd-check">&#10003;</span>';
      menu.appendChild(li);
    });
    var listItems = $all('.fd-option', menu);

    /* keep native select (hidden) for form submission/validation */
    native.className += ' fd-native';
    native.parentNode.insertBefore(shell, native);
    shell.appendChild(trigger);
    shell.appendChild(menu);
    shell.appendChild(native);

    var activeIdx = selIdx;

    function refresh() {
      var idx = native.selectedIndex < 0 ? 0 : native.selectedIndex;
      var opt = native.options[idx] || {};
      valueEl.textContent = opt.textContent || '';
      valueEl.classList.toggle('placeholder', !opt.value);
      listItems.forEach(function (li, k) {
        var on = k === idx;
        li.classList.toggle('sel', on);
        li.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }
    function setPick(idx, fire) {
      if (idx < 0 || idx >= opts.length) return;
      native.selectedIndex = idx;
      refresh();
      if (fire) {
        var ev = new Event('change', { bubbles: true });
        native.dispatchEvent(ev);
        native.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    function openMenu() {
      shell.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
      activeIdx = native.selectedIndex < 0 ? 0 : native.selectedIndex;
      markHover();
    }
    function closeMenu() {
      shell.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }
    function markHover() {
      listItems.forEach(function (li, k) { li.classList.toggle('hover', k === activeIdx); });
      var el = listItems[activeIdx];
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
    }
    function move(dir) {
      activeIdx += dir;
      if (activeIdx < 0) activeIdx = opts.length - 1;
      if (activeIdx >= opts.length) activeIdx = 0;
      markHover();
    }

    if (trigger.addEventListener) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        if (shell.classList.contains('open')) closeMenu(); else openMenu();
      });
    }

    menu.addEventListener('click', function (e) {
      var li = e.target.closest ? e.target.closest('.fd-option') : null;
      if (!li) return;
      setPick(parseInt(li.getAttribute('data-index'), 10), true);
      closeMenu();
      trigger.focus();
    });

    function keyNav(e) {
      if (e.key === 'Escape') { closeMenu(); trigger.focus(); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!shell.classList.contains('open')) openMenu();
        else move(e.key === 'ArrowDown' ? 1 : -1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (shell.classList.contains('open')) { setPick(activeIdx, true); closeMenu(); }
        else openMenu();
      } else if (e.key === ' ') {
        e.preventDefault();
        if (!shell.classList.contains('open')) openMenu();
      } else if (e.key === 'Home') {
        e.preventDefault(); activeIdx = 0; markHover();
      } else if (e.key === 'End') {
        e.preventDefault(); activeIdx = opts.length - 1; markHover();
      }
    }
    trigger.addEventListener('keydown', keyNav);

    document.addEventListener('click', function (e) {
      if (!shell.contains(e.target)) closeMenu();
    });

    /* re-sync label if value changes or form resets */
    native.addEventListener('change', refresh);
    var form = native.form;
    if (form) form.addEventListener('reset', function () { setTimeout(refresh, 0); });
    } catch (e) { }
  });

  /* ---------- validation helpers ---------- */
  window.validators = {
    email: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
    phone: /^[6-9]\d{9}$/,
    name: /^[A-Za-z][A-Za-z\s.'-]{1,49}$/
  };
  function setError(field, msg) {
    if (!field || !field.closest) return;
    var wrap = field.closest('.field') || field.closest('.dark-field');
    if (!wrap) return;
    wrap.classList.add('error');
    wrap.classList.remove('ok');
    var er = wrap.querySelector('.form-error');
    if (er) er.textContent = msg;
    var okEl = wrap.querySelector('.form-success');
    if (okEl) okEl.textContent = '';
    field.setAttribute('aria-invalid', 'true');
  }
  function clearError(field) {
    if (!field || !field.closest) return;
    var wrap = field.closest('.field') || field.closest('.dark-field');
    if (!wrap) return;
    wrap.classList.remove('error');
    wrap.classList.remove('ok');
    var er = wrap.querySelector('.form-error');
    if (er) er.textContent = '';
    var okEl = wrap.querySelector('.form-success');
    if (okEl) okEl.textContent = '';
    field.removeAttribute('aria-invalid');
  }
  function validField(field, test, msg) {
    if (!field || !field.value) return false;
    var v = field.value.trim();
    if (!v) { setError(field, 'This field is required'); return false; }
    if (test && !test(v)) { setError(field, msg); return false; }
    clearError(field); return true;
  }
  function markClean(form) { $all('input, textarea, select', form).forEach(function (i) { i.addEventListener('input', function () { clearError(i); }); }); }

  /* ---------- live field validation ---------- */
  function liveCheck(field, opts) {
    if (!field || !field.closest) return;
    var wrap = field.closest('.field') || field.closest('.dark-field');
    if (!wrap) return;
    opts = opts || {};
    function doCheck() {
      var v = field.value.trim();
      if (!v) {
        if (opts.required) setError(field, opts.reqMsg || 'This field is required');
        else clearError(field);
        return;
      }
      if (opts.test && !opts.test(v)) setError(field, opts.msg || 'Please enter a valid value');
      else clearError(field);
    }
    field.addEventListener('blur', doCheck);
    field.addEventListener('change', doCheck);
    field.addEventListener('input', function () {
      if (field.value.trim()) doCheck();
      else if (!opts.required) clearError(field);
    });
  }

  /* ---------- real-time validation core ---------- */
  var V = {
    name: /^[A-Za-z]+(?:[ ][A-Za-z]+)*$/,
    email: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
    phone: /^[6-9]\d{9}$/,
    pass: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,64}$/
  };
  function vMsgs(field) {
    var wrap = field.closest('.field') || field.closest('.dark-field');
    if (!wrap) return null;
    var err = wrap.querySelector('.form-error');
    if (!err) { err = document.createElement('div'); err.className = 'form-error'; wrap.appendChild(err); }
    var ok = wrap.querySelector('.form-success');
    if (!ok) { ok = document.createElement('div'); ok.className = 'form-success'; wrap.appendChild(ok); }
    var base = field.id || field.name || ('fld' + Math.floor(Math.random() * 1e6));
    if (!err.id) err.id = base + '-err';
    if (!ok.id) ok.id = base + '-ok';
    field.setAttribute('aria-describedby', ok.id + ' ' + err.id);
    field.setAttribute('aria-invalid', 'false');
    return { wrap: wrap, err: err, ok: ok };
  }
  function vSet(field, state, errMsg, okMsg) {
    var m = field._vm;
    if (!m) return;
    m.wrap.classList.remove('error', 'ok');
    if (state === 'bad') {
      m.wrap.classList.add('error');
      m.err.textContent = errMsg || '';
      m.ok.textContent = '';
      field.setAttribute('aria-invalid', 'true');
    } else if (state === 'good') {
      m.wrap.classList.add('ok');
      m.ok.textContent = (okMsg === undefined || okMsg === null) ? '\u2713 Valid' : okMsg;
      m.err.textContent = '';
      field.setAttribute('aria-invalid', 'false');
    } else {
      m.err.textContent = '';
      m.ok.textContent = '';
      field.setAttribute('aria-invalid', 'false');
    }
  }
  function makeValidator(field, cfg) {
    if (!field) return null;
    var m = vMsgs(field);
    if (!m) return null;
    field._vm = m;
    var api = {
      field: field, cfg: cfg, touched: false, _gate: null,
      check: function () {
        if (field.type === 'checkbox') {
          if (cfg.required && !field.checked) return { ok: false, msg: cfg.msg || 'This is required' };
          return { ok: true };
        }
        var v = field.value.trim();
        if (v === '') return cfg.required ? { ok: false, msg: cfg.reqMsg || 'This field is required' } : { ok: true };
        if (cfg.validate) return cfg.validate(v, field);
        return { ok: true };
      }
    };
    function gate() { if (api._gate) api._gate(); }
    function onLive() {
      api.touched = true;
      if (cfg.onInput) cfg.onInput(field, api);
      var empty = field.type === 'checkbox' ? false : field.value.trim() === '';
      if (empty) { vSet(field, 'neutral'); }
      else {
        var r = api.check();
        if (r.ok) vSet(field, 'good', '', cfg.okMsg);
        else if (cfg.soft) vSet(field, 'neutral');
        else vSet(field, 'bad', r.msg);
      }
      gate();
    }
    function onCommit() {
      api.touched = true;
      var r = api.check();
      if (r.ok) {
        var optionalEmpty = field.type !== 'checkbox' && field.value.trim() === '' && !cfg.required;
        vSet(field, optionalEmpty ? 'neutral' : 'good', '', cfg.okMsg);
      } else vSet(field, 'bad', r.msg);
      gate();
    }
    field.addEventListener('input', onLive);
    field.addEventListener('change', onCommit);
    field.addEventListener('blur', onCommit);
    return api;
  }
  function bindFormGate(form, validators, btn) {
    function refresh() { }
    validators.forEach(function (v) { v._gate = refresh; });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null, ok = true;
      validators.forEach(function (v) {
        var r = v.check();
        if (!r.ok) {
          ok = false;
          if (!firstBad) firstBad = v;
          vSet(v.field, 'bad', r.msg);
        }
      });
      if (!ok) {
        if (firstBad) {
          firstBad.field.focus();
          try { firstBad.field.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (er) { }
        }
        return;
      }
      if (form._onValid) form._onValid();
    });
    refresh();
    return refresh;
  }
  function passRulesState(v) {
    return {
      len: v.length >= 8,
      lower: /[a-z]/.test(v),
      upper: /[A-Z]/.test(v),
      digit: /\d/.test(v),
      special: /[^A-Za-z0-9\s]/.test(v)
    };
  }
  function passScore(v) {
    var s = passRulesState(v);
    return (s.len ? 1 : 0) + (s.lower ? 1 : 0) + (s.upper ? 1 : 0) + (s.digit ? 1 : 0) + (s.special ? 1 : 0);
  }
  function paintMeter(field) {
    var v = field.value;
    var n = v ? passScore(v) : 0;
    var root = field.closest('.field');
    if (!root) return;
    var meter = root.querySelector('.pass-meter i');
    var hint = root.querySelector('.pass-hint span:last-child');
    if (meter) {
      meter.style.width = (n / 5 * 100) + '%';
      meter.style.background = n <= 1 ? '#e23c4b' : n === 2 ? '#ff7a1f' : n === 3 ? '#ffc24b' : n === 4 ? '#22c55e' : '#0fb986';
    }
    if (hint) hint.textContent = !v ? '\u2014' : 'OK (demo \u2014 not stored)';
    var rules = root.querySelectorAll('.pass-rules li');
    if (rules.length) {
      var st = passRulesState(v);
      Array.prototype.forEach.call(rules, function (li) {
        li.classList.toggle('met', !!st[li.getAttribute('data-rule')]);
      });
    }
  }

  function newError(msg) { toast('Hold on', msg, 'error'); }

  /* ---------- contact form (live regex validation) ---------- */
  var cform = document.getElementById('contactForm');
  if (cform) {
    var cMsgField = document.getElementById('cMessage');
    var cCount = document.getElementById('cCount');
    var cMax = 500;

    function cUpdCount() {
      if (!cCount || !cMsgField) return;
      var n = cMsgField.value.length;
      cCount.textContent = n;
      var w = document.querySelector('.msg-count') || cMsgField.parentElement;
      if (w) {
        w.classList.toggle('warn', n > 0 && n < 10);
        w.classList.toggle('full', n >= cMax);
      }
    }

    var cSetups = [
      makeValidator(document.getElementById('cName'), {
        required: true, reqMsg: 'Please enter your full name', okMsg: 'Looks good',
        validate: function (v) {
          if (v.length < 3) return { ok: false, msg: 'Name must be at least 3 characters' };
          if (v.length > 50) return { ok: false, msg: 'Name cannot exceed 50 characters' };
          if (!V.name.test(v)) return { ok: false, msg: 'Letters and spaces only' };
          return { ok: true };
        }
      }),
      makeValidator(document.getElementById('cEmail'), {
        required: true, reqMsg: 'Please enter your email address', okMsg: 'Looks good',
        validate: function (v) { return V.email.test(v) ? { ok: true } : { ok: false, msg: 'Enter a valid email (e.g. you@mail.com)' }; }
      }),
      makeValidator(document.getElementById('cPhone'), {
        required: true, reqMsg: 'Please enter your mobile number', okMsg: 'Looks good',
        validate: function (v) { return V.phone.test(v) ? { ok: true } : { ok: false, msg: 'Enter a valid 10-digit number starting with 6\u20139' }; }
      }),
      makeValidator(document.getElementById('cSubject'), {
        required: true, reqMsg: 'Please choose a subject', okMsg: 'Looks good',
        validate: function (v) { return v ? { ok: true } : { ok: false, msg: 'Please choose a subject' }; }
      }),
      makeValidator(cMsgField, {
        required: true, reqMsg: 'Please write a message', okMsg: 'Looks good',
        onInput: cUpdCount,
        validate: function (v) {
          if (v.length < 10) return { ok: false, msg: 'Message must be at least 10 characters' };
          if (v.length > cMax) return { ok: false, msg: 'Message cannot exceed ' + cMax + ' characters' };
          return { ok: true };
        }
      })
    ].filter(Boolean);

    cUpdCount();
    var cRefresh = bindFormGate(cform, cSetups, cform.querySelector('.btn-glitter'));
    cform._onValid = function () {
      toast('Message sent!', 'Our team will get back to you within 24 hours.');
      cform.reset();
      cSetups.forEach(function (s) { vSet(s.field, 'neutral'); });
      cUpdCount();
      cRefresh();
      setTimeout(function () { var b = cform.querySelector('.btn-glitter'); if (b) b.blur(); }, 50);
    };
  }

  /* ---------- newsletter ---------- */
  var nf = document.getElementById('newsletterForm');
  if (nf) {
    var nlEmail = nf.querySelector('input[type=email]');
    markClean(nf);
    liveCheck(nlEmail, { required: true, test: window.validators.email, msg: 'That doesn\u2019t look like a valid email', reqMsg: 'Please enter your email address' });
    nf.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = nlEmail.value.trim();
      if (!v) { setError(nlEmail, 'Please enter your email address'); return; }
      if (!window.validators.email.test(v)) { setError(nlEmail, 'That doesn\u2019t look like a valid email'); return; }
      clearError(nlEmail);
      var wrap = nlEmail.closest('.field');
      if (wrap) {
        wrap.classList.add('ok');
        var okEl = wrap.querySelector('.form-success');
        if (okEl) okEl.textContent = '\u2713 You\u2019re subscribed \u2014 welcome to the Stackly family!';
        setTimeout(function () { clearError(nlEmail); }, 3000);
      }
      toast('Subscribed!', 'Welcome to the Stackly family.');
      nf.reset();
    });
  }

  /* ---------- FAQ accordion ---------- */
  $all('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;
    q.setAttribute('aria-expanded', 'false');
    q.addEventListener('click', function () {
      var open = item.classList.contains('open');
      $all('.faq-item.open').forEach(function (o) { o.classList.remove('open'); o.querySelector('.faq-q').setAttribute('aria-expanded', 'false'); });
      if (!open) { item.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- menu filter ---------- */
  var filterBar = document.querySelector('.filter-bar');
  if (filterBar) {
    filterBar.addEventListener('click', function (e) {
      var chip = e.target.closest('.filter-chip');
      if (!chip) return;
      $all('.filter-chip', filterBar).forEach(function (c) { c.classList.remove('on'); });
      chip.classList.add('on');
      var f = byData(chip, 'filter');
      filterDishes(f, '');
    });
  }
  function filterDishes(f, q) {
    $all('.dish-card').forEach(function (card) {
      var catOk = !f || f === 'all' || byData(card, 'cat') === f;
      var txt = card.textContent.toLowerCase();
      var qOk = !q || txt.indexOf(q) !== -1;
      var show = catOk && qOk;
      card.classList.toggle('hide', !show);
      if (show) { card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop'); }
    });
  }
  var dishSearch = document.getElementById('dishSearch');
  if (dishSearch) {
    dishSearch.addEventListener('input', function () {
      var onChip = document.querySelector('.filter-chip.on');
      var f = onChip ? byData(onChip, 'filter') : 'all';
      filterDishes(f, dishSearch.value.trim().toLowerCase());
    });
  }

  /* ---------- blog filter ---------- */
  var blogBar = document.getElementById('blogFilterBar');
  if (blogBar) {
    blogBar.addEventListener('click', function (e) {
      var chip = e.target.closest('.filter-chip');
      if (!chip) return;
      $all('.filter-chip', blogBar).forEach(function (c) { c.classList.remove('on'); });
      chip.classList.add('on');
      var f = byData(chip, 'filter');
      $all('.blog-card').forEach(function (card) {
        var show = !f || f === 'all' || byData(card, 'cat') === f;
        card.classList.toggle('hide', !show);
        if (show) { card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop'); }
      });
    });
  }

  /* ---------- password helpers ---------- */
  $all('[data-toggle-pass]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = document.getElementById(byData(btn, 'toggle-pass'));
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.innerHTML = input.type === 'password' ? '&#128065;' : '&#128064;';
    });
  });

  /* ---------- role switch ---------- */
  function bindRoleSwitch(root) {
    var thumb = root.querySelector('.role-thumb');
    var opts = $all('.role-opt', root);
    opts.forEach(function (opt) {
      opt.addEventListener('click', function () {
        var isAdmin = opt.classList.contains('admin');
        if (thumb) thumb.classList.toggle('admin', isAdmin);
        opts.forEach(function (o) { o.classList.remove('on'); });
        opt.classList.add('on');
        var inp = opt.querySelector('input');
        if (inp) inp.checked = true;
      });
    });
  }
  $all('.role-switch').forEach(bindRoleSwitch);

  function getRole() {
    var on = document.querySelector('.role-switch .role-opt.on');
    return on ? (on.classList.contains('admin') ? 'admin' : 'customer') : 'customer';
  }

  /* ---------- auth helpers ---------- */
  function dashURL(role) { return role === 'admin' ? 'admin-dashboard.html' : 'customer-dashboard.html'; }

  /* ---------- SIGNUP (live regex validation) ---------- */
  var sform = document.getElementById('signupForm');
  if (sform) {
    var sPass = sform.password;
    var sConfirm = sform.confirm;
    var sTerms = document.getElementById('terms');

    var sSetups = [
      makeValidator(sform.fullName, {
        required: true, reqMsg: 'Please enter your full name', okMsg: 'Looks good',
        validate: function (v) {
          if (v.length < 3) return { ok: false, msg: 'Name must be at least 3 characters' };
          if (v.length > 50) return { ok: false, msg: 'Name cannot exceed 50 characters' };
          if (!/^[A-Za-z]+(?:[ ][A-Za-z]+)*$/.test(v)) return { ok: false, msg: 'Letters and spaces only (single spaces)' };
          return { ok: true };
        }
      }),
      makeValidator(sform.email, {
        required: true, reqMsg: 'Please enter your email', okMsg: 'Looks good',
        validate: function (v) { return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v) ? { ok: true } : { ok: false, msg: 'Enter a valid email (e.g. you@mail.com)' }; }
      }),
      makeValidator(sform.phone, {
        required: true, reqMsg: 'Please enter your mobile number', okMsg: 'Looks good',
        validate: function (v) { return /^[6-9]\d{9}$/.test(v) ? { ok: true } : { ok: false, msg: 'Enter a valid 10-digit number starting with 6\u20139' }; }
      }),
      makeValidator(sPass, {
        required: true, reqMsg: 'Please create a password', okMsg: 'Looks good',
        validate: function (v) { return v.length >= 4 ? { ok: true } : { ok: false, msg: 'Any 4+ characters (demo \u2014 not stored)' }; }
      }),
      makeValidator(sConfirm, {
        required: true, reqMsg: 'Please confirm your password', okMsg: 'Passwords match',
        validate: function (v) { return v === (sPass ? sPass.value : '') ? { ok: true } : { ok: false, msg: 'Passwords do not match' }; }
      }),
      makeValidator(sTerms, {
        required: true, msg: 'Please accept the Terms and Privacy Policy', okMsg: ''
      })
    ].filter(Boolean);

    var sRefresh = bindFormGate(sform, sSetups, sform.querySelector('.btn-glitter'));
    sform._onValid = function () {
      var role = getRole();
      toast('Account created!', 'Welcome to Stackly. Now log in as ' + role + '.');
      setTimeout(function () { location.href = 'login.html'; }, 900);
    };
  }

  /* ---------- LOGIN (live regex validation) ---------- */
  var lform = document.getElementById('loginForm');
  if (lform) {
    var lSetups = [
      makeValidator(lform.email, {
        required: true, reqMsg: 'Please enter your email', okMsg: 'Looks good',
        validate: function (v) { return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v) ? { ok: true } : { ok: false, msg: 'Enter a valid email (e.g. you@mail.com)' }; }
      }),
      makeValidator(lform.password, {
        required: true, reqMsg: 'Please enter your password', okMsg: 'Looks good',
        validate: function (v) { return v.length >= 1 ? { ok: true } : { ok: false, msg: 'Please enter a password' }; }
      })
    ].filter(Boolean);

    var lRefresh = bindFormGate(lform, lSetups, lform.querySelector('.btn-glitter'));
    lform._onValid = function () {
      var role = getRole();
      toast('Welcome back!', 'Redirecting to your ' + role + ' demo dashboard...');
      setTimeout(function () { location.href = dashURL(role); }, 900);
    };
    if (lRefresh) lRefresh();
  }

  /* ---------- dashboard catch-all: every button / CTA (except nav + logout) -> 404dash ---------- */
  if (document.querySelector('.dash-layout')) {
    document.addEventListener('click', function (e) {
      var el = e.target;
      if (!el || !el.closest) return;
      if (el.closest('.dash-nav .dash-link')) return;
      if (el.closest('.js-logout')) return;
      if (el.closest('.dash-avatar')) return;
      if (el.closest('.js-order-again')) return;
      if (el.closest('.burger, .sidebar-close, .skip-link')) return;
      var go = el.closest('button') || (el.closest('a[href]') && el.closest('a[href]').getAttribute('href') !== '#');
      if (!go) return;
      if (el.closest('form')) return;
      e.preventDefault();
      e.stopPropagation();
      window.go404();
    });
  }

  /* ---------- logout ---------- */
  $all('.js-logout').forEach(function (btn) {
    btn.addEventListener('click', function () {
      toast('Signed out', 'See you soon!');
      setTimeout(function () { location.href = 'login.html'; }, 700);
    });
  });

  /* ---------- back buttons ---------- */
  var BACK_TO_HOME = CURRENT === 'login.html' || CURRENT === 'signup.html';
  $all('.js-back').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (BACK_TO_HOME) { location.href = 'index.html'; return; }
      if (history.length > 1) history.back();
      else location.href = IS_DASH ? 'customer-dashboard.html' : 'index.html';
    });
  });

  /* ---------- dashboard tab switching ---------- */
  var tabButtons = $all('[data-tab]');
  if (tabButtons.length) {
    tabButtons.forEach(function (tab) {
      tab.addEventListener('click', function () {
        $all('.dash-link[data-tab]').forEach(function (l) { l.classList.remove('on'); });
        var navBtn = tab.tagName === 'BUTTON' && tab.classList.contains('dash-link') ? tab : null;
        var target = document.getElementById('tab-' + byData(tab, 'tab'));
        if (target) {
          $all('.dash-tab').forEach(function (t) { t.classList.add('hidden-tab'); });
          target.classList.remove('hidden-tab');
          if (tab.classList.contains('dash-link')) tab.classList.add('on');
          else { var link = document.querySelector('.dash-link[data-tab="' + byData(tab, 'tab') + '"]'); if (link) link.classList.add('on'); }
          if (dashSide) setDashSide(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  /* ---------- dashboard inline forms (validation only, no storage) ---------- */
  var pname = document.getElementById('dashName');
  var profileSave = document.getElementById('dashProfileForm');
  if (pname && document.querySelector('.dash-layout') && profileSave) {
    liveCheck(document.getElementById('dashName'), { required: true, test: window.validators.name, msg: 'Enter a valid name', reqMsg: 'Please enter your name' });
    liveCheck(document.getElementById('dashEmail'), { required: true, test: window.validators.email, msg: 'Enter a valid email', reqMsg: 'Please enter your email' });
    liveCheck(document.getElementById('dashPhone'), { required: true, test: window.validators.phone, msg: 'Enter a valid 10-digit mobile number', reqMsg: 'Please enter your mobile number' });
    liveCheck(document.getElementById('dashAddress'), { required: true, test: function (a) { return a.length >= 5; }, msg: 'Enter your full address', reqMsg: 'Please enter your address' });
    profileSave.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      $all('.dark-field', profileSave).forEach(function (fd) {
        var inp = fd.querySelector('input, select, textarea');
        if (!inp) return;
        if (!inp.value.trim()) { fd.classList.add('error'); ok = false; }
        else {
          fd.classList.remove('error');
          if (inp.type === 'email' && !window.validators.email.test(inp.value)) { fd.classList.add('error'); ok = false; }
          if (inp.id === 'dashPhone' && !window.validators.phone.test(inp.value)) { fd.classList.add('error'); ok = false; }
        }
      });
      if (!ok) { toast('Check your details', 'Make sure all fields are correct (10-digit phone).', 'error'); return; }
      toast('Profile updated', 'This is a demo \u2014 nothing is stored.');
    });
  }

  /* ---------- document ready cosmetic ---------- */
  document.body.classList.add('page-fade');
})();