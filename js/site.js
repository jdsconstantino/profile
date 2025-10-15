// main.js — DeskXP v201
document.addEventListener("DOMContentLoaded", function () {
  // YEAR
  var y = document.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();

  // MOBILE MENU
  (function () {
    var btn = document.getElementById("menuBtn");
    var menu = document.getElementById("menu");
    if (!btn || !menu) return;
    function setState(open) {
      menu.setAttribute("data-open", open ? "true" : "false");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }
    btn.addEventListener("click", function () {
      setState(menu.getAttribute("data-open") !== "true");
    });
    window.addEventListener("hashchange", function () { setState(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setState(false); });
  })();

  // SCROLL REVEAL (safe: visible by default, animates once)
  (function () {
    var root = document.documentElement;
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    function revealAll() { for (var i=0;i<els.length;i++) els[i].classList.add("is-visible"); }
    function enableIO() {
      try {
        var io = new IntersectionObserver(function (entries) {
          for (var i=0;i<entries.length;i++) {
            if (entries[i].isIntersecting) {
              entries[i].target.classList.add("is-visible");
              io.unobserve(entries[i].target);
            }
          }
        }, { threshold: 0.2 });
        for (var j=0;j<els.length;j++) io.observe(els[j]);
      } catch (e) { revealAll(); }
    }

    // Flip .js AFTER observers are ready (prevents initial hide)
    requestAnimationFrame(function () {
      root.classList.add("js");
      if ("IntersectionObserver" in window) enableIO(); else revealAll();
    });
  })();

  /* ===== SUCCESS SLIDER (hardened) ===== */
(function () {
  var root = document.getElementById("success");
  if (!root) return;

  var track = root.querySelector("#successTrack");
  var dotsWrap = root.querySelector("#successDots");
  var prevBtn = root.querySelector("#prevBtn");
  var nextBtn = root.querySelector("#nextBtn");
  if (!track) return;

  var slides = Array.from(track.children).filter(s => s.classList.contains("success-slide"));
  if (!slides.length) return;

  // Create dots if missing
  if (!dotsWrap) {
    dotsWrap = document.createElement("div");
    dotsWrap.id = "successDots";
    dotsWrap.className = "success-dots";
    root.appendChild(dotsWrap);
  }

  var idx = 0, timer = null;
  var INTERVAL = 6000;
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setActive(i) {
    slides.forEach((s, n) => s.classList.toggle("is-active", n === i));
    var dots = dotsWrap.children;
    for (var d = 0; d < dots.length; d++) dots[d].classList.toggle("active", d === i);
  }

  function go(i, user) {
    idx = (i + slides.length) % slides.length;
    setActive(idx);
    if (user) restart();
  }

  function buildDots() {
    dotsWrap.innerHTML = slides.map((_, i) => `<button aria-label="Go to slide ${i + 1}" type="button"></button>`).join("");
    Array.from(dotsWrap.children).forEach((dot, j) => dot.addEventListener("click", () => go(j, true)));
    dotsWrap.children[0] && dotsWrap.children[0].classList.add("active");
  }

  function start() { if (!reducedMotion) { stop(); timer = setInterval(() => go(idx + 1, false), INTERVAL); } }
  function stop() { if (timer) clearInterval(timer); timer = null; }
  function restart() { stop(); start(); }

  // Init
  buildDots();
  setActive(0);
  start();

  // Controls (guard against missing buttons)
  if (prevBtn) prevBtn.addEventListener("click", () => go(idx - 1, true));
  if (nextBtn) nextBtn.addEventListener("click", () => go(idx + 1, true));

  // Pause on hover/touch within the track
  track.addEventListener("mouseenter", stop);
  track.addEventListener("mouseleave", start);
  track.addEventListener("touchstart", stop, { passive: true });
  track.addEventListener("touchend", start, { passive: true });

  // Arrow keys
  window.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") go(idx - 1, true);
    if (e.key === "ArrowRight") go(idx + 1, true);
  });
})();
