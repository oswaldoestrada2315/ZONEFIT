/**
 * Inserta header + footer compartidos de las páginas públicas de marketing
 * (programas, entrenadores, membresías, nutrición institucional) para no
 * repetir el markup del index.html en cada archivo.
 */
(function () {
  const currentPage = document.body.dataset.publicPage || '';

  const NAV_ITEMS = [
    { href: '../index.html', label: 'Inicio', page: 'inicio' },
    { href: 'programas.html', label: 'Programas', page: 'programas' },
    { href: 'entrenadores.html', label: 'Entrenadores', page: 'entrenadores' },
    { href: 'nutricion.html', label: 'Nutrición', page: 'nutricion' },
    { href: 'membresias.html', label: 'Membresías', page: 'membresias' },
  ];

  function navLinks(mobile) {
    return NAV_ITEMS.map(item =>
      `<a href="${item.href}"${item.page === currentPage ? ' aria-current="page"' : ''}>${item.label}</a>`
    ).join('');
  }

  const header = document.createElement('header');
  header.className = 'site-header';
  header.id = 'siteHeader';
  header.innerHTML = `
    <div class="container site-header__inner">
      <a href="../index.html" class="logo" aria-label="FitZone — Inicio">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" class="logo__mark" aria-hidden="true"><path d="M2 12h3M19 12h3M5 8v8M19 8v8M8 12h8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
        FitZone
      </a>
      <nav class="main-nav" aria-label="Navegación principal">${navLinks()}</nav>
      <div class="header-actions">
        <a href="login.html" class="btn btn-secondary">Iniciar sesión</a>
        <a href="registro.html" class="btn btn-primary">Únete ahora</a>
        <button class="mobile-nav-toggle btn-icon-circle" id="mobileNavToggle" aria-expanded="false" aria-controls="mobileNav" aria-label="Abrir menú">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
    </div>
  `;

  const mobileNav = document.createElement('div');
  mobileNav.className = 'mobile-nav';
  mobileNav.id = 'mobileNav';
  mobileNav.innerHTML = `
    <div class="mobile-nav__top">
      <span class="logo"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" class="logo__mark"><path d="M2 12h3M19 12h3M5 8v8M19 8v8M8 12h8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>FitZone</span>
      <button class="btn-icon-circle" id="mobileNavClose" aria-label="Cerrar menú"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    </div>
    <nav class="mobile-nav__links" aria-label="Navegación móvil">${navLinks(true)}</nav>
    <div class="mobile-nav__actions">
      <a href="login.html" class="btn btn-secondary btn-block">Iniciar sesión</a>
      <a href="registro.html" class="btn btn-primary btn-block">Únete ahora</a>
    </div>
  `;

  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <span class="logo"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="logo__mark"><path d="M2 12h3M19 12h3M5 8v8M19 8v8M8 12h8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>FitZone</span>
          <p style="margin-top:var(--space-4);font-size:var(--fs-small);max-width:28ch">Train. Transform. Thrive. Tu mejor versión empieza aquí.</p>
        </div>
        <div class="footer-col"><h4>Navegación</h4>${navLinks()}</div>
        <div class="footer-col"><h4>Cuenta</h4><a href="login.html">Iniciar sesión</a><a href="registro.html">Registrarse</a><a href="recuperar.html">Recuperar contraseña</a></div>
        <div class="footer-col"><h4>Legal</h4><a href="#">Términos y condiciones</a><a href="#">Política de privacidad</a></div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 FitZone. Todos los derechos reservados.</span>
        <span>Proyecto de demostración — datos y precios editables.</span>
      </div>
    </div>
  `;

  const main = document.getElementById('pageContent');
  main.before(header);
  main.before(mobileNav);
  main.after(footer);

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function openNav() {
    mobileNav.classList.add('is-open');
    document.getElementById('mobileNavToggle').setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeNav() {
    mobileNav.classList.remove('is-open');
    document.getElementById('mobileNavToggle').setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  document.getElementById('mobileNavToggle').addEventListener('click', openNav);
  document.getElementById('mobileNavClose').addEventListener('click', closeNav);
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
})();
