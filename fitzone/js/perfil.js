(function () {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      document.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== tab.dataset.tab; });
    });
  });

  async function load() {
    const profile = await FZDB.getProfile();
    const client = window.getFitzoneClient();
    if (profile) {
      document.getElementById('pName').value = profile.full_name || '';
      document.getElementById('pHeight').value = profile.height_cm || '';
      document.getElementById('pGoal').value = profile.goal || 'mantenimiento';
      document.getElementById('pExperience').value = profile.experience_level || 'principiante';
      document.getElementById('pAvailability').value = profile.weekly_availability || '';
    }
    if (client) {
      const { data } = await client.auth.getSession();
      document.getElementById('pEmail').value = data?.session?.user?.email || '';
    } else {
      document.getElementById('pEmail').value = 'demo@fitzone.local';
    }
  }

  document.getElementById('personalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    FZForm.clearAlert('personalAlert');
    const btn = document.getElementById('savePersonalBtn');
    FZForm.setLoading(btn, true);
    const { error } = await FZDB.updateProfile({
      full_name: document.getElementById('pName').value.trim(),
      height_cm: parseFloat(document.getElementById('pHeight').value) || null,
    });
    FZForm.setLoading(btn, false, 'Guardar cambios');
    if (error) { FZForm.showAlert('personalAlert', 'error', error.message); return; }
    FZForm.showAlert('personalAlert', 'success', FZDB.isDemo()
      ? 'Modo demo: conecta Supabase en <code>js/config.js</code> para guardar de verdad.'
      : 'Datos actualizados.');
  });

  document.getElementById('goalsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    FZForm.clearAlert('goalsAlert');
    const btn = document.getElementById('saveGoalsBtn');
    FZForm.setLoading(btn, true);
    const { error } = await FZDB.updateProfile({
      goal: document.getElementById('pGoal').value,
      experience_level: document.getElementById('pExperience').value,
      weekly_availability: parseInt(document.getElementById('pAvailability').value, 10) || null,
    });
    FZForm.setLoading(btn, false, 'Guardar objetivos');
    if (error) { FZForm.showAlert('goalsAlert', 'error', error.message); return; }
    FZForm.showAlert('goalsAlert', 'success', FZDB.isDemo()
      ? 'Modo demo: conecta Supabase en <code>js/config.js</code> para guardar de verdad.'
      : 'Objetivos actualizados.');
  });

  document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    FZForm.clearAlert('securityAlert');
    const pw = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmNewPassword').value;
    if (pw.length < 8) { FZForm.showAlert('securityAlert', 'error', 'Debe tener al menos 8 caracteres.'); return; }
    if (pw !== confirm) { FZForm.showAlert('securityAlert', 'error', 'Las contraseñas no coinciden.'); return; }

    const client = window.getFitzoneClient();
    if (!client) {
      FZForm.showAlert('securityAlert', 'error', 'Modo demo: conecta Supabase en <code>js/config.js</code> para cambiar la contraseña de verdad.');
      return;
    }
    const btn = document.getElementById('savePasswordBtn');
    FZForm.setLoading(btn, true);
    const { error } = await client.auth.updateUser({ password: pw });
    FZForm.setLoading(btn, false, 'Actualizar contraseña');
    if (error) { FZForm.showAlert('securityAlert', 'error', FZForm.translateAuthError(error)); return; }
    FZForm.showAlert('securityAlert', 'success', 'Contraseña actualizada.');
    e.target.reset();
  });

  document.getElementById('profileLogoutBtn').addEventListener('click', async () => {
    const client = window.getFitzoneClient();
    if (client) await client.auth.signOut();
    window.location.href = 'login.html';
  });

  load();
})();
