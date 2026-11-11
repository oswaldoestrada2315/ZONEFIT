(function () {
  // ---------- Tabs ----------
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('[data-panel]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      panels.forEach(p => { p.hidden = p.dataset.panel !== tab.dataset.tab; });
    });
  });

  // ---------- Modal crear rutina ----------
  const modal = document.getElementById('routineModal');
  document.getElementById('openCreateRoutine').addEventListener('click', () => { modal.hidden = false; });
  document.getElementById('cancelRoutine').addEventListener('click', () => { modal.hidden = true; });
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.hidden = true; });

  const OBJ_LABEL = { fuerza: 'Fuerza', hipertrofia: 'Hipertrofia', resistencia: 'Resistencia', movilidad: 'Movilidad' };

  async function loadRoutines() {
    const grid = document.getElementById('routinesGrid');
    const routines = await FZDB.listRoutines();
    if (!routines.length) {
      grid.innerHTML = `
        <div class="dash-card span-12" style="text-align:center;padding:var(--space-16)">
          <p style="margin-bottom:var(--space-4)">Aún no tienes rutinas. Crea la primera o usa el asistente guiado.</p>
          <button class="btn btn-primary" onclick="document.getElementById('openCreateRoutine').click()">+ Nueva rutina</button>
        </div>`;
      return;
    }
    grid.innerHTML = routines.map(r => `
      <div class="dash-card span-4">
        <h3>${r.name}</h3>
        <p style="font-size:var(--fs-small);margin-bottom:var(--space-4)">${OBJ_LABEL[r.objective] || r.objective || 'Sin objetivo'} · ${r.days_per_week || '—'} días/semana</p>
        <div style="display:flex;gap:var(--space-2)">
          <a href="entrenamiento.html" class="btn btn-secondary" style="flex:1;font-size:var(--fs-xs)">Entrenar</a>
          <button class="btn btn-ghost delete-routine" data-id="${r.id}" style="color:var(--error)">Eliminar</button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.delete-routine').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('¿Eliminar esta rutina? Esta acción no se puede deshacer.')) return;
        await FZDB.deleteRoutine(btn.dataset.id);
        loadRoutines();
      });
    });
  }

  document.getElementById('routineForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    FZForm.clearAlert('routineAlert');
    const payload = {
      name: document.getElementById('rName').value.trim(),
      objective: document.getElementById('rObjective').value,
      days_per_week: parseInt(document.getElementById('rDays').value, 10),
    };
    if (!payload.name) return;

    const btn = document.getElementById('saveRoutineBtn');
    FZForm.setLoading(btn, true);
    const { error } = await FZDB.createRoutine(payload);
    FZForm.setLoading(btn, false, 'Crear rutina');

    if (error) {
      FZForm.showAlert('routineAlert', 'error', 'No se pudo crear: ' + error.message);
      return;
    }
    if (FZDB.isDemo()) {
      FZForm.showAlert('routineAlert', 'error',
        'Modo demo: esta rutina no se guarda de verdad todavía. Conecta Supabase en <code>js/config.js</code>.');
      return;
    }
    modal.hidden = true;
    e.target.reset();
    loadRoutines();
  });

  // ---------- Asistente de creación (genera una estructura sugerida) ----------
  const TEMPLATES = {
    fuerza: { principiante: 3, intermedio: 4, avanzado: 5 },
    hipertrofia: { principiante: 3, intermedio: 5, avanzado: 6 },
    resistencia: { principiante: 3, intermedio: 4, avanzado: 5 },
    movilidad: { principiante: 2, intermedio: 3, avanzado: 4 },
  };
  const SPLITS = {
    3: ['Torso', 'Pierna', 'Cuerpo completo'],
    4: ['Torso A', 'Pierna A', 'Torso B', 'Pierna B'],
    5: ['Pecho/Tríceps', 'Espalda/Bíceps', 'Pierna', 'Hombro', 'Cuerpo completo/Core'],
    6: ['Pecho', 'Espalda', 'Pierna', 'Hombro', 'Brazo', 'Cardio/Movilidad'],
  };

  document.getElementById('wizardForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const objective = document.getElementById('wObjective').value;
    const experience = document.querySelector('input[name="wExp"]:checked').value;
    const days = parseInt(document.getElementById('wDays').value, 10);
    const equipment = document.getElementById('wEquipment').value;

    const suggested = Math.min(days, TEMPLATES[objective][experience]);
    const splitKey = Math.min(6, Math.max(3, suggested));
    const split = SPLITS[splitKey] || SPLITS[3];

    const equipNote = {
      gimnasio_completo: 'con acceso a máquinas y pesos libres',
      casa_basico: 'adaptado a mancuernas/bandas en casa',
      sin_equipo: 'con ejercicios de peso corporal',
    }[equipment];

    const result = document.getElementById('wizardResult');
    result.innerHTML = `
      <div class="alert alert--success">Estructura sugerida (${suggested} días/semana, ${experience}) ${equipNote}:</div>
      <table class="data-table">
        <thead><tr><th>Día</th><th>Enfoque</th></tr></thead>
        <tbody>
          ${split.slice(0, suggested).map((label, i) => `<tr><td>Día ${i + 1}</td><td>${label}</td></tr>`).join('')}
        </tbody>
      </table>
      <button class="btn btn-primary" style="margin-top:var(--space-6)" id="wizardCreateBtn">Crear esta rutina</button>
    `;

    document.getElementById('wizardCreateBtn').addEventListener('click', async () => {
      const { error } = await FZDB.createRoutine({
        name: `${OBJ_LABEL[objective]} — ${suggested} días`,
        objective,
        days_per_week: suggested,
      });
      if (!error && !FZDB.isDemo()) {
        document.querySelector('[data-tab="mias"]').click();
        loadRoutines();
      } else {
        alert(FZDB.isDemo()
          ? 'Modo demo: conecta Supabase en js/config.js para guardar rutinas de verdad.'
          : 'No se pudo crear: ' + error.message);
      }
    });
  });

  loadRoutines();
})();
