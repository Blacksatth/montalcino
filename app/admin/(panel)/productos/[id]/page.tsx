import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProductById, listCategories, listCollections } from "@/lib/db/catalog";
import { updateProductAction } from "@/app/admin/(panel)/productos/actions";
import { formatCOP } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, collections, categories] = await Promise.all([
    getProductById(id),
    listCollections(false),
    listCategories(),
  ]);
  if (!product) {
    notFound();
  }
  const collection = collections.find((c) => c.id === product.collectionId);
  const category = categories.find((c) => c.id === product.categoryId);
  const firstImage = product.images[0];
  const totalStock = product.sizes.reduce((sum, variant) => sum + variant.quantity, 0);

  return (
    <div className="space-y-8">
      <p className="text-sm">
        <Link href="/admin/productos" className="text-taupe underline-offset-2 hover:text-foreground hover:underline">
          ← Productos
        </Link>
      </p>

      <div className="flex items-center gap-5 border-b border-line pb-6">
        <div className="relative hidden h-24 w-18 shrink-0 overflow-hidden border border-line bg-surface-soft sm:block" style={{ aspectRatio: "3 / 4" }}>
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
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="font-serif text-3xl">Editar producto</h1>
            {!product.active ? (
              <span className="border border-accent/50 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-accent">
                Oculto
              </span>
            ) : null}
            {product.featured ? (
              <span className="border border-line px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-taupe">
                Destacado
              </span>
            ) : null}
          </div>
          <p className="pt-1 text-sm text-taupe">
            {product.name} · /{product.slug} · {formatCOP(product.price)} ·{" "}
            {totalStock} {totalStock === 1 ? "unidad" : "unidades"}
          </p>
          <p className="pt-0.5 text-xs text-taupe">
            {collection ? `Colección: ${collection.name}` : "Sin colección"}
            {category ? ` · Categoría: ${category.name}` : ""}
          </p>
        </div>
      </div>

      <ProductForm
        action={updateProductAction.bind(null, product.id)}
        collections={collections.map((c) => ({ id: c.id, name: c.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        initial={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          collectionId: product.collectionId,
          categoryId: product.categoryId,
          sizes: product.sizes,
          images: product.images,
          featured: product.featured,
          active: product.active,
        }}
      />
    </div>
  );
}