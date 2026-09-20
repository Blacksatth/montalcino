# Spec: casual — Integración de la "Colección Casual"

Carga del catálogo real de **Montalchino** a la tienda, a partir del catálogo
`COLECCIÓN "CASUAL".pdf` (5 páginas: portada + 4 camisas). Convenciones compartidas
en `SPEC-000-conventions.md`; el modelo de datos vive en `SPEC-content.md`.

## Objective

Que el storefront publique la colección con la que la marca se presenta: una única
colección **Casual** con 4 productos (camisas), precios reales y las fotos del PDF
subidas a Cloudinary. Reemplaza por completo el contenido demo de `scripts/seed.ts`.

## Datos extraídos del PDF

| Página | Nombre           | Precio  |
|--------|------------------|---------|
| 1      | (portada)        | —       |
| 2      | Montalcino Paint | $125.000 |
| 3      | Montalcino Basic | $105.000 |
| 4      | Montalcino Military | $125.000 |
| 5      | Montalcino Eclipse | $110.000 |

Decisiones confirmadas con el cliente:

- Las 4 prendas son **camisas** (categoría única: `Camisas`).
- Tallas: **S, M, L, XL** con stock (cantidades razonables de inventario inicial).
- El contenido anterior (demo) se **reemplaza**; queda solo la colección Casual.

## Datos a escribir (Firestore)

```
collections/casual
  name: "Casual", slug: "casual", order: 1, active: true
  heroImage: portada (pHero del PDF, Cloudinary)
  description: editorial

categories/camisas
  name: "Camisas", slug: "camisas", order: 1

products/{4}
  each: name "Montalcino <X>", slug "montalcino-<x>", price COP, camisas,
        sizes S/M/L/XL, images [foto], featured 2 destacados, active true
```

`url` de CloudImage = autoparamétrica `f_auto,q_auto,w_<ref>` con el cloud real.
IDs públicos de Cloudinary bajo el folder `montalchino`.

## Commands

```
npm run import:casual   → extrae/sube imágenes y puebla Firestore (script tsx)
npm run dev             → ver la tienda en http://localhost:3000
npm run build / lint / test → gates de verificación
```

## Success Criteria

1. Cloudinary tiene 5 assets en `montalchino/` (portada + 4 camisas).
2. Firestore queda con 1 colección, 1 categoría y 4 productos activos (nada demo).
3. `/` muestra la colección Casual, `/colecciones/casual` sus 4 productos y cada
   `/producto/montalcino-<x>` la ficha con la foto del PDF y el precio real.
4. Leer la doc de Next (`node_modules/next/dist/docs/.../images.md`) confirmando que
   `next/image` con remotePatterns de Cloudinary funciona (remotePatterns ya existente).
5. `npm run build`, `npm run lint` y `npm test` verdes.

## Boundaries

- **Always:** imágenes solo vía Cloudinary; precios enteros COP; textos en español;
  no duplicar: si el publicId ya existe en Cloudinary, no re-subir.
- **Ask first:** cambiar el nombre/categoría/tallas de un producto de la colección
  en producción, borrar el PDF fuente.
- **Never:** subir credenciales; guardar URLs que no vengan de Cloudinary; dejar el
  contenido demo conviviendo con el contenido real.

## Open Questions

- Descripciones y cantidades de stock son **sensible**: como el modelo no puede ver
  las fotos, se escriben textos editoriales genéricos (editables desde `/admin`) y
  cantidades iniciales razonables. El cliente las ajusta en el admin cuando quiera.