// main.js — DeskXP (stable)

// Run everything only after DOM is parsed
document.addEventListener("DOMContentLoaded", function () {
  /* =========================
     1) YEAR (inline footer)
  ========================== */
  (function setYear() {
    var y = document.getElementById("y");
    if (y) y.textContent = new Date().getFullYear();
  })();

  /* =============================================
     2) REVEAL ON SCROLL (with bulletproof fallback)
     - Sections/cards start visible if IO fails
  ============================================== */
  (function revealOnScroll() {
    var targets = Array.prototype.slice.call(
      document.querySelectorAll("section, .card")
    );
    if (!targets.length) return;

    // Fallback: if IO not supported, just show everything immediately
    if (typeof window.IntersectionObserver !== "function") {
      targets.forEach(function (el) {
        el.classList.add("visible");
      });
      return;
    }

    try {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );

      targets.forEach(function (el) {
        io.observe(el);
      });
    } catch (e) {
      // If anything blows up, show everything
      targets.forEach(function (el) {
        el.classList.add("visible");
      });
    }
  })();

  /* ==========================
     3) MOBILE MENU TOGGLE
  =========================== */
  (function mobileMenu() {
    var btn = document.getElementById("menuBtn");
    var menu = document.getElementById("menu");
    if (!btn || !menu) return;

    btn.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
    });
  })();

  /* ======================================
     4) SUCCESS STORIES SLIDER (no libs)
     - Auto-rotate
     - Click (prev/next)
     - Dots
     - Drag/Swipe
     - Keyboard arrows
     - Safe if elements missing
  ======================================= */
  (function successSlider() {
    var track = document.getElementById("successTrack");
    var dotsWrap = document.getElementById("successDots");
    var prevBtn = document.getElementById("prevBtn");
    var nextBtn = document.getElementById("nextBtn");
    if (!track || !dotsWrap) return;

    var slides = Array.prototype.slice.call(track.children);
    if (!slides.length) return;

    var idx = 0;
    var timer = null;
    var isDragging = false;
    var startX = 0;
    var currentX = 0;

    function go(i, user) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = "translateX(-" + idx * 100 + "vw)";
      Array.prototype.forEach.call(dotsWrap.children, function (d, k) {
        d.classList.toggle("active", k === idx);
      });
      if (user) restart();
    }

    function buildDots() {
      dotsWrap.innerHTML = slides
        .map(function (_, i) {
          return '<button aria-label="Go to slide ' + (i + 1) + '"></button>';
        })
        .join("");
      Array.prototype.forEach.call(dotsWrap.children, function (b, i) {
        b.addEventListener("click", function () {
          go(i, true);
        });
      });
      if (dotsWrap.children[0]) dotsWrap.children[0].classList.add("active");
    }

    function start() {
      stop();
      timer = setInterval(function () {
        go(idx + 1, false);
      }, 6000);
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }
    function restart() {
      stop();
      start();
    }

    // Drag / Swipe
    function onDown(e) {
      isDragging = true;
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      stop();
    }
    function onMove(e) {
      if (!isDragging) return;
      currentX = e.touches ? e.touches[0].clientX : e.clientX;
      var delta = currentX - startX;
      track.style.transition = "none";
      track.style.transform =
        "translateX(calc(-" + idx * 100 + "vw + " + delta + "px))";
    }
    function onUp() {
      if (!isDragging) return;
      isDragging = false;
      track.style.transition = "";
      var delta = currentX - startX;
      if (delta > 80) go(idx - 1, true);
      else if (delta < -80) go(idx + 1, true);
      else go(idx, true);
    }

    // Init
    buildDots();
    start();

    // Listeners
    track.addEventListener("mouseenter", stop);
    track.addEventListener("mouseleave", start);
    if (prevBtn) prevBtn.addEventListener("click", function () { go(idx - 1, true); });
    if (nextBtn) nextBtn.addEventListener("click", function () { go(idx + 1, true); });

    track.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    track.addEventListener("touchstart", onDown, { passive: true });
    track.addEventListener("touchmove", onMove, { passive: true });
    track.addEventListener("touchend", onUp);

    window.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") go(idx - 1, true);
      if (e.key === "ArrowRight") go(idx + 1, true);
    });

    // Safety: if fonts/slow paint jank happens, ensure correct slide position after a tick
    setTimeout(function () { go(idx, false); }, 0);
  })();
});
