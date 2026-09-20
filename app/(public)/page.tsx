import Image from "next/image";
import Link from "next/link";
import { CollectionCard } from "@/components/public/CollectionCard";
import { EmptyState } from "@/components/public/EmptyState";
import { ProductGrid } from "@/components/public/ProductGrid";
import { SectionHeading } from "@/components/public/SectionHeading";
import { listCategories, listCollections, listProducts } from "@/lib/db/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [collections, categories, products] = await Promise.all([
    listCollections(),
    listCategories(),
    listProducts(),
  ]);

  const featured = products.filter((product) => product.featured).slice(0, 8);
  const heroCollection = collections[0];

  return (
    <div>
      {/* Hero: full-bleed collection cover */}
      {heroCollection?.heroImage ? (
        <section className="relative flex h-[85vh] min-h-[560px] items-end justify-center overflow-hidden">
          <Image
            src={heroCollection.heroImage.url}
            alt={heroCollection.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          <div className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-48 text-center md:pb-32">
            <p className="text-[11px] uppercase tracking-[0.4em] text-cream/60">
              Colección
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-[1.1] text-cream md:text-7xl">
              Piezas que cuentan
              <br />
              <em className="italic">una historia</em>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-cream/70">
              Cada colección de Montalchino es una edición pensada y confeccionada
              para durar.
            </p>
            <Link
              href={`/colecciones/${heroCollection.slug}`}
              className="mt-8 inline-block border border-cream/30 bg-cream/10 px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-cream backdrop-blur-sm transition-all duration-300 hover:border-cream/60 hover:bg-cream/20"
            >
              Explorar la colección
            </Link>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-3xl px-6 pb-20 pt-32 text-center">
          <p className="text-[11px] uppercase tracking-[0.4em] text-taupe">
            Colecciones exclusivas
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-tight md:text-6xl">
            Piezas que cuentan una historia
          </h1>
        </section>
      )}

      {/* Collections */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <SectionHeading eyebrow="Colecciones" title="Explora por colección" />
        {collections.length === 0 ? (
          <EmptyState title="Las colecciones están por llegar" />
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="border-y border-line">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
            <SectionHeading eyebrow="Explorar" title="Navega por categoría" />
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categorias/${category.slug}`}
                  className="group relative border border-line px-8 py-3 text-[11px] uppercase tracking-[0.3em] transition-all duration-300 hover:border-foreground/50 hover:bg-foreground/[0.03]"
                >
                  <span className="relative z-10">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <SectionHeading eyebrow="Novedades" title="Destacados de la temporada" />
        <ProductGrid products={featured} />
      </section>
    </div>
  );
}