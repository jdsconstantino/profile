// main.v203.js — DeskXP unified frontend (nav fix)
document.addEventListener("DOMContentLoaded", function () {

  /* YEAR */
  var y = document.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();

  /* MOBILE MENU */
  (function () {
    var btn = document.getElementById("menuBtn");
    var menu = document.getElementById("menu");
    if (!btn || !menu) return;
    function setState(open) {
      menu.setAttribute("data-open", open ? "true" : "false");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    }
    btn.addEventListener("click", function () { setState(menu.getAttribute("data-open") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setState(false); });
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setState(false)));
  })();

  /* SCROLL REVEAL */
  (function () {
    var root = document.documentElement;
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    function revealAll() { els.forEach(el => el.classList.add("is-visible")); }
    function enableIO() {
      try {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.2 });
        els.forEach(el => io.observe(el));
      } catch { revealAll(); }
    }
    requestAnimationFrame(() => {
      root.classList.add("js");
      if ("IntersectionObserver" in window) enableIO(); else revealAll();
    });
  })();

  /* SUCCESS SLIDER */
  (function () {
    var track = document.getElementById("successTrack");
    var dotsWrap = document.getElementById("successDots");
    var prevBtn = document.getElementById("prevBtn");
    var nextBtn = document.getElementById("nextBtn");
    if (!track || !dotsWrap) return;

    var slides = Array.from(track.children);
    if (!slides.length) return;

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
      dotsWrap.innerHTML = slides.map((_, i) => `<button aria-label="Go to slide ${i + 1}"></button>`).join("");
      Array.from(dotsWrap.children).forEach((dot, j) => dot.addEventListener("click", () => go(j, true)));
      dotsWrap.children[0]?.classList.add("active");
    }
    function start() { if (!reducedMotion) { stop(); timer = setInterval(() => go(idx + 1, false), INTERVAL); } }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }

    buildDots(); setActive(0); start();
    prevBtn?.addEventListener("click", () => go(idx - 1, true));
    nextBtn?.addEventListener("click", () => go(idx + 1, true));
    track.addEventListener("mouseenter", stop);
    track.addEventListener("mouseleave", start);
    window.addEventListener("keydown", e => { if (e.key === "ArrowLeft") go(idx - 1, true); if (e.key === "ArrowRight") go(idx + 1, true); });
  })();

  /* ACTIVE NAV HIGHLIGHT — robust mapping (works on / and /about/) */
  (function () {
    var links = Array.from(document.querySelectorAll("[data-nav]"));
    if (!links.length) return;

    // Build a list of {link, section} where section actually exists on this page.
    var pairs = links.map(link => {
      var href = link.getAttribute("href") || "";
      var hash = href.includes("#") ? href.split("#")[1] : "";
      var section = hash ? document.getElementById(hash) : null;
      return section ? { link, section } : null;
    }).filter(Boolean);

    if (!pairs.length) return;

    function onScroll() {
      var scrollPos = window.scrollY + 120;
      pairs.forEach(({ link, section }) => {
        var top = section.offsetTop, bottom = top + section.offsetHeight;
        var active = scrollPos >= top && scrollPos < bottom;
        link.classList.toggle("is-active", active);
      });
    }

    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);
    onScroll();
  })();

});
