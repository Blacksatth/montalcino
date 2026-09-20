import type { Order } from "@/types";

export interface CheckoutPreference {
  preferenceId: string;
  url: string;
}

export function isMercadoPagoConfigured(): boolean {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

export async function createCheckoutPreference(
  _order: Order,
): Promise<CheckoutPreference | null> {
  if (!isMercadoPagoConfigured()) {
    return null;
  }
  throw new Error(
    "createCheckoutPreference se implementa en T16 cuando esté configurado el token de MercadoPago.",
  );
}