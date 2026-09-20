import { slugify } from "@/lib/slug";

export function isSlugAvailable(
  slug: string,
  documents: ReadonlyArray<{ id: string; slug: string }>,
  excludeId?: string,
): boolean {
  return !documents.some((doc) => doc.slug === slug && doc.id !== excludeId);
}

export function availableSlug(
  base: string,
  documents: ReadonlyArray<{ id: string; slug: string }>,
  excludeId?: string,
): string {
  const candidate = slugify(base) || "sin-nombre";
  if (isSlugAvailable(candidate, documents, excludeId)) {
    return candidate;
  }
  let n = 2;
  let slug = `${candidate}-${n}`;
  while (!isSlugAvailable(slug, documents, excludeId)) {
    n += 1;
    slug = `${candidate}-${n}`;
  }
  return slug;
}