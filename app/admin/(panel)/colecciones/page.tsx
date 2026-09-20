import Image from "next/image";
import Link from "next/link";
import { CollectionActions } from "@/components/admin/CollectionActions";
import { listCollections } from "@/lib/db/catalog";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const collections = await listCollections(false);
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Colecciones</h1>
          <p className="pt-1 text-sm text-taupe">
            {collections.length}{" "}
            {collections.length === 1 ? "colección" : "colecciones"} publicadas
          </p>
        </div>
        <Link
          href="/admin/colecciones/nueva"
          className="bg-foreground px-5 py-2.5 text-sm uppercase tracking-widest text-background transition-opacity hover:opacity-90"
        >
          Nueva colección
        </Link>
      </div>

      {collections.length === 0 ? (
        <p className="pt-8 text-sm text-taupe">Aún no hay colecciones.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line border border-line bg-surface-soft/30">
          {collections.map((collection) => (
            <li key={collection.id} className="flex items-center gap-5 px-5 py-4">
              <Link
                href={`/admin/colecciones/${collection.id}`}
                className="relative block h-16 w-24 shrink-0 overflow-hidden border border-line bg-surface-soft"
                aria-hidden
              >
                {collection.heroImage.url ? (
                  <Image
                    src={collection.heroImage.url}
                    alt=""
                    width={192}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[8px] text-taupe/50">
                    —
                  </span>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Link
                    href={`/admin/colecciones/${collection.id}`}
                    className="font-medium hover:underline"
                  >
                    {collection.name}
                  </Link>
                  {!collection.active ? (
                    <span className="border border-accent/50 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-accent">
                      Oculta
                    </span>
                  ) : null}
                </div>
                <p className="pt-0.5 text-xs text-taupe">
                  /{collection.slug} · orden {collection.order}
                </p>
              </div>

              <CollectionActions
                id={collection.id}
                active={collection.active}
                name={collection.name}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}