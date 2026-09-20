import { EmptyState } from "@/components/public/EmptyState";
import { ProductCard } from "@/components/public/ProductCard";
import type { Product } from "@/types";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <EmptyState title="Aún no hay productos" hint="Vuelve pronto, estamos preparando sorpresas." />;
  }
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}