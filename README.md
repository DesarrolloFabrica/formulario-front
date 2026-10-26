# Formularios — Fábrica de Contenidos (`formularios-front`)

MVP frontend de la plataforma de formularios por rol de la **Fábrica de Contenidos**.

Frontend conectado al backend NestJS de evaluaciones: autenticación institucional con Google, sesión JWT, reanudación de intentos, guardado de respuestas y calificación final.

## Tecnologías

- Next.js (App Router)
- React + TypeScript (strict)
- Tailwind CSS
- Componentes estilo shadcn/ui
- Lucide React
- React Hook Form + Zod
- ESLint

## Requisitos

- Node.js 20+ recomendado
- npm

## Instalación y ejecución

```bash
npm install
copy .env.example .env.local
npm run dev
```

Abre [http://localhost:3001](http://localhost:3001). El backend debe estar disponible en `http://localhost:3000/api`.

Otros scripts:

```bash
npm run build
npm run start
npm run lint
```

## Estructura principal

```text
src/
  app/                  # Rutas (login, formularios/[rol])
  components/
    auth/               # LoginForm, AuthGuard, LoadingState
    forms/              # DynamicForm y piezas reutilizables
    ui/                 # Componentes visuales base
  config/roles.ts       # Roles centralizados
  data/                 # Usuarios MOCK + banco de preguntas
  hooks/
  providers/
  services/             # AuthService y FormSubmissionService (MOCK)
  types/
  lib/
```

## Roles y rutas

| Rol | ID | Ruta |
| --- | --- | --- |
| Data y Desarrollo | `data-desarrollo` | `/formularios/data-desarrollo` |
| GIF | `gif` | `/formularios/gif` |
| Realizadores | `realizadores` | `/formularios/realizadores` |
| Presentadoras | `presentadoras` | `/formularios/presentadoras` |
| Analistas de Marketing | `analistas-marketing` | `/formularios/analistas-marketing` |

- `/login` — autenticación
- `/` — redirige a login o al formulario del rol según la sesión

## Usuarios de demostración

Contraseña común: `demo1234`

| Rol | Correo |
| --- | --- |
| Data y Desarrollo | `data@fabrica.demo` |
| GIF | `gif@fabrica.demo` |
| Realizadores | `realizadores@fabrica.demo` |
| Presentadoras | `presentadoras@fabrica.demo` |
| Analistas de Marketing | `marketing@fabrica.demo` |

Tras iniciar sesión, el usuario entra **directamente** a su formulario (sin selector de rol). Si intenta abrir el formulario de otro rol, se le redirige al suyo.

## Preguntas

Las preguntas provienen del archivo `Banco_preguntas_por_rol_IA_v2 (2).xlsx` (pestaña `LÉAME` + hojas por rol). Están tipadas en `src/data/forms-bank.json`.

Cada formulario incluye 16 ítems: 8 del núcleo transversal + 8 del rol. La simulación práctica (SIM) no forma parte de este MVP.

Tipos de respuesta soportados:

- Selección única
- Selección múltiple
- Clasificación / emparejamiento
- Ordenamiento
- Decisión en dos niveles (acción + razón)

## Sistema MOCK

### Autenticación

- Interfaz: `AuthService` (`src/services/auth-service.ts`)
- Implementación: `MockAuthService`
- Sesión persistida en `localStorage` solo para desarrollo
- **No es segura ni apta para producción**

### Envío de formularios

- Interfaz: `FormSubmissionService` (`src/services/form-service.ts`)
- Implementación: `MockFormSubmissionService`
- Valida presencia de datos, simula latencia y responde éxito/error
- No almacena respuestas en un servidor

## Integración futura con backend

1. Implementar `AuthService` contra la API real (tokens, cookies, etc.).
2. Implementar `FormSubmissionService` con `fetch`/`axios` hacia el endpoint de respuestas.
3. Sustituir las instancias exportadas en `src/services/*` sin cambiar los componentes.
4. Reemplazar la guarda de rutas del frontend por autorización real en el backend.
5. Configurar `NEXT_PUBLIC_API_URL` (ver `.env.example`).

## Limitaciones actuales

- Sin backend, base de datos ni APIs reales
- Sin registro, recuperación de contraseña ni administración
- Sin calificación automática de respuestas (solo captura)
- Autorización de rutas simulada en el cliente
- Sin notificaciones, reportes ni exportación
