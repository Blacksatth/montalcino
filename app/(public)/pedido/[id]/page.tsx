import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/db/orders";
import { formatCOP } from "@/lib/money";
import { OrderStatusBadge, isOrderStatus } from "@/components/public/OrderStatusBadge";

export const dynamic = "force-dynamic";

export default async function PedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order || !isOrderStatus(order.status)) {
    notFound();
  }

  const createdAt = new Date(order.createdAt);

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <p className="text-xs uppercase tracking-[0.3em] text-taupe">Tu pedido</p>
      <h1 className="pt-2 font-serif text-4xl">{order.reference}</h1>
      <p className="pt-1 text-sm text-taupe">
        {createdAt.toLocaleDateString("es-CO", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <div className="mt-8 border border-line p-6">
        <OrderStatusBadge status={order.status} />
      </div>

      <h2 className="pt-8 font-serif text-xl">Detalle</h2>
      <ul className="mt-4 divide-y divide-foreground/10">
        {order.items.map((item) => (
          <li key={`${item.productId}-${item.size}`} className="flex gap-4 py-4">
            <div className="flex-1">
              <p className="font-serif">{item.name}</p>
              <p className="pt-1 text-xs uppercase tracking-widest text-taupe">
                Talla {item.size} · Cantidad {item.quantity}
              </p>
            </div>
            <p className="font-serif">{formatCOP(item.unitPrice * item.quantity)}</p>
          </li>
        ))}
      </ul>

      <dl className="mt-6 mb-2 ml-auto max-w-xs space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-taupe">Subtotal</dt>
          <dd>{formatCOP(order.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-taupe">Envío</dt>
          <dd>{formatCOP(order.shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 font-serif text-base">
          <dt>Total</dt>
          <dd>{formatCOP(order.total)}</dd>
        </div>
      </dl>

      <h2 className="pt-8 font-serif text-xl">Comprador</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-6">
          <dt className="text-taupe">Nombre</dt>
          <dd>{order.customer.name}</dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className="text-taupe">Correo</dt>
          <dd>{order.customer.email}</dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className="text-taupe">Teléfono</dt>
          <dd>{order.customer.phone}</dd>
        </div>
        {order.customer.address ? (
          <div className="flex justify-between gap-6">
            <dt className="text-taupe">Dirección</dt>
            <dd className="text-right">{order.customer.address}</dd>
          </div>
        ) : null}
        {order.customer.city ? (
          <div className="flex justify-between gap-6">
            <dt className="text-taupe">Ciudad</dt>
            <dd>{order.customer.city}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}