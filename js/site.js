// main.js — DeskXP (hardened, render-safe)
// Contract:
//  - Content is visible by default (CSS).
//  - Optional entrances only for elements with .reveal (CSS gates under .js).
//  - We add .is-visible when they enter viewport.
//  - Back-compat: we also add .visible if your old CSS still looks for it.

(function () {
  // Ensure .js class (in case HTML didn't set it early)
  try {
    var de = document.documentElement;
    if (de && de.classList.contains('no-js')) de.classList.replace('no-js', 'js');
    else if (de && !de.classList.contains('js')) de.classList.add('js');
  } catch (_) {}
})();

document.addEventListener("DOMContentLoaded", function () {
  /* =========================
     1) YEAR (inline footer)
  ========================== */
  (function setYear() {
    var y = document.getElementById("y");
    if (y) y.textContent = String(new Date().getFullYear());
  })();

  /* =============================================
     2) REVEAL ON SCROLL (safe, optional)
     - Only targets elements with .reveal
     - Adds .is-visible (and .visible for back-compat)
     - If IO missing or reduced-motion: reveal immediately
  ============================================== */
  (function revealOnScroll() {
    var targets = Array.prototype.slice.call(
      document.querySelectorAll(".reveal")
    );
    if (!targets.length) return;

    var reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function showAll() {
      targets.forEach(function (el) {
        el.classList.add("is-visible", "visible");
      });
    }

    if (reduce || typeof window.IntersectionObserver !== "function") {
      showAll();
      return;
    }

    try {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting || entry.intersectionRatio > 0) {
              entry.target.classList.add("is-visible", "visible");
              io.unobserve(entry.target);
            }
          });
        },
        { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
      );

      targets.forEach(function (el) { io.observe(el); });

      // Safety: reveal everything after 4s if something stalls
      setTimeout(function () {
        targets.forEach(function (el) {
          if (!el.classList.contains("is-visible")) {
            el.classList.add("is-visible", "visible");
          }
        });
      }, 4000);
    } catch (e) {
      showAll();
    }
  })();

  /* ==========================
     3) MOBILE MENU TOGGLE
     - Supports class (.open) and data-open attr
     - ARIA expanded sync
  =========================== */
  (function mobileMenu() {
    var btn = document.getElementById("menuBtn");
    var menu = document.getElementById("menu");
    if (!btn || !menu) return;

    function setState(open) {
      if (open) {
        menu.classList.add("open");
        menu.setAttribute("data-open", "true");
        btn.setAttribute("aria-expanded", "true");
      } else {
        menu.classList.remove("open");
        menu.setAttribute("data-open", "false");
        btn.setAttribute("aria-expanded", "false");
      }
    }

    btn.addEventListener("click", function () {
      var open =
        menu.classList.contains("open") ||
        menu.getAttribute("data-open") === "true";
      setState(!open);
    });

    // Close on hash change (navigating within page)
    window.addEventListener("hashchange", function () { setState(false); }, { passive: true });

    // Close on escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setState(false);
    });
  })();

  /* ======================================
     4) SUCCESS STORIES SLIDER (no libs)
     - Auto-rotate (pauses on hover/drag)
     - Click prev/next
     - Dots
     - Drag/Swipe
     - Keyboard arrows
     - Respects reduced-motion
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

    var reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var idx = 0;
    var timer = null;
    var isDragging = false;
    var startX = 0;
    var currentX = 0;

    function translateTo(i) {
      // Slides are 100vw wide by CSS. Using vw keeps math simple.
      track.style.transform = "translateX(-" + (i * 100) + "vw)";
    }

    function go(i, user) {
      idx = (i + slides.length) % slides.length;
      translateTo(idx);
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
        b.addEventListener("click", function () { go(i, true); });
      });
      if (dotsWrap.children[0]) dotsWrap.children[0].classList.add("active");
    }

    function start() {
      if (reduce) return; // Don’t auto-rotate for reduced motion
      stop();
      timer = setInterval(function () { go(idx + 1, false); }, 6000);
    }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }

    // Drag / Swipe
    function onDown(e) {
      isDragging = true;
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      stop();
      track.style.transition = "none";
    }
    function onMove(e) {
      if (!isDragging) return;
      currentX = e.touches ? e.touches[0].clientX : e.clientX;
      var delta = currentX - startX;
      track.style.transform =
        "translateX(calc(-" + (idx * 100) + "vw + " + delta + "px))";
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
    // Safety: ensure correct starting position after paint
    requestAnimationFrame(function () { go(0, false); });

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

    // Re-apply position on resize/orient change (vw can shift)
    window.addEventListener("resize", function () { translateTo(idx); });
    window.addEventListener("orientationchange", function () { translateTo(idx); });

    start();
  })();
});
