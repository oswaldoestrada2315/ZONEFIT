/**
 * Inserta el sidebar + topbar compartidos por todas las pantallas internas
 * (dashboard, entrenamiento, rutinas, nutrición, progreso, calculadoras,
 * entrenadores, membresías, consejos, perfil). Cada página solo declara:
 *   <body data-page="dashboard"> ... <main class="app-main" id="pageContent">
 * y este script arma el resto, para no repetir ~80 líneas de HTML por archivo.
 */
(function () {
  const NAV = [
    { group: 'Mi entrenamiento', items: [
      { page: 'dashboard', href: 'dashboard.html', label: 'Dashboard', icon: 'grid' },
      { page: 'entrenamiento', href: 'entrenamiento.html', label: 'Entrenamiento', icon: 'dumbbell' },
      { page: 'rutinas', href: 'rutinas.html', label: 'Rutinas', icon: 'calendar' },
      { page: 'progreso', href: 'progreso.html', label: 'Progreso', icon: 'chart' },
    ]},
    { group: 'Nutrición y salud', items: [
      { page: 'nutricion-app', href: 'nutricion-app.html', label: 'Nutrición', icon: 'leaf' },
      { page: 'calculadoras', href: 'calculadoras.html', label: 'Calculadoras', icon: 'calc' },
    ]},
    { group: 'Comunidad', items: [
      { page: 'entrenadores', href: 'entrenadores.html', label: 'Entrenadores', icon: 'users' },
      { page: 'membresias', href: 'membresias.html', label: 'Membresías', icon: 'card' },
      { page: 'consejos', href: 'consejos.html', label: 'Consejos', icon: 'book' },
    ]},
    { group: 'Cuenta', items: [
      { page: 'perfil', href: 'perfil.html', label: 'Perfil y ajustes', icon: 'settings' },
    ]},
  ];

  const ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    dumbbell: '<path d="M2 12h3M19 12h3M5 8v8M19 8v8M8 12h8"/>',
    calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    chart: '<path d="M4 19V9M11 19V5M18 19v-7"/>',
    leaf: '<path d="M5 20c8 0 14-6 14-14 0 0-11-1-14 7-2 5 0 7 0 7z"/>',
    calc: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c1.2-4 3.6-6 6.5-6s5.3 2 6.5 6"/><circle cx="17" cy="8" r="2.6"/><path d="M15.5 14.2c2.4.5 4 2.3 4.9 5.3" />',
    card: '<rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 016.5 2H20v17H6.5A2.5 2.5 0 004 21.5v-17z"/><path d="M20 19H6.5A2.5 2.5 0 004 21.5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.9 2.9l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.6V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.9-2.9l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.6-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.6-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.9-2.9l.1.1a1.7 1.7 0 001.9.3h.1a1.7 1.7 0 001-1.6V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.6h.1a1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.9 2.9l-.1.1a1.7 1.7 0 00-.3 1.9v.1a1.7 1.7 0 001.6 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.6 1z"/>',
    logout: '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
  };

  function icon(name) {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
  }

  function buildNav(currentPage) {
    return NAV.map(group => `
      <div class="app-nav__section-label">${group.group}</div>
      ${group.items.map(item => `
        <a class="app-nav__link${item.page === currentPage ? ' is-active' : ''}" href="${item.href}">
          ${icon(item.icon)}<span>${item.label}</span>
        </a>`).join('')}
    `).join('');
  }

  function initials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  }

  async function mount() {
    const currentPage = document.body.dataset.page || '';
    const root = document.createElement('div');
    root.className = 'app-shell';
    root.innerHTML = `
      <aside class="app-sidebar" id="appSidebar">
        <div class="app-sidebar__logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" class="logo__mark"><path d="M2 12h3M19 12h3M5 8v8M19 8v8M8 12h8"/></svg>
          FitZone
        </div>
        <nav class="app-nav">${buildNav(currentPage)}</nav>
        <div class="app-sidebar__footer">
          <div class="app-sidebar__user" id="sidebarUser">
            <div class="app-sidebar__user-avatar">?</div>
            <div class="app-sidebar__user-info"><strong>Cargando…</strong><span>&nbsp;</span></div>
          </div>
          <button class="app-logout-btn" id="logoutBtn">${icon('logout')} Cerrar sesión</button>
        </div>
      </aside>
    `;

    const topbar = document.createElement('div');
    topbar.className = 'app-topbar';
    topbar.innerHTML = `
      <span class="logo"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" class="logo__mark"><path d="M2 12h3M19 12h3M5 8v8M19 8v8M8 12h8"/></svg>FitZone</span>
      <button class="btn-icon-circle" id="sidebarToggle" aria-label="Abrir menú">${icon('menu')}</button>
    `;

    const main = document.getElementById('pageContent');
    main.before(topbar);
    main.before(root);
    root.appendChild(main); // el grid necesita aside + main como columnas hermanas

    document.getElementById('sidebarToggle').addEventListener('click', () => {
      document.getElementById('appSidebar').classList.toggle('is-open');
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
      const client = window.getFitzoneClient();
      if (client) await client.auth.signOut();
      window.location.href = '../pages/login.html';
    });

    // Config banner si Supabase no está conectado — honestidad sobre el estado real
    const cfg = window.FITZONE_CONFIG || {};
    const notConfigured = !cfg.SUPABASE_URL || cfg.SUPABASE_URL.includes('TU-PROYECTO');
    if (notConfigured) {
      const banner = document.createElement('div');
      banner.className = 'app-config-banner';
      banner.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 9v4M12 17h.01M10.3 3.9L2.8 17a1.8 1.8 0 001.6 2.7h15.2a1.8 1.8 0 001.6-2.7L13.7 3.9a1.8 1.8 0 00-3.4 0z"/></svg>
        <span>Estás viendo <strong>datos de demostración</strong> — esta pantalla aún no está conectada a Supabase. Completa <code>js/config.js</code> para que tus rutinas, progreso y nutrición se guarden de verdad.</span>
      `;
      main.prepend(banner);
    }

    // Nombre real del usuario si hay sesión
    const client = window.getFitzoneClient();
    const userBox = document.getElementById('sidebarUser');
    if (client) {
      const { data } = await client.auth.getSession();
      const user = data?.session?.user;
      if (user) {
        const name = user.user_metadata?.full_name || user.email;
        userBox.querySelector('.app-sidebar__user-avatar').textContent = initials(name);
        userBox.querySelector('strong').textContent = name;
        userBox.querySelector('span').textContent = user.email;
      } else {
        userBox.querySelector('.app-sidebar__user-avatar').textContent = '—';
        userBox.querySelector('strong').textContent = 'Sin sesión';
        userBox.querySelector('span').innerHTML = '<a href="login.html" style="color:var(--yellow)">Iniciar sesión</a>';
      }
    } else {
      userBox.querySelector('.app-sidebar__user-avatar').textContent = 'DM';
      userBox.querySelector('strong').textContent = 'Modo demo';
      userBox.querySelector('span').textContent = 'Sin conexión';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
