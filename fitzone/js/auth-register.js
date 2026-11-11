(function () {
  const form = document.getElementById('registerForm');
  if (!form) return;

  FZForm.wirePasswordToggle('password', 'togglePw1');
  FZForm.wirePasswordToggle('confirmPassword', 'togglePw2');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    FZForm.clearAlert('formAlert');

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;

    let valid = true;
    FZForm.setFieldError('fullName', 'fullNameError', '');
    FZForm.setFieldError('email', 'emailError', '');
    FZForm.setFieldError('password', 'passwordError', '');
    FZForm.setFieldError('confirmPassword', 'confirmPasswordError', '');
    FZForm.setFieldError('acceptTerms', 'acceptTermsError', '');

    if (fullName.length < 2) {
      FZForm.setFieldError('fullName', 'fullNameError', 'Ingresa tu nombre completo.');
      valid = false;
    }
    if (!FZForm.isValidEmail(email)) {
      FZForm.setFieldError('email', 'emailError', 'Ingresa un correo válido.');
      valid = false;
    }
    if (password.length < 8) {
      FZForm.setFieldError('password', 'passwordError', 'Debe tener al menos 8 caracteres.');
      valid = false;
    }
    if (password !== confirmPassword) {
      FZForm.setFieldError('confirmPassword', 'confirmPasswordError', 'Las contraseñas no coinciden.');
      valid = false;
    }
    if (!acceptTerms) {
      FZForm.setFieldError('acceptTerms', 'acceptTermsError', 'Debes aceptar los términos para continuar.');
      valid = false;
    }
    if (!valid) return;

    const client = window.getFitzoneClient();
    if (!client) {
      FZForm.showAlert('formAlert', 'error',
        'El registro aún no está conectado a una base de datos. Configura <code>js/config.js</code> con tu proyecto de Supabase (ver README).');
      return;
    }

    const btn = document.getElementById('submitBtn');
    FZForm.setLoading(btn, true);

    const { error } = await client.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    FZForm.setLoading(btn, false, 'Crear cuenta');

    if (error) {
      FZForm.showAlert('formAlert', 'error', FZForm.translateAuthError(error));
      return;
    }

    FZForm.showAlert('formAlert', 'success',
      'Cuenta creada. Si tu proyecto exige confirmación de correo, revisa tu bandeja de entrada antes de iniciar sesión.');
    form.reset();
    setTimeout(() => { window.location.href = 'login.html'; }, 1800);
  });
})();
