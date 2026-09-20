# Spec: content — Colecciones, categorías y productos

Módulo raíz del catálogo: define el modelo de datos y quién escribe/lee cada entidad.
Convenciones compartidas en `SPEC-000-conventions.md`.

## Objective

Soportar el catálogo completo de Montalchino: **colecciones** (la unidad de venta,
"colecciones exclusivas"), **categorías** (tipo de prenda/artículo: camisas, pantalones,
accesorios…) y **productos** con **stock por talla/tamaño** e imágenes en Cloudinary.
Firestore es la fuente de verdad; el storefront solo lee, el admin escribe.

## Data model (Firestore)

```ts
// collections/{id}
interface Collection {
  name: string;
  slug: string;                 // único, para ruta pública
  description: string;
  heroImage: CloudImage;        // imagen de portada de la colección
  order: number;                // orden de aparición en home
  active: boolean;              // activo → visible en el storefront
  createdAt: number;            // epoch ms
  updatedAt: number;
}

// categories/{id}
interface Category {
  name: string;
  slug: string;
  order: number;
}

// products/{id}
interface Product {
  name: string;
  slug: string;                 // único, para ruta pública
  description: string;
  price: number;                // entero COP
  collectionId: string;         // pertenece a UNA colección
  categoryId: string;           // pertenece a UNA categoría (filtro)
  sizes: Array<{ size: string; quantity: number }>; // stock por talla
  images: CloudImage[];         // primera imagen = portada
  featured: boolean;            // destacado en home
  active: boolean;              // activo → visible
  createdAt: number;
  updatedAt: number;
}

// tipo compartido
interface CloudImage { publicId: string; url: string; } // url = secura f_auto/q_auto

// settings/tienda
interface Settings {
  shippingFlatRate: number;   // COP, tarifa plana de envío
}
```

Reglas de datos:
- `slug` único por colección y por producto (generado desde el nombre, editable).
- Producto **sin stock disponible** en todas sus tallas se marca `active=false`
  automáticamente en el checkout (ver `SPEC-checkout.md`), nunca se borra (historial de pedidos).
- Precio en enteros COP (nunca decimales ni floats; formato en `lib/money.ts`).

## Referencias técnicas

- Consultas: leer el set de colecciones/categorías/productos `active` para el storefront.
- Imágenes: Cloudinary genera URLs autoparamétricas (`f_auto,q_auto,w_<size>`);
  `next/image` requiere `images.remotePatterns` con `res.cloudinary.com` (leer
  `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md`).
- Búsqueda: para un catálogo pequeño, el storefront descarga productos activos y filtra
  en cliente (nombre, colección, categoría). No se introduce Algolia en el MVP
  (ver Open Questions).

## Success Criteria

1. Se puede crear una colección, categoría y producto desde el admin con slug, precio,
   tallas y al menos una imagen.
2. El storefront lee solo entidades `active` y las ordena según `order`/`featured`.
3. La primera imagen del producto y la `heroImage` de la colección son utilizables por
   `next/image` (remotePatterns funcionando, no rompe el build).
4. Un producto sin stock queda oculto para el público, pero existe en Firestore.

## Boundaries

- **Always:** validar en el servidor que `slug` sea único; imágenes solo por Cloudinary.
- **Ask first:** cambiar colección/categoría de un producto en producción, migraciones.
- **Never:** borrar un producto referenciado por pedidos; guardar URLs que no vengan de
  Cloudinary.

## Open Questions

- RESUELTO: la tarifa fija de envío vive en la doc `settings/tienda` (editable desde
  `/admin/settings`), con fallback dev en `lib/settings.ts` si la doc no existe.
- RESUELTO: productos sin talla (accesorios) usan una única variante `"Única"`.