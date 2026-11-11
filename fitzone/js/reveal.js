/**
 * Revelado progresivo al hacer scroll (GSAP + ScrollTrigger).
 * Si GSAP no cargó (red bloqueada, CDN caído) o el usuario prefiere
 * movimiento reducido, el contenido simplemente queda visible —
 * nunca depende de esta animación para poder leerse o usarse.
 */
(function () {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typeof gsap === 'undefined' || prefersReducedMotion) {
    items.forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  items.forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 28 },
      {
        opacity: 1, y: 0,
        duration: 0.7,
        ease: 'power2.out',
        delay: (i % 4) * 0.06,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      }
    );
  });

  // Título del hero: entrada inmediata (no depende de scroll) con pequeño stagger.
  const heroItems = document.querySelectorAll('.hero [data-reveal]');
  if (heroItems.length) {
    gsap.fromTo(heroItems,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.12, delay: 0.2 }
    );
  }

  // Parallax sutil del scrim del hero (profundidad, sin mover el video real)
  const hero = document.querySelector('.hero');
  if (hero && !prefersReducedMotion) {
    gsap.to('.hero__media', {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    });
  }
})();
