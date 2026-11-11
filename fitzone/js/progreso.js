(function () {
  const modal = document.getElementById('measurementModal');
  const form = document.getElementById('measurementForm');

  document.getElementById('openAddMeasurement').addEventListener('click', () => {
    document.getElementById('mDate').value = new Date().toISOString().slice(0, 10);
    modal.hidden = false;
  });
  document.getElementById('cancelMeasurement').addEventListener('click', () => { modal.hidden = true; });
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.hidden = true; });

  function drawChart(points) {
    const svg = document.getElementById('weightChart');
    if (!points.length) { svg.innerHTML = '<text x="320" y="110" fill="#6C7079" font-size="13" text-anchor="middle">Aún no hay datos suficientes</text>'; return; }

    const W = 640, H = 220, PAD = 28;
    const weights = points.map(p => p.weight_kg).filter(w => w != null);
    const min = Math.min(...weights) - 1;
    const max = Math.max(...weights) + 1;
    const xStep = (W - PAD * 2) / Math.max(1, points.length - 1);

    const toX = i => PAD + i * xStep;
    const toY = w => H - PAD - ((w - min) / (max - min || 1)) * (H - PAD * 2);

    let path = '';
    let area = `M ${toX(0)} ${H - PAD} `;
    points.forEach((p, i) => {
      const cmd = i === 0 ? 'M' : 'L';
      path += `${cmd} ${toX(i)} ${toY(p.weight_kg)} `;
      area += `L ${toX(i)} ${toY(p.weight_kg)} `;
    });
    area += `L ${toX(points.length - 1)} ${H - PAD} Z`;

    const dots = points.map((p, i) => `<circle cx="${toX(i)}" cy="${toY(p.weight_kg)}" r="3.5" fill="#FFC928" />`).join('');
    const labels = points.map((p, i) => {
      if (points.length > 8 && i % 2 !== 0) return '';
      return `<text x="${toX(i)}" y="${H - 6}" font-size="10" fill="#6C7079" text-anchor="middle">${(p.recorded_at || '').slice(5)}</text>`;
    }).join('');

    svg.innerHTML = `
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFC928" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#FFC928" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${area}" fill="url(#areaFill)" />
      <path d="${path}" fill="none" stroke="#FFC928" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      ${dots}
      ${labels}
    `;
  }

  function renderTable(points) {
    const body = document.getElementById('measurementsBody');
    if (!points.length) {
      body.innerHTML = `<tr><td colspan="7" style="color:var(--text-muted)">Sin registros todavía.</td></tr>`;
      return;
    }
    body.innerHTML = [...points].reverse().map(p => `
      <tr>
        <td>${p.recorded_at}</td>
        <td>${p.weight_kg ?? '—'}</td>
        <td>${p.waist_cm ?? '—'}</td>
        <td>${p.hip_cm ?? '—'}</td>
        <td>${p.chest_cm ?? '—'}</td>
        <td>${p.arm_cm ?? '—'}</td>
        <td>${p.notes ?? ''}</td>
      </tr>
    `).join('');
  }

  function renderComparison(points) {
    const box = document.getElementById('comparisonBox');
    if (points.length < 2) {
      box.innerHTML = `<p style="font-size:var(--fs-small)">Registra al menos 2 medidas para ver comparaciones.</p>`;
      return;
    }
    const first = points[0];
    const last = points[points.length - 1];
    const diff = (last.weight_kg - first.weight_kg);
    box.innerHTML = `
      <div class="list-row" style="border:none;padding-top:0">
        <div class="list-row__main"><strong>Desde ${first.recorded_at}</strong><span>Peso inicial: ${first.weight_kg} kg</span></div>
      </div>
      <div class="list-row">
        <div class="list-row__main"><strong>Hasta ${last.recorded_at}</strong><span>Peso actual: ${last.weight_kg} kg</span></div>
      </div>
      <div style="margin-top:var(--space-4);text-align:center">
        <span class="metric-delta ${diff <= 0 ? 'metric-delta--up' : 'metric-delta--down'}" style="font-size:1rem">
          ${diff <= 0 ? '↓' : '↑'} ${Math.abs(diff).toFixed(1)} kg en el periodo
        </span>
      </div>
    `;
  }

  async function loadAll() {
    const points = await FZDB.listMeasurements();
    drawChart(points);
    renderTable(points);
    renderComparison(points);
    document.getElementById('chartRange').textContent = points.length
      ? `(${points[0].recorded_at} → ${points[points.length - 1].recorded_at})` : '';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    FZForm.clearAlert('measurementAlert');
    const entry = {
      recorded_at: document.getElementById('mDate').value,
      weight_kg: parseFloat(document.getElementById('mWeight').value) || null,
      waist_cm: parseFloat(document.getElementById('mWaist').value) || null,
      notes: document.getElementById('mNotes').value.trim() || null,
    };
    const btn = document.getElementById('saveMeasurementBtn');
    FZForm.setLoading(btn, true);
    const { error } = await FZDB.addMeasurement(entry);
    FZForm.setLoading(btn, false, 'Guardar');

    if (error) {
      FZForm.showAlert('measurementAlert', 'error', 'No se pudo guardar: ' + error.message);
      return;
    }
    if (FZDB.isDemo()) {
      FZForm.showAlert('measurementAlert', 'error',
        'Modo demo: este registro no se guarda de verdad todavía. Conecta Supabase en <code>js/config.js</code>.');
      return;
    }
    modal.hidden = true;
    form.reset();
    loadAll();
  });

  loadAll();
})();
