/**
 * Utilidades compartidas por los formularios de autenticación.
 * Nada aquí es específico de Supabase — son helpers de UI puros.
 */
window.FZForm = {
  /** Muestra/oculta la contraseña de un input vinculado a un botón. */
  wirePasswordToggle(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (!input || !btn) return;
    btn.addEventListener('click', () => {
      const isPw = input.type === 'password';
      input.type = isPw ? 'text' : 'password';
      btn.setAttribute('aria-label', isPw ? 'Ocultar contraseña' : 'Mostrar contraseña');
      btn.innerHTML = isPw ? FZForm.icons.eyeOff : FZForm.icons.eye;
    });
  },

  icons: {
    eye: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/></svg>',
    eyeOff: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M9.5 5.1A11 11 0 0112 5c7 0 11 7 11 7a13.5 13.5 0 01-3.4 4.1M6.1 6.9A13.3 13.3 0 001 12s4 7 11 7a10.6 10.6 0 004.1-.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  },

  /** Pone un botón en estado "cargando" con spinner, deshabilitado. */
  setLoading(btn, loading, labelWhenIdle) {
    if (!btn) return;
    btn.disabled = loading;
    if (loading) {
      btn.dataset.originalLabel = btn.dataset.originalLabel || btn.innerHTML;
      btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Procesando…';
    } else {
      btn.innerHTML = labelWhenIdle || btn.dataset.originalLabel || btn.innerHTML;
    }
  },

  /** Renderiza un mensaje de alerta dentro de un contenedor dado. */
  showAlert(containerId, type, message) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `<div class="alert alert--${type}" role="alert"><span>${message}</span></div>`;
  },
  clearAlert(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = '';
  },

  /** Marca un campo como inválido y escribe el mensaje de error asociado. */
  setFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const err = document.getElementById(errorId);
    if (input) input.classList.toggle('is-invalid', !!message);
    if (err) err.textContent = message || '';
  },

  isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  },

  /** Traduce los errores más comunes de Supabase Auth a español claro. */
  translateAuthError(err) {
    const msg = (err && err.message) || '';
    const map = [
      [/Invalid login credentials/i, 'Correo o contraseña incorrectos.'],
      [/User already registered/i, 'Ya existe una cuenta con este correo.'],
      [/Password should be at least/i, 'La contraseña debe tener al menos 8 caracteres.'],
      [/Email not confirmed/i, 'Confirma tu correo antes de iniciar sesión (revisa tu bandeja de entrada).'],
      [/rate limit/i, 'Demasiados intentos. Espera un momento y vuelve a intentarlo.'],
    ];
    for (const [re, es] of map) if (re.test(msg)) return es;
    return msg || 'Ocurrió un error inesperado. Intenta de nuevo.';
  },
};
