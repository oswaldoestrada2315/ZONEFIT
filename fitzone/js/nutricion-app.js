(function () {
  const modal = document.getElementById('mealModal');
  document.getElementById('openAddMeal').addEventListener('click', () => { modal.hidden = false; });
  document.getElementById('cancelMeal').addEventListener('click', () => { modal.hidden = true; });
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.hidden = true; });

  function setBar(barId, value, target) {
    const pct = target ? Math.min(100, (value / target) * 100) : 0;
    document.getElementById(barId).style.width = pct + '%';
  }

  async function load() {
    const todayISO = new Date().toISOString().slice(0, 10);
    const profile = await FZDB.getNutritionProfile();
    const logs = await FZDB.listNutritionLogs(FZDB.isDemo() ? undefined : todayISO);

    const totals = logs.reduce((acc, l) => ({
      calories: acc.calories + (l.calories || 0),
      protein: acc.protein + (parseFloat(l.protein_g) || 0),
      carbs: acc.carbs + (parseFloat(l.carbs_g) || 0),
      fat: acc.fat + (parseFloat(l.fat_g) || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    document.getElementById('caloriesConsumed').textContent = totals.calories;
    document.getElementById('caloriesTarget').textContent = profile?.target_calories ?? '—';
    setBar('caloriesBar', totals.calories, profile?.target_calories);

    document.getElementById('proteinConsumed').textContent = totals.protein;
    document.getElementById('proteinTarget').textContent = profile?.target_protein_g ?? '—';
    setBar('proteinBar', totals.protein, profile?.target_protein_g);

    document.getElementById('carbsConsumed').textContent = totals.carbs;
    document.getElementById('carbsTarget').textContent = profile?.target_carbs_g ?? '—';
    setBar('carbsBar', totals.carbs, profile?.target_carbs_g);

    document.getElementById('fatConsumed').textContent = totals.fat;
    document.getElementById('fatTarget').textContent = profile?.target_fat_g ?? '—';
    setBar('fatBar', totals.fat, profile?.target_fat_g);

    const body = document.getElementById('mealsBody');
    body.innerHTML = logs.length ? logs.map(l => `
      <tr><td>${l.meal_label}</td><td>${l.calories}</td><td>${l.protein_g ?? '—'}</td><td>${l.carbs_g ?? '—'}</td><td>${l.fat_g ?? '—'}</td></tr>
    `).join('') : `<tr><td colspan="5" style="color:var(--text-muted)">Aún no registras comidas hoy.</td></tr>`;
  }

  document.getElementById('mealForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    FZForm.clearAlert('mealAlert');
    const entry = {
      logged_at: new Date().toISOString().slice(0, 10),
      meal_label: document.getElementById('mealLabel').value,
      calories: parseInt(document.getElementById('mealCalories').value, 10) || 0,
      protein_g: parseFloat(document.getElementById('mealProtein').value) || 0,
      carbs_g: parseFloat(document.getElementById('mealCarbs').value) || 0,
      fat_g: parseFloat(document.getElementById('mealFat').value) || 0,
    };
    const btn = document.getElementById('saveMealBtn');
    FZForm.setLoading(btn, true);
    const { error } = await FZDB.addNutritionLog(entry);
    FZForm.setLoading(btn, false, 'Guardar');

    if (error) { FZForm.showAlert('mealAlert', 'error', 'No se pudo guardar: ' + error.message); return; }
    if (FZDB.isDemo()) {
      FZForm.showAlert('mealAlert', 'error', 'Modo demo: conecta Supabase en <code>js/config.js</code> para guardar de verdad.');
      return;
    }
    modal.hidden = true;
    e.target.reset();
    load();
  });

  load();
})();
