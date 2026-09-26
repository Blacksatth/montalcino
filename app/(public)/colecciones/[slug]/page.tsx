import { notFound } from "next/navigation";
import { EmptyState } from "@/components/public/EmptyState";
import { ProductGrid } from "@/components/public/ProductGrid";
import { CollectionHeroClient } from "@/components/public/CollectionHeroClient";
import { getCollectionBySlug, listProducts } from "@/lib/db/catalog";

export const dynamic = "force-dynamic";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection || !collection.active) {
    notFound();
  }
  const products = (await listProducts()).filter(
    (product) => product.collectionId === collection.id,
  );

  return (
    <div>
      <CollectionHeroClient collection={collection} />
      <section className="mx-auto max-w-6xl px-6 py-14 md:py-16">
        {products.length === 0 ? (
          <EmptyState title="Esta colección se está preparando" />
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
    </div>
  );
}