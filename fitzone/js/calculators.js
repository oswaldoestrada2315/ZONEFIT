(function () {
  // ---------- Tabs ----------
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.calc-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      panels.forEach(p => { p.hidden = p.dataset.panel !== tab.dataset.tab; });
    });
  });

  // ---------- IMC ----------
  function calcImc() {
    const w = parseFloat(document.getElementById('imcWeight').value);
    const hCm = parseFloat(document.getElementById('imcHeight').value);
    if (!w || !hCm) return;
    const h = hCm / 100;
    const imc = w / (h * h);
    document.getElementById('imcResult').textContent = imc.toFixed(1);

    let cat, pct;
    if (imc < 18.5) { cat = 'Bajo peso'; pct = (imc / 18.5) * 25; }
    else if (imc < 25) { cat = 'Peso normal'; pct = 25 + ((imc - 18.5) / 6.5) * 25; }
    else if (imc < 30) { cat = 'Sobrepeso'; pct = 50 + ((imc - 25) / 5) * 25; }
    else { cat = 'Obesidad'; pct = Math.min(100, 75 + ((imc - 30) / 10) * 25); }
    document.getElementById('imcCategory').textContent = cat;
    document.getElementById('imcBar').style.width = Math.min(100, pct) + '%';
  }
  document.getElementById('calcImcBtn').addEventListener('click', calcImc);
  calcImc();

  // ---------- TMB (Mifflin-St Jeor) ----------
  function calcTmb() {
    const w = parseFloat(document.getElementById('tmbWeight').value);
    const h = parseFloat(document.getElementById('tmbHeight').value);
    const age = parseFloat(document.getElementById('tmbAge').value);
    const sex = document.querySelector('input[name="tmbSex"]:checked').value;
    if (!w || !h || !age) return;
    let tmb = 10 * w + 6.25 * h - 5 * age + (sex === 'm' ? 5 : -161);
    tmb = Math.round(tmb);
    document.getElementById('tmbResult').textContent = tmb;
    document.getElementById('getTmb').value = tmb; // precarga la calculadora de gasto
    return tmb;
  }
  document.getElementById('calcTmbBtn').addEventListener('click', calcTmb);
  calcTmb();

  // ---------- Gasto energético total (TDEE) ----------
  function calcGet() {
    const tmb = parseFloat(document.getElementById('getTmb').value);
    const factor = parseFloat(document.getElementById('getActivity').value);
    if (!tmb || !factor) return;
    const tdee = Math.round(tmb * factor);
    document.getElementById('getResult').textContent = tdee;
    document.getElementById('getDeficit').textContent = Math.round(tdee * 0.8);
    document.getElementById('getMaint').textContent = tdee;
    document.getElementById('getSurplus').textContent = Math.round(tdee * 1.15);
    document.getElementById('macroCalories').value = tdee; // precarga macros
    return tdee;
  }
  document.getElementById('calcGetBtn').addEventListener('click', calcGet);
  calcGet();

  // ---------- Macronutrientes ----------
  function calcMacros() {
    const calories = parseFloat(document.getElementById('macroCalories').value);
    if (!calories) return;
    // Proteína: 1.8 g por kg de peso estimado a partir del peso usado en TMB (si existe)
    const weight = parseFloat(document.getElementById('tmbWeight').value) || parseFloat(document.getElementById('imcWeight').value) || 75;
    const proteinG = Math.round(weight * 1.8);
    const proteinKcal = proteinG * 4;
    const remaining = Math.max(0, calories - proteinKcal);
    const carbsKcal = remaining * 0.6; // ~45% del total, expresado sobre el restante
    const fatKcal = remaining * 0.4;
    const carbsG = Math.round(carbsKcal / 4);
    const fatG = Math.round(fatKcal / 9);

    document.getElementById('macroProtein').textContent = proteinG;
    document.getElementById('macroCarbs').textContent = carbsG;
    document.getElementById('macroFat').textContent = fatG;
  }
  document.getElementById('calcMacroBtn').addEventListener('click', calcMacros);
  calcMacros();
})();
