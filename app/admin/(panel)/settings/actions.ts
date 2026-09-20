"use server";

import { redirect } from "next/navigation";
import { saveSettings, ValidationError } from "@/lib/db/catalog";

export type SettingsActionResult = { error: string } | { ok: true };

export async function saveSettingsAction(
  _state: SettingsActionResult,
  formData: FormData,
): Promise<SettingsActionResult> {
  try {
    await saveSettings({
      shippingFlatRate: Number(formData.get("shippingFlatRate") ?? "0"),
    });
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message };
    return { error: "No se pudieron guardar los ajustes." };
  }
  redirect("/admin/settings");
}
