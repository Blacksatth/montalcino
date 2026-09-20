import Link from "next/link";
import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/public/AddToCart";
import { ProductGrid } from "@/components/public/ProductGrid";
import { ProductGallery } from "@/components/public/ProductGallery";
import { SectionHeading } from "@/components/public/SectionHeading";
import {
  listCategories,
  listCollections,
  listProducts,
  getProductBySlug,
} from "@/lib/db/catalog";
import { formatCOP } from "@/lib/money";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Product = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
type Collection = Awaited<ReturnType<typeof listCollections>>[number];
type Category = Awaited<ReturnType<typeof listCategories>>[number];

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";

const getProduct = cache(getProductBySlug);

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || !product.active) {
    return {
      title: "Producto no encontrado | Montalchino",
      robots: { index: false, follow: false },
    };
  }

  const description = product.description?.slice(0, 160) ?? "";
  const image = product.images[0]?.url;
  const canonical = `/producto/${product.slug}`;

  return {
    title: `${product.name} | Montalchino`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${product.name} — Montalchino`,
      description,
      url: canonical,
      images: image ? [{ url: image, alt: product.name }] : [],
      type: "website",
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${product.name} — Montalchino`,
      description,
      images: image ? [image] : [],
    },
  };
}

// ---------------------------------------------------------------------------
// Structured data (JSON-LD)
// ---------------------------------------------------------------------------

function buildProductJsonLd(
  product: Product,
  collection: Collection | undefined,
  totalStock: number,
  categoryName: string | undefined,
) {
  const url = `${SITE_URL}/producto/${product.slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.images.map((image) => image.url),
        url,
        sku: product.slug,
        brand: { "@type": "Brand", name: "Montalchino" },
        category: categoryName,
        offers: {
          "@type": "Offer",
          url,
          priceCurrency: "COP",
          price: String(product.price),
          availability:
            totalStock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@type": "Organization", name: "Montalchino" },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL || "/" },
          ...(collection
            ? [
                {
                  "@type": "ListItem" as const,
                  position: 2,
                  name: collection.name,
                  item: `${SITE_URL}/colecciones/${collection.slug}`,
                },
              ]
            : []),
          {
            "@type": "ListItem",
            position: collection ? 3 : 2,
            name: product.name,
            item: url,
          },
        ],
      },
    ],
  };
}

/**
 * Serializes JSON-LD safely for injection into a <script> tag.
 * Escapes `</` sequences to prevent premature script-tag termination
 * (a known XSS vector when embedding user-influenced JSON in HTML).
 */
function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

// ---------------------------------------------------------------------------
// Related products
// ---------------------------------------------------------------------------

function getRelatedProducts(
  products: Product[],
  current: Product,
  limit = 4,
): Product[] {
  return products
    .filter((item) => item.id !== current.id && item.active)
    .map((item) => ({
      item,
      score:
        (item.collectionId === current.collectionId ? 1 : 0) +
        (item.categoryId === current.categoryId ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .slice(0, limit)
    .map(({ item }) => item);
}

// ---------------------------------------------------------------------------
// Small presentational pieces
// ---------------------------------------------------------------------------

function IconShipping() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function IconSecurePayment() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function IconExchange() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 009 9 9.75 9.75 0 006.74-2.74L21 16" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 00-9-9 9.75 9.75 0 00-6.74 2.74L3 8" />
    </svg>
  );
}

const TRUST_ITEMS: ReadonlyArray<{ label: string; Icon: () => React.JSX.Element }> = [
  { label: "Envío a todo el país", Icon: IconShipping },
  { label: "Pago seguro", Icon: IconSecurePayment },
  { label: "Cambios por tallaje", Icon: IconExchange },
];

function StockBadge({ inStock }: { inStock: boolean }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
        inStock ? "border-foreground/15 text-foreground/60" : "border-accent/25 text-accent"
      }`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${inStock ? "bg-foreground/60" : "bg-accent"}`}
      />
      {inStock ? "Disponible" : "Agotado"}
    </span>
  );
}

function Breadcrumbs({
  collection,
  productName,
}: {
  collection: Collection | undefined;
  productName: string;
}) {
  return (
    <nav
      aria-label="Migas de pan"
      className="mb-8 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-taupe/50"
    >
      <Link href="/" className="transition-colors hover:text-foreground">
        Inicio
      </Link>
      <span aria-hidden="true" className="text-foreground/20">
        /
      </span>
      {collection ? (
        <>
          <Link
            href={`/colecciones/${collection.slug}`}
            className="transition-colors hover:text-foreground"
          >
            {collection.name}
          </Link>
          <span aria-hidden="true" className="text-foreground/20">
            /
          </span>
        </>
      ) : null}
      <span aria-current="page" className="text-foreground/70">
        {productName}
      </span>
    </nav>
  );
}

function ProductDetails({
  product,
  collection,
  category,
  inStock,
}: {
  product: Product;
  collection: Collection | undefined;
  category: Category | undefined;
  inStock: boolean;
}) {
  return (
    <dl className="divide-y divide-line border border-line text-[11px] uppercase tracking-[0.2em]">
      <div className="flex items-center justify-between gap-6 px-6 py-3.5">
        <dt className="text-taupe/50">Colección</dt>
        <dd className="text-right text-foreground/80">
          {collection ? (
            <Link
              href={`/colecciones/${collection.slug}`}
              className="transition-colors hover:text-foreground"
            >
              {collection.name}
            </Link>
          ) : (
            "Montalchino"
          )}
        </dd>
      </div>
      {category ? (
        <div className="flex items-center justify-between gap-6 px-6 py-3.5">
          <dt className="text-taupe/50">Categoría</dt>
          <dd className="text-right text-foreground/80">
            <Link
              href={`/categorias/${category.slug}`}
              className="transition-colors hover:text-foreground"
            >
              {category.name}
            </Link>
          </dd>
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-6 px-6 py-3.5">
        <dt className="text-taupe/50">Referencia</dt>
        <dd className="text-right tabular-nums text-foreground/80">{product.slug}</dd>
      </div>
      <div className="flex items-center justify-between gap-6 px-6 py-3.5">
        <dt className="text-taupe/50">Disponibilidad</dt>
        <dd className={`text-right ${inStock ? "text-foreground/80" : "text-accent"}`}>
          {inStock ? "Disponible" : "Agotado"}
        </dd>
      </div>
    </dl>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || !product.active) {
    notFound();
  }

  const [collections, categories, products] = await Promise.all([
    listCollections(),
    listCategories(),
    listProducts(),
  ]);

  const collection = collections.find((item) => item.id === product.collectionId);
  const category = categories.find((item) => item.id === product.categoryId);
  const totalStock = product.sizes?.reduce((sum, variant) => sum + variant.quantity, 0) ?? 0;
  const inStock = totalStock > 0;

  const related = getRelatedProducts(products, product);
  const schema = buildProductJsonLd(product, collection, totalStock, category?.name);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- required for JSON-LD; content is sanitized above
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
      />

      <Breadcrumbs collection={collection} productName={product.name} />

      <div className="border border-line">
        <div className="grid md:grid-cols-2">
          <div className="border-b border-line p-5 md:border-b-0 md:border-r md:p-8 lg:p-10">
            {product.images.length > 0 ? (
              <ProductGallery images={product.images} name={product.name} />
            ) : (
              <div className="flex aspect-square items-center justify-center border border-dashed border-line text-[10px] uppercase tracking-[0.3em] text-taupe/40">
                Sin imagen disponible
              </div>
            )}
          </div>

          <div className="p-5 md:p-8 lg:p-10">
            <p className="text-[10px] uppercase tracking-[0.35em] text-taupe/50">
              {collection?.name ?? "Montalchino"}
            </p>
            <h1 className="mt-2.5 font-serif text-4xl leading-tight md:text-5xl">
              {product.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <p className="text-2xl tabular-nums tracking-tight text-foreground">
                {formatCOP(product.price)}
              </p>
              <StockBadge inStock={inStock} />
            </div>

            <div className="my-7 h-px bg-line" />

            {product.description ? (
              <p className="mb-7 text-sm leading-relaxed text-foreground/70">
                {product.description}
              </p>
            ) : null}

            <AddToCart product={product} />

            <div className="my-7 h-px bg-line" />

            <ProductDetails
              product={product}
              collection={collection}
              category={category}
              inStock={inStock}
            />
          </div>
        </div>

        <ul className="grid grid-cols-1 divide-y divide-line border-t border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {TRUST_ITEMS.map(({ label, Icon }) => (
            <li
              key={label}
              className="flex items-center gap-4 px-5 py-5 text-taupe/70 md:px-8"
            >
              <span className="shrink-0 text-foreground/40">
                <Icon />
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em]">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-line pt-14 md:mt-24 md:pt-16">
          <SectionHeading eyebrow="Sugerencias" title="También te puede interesar" />
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}