/* ═══════════════════════════════════════════════════════════
   RAPICTRL LANDING — script.js
═══════════════════════════════════════════════════════════ */

/* ── Year ────────────────────────────────────────────────── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ── Header scroll behavior ──────────────────────────────── */
const header = document.getElementById('site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ── Mobile menu ─────────────────────────────────────────── */
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  const isOpen = mobileMenu.classList.contains('open');
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Close on mobile link click
mobileMenu.querySelectorAll('.mobile-link, .btn-outline, .btn-primary').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (!header.contains(e.target)) mobileMenu.classList.remove('open');
});

/* ── Scroll animations (IntersectionObserver) ────────────── */
const animObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        animObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.animate-on-scroll').forEach(el => animObserver.observe(el));

/* ── FAQ accordion ───────────────────────────────────────── */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item  = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

    // Toggle clicked
    if (!isOpen) item.classList.add('open');
  });
});

/* ── Smooth scroll for anchor links ──────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = header.offsetHeight + 8;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
