# Spec: admin — Panel de gestión

CRUD completo + subida de imágenes. Convenciones compartidas en `SPEC-000-conventions.md`.

## Objective

Que el equipo administre todo el catálogo sin tocar código: **colecciones, categorías,
productos** (con variantes × talla) e **imágenes a Cloudinary**. Todo lo que se publique
se refleja en el home al recargar/visitar (datos en Firestore, sin rebuild).

## Funcionalidad

### Colecciones (`/admin/colecciones`)
- Lista, crear, editar, eliminar (o desactivar), ordenar (`order`), `active`.
- Campo `heroImage` (sube a Cloudinary).

### Categorías (`/admin/categorias`)
- Lista, crear, editar, eliminar, ordenar. Al eliminar, los productos deben reasignarse
  (ask first → se fomenta desactivar).

### Productos (`/admin/productos`, `/admin/productos/nuevo`, `/admin/productos/[id]`)
- Form: nombre, slug (auto-generado, editable), descripción, **precio COP**, colección,
  categoría, **tallas con cantidad** (tabla repetible: talla + stock, agregar/quitar),
  `featured`, `active`, galería de imágenes (múltiples, primera = portada, reordenar, borrar).

### Imágenes → Cloudinary
- Subida **firmada** desde el cliente: `GET /api/cloudinary/sign` (auth admin) devuelve
  una firma corta con timestamp; el cliente sube el archivo directo a Cloudinary
  (`upload` API); guardamos `{ publicId, url }` en Firestore en cada guardado del form.
- `next/image` requiere config `images.remotePatterns` para `res.cloudinary.com`
  (ver `SPEC-content.md`).

### Pedidos (`/admin/pedidos*`)
- Ver y cambiar estado (ver `SPEC-orders.md`).

### Configuración (`/admin/settings`)
- Editar la tarifa fija de envío (`settings/tienda.shippingFlatRate`) y guardarla en
  Firestore. Se refleja en el checkout de inmediato.

### Dashboard (`/admin`)
- Métricas simples con los datos ya existentes: nº de productos activos, colecciones y
  categorías, pedidos pendientes/pagados, últimos pedidos. Sin analytics externo en MVP.

## Hábitos de implementación

- Todos los forms son **Client Components** (`use client`) con validación en cliente
  (clara, en español) y **validación en servidor** al persistir.
- Persistencia: route handlers o Server Actions con Firebase Admin; **slug único**
  validado al guardar (error si ya existe).
- Borrado de producto: preferir `active=false` (deja de existir públicamente) frente a
  borrado físico, salvo que no tenga pedidos asociados.
- Estado de guardado claro (guardando… / guardado / error) en cada form.

## Success Criteria

1. Crear una colección + categoría + producto con tallas, precio y 2 imágenes → se ve en
   home y en su ficha pública inmediatamente.
2. Editar precio/tallas/imágenes de un producto ya publicado funciona y se refleja al
   público.
3. Desactivar un producto o colección lo oculta del catálogo público.
4. Subida de imagen falla con mensaje claro si Cloudinary rechaza; no se guarda el form
   con imágenes incompletas.
5. `npm run build` y `npm run lint` pasan.

## Boundaries

- **Always:** auth admin en sign y en toda persistencia; validar entradas en servidor;
  reutilizar tipos de `types/`.
- **Ask first:** Analytics, log de auditoría, roles por usuario, editar the order de
  imágenes vía drag&drop (vs. subir/bajar simples).
- **Never:** subir credenciales de Cloudinary al cliente (solo firma); permitir el form
  sin autenticación.