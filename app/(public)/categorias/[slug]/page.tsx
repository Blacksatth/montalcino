import { notFound } from "next/navigation";
import { EmptyState } from "@/components/public/EmptyState";
import { ProductGrid } from "@/components/public/ProductGrid";
import { listCategories, listProducts } from "@/lib/db/catalog";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await listCategories();
  const category = categories.find((item) => item.slug === slug);
  if (!category) {
    notFound();
  }
  const products = (await listProducts()).filter(
    (product) => product.categoryId === category.id,
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-14 md:py-16">
      <div className="pb-10 text-center">
        <p className="text-[10px] uppercase tracking-[0.35em] text-taupe/50">Categoría</p>
        <h1 className="mt-2 font-serif text-4xl">{category.name}</h1>
      </div>
      {products.length === 0 ? (
        <EmptyState title={`Sin piezas de ${category.name} por ahora`} />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}