(function () {
  const DIFF_LABEL = { principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado' };
  let currentExercise = null;

  async function renderExercises(discipline) {
    const grid = document.getElementById('exerciseGrid');
    grid.innerHTML = `<p style="grid-column:span 12;font-size:var(--fs-small);color:var(--text-muted)">Cargando ejercicios…</p>`;
    const list = await FZDB.listExercises(discipline || undefined);

    if (!list.length) {
      grid.innerHTML = `<p style="grid-column:span 12;font-size:var(--fs-small);color:var(--text-muted)">No hay ejercicios en esta categoría todavía.</p>`;
      return;
    }

    grid.innerHTML = list.map((ex, i) => `
      <div class="dash-card span-4 exercise-card" data-index="${i}" style="cursor:pointer">
        <h3 style="margin-bottom:var(--space-1)">${ex.name}</h3>
        <p style="font-size:var(--fs-xs);color:var(--yellow);font-weight:700;text-transform:uppercase;letter-spacing:.04em">${ex.muscle_group}</p>
        <p style="font-size:var(--fs-small);margin-top:var(--space-3)">${ex.description || ''}</p>
        <div style="margin-top:var(--space-4);display:flex;justify-content:space-between;align-items:center">
          <span class="badge">${DIFF_LABEL[ex.difficulty] || ex.difficulty}</span>
          <button class="btn-ghost" style="font-size:var(--fs-xs)">Registrar serie →</button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.exercise-card').forEach(card => {
      card.addEventListener('click', () => openExercise(list[parseInt(card.dataset.index, 10)]));
    });
  }

  function openExercise(ex) {
    currentExercise = ex;
    document.getElementById('exModalName').textContent = ex.name;
    document.getElementById('exModalMeta').textContent = `${ex.muscle_group.toUpperCase()} · ${DIFF_LABEL[ex.difficulty] || ex.difficulty}`;
    document.getElementById('exModalDesc').textContent = ex.description || '';
    document.getElementById('exModalTechnique').textContent = ex.technique ? `Técnica: ${ex.technique}` : '';
    document.getElementById('logForm').reset();
    document.getElementById('logSet').value = 1;
    FZForm.clearAlert('logAlert');
    document.getElementById('exerciseModal').hidden = false;
  }

  document.getElementById('closeExModal').addEventListener('click', () => { document.getElementById('exerciseModal').hidden = true; });
  document.getElementById('exerciseModal').addEventListener('click', (e) => {
    if (e.target.id === 'exerciseModal') e.target.hidden = true;
  });

  document.getElementById('logForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    FZForm.clearAlert('logAlert');
    const client = window.getFitzoneClient();
    const btn = document.getElementById('logSetBtn');

    if (!client) {
      FZForm.showAlert('logAlert', 'error',
        'Modo demo: este registro no se guarda todavía. Conecta Supabase en <code>js/config.js</code>.');
      return;
    }
    const uid = await FZDB.currentUserId();
    if (!uid) { FZForm.showAlert('logAlert', 'error', 'Inicia sesión para registrar tu entrenamiento.'); return; }

    FZForm.setLoading(btn, true);
    const { error } = await client.from('workout_logs').insert({
      user_id: uid,
      set_number: parseInt(document.getElementById('logSet').value, 10),
      reps_done: parseInt(document.getElementById('logReps').value, 10),
      weight_kg: parseFloat(document.getElementById('logWeight').value) || null,
      notes: currentExercise ? currentExercise.name : null,
    });
    FZForm.setLoading(btn, false, 'Registrar serie');

    if (error) {
      FZForm.showAlert('logAlert', 'error', 'No se pudo registrar: ' + error.message);
      return;
    }
    FZForm.showAlert('logAlert', 'success', 'Serie registrada.');
    document.getElementById('logSet').value = parseInt(document.getElementById('logSet').value, 10) + 1;
  });

  // ---------- Tabs de disciplina ----------
  document.querySelectorAll('#disciplineTabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#disciplineTabs .tab').forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      renderExercises(tab.dataset.discipline);
    });
  });

  renderExercises('');
})();
