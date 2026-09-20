import Link from "next/link";
import { listCategories, listCollections, listProducts } from "@/lib/db/catalog";
import { listOrders } from "@/lib/db/orders";
import { getSettings } from "@/lib/settings";
import { formatCOP } from "@/lib/money";
import { OrderStatusPill } from "@/components/admin/OrderStatusPill";
import type { Product } from "@/types";

async function getMetrics() {
  const [products, collections, categories, settings, orders] = await Promise.all([
    listProducts(false),
    listCollections(false),
    listCategories(),
    getSettings(),
    listOrders(),
  ]);
  const totalStock = products.reduce(
    (sum, product) => sum + product.sizes.reduce((acc, s) => acc + s.quantity, 0),
    0,
  );
  const activeProducts = products.filter((p) => p.active).length;
  const featuredProducts = products.filter((p) => p.featured).length;
  const revenue = orders
    .filter((order) => order.status === "paid" || order.status === "shipped" || order.status === "delivered")
    .reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  return {
    products,
    collections,
    categories,
    settings,
    orders,
    totalStock,
    activeProducts,
    featuredProducts,
    revenue,
    pendingOrders,
  };
}

function StockBar({ product }: { product: Product }) {
  const total = product.sizes.reduce((sum, s) => sum + s.quantity, 0);
  const target = Math.max(10, total);
  const width = Math.min(100, Math.round((total / target) * 100));
  const status =
    total === 0 ? "agotado" : total <= 3 ? "bajo" : "saludable";
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={total}
        aria-label={`Stock de ${product.name}: ${total}`}
        className="h-1 flex-1 bg-foreground/10"
      >
        <div
          className={`h-full ${status === "agotado" ? "bg-accent" : status === "bajo" ? "bg-accent/60" : "bg-taupe"}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span
        className={`w-14 shrink-0 text-right text-xs font-mono ${
          status === "agotado" ? "text-accent" : "text-taupe"
        }`}
      >
        {total}
      </span>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
}) {
  const content = (
    <>
      <p className="font-serif text-3xl leading-none group-hover:text-accent">{value}</p>
      <p className="pt-3 text-xs uppercase tracking-widest text-taupe">{label}</p>
      {hint ? <p className="pt-1 text-xs text-taupe">{hint}</p> : null}
    </>
  );
  const classes =
    "group border border-line bg-surface-soft p-5 transition-colors hover:border-accent/60";
  return href ? (
    <Link href={href} className={classes}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}

export default async function AdminDashboardPage() {
  const m = await getMetrics();

  const critical = m.products
    .filter((p) => {
      const total = p.sizes.reduce((sum, s) => sum + s.quantity, 0);
      return total <= 3;
    })
    .sort((a, b) => {
      const stockA = a.sizes.reduce((sum, s) => sum + s.quantity, 0);
      const stockB = b.sizes.reduce((sum, s) => sum + s.quantity, 0);
      return stockA - stockB;
    });

  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-taupe">{today}</p>
          <h1 className="pt-1 font-serif text-3xl">Resumen de la tienda</h1>
        </div>
        <p className="text-sm text-taupe">
          Envío flat: {formatCOP(m.settings.shippingFlatRate)}{" "}
          <Link href="/admin/settings" className="underline underline-offset-4 hover:text-foreground">
            ajustar
          </Link>
        </p>
      </div>

      <section aria-labelledby="catalogo-heading">
        <h2 id="catalogo-heading" className="text-xs uppercase tracking-[0.25em] text-taupe">
          Catálogo
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <MetricCard label="Productos" value={String(m.products.length)} href="/admin/productos" />
          <MetricCard label="Activos" value={String(m.activeProducts)} href="/admin/productos" />
          <MetricCard label="Destacados" value={String(m.featuredProducts)} href="/admin/productos" />
          <MetricCard label="Unidades en stock" value={String(m.totalStock)} href="/admin/productos" />
          <MetricCard label="Colecciones" value={String(m.collections.length)} href="/admin/colecciones" />
          <MetricCard label="Categorías" value={String(m.categories.length)} href="/admin/categorias" />
        </div>
      </section>

      <section aria-labelledby="ventas-heading">
        <h2 id="ventas-heading" className="text-xs uppercase tracking-[0.25em] text-taupe">
          Ventas
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <MetricCard label="Pedidos" value={String(m.orders.length)} />
          <MetricCard
            label="Ingresos confirmados"
            value={formatCOP(m.revenue)}
            hint="Pagados, enviados y entregados"
          />
          <MetricCard label="Por atender" value={String(m.pendingOrders)} hint="Esperando pago" />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-5">
        <section
          aria-labelledby="inventario-heading"
          className="border border-line bg-surface-soft/60 p-6 lg:col-span-2"
        >
          <h2 id="inventario-heading" className="font-serif text-xl">
            Inventario crítico
          </h2>
          {critical.length === 0 ? (
            <p className="pt-3 text-sm text-taupe">Todo el catálogo tiene buen stock.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {critical.map((product) => (
                <li key={product.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <Link
                      href={`/admin/productos/${product.id}`}
                      className="text-sm hover:underline"
                    >
                      {product.name}
                    </Link>
                    {product.active ? null : (
                      <span className="text-[10px] uppercase tracking-widest text-taupe">
                        oculto
                      </span>
                    )}
                  </div>
                  <div className="pt-2">
                    <StockBar product={product} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          aria-labelledby="pedidos-heading"
          className="border border-line bg-surface-soft/60 p-6 lg:col-span-3"
        >
          <div className="flex items-center justify-between">
            <h2 id="pedidos-heading" className="font-serif text-xl">
              Últimos pedidos
            </h2>
            <span className="text-xs uppercase tracking-widest text-taupe">
              {m.orders.length} total
            </span>
          </div>
          {m.orders.length === 0 ? (
            <p className="pt-3 text-sm text-taupe">Aún no hay pedidos.</p>
          ) : (
            <ul className="mt-4 divide-y divide-foreground/10">
              {m.orders.slice(0, 6).map((order) => (
                <li key={order.id} className="flex items-center gap-4 py-3 text-sm">
                  <Link
                    href={`/pedido/${order.id}`}
                    className="w-32 shrink-0 font-serif hover:underline"
                  >
                    {order.reference}
                  </Link>
                  <span className="min-w-0 flex-1 truncate text-taupe">
                    {order.customer.name}
                  </span>
                  <span className="hidden sm:block">{formatCOP(order.total)}</span>
                  <OrderStatusPill status={order.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}