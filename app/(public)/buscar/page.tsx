import { SearchResults } from "@/components/public/SearchResults";
import { listCategories, listCollections, listProducts } from "@/lib/db/catalog";

export const dynamic = "force-dynamic";

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q = "", cat = "" } = await searchParams;
  const [products, collections, categories] = await Promise.all([
    listProducts(),
    listCollections(),
    listCategories(),
  ]);

  return (
    <SearchResults
      products={products}
      collections={collections}
      categories={categories}
      initialQ={q}
      initialCat={cat}
    />
  );
}