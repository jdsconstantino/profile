// main.js — DeskXP v1.3 (stable)

document.addEventListener("DOMContentLoaded", function () {

  /* =========================
     1) YEAR (footer)
  ========================== */
  (function setYear() {
    const y = document.getElementById("y");
    if (y) y.textContent = new Date().getFullYear();
  })();


  /* ==========================
     2) MOBILE MENU TOGGLE
  =========================== */
  (function mobileMenu() {
    const btn = document.getElementById("menuBtn");
    const menu = document.getElementById("menu");
    if (!btn || !menu) return;

    function setState(open) {
      menu.setAttribute("data-open", open ? "true" : "false");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }

    btn.addEventListener("click", function () {
      const open = menu.getAttribute("data-open") === "true";
      setState(!open);
    });

    window.addEventListener("hashchange", () => setState(false), { passive: true });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setState(false);
    });
  })();


  /* ======================================
     3) SUCCESS STORIES SLIDER (Fade)
  ======================================= */
  (function successSlider() {
    const track = document.getElementById("successTrack");
    const dotsWrap = document.getElementById("successDots");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    if (!track || !dotsWrap) return;

    const slides = Array.from(track.children);
    if (!slides.length) return;

    let idx = 0;
    let timer = null;
    const DURATION = 5000;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setActive(i) {
      slides.forEach((s, k) => s.classList.toggle("is-active", k === i));
      Array.from(dotsWrap.children).forEach((d, k) =>
        d.classList.toggle("active", k === i)
      );
    }

    function go(i, user) {
      idx = (i + slides.length) % slides.length;
      setActive(idx);
      if (user) restart();
    }

    function buildDots() {
      dotsWrap.innerHTML = slides
        .map((_, i) => `<button aria-label="Go to slide ${i + 1}"></button>`)
        .join("");
      Array.from(dotsWrap.children).forEach((b, i) =>
        b.addEventListener("click", () => go(i, true))
      );
      if (dotsWrap.children[0]) dotsWrap.children[0].classList.add("active");
    }

    function start() {
      if (reduce) return;
      stop();
      timer = setInterval(() => go(idx + 1, false), DURATION);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    function restart() {
      stop();
      start();
    }

    // Init
    buildDots();
    setActive(0);
    start();

    // Controls
    prevBtn?.addEventListener("click", () => go(idx - 1, true));
    nextBtn?.addEventListener("click", () => go(idx + 1, true));

    // Pause on hover/focus
    track.addEventListener("mouseenter", stop);
    track.addEventListener("mouseleave", start);
    track.addEventListener("focusin", stop);
    track.addEventListener("focusout", start);

    // Keyboard navigation
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") go(idx - 1, true);
      if (e.key === "ArrowRight") go(idx + 1, true);
    });
  })();


  /* ===================================
     4) SCROLL REVEAL (safe animation)
  ==================================== */
  (function scrollReveal() {
    const elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;

    if (!("IntersectionObserver" in window)) {
      elements.forEach(el => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => io.observe(el));
  })();

});
