# Spec: checkout — Pedido y cobro con MercadoPago

Convierte el carrito en un pedido pagado. Convenciones compartidas en `SPEC-000-conventions.md`.

## Objective

Flujo completo: el cliente desde el carrito entra en **Checkout Pro de MercadoPago**
(hospedado), paga (cards/PSE/Nequi/Bancolombia), y la app registra el pedido y **descuenta
el stock (por talla) solo cuando el pago está confirmado**. Envío: tarifa plana desde
`settings/tienda` (ver `SPEC-content.md`; fallback dev en `lib/settings.ts`).

## Flujo

```
1. POST /api/orders (con ítems del carrito + datos del cliente)
   → server valida contra Firestore (producto activo, talla con stock, precios vigentes)
   → crea order { status: "pending" } con subtotal, envío (settings.flatRate), total
   → crea preferencia en MP (external_reference = orderId, back_urls = /pedido/[id])
   → devuelve { url: init_point }          (NO descuenta stock aún)

2. Cliente redirige a init_point → paga en MP → vuelve a /pedido/[id]

3. MP notifica la preferencia vía webhook → POST /api/webhooks/mercadopago
   → valida firma/secret y consulta el pago (IPN, GET payment)
   → si "approved":
       - transacción Firestore: order.status = "paid", guarda mpPaymentId,
         descuenta sizes[].quantity por ítem, marca producto active=false si quedó en 0
       - rechazo si la orden ya está pagada (idempotencia: no doble descuento)

4. /pedido/[id] (lectura pública del pedido por reference) muestra estado:
   pendiente / pagado / enviado / entregado
```

## Modelo (Firestore)

```ts
// orders/{id}
interface Order {
  reference: string;            // legible, ej. MNT-0001
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  items: Array<{                // snapshot del momento de compra (precios congelados)
    productId: string;
    name: string;
    size: string;
    quantity: number;
    unitPrice: number;          // COP
  }>;
  subtotal: number;             // COP
  shipping: number;             // COP, tarifa plana
  total: number;                // COP
  customer: { name: string; phone: string; email: string; city?: string; address?: string; notes?: string; };
  payment: { mpPaymentId?: string; mpStatus?: string; paidAt?: number };
  createdAt: number;
  updatedAt: number;
}
```

## Referencias técnicas

- Route handler + IPN: leer `node_modules/next/dist/docs/01-app/…/route-handlers.md` y
  `webhooks` en la doc de MercadoPago (integrar con `lib/mercadopago.ts`, server-only).
- `external_reference` = `orderId`; verificar que `paid_at`/estado vengan del API de MP,
  nunca del body del webhook decidido a ciegas.
- URLs públicas del sitio en `NEXT_PUBLIC_APP_URL` (para back_urls).

## Success Criteria

1. Crear un pedido con ítems reales y pagarlo en sandbox de MP deja `status="paid"`,
   stock descontado por talla y `mpPaymentId` guardado.
2. Doble notificación del mismo pago no descuenta stock dos veces (idempotente).
3. Pedido con stock insuficiente o precio desactualizado se rechaza antes de crear la
   preferencia.
4. `npm run build` pasa; webhook verificado contra el API real de MP en sandbox.

## Boundaries

- **Always:** validar ítems en el servidor (nunca confiar solo en el carrito cliente);
  descuento de stock en transacción; idempotencia; no almacenar datos de tarjeta.
- **Ask first:** incómodo pero real: cambiar a Checkout Bricks o payments API, cobrar
  envío variable, aplicar cupones/descuentos.
- **Never:** marcar pagado sin confirmación del API de MP; permitir pedidos por debajo
  de un producto activo con stock real.