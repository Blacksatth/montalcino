import { ORDER_STATUSES, type OrderStatus } from "@/types";

const STATUS_META: Record<OrderStatus, { label: string; description: string }> = {
  pending:
  {
    label: "Pendiente",
    description: "Estamos esperando la confirmación del pago.",
  },
  paid:
  {
    label: "Pagado",
    description: "Recibimos tu pago; estamos preparando tu pedido.",
  },
  shipped:
  {
    label: "Enviado",
    description: "Tu pedido está en camino.",
  },
  delivered:
  {
    label: "Entregado",
    description: "Tu pedido fue entregado.",
  },
  cancelled:
  {
    label: "Cancelado",
    description: "Este pedido fue cancelado.",
  },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <div>
      <span className="inline-block border border-foreground/20 px-3 py-1 text-xs uppercase tracking-widest">
        {meta.label}
      </span>
      <p className="mt-2 text-sm text-taupe">{meta.description}</p>
    </div>
  );
}

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as string[]).includes(value);
}