/**
 * Profundidad 3D con el cursor (CSS 3D, sin librerías pesadas).
 * Traduce el lenguaje visual del video de referencia (tarjetas con
 * inclinación/perspectiva) a las tarjetas de programas.
 * Se desactiva en touch (no hay cursor) y con movimiento reducido.
 */
(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (prefersReducedMotion || isTouch) return;

  const cards = document.querySelectorAll('.tilt-card');
  const MAX_TILT = 8; // grados — sutil, nunca mareante

  cards.forEach(card => {
    let frame = null;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;  // 0..1
      const py = (e.clientY - rect.top) / rect.height;  // 0..1
      const rotY = (px - 0.5) * MAX_TILT * 2;
      const rotX = (0.5 - py) * MAX_TILT * 2;

      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
      });
    });

    card.addEventListener('mouseleave', () => {
      if (frame) cancelAnimationFrame(frame);
      card.style.transform = 'rotateX(0) rotateY(0) translateZ(0)';
    });
  });
})();
