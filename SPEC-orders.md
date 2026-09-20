# Spec: orders — Pedidos en el admin

Gestión de pedidos desde el panel. Convenciones compartidas en `SPEC-000-conventions.md`.

## Objective

Que el equipo de Montalchino vea los pedidos (especialmente los **pagados**), consulte
detalle de ítems/cliente/pago y avance su **estado** hasta entrega.

## Rutas (protegidas por `auth`)

| Ruta | Contenido |
|---|---|
| `/admin/pedidos` | Lista con filtro por estado, ordenada por fecha desc; badges de estado; búsqueda por reference/cliente |
| `/admin/pedidos/[id]` | Detalle: ítems + tallas + precios, datos del cliente, pago (mpPaymentId), historia de estado |

## Estados y transiciones

```
pending ──→ paid ──→ shipped ──→ delivered
   │          │
   └──────────┴──→ cancelled        (con motivo; no se re-marca el stock,
                                        se compensa en el webhook si aplica)
```

- `paid` lo escribe el webhook (`checkout`). El admin puede:
  - `paid → shipped` cuando despacha (opcional: nota de guía/transportadora),
  - `shipped → delivered`,
  - `pending|cancelled` — cancelar un pendiente (no pagado) o marcar cancelado.
- El cambio de estado se hace mediante **PATCH `/api/orders/[id]/status`** validado en
  servidor (auth admin + transición válida). No se re-descuenta/torna stock automáticamente
  salvo los casos definidos en `checkout`.

## Success Criteria

1. El admin ve los pedidos pagados con sus ítems, cliente y pago, y puede filtrar por estado.
2. Cambiar `paid → shipped` y `shipped → delivered` funciona y persiste en Firestore.
3. Acciones inválidas (p. ej. `pending → delivered`) se rechazan en el servidor.
4. El storefront (página pública de pedido) refleja el nuevo estado.

## Boundaries

- **Always:** validar auth admin y transiciones en el servidor; guardar `updatedAt`.
- **Ask first:** reembolsos automáticos vía API de MP, editar pedido, notificaciones
  por email al cliente.
- **Never:** exponer `/api/orders/[id]/status` sin autenticación; borrar pedidos.