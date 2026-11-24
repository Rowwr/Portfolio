(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');
  $('#yr').textContent = new Date().getFullYear();

  var toast = $('#toast'), tt;
  function say(msg) { toast.textContent = msg; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('show'); }, 1800); }

  // reveal on scroll
  var rv = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.1 });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  // wiggly title letters
  var title = $('#title');
  title.innerHTML = title.textContent.split(' ').map(function (w) {
    return '<span class="w" aria-hidden="true">' + w.split('').map(function (c) { return '<i>' + c + '</i>'; }).join('') + '</span>';
  }).join(' ');

  // click sparkles
  var cols = ['#ff5a36', '#ffc83d', '#8fd3ff', '#1a1a2e'];
  document.addEventListener('pointerdown', function (e) {
    if (reduce || !e.target.closest) return;
    for (var i = 0; i < 8; i++) {
      var s = document.createElement('i'), a = Math.random() * 6.28, d = 30 + Math.random() * 40;
      s.className = 'spark';
      s.style.cssText = 'left:' + e.clientX + 'px;top:' + e.clientY + 'px;background:' + cols[i % 4];
      document.body.appendChild(s);
      s.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + Math.cos(a) * d + 'px,' + Math.sin(a) * d + 'px) scale(0)', opacity: 0 }], { duration: 600, easing: 'ease-out' }).onfinish = (function (n) { return function () { n.remove(); }; })(s);
    }
  });

  // pip: eyes follow the pointer, click for a line
  var pip = $('#pip'), bubble = $('#bubble'), pupils = $$('.pupil'), bt;
  window.addEventListener('pointermove', function (e) {
    pupils.forEach(function (p) {
      var r = p.ownerSVGElement.getBoundingClientRect(), k = r.width / 120;
      var cx = r.left + p.dataset.cx * k, cy = r.top + p.dataset.cy * k;
      var dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy) || 1, m = Math.min(6, d / 25);
      p.style.transform = 'translate(' + (dx / d) * m + 'px,' + (dy / d) * m + 'px)';
    });
  });
  var lines = ['brr!', 'you found me!', 'try banana pop!', 'hire rohit pls', 'i am a state machine', 'banana!', 'hi!'];
  function pipSays(t) {
    bubble.textContent = t || lines[Math.floor(Math.random() * lines.length)];
    bubble.classList.add('show'); pip.classList.remove('jump'); void pip.offsetWidth; pip.classList.add('jump');
    clearTimeout(bt); bt = setTimeout(function () { bubble.classList.remove('show'); }, 1800);
  }
  pip.addEventListener('click', function () { pipSays(); });

  // draggable stickers with a little throw
  var stage = $('#stage');
  $$('.sticker', stage).forEach(function (el) {
    var x, y, vx = 0, vy = 0, px, py, drag = false, raf;
    function clamp() {
      var mx = stage.clientWidth - el.offsetWidth, my = stage.clientHeight - el.offsetHeight;
      if (x < 0) { x = 0; vx = -vx * 0.7; } if (x > mx) { x = mx; vx = -vx * 0.7; }
      if (y < 0) { y = 0; vy = -vy * 0.7; } if (y > my) { y = my; vy = -vy * 0.7; }
    }
    function put() { el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.right = el.style.bottom = 'auto'; el.style.transform = 'rotate(' + Math.max(-30, Math.min(30, vx * 2)) + 'deg)'; }
    function glide() { x += vx; y += vy; vx *= 0.95; vy *= 0.95; clamp(); put(); if (Math.abs(vx) + Math.abs(vy) > 0.3) raf = requestAnimationFrame(glide); else { vx = vy = 0; put(); } }
    el.addEventListener('pointerdown', function (e) {
      drag = true; el.setPointerCapture(e.pointerId); cancelAnimationFrame(raf);
      x = el.offsetLeft; y = el.offsetTop; px = e.clientX; py = e.clientY; vx = vy = 0; el.classList.add('held'); e.preventDefault();
    });
    el.addEventListener('pointermove', function (e) {
      if (!drag) return;
      vx = e.clientX - px; vy = e.clientY - py; px = e.clientX; py = e.clientY; x += vx; y += vy; clamp(); put();
    });
    el.addEventListener('pointerup', function () { drag = false; el.classList.remove('held'); if (!reduce) glide(); });
  });

  // project cards open and close
  $$('.card-head').forEach(function (h) {
    h.addEventListener('click', function () {
      var open = h.getAttribute('aria-expanded') === 'true';
      h.setAttribute('aria-expanded', String(!open));
      h.nextElementSibling.hidden = open;
    });
  });

  // skills light up the work they were used in
  var chips = $$('.chip'), items = $$('[data-tags]'), status = $('#status'), active = null;
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      active = active === c ? null : c;
      chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x === active)); });
      var n = 0;
      items.forEach(function (it) {
        var hit = !active || it.dataset.tags.split(' ').indexOf(active.dataset.tag) > -1;
        it.classList.toggle('dim', !hit);
        if (active && hit) { n++; if (it.classList.contains('card')) { var h = $('.card-head', it); h.setAttribute('aria-expanded', 'true'); h.nextElementSibling.hidden = false; } }
      });
      status.textContent = !active ? 'pick one and the work above lights up.' : n ? 'used in ' + n + ' place' + (n > 1 ? 's' : '') + ' above ↑' : 'mostly for game art. try the doodle pad in play ↓';
    });
  });

  // banana pop game
  var cv = $('#game'), cx = cv.getContext('2d'), hud = $('#hud'), startBtn = $('#start');
  var run = false, score = 0, left = 0, last = 0, spawn = 0, nanas = [], best = 0;
  try { best = +localStorage.getItem('bananaBest') || 0; } catch (e) {}
  if (best) hud.textContent = 'best: ' + best;
  function frame(t) {
    var dt = Math.min(50, t - last); last = t; left -= dt; spawn -= dt;
    if (spawn <= 0) { nanas.push({ x: 30 + Math.random() * 420, y: -30, v: 0.07 + Math.random() * 0.1 + (30000 - left) / 300000, r: Math.random() * 2 }); spawn = 450 - (30000 - left) / 100; }
    cx.clearRect(0, 0, 480, 300); cx.font = '38px serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    nanas = nanas.filter(function (n) { n.y += n.v * dt; cx.save(); cx.translate(n.x, n.y); cx.rotate(n.r + n.y / 90); cx.fillText('🍌', 0, 0); cx.restore(); return n.y < 330; });
    hud.textContent = 'score ' + score + ' · ' + Math.max(0, Math.ceil(left / 1000)) + 's';
    if (left > 0) requestAnimationFrame(frame); else {
      run = false; cx.clearRect(0, 0, 480, 300); startBtn.textContent = 'play again';
      if (score > best) { best = score; try { localStorage.setItem('bananaBest', best); } catch (e) {} }
      hud.textContent = 'time! you popped ' + score + ' · best ' + best; pipSays(score > 15 ? 'banana master!' : 'brr!');
    }
  }
  startBtn.addEventListener('click', function () {
    if (run) return; run = true; score = 0; left = 30000; nanas = []; spawn = 0; last = performance.now(); startBtn.textContent = 'go go go'; requestAnimationFrame(frame);
  });
  cv.addEventListener('pointerdown', function (e) {
    if (!run) return;
    var r = cv.getBoundingClientRect(), k = 480 / r.width, mx = (e.clientX - r.left) * k, my = (e.clientY - r.top) * k;
    for (var i = nanas.length - 1; i >= 0; i--) if (Math.hypot(nanas[i].x - mx, nanas[i].y - my) < 30) { nanas.splice(i, 1); score++; break; }
  });

  // doodle pad
  var grid = $('#grid'), sws = $('#swatches'), pal = ['#1a1a2e', '#ff5a36', '#ffc83d', '#4cc38a', '#4aa8ff', '#b37bff', '#ffffff'], cur = pal[1], cells = [], paint = false;
  for (var i = 0; i < 256; i++) { var c = document.createElement('i'); grid.appendChild(c); cells.push(c); }
  pal.forEach(function (col) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'sw'; b.style.background = col;
    b.setAttribute('aria-label', 'Paint ' + col); b.setAttribute('aria-pressed', String(col === cur));
    b.addEventListener('click', function () { cur = col; $$('.sw').forEach(function (s) { s.setAttribute('aria-pressed', 'false'); }); b.setAttribute('aria-pressed', 'true'); });
    sws.appendChild(b);
  });
  function dot(x, y) { var el = document.elementFromPoint(x, y); if (el && el.parentNode === grid) el.style.background = cur; }
  grid.addEventListener('pointerdown', function (e) { paint = true; dot(e.clientX, e.clientY); });
  grid.addEventListener('pointermove', function (e) { if (paint) dot(e.clientX, e.clientY); });
  window.addEventListener('pointerup', function () { paint = false; });
  $('#clear').addEventListener('click', function () { cells.forEach(function (c) { c.style.background = ''; }); });
  $('#save').addEventListener('click', function () {
    var o = document.createElement('canvas'), g = o.getContext('2d'); o.width = o.height = 256; g.fillStyle = '#fbf7ee'; g.fillRect(0, 0, 256, 256);
    cells.forEach(function (c, i) { if (c.style.background) { g.fillStyle = c.style.background; g.fillRect((i % 16) * 16, Math.floor(i / 16) * 16, 16, 16); } });
    var a = document.createElement('a'); a.href = o.toDataURL('image/png'); a.download = 'my-doodle.png'; a.click(); say('saved!');
  });

  // copy email
  $('#copy').addEventListener('click', function (e) {
    var mail = e.currentTarget.dataset.email;
    (navigator.clipboard ? navigator.clipboard.writeText(mail) : Promise.reject()).then(function () { say('email copied!'); pipSays('say hi!'); }, function () { say(mail); });
  });
})();
