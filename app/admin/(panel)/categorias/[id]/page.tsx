import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { getCategoryById } from "@/lib/db/catalog";
import { updateCategoryAction } from "@/app/admin/(panel)/categorias/actions";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) {
    notFound();
  }
  return (
    <div className="space-y-8">
      <p className="text-sm">
        <Link href="/admin/categorias" className="text-taupe underline-offset-2 hover:text-foreground hover:underline">
          ← Categorías
        </Link>
      </p>
      <div className="border-b border-line pb-6">
        <h1 className="font-serif text-3xl">Editar categoría</h1>
        <p className="pt-1 text-sm text-taupe">
          {category.name} · /{category.slug}
        </p>
      </div>
      <CategoryForm
        action={updateCategoryAction.bind(null, category.id)}
        initial={{ name: category.name, slug: category.slug, order: category.order }}
      />
    </div>
  );
}
