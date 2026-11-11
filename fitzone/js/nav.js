/**
 * Header: fondo sólido al hacer scroll + menú móvil accesible.
 */
(function () {
  const header = document.getElementById('siteHeader');
  const toggle = document.getElementById('mobileNavToggle');
  const closeBtn = document.getElementById('mobileNavClose');
  const mobileNav = document.getElementById('mobileNav');

  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function openNav() {
    mobileNav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    mobileNav.querySelector('a, button')?.focus();
  }
  function closeNav() {
    mobileNav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    toggle.focus();
  }

  toggle?.addEventListener('click', openNav);
  closeBtn?.addEventListener('click', closeNav);
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav?.classList.contains('is-open')) closeNav();
  });
})();
