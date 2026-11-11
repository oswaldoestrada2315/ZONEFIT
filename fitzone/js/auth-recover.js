(function () {
  const form = document.getElementById('recoverForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    FZForm.clearAlert('formAlert');

    const email = document.getElementById('email').value.trim();
    FZForm.setFieldError('email', 'emailError', '');

    if (!FZForm.isValidEmail(email)) {
      FZForm.setFieldError('email', 'emailError', 'Ingresa un correo válido.');
      return;
    }

    const client = window.getFitzoneClient();
    const btn = document.getElementById('submitBtn');

    const showNeutralConfirmation = () => {
      document.getElementById('requestCard').hidden = true;
      document.getElementById('confirmCard').hidden = false;
    };

    if (!client) {
      FZForm.showAlert('formAlert', 'error',
        'Esta función aún no está conectada a una base de datos. Configura <code>js/config.js</code> con tu proyecto de Supabase (ver README).');
      return;
    }

    FZForm.setLoading(btn, true);
    const redirectTo = new URL('restablecer.html', window.location.href).toString();
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
    FZForm.setLoading(btn, false, 'Enviar enlace');

    // Por seguridad, mostramos la misma confirmación exista o no la cuenta
    // (así nunca revelamos qué correos están registrados). Solo mostramos
    // un error real si fue un problema técnico, no "correo no encontrado".
    if (error && !/user not found/i.test(error.message || '')) {
      FZForm.showAlert('formAlert', 'error', FZForm.translateAuthError(error));
      return;
    }
    showNeutralConfirmation();
  });
})();
