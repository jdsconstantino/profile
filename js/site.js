/* ========== Year (for inline footer) ========== */
(function () {
  var y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();
})();

/* ========== Reveal on scroll (with fallback) ========== */
(function () {
  var targets = document.querySelectorAll('section, .card');
  if (!targets.length) return;

  try {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });

    targets.forEach(function (el) { io.observe(el); });
  } catch (err) {
    // Fallback: just show everything
    targets.forEach(function (el) { el.classList.add('visible'); });
  }
})();

/* ========== Mobile menu ========== */
(function () {
  var btn = document.getElementById('menuBtn');
  var menu = document.getElementById('menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
})();

/* ========== Success slider (auto, dots, arrows, drag/swipe, keyboard) ========== */
(function () {
  var track = document.getElementById('successTrack');
  var dotsWrap = document.getElementById('successDots');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  if (!track || !dotsWrap) return;

  var slides = Array.prototype.slice.call(track.children);
  var idx = 0, timer = null, isDragging = false, startX = 0, currentX = 0;

  function go(i, user) {
    idx = (i + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + (idx * 100) + 'vw)';
    Array.prototype.forEach.call(dotsWrap.children, function (d, k) {
      d.classList.toggle('active', k === idx);
    });
    if (user) restart();
  }

  function buildDots() {
    dotsWrap.innerHTML = slides.map(function (_, i) {
      return '<button aria-label="Go to slide ' + (i + 1) + '"></button>';
    }).join('');
    Array.prototype.forEach.call(dotsWrap.children, function (b, i) {
      b.addEventListener('click', function () { go(i, true); });
    });
    if (dotsWrap.children[0]) dotsWrap.children[0].classList.add('active');
  }

  function start() { timer = setInterval(function () { go(idx + 1); }, 6000); }
  function stop() { clearInterval(timer); }
  function restart() { stop(); start(); }

  // drag / swipe
  function onDown(e) {
    isDragging = true;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    stop();
  }
  function onMove(e) {
    if (!isDragging) return;
    currentX = (e.touches ? e.touches[0].clientX : e.clientX);
    var delta = currentX - startX;
    track.style.transition = 'none';
    track.style.transform = 'translateX(calc(-' + (idx * 100) + 'vw + ' + delta + 'px))';
  }
  function onUp() {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = '';
    var delta = currentX - startX;
    if (delta > 80) go(idx - 1, true);
    else if (delta < -80) go(idx + 1, true);
    else go(idx, true);
  }

  buildDots(); start();

  // listeners
  track.addEventListener('mouseenter', stop);
  track.addEventListener('mouseleave', start);
  if (prevBtn) prevBtn.addEventListener('click', function () { go(idx - 1, true); });
  if (nextBtn) nextBtn.addEventListener('click', function () { go(idx + 1, true); });

  track.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  track.addEventListener('touchstart', onDown, { passive: true });
  track.addEventListener('touchmove', onMove, { passive: true });
  track.addEventListener('touchend', onUp);

  window.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') go(idx - 1, true);
    if (e.key === 'ArrowRight') go(idx + 1, true);
  });
})();
