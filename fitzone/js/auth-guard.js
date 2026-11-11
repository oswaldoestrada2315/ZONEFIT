/**
 * Protege las páginas internas. Si Supabase está configurado y no hay
 * sesión, redirige a login. Si Supabase NO está configurado todavía,
 * dejamos pasar en "modo demo" para que puedas revisar el diseño y la UI
 * antes de conectar la base de datos (app-shell.js ya avisa de esto con
 * un banner, nunca en silencio).
 */
(function () {
  const client = window.getFitzoneClient ? window.getFitzoneClient() : null;
  if (!client) return; // modo demo — sin backend aún, no hay sesión que validar

  client.auth.getSession().then(({ data }) => {
    if (!data.session) {
      window.location.href = 'login.html';
    }
  });

  // Si la sesión expira o se cierra en otra pestaña, saca de la app también aquí.
  client.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') window.location.href = 'login.html';
  });
})();
