// main.js — DeskXP v202 (hardened slider + small safety fixes)
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

  // SCROLL REVEAL (safe)
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
    requestAnimationFrame(function () {
      root.classList.add("js");
      if ("IntersectionObserver" in window) enableIO(); else revealAll();
    });
  })();

  // SUCCESS SLIDER (hardened)
  (function () {
    var root = document.getElementById("success");
    if (!root) return;

    var track   = root.querySelector("#successTrack");
    var dotsWrap= root.querySelector("#successDots");
    var prevBtn = root.querySelector("#prevBtn");
    var nextBtn = root.querySelector("#nextBtn");
    if (!track) return;

    var slides = Array.prototype.slice.call(track.children || []).filter(function(s){ return s.classList.contains("success-slide"); });
    if (!slides.length) return;

    // Build dots if missing
    if (!dotsWrap) {
      dotsWrap = document.createElement("div");
      dotsWrap.id = "successDots";
      dotsWrap.className = "success-dots";
      root.appendChild(dotsWrap);
    }

    var idx = 0, timer = null;
    var INTERVAL = 6000;
    var reducedMotion = (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) || false;

    function setActive(i) {
      for (var s=0;s<slides.length;s++) slides[s].classList.toggle("is-active", s === i);
      var dots = dotsWrap.children;
      for (var d=0; d<dots.length; d++) dots[d].classList.toggle("active", d === i);
    }

    function go(i, user) {
      idx = (i + slides.length) % slides.length;
      setActive(idx);
      if (user) restart();
    }

    function buildDots() {
      var html = "";
      for (var i=0;i<slides.length;i++) html += '<button aria-label="Go to slide '+(i+1)+'" type="button"></button>';
      dotsWrap.innerHTML = html;
      var dots = dotsWrap.children;
      for (var j=0;j<dots.length;j++){
        (function(k){ dots[k].addEventListener("click", function(){ go(k, true); }); })(j);
      }
      if (dots[0]) dots[0].classList.add("active");
    }

    function start() { if (!reducedMotion) { stop(); timer = setInterval(function(){ go(idx + 1, false); }, INTERVAL); } }
    function stop()  { if (timer) clearInterval(timer); timer = null; }
    function restart(){ stop(); start(); }

    // Init
    try { buildDots(); setActive(0); start(); } catch(e){ /* fail open without crashing */ }

    // Controls (guard if missing)
    if (prevBtn) prevBtn.addEventListener("click", function(){ go(idx - 1, true); });
    if (nextBtn) nextBtn.addEventListener("click", function(){ go(idx + 1, true); });

    // Pause on hover/touch
    track.addEventListener("mouseenter", stop);
    track.addEventListener("mouseleave", start);
    track.addEventListener("touchstart", stop, { passive:true });
    track.addEventListener("touchend", start,   { passive:true });

    // Arrow keys
    window.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft")  { go(idx - 1, true); }
      if (e.key === "ArrowRight") { go(idx + 1, true); }
    });
  })();
});
// === GLOBAL HEADER LOADER ===
(() => {
  const path = "/profile/partials/header.html"; // correct path for your repo

  const ensureMount = () => {
    let el = document.getElementById("site-header");
    if (!el) {
      el = document.createElement("div");
      el.id = "site-header";
      document.body.insertBefore(el, document.body.firstChild);
    }
    return el;
  };

  const loadHeader = async () => {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error(res.status);
      const html = await res.text();
      const mount = ensureMount();
      mount.innerHTML = html;

      // Burger toggle + sticky behavior
      const burger = mount.querySelector(".dxp-burger");
      const menu = mount.querySelector(".dxp-menu");
      const header = mount.querySelector(".dxp-header");

      if (burger && menu) {
        burger.addEventListener("click", () => {
          const open = menu.classList.toggle("open");
          burger.setAttribute("aria-expanded", String(open));
        });
      }

      window.addEventListener("scroll", () => {
        if (window.scrollY > 8) header?.classList.add("is-scrolled");
        else header?.classList.remove("is-scrolled");
      });
    } catch (err) {
      console.error("Header load failed:", err);
    }
  };

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", loadHeader)
    : loadHeader();
})();

