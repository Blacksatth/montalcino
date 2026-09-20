import Link from "next/link";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { createCollectionAction } from "@/app/admin/(panel)/colecciones/actions";

export const dynamic = "force-dynamic";

export default function NewCollectionPage() {
  return (
    <div className="space-y-8">
      <p className="text-sm">
        <Link
          href="/admin/colecciones"
          className="text-taupe underline-offset-2 hover:text-foreground hover:underline"
        >
          ← Colecciones
        </Link>
      </p>
      <div className="border-b border-line pb-6">
        <h1 className="font-serif text-3xl">Nueva colección</h1>
        <p className="pt-1 text-sm text-taupe">
          Define la portada y la información de la edición.
        </p>
      </div>
      <CollectionForm action={createCollectionAction} />
    </div>
  );
}