import { ValidationError } from "@/lib/errors";
import { createOrder } from "@/lib/db/orders";
import { createCheckoutPreference } from "@/lib/mercadopago";
import type { CheckoutInput } from "@/lib/order";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "El cuerpo debe ser JSON." }, { status: 400 });
  }

  try {
    const checkout = body as CheckoutInput;
    const order = await createOrder({
      customer: checkout.customer,
      items: checkout.items,
    });
    const preference = await createCheckoutPreference(order);
    return Response.json(
      {
        orderId: order.id,
        reference: order.reference,
        total: order.total,
        checkoutUrl: preference?.url ?? null,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("POST /api/orders", error);
    return Response.json({ error: "No se pudo crear el pedido." }, { status: 500 });
  }
}