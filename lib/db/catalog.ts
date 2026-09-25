import "server-only";
import { getDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth";
import { isSlugAvailable } from "@/lib/validation";
import { ValidationError } from "@/lib/errors";
import type { Category, Collection, Product, Settings } from "@/types";

const COLLECTIONS = "collections";
const CATEGORIES = "categories";
const PRODUCTS = "products";

export { ValidationError };

function withId<T extends object>(id: string, data: T): T & { id: string } {
  return { id, ...data };
}

function requireDb() {
  const db = getDb();
  if (!db) {
    throw new Error(
      "Firebase no está configurado (FIREBASE_SERVICE_ACCOUNT_JSON). Revisa .env.local",
    );
  }
  return db;
}

async function assertSlugFree(
  kind: string,
  slug: string,
  excludeId?: string,
): Promise<void> {
  const db = requireDb();
  const snap = await db.collection(kind).get();
  const existing = snap.docs.map((doc) => ({ id: doc.id, slug: doc.data()?.slug ?? "" }));
  if (!isSlugAvailable(slug, existing, excludeId)) {
    throw new ValidationError(`Ya existe un elemento con el slug "${slug}".`);
  }
}

function assertPositiveInt(value: unknown, field: string): asserts value is number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new ValidationError(`${field} debe ser un número entero mayor o igual a 0.`);
  }
}

function assertSizes(sizes: unknown): asserts sizes is Product["sizes"] {
  if (!Array.isArray(sizes) || sizes.length === 0) {
    throw new ValidationError("El producto debe tener al menos una talla con su cantidad.");
  }
  for (const variant of sizes) {
    if (
      typeof variant?.size !== "string" ||
      variant.size.trim() === "" ||
      typeof variant.quantity !== "number" ||
      !Number.isInteger(variant.quantity) ||
      variant.quantity < 0
    ) {
      throw new ValidationError("Cada talla requiere un nombre y una cantidad entera no negativa.");
    }
  }
}

function assertImages(images: unknown): asserts images is Product["images"] {
  if (!Array.isArray(images) || images.length === 0) {
    throw new ValidationError("Debe incluir al menos una imagen.");
  }
  for (const image of images) {
    if (typeof image?.publicId !== "string" || typeof image?.url !== "string") {
      throw new ValidationError("Cada imagen debe contener publicId y url.");
    }
  }
}

export async function listCollections(onlyActive = true): Promise<Collection[]> {
  const db = getDb();
  if (!db) {
    console.warn("[catalog] Firestore no inicializado (db es null)");
    return [];
  }
  console.log("[catalog] listCollections db ok, onlyActive:", onlyActive);
  const snap = await db
    .collection(COLLECTIONS)
    .orderBy("order", "asc")
    .get();
  return snap.docs
    .map((doc) => withId(doc.id, doc.data() as Omit<Collection, "id">))
    .filter((collection) => (onlyActive ? collection.active : true));
}

export async function listCategories(): Promise<Category[]> {
  const db = getDb();
  if (!db) {
    return [];
  }
  const snap = await db
    .collection(CATEGORIES)
    .orderBy("order", "asc")
    .get();
  return snap.docs.map((doc) => withId(doc.id, doc.data() as Omit<Category, "id">));
}

export async function listProducts(onlyActive = true): Promise<Product[]> {
  const db = getDb();
  if (!db) {
    return [];
  }
  const snap = await db
    .collection(PRODUCTS)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs
    .map((doc) => withId(doc.id, doc.data() as Omit<Product, "id">))
    .filter((product) => (onlyActive ? product.active : true));
}

export async function getCollectionById(id: string): Promise<Collection | null> {
  const db = getDb();
  if (!db) {
    return null;
  }
  const doc = await db.collection(COLLECTIONS).doc(id).get();
  if (!doc.exists) {
    return null;
  }
  return withId(doc.id, doc.data() as Omit<Collection, "id">);
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const db = getDb();
  if (!db) {
    return null;
  }
  const snap = await db.collection(COLLECTIONS).where("slug", "==", slug).limit(1).get();
  const doc = snap.docs[0];
  return doc ? withId(doc.id, doc.data() as Omit<Collection, "id">) : null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const db = getDb();
  if (!db) {
    return null;
  }
  const snap = await db.collection(PRODUCTS).where("slug", "==", slug).limit(1).get();
  const doc = snap.docs[0];
  return doc
    ? withId(doc.id, {
        ...(doc.data() as Omit<Product, "id">),
        active: doc.data()?.active !== false,
      })
    : null;
}

export interface CollectionInput {
  name: string;
  slug?: string;
  description: string;
  heroImage: { publicId: string; url: string };
  order: number;
  active: boolean;
}

export async function createCollection(input: CollectionInput): Promise<string> {
  await requireAdmin();
  if (!input.name.trim()) {
    throw new ValidationError("El nombre es obligatorio.");
  }
  const slug = input.slug?.trim() || input.name.trim();
  await assertSlugFree(COLLECTIONS, slug);
  const db = requireDb();
  const timestamp = Date.now();
  const doc = await db.collection(COLLECTIONS).add({
    name: input.name.trim(),
    slug,
    description: input.description,
    heroImage: input.heroImage,
    order: input.order,
    active: input.active,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return doc.id;
}

export async function updateCollection(
  id: string,
  input: Partial<CollectionInput>,
): Promise<void> {
  await requireAdmin();
  const db = requireDb();
  if (input.slug) {
    await assertSlugFree(COLLECTIONS, input.slug, id);
  }
  await db.collection(COLLECTIONS).doc(id).update({
    ...input,
    updatedAt: Date.now(),
  });
}

export async function setCollectionActive(id: string, active: boolean): Promise<void> {
  await requireAdmin();
  const db = requireDb();
  await db.collection(COLLECTIONS).doc(id).update({ active, updatedAt: Date.now() });
}

export async function deleteCollection(id: string): Promise<void> {
  await requireAdmin();
  const db = requireDb();
  const products = await db
    .collection(PRODUCTS)
    .where("collectionId", "==", id)
    .limit(1)
    .get();
  if (!products.empty) {
    throw new ValidationError("No se puede eliminar una colección con productos.");
  }
  await db.collection(COLLECTIONS).doc(id).delete();
}

export interface CategoryInput {
  name: string;
  slug?: string;
  order: number;
}

export async function createCategory(input: CategoryInput): Promise<string> {
  await requireAdmin();
  if (!input.name.trim()) {
    throw new ValidationError("El nombre es obligatorio.");
  }
  const slug = input.slug?.trim() || input.name.trim();
  await assertSlugFree(CATEGORIES, slug);
  const db = requireDb();
  const doc = await db.collection(CATEGORIES).add({
    name: input.name.trim(),
    slug,
    order: input.order,
  });
  return doc.id;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<void> {
  await requireAdmin();
  const db = requireDb();
  if (input.slug) {
    await assertSlugFree(CATEGORIES, input.slug, id);
  }
  await db.collection(CATEGORIES).doc(id).update(input);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const db = getDb();
  if (!db) {
    return null;
  }
  const doc = await db.collection(CATEGORIES).doc(id).get();
  if (!doc.exists) {
    return null;
  }
  return withId(doc.id, doc.data() as Omit<Category, "id">);
}

export async function deleteCategory(id: string): Promise<void> {
  await requireAdmin();
  const db = requireDb();
  const products = await db
    .collection(PRODUCTS)
    .where("categoryId", "==", id)
    .limit(1)
    .get();
  if (!products.empty) {
    throw new ValidationError("Asigna otra categoría a los productos antes de eliminar esta.");
  }
  await db.collection(CATEGORIES).doc(id).delete();
}

export interface ProductInput {
  name: string;
  slug?: string;
  description: string;
  price: number;
  collectionId: string;
  categoryId: string;
  sizes: Product["sizes"];
  images: Product["images"];
  featured: boolean;
  active: boolean;
}

export async function createProduct(input: ProductInput): Promise<string> {
  await requireAdmin();
  if (!input.name.trim()) {
    throw new ValidationError("El nombre es obligatorio.");
  }
  assertPositiveInt(input.price, "El precio");
  assertSizes(input.sizes);
  assertImages(input.images);
  const slug = input.slug?.trim() || input.name.trim();
  await assertSlugFree(PRODUCTS, slug);
  const db = requireDb();
  const timestamp = Date.now();
  const doc = await db.collection(PRODUCTS).add({
    name: input.name.trim(),
    slug,
    description: input.description,
    price: input.price,
    collectionId: input.collectionId,
    categoryId: input.categoryId,
    sizes: input.sizes,
    images: input.images,
    featured: input.featured,
    active: input.active,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return doc.id;
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<void> {
  await requireAdmin();
  const db = requireDb();
  if (input.slug) {
    await assertSlugFree(PRODUCTS, input.slug, id);
  }
  if (input.price !== undefined) {
    assertPositiveInt(input.price, "El precio");
  }
  if (input.sizes !== undefined) {
    assertSizes(input.sizes);
  }
  if (input.images !== undefined) {
    assertImages(input.images);
  }
  await db.collection(PRODUCTS).doc(id).update({
    ...input,
    updatedAt: Date.now(),
  });
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = getDb();
  if (!db) {
    return null;
  }
  const doc = await db.collection(PRODUCTS).doc(id).get();
  if (!doc.exists) {
    return null;
  }
  const data = doc.data() as Omit<Product, "id">;
  return withId(doc.id, { ...data, active: data.active !== false });
}

export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();
  const db = requireDb();
  await db.collection(PRODUCTS).doc(id).delete();
}

export async function saveSettings(settings: Settings): Promise<void> {
  await requireAdmin();
  assertPositiveInt(settings.shippingFlatRate, "La tarifa de envío");
  const db = requireDb();
  await db.doc("settings/tienda").set(settings, { merge: true });
}