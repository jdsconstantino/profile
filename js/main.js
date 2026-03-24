// ========================= DeskXP main.js (v216) =========================

// Enable .js gate for reveal transitions
document.documentElement.classList.add("js");

// --------------------------- YEAR ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  const y = document.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();
});

// ---------------------- Reveal on scroll --------------------
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

// -------------------- Success slider (stable) ----------------
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

  let idx = 0,
    timer = null;
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
      .map(
        (_, i) =>
          `<button aria-label="Go to slide ${i + 1}" type="button"></button>`
      )
      .join("");

    Array.from(dotsWrap.children).forEach((dot, j) =>
      dot.addEventListener("click", () => go(j, true))
    );
  }

  function start() {
    if (reduced) return;
    timer = setInterval(() => go(idx + 1), INTERVAL);
  }

  function stop() {
    if (timer) clearInterval(timer);
  }

  function restart() {
    stop();
    start();
  }

  buildDots();
  setActive(idx);
  start();
})();

// ===================== SPEC MODAL =====================
(function () {
  const modal = document.getElementById("specModal");
  if (!modal) return;

  function openSpecModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeSpecModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.addEventListener("click", function (e) {
    const link = e.target.closest("a[href]");
    if (!link) return;

    const href = (link.getAttribute("href") || "").trim();

    if (
      href === "/personalized-specs/" ||
      href === "/personalized-specs" ||
      href === "https://deskxp.com/personalized-specs/" ||
      href === "https://deskxp.com/personalized-specs"
    ) {
      e.preventDefault();
      console.log("SPEC INTERCEPTED");
      openSpecModal();
    }
  });

  modal.querySelectorAll("[data-spec-close]").forEach((el) => {
    el.addEventListener("click", closeSpecModal);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeSpecModal();
    }
  });
})();
