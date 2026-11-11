(function () {
  const form = document.getElementById('resetForm');
  if (!form) return;

  FZForm.wirePasswordToggle('password', 'togglePw1');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    FZForm.clearAlert('formAlert');

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    let valid = true;
    FZForm.setFieldError('password', 'passwordError', '');
    FZForm.setFieldError('confirmPassword', 'confirmPasswordError', '');

    if (password.length < 8) {
      FZForm.setFieldError('password', 'passwordError', 'Debe tener al menos 8 caracteres.');
      valid = false;
    }
    if (password !== confirmPassword) {
      FZForm.setFieldError('confirmPassword', 'confirmPasswordError', 'Las contraseñas no coinciden.');
      valid = false;
    }
    if (!valid) return;

    const client = window.getFitzoneClient();
    if (!client) {
      FZForm.showAlert('formAlert', 'error',
        'Esta función aún no está conectada a una base de datos. Configura <code>js/config.js</code> con tu proyecto de Supabase (ver README).');
      return;
    }

    const btn = document.getElementById('submitBtn');
    FZForm.setLoading(btn, true);

    // Supabase ya validó el token del enlace de recuperación en la URL
    // (detectSessionInUrl: true) y abrió una sesión temporal para esto.
    const { error } = await client.auth.updateUser({ password });

    FZForm.setLoading(btn, false, 'Guardar contraseña');

    if (error) {
      FZForm.showAlert('formAlert', 'error', FZForm.translateAuthError(error));
      return;
    }

    FZForm.showAlert('formAlert', 'success', 'Contraseña actualizada. Redirigiendo a tu cuenta…');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
  });
})();
