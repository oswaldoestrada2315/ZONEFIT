(function () {
  const form = document.getElementById('loginForm');
  if (!form) return;

  FZForm.wirePasswordToggle('password', 'togglePw1');

  // Si ya hay sesión activa (y Supabase está configurado), no tiene sentido
  // mostrar el login — lo mandamos directo al dashboard.
  (async () => {
    const client = window.getFitzoneClient();
    if (!client) return;
    const { data } = await client.auth.getSession();
    if (data.session) window.location.href = 'dashboard.html';
  })();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    FZForm.clearAlert('formAlert');

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    let valid = true;
    FZForm.setFieldError('email', 'emailError', '');
    FZForm.setFieldError('password', 'passwordError', '');

    if (!FZForm.isValidEmail(email)) {
      FZForm.setFieldError('email', 'emailError', 'Ingresa un correo válido.');
      valid = false;
    }
    if (!password) {
      FZForm.setFieldError('password', 'passwordError', 'Ingresa tu contraseña.');
      valid = false;
    }
    if (!valid) return;

    const client = window.getFitzoneClient();
    if (!client) {
      // Mensaje genérico: nunca confirmamos ni negamos si la cuenta existe
      FZForm.showAlert('formAlert', 'error',
        'El inicio de sesión aún no está conectado a una base de datos. Configura <code>js/config.js</code> con tu proyecto de Supabase (ver README).');
      return;
    }

    const btn = document.getElementById('submitBtn');
    FZForm.setLoading(btn, true);

    const { error } = await client.auth.signInWithPassword({ email, password });

    FZForm.setLoading(btn, false, 'Iniciar sesión');

    if (error) {
      // Mensaje genérico a propósito: no distingue "correo no existe" de
      // "contraseña incorrecta" (evita revelar qué cuentas existen).
      FZForm.showAlert('formAlert', 'error', FZForm.translateAuthError(error));
      return;
    }

    window.location.href = 'dashboard.html';
  });
})();
