import Link from "next/link";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";
import { listCategories } from "@/lib/db/catalog";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await listCategories();
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Categorías</h1>
        <Link
          href="/admin/categorias/nueva"
          className="bg-foreground px-5 py-2.5 text-sm uppercase tracking-widest text-background transition-opacity hover:opacity-90"
        >
          Nueva categoría
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="pt-8 text-sm text-taupe">Aún no hay categorías.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line border border-line bg-surface-soft/30">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <Link
                  href={`/admin/categorias/${category.id}`}
                  className="font-medium hover:underline"
                >
                  {category.name}
                </Link>
                <p className="pt-0.5 text-xs text-taupe">/{category.slug} · orden {category.order}</p>
              </div>
              <DeleteCategoryButton id={category.id} label={category.name} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
