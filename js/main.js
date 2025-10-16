// main.js — DeskXP v210 (stable global header + animations)
document.addEventListener("DOMContentLoaded", function () {
  // === YEAR ===
  const y = document.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();

  // === SCROLL REVEAL ===
  (function () {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    els.forEach((el) => io.observe(el));
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

    let slides = Array.from(track.children).filter(s => s.classList.contains("success-slide"));
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

    buildDots(); setActive(0); start();
    prevBtn?.addEventListener("click", () => go(idx - 1, true));
    nextBtn?.addEventListener("click", () => go(idx + 1, true));
    track.addEventListener("mouseenter", stop);
    track.addEventListener("mouseleave", start);
  })();
});

// ---------- Mount header (with cache-bust) & bind ----------
(async function mountHeader() {
  const mount = document.getElementById("site-header");
  if (!mount) return;

  // force fresh fetch so you’re not stuck on stale partials
  const bust = `?v=${Date.now()}`;
  const paths = [
    `/partials/header.html${bust}`,
    new URL(`./partials/header.html${bust}`, window.location.origin + window.location.pathname).href
  ];

  let html = null;
  for (const p of paths) {
    try {
      const res = await fetch(p, { cache: "no-store" });
      if (res.ok) { html = await res.text(); break; }
    } catch {}
  }
  if (!html) { console.error("❌ Could not load /partials/header.html"); return; }

  mount.innerHTML = html;
  bindCurtainMenu();
})();

function bindCurtainMenu() {
  const trigger = document.getElementById("cdMenuTrigger");
  const curtain = document.getElementById("navCurtain");
  if (!trigger || !curtain) return;

  const links = curtain.querySelectorAll("a");

  const open = () => {
    trigger.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    curtain.hidden = false;
    void curtain.offsetHeight;
    curtain.classList.add("open");
    document.documentElement.style.overflow = "hidden";
  };
  const close = () => {
    trigger.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    curtain.classList.remove("open");
    document.documentElement.style.overflow = "";
    setTimeout(() => (curtain.hidden = true), 250);
  };

  trigger.addEventListener("click", (e) => {
    e.preventDefault();                 // anchor trigger – don’t jump to top
    trigger.classList.contains("is-open") ? close() : open();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && trigger.classList.contains("is-open")) close();
  });
  links.forEach((a) => a.addEventListener("click", close));
}
// existing functions here...
function bindCurtainMenu() {
  const trigger = document.getElementById("cdMenuTrigger");
  const curtain = document.getElementById("navCurtain");
  if (!trigger || !curtain) return;

  const links = curtain.querySelectorAll("a");

  const open = () => {
    trigger.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    curtain.hidden = false;
    void curtain.offsetHeight;
    curtain.classList.add("open");
    document.documentElement.style.overflow = "hidden";
  };
  const close = () => {
    trigger.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    curtain.classList.remove("open");
    document.documentElement.style.overflow = "";
    setTimeout(() => (curtain.hidden = true), 250);
  };

  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    trigger.classList.contains("is-open") ? close() : open();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && trigger.classList.contains("is-open")) close();
  });
  links.forEach((a) => a.addEventListener("click", close));
}

/* ✅ Add this BELOW everything else */
window.addEventListener("resize", () => {
  const header = document.querySelector(".nav-wrap");
  const curtain = document.getElementById("navCurtain");
  if (header && curtain) {
    const h = header.offsetHeight;
    curtain.style.top = `${h}px`;
    curtain.style.height = `calc(100vh - ${h}px)`;
  }
});
