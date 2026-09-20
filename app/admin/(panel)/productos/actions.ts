"use server";

import { redirect } from "next/navigation";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  ValidationError,
  type ProductInput,
} from "@/lib/db/catalog";

export type ProductActionResult = { error: string } | { ok: true };

function parseJson<T>(raw: string | null): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function parseNumber(raw: string | null): number {
  const n = Number(raw ?? "");
  return Number.isFinite(n) ? n : NaN;
}

function fromForm(formData: FormData): Omit<ProductInput, "slug"> & { slug?: string } {
  const sizes = parseJson<Array<{ size: string; quantity: number }>>(
    String(formData.get("sizesJson") ?? ""),
  );
  const images = parseJson<Array<{ publicId: string; url: string }>>(
    String(formData.get("imagesJson") ?? ""),
  );
  return {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? "") || undefined,
    description: String(formData.get("description") ?? ""),
    price: parseNumber(String(formData.get("price") ?? "")),
    collectionId: String(formData.get("collectionId") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    sizes: sizes ?? [],
    images: images ?? [],
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
  };
}

export async function createProductAction(
  _state: ProductActionResult,
  formData: FormData,
): Promise<ProductActionResult> {
  try {
    await createProduct(fromForm(formData));
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message };
    return { error: "No se pudo crear el producto." };
  }
  redirect("/admin/productos");
}

export async function updateProductAction(
  id: string,
  _state: ProductActionResult,
  formData: FormData,
): Promise<ProductActionResult> {
  try {
    await updateProduct(id, fromForm(formData));
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message };
    return { error: "No se pudo guardar el producto." };
  }
  redirect("/admin/productos");
}

export async function deleteProductAction(id: string): Promise<{ error?: string }> {
  try {
    await deleteProduct(id);
  } catch {
    return { error: "No se pudo eliminar el producto." };
  }
  return {};
}
