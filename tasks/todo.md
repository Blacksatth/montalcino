# Todo — Montalchino e-commerce

Detalle por tarea (aceptación/verificación/files) en `tasks/plan.md`. Ordenado por dependencia.

## Phase 0 — Scaffold base

- [x] T1: Dependencias + `.env.example` + script `test` (Vitest)
- [x] T2: Tipos de dominio + libs puras (money, slug, cart) con tests
- [x] T3: Config Next (images Cloudinary) + tema editorial + layout público

## Phase 1 — content

- [x] T4: Firebase client/admin + settings + DAL catálogo
- [x] T5: Seed settings + contenido demo

### Checkpoint A — content
- [x] build/lint/test verdes; seed poblado; revisión humana → **ver estado abajo**
  - Nota: seed verificado con datos reales (2 colecciones, 3 categorías, 4 productos, settings/tienda); home/colecciones/categorias/producto/buscar renderizan el contenido del seed

## Phase 2 — storefront

- [x] T6: Rutas catálogo + presentación con animaciones
  - Aceptación: `/` (home), `/colecciones/[slug]`, `/categorias/[slug]`, `/producto/[slug]` renderizan con DAL; cards con hover scale y `placeholder="blur"`; estados vacío/error
  - Verificar: `npm run build` + browser-automation
  - Files: app/(public)/**/page.tsx, components/public/{ProductCard,ProductGrid,CollectionCard}.tsx
  - Nota: hover scale sí; `placeholder="blur"` requiere blurDataURL (imágenes remotas) → se usa fondo neutro + fade/zoom CSS por ahora. Sin credenciales las páginas muestran empty states (correcto).

- [x] T7: Buscador
  - Aceptación: `/buscar?q=&cat=` filtra por nombre/colección/categoría en cliente (debounce 250ms en `SearchBar`)
  - Verificar: browser-automation (búsqueda y filtro, estado vacío)
  - Files: app/(public)/buscar/page.tsx, components/public/SearchBar.tsx
  - Nota: input no controlado + debounce en handler (lint: `set-state-in-effect`). `SearchBar` con `useSearchParams` envuelto en Suspense en Header.

- [x] T8: Carrito
  - Aceptación: Context+localStorage; añadir exige talla y respeta stock; `/carrito` con totales; contador en header
  - Verificar: browser-automation (add/change/remove/persist)
  - Files: lib/cart.ts (ya en T2), components/public/{CartProvider,CartDrawer,SizeSelector}.tsx, app/(public)/carrito/page.tsx
  - Nota: store externo `lib/cart-store.ts` (useSyncExternalStore + localStorage); `maxQty?` añadido a CartItem (límite conocido al añadir); drawer con resumen + steppers capped; `/carrito` recalcula stock con productos en vivo (DAL) y muestra envío flat + total; verificado por inyección de localStorage (badge, totales, drawer, persistencia).

### Checkpoint B — storefront
- [x] Revisión humana aprobada por el usuario ✅

## Phase 3 — auth

- [x] T9: Auth base
  - Aceptación: `/api/auth/session` (+logout) crea cookie httpOnly (Admin `createSessionCookie`); DAL `verifySession` + allowlist; `proxy.ts` optimista para `/admin`; `/admin/login`; pantalla "sin acceso"
  - Verificar: browser-automation (login/logout/persistir/no autorizado)
  - Files: app/api/auth/{session,logout}/route.ts, lib/auth.ts, proxy.ts (raíz), app/admin/login/page.tsx, lib/firebase/admin.ts
  - Nota: `isAllowedEmail` ahora **deniega** si `ADMIN_ALLOWED_EMAILS` está vacío (spec: nunca obviar allowlist). `proxy.ts` (matcher `/admin/:path*`, excluye login). Ruta-grupo `app/admin/(panel)/` para que el layout guard no cubra `/admin/login` (bug de redirect loop encontrado y corregido). `getSessionUser()` separa sesión válida de allowlist → pantalla "sin acceso". `getServerSnapshot` cacheado en CartProvider. LoginForm ampliado con provider Google (`signInWithPopup`) — activado por el usuario en Firebase. Autenticación end-to-end verificado vía Admin SDK (cookie de sesión, /admin 200, redirect 307, allowlist 403).

### Checkpoint C — auth
- [x] Revisión humana aprobada por el usuario ✅ (login Google + panel + logout OK)

## Phase 4 — admin

- [x] T10: Layout/navegación admin + dashboard con métricas
  - Aceptación: shell con nav y dashboard con datos reales
  - Verificado: `AdminNav` (Resumen/Productos/Colecciones/Categorías/Ajustes) con link activo; dashboard server-render con conteos (productos/activos/destacados/colecciones/categorías/stock), alerta de agotados, envío flat y últimos productos; `/admin` 200 renderizando métricas; lint/build ✓
  - Files: components/admin/{AdminNav,AdminShell}.tsx, app/admin/\(panel\)/page.tsx

- [x] T11: CRUD categorías
  - Aceptación: form protegido (slug único) crea/edita/elimina; no borra con productos
  - Verificado (browser, sesión real): crear → redirect y visible; editar → visible; `/categorias/qa-prueba` público 200 tras crear y 404 tras eliminar (admin publica); sin errores de consola; lint/build/test ✓
  - Nota: `eslint.config.mjs` suma `argsIgnorePattern ^_` para acciones `(state, formData)` con args no usados. `getCategoryById` añadido al DAL.
  - Files: app/admin/\(panel\)/categorias/{actions.ts,page.tsx,nueva/page.tsx,[id]/page.tsx}, components/admin/{CategoryForm,DeleteCategoryButton}.tsx

- [x] T12: CRUD colecciones (+ heroImage)
  - Aceptación: form protegido (slug único) crea/edita; toggle publicar/ocultar; no borra con productos
  - Verificado (browser, sesión real): crear→visible; `/colecciones/qa-coleccion` público 200 activa, 404 oculta, 200 al republicar, 404 tras eliminar; sin errores de consola; lint/build ✓
  - Nota: `CollectionActions` usa `useTransition` + llamada directa a actions (toggle publicar/ocultar + eliminar). `heroImage` por URL/publicId en texto hasta T13 (uploader). `getCollectionById` añadido al DAL.
  - Files: app/admin/\(panel\)/colecciones/{actions.ts,page.tsx,nueva/page.tsx,[id]/page.tsx}, components/admin/{CollectionForm,CollectionActions}.tsx
- [x] T13: `/api/cloudinary/sign` + ImageUploader
  - Construido: `app/api/cloudinary/sign/route.ts` (POST protegido con `requireAdmin`, firma `api_sign_request` de `{timestamp, folder}`) + `components/admin/ImageUploader.tsx` (sube a `api.cloudinary.com/v1_1/{cloud}/auto/upload` con la firma, devuelve `{publicId, url}`).
  - Verificado (browser, flujo exacto del ImageUploader): sign → 200, upload → 200 con `secure_url` en `montalchino/` y cleanup OK; sin sesión → 401. **Blocker resuelto:** el key `551356754934699` era de solo lectura (403 create); el usuario entregó `653438461395613` con permiso de escritura → upload real 200.
  - Files: app/api/cloudinary/sign/route.ts, components/admin/ImageUploader.tsx
- [x] T14: Form de producto (galería, tallas×stock, precio COP, colección/categoría, slug, featured/active) + lista + persistencia protegida
  - Aceptación: crear/editar producto completo; activar/desactivar; eliminar; subir imagen
  - Verificado (browser real): subir imagen real → thumbnail; crear → 200 público con nombre+precio; editar precio → 275.000 en público; ocultar → 404 público; publicar → 200; eliminar → 404; sin errores de consola
  - Bug encontrado/corregido: `ProductRowActions` no refrescaba tras toggle (el estado del botón quedaba obsoleto) → `router.refresh()` tras la action. Actions devuelven `{error?}` (sin redirect) para UI no bloqueante.
  - Files: app/admin/\(panel\)/productos/{actions.ts,page.tsx,nuevo/page.tsx,[id]/page.tsx}, components/admin/{ProductForm,ProductRowActions,ImageUploader}.tsx, lib/db/catalog.ts (setProductActive, deleteProduct)

- [x] T15: `/admin/settings` (tarifa de envío)
  - Aceptación: editar `shippingFlatRate` persiste y se usa en el público
  - Verificado: guardar 25000→13333 persiste tras redirect; pública /carrito 200 (lee settings); restaurado a 25000 (default). lint/build ✓
  - Files: app/admin/\(panel\)/settings/{actions.ts,page.tsx}, components/admin/SettingsForm.tsx
### Checkpoint D — admin publica
- [x] El admin puede crear/editar/desactivar contenido y se refleja al público; revisión humana
  - Verificado (browser, flujo completo): crear categoría+colección (con heroCloudinary real)+producto (con imagen real) → home muestra colección y categoría, `/categorias/qa-categoria`·`/colecciones/qa-coleccion`·`/producto/qa-producto` todos 200; productos NO-featured no salen en home (gating por diseño, no bug); cleanup completo sin sobras en Firestore ni Cloudinary. lint/build/test ✓
  - Pendiente humano: navegar el panel y verificar visualmente el flujo

## Phase 5 — checkout

- [x] T16 (parte no-MP): modelo de datos de pedidos + POST `/api/orders` + página pública `/pedido/[id]`
  - Verificado: pedido válido → 201 con `{orderId, reference, total, checkoutUrl:null}`; `#20260902-26570` (265.000 = 2×120.000 + envío 25.000); sin stock → 400; correo inválido → 400; sin items → 400; `/pedido/[id]` 200 con referencia+estado+ítems+comprador; pedido inexistente → 404; cleanup sin sobras.
  - `lib/errors.ts` nuevo: `ValidationError` movido (puro, re-exportado desde catalog). `lib/order.ts` puro (transiciones, costos, customer/items validación, referencia) + 13 tests nuevos (45 total).
  - Files: lib/{errors,order}.ts, lib/db/orders.ts (createOrder/getOrderById/updateOrderStatus con `canTransition`), lib/mercadopago.ts (seam: `createCheckoutPreference` → null si no hay token, tira si configurado pero sin implementar T16-MP), app/api/orders/route.ts, app/\(public\)/pedido/\[id\]/page.tsx, components/public/OrderStatusBadge.tsx
  - Detectado/corregido: producto semilla "Camisa Olivia" quedó `active:false` (reactivado); QA huérfano "gemma" (producto) + orden de prueba (borrados).
  - Pendiente (bloqueado por token): preferencia MP real en `lib/mercadopago.ts` (T16-MP) + T17 checkout UI → Checkout Pro.
- [ ] T17: Checkout UI desde `/carrito` → Checkout Pro
- [ ] T18: Webhook MP: verificación + transacción (paid+stock) + idempotencia + tests
- [ ] T19: `/pedido/[id]` pública con estados y polling

### Checkpoint E — checkout
- [ ] Sandbox: order→paid, stock descontado, idempotencia; revisión humana

## Phase 6 — orders

- [ ] T20: Admin pedidos (lista+filtro+detalle+PATCH status) + tests de transiciones

### Checkpoint F — pedidos
- [ ] Cambios de estado ok y reflejados en público

## Phase 7 — Deploy

- [ ] T21: Vercel + Firestore rules deny + verificación end-to-end

## Colección Casual (catálogo real)

- [x] C1: Extraer la colección del PDF ("CASUAL": portada + 4 camisas con precios)
  - Extracted: `Montalcino Paint $125.000`, `Basic $105.000`, `Military $125.000`, `Eclipse $110.000`
  - Files: scripts/assets/coleccion-casual/*.jpg (fuente del seed)
- [x] C2: `scripts/import-casual.ts` → sube los 5 assets a Cloudinary (`montalchino/…`)
  y repuebla Firestore solo con la Colección Casual (1 colección, 1 categoría "Camisas", 4 productos)
  - File: scripts/import-casual.ts + `npm run import:casual`
- [x] C3: Verificación end-to-end
  - Cloudinary: 5 assets reales subidos (IDs verificados). Firestore: datos correctos (precios/URLs).
  - Home: colección "Casual" + categoría "Camisas" + destacados (Military, Paint) con imágenes vía `next/image` (cloudinary `ddpexfbjn`).
  - `/colecciones/casual` y `/producto/montalcino-paint`: 200, fotos, precio y tallas S–XL; 0 errores de consola, 0 requests fallidas.
  - lint ✓ test ✓ (45) build ✓
  - Nota: descripciones y stock inicial son placeholders editables desde `/admin` (el modelo no puede ver las fotos del PDF).