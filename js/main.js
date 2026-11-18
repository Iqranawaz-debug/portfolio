/* Iqra Nawaz — portfolio interactions. No dependencies. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- theme ---------- */
  var themeBtn = $('.theme-toggle');
  var themeMeta = $('meta[name="theme-color"]');
  function applyTheme(t) {
    doc.dataset.theme = t;
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    if (themeMeta) themeMeta.content = t === 'dark' ? '#0c0d10' : '#f7f4ee';
  }
  applyTheme(doc.dataset.theme || 'dark');
  themeBtn.addEventListener('click', function () {
    var next = doc.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- colour palette ---------- */
  var paletteBtn = $('.palette-toggle');
  var palettes = [['coral', 'Coral and teal'], ['violet', 'Violet and amber'], ['ocean', 'Blue and rose']];
  function paletteIndex() {
    for (var i = 0; i < palettes.length; i++) if (palettes[i][0] === doc.dataset.palette) return i;
    return 0;
  }
  function labelPalette() {
    var i = paletteIndex();
    paletteBtn.setAttribute('aria-label', 'Colour palette: ' + palettes[i][1] + '. Switch to ' + palettes[(i + 1) % palettes.length][1]);
  }
  labelPalette();
  paletteBtn.addEventListener('click', function () {
    var next = palettes[(paletteIndex() + 1) % palettes.length][0];
    if (next === 'coral') doc.removeAttribute('data-palette'); else doc.dataset.palette = next;
    try { localStorage.setItem('palette', next); } catch (e) {}
    labelPalette();
  });

  /* ---------- mobile nav ---------- */
  var navToggle = $('.nav-toggle');
  var navMenu = $('#nav-menu');
  function closeNav() { navToggle.setAttribute('aria-expanded', 'false'); navMenu.classList.remove('is-open'); }
  navToggle.addEventListener('click', function () {
    var open = navToggle.getAttribute('aria-expanded') !== 'true';
    navToggle.setAttribute('aria-expanded', String(open));
    navMenu.classList.toggle('is-open', open);
  });
  $$('a', navMenu).forEach(function (a) { a.addEventListener('click', closeNav); });

  /* ---------- links dropdown ---------- */
  var ddBtn = $('.dropdown-toggle');
  var ddMenu = $('#links-menu');
  function setDropdown(open) {
    ddBtn.setAttribute('aria-expanded', String(open));
    ddMenu.classList.toggle('is-open', open);
  }
  ddBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    setDropdown(ddBtn.getAttribute('aria-expanded') !== 'true');
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.dropdown')) setDropdown(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (ddBtn.getAttribute('aria-expanded') === 'true') { setDropdown(false); ddBtn.focus(); }
    if (navToggle.getAttribute('aria-expanded') === 'true') { closeNav(); navToggle.focus(); }
  });
  ddMenu.addEventListener('focusout', function (e) {
    if (!e.relatedTarget || !e.currentTarget.parentNode.contains(e.relatedTarget)) setDropdown(false);
  });

  /* ---------- active section in nav ---------- */
  var navLinks = $$('a', navMenu);
  if ('IntersectionObserver' in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) {
          if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) secObs.observe(s); });
    secObs.observe($('#top'));
  }

  /* ---------- rotating word ---------- */
  var rot = $('.rotator-word');
  if (rot && !reduceMotion.matches) {
    var words = ['decisions', 'models', 'insights', 'deployed apps'];
    var wi = 0;
    setInterval(function () {
      if (document.hidden) return;
      rot.classList.add('is-out');
      setTimeout(function () {
        wi = (wi + 1) % words.length;
        rot.textContent = words[wi];
        rot.classList.remove('is-out');
        rot.classList.add('is-in');
        requestAnimationFrame(function () { requestAnimationFrame(function () { rot.classList.remove('is-in'); }); });
      }, 350);
    }, 2600);
  }

  /* ---------- split-text section titles ---------- */
  $$('[data-split]').forEach(function (el) {
    var text = el.textContent.trim();
    // one word per title may be marked up as <em> (the serif accent): remember which word it is
    var em = el.querySelector('em'), emIndex = -1, emText = '';
    if (em) {
      var before = '';
      for (var n = el.firstChild; n && n !== em; n = n.nextSibling) before += n.textContent;
      emIndex = before.trim() ? before.trim().split(/\s+/).length : 0;
      emText = em.textContent.trim();
    }
    el.setAttribute('aria-label', text);
    el.textContent = '';
    text.split(/\s+/).forEach(function (w, i, arr) {
      var outer = document.createElement('span');
      outer.className = 'split-word';
      outer.setAttribute('aria-hidden', 'true');
      var inner = document.createElement('span');
      inner.style.setProperty('--i', i);
      if (i === emIndex && w.indexOf(emText) === 0) {
        var e2 = document.createElement('em');
        e2.textContent = emText;
        inner.appendChild(e2);
        inner.appendChild(document.createTextNode(w.slice(emText.length)));   // trailing punctuation stays upright
      } else {
        inner.textContent = w;
      }
      outer.appendChild(inner);
      el.appendChild(outer);
      if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.classList.add('is-split');
  });

  /* ---------- text scramble on eyebrows ---------- */
  var glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_';
  function scramble(el) {
    var final = el.dataset.text;
    var frame = 0, total = 22;
    (function tick() {
      var out = '';
      for (var i = 0; i < final.length; i++) {
        var settle = (i / final.length) * total * 0.8;
        if (frame >= settle + 6 || final[i] === ' ') out += final[i];
        else out += glyphs[(Math.random() * glyphs.length) | 0];
      }
      el.textContent = out;
      if (++frame <= total + 6) requestAnimationFrame(tick);
      else el.textContent = final;
    })();
  }
  $$('[data-scramble]').forEach(function (el) {
    el.dataset.text = el.textContent;
    el.setAttribute('aria-label', el.textContent);
  });

  /* ---------- reveal on scroll ---------- */
  var revealTargets = $$('[data-reveal], [data-split], [data-scramble]');
  if ('IntersectionObserver' in window) {
    var revObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = en.target;
        t.classList.add('is-visible');
        var stop = t.closest('.stop'); if (stop) stop.classList.add('is-visible');
        if (t.hasAttribute('data-scramble') && !reduceMotion.matches) scramble(t);
        obs.unobserve(t);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealTargets.forEach(function (el) { revObs.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- count-up stats ---------- */
  var statEls = $$('.stats dd');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    var statObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, final = el.textContent.trim(), target = parseFloat(final);
        var decimals = (final.split('.')[1] || '').length, t0 = performance.now(), dur = 1400;
        obs.unobserve(el);
        if (isNaN(target)) return;
        (function tick(now) {
          var k = Math.min(1, (now - t0) / dur);
          var eased = 1 - Math.pow(1 - k, 4);
          el.textContent = k < 1 ? (target * eased).toFixed(decimals) : final;
          if (k < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    statEls.forEach(function (el) { statObs.observe(el); });
  }

  /* ---------- project cards: spring tilt with glare ---------- */
  if (finePointer.matches && !reduceMotion.matches) {
    $$('.project-card').forEach(function (card) {
      var st = { rx: 0, ry: 0, tx: 0, ty: 0, vx: 0, vy: 0, g: 0, tg: 0, raf: 0 };
      function step() {
        st.vx = (st.vx + (st.tx - st.rx) * 0.14) * 0.72;
        st.vy = (st.vy + (st.ty - st.ry) * 0.14) * 0.72;
        st.rx += st.vx; st.ry += st.vy;
        st.g += (st.tg - st.g) * 0.15;
        card.style.setProperty('--rx', st.rx.toFixed(2) + 'deg');
        card.style.setProperty('--ry', st.ry.toFixed(2) + 'deg');
        card.style.setProperty('--glare', st.g.toFixed(3));
        var moving = Math.abs(st.tx - st.rx) + Math.abs(st.ty - st.ry) + Math.abs(st.vx) + Math.abs(st.vy) + Math.abs(st.tg - st.g) > 0.01;
        if (moving) st.raf = requestAnimationFrame(step);
        else { st.raf = 0; if (!st.tg) card.classList.remove('is-tilting'); }
      }
      function kick() { if (!st.raf) st.raf = requestAnimationFrame(step); }
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        st.ty = (px - 0.5) * 7; st.tx = (0.5 - py) * 5; st.tg = 1;
        card.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
        card.classList.add('is-tilting');
        kick();
      });
      card.addEventListener('pointerleave', function () { st.tx = st.ty = 0; st.tg = 0; kick(); });
    });
  }

  /* ---------- covers: cycle through a project's other screenshots ---------- */
  $$('.project-cover[data-cycle]').forEach(function (cover) {
    var keys = cover.dataset.cycle.split(','), frames = [], pips = null, idx = 0, timer = 0;
    function build() {
      if (frames.length) return;
      var size = window.innerWidth <= 640 ? '640' : '1200';
      var hint = $('.cover-hint', cover);
      keys.forEach(function (k) {
        var im = new Image();
        im.className = 'cover-frame'; im.alt = ''; im.decoding = 'async';
        im.src = 'assets/covers/' + k + '-' + size + '.webp';
        cover.insertBefore(im, hint);
        frames.push(im);
      });
      pips = document.createElement('span');
      pips.className = 'cover-pips';
      for (var i = 0; i <= keys.length; i++) pips.appendChild(document.createElement('span'));
      cover.appendChild(pips);
    }
    function set(i) {
      idx = i;
      frames.forEach(function (f, j) { f.classList.toggle('is-on', j === i - 1); });
      Array.prototype.forEach.call(pips.children, function (p, j) { p.classList.toggle('is-on', j === i); });
    }
    function next() { set((idx + 1) % (keys.length + 1)); timer = setTimeout(next, 2400); }
    function start() {
      if (timer || reduceMotion.matches) return;
      build(); set(0);
      cover.classList.add('is-cycling');
      timer = setTimeout(next, 900);
    }
    function stop() {
      clearTimeout(timer); timer = 0;
      cover.classList.remove('is-cycling');
      if (frames.length) set(0);
    }
    var card = cover.closest('.project-card');
    if (finePointer.matches) {
      card.addEventListener('pointerenter', start);
      card.addEventListener('pointerleave', stop);
    } else if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { en[0].intersectionRatio >= 0.8 ? start() : stop(); }, { threshold: [0, 0.8] }).observe(cover);
    }
  });

  /* ---------- magnetic buttons ---------- */
  if (finePointer.matches && !reduceMotion.matches) {
    $$('.magnetic').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.25;
        var y = (e.clientY - r.top - r.height / 2) * 0.35;
        btn.style.setProperty('--mx', x.toFixed(1) + 'px');
        btn.style.setProperty('--my', y.toFixed(1) + 'px');
      });
      btn.addEventListener('pointerleave', function () {
        btn.style.setProperty('--mx', '0px');
        btn.style.setProperty('--my', '0px');
      });
    });
  }

  /* ---------- phone carousels: dots for scroll-snap tracks ---------- */
  function carousel(track, label) {
    var dots = document.createElement('div');
    dots.className = 'dots';
    dots.setAttribute('role', 'group');
    dots.setAttribute('aria-label', label + ' navigation');
    track.insertAdjacentElement('afterend', dots);
    var items = [], btns = [], active = -1, raf = 0;

    function setActive(i) {
      if (i === active) return;
      active = i;
      btns.forEach(function (b, j) {
        if (j === i) b.setAttribute('aria-current', 'true');
        else b.removeAttribute('aria-current');
      });
    }
    function sync() {
      raf = 0;
      if (!items.length) return;
      var pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      var best = 0, bestD = Infinity;
      items.forEach(function (it, i) {
        var d = Math.abs(it.offsetLeft - pad - track.scrollLeft);
        if (d < bestD) { bestD = d; best = i; }
      });
      // at the far end, the last item may never reach the snap start
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) best = items.length - 1;
      setActive(best);
    }
    function go(i) {
      var pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      track.scrollTo({ left: items[i].offsetLeft - pad, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }
    function refresh() {
      items = Array.prototype.filter.call(track.children, function (el) { return !el.classList.contains('is-hidden'); });
      dots.textContent = '';
      btns = items.map(function (it, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'dot-btn';
        var name = it.querySelector('h3');
        b.setAttribute('aria-label', 'Show ' + (i + 1) + ' of ' + items.length + (name ? ': ' + name.textContent : ''));
        b.addEventListener('click', function () { go(i); });
        dots.appendChild(b);
        return b;
      });
      dots.hidden = items.length < 2;
      active = -1;
      track.scrollLeft = 0;
      sync();
    }
    track.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener('resize', function () { if (!raf) raf = requestAnimationFrame(sync); });
    refresh();
    return { refresh: refresh };
  }
  var projectsCarousel = carousel($('.projects'), 'Projects');
  carousel($('.certs'), 'Credentials');

  /* ---------- project filters ---------- */
  var chips = $$('.chip');
  var projects = $$('.project');
  var filterStatus = $('#filter-status');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.dataset.filter;
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      var shown = 0;
      projects.forEach(function (p) {
        var match = f === 'all' || p.dataset.cats.split(' ').indexOf(f) !== -1;
        p.classList.toggle('is-hidden', !match);
        if (match) {
          shown++;
          var card = $('[data-reveal]', p); if (card) card.classList.add('is-visible');
          if (!reduceMotion.matches && p.animate) p.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)', delay: shown * 40 });
        }
      });
      filterStatus.textContent = shown + (shown === 1 ? ' project' : ' projects') + ' shown';
      projectsCarousel.refresh();
    });
  });

  /* ---------- experience route progress ---------- */
  var route = $('.route');
  var heroInner = $('.hero-inner');
  var heroCanvas = $('.hero-canvas');
  var progressBar = $('.scroll-progress');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var vh = window.innerHeight;
      var max = doc.scrollHeight - vh;
      if (progressBar) progressBar.style.setProperty('--p', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
      if (route) {
        var r = route.getBoundingClientRect();
        var p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
        route.style.setProperty('--route-progress', reduceMotion.matches ? 1 : p.toFixed(3));
      }
      if (!reduceMotion.matches && window.scrollY < vh * 1.2) {
        var y = window.scrollY;
        heroInner.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0)';
        heroInner.style.opacity = String(Math.max(0, 1 - y / (vh * 0.9)));
        heroCanvas.style.transform = 'translate3d(0,' + (y * 0.35).toFixed(1) + 'px,0)';
      }
      // scroll depth: section headers drift a little against their content (wide screens only)
      if (!reduceMotion.matches && wideScreen.matches) {
        sectionHeads.forEach(function (h) {
          var box = h.parentNode.getBoundingClientRect();
          if (box.bottom < -200 || box.top > vh + 200) return;
          var t = (vh * 0.5 - (box.top + box.height / 2)) / (box.height + vh);   // about -0.5 .. 0.5
          h.style.setProperty('--hy', (Math.max(-0.5, Math.min(0.5, t)) * -56).toFixed(1) + 'px');
        });
      }
    });
  }
  var wideScreen = window.matchMedia('(min-width: 1000px)');
  var sectionHeads = $$('.split > .section-head');
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- hero depth: name layers shift apart with the mouse ---------- */
  var heroEl = $('.hero'), heroTitle = $('.hero-inner');   // --px / --py are read by the name and the portrait
  if (heroEl && heroTitle && finePointer.matches && !reduceMotion.matches) {
    heroEl.addEventListener('pointermove', function (e) {
      var r = heroEl.getBoundingClientRect();
      heroTitle.style.setProperty('--px', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
      heroTitle.style.setProperty('--py', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
    });
    heroEl.addEventListener('pointerleave', function () {
      heroTitle.style.setProperty('--px', 0);
      heroTitle.style.setProperty('--py', 0);
    });
  }

  /* ---------- hero data network ---------- */
  (function network() {
    var canvas = heroCanvas;
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, nodes = [], running = false, visible = true, raf = 0;
    var pointer = { x: -9999, y: -9999, tx: 0, ty: 0 };
    var colors = {};

    function readColors() {
      var cs = getComputedStyle(doc);
      colors.node = cs.getPropertyValue('--net-node').trim();
      colors.coral = cs.getPropertyValue('--net-coral').trim();
      colors.teal = cs.getPropertyValue('--net-teal').trim();
    }
    function resize() {
      var r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(90, Math.max(28, (w * h) / 16000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        var kind = Math.random();
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
          r: kind > 0.9 ? 2.6 : 1.4 + Math.random() * 0.8,
          c: kind > 0.93 ? 'coral' : kind > 0.86 ? 'teal' : 'node',
          z: 0.4 + Math.random() * 0.6
        });
      }
      draw(0);
    }
    function draw(dt) {
      ctx.clearRect(0, 0, w, h);
      pointer.tx += ((pointer.x === -9999 ? 0 : (pointer.x - w / 2) * 0.02) - pointer.tx) * 0.06;
      pointer.ty += ((pointer.y === -9999 ? 0 : (pointer.y - h / 2) * 0.02) - pointer.ty) * 0.06;
      var maxD = Math.min(150, Math.max(100, w / 10));
      var i, j, a, b, dx, dy, d;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        if (dt) {
          a.x += a.vx * dt; a.y += a.vy * dt;
          if (a.x < -20) a.x = w + 20; else if (a.x > w + 20) a.x = -20;
          if (a.y < -20) a.y = h + 20; else if (a.y > h + 20) a.y = -20;
        }
        a.px = a.x + pointer.tx * a.z * 2;
        a.py = a.y + pointer.ty * a.z * 2;
      }
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j];
          dx = a.px - b.px; dy = a.py - b.py;
          d = dx * dx + dy * dy;
          if (d < maxD * maxD) {
            d = Math.sqrt(d);
            var near = pointer.x !== -9999 && Math.hypot(a.px - pointer.x, a.py - pointer.y) < 160;
            ctx.strokeStyle = 'rgba(' + (near ? colors.coral : colors.node) + ',' + ((1 - d / maxD) * (near ? 0.45 : 0.14)).toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(a.px, a.py); ctx.lineTo(b.px, b.py); ctx.stroke();
          }
        }
      }
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        ctx.fillStyle = 'rgba(' + colors[a.c] + ',' + (a.c === 'node' ? 0.5 : 0.95) + ')';
        ctx.beginPath(); ctx.arc(a.px, a.py, a.r, 0, Math.PI * 2); ctx.fill();
      }
    }
    var last = 0;
    function loop(t) {
      var dt = last ? Math.min(3, (t - last) / 16.7) : 1;
      last = t;
      draw(dt);
      raf = requestAnimationFrame(loop);
    }
    function start() { if (running || reduceMotion.matches || !visible || document.hidden) return; running = true; last = 0; raf = requestAnimationFrame(loop); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    readColors(); resize();
    new MutationObserver(function () { readColors(); draw(0); }).observe(doc, { attributes: true, attributeFilter: ['data-theme', 'data-palette'] });
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
    var hero = $('.hero');
    hero.addEventListener('pointermove', function (e) { var r = canvas.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { pointer.x = pointer.y = -9999; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; visible ? start() : stop(); }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    reduceMotion.addEventListener && reduceMotion.addEventListener('change', function () { reduceMotion.matches ? (stop(), draw(0)) : start(); });
    start();
  })();

  /* ---------- lightbox gallery: certificates + project screenshots ---------- */
  var lb = $('.lightbox');
  var lbImg = $('.lightbox-img');
  var lbCap = $('.lightbox-caption');
  var lbPrev = $('.lb-prev', lb);
  var lbNext = $('.lb-next', lb);
  var gallery = [], current = 0, opener = null;

  var thumbs = $$('.cert-thumb');
  var certItems = thumbs.map(function (t) {
    return { src: t.dataset.full, w: +t.dataset.w, h: +t.dataset.h, alt: $('img', t).alt, caption: t.dataset.caption };
  });
  var shots = {};
  try { shots = JSON.parse($('#shots-data').textContent); } catch (e) {}

  function show(i) {
    current = (i + gallery.length) % gallery.length;
    var s = gallery[current];
    lbImg.src = s.src;
    lbImg.width = s.w; lbImg.height = s.h;
    lbImg.alt = s.alt;
    lbImg.classList.remove('is-in'); void lbImg.offsetWidth; lbImg.classList.add('is-in');
    lbCap.textContent = s.caption + (gallery.length > 1 ? '  ·  ' + (current + 1) + ' / ' + gallery.length : '');
    if (gallery.length > 1) { var n = new Image(); n.src = gallery[(current + 1) % gallery.length].src; }
  }
  function openGallery(items, i, btn) {
    if (!items || !items.length) return;
    gallery = items; opener = btn;
    if (typeof lb.showModal !== 'function') { window.open(items[i].src, '_blank', 'noopener'); return; }
    var multi = items.length > 1;
    lbPrev.hidden = !multi; lbNext.hidden = !multi;
    show(i);
    lb.showModal();
    $('.lb-close', lb).focus();
  }

  thumbs.forEach(function (t, i) { t.addEventListener('click', function () { openGallery(certItems, i, t); }); });
  $$('[data-shots]').forEach(function (b) {
    b.addEventListener('click', function () { openGallery(shots[b.dataset.shots], 0, b); });
  });
  lbPrev.addEventListener('click', function () { show(current - 1); });
  lbNext.addEventListener('click', function () { show(current + 1); });
  $('.lb-close', lb).addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', function (e) {
    if (gallery.length < 2) return;
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
  lb.addEventListener('close', function () { if (opener) opener.focus(); });

  /* ---------- copy email ---------- */
  var copyBtn = $('.copy-email');
  var copyStatus = $('.copy-status');
  copyBtn.addEventListener('click', function () {
    var email = copyBtn.dataset.email;
    function done(ok) {
      copyStatus.textContent = ok ? 'Email copied to clipboard.' : 'Copy failed. The address is ' + email + '.';
      setTimeout(function () { copyStatus.textContent = ''; }, 4000);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(email).then(function () { done(true); }, function () { done(false); });
    else done(false);
  });

  /* ---------- footer year ---------- */
  var y = $('.year'); if (y) y.textContent = new Date().getFullYear();
})();
