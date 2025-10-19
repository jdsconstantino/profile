// ======================= DeskXP main.js (v215) =======================

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

// ================== HEADER: mount + fetch + bind ==================
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

  const mount = ensureHeaderMount(); // #header-mount (creates if missing)
  const html = await fetchHeaderHTML();
  mount.innerHTML = html;

  bindCurtainMenu();
  bindHeaderTransparency();          // ⬅ flip transparent/solid on scroll

  // keep curtain offset correct if font loads/resizes
  if (document.fonts?.ready) document.fonts.ready.then(adjustCurtainOffset);
  window.addEventListener("load", adjustCurtainOffset);
})();

// Ensure a mount exists at the very top of <body>
function ensureHeaderMount() {
  let el = document.getElementById("header-mount");
  if (!el) {
    el = document.createElement("div");
    el.id = "header-mount";
    document.body.insertBefore(el, document.body.firstChild);
  }
  return el;
}

// Try to fetch /partials/header.html; fallback to minimal header if 404/blocked
async function fetchHeaderHTML() {
  const bust = `?v=${Date.now()}`;
  const candidates = [
    `/partials/header.html${bust}`,
    new URL(`./partials/header.html${bust}`, window.location.href).href,
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) return await res.text();
    } catch {}
  }
  console.warn("Header partial not found — using inline fallback");
  return `
<nav class="nav-wrap transparent" role="navigation" aria-label="Primary">
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
</nav>`;
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
    curtain.hidden = false;
    void curtain.offsetHeight;              // force reflow
    curtain.classList.add("open");
    document.documentElement.classList.add("no-scroll");
    adjustCurtainOffset();
  };
  const close = () => {
    trigger.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    curtain.classList.remove("open");
    document.documentElement.classList.remove("no-scroll");
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

// ---------------- Header transparency over hero ----------------------
function bindHeaderTransparency() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  function attach() {
    const header = document.querySelector("nav.nav-wrap");
    if (!header) return false;

    // Start truly transparent for the “video-as-header” illusion
    header.classList.add("transparent");
    header.classList.remove("solid");

    const io = new IntersectionObserver((entries) => {
      const e = entries[0];
      if (e && e.isIntersecting && e.intersectionRatio > 0.1) {
        header.classList.add("transparent");
        header.classList.remove("solid");
      } else {
        header.classList.add("solid");
        header.classList.remove("transparent");
      }
    }, { threshold: [0, 0.1, 1] });

    io.observe(hero);
    return true;
  }

  // Try now; if header is injected a tick later, watch and bind when it appears
  if (!attach()) {
    const mo = new MutationObserver(() => { if (attach()) mo.disconnect(); });
    mo.observe(document.getElementById("header-mount") || document.body, {
      childList: true,
      subtree: true,
    });
  }
}
// =====================================================================
// Flag pages that don't have a hero section
document.addEventListener("DOMContentLoaded", () => {
  const hasHero = !!document.querySelector(".hero");
  document.body.classList.toggle("no-hero", !hasHero);
});

