import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionForm } from "@/components/admin/CollectionForm";
import { getCollectionById } from "@/lib/db/catalog";
import { updateCollectionAction } from "@/app/admin/(panel)/colecciones/actions";

export const dynamic = "force-dynamic";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await getCollectionById(id);
  if (!collection) {
    notFound();
  }
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

      <div className="flex items-center gap-5 border-b border-line pb-6">
        <div className="relative hidden h-20 w-28 shrink-0 overflow-hidden border border-line bg-surface-soft sm:block">
          {collection.heroImage.url ? (
            <Image
              src={collection.heroImage.url}
              alt=""
              width={224}
              height={160}
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
            <h1 className="font-serif text-3xl">Editar colección</h1>
            {!collection.active ? (
              <span className="border border-accent/50 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-accent">
                Oculta
              </span>
            ) : null}
          </div>
          <p className="pt-1 text-sm text-taupe">
            {collection.name} · /{collection.slug} · orden {collection.order}
          </p>
        </div>
      </div>

      <CollectionForm
        action={updateCollectionAction.bind(null, collection.id)}
        initial={{
          name: collection.name,
          slug: collection.slug,
          description: collection.description,
          order: collection.order,
          active: collection.active,
          heroPublicId: collection.heroImage.publicId,
          heroUrl: collection.heroImage.url,
        }}
      />
    </div>
  );
}