import Image from "next/image";
import Link from "next/link";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import { listCategories, listCollections, listProducts } from "@/lib/db/catalog";
import { formatCOP } from "@/lib/money";

export const dynamic = "force-dynamic";

function StockBadge({ total }: { total: number }) {
  if (total === 0) {
    return (
      <span className="text-[10px] uppercase tracking-widest text-accent">Agotado</span>
    );
  }
  return (
    <span className="text-[10px] uppercase tracking-widest text-taupe">
      {total} {total === 1 ? "unidad" : "unidades"}
    </span>
  );
}

export default async function AdminProductsPage() {
  const [products, collections, categories] = await Promise.all([
    listProducts(false),
    listCollections(false),
    listCategories(),
  ]);
  const collectionName = (id: string) =>
    collections.find((c) => c.id === id)?.name ?? "—";
  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "—";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Productos</h1>
          <p className="pt-1 text-sm text-taupe">
            {products.length} {products.length === 1 ? "producto" : "productos"} en el catálogo
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="bg-foreground px-5 py-2.5 text-sm uppercase tracking-widest text-background transition-opacity hover:opacity-90"
        >
          Nuevo producto
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="pt-8 text-sm text-taupe">Aún no hay productos.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line border border-line bg-surface-soft/30">
          {products.map((product) => {
            const firstImage = product.images[0];
            const totalStock = product.sizes.reduce(
              (sum, variant) => sum + variant.quantity,
              0,
            );
            return (
              <li key={product.id} className="flex items-center gap-5 px-5 py-4">
                <Link
                  href={`/admin/productos/${product.id}`}
                  className="relative block h-16 w-12 shrink-0 overflow-hidden border border-line bg-surface-soft"
                  aria-hidden
                >
                  {firstImage ? (
                    <Image
                      src={firstImage.url}
                      alt=""
                      width={96}
                      height={128}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[8px] text-taupe/50">
                      —
                    </span>
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Link
                      href={`/admin/productos/${product.id}`}
                      className="font-medium hover:underline"
                    >
                      {product.name}
                    </Link>
                    {product.featured ? (
                      <span className="border border-line px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-taupe">
                        Destacado
                      </span>
                    ) : null}
                    {!product.active ? (
                      <span className="border border-accent/50 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-accent">
                        Oculto
                      </span>
                    ) : null}
                  </div>
                  <p className="pt-0.5 text-xs text-taupe">
                    {formatCOP(product.price)} · {collectionName(product.collectionId)} ·{" "}
                    {categoryName(product.categoryId)}
                  </p>
                </div>

                <div className="hidden w-24 shrink-0 text-right sm:block">
                  <StockBadge total={totalStock} />
                </div>

                <ProductRowActions id={product.id} name={product.name} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}