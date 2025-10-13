// main.js — DeskXP v1.4

document.addEventListener("DOMContentLoaded", function () {
  // YEAR
  const y = document.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();

  // MOBILE MENU
  (function mobileMenu() {
    const btn = document.getElementById("menuBtn");
    const menu = document.getElementById("menu");
    if (!btn || !menu) return;
    function setState(open) {
      menu.setAttribute("data-open", open ? "true" : "false");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }
    btn.addEventListener("click", () => setState(menu.getAttribute("data-open") !== "true"));
    window.addEventListener("hashchange", () => setState(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setState(false); });
  })();

  // SCROLL REVEAL — prepare observers FIRST, then flip .js (so no invisible flash)
  (function scrollReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    const enableMotion = () => {
      document.documentElement.classList.add("js");
      // Immediately reveal anything already in viewport
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.2 });
        els.forEach((el) => io.observe(el));
      } else {
        els.forEach((el) => el.classList.add("is-visible"));
      }
    };

    // Defer flipping .js until after paint, so layout is stable
    requestAnimationFrame(enableMotion);
  })();

  // SUCCESS STORIES SLIDER (FADE)
  (function successSlider() {
    const track = document.getElementById("successTrack");
    const dotsWrap = document.getElementById("successDots");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    if (!track || !dotsWrap) return;

    const slides = Array.from(track.children);
    if (!slides.length) return;

    let idx = 0, timer = null;
    const DURATION = 6000;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setActive(i) {
      slides.forEach((s, k) => s.classList.toggle("is-active", k === i));
      Array.from(dotsWrap.children).forEach((d, k) => d.classList.toggle("active", k === i));
    }
    function go(i, user) {
      idx = (i + slides.length) % slides.length;
      setActive(idx);
      if (user) restart();
    }
    function buildDots() {
      dotsWrap.innerHTML = slides.map((_, i) => `<button aria-label="Go to slide ${i + 1}"></button>`).join("");
      Array.from(dotsWrap.children).forEach((b, i) => b.addEventListener("click", () => go(i, true)));
      if (dotsWrap.children[0]) dotsWrap.children[0].classList.add("active");
    }
    function start() {
      if (reduce) return;
      stop();
      timer = setInterval(() => go(idx + 1, false), DURATION);
    }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }

    buildDots(); setActive(0); start();

    prevBtn?.addEventListener("click", () => go(idx - 1, true));
    nextBtn?.addEventListener("click", () => go(idx + 1, true));
    track.addEventListener("mouseenter", stop);
    track.addEventListener("mouseleave", start);
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") go(idx - 1, true);
      if (e.key === "ArrowRight") go(idx + 1, true);
    });
  })();

});
