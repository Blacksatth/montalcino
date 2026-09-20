"use server";

import { redirect } from "next/navigation";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  ValidationError,
} from "@/lib/db/catalog";

export type CategoryActionResult = { error: string } | { ok: true };

export async function createCategoryAction(
  _state: CategoryActionResult,
  formData: FormData,
): Promise<CategoryActionResult> {
  try {
    await createCategory({
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? "") || undefined,
      order: Number(formData.get("order") ?? 0),
    });
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message };
    return { error: "No se pudo crear la categoría." };
  }
  redirect("/admin/categorias");
}

export async function updateCategoryAction(
  id: string,
  _state: CategoryActionResult,
  formData: FormData,
): Promise<CategoryActionResult> {
  try {
    await updateCategory(id, {
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? "") || undefined,
      order: Number(formData.get("order") ?? 0),
    });
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message };
    return { error: "No se pudo guardar la categoría." };
  }
  redirect("/admin/categorias");
}

export async function deleteCategoryAction(
  id: string,
  _state: CategoryActionResult,
  _formData: FormData,
): Promise<CategoryActionResult> {
  try {
    await deleteCategory(id);
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message };
    return { error: "No se pudo eliminar la categoría." };
  }
  redirect("/admin/categorias");
}
