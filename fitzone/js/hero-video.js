/**
 * Hero video — SOLO se usa en esta pantalla (index.html).
 * Reglas:
 *  - Si el usuario prefiere movimiento reducido, mostramos el poster estático
 *    y nunca reproducimos el video.
 *  - Si el video falla o el navegador no puede reproducirlo, mostramos el
 *    poster como <img> y la página sigue viéndose profesional.
 *  - El <source> para pantallas pequeñas ya apunta a una versión más liviana
 *    (ver atributo media en index.html).
 */
(function () {
  const video = document.getElementById('heroVideo');
  const fallbackImg = document.getElementById('heroFallbackImg');
  if (!video) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showFallback() {
    video.hidden = true;
    if (fallbackImg) fallbackImg.hidden = false;
  }

  if (prefersReducedMotion) {
    showFallback();
    return;
  }

  video.addEventListener('error', showFallback);

  // Algunos navegadores móviles bloquean autoplay incluso en muted; si la
  // promesa de play() falla, caemos al poster en vez de dejar un video negro.
  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => showFallback());
  }
})();
