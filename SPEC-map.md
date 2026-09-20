# Capability Map: Montalchino e-commerce

Tienda online de la marca **Montalchino**: venta por colecciones exclusivas, con panel
admin para cargar productos e imágenes, carrito + pago online y gestión de pedidos.
Despliegue en Vercel. Backend de datos Firebase (Auth + Firestore), imágenes en Cloudinary,
UI en español, moneda COP.

## Modules

| Module id  | Responsibility                                                       | Depends on     |
|------------|----------------------------------------------------------------------|----------------|
| content    | Colecciones, categorías y productos (Firestore), URLs Cloudinary, stock por talla | —              |
| storefront | Home, catálogo con buscador y filtro por categorías, páginas de producto, carrito, animaciones | content        |
| checkout   | Crear pedido, cobrar con MercadoPago Checkout Pro (webhook)          | content        |
| orders     | Pedidos en Firestore, estados y gestión desde el admin               | checkout       |
| auth       | Login del admin con Firebase Auth, rutas protegidas                  | —              |
| admin      | CRUD colecciones/categorías/productos, subir imágenes a Cloudinary, pedidos y configuración de envío | content, auth, orders, settings |

## Build order

```
content → storefront → checkout → orders
auth    → admin
```

`orders` puede construirse en paralelo con `storefront` una vez `content` está firme,
pero el flujo de pago (checkout) es prerrequisito lógico de los estados de pedido.

## Decisions (registradas)

- Venta: carrito + checkout + pago online.
- Pasarela: MercadoPago Checkout Pro (hospedado). Cards, PSE, Nequi, Bancolombia.
- Mercado: Colombia / COP, UI en español.
- Admin: Firebase Auth (email/password), acceso bajo `/admin`.
- Inventario: cantidades por talla/tamaño (variantes), descuento atómico al pagar.
- Envío: tarifa plana configurable desde el admin (`settings/tienda`, `shippingFlatRate`).
- Admin gestiona pedidos (ver pagos, cambiar estado).
- Estética: lujo editorial **dark** (fondos carbón cálidos, serif editorial claro, aire de revista, togglable a claro).
- Interactividad: animaciones y micro-interacciones en el storefront (hover sobre producto,
  transiciones suaves, carga de imágenes elegante).
- Categorías: además de colecciones, cada producto pertenece a una categoría
  (ej. camisas, pantalones, accesorios).
- Buscador: búsqueda por texto que filtra productos (nombre, colección, categoría).