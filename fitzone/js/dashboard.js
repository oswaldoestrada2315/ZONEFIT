(function () {
  async function render() {
    const profile = await FZDB.getProfile();
    const greetName = profile?.full_name ? profile.full_name.split(' ')[0] : 'de nuevo';
    document.getElementById('greeting').textContent = `Hola, ${greetName} 👋`;

    // --- Peso corporal ---
    const measurements = await FZDB.listMeasurements();
    if (measurements.length) {
      const last = measurements[measurements.length - 1];
      const prev = measurements.length > 1 ? measurements[measurements.length - 2] : null;
      document.getElementById('metricWeight').textContent = Number(last.weight_kg).toFixed(1);
      if (prev) {
        const diff = (last.weight_kg - prev.weight_kg);
        const el = document.getElementById('metricWeightDelta');
        el.className = 'metric-delta ' + (diff <= 0 ? 'metric-delta--up' : 'metric-delta--down');
        el.textContent = `${diff <= 0 ? '↓' : '↑'} ${Math.abs(diff).toFixed(1)} kg desde el último registro`;
      }
    } else {
      document.getElementById('metricWeight').textContent = '–';
    }

    // --- Objetivo activo ---
    const goals = await FZDB.listGoals();
    const goalBox = document.getElementById('goalBox');
    if (goals.length) {
      const g = goals[0];
      const labelMap = { peso_objetivo: 'Peso objetivo', fuerza_objetivo: 'Fuerza objetivo', habito: 'Hábito' };
      goalBox.innerHTML = `
        <div class="metric-row"><span class="value">${g.target_value ?? ''}</span><span class="unit">${g.goal_type === 'peso_objetivo' ? 'kg' : ''}</span></div>
        <p style="font-size:var(--fs-small);margin-top:var(--space-2)">${labelMap[g.goal_type] || g.goal_type}${g.target_date ? ' · meta: ' + g.target_date : ''}</p>
      `;
    } else {
      goalBox.innerHTML = `<p style="font-size:var(--fs-small)">Aún no tienes un objetivo activo.</p><a href="perfil.html" class="btn-ghost" style="font-size:var(--fs-xs)">Definir objetivo →</a>`;
    }

    // --- Rutina actual ---
    const routines = await FZDB.listRoutines();
    const routineBox = document.getElementById('routineBox');
    if (routines.length) {
      const r = routines[0];
      routineBox.innerHTML = `
        <strong style="display:block;margin-bottom:var(--space-1)">${r.name}</strong>
        <p style="font-size:var(--fs-small)">${r.days_per_week || '—'} días/semana · ${r.objective || 'sin objetivo definido'}</p>
        <a href="rutinas.html" class="btn-ghost" style="font-size:var(--fs-xs)">Ver rutina →</a>
      `;
    } else {
      routineBox.innerHTML = `<p style="font-size:var(--fs-small)">Aún no tienes rutinas creadas.</p><a href="rutinas.html" class="btn-ghost" style="font-size:var(--fs-xs)">Crear la primera →</a>`;
    }

    // --- Próximo entrenamiento (derivado de la primera rutina, de forma simple) ---
    const nextBox = document.getElementById('nextWorkoutBox');
    if (routines.length) {
      nextBox.innerHTML = `
        <div class="list-row" style="border:none;padding-top:0">
          <div class="list-row__main"><strong>${routines[0].name}</strong><span>Según tu progresión guardada</span></div>
          <a href="entrenamiento.html" class="btn btn-secondary" style="font-size:var(--fs-xs);padding:var(--space-2) var(--space-4)">Empezar</a>
        </div>
      `;
    } else {
      nextBox.innerHTML = `<p style="font-size:var(--fs-small)">Crea una rutina para ver aquí tu próxima sesión.</p>`;
    }
  }

  render();
})();
