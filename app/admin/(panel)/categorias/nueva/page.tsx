import Link from "next/link";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { createCategoryAction } from "@/app/admin/(panel)/categorias/actions";

export const dynamic = "force-dynamic";

export default function NewCategoryPage() {
  return (
    <div className="space-y-8">
      <p className="text-sm">
        <Link
          href="/admin/categorias"
          className="text-taupe underline-offset-2 hover:text-foreground hover:underline"
        >
          ← Categorías
        </Link>
      </p>
      <div className="border-b border-line pb-6">
        <h1 className="font-serif text-3xl">Nueva categoría</h1>
        <p className="pt-1 text-sm text-taupe">
          Organiza tus productos dentro de un grupo concreto.
        </p>
      </div>
      <CategoryForm action={createCategoryAction} />
    </div>
  );
}