# Spec: Convenciones compartidas — Montalchino

Base común para los specs de módulo (`SPEC-content.md`, `SPEC-storefront.md`,
`SPEC-checkout.md`, `SPEC-orders.md`, `SPEC-auth.md`, `SPEC-admin.md`).
Referenciado desde cada spec; las secciones individuales solo se repiten si un
módulo las altera.

## Objetivo general

Tienda online de la marca **Montalchino**. Catálogo por colecciones exclusivas,
carrito + checkout con MercadoPago (Checkout Pro), panel admin para gestionar
colecciones/categorías/productos e imágenes, y gestión de pedidos. Deploy en Vercel.

## Tech Stack

| Capa        | Tecnología |
|-------------|-----------|
| Framework   | Next.js 16.3.4 (App Router), React 19.2, TypeScript 5 (strict) |
| Estilos     | Tailwind CSS v4 (`@tailwindcss/postcss`), tema editorial claro |
| Base de datos | Firebase Firestore |
| Auth        | Firebase Auth (email/password) para el admin |
| Imágenes    | Cloudinary (el storefront solo consume URLs) |
| Pagos       | MercadoPago Checkout Pro (hospedado) |
| Deploy      | Vercel |

> La base de Next 16 parte de esta repo (`create-next-app`, ya inicializada).
> La versión instalada tiene breaking changes: **leer la doc correspondiente en
> `node_modules/next/dist/docs/` antes de escribir código de una feature.**

## Commands

```
npm run dev      → desarrollo (http://localhost:3000)
npm run build    → build de producción (verificación principal)
npm run lint     → eslint
npm run start    → servir el build
npm test         → Vitest (test unitarios)
```

## Project Structure

```
app/
  (public)/                    → layout/tienda abierta
    page.tsx                   → home
    colecciones/[slug]/page.tsx
    categorias/[slug]/page.tsx
    producto/[slug]/page.tsx
    buscar/page.tsx
    carrito/page.tsx
    pedido/[id]/page.tsx       → estado post-pago
  (admin)/admin/
    login/page.tsx
    page.tsx                   → dashboard con acceso rápido
    colecciones/page.tsx       → CRUD colecciones
    categorias/page.tsx        → CRUD categorías
    productos/page.tsx         → lista productos
    productos/nuevo/page.tsx
    productos/[id]/page.tsx
    pedidos/page.tsx           → lista pedidos
    pedidos/[id]/page.tsx      → detalle + cambio de estado
    settings/page.tsx          → configuración de envío
  api/
    orders/route.ts            → POST: crear pedido + preferencia MP
    orders/[id]/status/route.ts→ PATCH: cambio de estado (admin)
    webhooks/mercadopago/route.ts
    cloudinary/sign/route.ts   → firma para subida firmada
components/
  public/                      → Header, Footer, ProductCard, ProductGrid, SearchBar, SizeSelector, CartDrawer…
  admin/                       → ProductForm, CollectionForm, CategoryForm, ImageUploader, OrdersTable, StatusBadge…
lib/
  firebase/client.ts           → SDK cliente
  firebase/admin.ts            → Firebase Admin (server-only)
  cloudinary.ts                → firma/upload (server-only)
  mercadopago.ts               → preferencias + verificación (server-only)
  cart.ts                      → lógica pura del carrito (testeable)
  money.ts                     → formato COP
  slug.ts                      → slugificación
  settings.ts                  → lectura de settings/tienda (envío, moneda…)
types/                         → modelos Firestore (Collection, Category, Product, Variant, Order, CartItem, Settings)
tests/                         → pruebas unitarias (Vitest)
.env.local                     → secrets (NUNCA en git)
```

## Code Style

- Componentes en PascalCase, archivos en kebab-case, server components por defecto;
  `"use client"` solo donde haya interactividad/estado.
- TypeScript estricto, sin `any`; tipos de datos en `types/` (una fuente de verdad).
- Textos de UI en español. Precios siempre enteros en COP.
- Sin comentarios salvo motivos no evidentes (el porqué, no el qué).
- `next/image` para todas las imágenes del storefront (con remotePatterns de Cloudinary).
- Ejemplo (Server Component):

```tsx
// components/public/ProductCard.tsx
import Image from "next/image";
import { formatCOP } from "@/lib/money";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group">
      <Image
        src={product.images[0]?.url}
        alt={product.name}
        width={800}
        height={1000}
        className="transition-transform duration-500 group-hover:scale-105"
      />
      <h3 className="font-serif">{product.name}</h3>
      <p className="text-stone-500">{formatCOP(product.price)}</p>
    </article>
  );
}
```

## Testing Strategy

- Framework: **Vitest + React Testing Library** (fuente pura y lógica no se testean con UI).
- Cobertura mínima obligatoria sobre lógica pura: `lib/cart.ts` (añadir/quitar/redimensionar),
  `lib/money.ts`, `lib/slug.ts`, transición de estados de pedido, y el descuento de stock
  en el webhook (con transacción).
- Flujos de integración (webhook, checkout) se cubren con PRUEBAS manuales + `npm run build`
  como gate de verificación, y verificación visual con la skill de browser-automation.
- Las route handlers se validan con `npm run build` y pruebas manuales en dev.

## Boundaries (global)

- **Always:** correr `npm run build` y `npm run lint` antes de commitear; validar toda
  entrada en route handlers y server actions; precios enteros COP; descuento de stock
  SIEMPRE dentro de una transacción de Firestore; textos en español.
- **Ask first:** cambios al modelo de datos Firestore, añadir dependencias, cambiar
  pasarela de pago, tarifa de envío o estructura de rutas, cambiar configuración de
  CI/deploy, exponer datos más allá de lo del spec.
- **Never:** commitear `.env*` ni credenciales; usar la service account en el cliente;
  descontar stock sin verificar el pago; guardar datos sensibles de tarjeta (no pasan
  por nuestra app: Checkout Pro es hospedado).

## Variables de entorno

```
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_SERVICE_ACCOUNT_JSON               (server-only)
MERCADOPAGO_ACCESS_TOKEN                    (server-only)
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY                          (server-only)
CLOUDINARY_API_SECRET                       (server-only)
ADMIN_ALLOWED_EMAILS                        (lista, separada por comas)
```

Config editable (Firestore): `settings/tienda` → `shippingFlatRate` (COP). Sin doc,
el código usa un fallback dev en `lib/settings.ts`.