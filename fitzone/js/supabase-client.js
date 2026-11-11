/**
 * Cliente único de Supabase, reutilizado por toda la app.
 * Si config.js no fue completado, lo advertimos en consola en vez de
 * fallar en silencio (mejor diagnóstico que un error de fetch críptico).
 */
window.getFitzoneClient = (function () {
  let client = null;
  return function getFitzoneClient() {
    if (client) return client;

    const cfg = window.FITZONE_CONFIG || {};
    const notConfigured =
      !cfg.SUPABASE_URL ||
      !cfg.SUPABASE_ANON_KEY ||
      cfg.SUPABASE_URL.includes('TU-PROYECTO') ||
      cfg.SUPABASE_ANON_KEY.includes('TU_ANON_KEY');

    if (notConfigured) {
      console.warn(
        '[FitZone] Supabase no está configurado todavía. ' +
        'Edita js/config.js con la URL y anon key de tu proyecto.'
      );
      return null;
    }

    if (typeof supabase === 'undefined') {
      console.error('[FitZone] No se cargó la librería de Supabase (js/vendor/supabase.min.js).');
      return null;
    }

    client = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,   // mantiene la sesión entre cierres de navegador
        autoRefreshToken: true, // renueva el token sin pedir login de nuevo
        detectSessionInUrl: true,
      },
    });
    return client;
  };
})();
