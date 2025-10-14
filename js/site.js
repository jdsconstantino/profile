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

  // SUCCESS SLIDER (fade; auto + arrows + dots)
  (function () {
    var track = document.getElementById("successTrack");
    var dotsWrap = document.getElementById("successDots");
    var prevBtn = document.getElementById("prevBtn");
    var nextBtn = document.getElementById("nextBtn");
    if (!track || !dotsWrap) return;

    var slides = Array.prototype.slice.call(track.children || []);
    if (!slides.length) return;

    var idx = 0;
    var timer = null;
    var INTERVAL = 6000;

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
      for (var i=0;i<slides.length;i++) html += '<button aria-label="Go to slide '+(i+1)+'"></button>';
      dotsWrap.innerHTML = html;
      var dots = dotsWrap.children;
      for (var j=0;j<dots.length;j++){
        (function(k){ dots[k].addEventListener("click", function(){ go(k, true); }); })(j);
      }
      if (dots[0]) dots[0].classList.add("active");
    }

    function start() { stop(); timer = setInterval(function(){ go(idx + 1, false); }, INTERVAL); }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }

    // Init
    try { buildDots(); setActive(0); start(); } catch(e){ /* fail open */ }

    // Controls
    if (prevBtn) prevBtn.addEventListener("click", function(){ go(idx - 1, true); });
    if (nextBtn) nextBtn.addEventListener("click", function(){ go(idx + 1, true); });

    track.addEventListener("mouseenter", stop);
    track.addEventListener("mouseleave", start);

    // Arrow keys
    window.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { go(idx - 1, true); }
      if (e.key === "ArrowRight") { go(idx + 1, true); }
    });
  })();
});
