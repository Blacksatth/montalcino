import { config } from "dotenv";
config({ path: ".env.local" });

import path from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { v2 as cloudinary } from "cloudinary";
import { availableSlug } from "@/lib/validation";
import { DEFAULT_SHIPPING_FLAT_RATE } from "@/lib/constants";
import type { CloudImage } from "@/types";

const ASSETS_DIR = path.join(
  process.cwd(),
  "scripts",
  "assets",
  "coleccion-casual",
);

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

function getCloudName(): string | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  return cloudName;
}

async function assetExists(publicId: string): Promise<boolean> {
  try {
    await cloudinary.api.resource(publicId);
    return true;
  } catch {
    return false;
  }
}

async function ensureAsset(
  file: string,
  publicId: string,
): Promise<string> {
  if (await assetExists(publicId)) {
    console.log(`[cloudinary] ya existe: ${publicId}`);
    return publicId;
  }
  const relative = publicId.replace(/^montalchino\//, "");
  const result = await cloudinary.uploader.upload(file, {
    folder: "montalchino",
    public_id: relative,
    overwrite: false,
  });
  console.log(`[cloudinary] subido: ${result.public_id}`);
  return result.public_id;
}

function cloudImage(cloud: string, publicId: string, width: number): CloudImage {
  return {
    publicId,
    url: `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_${width}/${publicId}`,
  };
}

interface ProductDef {
  name: string;
  slot: string;
  price: number;
  description: string;
  featured: boolean;
}

const PRODUCTS: ProductDef[] = [
  {
    name: "Montalcino Paint",
    slot: "paint",
    price: 125000,
    description:
      "Una camisa con presencia: color y textura pensados para destacar sin esfuerzo en el día a día.",
    featured: true,
  },
  {
    name: "Montalcino Basic",
    slot: "basic",
    price: 105000,
    description:
      "La base perfecta del armario casual. Corte limpio y confección que acompaña cada jornada.",
    featured: false,
  },
  {
    name: "Montalcino Military",
    slot: "military",
    price: 125000,
    description:
      "Actitud militar con caída impecable. Un esencial robusto y versátil para looks urbanos.",
    featured: true,
  },
  {
    name: "Montalcino Eclipse",
    slot: "eclipse",
    price: 110000,
    description:
      "Elegancia en tonos profundos. Pensada para quienes visten con intención y sin ruido.",
    featured: false,
  },
];

const SIZES = [
  { size: "S", quantity: 6 },
  { size: "M", quantity: 10 },
  { size: "L", quantity: 8 },
  { size: "XL", quantity: 4 },
];

async function main() {
  const db = getDb();
  const cloud = getCloudName();
  if (!db || !cloud) {
    console.error(
      "[import] Faltan credenciales. Configura .env.local con FIREBASE_SERVICE_ACCOUNT_JSON y CLOUDINARY_*.",
    );
    process.exit(1);
  }

  const heroPublicId = "montalchino/colecciones/casual";
  const hero = await ensureAsset(
    path.join(ASSETS_DIR, "portada.jpg"),
    heroPublicId,
  );

  const productSlots = new Map<string, string>();
  for (const product of PRODUCTS) {
    const publicId = `montalchino/productos/montalcino-${product.slot}`;
    productSlots.set(product.slot, await ensureAsset(
      path.join(ASSETS_DIR, `montalcino-${product.slot}.jpg`),
      publicId,
    ));
  }

  console.log("[firestore] Reseteando contenido (collections, categories, products)...");
  await Promise.all(
    ["collections", "categories", "products"].map(async (kind) => {
      const snap = await db.collection(kind).get();
      await Promise.all(snap.docs.map((doc) => doc.ref.delete()));
    }),
  );

  const timestamp = Date.now();

  await db.doc("settings/tienda").set(
    { shippingFlatRate: DEFAULT_SHIPPING_FLAT_RATE },
    { merge: true },
  );

  const categoryRef = await db.collection("categories").add({
    name: "Camisas",
    slug: "camisas",
    order: 1,
  });

  const collectionRef = await db.collection("collections").add({
    name: "Casual",
    slug: "casual",
    description:
      "La colección con la que Montalchino se presenta: camisas de uso diario, confeccionadas para durar y para verse.",
    heroImage: cloudImage(cloud, hero, 1600),
    order: 1,
    active: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  for (const product of PRODUCTS) {
    await db.collection("products").add({
      name: product.name,
      slug: availableSlug(product.name, []),
      description: product.description,
      price: product.price,
      collectionId: collectionRef.id,
      categoryId: categoryRef.id,
      sizes: SIZES,
      images: [cloudImage(cloud, productSlots.get(product.slot) ?? "", 1200)],
      featured: product.featured,
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  console.log(
    `[import] Listo: colección "Casual" + categoría "Camisas" + ${PRODUCTS.length} productos con fotos reales.`,
  );
}

main().catch((error) => {
  console.error("[import] Error:", error);
  process.exit(1);
});