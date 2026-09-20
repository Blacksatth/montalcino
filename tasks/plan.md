# Implementation Plan: Montalchino e-commerce

## Overview

Tienda online de Montalchino: catálogo por colecciones exclusivas (con categorías y
buscador), carrito + checkout con MercadoPago (Checkout Pro), panel admin (Firebase Auth)
para CRUD de colecciones/categorías/productos, subida de imágenes a Cloudinary y gestión
de pedidos. Next 16 (App Router) + Tailwind v4 + TypeScript en Vercel. Fuente de verdad:
Firestore (escritor exclusivo: servidor). UI en español, moneda COP, estética editorial clara.

## Architecture Decisions

1. **Firestore accedido solo desde el servidor.** El cliente nunca lee/escribe Firestore
   directamente: todo pasa por Server Components/Server Actions/Route Handlers usando
   Firebase Admin. Las reglas de Firestore quedan en `deny` total (menos aguja: no hay
   acceso directo). El carrito vive en el cliente (Context + localStorage).
2. **Auth:** Firebase Auth (email/password) en cliente para login → `idToken` → se cambia
   por **cookies de sesión httpOnly** (Firebase Admin `createSessionCookie`, 7 días) y se
   valida en servidor con `verifySessionCookie`. **Allowlist** por email
   (`ADMIN_ALLOWED_EMAILS`). Check optmista por ruta con **`proxy.ts`** (en Next 16
   `middleware` está deprecado y renombrado a proxy — `dist/docs/…/file-conventions/proxy`),
   y auth **real** en cada ruta/acción de escritura (`verifySession` del DAL).
3. **Stock por talla, descontado solo cuando el pago se confirma.** El flujo es:
   orden `pending` (validando stock/precios contra Firestore) → Checkout Pro → webhook MP
   → **transacción Firestore** que marca `paid`, descuenta `sizes[].quantity` y auto-marca
   `active=false` si se agota, con **idempotencia** (si `payment.mpPaymentId` ya existe,
   no re-descuenta).
4. **Imágenes:** Cloudinary con **subida firmada** (firma por route handler protegido).
   Se guarda `{ publicId, url }`. `next/image` con `images.remotePatterns` para
   `res.cloudinary.com`. El seed de contenido usa el cloud público `demo` de Cloudinary
   como placeholder hasta subir las fotos reales.
5. **Env de envío:** doc `settings/tienda` (`shippingFlatRate`) con fallback dev en
   `lib/settings.ts`; editable en `/admin/settings`.
6. **Caché:** las páginas de catálogo se renderizan dinámicas para reflejar el admin al
   recargar (sin ISR). Búsqueda y filtros en cliente sobre los productos activos
   (catálogo pequeño; sin motor de búsqueda externo en el MVP).
7. **MercadoPago:** SDK oficial `mercadopago` (Node). Checkout Pro: `external_reference`
   = orderId, `back_urls` → `/pedido/[id]`, `notification_url` → webhook. El webhook
   **nunca** confirma a ciegas: consulta el pago por API.

## Task List

### Phase 0 — Scaffold base
- [ ] Task 1: Dependencias + `.env.example` + script `test` (Vitest) .
- [ ] Task 2: Tipos de dominio (`types/`) + libs puras (`money`, `slug`, `cart`) con tests.
- [ ] Task 3: Config Next (images `remotePatterns` Cloudinary), tema editorial Tailwind + fuentes, `layout.tsx` con Header/Footer.

### Phase 1 — content (datos)
- [ ] Task 4: `lib/firebase/{client,admin}.ts`, `lib/settings.ts`, DAL de catálogo
       (lectura pública + escrituras con guard de admin, valida slug único).
- [ ] Task 5: Seed `settings/tienda` + contenido demo (colecciones, categorías, productos con imágenes `demo` de Cloudinary).

### Checkpoint A — content
- [ ] `npm run lint` y `npm run build` pasan
- [ ] `npm test` verde (money/slug/cart)
- [ ] Seed corre y se ven docs en Firestore (emulador/consola)
- [ ] Revisión humana antes de continuar

### Phase 2 — storefront
- [ ] Task 6: Rutas públicas de catálogo (home, colección, categoría, producto) + componentes de presentación con animaciones (hover scale, blur-up, fade de grids).
- [ ] Task 7: Buscador (`/buscar` + `SearchBar` con debounce y filtro por categoría).
- [ ] Task 8: Carrito (`cart` Context + localStorage), selector de talla con límite de stock, `/carrito`, contador en header.

### Checkpoint B — storefront
- [ ] Home muestra colecciones/categorías/productos del seed
- [ ] Buscar y filtrar por categoría funcionan; estados vacíos correctos
- [ ] Añadir al carrito exige talla y respeta stock; persiste en reload
- [ ] Verificación visual con browser-automation (sin errores de consola)
- [ ] Revisión humana

### Phase 3 — auth
- [ ] Task 9: Auth base: cookies de sesión (`/api/auth/session`, `/api/auth/logout`), DAL `verifySession` con allowlist, `proxy.ts` optimista, `/admin/login`, pantalla "sin acceso".

### Checkpoint C — auth
- [ ] Email autorizado entra a `/admin` y hace logout; sesión persiste al recargar
- [ ] Email no autorizado no ve nada de `/admin`
- [ ] Revisión humana

### Phase 4 — admin
- [ ] Task 10: Layout/navegación admin + dashboard con métricas.
- [ ] Task 11: CRUD categorías (form + ruta protegida con slug único).
- [ ] Task 12: CRUD colecciones (+ `heroImage`).
- [ ] Task 13: `/api/cloudinary/sign` (protegido) + componente `ImageUploader`.
- [ ] Task 14: Form de producto (galería, tallas×stock, precio COP, colección/categoría, slug, featured/active) + lista + persistencia protegida.
- [ ] Task 15: `/admin/settings` (tarifa de envío).

### Checkpoint D — admin publica
- [ ] Crear colección/categoría/producto con imagen desde el admin → se ve en home al recargar
- [ ] Editar y desactivar se reflejan al público; mensajes de guardado claros
- [ ] `npm run build` verde
- [ ] Revisión humana

### Phase 5 — checkout (MercadoPago)
- [ ] Task 16: POST `/api/orders` (validación server + orden `pending` + preferencia MP, `lib/mercadopago.ts`).
- [ ] Task 17: Desde `/carrito`: formulario de datos del cliente → redirección a Checkout Pro.
- [ ] Task 18: Webhook `/api/webhooks/mercadopago`: verificación por API + transacción (paid + stock) + idempotencia; tests de la lógica pura de descuento.
- [ ] Task 19: Página pública `/pedido/[id]` con estados (success/pending/failure via `back_urls`) y polling corto.

### Checkpoint E — checkout
- [ ] Pago en sandbox deja `status=paid`, stock por talla descontado, `mpPaymentId` guardado
- [ ] Doble notificación no descuenta dos veces
- [ ] Pedido sin stock/precio desactualizado se rechaza antes de MP
- [ ] Revisión humana

### Phase 6 — orders (pedidos)
- [ ] Task 20: Admin pedidos: lista con filtro por estado, detalle, PATCH `/api/orders/[id]/status` (auth + transición válida) + tests de transiciones.

### Checkpoint F — pedidos
- [ ] El admin ve pedidos, filtra y cambia estado; se refleja en `/pedido/[id]`
- [ ] Transiciones inválidas rechazadas en servidor
- [ ] `npm run lint` + `npm run build` + `npm test` verdes

### Phase 7 — Deploy y pulido
- [ ] Task 21: `.env` en Vercel (proyecto/cloud/mp), Firestore rules `deny` total, primer deploy, verificación end-to-end de un pedido real (sandbox → paid) y review visual final.

## Risks and Mitigations

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Credenciales reales (Firebase/Cloudinary/MP) aún no existen | Alto | Desarrollar con fallbacks (settings dev, cloud `demo`); integrar contra sandbox; al llegar al deploy, exigir `.env` real |
| MercadoPago: sandbox/webhook entregas | Medio | Webhook reversible e idempotente; en dev se puede simular el POST para probar el descuento; documentar test users |
| Next 16 breaking changes no cubiertos | Alto | Cada feature lee su doc en `node_modules/next/dist/docs/` antes de implementar (proxy, route handlers, server actions, images) |
| Over-sell por doble pago/reintento | Alto | Stock se descuenta solo en transacción + idempotencia por `mpPaymentId` |
| Imágenes no válidas rompen `next/image`/build | Medio | `remotePatterns` solo `res.cloudinary.com`; `alt` siempre presente; validar imagen mínima en el form |

## Open Questions

1. **Firestore rules**: se propone `deny` total (todo el acceso por el servidor). ¿Admin edita
   vía Firestore console como respaldo? No interfiere, el panel basta.
2. **Pedidos**: el cliente deja teléfono/email/dirección en el checkout — ¿confirmación
   manual del admin antes de despachar (status `paid → shipped`) es suficiente? (Spec: sí.)
3. **Env reales**: se necesitan las claves para probar Firebase, Cloudinary y MercadoPago
   (se piden al llegar a las fases 1/4/5).

## Tracking

Lista de tareas espejo en `tasks/todo.md` (checklist). Ningún plan previo existía en `tasks/`.