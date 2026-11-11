(function () {
  const CAT_LABEL = { tecnica: 'Técnica', nutricion: 'Nutrición', recuperacion: 'Recuperación', habitos: 'Hábitos' };

  const TIPS = [
    { cat: 'tecnica', title: 'La técnica de la sentadilla, paso a paso', body: 'Pies al ancho de hombros, pecho arriba y rodillas siguiendo la dirección de los pies. Desciende hasta donde tu movilidad lo permita sin perder la curvatura neutra de la espalda baja. La profundidad ideal es la que puedas controlar con buena técnica, no la máxima posible.' },
    { cat: 'tecnica', title: 'Por qué el peso muerto empieza en las piernas', body: 'Antes de tirar con la espalda, empuja el piso con las piernas: eso activa la cadena posterior en el orden correcto y protege la zona lumbar. La barra debe viajar pegada al cuerpo durante todo el recorrido.' },
    { cat: 'nutricion', title: 'Cuánta proteína necesitas realmente', body: 'Para la mayoría de personas que entrenan fuerza o hipertrofia, 1.6–2.2 g de proteína por kilogramo de peso corporal al día es un rango respaldado por la evidencia. Más allá de eso, el beneficio adicional es marginal.' },
    { cat: 'nutricion', title: 'El timing de comidas importa menos de lo que crees', body: 'El total de calorías y proteína en el día pesa mucho más que el momento exacto en que comes, salvo en contextos de alto rendimiento competitivo. No te obsesiones con la "ventana anabólica".' },
    { cat: 'recuperacion', title: 'El sueño es parte del entrenamiento', body: 'La mayoría de la recuperación muscular ocurre durante el sueño profundo. Dormir menos de 6 horas de forma crónica reduce la síntesis de proteína muscular y aumenta el riesgo de lesión.' },
    { cat: 'recuperacion', title: 'Descanso activo vs. descanso total', body: 'Caminar, nadar suave o hacer movilidad en tus días de descanso puede acelerar la recuperación comparado con el reposo absoluto, siempre que la intensidad sea baja.' },
    { cat: 'habitos', title: 'La consistencia le gana a la intensidad', body: 'Entrenar 3 veces por semana durante un año supera casi cualquier rutina "perfecta" de 2 meses. Diseña tu plan alrededor de lo que puedas sostener, no de lo que se vea mejor en papel.' },
    { cat: 'habitos', title: 'Cómo no perder el hábito en semanas difíciles', body: 'Reduce el objetivo, no lo elimines: si no puedes entrenar 1 hora, entrena 20 minutos. Mantener la racha importa más que el volumen en las semanas de baja energía.' },
  ];

  function render(cat) {
    const grid = document.getElementById('tipsGrid');
    const list = TIPS.filter(t => !cat || t.cat === cat);
    grid.innerHTML = list.map((t, i) => `
      <article class="dash-card span-4 tip-card" data-index="${TIPS.indexOf(t)}" style="cursor:pointer">
        <span class="badge" style="margin-bottom:var(--space-3)">${CAT_LABEL[t.cat]}</span>
        <h3 style="margin-bottom:var(--space-2)">${t.title}</h3>
        <p style="font-size:var(--fs-small)">${t.body.slice(0, 90)}…</p>
      </article>
    `).join('');

    grid.querySelectorAll('.tip-card').forEach(card => {
      card.addEventListener('click', () => {
        const tip = TIPS[parseInt(card.dataset.index, 10)];
        document.getElementById('tipModalCat').textContent = CAT_LABEL[tip.cat];
        document.getElementById('tipModalTitle').textContent = tip.title;
        document.getElementById('tipModalBody').textContent = tip.body;
        document.getElementById('tipModal').hidden = false;
      });
    });
  }

  document.getElementById('closeTipModal').addEventListener('click', () => { document.getElementById('tipModal').hidden = true; });
  document.getElementById('tipModal').addEventListener('click', (e) => { if (e.target.id === 'tipModal') e.target.hidden = true; });

  document.querySelectorAll('#tipTabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#tipTabs .tab').forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      render(tab.dataset.cat);
    });
  });

  render('');
})();
