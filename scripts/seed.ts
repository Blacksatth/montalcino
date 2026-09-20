import { config } from "dotenv";
config({ path: ".env.local" });

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { availableSlug } from "@/lib/validation";
import { DEFAULT_SHIPPING_FLAT_RATE } from "@/lib/constants";
import type { CloudImage, Collection, Product } from "@/types";

function getDb() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    return null;
  }
  let account: Record<string, string>;
  try {
    account = JSON.parse(raw);
  } catch {
    return null;
  }
  const app =
    getApps()[0] ?? initializeApp({ credential: cert(account) });
  return getFirestore(app);
}

const DEMO_IMAGE = (publicId: string, width = 1600): CloudImage => ({
  publicId,
  url: `https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_${width}/${publicId}`,
});

async function main() {
  const db = getDb();
  if (!db) {
    console.error(
      "[seed] No se encontró FIREBASE_SERVICE_ACCOUNT_JSON. Configura .env.local con la service account.",
    );
    process.exit(1);
  }

  const products = await db.collection("products").limit(1).get();
  if (!products.empty && process.env.RESEED !== "true") {
    console.error(
      "[seed] Ya existe contenido. Para reemplazarlo ejecuta: RESEED=true npm run seed",
    );
    process.exit(1);
  }

  if (process.env.RESEED === "true") {
    await Promise.all(
      ["collections", "categories", "products"].map(async (kind) => {
        const snap = await db.collection(kind).get();
        await Promise.all(snap.docs.map((doc) => doc.ref.delete()));
      }),
    );
    console.log("[seed] Contenido previo eliminado (RESEED).");
  }

  const timestamp = Date.now();

  await db.doc("settings/tienda").set(
    { shippingFlatRate: DEFAULT_SHIPPING_FLAT_RATE },
    { merge: true },
  );

  const categories = await Promise.all(
    ["Camisas", "Pantalones", "Accesorios"].map(async (name, index) => {
      const doc = await db.collection("categories").add({
        name,
        slug: availableSlug(name, []),
        order: index + 1,
      });
      return { id: doc.id, name, slug: availableSlug(name, []) };
    }),
  );

  const collections: Array<Partial<Collection> & { id: string }> = [];
  const collectionDefs = [
    {
      name: "La Primera Edición",
      description:
        "Una selección introductoria: piezas atemporales que abren la casa Montalchino.",
      order: 1,
      hero: "samples/ecommerce/leather-bag-gray.jpg",
    },
    {
      name: "Montalchino Essentials",
      description: "Lo esencial de cada armario, confeccionado para durar.",
      order: 2,
      hero: "samples/fashion/2.jpg",
    },
  ];
  for (const def of collectionDefs) {
    const doc = await db.collection("collections").add({
      name: def.name,
      slug: availableSlug(def.name, []),
      description: def.description,
      heroImage: DEMO_IMAGE(def.hero),
      order: def.order,
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    collections.push({
      id: doc.id,
      name: def.name,
      description: def.description,
      order: def.order,
    } as Partial<Collection> & { id: string });
  }

  const cat = (name: string) => categories.find((c) => c.name === name)?.id ?? "";
  const col = (name: string) => collections.find((c) => c.name === name)?.id ?? "";

  const productData: Array<
    Omit<Product, "id" | "createdAt" | "updatedAt" | "slug"> & { name: string }
  > = [
    {
      name: "Camisa Olivia",
      description:
        "Corte relajado en algodón con acabados limpios. La pieza que abre la colección.",
      price: 180000,
      collectionId: col("La Primera Edición"),
      categoryId: cat("Camisas"),
      sizes: [
        { size: "S", quantity: 5 },
        { size: "M", quantity: 8 },
        { size: "L", quantity: 5 },
        { size: "XL", quantity: 2 },
      ],
      images: [DEMO_IMAGE("samples/fashion/1")],
      featured: true,
      active: true,
    },
    {
      name: "Camisa Cuadros Editorial",
      description:
        "Cuadros atemporales en tonos tierra. Pensada para lucirse y para durar.",
      price: 165000,
      collectionId: col("La Primera Edición"),
      categoryId: cat("Camisas"),
      sizes: [
        { size: "M", quantity: 6 },
        { size: "L", quantity: 4 },
      ],
      images: [DEMO_IMAGE("samples/ecommerce/analog-classic")],
      featured: false,
      active: true,
    },
    {
      name: "Pantalón Lino Taupe",
      description: "Lino lavado, caída natural y cintura cómoda. Un esencial de verano.",
      price: 240000,
      collectionId: col("Montalchino Essentials"),
      categoryId: cat("Pantalones"),
      sizes: [
        { size: "30", quantity: 4 },
        { size: "32", quantity: 6 },
        { size: "34", quantity: 3 },
      ],
      images: [DEMO_IMAGE("samples/fashion/3")],
      featured: true,
      active: true,
    },
    {
      name: "Bolso Cáñamo Artesanal",
      description: "Tejido a mano, una sola pieza por tallaje. Única por definición.",
      price: 120000,
      collectionId: col("Montalchino Essentials"),
      categoryId: cat("Accesorios"),
      sizes: [{ size: "Única", quantity: 7 }],
      images: [DEMO_IMAGE("samples/ecommerce/accessory-bag")],
      featured: false,
      active: true,
    },
  ];

  for (const data of productData) {
    await db.collection("products").add({
      ...data,
      slug: availableSlug(data.name, []),
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  console.log("[seed] Listo: settings, 2 colecciones, 3 categorías y 4 productos CREADOS.");
  console.log("[seed] NOTA: las imágenes son del cloud demo de Cloudinary (placeholders).");
}

main().catch((error) => {
  console.error("[seed] Error:", error);
  process.exit(1);
});