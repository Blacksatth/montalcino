"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import type { Collection } from "@/types";

const CollectionHero3D = dynamic(
  () => import("./CollectionHero3D").then((mod) => mod.CollectionHero3DWrapper),
  { ssr: false }
);

function CollectionHeroFallback({ collection }: { collection: Collection }) {
  return (
    <div className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${collection.heroImage.url})` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-6 pb-10 md:pb-14 flex flex-col items-center text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-cream/40">Colección</p>
        <h1 className="mt-2 font-serif text-4xl text-cream md:text-5xl lg:text-6xl">
          {collection.name}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-cream/60">
          {collection.description}
        </p>
      </div>
    </div>
  );
}

export function CollectionHeroClient({ collection }: { collection: Collection }) {
  return (
    <Suspense fallback={<CollectionHeroFallback collection={collection} />}>
      <CollectionHero3D collection={collection} />
    </Suspense>
  );
}