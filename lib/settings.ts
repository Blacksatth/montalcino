import "server-only";
import { getDb } from "@/lib/firebase/admin";
import { DEFAULT_SHIPPING_FLAT_RATE } from "@/lib/constants";
import type { Settings } from "@/types";

const FALLBACK: Settings = { shippingFlatRate: DEFAULT_SHIPPING_FLAT_RATE };

export function defaultSettings(): Settings {
  return { ...FALLBACK };
}

export async function getSettings(): Promise<Settings> {
  const db = getDb();
  if (!db) {
    return defaultSettings();
  }
  try {
    const doc = await db.doc("settings/tienda").get();
    if (!doc.exists) {
      return defaultSettings();
    }
    const data = doc.data();
    return {
      shippingFlatRate:
        typeof data?.shippingFlatRate === "number"
          ? data.shippingFlatRate
          : DEFAULT_SHIPPING_FLAT_RATE,
    };
  } catch {
    return defaultSettings();
  }
}