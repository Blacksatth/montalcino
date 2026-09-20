import Image from "next/image";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/public/EmptyState";
import { ProductGrid } from "@/components/public/ProductGrid";
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
      <section className="relative">
        <div className="relative h-80 w-full overflow-hidden md:h-[28rem]">
          <Image
            src={collection.heroImage.url}
            alt={collection.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-6 pb-10 md:pb-14">
            <p className="text-[10px] uppercase tracking-[0.4em] text-cream/40">Colección</p>
            <h1 className="mt-2 font-serif text-4xl text-cream md:text-5xl">
              {collection.name}
            </h1>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-14 md:py-16">
        <p className="mx-auto max-w-2xl pb-10 text-center text-sm leading-relaxed text-foreground/60">{collection.description}</p>
        {products.length === 0 ? (
          <EmptyState title="Esta colección se está preparando" />
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
    </div>
  );
}