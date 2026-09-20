import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { listCategories, listCollections } from "@/lib/db/catalog";
import { createProductAction } from "@/app/admin/(panel)/productos/actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [collections, categories] = await Promise.all([
    listCollections(false),
    listCategories(),
  ]);

  const missingCollections = collections.length === 0;
  const missingCategories = categories.length === 0;
  const canCreate = !missingCollections && !missingCategories;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <p className="text-sm">
        <Link
          href="/admin/productos"
          className="text-taupe underline-offset-2 hover:text-foreground hover:underline"
        >
          ← Productos
        </Link>
      </p>

      {/* Header */}
      <div className="border-b border-line pb-6">
        <h1 className="font-serif text-3xl">Nuevo producto</h1>
        <p className="pt-1 text-sm text-taupe">
          Completa la información para agregarlo al catálogo.
        </p>
      </div>

      {/* Aviso si faltan dependencias */}
      {!canCreate && (
        <div className="flex items-start gap-3 rounded-md border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent">
          <span aria-hidden className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-accent" />
          <div className="space-y-1">
            <p>
              {missingCollections && missingCategories
                ? "Primero crea al menos una colección y una categoría."
                : missingCollections
                  ? "Primero crea al menos una colección."
                  : "Primero crea al menos una categoría."}
            </p>
            <p className="flex gap-3 text-xs">
              {missingCollections && (
                <Link href="/admin/colecciones" className="underline underline-offset-2">
                  Crear colección
                </Link>
              )}
              {missingCategories && (
                <Link href="/admin/categorias" className="underline underline-offset-2">
                  Crear categoría
                </Link>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      {canCreate && (
        <div className="pt-2">
          <ProductForm
            action={createProductAction}
            collections={collections.map((c) => ({ id: c.id, name: c.name }))}
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          />
        </div>
      )}
    </div>
  );
}