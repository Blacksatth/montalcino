"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/public/EmptyState";
import { ProductGrid } from "@/components/public/ProductGrid";
import type { Category, Collection, Product } from "@/types";

export function SearchResults({
  products,
  collections,
  categories,
  initialQ,
  initialCat,
}: {
  products: Product[];
  collections: Collection[];
  categories: Category[];
  initialQ: string;
  initialCat: string;
}) {
  const router = useRouter();
  const [cat, setCat] = useState(initialCat);

  const collectionName = useMemo(
    () => new Map(collections.map((item) => [item.id, item.name])),
    [collections],
  );
  const categoryName = useMemo(
    () => new Map(categories.map((item) => [item.id, item.name])),
    [categories],
  );

  const filtered = useMemo(() => {
    const term = initialQ.trim().toLowerCase();
    return products.filter((product) => {
      if (cat && product.categoryId !== cat) return false;
      if (!term) return true;
      const haystack = [
        product.name,
        collectionName.get(product.collectionId) ?? "",
        categoryName.get(product.categoryId) ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [products, collectionName, categoryName, initialQ, cat]);

  function onCategoryChange(next: string) {
    setCat(next);
    const q = initialQ.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (next) params.set("cat", next);
    const query = params.toString();
    router.push(query ? `/buscar?${query}` : "/buscar", { scroll: false });
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-taupe/50">Búsqueda</p>
          <h1 className="mt-1.5 font-serif text-4xl">Explorar</h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <label htmlFor="categoria" className="text-[10px] uppercase tracking-widest text-taupe/50">
            Categoría
          </label>
          <select
            id="categoria"
            value={cat}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="border border-line bg-background px-3.5 py-2 text-xs text-foreground/70 transition-colors focus:border-foreground/60 focus:outline-none"
          >
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        {initialQ.trim() && (
          <span className="border border-line px-3 py-1 text-[11px] uppercase tracking-widest text-foreground/50">
            “{initialQ.trim()}”
          </span>
        )}
        <p className="text-[11px] text-taupe/40">{filtered.length} {filtered.length === 1 ? "pieza" : "piezas"}</p>
      </div>

      <div className="pt-8">
        {filtered.length === 0 ? (
          <EmptyState
            title="No encontramos piezas"
            hint="Prueba con otra palabra o cambia la categoría."
          />
        ) : (
          <ProductGrid products={filtered} />
        )}
      </div>
    </div>
  );
}