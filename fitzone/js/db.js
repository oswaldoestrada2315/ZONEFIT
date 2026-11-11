/**
 * Capa de acceso a datos. Cada función intenta Supabase primero; si no
 * está configurado (modo demo), devuelve datos de ejemplo en memoria para
 * que la interfaz sea explorable sin backend. Así cada pantalla puede
 * pedir datos sin importarle si hay conexión real o no.
 */
window.FZDB = (function () {
  const client = () => (window.getFitzoneClient ? window.getFitzoneClient() : null);

  async function currentUserId() {
    const c = client();
    if (!c) return null;
    const { data } = await c.auth.getSession();
    return data?.session?.user?.id || null;
  }

  // ---------- Demo fallbacks (solo lectura, en memoria) ----------
  const DEMO = {
    measurements: [
      { recorded_at: '2026-09-01', weight_kg: 82.4, waist_cm: 91 },
      { recorded_at: '2026-09-15', weight_kg: 81.1, waist_cm: 89.5 },
      { recorded_at: '2026-10-01', weight_kg: 80.0, waist_cm: 88 },
      { recorded_at: '2026-10-15', weight_kg: 79.2, waist_cm: 87 },
      { recorded_at: '2026-11-01', weight_kg: 78.3, waist_cm: 86.2 },
    ],
    routines: [
      { id: 'demo-1', name: 'Fuerza — Torso/Pierna', objective: 'fuerza', days_per_week: 4 },
      { id: 'demo-2', name: 'Hipertrofia 5 días', objective: 'hipertrofia', days_per_week: 5 },
    ],
    goals: [
      { goal_type: 'peso_objetivo', target_value: 75, target_date: '2026-12-20', status: 'activo' },
    ],
    nutritionLogs: [
      { logged_at: '2026-11-11', meal_label: 'Desayuno', calories: 520, protein_g: 38, carbs_g: 55, fat_g: 16 },
      { logged_at: '2026-11-11', meal_label: 'Almuerzo', calories: 710, protein_g: 48, carbs_g: 70, fat_g: 22 },
    ],
  };

  return {
    isDemo() { return !client(); },
    currentUserId,

    async getProfile() {
      const c = client();
      if (!c) return { full_name: 'Usuario demo', goal: 'ganar_musculo', experience_level: 'intermedio' };
      const uid = await currentUserId();
      if (!uid) return null;
      const { data, error } = await c.from('profiles').select('*').eq('id', uid).single();
      if (error) { console.warn('[FitZone] getProfile:', error.message); return null; }
      return data;
    },

    async updateProfile(patch) {
      const c = client();
      if (!c) return { error: null, demo: true };
      const uid = await currentUserId();
      if (!uid) return { error: new Error('Sin sesión') };
      return c.from('profiles').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', uid);
    },

    async listMeasurements() {
      const c = client();
      if (!c) return DEMO.measurements;
      const uid = await currentUserId();
      if (!uid) return [];
      const { data, error } = await c.from('body_measurements').select('*').eq('user_id', uid).order('recorded_at', { ascending: true });
      if (error) { console.warn('[FitZone] listMeasurements:', error.message); return []; }
      return data;
    },

    async addMeasurement(entry) {
      const c = client();
      if (!c) return { error: null, demo: true };
      const uid = await currentUserId();
      if (!uid) return { error: new Error('Sin sesión') };
      return c.from('body_measurements').insert({ ...entry, user_id: uid });
    },

    async listRoutines() {
      const c = client();
      if (!c) return DEMO.routines;
      const uid = await currentUserId();
      if (!uid) return [];
      const { data, error } = await c.from('routines').select('*').eq('user_id', uid).order('created_at', { ascending: false });
      if (error) { console.warn('[FitZone] listRoutines:', error.message); return []; }
      return data;
    },

    async createRoutine(routine) {
      const c = client();
      if (!c) return { error: null, demo: true };
      const uid = await currentUserId();
      if (!uid) return { error: new Error('Sin sesión') };
      return c.from('routines').insert({ ...routine, user_id: uid }).select().single();
    },

    async deleteRoutine(id) {
      const c = client();
      if (!c) return { error: null, demo: true };
      return c.from('routines').delete().eq('id', id);
    },

    async listGoals() {
      const c = client();
      if (!c) return DEMO.goals;
      const uid = await currentUserId();
      if (!uid) return [];
      const { data, error } = await c.from('goals').select('*').eq('user_id', uid).order('created_at', { ascending: false });
      if (error) { console.warn('[FitZone] listGoals:', error.message); return []; }
      return data;
    },

    async listNutritionLogs(dateStr) {
      const c = client();
      if (!c) return DEMO.nutritionLogs;
      const uid = await currentUserId();
      if (!uid) return [];
      let q = c.from('nutrition_logs').select('*').eq('user_id', uid);
      if (dateStr) q = q.eq('logged_at', dateStr);
      const { data, error } = await q.order('created_at', { ascending: true });
      if (error) { console.warn('[FitZone] listNutritionLogs:', error.message); return []; }
      return data;
    },

    async addNutritionLog(entry) {
      const c = client();
      if (!c) return { error: null, demo: true };
      const uid = await currentUserId();
      if (!uid) return { error: new Error('Sin sesión') };
      return c.from('nutrition_logs').insert({ ...entry, user_id: uid });
    },

    async getNutritionProfile() {
      const c = client();
      if (!c) return { target_calories: 2400, target_protein_g: 150, target_carbs_g: 260, target_fat_g: 70 };
      const uid = await currentUserId();
      if (!uid) return null;
      const { data, error } = await c.from('nutrition_profiles').select('*').eq('user_id', uid).maybeSingle();
      if (error) { console.warn('[FitZone] getNutritionProfile:', error.message); return null; }
      return data;
    },

    async upsertNutritionProfile(patch) {
      const c = client();
      if (!c) return { error: null, demo: true };
      const uid = await currentUserId();
      if (!uid) return { error: new Error('Sin sesión') };
      return c.from('nutrition_profiles').upsert({ user_id: uid, ...patch, updated_at: new Date().toISOString() });
    },

    async listMembershipPlans() {
      const c = client();
      if (!c) return [
        { name: 'Básico', price_cents: 7990000, billing_period: 'mensual', features: ['Acceso a sala de pesas y cardio'] },
        { name: 'Pro', price_cents: 12990000, billing_period: 'mensual', is_featured: true, features: ['Acceso 24/7', 'Rutinas y nutrición personalizadas'] },
        { name: 'Elite', price_cents: 19990000, billing_period: 'mensual', features: ['Todo lo de Pro', '2 sesiones 1:1 al mes'] },
      ];
      const { data, error } = await c.from('membership_plans').select('*').order('sort_order');
      if (error) { console.warn('[FitZone] listMembershipPlans:', error.message); return []; }
      return data;
    },

    async listExercises(discipline) {
      const c = client();
      if (!c) return FZ_DEMO_EXERCISES.filter(e => !discipline || e.discipline === discipline);
      let q = c.from('exercises').select('*');
      if (discipline) q = q.eq('discipline', discipline);
      const { data, error } = await q.order('name');
      if (error) { console.warn('[FitZone] listExercises:', error.message); return FZ_DEMO_EXERCISES.filter(e => !discipline || e.discipline === discipline); }
      return data;
    },
  };
})();
