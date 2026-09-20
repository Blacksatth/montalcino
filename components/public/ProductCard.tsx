import Image from "next/image";
import Link from "next/link";
import { formatCOP } from "@/lib/money";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0];
  return (
    <Link href={`/producto/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden border border-line bg-surface-soft">
        {image ? (
          <Image
            src={image.url}
            alt={product.name}
            width={800}
            height={1067}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[11px] uppercase tracking-widest text-taupe/50">
            Sin imagen
          </div>
        )}
        {/* Bottom gradient for name overlay on hover */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <div className="mt-3.5 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-serif text-[15px] leading-snug">{product.name}</h3>
          <p className="mt-0.5 text-[11px] uppercase tracking-widest text-taupe/70">
            {product.categoryId ? "Camisas" : ""}
          </p>
        </div>
        <p className="shrink-0 text-xs tabular-nums text-foreground/70">
          {formatCOP(product.price)}
        </p>
      </div>
    </Link>
  );
}