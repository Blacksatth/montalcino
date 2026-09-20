"use server";

import { redirect } from "next/navigation";
import {
  createCollection,
  deleteCollection,
  setCollectionActive,
  updateCollection,
  ValidationError,
} from "@/lib/db/catalog";

export type CollectionActionResult = { error: string } | { ok: true };

export async function createCollectionAction(
  _state: CollectionActionResult,
  formData: FormData,
): Promise<CollectionActionResult> {
  try {
    await createCollection({
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? "") || undefined,
      description: String(formData.get("description") ?? ""),
      heroImage: {
        publicId: String(formData.get("heroPublicId") ?? ""),
        url: String(formData.get("heroUrl") ?? ""),
      },
      order: Number(formData.get("order") ?? 0),
      active: formData.get("active") === "on",
    });
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message };
    return { error: "No se pudo crear la colección." };
  }
  redirect("/admin/colecciones");
}

export async function updateCollectionAction(
  id: string,
  _state: CollectionActionResult,
  formData: FormData,
): Promise<CollectionActionResult> {
  try {
    await updateCollection(id, {
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? "") || undefined,
      description: String(formData.get("description") ?? ""),
      heroImage: {
        publicId: String(formData.get("heroPublicId") ?? ""),
        url: String(formData.get("heroUrl") ?? ""),
      },
      order: Number(formData.get("order") ?? 0),
      active: formData.get("active") === "on",
    });
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message };
    return { error: "No se pudo guardar la colección." };
  }
  redirect("/admin/colecciones");
}

export async function toggleCollectionActiveAction(
  id: string,
  _state: CollectionActionResult,
  formData: FormData,
): Promise<CollectionActionResult> {
  const active = formData.get("active") === "on";
  try {
    await setCollectionActive(id, active);
  } catch {
    return { error: "No se pudo actualizar la colección." };
  }
  redirect("/admin/colecciones");
}

export async function deleteCollectionAction(
  id: string,
  _state: CollectionActionResult,
  _formData: FormData,
): Promise<CollectionActionResult> {
  try {
    await deleteCollection(id);
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message };
    return { error: "No se pudo eliminar la colección." };
  }
  redirect("/admin/colecciones");
}
