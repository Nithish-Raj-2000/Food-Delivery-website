/* ============================================================
   STACKLY — Global Engine (Vanilla JS)
   Animations · Navigation · Validation · Auth Flow
   ============================================================ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CURRENT = location.pathname.split('/').pop() || 'index.html';
  var IS_DASH = /dash/i.test(CURRENT);
  var CART_SK = 'stackly_cart';
  var WISH_SK = 'stackly_wishlist';

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
  /* ---------- catch-all 404: every CTA / button on public pages (cards are inert) ---------- */
  var PUBLIC_PAGES = ['index.html', 'about.html', 'services.html', 'menu.html', 'blogs.html', 'contact.html'];
  if (PUBLIC_PAGES.indexOf(CURRENT) > -1) {
    var ROUTE_SKIP = 'header, footer, .sidebar, .mini-drawer, .order-pop-overlay, .toast-stack, .faq-q, .filter-chip, .js-add-cart, .dish-wishlist, .js-copy, .js-404, .js-404dash, .breadcrumb, .skip-link, form';
    document.addEventListener('click', function (e) {
      var el = e.target;
      if (!el || !el.closest) return;
      if (el.closest(ROUTE_SKIP)) return;
      if (el.closest('a[href^="tel:"], a[href^="mailto:"]')) return;
      var card = el.closest('article[class*="card"], .tile, [class*="card"]');
      var link = el.closest('a');
      var btn = el.closest('button');
      if (card && !link && !btn) return;
      if (link || btn) { e.preventDefault(); window.go404(); }
    });
  }
  /* ---------- cart & wishlist (live) ---------- */
  if ($all('.js-cart-open, .js-wish-open').length) {
    var cart = [];
    var wish = [];
    function normalize(list) {
      if (!Array.isArray(list)) return [];
      return list.filter(function (it) { return it && typeof it === 'object' && (it.name || it.id); })
        .map(function (it) {
          var name = String(it.name || it.id || 'Dish');
          return {
            id: String(it.id || name.toLowerCase().replace(/\s+/g, '-')),
            name: name,
            price: Number(it.price) || 0,
            img: typeof it.img === 'string' ? it.img : '',
            qty: Math.max(1, parseInt(it.qty, 10) || 1)
          };
        });
    }
    function loadStore() {
      try { cart = getCart(); } catch (e) { cart = []; }
      try { wish = getWish(); } catch (e) { wish = []; }
    }
    loadStore();

    function money(n) { n = Number(n); if (!isFinite(n)) n = 0; return '&#8377;' + n.toLocaleString('en-IN'); }
    function dishFromCard(card) {
      var h = card.querySelector('h3');
      var pe = card.querySelector('.dish-price');
      var im = card.querySelector('.dish-card-media img');
      var name = h ? h.textContent.trim() : 'Dish';
      var price = pe ? parseFloat(pe.textContent.replace(/[^0-9.]/g, '')) : 0;
      if (!price) price = 0;
      return { id: name.toLowerCase().replace(/\s+/g, '-'), name: name, price: price, img: im ? im.getAttribute('src') : '' };
    }
    function saveC(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
    function subTotal() { return cart.reduce(function (s, it) { return s + it.price * it.qty; }, 0); }
    function wishTotal() { return wish.reduce(function (s, it) { return s + it.price; }, 0); }

    var dw = document.createElement('div');
    dw.id = 'stacklyChrome';
    dw.innerHTML =
      '<div class="drawer-overlay" id="mDOverlay" aria-hidden="true"></div>' +
      '<aside class="mini-drawer" id="mDrawer" aria-hidden="true" aria-label="Cart and wishlist">' +
        '<div class="drawer-head"><h3 id="mDTitle">Your Cart</h3><button class="drawer-close" id="mDClose" aria-label="Close cart and wishlist" type="button">&#10005;</button></div>' +
        '<div class="drawer-body"><div class="drawer-items" id="mDItems"></div></div>' +
        '<div class="drawer-foot"><div class="drawer-total"><span id="mDTotalLbl">Subtotal</span><b id="mDTotal">&#8377;0</b></div><button class="btn btn-primary btn-lg" id="mDCta" type="button">Place Order</button></div>' +
      '</aside>' +
      '<div class="order-pop-overlay" id="orderPop" aria-hidden="true"><div class="order-pop" role="dialog" aria-modal="true" aria-label="Order placed">' +
        '<span class="op-ico">&#10004;</span><b>Order Placed!</b><p id="orderPopMsg">Your food is on its way &#8212; see you in ~30 min.</p>' +
        '<button class="btn btn-primary btn-sm" id="opTrack" type="button">Track My Order</button>' +
        '<button class="op-close" id="opClose" type="button">Done</button>' +
      '</div></div>';
    document.body.appendChild(dw);

    var overlay = document.getElementById('mDOverlay');
    var drawer = document.getElementById('mDrawer');
    var DTitle = document.getElementById('mDTitle');
    var DItems = document.getElementById('mDItems');
    var DTotal = document.getElementById('mDTotal');
    var DTotalRow = DTotal ? DTotal.closest('.drawer-total') : null;
    var DTotalLbl = document.getElementById('mDTotalLbl');
    var DCta = document.getElementById('mDCta');
    var orderPop = document.getElementById('orderPop');
    var orderMsg = document.getElementById('orderPopMsg');
    var mode = 'cart';

    function refreshBadges() {
      loadStore();
      var cc = cart.reduce(function (s, it) { return s + it.qty; }, 0);
      $all('[data-cart-count]').forEach(function (b) { b.textContent = cc; });
      $all('[data-wish-count]').forEach(function (b) { b.textContent = wish.length; });
      $all('.js-wish-open').forEach(function (b) { b.classList.toggle('on', wish.length > 0); });
      $all('.js-cart-open').forEach(function (b) { b.classList.toggle('on', cc > 0); });
    }

    function syncStoreCheck() {
      if (window.syncStoreUI) window.syncStoreUI();
    }
    window._refreshStoreUI = function () { loadStore(); refreshBadges(); };

    function emptyHTML(kind) {
      return '<div class="drawer-empty"><span class="de-ico">' + (kind === 'cart' ? '&#128722;' : '&#9825;') + '</span><b>Your ' + kind + ' is empty</b><p>' + (kind === 'cart' ? 'Add your favourite dishes and they will appear here.' : 'Tap the heart on any dish to keep it here.') + '</p><a class="btn btn-primary btn-sm" href="menu.html">Browse The Menu</a></div>';
    }

    function render() {
      var isCart = mode === 'cart';
      DTitle.textContent = isCart ? 'Your Cart (' + cart.length + ')' : 'Your Wishlist (' + wish.length + ')';
      if (DTotalRow) DTotalRow.style.display = isCart ? '' : 'none';
      DTotalLbl.textContent = isCart ? 'Subtotal' : 'Wishlist value';
      DCta.innerHTML = isCart ? 'Place Order' : 'Move All To Cart';
      DTotal.innerHTML = money(isCart ? subTotal() : wishTotal());
      DItems.innerHTML = '';
      if (mode === 'cart') {
        if (!cart.length) { DItems.innerHTML = emptyHTML('cart'); return; }
        cart.forEach(function (it, idx) {
          var row = document.createElement('div');
          row.className = 'drawer-item';
          row.setAttribute('data-i', idx);
          row.innerHTML = '<img src="' + escHTML(it.img) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' +
            '<div class="di-info"><b>' + escHTML(it.name) + '</b><span>' + money(it.price) + '</span>' +
            '<div class="di-qty"><button data-q="dec" aria-label="Decrease quantity">&#8722;</button><span>' + it.qty + '</span><button data-q="inc" aria-label="Increase quantity">+</button></div></div>' +
            '<button class="di-x" data-x aria-label="Remove from cart">&#10005;</button>';
          DItems.appendChild(row);
        });
      } else {
        if (!wish.length) { DItems.innerHTML = emptyHTML('wish'); return; }
        wish.forEach(function (it, idx) {
          var row = document.createElement('div');
          row.className = 'drawer-item';
          row.setAttribute('data-w', idx);
          row.innerHTML = '<img src="' + escHTML(it.img) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' +
            '<div class="di-info"><b>' + escHTML(it.name) + '</b><span>' + money(it.price) + '</span></div>' +
            '<button class="di-move" data-move type="button">Move to cart</button>' +
            '<button class="di-x" data-xw aria-label="Remove from wishlist">&#10005;</button>';
          DItems.appendChild(row);
        });
      }
    }

    function openDrawer(m) {
      mode = m;
      render();
      drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
      overlay.classList.add('open'); overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
    }
    function closeDrawer() {
      drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true');
      overlay.classList.remove('open'); overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
    }

    function showOrderPop(msg) {
      orderMsg.textContent = msg;
      orderPop.classList.add('open'); orderPop.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      clearTimeout(showOrderPop._t);
      showOrderPop._t = setTimeout(closeOrderPop, 8000);
    }
    function closeOrderPop() {
      orderPop.classList.remove('open'); orderPop.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      clearTimeout(showOrderPop._t);
    }
    function placeOrder() {
      var n = cart.reduce(function (s, it) { return s + it.qty; }, 0);
      var sub = subTotal();
      var cust = null;
      try { cust = JSON.parse(localStorage.getItem(USER_KEY)); } catch (e) { }
      var order = {
        id: nextOrderId(),
        items: cart.map(function (it) { return { name: it.name, price: it.price, img: it.img, qty: it.qty }; }),
        subtotal: sub,
        restaurant: 'Stackly Kitchen',
        customer: cust && cust.name ? { name: cust.name, email: cust.email || '' } : { name: 'Guest Customer', email: '' },
        status: 'pending',
        time: Date.now()
      };
      var list = getOrders();
      list.unshift(order);
      saveOrders(list);
      cart = [];
      saveC(CART_SK, cart);
      refreshBadges();
      syncStoreCheck();
      closeDrawer();
      showOrderPop('Order ' + order.id + ' &#8212; ' + n + ' item' + (n === 1 ? '' : 's') + ' are being packed. ETA: 30 min.');
    }

    orderPop.addEventListener('click', function (e) { if (e.target === orderPop) closeOrderPop(); });
    document.getElementById('opClose').addEventListener('click', closeOrderPop);
    document.getElementById('opTrack').addEventListener('click', function (e) {
      e.preventDefault();
      closeOrderPop();
      window.go404();
    });

    function syncHearts() {
      $all('.dish-wishlist').forEach(function (btn) {
        var card = btn.closest('.dish-card'); if (!card) return;
        var dish = dishFromCard(card);
        var on = wish.filter(function (x) { return x.id === dish.id; }).length > 0;
        btn.classList.toggle('on', on);
        btn.innerHTML = on ? '&#10084;' : '&#9825;';
        btn.setAttribute('aria-label', on ? 'Remove from favourites' : 'Add to favourites');
      });
    }

    function addToCart(dish, silent) {
      var ex = cart.filter(function (x) { return x.id === dish.id; })[0];
      if (ex) { ex.qty += 1; } else { cart.push({ id: dish.id, name: dish.name, price: dish.price, img: dish.img, qty: 1 }); }
      saveC(CART_SK, cart);
      refreshBadges();
      syncStoreCheck();
      if (!silent) toast('Added to cart', '"' + dish.name + '" &#8226; ' + money(dish.price));
    }

    function toggleWish(btn) {
      var card = btn.closest('.dish-card'); if (!card) return;
      var dish = dishFromCard(card);
      var i = wish.map(function (x) { return x.id; }).indexOf(dish.id);
      if (i >= 0) { wish.splice(i, 1); toast('Removed', '"' + dish.name + '" left your wishlist.'); }
      else { wish.push(dish); toast('Saved to wishlist', '"' + dish.name + '" is yours to keep.'); }
      saveC(WISH_SK, wish); syncHearts(); refreshBadges(); syncStoreCheck();
    }

    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest('.js-wish-open')) { e.preventDefault(); openDrawer('wish'); return; }
      if (t.closest('.js-cart-open')) { e.preventDefault(); openDrawer('cart'); return; }
      var heart = t.closest('.dish-wishlist');
      if (heart) { e.preventDefault(); toggleWish(heart); }
    });
    drawer.querySelector('.drawer-close').addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

    DItems.addEventListener('click', function (e) {
      var t = e.target;
      var x = t.closest('[data-x]');
      var xw = t.closest('[data-xw]');
      var q = t.closest('[data-q]');
      var mv = t.closest('[data-move]');
      var row = t.closest('.drawer-item');
      if (!row || (!x && !xw && !q && !mv)) return;
      e.preventDefault();
      e.stopPropagation();
      if (x) {
        var i = parseInt(row.getAttribute('data-i'), 10);
        if (!isNaN(i) && cart[i]) cart.splice(i, 1);
        saveC(CART_SK, cart); refreshBadges(); render(); syncStoreCheck();
      } else if (xw) {
        var j = parseInt(row.getAttribute('data-w'), 10);
        if (!isNaN(j) && wish[j]) wish.splice(j, 1);
        saveC(WISH_SK, wish); refreshBadges(); syncHearts(); render(); syncStoreCheck();
      } else if (q) {
        var i2 = parseInt(row.getAttribute('data-i'), 10);
        if (!isNaN(i2) && cart[i2]) {
          if (q.getAttribute('data-q') === 'inc') { cart[i2].qty += 1; } else { cart[i2].qty -= 1; if (cart[i2].qty < 1) cart.splice(i2, 1); }
          saveC(CART_SK, cart); refreshBadges(); render(); syncStoreCheck();
        }
      } else if (mv) {
        var k = parseInt(row.getAttribute('data-w'), 10);
        if (!isNaN(k) && wish[k]) { addToCart(wish[k], true); wish.splice(k, 1); }
        saveC(WISH_SK, wish); refreshBadges(); syncHearts(); render(); syncStoreCheck();
        toast('Moved to cart', 'Your wishlist item is now in your cart.');
      }
    });

    DCta.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (mode === 'cart') {
        if (!cart.length) return;
        placeOrder();
      } else {
        if (!wish.length) return;
        var n = wish.length;
        wish.forEach(function (d) { addToCart(d, true); });
        wish = [];
        saveC(WISH_SK, wish); refreshBadges(); syncHearts(); render(); syncStoreCheck();
        toast('All sent to cart', n + ' item' + (n === 1 ? '' : 's') + ' moved to your cart.');
        openDrawer('cart');
      }
    });

    $all('.js-add-cart').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var card = btn.closest('.dish-card');
        if (card) addToCart(dishFromCard(card), false);
      });
    });

    refreshBadges();
    syncHearts();
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
    name: /^[A-Za-z][A-Za-z\s.'-]{1,49}$/,
    password: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
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
    if (hint) hint.textContent = !v ? '\u2014' : n <= 1 ? 'Weak' : n === 2 ? 'Weak' : n === 3 ? 'Fair' : n === 4 ? 'Good' : 'Strong';
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

  /* pre-select role remembered from signup */
  try {
    var wantRole = sessionStorage.getItem('stackly_want_role');
    if (wantRole) {
      sessionStorage.removeItem('stackly_want_role');
      var swHome = document.querySelector('.role-switch');
      if (swHome) {
        var wantOpt = swHome.querySelector('.role-opt.' + wantRole);
        if (wantOpt) wantOpt.click();
      }
    }
  } catch (e) { }

  /* ---------- AUTH STORE ---------- */
  var USER_KEY = 'stackly_user';
  var USERS_KEY = 'stackly_users';
  var DEMO = {
    admin: { name: 'Site Admin', email: 'admin@stackly.com', password: 'admin123', role: 'admin', phone: '9876543210' },
    customer: { name: 'Aarav Sharma', email: 'customer@stackly.com', password: 'customer123', role: 'customer', phone: '9876543211' }
  };
  function getUsers() {
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem(USERS_KEY)); } catch (e) { raw = null; }
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    return raw;
  }
  function saveUsers(u) {
    var clean = {};
    if (u && typeof u === 'object' && !Array.isArray(u)) clean = u;
    localStorage.setItem(USERS_KEY, JSON.stringify(clean));
  }
  function dashURL(role) { return role === 'admin' ? 'admin-dashboard.html' : 'customer-dashboard.html'; }

  /* ---------- SHARED ORDER STORE (circulates across every page) ---------- */
  var ORDERS_KEY = 'stackly_orders';
  function getOrders() {
    try { var o = JSON.parse(localStorage.getItem(ORDERS_KEY)); return Array.isArray(o) ? o : []; } catch (e) { return []; }
  }
  function saveOrders(list) {
    if (!Array.isArray(list)) list = [];
    try { localStorage.setItem(ORDERS_KEY, JSON.stringify(list)); } catch (e) { }
  }
  function nextOrderId() {
    var max = 2072;
    getOrders().forEach(function (o) {
      var m = /^STK-(\d+)$/.exec(String(o.id || ''));
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return 'STK-' + (max + 1);
  }
  function orderStatusInfo(st) {
    if (st === 'onway') return { chip: 'onway', label: 'On the way', admin: 'Rider' };
    if (st === 'delivered') return { chip: 'done', label: 'Delivered', admin: 'Delivered' };
    if (st === 'cancelled') return { chip: 'cancel', label: 'Refunded', admin: 'Refunded' };
    return { chip: 'pending', label: 'Pending', admin: 'Kitchen' };
  }
  function formatOrderTime(t) {
    var d = new Date(t);
    if (isNaN(d.getTime())) return 'Today';
    var today = new Date(); var same = new Date(t);
    if (d.toDateString() === today.toDateString()) {
      var h = d.getHours(); var ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
      return 'Today ' + h + ':' + ('0' + d.getMinutes()).slice(-2) + ' ' + ap;
    }
    var diff = Math.round((today - same) / 86400000);
    if (diff === 1) return 'Yesterday';
    return d.toLocaleDateString('en-in', { weekday: 'short' });
  }
  function moneyNice(n) { n = Number(n); if (!isFinite(n) || n < 0) n = 0; return '&#8377;' + n.toLocaleString('en-IN'); }

  /* ---------- SHARED CART / WISHLIST ACCESSORS (any page) ---------- */
  var CART_SK = 'stackly_cart';
  var WISH_SK = 'stackly_wishlist';
  function dishClean(it) {
    if (!it || typeof it !== 'object') return null;
    var name = String(it.name || it.id || 'Dish');
    return {
      id: String(it.id || name.toLowerCase().replace(/\s+/g, '-')),
      name: name,
      price: Number(it.price) || 0,
      img: typeof it.img === 'string' ? it.img : '',
      qty: Math.max(1, parseInt(it.qty, 10) || 1)
    };
  }
  function getCart() {
    try { var c = JSON.parse(localStorage.getItem(CART_SK)); return Array.isArray(c) ? c.map(dishClean).filter(Boolean) : []; } catch (e) { return []; }
  }
  function getWish() {
    try { var w = JSON.parse(localStorage.getItem(WISH_SK)); return Array.isArray(w) ? w.map(dishClean).filter(Boolean) : []; } catch (e) { return []; }
  }
  function storeList(k, v) { try { localStorage.setItem(k, JSON.stringify(v || [])); } catch (e) { } }
  function addToCartStore(dish) {
    var cart = getCart();
    var d = dishClean(dish) || { id: 'dish', name: 'Dish', price: 0, img: '', qty: 1 };
    var ex = cart.filter(function (x) { return x.id === d.id; })[0];
    if (ex) ex.qty += 1; else cart.push(d);
    storeList(CART_SK, cart);
    syncGlobalStore();
    toast('Added to cart', '"' + d.name + '" &#8226; ' + moneyNice(d.price));
    return cart;
  }

  function syncGlobalStore() {
    if (window._refreshStoreUI) window._refreshStoreUI();
    if (window._renderCustomer) window._renderCustomer();
    if (window._renderAdmin) window._renderAdmin();
  }
  window.syncStoreUI = syncGlobalStore;

  /* demo chip autofill */
  $all('[data-demo]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var which = byData(chip, 'demo');
      var d = DEMO[which];
      var set = function (id, v) {
        var el = document.getElementById(id);
        if (!el) return;
        el.value = v;
        try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) { }
      };
      var setRole = function (role) {
        var sw = document.querySelector('.role-switch');
        if (!sw) return;
        var opt = sw.querySelector('.role-opt.' + role);
        if (opt) { opt.click(); }
      };
      if (which === 'admin' || which === 'customer') {
        set('email', d.email);
        set('password', d.password);
        setRole(which);
      }
      toast('Demo credentials set', 'Now press Log In to explore the ' + which + ' dashboard.');
    });
  });

  /* ---------- SIGNUP (live regex validation) ---------- */
  var sform = document.getElementById('signupForm');
  if (sform) {
    var sPass = sform.password;
    var sConfirm = sform.confirm;
    var sTerms = document.getElementById('terms');

    function sPaint() { if (sPass) paintMeter(sPass); }

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
        required: true, reqMsg: 'Please create a password', okMsg: 'Strong password', onInput: sPaint,
        validate: function (v) {
          if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,64}$/.test(v)) {
            var miss = [];
            if (v.length < 8) miss.push('8+ characters');
            if (!/[a-z]/.test(v)) miss.push('a lowercase letter');
            if (!/[A-Z]/.test(v)) miss.push('an uppercase letter');
            if (!/\d/.test(v)) miss.push('a number');
            if (!/[^A-Za-z0-9\s]/.test(v)) miss.push('a special character');
            return { ok: false, msg: 'Add ' + miss.slice(0, 2).join(', ') };
          }
          return { ok: true };
        }
      }),
      makeValidator(sConfirm, {
        required: true, reqMsg: 'Please confirm your password', okMsg: 'Passwords match',
        validate: function (v) { return v === (sPass ? sPass.value : '') ? { ok: true } : { ok: false, msg: 'Passwords do not match' }; }
      }),
      makeValidator(sTerms, {
        required: true, msg: 'Please accept the Terms and Privacy Policy', okMsg: ''
      })
    ].filter(Boolean);

    if (sPass) sPass.addEventListener('input', function () {
      sPaint();
      if (sConfirm && sConfirm.value) {
        var cm = sConfirm.value === sPass.value;
        vSet(sConfirm, cm ? 'good' : 'bad', cm ? '' : 'Passwords do not match', cm ? 'Passwords match' : '');
      }
    });
    sPaint();

    var sRefresh = bindFormGate(sform, sSetups, sform.querySelector('.btn-glitter'));
    sform._onValid = function () {
      var users = getUsers();
      var email = sform.email.value.trim().toLowerCase();
      if (users[email]) { vSet(sform.email, 'bad', 'An account with this email already exists'); sform.email.focus(); return; }
      var role = getRole();
      users[email] = { name: sform.fullName.value.trim(), email: email, phone: sform.phone.value.trim(), password: sform.password.value.trim(), role: role };
      saveUsers(users);
      try { sessionStorage.setItem('stackly_want_role', role); } catch (e) { }
      toast('Account created!', 'Welcome to Stackly. Now log in as ' + role + '.');
      setTimeout(function () { location.href = 'login.html'; }, 900);
    };
  }

  /* ---------- LOGIN (live regex validation) ---------- */
  var lform = document.getElementById('loginForm');
  if (lform) {
    var lPass = lform.password;
    function lPaint() { if (lPass) paintMeter(lPass); }

    var lSetups = [
      makeValidator(lform.email, {
        required: true, reqMsg: 'Please enter your email', okMsg: 'Looks good',
        validate: function (v) { return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v) ? { ok: true } : { ok: false, msg: 'Enter a valid email (e.g. you@mail.com)' }; }
      }),
      makeValidator(lPass, {
        required: true, reqMsg: 'Please enter your password', okMsg: 'Password entered', onInput: lPaint,
        validate: function (v) { return v.length >= 1 ? { ok: true } : { ok: false, msg: 'Please enter your password' }; }
      })
    ].filter(Boolean);

    lPaint();
    var lRefresh = bindFormGate(lform, lSetups, lform.querySelector('.btn-glitter'));
    lform._onValid = function () {
      var email = lform.email.value.trim().toLowerCase();
      var pw = lform.password.value;
      var wantRole = getRole();
      var users = getUsers();
      var user = users[email];
      if (!user && email === DEMO.admin.email) user = DEMO.admin;
      if (!user && email === DEMO.customer.email) user = DEMO.customer;
      if (!user) { vSet(lform.email, 'bad', 'No account found. Please sign up first.'); newError('No account found'); return; }
      if (user.password !== pw) { vSet(lform.password, 'bad', 'Incorrect password'); newError('Incorrect password'); return; }
      if (user.role !== wantRole) {
        newError('Role mismatch');
        var sw = document.querySelector('.role-switch');
        if (sw) { var opt = sw.querySelector('.role-opt.' + user.role); if (opt) opt.click(); }
        toast('Select the ' + user.role.toUpperCase() + ' role', 'Your account is registered as ' + user.role + '.');
        return;
      }
      localStorage.setItem(USER_KEY, JSON.stringify({ name: user.name, email: user.email, role: user.role, phone: user.phone }));
      toast('Welcome back, ' + user.name.split(' ')[0] + '!', 'Redirecting to your ' + user.role + ' dashboard...');
      setTimeout(function () { location.href = dashURL(user.role); }, 900);
    };
    if (lRefresh) lRefresh();
  }

  /* ---------- dashboard guard ---------- */
  var dashMain = document.querySelector('.dash-layout');
  if (dashMain) {
    var sess = null;
    try { sess = JSON.parse(localStorage.getItem(USER_KEY)); } catch (e) { }
    var needRole = CURRENT.indexOf('admin') === 0 ? 'admin' : 'customer';
    var needName = needRole === 'admin' ? 'Admin' : 'Customer';
    if (!sess || !sess.role) { location.replace('login.html'); }
    else if (sess.role !== needRole) { location.replace(dashURL(sess.role)); }
    else {
      document.body.classList.remove('no-scroll');
      var nm = document.querySelectorAll('.dash-user-name');
      nm.forEach(function (el) { el.textContent = sess.name; });
      var av = document.querySelectorAll('.dash-avatar');
      av.forEach(function (el) { el.textContent = sess.name.trim().charAt(0).toUpperCase(); if (needRole === 'admin') el.classList.add('violet'); });
      var roleTag = $all('.dash-role-badge');
      roleTag.forEach(function (el) { el.textContent = needName; });
      var emailEl = document.querySelector('.dash-email');
      if (emailEl) emailEl.textContent = sess.email;
    }
  }

  /* ---------- dashboard catch-all: every button / CTA (except nav + logout) -> 404dash ---------- */
  if (dashMain) {
    document.addEventListener('click', function (e) {
      var el = e.target;
      if (!el || !el.closest) return;
      if (el.closest('.dash-nav .dash-link')) return;
      if (el.closest('.js-logout')) return;
      if (el.closest('.dash-avatar')) return;
      if (el.closest('.js-cart-open, .js-wish-open')) return;
      if (el.closest('.mini-drawer, .drawer-overlay, .order-pop-overlay')) return;
      if (el.closest('.burger, .sidebar-close, .skip-link')) return;
      var go = el.closest('button') || (el.closest('a[href]') && el.closest('a[href]').getAttribute('href') !== '#');
      if (!go) return;
      if (el.closest('[data-advance]')) return;
      if (el.closest('.js-order-again')) return;
      if (el.closest('form')) return;
      e.preventDefault();
      e.stopPropagation();
      window.go404();
    });
  }

  /* ---------- CUSTOMER DASHBOARD LIVE DATA (orders · favourites · wallet) ---------- */
  if (dashMain && CURRENT === 'customer-dashboard.html') {
    var _custOrders = function () {
      var sessMail = '', sessName = '';
      try { var su = JSON.parse(localStorage.getItem(USER_KEY)); sessMail = (su && su.email) || ''; sessName = (su && su.name) || ''; } catch (e) { }
      var all = getOrders().slice().sort(function (a, b) { return (b.time || 0) - (a.time || 0); });
      if (!sessMail) return { all: all, mine: all };
      return { all: all, mine: all.filter(function (o) { return o.customer && o.customer.email === sessMail; }) };
    };

    function renderCustomer() {
      var orders = _custOrders();
      var mine = orders.mine.length ? orders.mine : orders.all;
      var badge = document.getElementById('orderCount');
      if (badge) badge.textContent = mine.length;

      var tot = document.getElementById('cTotalOrders');
      if (tot) tot.innerHTML = mine.length;
      var spent = document.getElementById('cTotalSpent');
      if (spent) spent.innerHTML = moneyNice(mine.reduce(function (s, o) { return s + (o.subtotal || 0); }, 0));

      var recent = document.getElementById('recentOrders');
      if (recent) {
        recent.innerHTML = '';
        mine.slice(0, 3).forEach(function (o) {
          var first = (o.items && o.items[0]) || {};
          var st = orderStatusInfo(o.status);
          var el = document.createElement('div');
          el.className = 'dash-order-card';
          el.innerHTML = '<img src="' + escHTML(first.img || '') + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' +
            '<div class="do-body"><h4>' + escHTML(first.name || 'Order') + ' <span style="font-size:.8rem;color:rgba(255,255,255,.4)">&#8226; #' + escHTML(o.id || '') + '</span></h4>' +
            '<p>' + escHTML((o.customer && o.customer.name) || 'Stackly') + ' &#8226; ' + (o.items ? o.items.length : 0) + ' item' + ((o.items && o.items.length) === 1 ? '' : 's') + '</p></div>' +
            '<span class="chip ' + st.chip + '">' + st.label + '</span>';recent.appendChild(el);
        });
        if (!mine.length) recent.innerHTML = '<div class="drawer-empty" style="padding:28px 0"><b>No orders yet</b><p>Open the menu and place your first order!</p><a class="btn btn-primary btn-sm" href="menu.html">Browse Menu</a></div>';
      }

      var rows = document.getElementById('orderRows');
      if (rows) {
        rows.innerHTML = '';
        mine.forEach(function (o) {
          var first = (o.items && o.items[0]) || {};
          var st = orderStatusInfo(o.status);
          var span = document.createElement('span');
          span.className = 'chip ' + st.chip;
          span.textContent = st.label;
          var tr = document.createElement('tr');
          tr.innerHTML = '<td><div class="food"><img src="' + escHTML(first.img || '') + '" alt="" onerror="this.style.display=\'none\'"><b>' + escHTML(first.name || o.id || 'Order') + (o.items && o.items.length > 1 ? (' x' + o.items.length) : '') + '</b></div></td>' +
            '<td>' + escHTML((o.customer && o.customer.name) || 'Stackly') + '</td>' +
            '<td>' + moneyNice(o.subtotal) + '</td>';
          var td = document.createElement('td'); td.appendChild(span); tr.appendChild(td);
          tr.innerHTML += '<td>' + formatOrderTime(o.time) + '</td>';
          rows.appendChild(tr);
        });
        if (!mine.length) rows.innerHTML = '<tr><td colspan="5" style="color:rgba(255,255,255,.45);text-align:center">Place an order and it will show up here.</td></tr>';
      }

      var fav = document.getElementById('favGrid');
      if (fav) {
        var wish = getWish();
        var favBadge = document.getElementById('favCount');
        if (favBadge) favBadge.textContent = wish.length;
        fav.innerHTML = '';
        if (!wish.length) {
          fav.innerHTML = '<div class="drawer-empty" style="padding:28px 0;grid-column:1/-1"><b>Your wishlist is empty</b><p>Tap the heart on any dish to keep it here.</p><a class="btn btn-primary btn-sm" href="menu.html">Browse Menu</a></div>';
          return;
        }
        wish.forEach(function (it) {
          var el = document.createElement('div');
          el.className = 'dash-order-card';
          el.innerHTML = '<img src="' + escHTML(it.img) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' +
            '<div class="do-body"><h4>' + escHTML(it.name) + '</h4><p>' + moneyNice(it.price) + '</p></div>' +
            '<button class="btn btn-primary btn-sm js-order-again" data-name="' + escHTML(it.name) + '" data-price="' + it.price + '" data-img="' + escHTML(it.img) + '" type="button">Order again</button>';
          fav.appendChild(el);
        });
      }
    }

    document.addEventListener('click', function (e) {
      var oa = e.target.closest('.js-order-again');
      if (!oa || !dashMain) return;
      e.preventDefault();
      addToCartStore({ id: null, name: oa.getAttribute('data-name'), price: oa.getAttribute('data-price'), img: oa.getAttribute('data-img'), qty: 1 });
    });

    renderCustomer();
    window._renderCustomer = renderCustomer;
  }

  /* ---------- ADMIN DASHBOARD LIVE DATA (orders · revenue · customers) ---------- */
  if (dashMain && CURRENT === 'admin-dashboard.html') {
    function orderLabels(o) {
      var first = (o.items && o.items[0]) || {};
      return {
        name: first.name || 'Order',
        img: first.img || '',
        qty: o.items ? o.items.reduce(function (s, it) { return s + (it.qty || 1); }, 0) : 1,
        cust: (o.customer && o.customer.name) || 'Guest',
        amount: o.subtotal || 0,
        st: orderStatusInfo(o.status),
        time: formatOrderTime(o.time)
      };
    }
    function renderAdmin() {
      var orders = getOrders().slice().sort(function (a, b) { return (b.time || 0) - (a.time || 0); });
      var notif = document.querySelector('.dash-link[data-tab="orders"] .notif');
      if (notif) notif.textContent = orders.length;

      var startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
      var today = orders.filter(function (o) { return (o.time || 0) >= startOfDay.getTime(); });
      var rev = document.getElementById('aRevenue');
      if (rev) rev.innerHTML = moneyNice(today.reduce(function (s, o) { return s + (o.subtotal || 0); }, 0));
      var ot = document.getElementById('aOrdersToday');
      if (ot) ot.textContent = today.length;
      var ac = document.getElementById('aCustomers');
      if (ac) ac.textContent = Object.keys(getUsers()).length + 2;

      /* live orders: only pending + onway, latest 6 */
      var live = document.getElementById('liveRows');
      if (live) {
        live.innerHTML = '';
        orders.filter(function (o) { return o.status === 'pending' || o.status === 'onway'; }).slice(0, 6).forEach(function (o) {
          var L = orderLabels(o);
          live.innerHTML += '<tr><td><div class="food"><img src="' + escHTML(L.img) + '" alt="" onerror="this.style.display=\'none\'"><b>' + escHTML(L.name) + ' x' + L.qty + '</b></div></td><td>' + escHTML(L.cust) + '</td><td>' + moneyNice(L.amount) + '</td><td><span class="chip ' + L.st.chip + '">' + L.st.admin + '</span></td><td>--</td></tr>';
        });
        if (!orders.filter(function (o) { return o.status === 'pending' || o.status === 'onway'; }).length) {
          live.innerHTML = '<tr><td colspan="5" style="color:rgba(255,255,255,.45);text-align:center">No live orders right now.</td></tr>';
        }
      }

      /* all orders */
      var allRows = document.getElementById('allOrderRows');
      if (allRows) {
        allRows.innerHTML = '';
        orders.slice(0, 50).forEach(function (o) {
          var L = orderLabels(o);
          allRows.innerHTML += '<tr><td>STK-' + escHTML(String(o.id || '').replace(/^STK-/, '')) + '</td><td><div class="food"><img src="' + escHTML(L.img) + '" alt="" onerror="this.style.display=\'none\'"><b>' + escHTML(L.name) + (L.qty > 1 ? ' x' + L.qty : '') + '</b></div></td><td>' + escHTML(L.cust) + '</td><td>' + moneyNice(L.amount) + '</td><td><span class="chip ' + L.st.chip + '">' + L.st.admin + '</span></td><td><button type="button" class="btn btn-ghost btn-sm" data-advance="' + escHTML(o.id) + '" style="padding:4px 10px;font-size:.72rem;color:#fff;border-color:var(--dark-line)">' + (o.status === 'pending' ? 'Send' : o.status === 'onway' ? 'Done' : '&mdash;') + '</button></td></tr>';
        });
        if (!orders.length) allRows.innerHTML = '<tr><td colspan="6" style="color:rgba(255,255,255,.45);text-align:center">No orders yet.</td></tr>';
      }

      /* customers */
      var custRows = document.getElementById('custRows');
      if (custRows) {
        custRows.innerHTML = '';
        var map = {};
        orders.forEach(function (o) {
          var em = (o.customer && o.customer.email) || 'guest';
          if (!map[em]) map[em] = { name: (o.customer && o.customer.name) || 'Guest', n: 0, spent: 0 };
          map[em].n += 1; map[em].spent += (o.subtotal || 0);
        });
        Object.keys(map).slice(0, 8).forEach(function (em) {
          custRows.innerHTML += '<tr><td><b>' + escHTML(map[em].name) + '</b></td><td>' + map[em].n + '</td><td>' + moneyNice(map[em].spent) + '</td><td><span class="chip pending">Silver</span></td></tr>';
        });
        if (!Object.keys(map).length) custRows.innerHTML = '<tr><td colspan="4" style="color:rgba(255,255,255,.45);text-align:center">No customer data yet.</td></tr>';
      }
    }

    document.addEventListener('click', function (e) {
      var adv = e.target.closest('[data-advance]');
      if (!adv) return;
      e.preventDefault();
      var id = adv.getAttribute('data-advance');
      var orders = getOrders();
      var o = orders.filter(function (x) { return x.id === id; })[0];
      if (!o) return;
      o.status = o.status === 'pending' ? 'onway' : o.status === 'onway' ? 'delivered' : o.status;
      saveOrders(orders);
      renderAdmin();
      toast('Order updated', '#' + id + ' is now ' + orderStatusInfo(o.status).label + '.');
    });

    renderAdmin();
    window._renderAdmin = renderAdmin;
  }

  /* redraw dashboards when another tab places / advances an order */
  window.addEventListener('storage', function (e) {
    if (e.key === ORDERS_KEY || e.key === CART_SK || e.key === WISH_SK) {
      syncGlobalStore();
    }
  });
  setInterval(function () {
    syncGlobalStore();
  }, 5000);

  /* ---------- logout ---------- */
  $all('.js-logout').forEach(function (btn) {
    btn.addEventListener('click', function () {
      localStorage.removeItem(USER_KEY);
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

  /* ---------- dashboard home (role-aware) ---------- */
  try {
    var sess0 = JSON.parse(localStorage.getItem(USER_KEY)) || null;
    $all('.js-dash-home').forEach(function (a) {
      if (sess0 && sess0.role) a.href = sess0.role === 'admin' ? 'admin-dashboard.html' : 'customer-dashboard.html';
      a.addEventListener('click', function () { try { sessionStorage.removeItem('stackly_ret_tab'); } catch (e) { } });
    });
  } catch (e) { }

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

  /* ---------- restore active tab after 404 round-trip ---------- */
  if (dashMain) {
    function clearRetTab() { try { sessionStorage.removeItem('stackly_ret_tab'); } catch (e) { } }
    var retTab = '';
    try { retTab = sessionStorage.getItem('stackly_ret_tab') || ''; } catch (e) { }
    if (retTab) {
      var retLink = document.querySelector('.dash-link[data-tab="' + retTab + '"]');
      if (retLink) retLink.click();
      clearRetTab();
    }
    window.addEventListener('pageshow', function (e) { if (e.persisted) clearRetTab(); });
  }

  /* ---------- dashboard inline forms prefill ---------- */
  var pname = document.getElementById('dashName');
  if (pname && dashMain) {
    try {
      var su = JSON.parse(localStorage.getItem(USER_KEY));
      if (su) {
        var nmv = document.getElementById('dashName'); if (nmv) nmv.value = su.name;
        var emv = document.getElementById('dashEmail'); if (emv && emv.tagName === 'INPUT') emv.value = su.email;
        var pwv = document.getElementById('dashPhone');
        var profileSave = document.getElementById('dashProfileForm');
        if (profileSave) {
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
            if (su) { su.name = document.getElementById('dashName').value.trim(); su.phone = document.getElementById('dashPhone').value.trim(); localStorage.setItem(USER_KEY, JSON.stringify(su)); }
            toast('Profile updated', 'Your details have been saved.');
          });
        }
      }
    } catch (e) { }
  }

  /* ---------- document ready cosmetic ---------- */
  document.body.classList.add('page-fade');
})();