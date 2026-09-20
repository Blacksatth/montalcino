import { ORDER_STATUSES, type OrderStatus } from "@/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  const active = status === "pending" || status === "paid" || status === "shipped";
  return (
    <span
      className={`inline-block px-2.5 py-1 text-[10px] uppercase tracking-widest ${
        active
          ? "border border-accent/30 text-accent"
          : "border border-line text-taupe"
      } ${status === "cancelled" ? "line-through" : ""}`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export const ORDER_STATUSES_META = ORDER_STATUSES;