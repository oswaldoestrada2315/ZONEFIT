/**
 * FITZONE — CONFIGURACIÓN DE CONEXIÓN A SUPABASE
 * ------------------------------------------------
 * 1. Crea un proyecto gratuito en https://supabase.com
 * 2. Ve a Settings → API y copia:
 *      - "Project URL"        → pégala en SUPABASE_URL
 *      - "anon public" key    → pégala en SUPABASE_ANON_KEY
 * 3. En el SQL Editor de Supabase, pega y ejecuta db/schema.sql
 *
 * La "anon key" es pública por diseño (está hecha para vivir en el
 * frontend) — el acceso real a los datos lo controla Row Level Security
 * en la base de datos (ver db/schema.sql), no esta clave. NUNCA pongas
 * aquí la "service_role key": esa sí es secreta y nunca debe salir del
 * servidor.
 */
window.FITZONE_CONFIG = {
  SUPABASE_URL: 'https://TU-PROYECTO.supabase.co',
  SUPABASE_ANON_KEY: 'TU_ANON_KEY_AQUI',
};
