// ======================= DeskXP main.js (v214) =======================

// Enable .js gate for reveal transitions
document.documentElement.classList.add("js");

// -------------------- YEAR ----------------------
document.addEventListener("DOMContentLoaded", () => {
  const y = document.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();
});

// -------------------- Reveal on scroll ----------------------
(() => {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  try {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.2 });
    els.forEach((el) => io.observe(el));
  } catch {
    els.forEach((el) => el.classList.add("is-visible"));
  }
})();

// -------------------- Success slider (stable) ------------------------
(() => {
  const root = document.getElementById("success");
  if (!root) return;
  const track = root.querySelector("#successTrack");
  if (!track) return;

  const dotsWrap =
    root.querySelector("#successDots") ||
    Object.assign(document.createElement("div"), {
      id: "successDots",
      className: "success-dots",
    });
  if (!root.querySelector("#successDots")) root.appendChild(dotsWrap);

  const slides = Array.from(track.children).filter((s) =>
    s.classList.contains("success-slide")
  );
  if (!slides.length) return;

  let idx = 0, timer = null;
  const INTERVAL = 6000;
  const reduced =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;

  function setActive(i) {
    slides.forEach((s, j) => s.classList.toggle("is-active", j === i));
    Array.from(dotsWrap.children).forEach((d, j) =>
      d.classList.toggle("active", j === i)
    );
  }
  function go(i, user) {
    idx = (i + slides.length) % slides.length;
    setActive(idx);
    if (user) restart();
  }
  function buildDots() {
    dotsWrap.innerHTML = slides
      .map((_, i) => `<button aria-label="Go to slide ${i + 1}" type="button"></button>`)
      .join("");
    Array.from(dotsWrap.children).forEach((dot, j) =>
      dot.addEventListener("click", () => go(j, true))
    );
    dotsWrap.children[0]?.classList.add("active");
  }
  function start() {
    if (!reduced) {
      stop();
      timer = setInterval(() => go(idx + 1, false), INTERVAL);
    }
  }
  function stop() { if (timer) clearInterval(timer), (timer = null); }
  function restart() { stop(); start(); }

  buildDots();
  setActive(0);
  start();
  track.addEventListener("mouseenter", stop);
  track.addEventListener("mouseleave", start);
})();

// ================== HEADER: mount + fallback + bind ==================
(async function mountHeader() {
  // Safety style: ANY curtain not open is inert everywhere.
  const safety = document.createElement("style");
  safety.textContent = `
    .curtain:not(.open) {
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
  `;
  document.head.appendChild(safety);

  const mount = ensureHeaderMount(); // #site-header (creates if missing)
  const html = await fetchHeaderHTML();
  mount.innerHTML = html;
  bindCurtainMenu();
  adjustCurtainOffset();
  if (document.fonts?.ready) document.fonts.ready.then(adjustCurtainOffset);
  window.addEventListener("load", adjustCurtainOffset);
})();

// Ensure a mount exists at the top of <body>
function ensureHeaderMount() {
  let el = document.getElementById("site-header");
  if (!el) {
    el = document.createElement("div");
    el.id = "site-header";
    document.body.insertBefore(el, document.body.firstChild);
  }
  return el;
}

// Try to fetch /partials/header.html; fallback to minimal header if 404/blocked
async function fetchHeaderHTML() {
  const bust = `?v=${Date.now()}`;
  const paths = [
    `/partials/header.html${bust}`,
    new URL(`./partials/header.html${bust}`, window.location.origin + window.location.pathname).href,
  ];
  for (const p of paths) {
    try {
      const res = await fetch(p, { cache: "no-store" });
      if (res.ok) return await res.text();
    } catch {}
  }
  console.warn("Header partial not found — using inline fallback");
  return `
<nav class="nav-wrap" role="navigation" aria-label="Primary">
  <div class="nav">
    <a class="brand" href="/" aria-label="DeskXP Home">
      <img src="/assets/logo.png" alt="DeskXP" width="120" height="32" />
    </a>
    <a href="#" id="cdMenuTrigger" class="cd-primary-nav-trigger" aria-label="Toggle menu" aria-controls="navCurtain" aria-expanded="false">
      <span class="cd-menu-text">Menu</span><span class="cd-menu-icon" aria-hidden="true"><i></i></span>
    </a>
  </div>
  <div id="navCurtain" class="curtain" hidden>
    <div class="curtain-inner">
      <ul class="curtain-menu">
        <li><a href="/">Home</a></li>
        <li><a href="/services/">Services</a></li>
        <li><a href="/#success">Success Stories</a></li>
        <li><a href="/about/">About</a></li>
        <li><a href="https://calendly.com/deskxp/30min">Book a Call</a></li>
      </ul>
    </div>
  </div>
</nav>
<style>
  .nav{display:flex;align-items:center;gap:14px}
  .cd-primary-nav-trigger{margin-left:auto}
  .menu{display:none!important}
  .nav-wrap{position:sticky;top:0;z-index:2147483647}
  #cdMenuTrigger{
    display:inline-flex;align-items:center;gap:8px;
    font-family:'Plus Jakarta Sans',Inter,system-ui,sans-serif;
    color:#fff;text-decoration:none;padding:8px 10px;border:1px solid rgba(255,255,255,.15);
    border-radius:10px;cursor:pointer;position:relative;z-index:2147483647
  }
  #cdMenuTrigger .cd-menu-icon{position:relative;width:22px;height:14px;display:inline-block}
  #cdMenuTrigger .cd-menu-icon::before,#cdMenuTrigger .cd-menu-icon::after,#cdMenuTrigger .cd-menu-icon i{
    content:"";position:absolute;left:0;right:0;height:2px;background:currentColor;border-radius:2px;transition:transform .25s ease,opacity .2s ease
  }
  #cdMenuTrigger .cd-menu-icon::before{top:0}
  #cdMenuTrigger .cd-menu-icon::after{bottom:0}
  #cdMenuTrigger .cd-menu-icon i{top:50%;transform:translateY(-50%)}
  #cdMenuTrigger.is-open .cd-menu-icon::before{top:50%;transform:translateY(-50%) rotate(45deg)}
  #cdMenuTrigger.is-open .cd-menu-icon::after{bottom:50%;transform:translateY(50%) rotate(-45deg)}
  #cdMenuTrigger.is-open .cd-menu-icon i{opacity:0}

  /* Curtain defaults: CLOSED = inert */
  .curtain{
    position:fixed; left:0; right:0; top:0;
    background:#2E424E;
    border-bottom:1px solid rgba(255,255,255,.14);
    transform:translateY(-8px);
    height:100vh; /* real height; visibility controls exposure */
    transition:opacity .25s ease, transform .25s ease, visibility 0s linear .25s;
    z-index:2147483600;
    opacity:0; visibility:hidden; pointer-events:none;
  }
  /* OPEN state */
  .curtain.open{
    transform:none;
    opacity:1; visibility:visible; pointer-events:auto;
    transition:opacity .25s ease, transform .25s ease, visibility 0s;
  }
  .curtain-inner{max-width:1100px;margin:0 auto;padding:32px 16px;font-family:'Plus Jakarta Sans',Inter,system-ui,sans-serif}
  .curtain-menu{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:18px}
  .curtain-menu a{display:block;padding:12px 8px;color:#ECF3FF;text-decoration:none;border-radius:8px;font-size:1.1rem}
  .curtain-menu a:hover{background:rgba(255,255,255,.08)}
</style>`;
}

// ---------------- Curtain behaviour + offset handling ----------------
function bindCurtainMenu() {
  const trigger = document.getElementById("cdMenuTrigger");
  const curtain = document.getElementById("navCurtain");
  if (!trigger || !curtain) return;

  const links = curtain.querySelectorAll("a");

  const open = () => {
    trigger.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    curtain.hidden = false;                  // expose element
    void curtain.offsetHeight;               // force reflow
    curtain.classList.add("open");           // visible + interactive via CSS
    document.documentElement.classList.add("no-scroll");
    adjustCurtainOffset();
  };
  const close = () => {
    trigger.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    curtain.classList.remove("open");        // becomes inert via CSS
    document.documentElement.classList.remove("no-scroll");
    // hide after transition so it can't intercept anything
    setTimeout(() => { curtain.hidden = true; }, 260);
  };

  // Start CLOSED no matter what markup/CSS shipped
  close();

  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    trigger.classList.contains("is-open") ? close() : open();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && trigger.classList.contains("is-open")) close();
  });
  links.forEach((a) => a.addEventListener("click", close));

  const header = document.querySelector(".nav-wrap");
  if (header && "ResizeObserver" in window) {
    new ResizeObserver(adjustCurtainOffset).observe(header);
  }
  window.addEventListener("resize", adjustCurtainOffset);
}

// ---------------- Curtain below header (inline !important) ----------------
function adjustCurtainOffset() {
  const header = document.querySelector(".nav-wrap");
  const curtain = document.getElementById("navCurtain");
  if (!header || !curtain) return;
  const h = Math.ceil(header.getBoundingClientRect().height) || 64;
  curtain.style.setProperty("top", `${h}px`, "important");
  curtain.style.setProperty("height", `calc(100vh - ${h}px)`, "important");
}
// =====================================================================
// Header transparency logic
(function () {
  const header = document.getElementById('header-mount');
  if (!header) return;

  const hero = document.querySelector('.hero');
  if (!hero) {
    header.classList.remove('transparent');
    header.classList.add('solid');
    return;
  }

  const io = new IntersectionObserver((entries) => {
    const e = entries[0];
    if (e && e.isIntersecting && e.intersectionRatio > 0.2) {
      header.classList.add('transparent');
      header.classList.remove('solid');
    } else {
      header.classList.add('solid');
      header.classList.remove('transparent');
    }
  }, { threshold: [0, 0.2, 1] });

  io.observe(hero);
})();
