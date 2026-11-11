# FitZone — Plataforma premium de gimnasio

Sitio web + aplicación interna completa para un gimnasio premium, construida en HTML5 / CSS3 / JavaScript vanilla (sin framework ni build step), con persistencia real opcional vía **Supabase** (Postgres + Auth + Row Level Security).

Estética: negro profundo (`#08090B`) + amarillo dorado (`#FFC928`), fotografía/gráfica de alto contraste, tarjetas limpias, microinteracciones y animaciones 3D/CSS discretas. El video de recorrido del gimnasio aparece **únicamente** en el hero de la página de inicio (`index.html`); ninguna otra pantalla lo usa.

---

## 1. Cómo ejecutar el proyecto

No requiere instalación de dependencias ni build. Es un sitio estático: cualquier servidor HTTP simple sirve.

```bash
cd fitzone
python3 -m http.server 8080
# abrir http://localhost:8080/index.html
```

(También funciona con `npx serve`, la extensión "Live Server" de VS Code, o subiéndolo tal cual a cualquier hosting estático — Netlify, Vercel, GitHub Pages, etc.)

**Importante:** debe abrirse siempre vía `http://` (un servidor), no con doble clic como `file://`, porque el video y los módulos JS no cargan correctamente desde el sistema de archivos.

---

## 2. Conectar la base de datos real (Supabase)

Sin configurar, el sitio funciona íntegramente en **modo demo**: todas las pantallas muestran datos de ejemplo claramente editables y cada acción de guardado avisa "Modo demo: no se guarda de verdad todavía". Esto permite explorar y revisar el diseño completo sin backend.

Para activar persistencia real (cuentas permanentes, datos por usuario, sincronización entre dispositivos):

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. En el panel de Supabase, ve a **SQL Editor** y ejecuta el contenido completo de [`db/schema.sql`](db/schema.sql). Esto crea todas las tablas (perfiles, rutinas, ejercicios, medidas corporales, objetivos, nutrición, membresías) con Row Level Security activado: cada usuario solo puede leer y escribir sus propios datos.
3. En **Project Settings → API**, copia la **Project URL** y la **anon public key**.
4. Pega ambos valores en [`js/config.js`](js/config.js):

```js
window.FITZONE_CONFIG = {
  SUPABASE_URL: 'https://TU-PROYECTO.supabase.co',
  SUPABASE_ANON_KEY: 'tu-anon-key-aqui'
};
```

5. Recarga el sitio. El aviso amarillo de "modo demo" desaparecerá y los registros, rutinas, medidas y comidas se guardarán de verdad en Postgres, ligados al usuario autenticado.

**Nunca** pegues ahí la `service_role key` — esa es secreta y nunca debe estar en código que corre en el navegador. La `anon key` es segura de exponer porque toda la protección real vive en las políticas RLS de la base de datos.

### Qué resuelve Supabase Auth automáticamente
- Hash seguro de contraseñas (no hay que implementar Argon2id/bcrypt a mano).
- Cookies de sesión seguras y renovación automática de token.
- Flujo de recuperación de contraseña con token de un solo uso y expiración.
- Mensajes de error genéricos en login (no revela si un correo existe).

---

## 3. Estructura de carpetas

```
fitzone/
├── index.html                  Landing page (única pantalla con el video)
├── css/
│   ├── tokens.css              Paleta, tipografía, espaciado, sombras, motion — fuente única de verdad
│   ├── base.css                Reset y estilos base
│   ├── components.css          Botones, tarjetas, formularios, modales, toasts
│   ├── layout.css               Header, hero, grids de secciones, footer, auth-shell
│   ├── app.css                  Shell de la app interna (sidebar, dashboard, tabs, calculadoras)
│   └── public.css               Estilos de páginas públicas informativas (filtros, FAQ)
├── js/
│   ├── vendor/                  GSAP, ScrollTrigger y supabase-js vendorizados (sin CDN)
│   ├── config.js                 Credenciales de Supabase (editar aquí)
│   ├── supabase-client.js        Factory del cliente Supabase (null si no está configurado)
│   ├── db.js                     Capa de datos con fallback a modo demo
│   ├── auth-guard.js              Protege páginas internas si no hay sesión
│   ├── app-shell.js / public-shell.js   Inyectan header/sidebar/footer compartidos
│   ├── nav.js, hero-video.js, reveal.js, tilt.js   Comportamiento de la landing
│   └── *.js                      Un archivo por pantalla (dashboard, rutinas, progreso, etc.)
├── pages/                        Todas las pantallas excepto la landing
├── assets/
│   ├── video/                    Video del hero (desktop + versión móvil comprimida)
│   ├── poster/                   Imagen de respaldo del video
│   └── img/                      Imágenes generadas (placeholders originales, no stock)
└── db/
    └── schema.sql                 Esquema completo de Postgres + políticas RLS
```

---

## 4. Checklist de funciones

### ✅ Totalmente funcional (sin backend)
- Navegación completa, menú móvil accesible, scroll suave.
- Calculadoras de IMC, TMB, gasto energético y macronutrientes (matemática real en cliente).
- Asistente de creación de rutinas (lógica de plantillas según objetivo/experiencia/disponibilidad).
- Gráfico de progreso (SVG generado a partir de los datos).
- Validaciones de formularios (registro, login, perfil) en cliente.
- Animaciones GSAP/ScrollTrigger + tilt 3D con CSS, con soporte completo de `prefers-reduced-motion`.
- Fallback automático de video a imagen poster si falla la reproducción o el usuario prefiere menos movimiento.

### ✅ Funcional con Supabase configurado
- Registro, login, cierre de sesión y recuperación de contraseña reales.
- Persistencia real de perfil, medidas corporales, rutinas, registros de entrenamiento y comidas, ligados al usuario autenticado.
- Aislamiento de datos por usuario mediante Row Level Security (un usuario nunca puede leer datos de otro).
- Sesión persistente entre visitas y dispositivos (el usuario se registra una sola vez).

### 🟡 Demo / contenido de ejemplo (marcado explícitamente en la UI)
- Estadísticas de la landing (miembros, valoración), testimonios, precios de membresías.
- Perfiles de entrenadores y artículos de "Consejos y aprendizaje".
- Catálogo de ejercicios (16 ejercicios de ejemplo) — pensado para ser reemplazado por datos reales en la tabla `exercises` vía `service_role` o el panel de Supabase.

### ⏳ Pendiente de decisión de negocio (no implementado a propósito)
- Precios definitivos de membresías y procesamiento de pagos (requiere pasarela real, p. ej. Stripe).
- Envío real de notificaciones push/email (la pestaña de notificaciones en Perfil es una maqueta con nota explicativa).
- Moderación/carga de contenido real de entrenadores y testimonios.

No existen botones decorativos que simulen una acción sin ejecutarla: toda acción de guardado o autenticación, si no hay backend conectado, lo informa explícitamente en vez de fingir éxito.

---

## 5. Seguridad

- El hash de contraseñas, las cookies de sesión y la validación de tokens de recuperación los gestiona Supabase Auth — no hay contraseñas en `localStorage` ni lógica de hashing propia en el frontend.
- Todo acceso a datos por usuario pasa por Row Level Security a nivel de base de datos (`auth.uid() = user_id`), no por lógica de autorización en el cliente, que nunca es confiable por sí sola.
- `js/config.js` solo contiene la clave pública `anon`; la clave `service_role` nunca debe usarse en el frontend.
- Los formularios validan en cliente (UX) pero la autorización real siempre ocurre en el servidor (Supabase), como corresponde.
- Supabase gestiona backups automáticos del proyecto; en el plan gratuito se recomienda además `supabase db dump` periódico (ver comentario final de `db/schema.sql`).

---

## 6. Próximos pasos sugeridos
1. Reemplazar las imágenes generadas en `assets/img/` por fotografía real de la marca.
2. Cargar el catálogo real de ejercicios en la tabla `exercises` (vía SQL Editor o un script con `service_role`, nunca desde el navegador).
3. Definir precios finales de membresía y conectar una pasarela de pago.
4. Sustituir los entrenadores y testimonios de ejemplo por contenido real y autorizado.
