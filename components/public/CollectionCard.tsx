import Image from "next/image";
import Link from "next/link";
import type { Collection } from "@/types";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/colecciones/${collection.slug}`}
      className="group relative block overflow-hidden border border-line bg-foreground/[0.03] outline-none ring-foreground/30 ring-offset-2 ring-offset-background transition-shadow duration-500 focus-visible:ring-2"
    >
      <div className="relative aspect-[4/5]">
        <Image
          src={collection.heroImage.url}
          alt={collection.name}
          width={800}
          height={1000}
          sizes="(min-width: 1024px) 33vw, 50vw"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent transition-all duration-500 group-hover:from-black/85" />

        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
          <p className="text-[10px] uppercase tracking-[0.35em] text-cream/40">
            Colección
          </p>
          <h3 className="mt-1 font-serif text-2xl text-cream md:text-3xl">{collection.name}</h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-cream/60">
            {collection.description}
          </p>

          <span className="mt-4 inline-flex items-center gap-2 border-b border-cream/30 pb-0.5 text-[10px] uppercase tracking-[0.3em] text-cream/70 transition-all duration-300 group-hover:border-cream/60 group-hover:text-cream">
            Ver colección
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="none"
              className="transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden
            >
              <path
                d="M2 6h8M6.5 2.5 10 6l-3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}