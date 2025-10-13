// Year
const yEl = document.getElementById('y');
if (yEl) yEl.textContent = new Date().getFullYear();

// Scroll reveal for sections + cards
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('section, .card').forEach(el => io.observe(el));

// Mobile menu
const btn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');
if (btn && menu) {
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
}

