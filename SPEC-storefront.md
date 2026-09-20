# Spec: storefront — Home y experiencia pública

Vista pública de la tienda. Convenciones compartidas en `SPEC-000-conventions.md`.

## Objective

Mostrar el catálogo con estética **lujo editorial claro** y un componente fuerte de
**interactividad**: buscador, filtro por categorías y categorías/colecciones como
rutas propias, animaciones y micro-interacciones que hagan la exploración agradable.

## Rutas

| Ruta | Contenido |
|---|---|
| `/` | Home: hero editorial, colecciones destacadas (cards), categorías, productos destacados (`featured`) |
| `/colecciones/[slug]` | Detalle de colección con sus productos |
| `/categorias/[slug]` | Productos filtrados por categoría |
| `/producto/[slug]` | Ficha: galería, descripción, selector de talla, precio, cantidad, botón añadir al carrito, stock restante por talla |
| `/buscar?q=…&cat=…` | Resultados de búsqueda con filtro por categoría |
| `/carrito` | Resumen del carrito con cambio de cantidad y total |

## Comportamiento

- Header: logo + navegación (colecciones, categorías, buscar, carrito con contador).
- **Buscador**: campo en el header (y/o home). Debounce ~250ms. Filtra por nombre,
  colección y categoría sobre los productos activos. Muestra resultados en `/buscar`.
- **Categorías**: en el home como grid navegable y como filtro lateral/superior en
  búsqueda y catálogo de colección.
- **Carrito** (`lib/cart.ts`, lógica pura + Context + `localStorage`):
  - añadir producto con talla y cantidad;
  - validar que la cantidad no supere el stock visible de esa talla;
  - agrupar por `productId + size`;
  - persistir en `localStorage`; contador en header.
- **Interactividad/animation** (lujo editorial, siempre sutil):
  - zoom suave en imágenes al hover (`scale` + duración eased);
  - transición de navegación y aparición de grids (fade/lift mínimo, sin dependencias
    de animación externas: CSS/Tailwind);
  - skeleton/blur-up en fotos (`next/image` `placeholder="blur"`);
  - micro-interacciones en botones (active/press), estados vacíos del carrito y de búsqueda.
- Estado vacío, loading y error en cada listado; textos en español.
- Server Components por defecto; las piezas interactivas (buscador, carrito,
  selector de talla) son Client Components.

## Tema

- **Dark por defecto**: fondos carbón cálidos (`#19120f`), texto crema/editorial claro,
  serif para títulos (Google vía `next/font`) + sans limpia para cuerpo; acento terracota.
  Se conserva un toggle claro/oscuro (persiste en `localStorage`); sin preferencia guardada
  el sitio arranca en oscuro. Tokens en `app/globals.css` (`@theme`).

## Success Criteria

1. Desde la home se llega a colecciones, categorías, productos y resultados de búsqueda.
2. Buscar y filtrar por categoría devuelve productos correctos (y estados vacíos claros).
3. Añadir al carrito exige talla; nunca admite más stock del visible.
4. El carrito persiste tras recargar, y su contador refleja el total.
5. Verificación visual (browser-automation): animaciones presentes, sin errores de
   consola, imágenes cargando con fade/blur-up.

## Boundaries

- **Always:** no consumir más datos de los activos; precios en COP; `next/image` para
  fotos; estado de carga/error/vacío en toda vista que consulta datos.
- **Ask first:** añadir librería de animaciones o de estado; filtrar o paginar en
  servidor; cambiar rutas públicas.
- **Never:** acceder desde el cliente a datos no públicos (`/admin`); hardcodear precios.