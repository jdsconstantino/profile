// main.js — DeskXP v210 (global header + hardened slider + safe observers)
document.addEventListener("DOMContentLoaded", function () {
  // === YEAR ===
  const y = document.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();

  // === MOBILE MENU ===
  (function () {
    const btn = document.getElementById("menuBtn");
    const menu = document.getElementById("menu");
    if (!btn || !menu) return;

    function setState(open) {
      menu.setAttribute("data-open", open ? "true" : "false");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }

    btn.addEventListener("click", function () {
      setState(menu.getAttribute("data-open") !== "true");
    });

    window.addEventListener("hashchange", function () {
      setState(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setState(false);
    });
  })();

  // === SCROLL REVEAL ===
  (function () {
    const root = document.documentElement;
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    function revealAll() {
      els.forEach(el => el.classList.add("is-visible"));
    }

    function enableIO() {
      try {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.2 });

        els.forEach(el => io.observe(el));
      } catch (e) { revealAll(); }
    }

    requestAnimationFrame(() => {
      root.classList.add("js");
      if ("IntersectionObserver" in window) enableIO(); else revealAll();
    });
  })();

  // === SUCCESS SLIDER ===
  (function () {
    const root = document.getElementById("success");
    if (!root) return;

    const track = root.querySelector("#successTrack");
    const dotsWrap = root.querySelector("#successDots") || document.createElement("div");
    const prevBtn = root.querySelector("#prevBtn");
    const nextBtn = root.querySelector("#nextBtn");
    if (!track) return;

    let slides = Array.from(track.children || []).filter(s => s.classList.contains("success-slide"));
    if (!slides.length) return;

    if (!dotsWrap.id) {
      dotsWrap.id = "successDots";
      dotsWrap.className = "success-dots";
      root.appendChild(dotsWrap);
    }

    let idx = 0, timer = null;
    const INTERVAL = 6000;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;

    function setActive(i) {
      slides.forEach((s, j) => s.classList.toggle("is-active", j === i));
      Array.from(dotsWrap.children).forEach((d, j) => d.classList.toggle("active", j === i));
    }

    function go(i, user) {
      idx = (i + slides.length) % slides.length;
      setActive(idx);
      if (user) restart();
    }

    function buildDots() {
      dotsWrap.innerHTML = slides.map((_, i) =>
        `<button aria-label="Go to slide ${i + 1}" type="button"></button>`
      ).join("");

      Array.from(dotsWrap.children).forEach((dot, j) =>
        dot.addEventListener("click", () => go(j, true))
      );
      dotsWrap.children[0]?.classList.add("active");
    }

    function start() { if (!reducedMotion) { stop(); timer = setInterval(() => go(idx + 1, false), INTERVAL); } }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }

    try { buildDots(); setActive(0); start(); } catch (e) { /* fail open */ }

    prevBtn?.addEventListener("click", () => go(idx - 1, true));
    nextBtn?.addEventListener("click", () => go(idx + 1, true));

    track.addEventListener("mouseenter", stop);
    track.addEventListener("mouseleave", start);
    track.addEventListener("touchstart", stop, { passive: true });
    track.addEventListener("touchend", start, { passive: true });

    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") go(idx - 1, true);
      if (e.key === "ArrowRight") go(idx + 1, true);
    });
  })();
});

// === GLOBAL HEADER LOADER (keep the rest of your file as-is) ===
(() => {
  const path = "/partials/header.html"; // ← THIS, not /profile/partials/...

  const ensureMount = () => {
    let el = document.getElementById("site-header");
    if (!el) { el = document.createElement("div"); el.id = "site-header"; document.body.insertBefore(el, document.body.firstChild); }
    return el;
  };

  const loadHeader = async () => {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error(res.status);
      const html = await res.text();
      const mount = ensureMount();
      mount.innerHTML = html;

      // burger + sticky
      const btn = mount.querySelector("#menuBtn");
      const menu = mount.querySelector("#menu");
      const header = mount.querySelector(".nav-wrap, .dxp-header");
      if (btn && menu) {
        btn.addEventListener("click", () => {
          const open = menu.getAttribute("data-open") !== "true";
          menu.setAttribute("data-open", String(open));
          btn.setAttribute("aria-expanded", String(open));
        });
      }
      window.addEventListener("scroll", () => {
        if (window.scrollY > 8) header?.classList.add("is-scrolled");
        else header?.classList.remove("is-scrolled");
      });
    } catch (err) { console.error("Header load failed:", err); }
  };

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", loadHeader) : loadHeader();
})();
