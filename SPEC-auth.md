# Spec: auth — Login del admin

Solo el equipo de Montalchino entra al panel. Convenciones compartidas en `SPEC-000-conventions.md`.

## Objective

Autenticar al admin con **Firebase Auth (email/password)** y proteger todas las rutas y
route handlers de `/admin` y `/api` administrativos. La tienda pública no usa auth.

## Modelo de autorización

- Cliente: Firebase JS SDK con **Google Identity Platform** (Auth). Client Components
  (`lib/firebase/client.ts`): login/logout, sesión vía listener `onAuthStateChanged`.
- **Allowlist**: solo emails en `ADMIN_ALLOWED_EMAILS` (env) pueden operar el panel.
- Servidor: **Firebase Admin SDK** valida el `idToken` (o cookie de sesión de 7 días)
  en middleware/rutas y en cada route handler `/api/orders/[id]/status` y
  `/api/cloudinary/sign`. `lib/firebase/admin.ts` es **server-only**
  (`import "server-only"`).

## Rutas

| Ruta | Comportamiento |
|---|---|
| `/admin/login` | Form email/password; error amigable; redirige a `/admin` al loguearse |
| `/admin/*` | Protegida: sin sesión válida → `/admin/login?next=…`; email no en allowlist → pantalla "sin acceso" |

## Referencias técnicas

- Lee `node_modules/next/dist/docs/01-app/02-guides/authentication.md` (patrón cookies +
  middleware en Next 16) y la doc de **Firebase Admin + cookies de sesión**.
- El ID de proyecto y claves vienen de las `NEXT_PUBLIC_FIREBASE_*` + `FIREBASE_SERVICE_ACCOUNT_JSON`.

## Success Criteria

1. Un email autorizado entra a `/admin` y hace logout; la sesión persiste al recargar.
2. Un email NO en allowlist se autentica en Firebase pero ve "sin acceso" y ninguna ruta admin.
3. PATCH de estado de pedido y firma de Cloudinary rechazan solicitudes sin token válido.
4. `npm run build` pasa con el middleware de protección activo.

## Boundaries

- **Always:** credenciales solo por servidor; cookies `httpOnly`; proteger cada route
  handler administrativo (no depender solo de la ocultación de la ruta).
- **Ask first:** proveedores extra (Google), roles por usuario, MFA, invitaciones.
- **Never:** exponer `FIREBASE_SERVICE_ACCOUNT_JSON` al cliente; obviar la allowlist.