-- ============================================================
-- FITZONE — ESQUEMA POSTGRES (Supabase)
-- ============================================================
-- Cómo aplicar: Supabase Dashboard → SQL Editor → pega este archivo → Run.
-- Supabase ya gestiona auth.users (contraseñas con hash, recuperación,
-- sesiones JWT seguras) — por eso NO creamos una tabla "users" propia.
-- Cada tabla de este esquema se relaciona con auth.users(id) y queda
-- protegida con Row Level Security: cada persona SOLO puede leer y
-- escribir sus propias filas. Esa es la base de "memoria por usuario".

-- ---------- extensiones ----------
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. PERFILES (datos públicos/editables del usuario)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  goal text,                      -- 'perder_peso' | 'ganar_musculo' | 'resistencia' | 'mantenimiento'
  experience_level text,          -- 'principiante' | 'intermedio' | 'avanzado'
  weekly_availability int,        -- días por semana
  equipment text,                 -- 'gimnasio_completo' | 'casa_basico' | 'sin_equipo'
  height_cm numeric(5,1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- Crea el perfil automáticamente cuando alguien se registra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Nuevo miembro'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. EJERCICIOS (catálogo — lectura pública, escritura solo admin)
-- ============================================================
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  muscle_group text not null,     -- 'pecho','espalda','pierna','hombro','brazo','core','cardio'
  description text,
  technique text,
  difficulty text,                -- 'principiante' | 'intermedio' | 'avanzado'
  discipline text,                -- 'fuerza','hipertrofia','resistencia','cardio','movilidad','funcional'
  created_at timestamptz not null default now()
);

alter table public.exercises enable row level security;
create policy "exercises: public read" on public.exercises
  for select using (true);
-- Solo backend/admin inserta vía service_role (no expuesto al frontend).

-- ============================================================
-- 3. RUTINAS Y SU CONTENIDO
-- ============================================================
create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  objective text,
  days_per_week int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.routine_days (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  day_label text not null,        -- 'Lunes', 'Día 1', etc.
  day_order int not null default 0
);

create table if not exists public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_day_id uuid not null references public.routine_days(id) on delete cascade,
  exercise_id uuid references public.exercises(id),
  exercise_order int not null default 0,
  target_sets int,
  target_reps text,               -- texto para permitir rangos: '8-12'
  rest_seconds int
);

-- Historial real de ejecución (lo que el usuario efectivamente hizo)
create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  routine_exercise_id uuid references public.routine_exercises(id),
  performed_at timestamptz not null default now(),
  set_number int not null,
  reps_done int,
  weight_kg numeric(6,2),
  notes text
);

alter table public.routines enable row level security;
alter table public.routine_days enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.workout_logs enable row level security;

create policy "routines: own rows" on public.routines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "routine_days: via parent routine" on public.routine_days
  for all using (exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid()))
  with check (exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid()));

create policy "routine_exercises: via parent day" on public.routine_exercises
  for all using (exists (
    select 1 from public.routine_days d join public.routines r on r.id = d.routine_id
    where d.id = routine_day_id and r.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.routine_days d join public.routines r on r.id = d.routine_id
    where d.id = routine_day_id and r.user_id = auth.uid()
  ));

create policy "workout_logs: own rows" on public.workout_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 4. PROGRESO FÍSICO
-- ============================================================
create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recorded_at date not null default current_date,
  weight_kg numeric(5,2),
  body_fat_pct numeric(4,1),
  waist_cm numeric(5,1),
  hip_cm numeric(5,1),
  chest_cm numeric(5,1),
  arm_cm numeric(5,1),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.body_measurements enable row level security;
create policy "body_measurements: own rows" on public.body_measurements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_type text not null,         -- 'peso_objetivo','fuerza_objetivo','habito'
  target_value numeric(7,2),
  target_date date,
  status text not null default 'activo', -- 'activo','cumplido','pausado'
  created_at timestamptz not null default now()
);

alter table public.goals enable row level security;
create policy "goals: own rows" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 5. NUTRICIÓN
-- ============================================================
create table if not exists public.nutrition_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  objective text,                 -- 'deficit','mantenimiento','superavit'
  activity_level text,            -- 'sedentario'...'muy_activo'
  target_calories int,
  target_protein_g int,
  target_carbs_g int,
  target_fat_g int,
  updated_at timestamptz not null default now()
);

alter table public.nutrition_profiles enable row level security;
create policy "nutrition_profiles: own rows" on public.nutrition_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at date not null default current_date,
  meal_label text,                -- 'Desayuno','Almuerzo','Cena','Snack'
  calories int,
  protein_g numeric(5,1),
  carbs_g numeric(5,1),
  fat_g numeric(5,1),
  created_at timestamptz not null default now()
);

alter table public.nutrition_logs enable row level security;
create policy "nutrition_logs: own rows" on public.nutrition_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 6. MEMBRESÍAS
-- ============================================================
create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_cents int not null,
  currency text not null default 'COP',
  billing_period text not null default 'mensual',
  features jsonb not null default '[]',
  is_featured boolean not null default false,
  sort_order int not null default 0
);

alter table public.membership_plans enable row level security;
create policy "membership_plans: public read" on public.membership_plans
  for select using (true);

create table if not exists public.user_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.membership_plans(id),
  status text not null default 'activa', -- 'activa','vencida','cancelada'
  started_at date not null default current_date,
  renews_at date
);

alter table public.user_memberships enable row level security;
create policy "user_memberships: own rows" on public.user_memberships
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Índices de apoyo
-- ============================================================
create index if not exists idx_routines_user on public.routines(user_id);
create index if not exists idx_workout_logs_user_date on public.workout_logs(user_id, performed_at);
create index if not exists idx_body_measurements_user_date on public.body_measurements(user_id, recorded_at);
create index if not exists idx_nutrition_logs_user_date on public.nutrition_logs(user_id, logged_at);

-- ============================================================
-- Nota sobre copias de seguridad y escalabilidad (punto 6 y 9 de la skill):
-- Supabase realiza backups automáticos diarios en los planes Pro+;
-- en el plan gratuito, exporta periódicamente con:
--   supabase db dump --db-url <tu-connection-string> > backup.sql
-- El esquema usa uuid + índices por user_id, pensado para crecer sin
-- rediseño: nuevas tablas de dominio solo necesitan repetir el patrón
-- "user_id uuid references auth.users(id)" + policy "own rows".
-- ============================================================
