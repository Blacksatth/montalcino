import { ValidationError } from "@/lib/errors";
import type { OrderCustomer, OrderStatus } from "@/types";

export interface CheckoutItemInput {
  productId: string;
  size: string;
  quantity: number;
}

export interface CheckoutInput {
  customer: OrderCustomer;
  items: CheckoutItemInput[];
}

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return false;
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertCustomer(customer: unknown): asserts customer is OrderCustomer {
  if (typeof customer !== "object" || customer === null) {
    throw new ValidationError("Faltan los datos del comprador.");
  }
  const value = customer as Record<string, unknown>;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const phone = typeof value.phone === "string" ? value.phone.trim() : "";
  const email = typeof value.email === "string" ? value.email.trim() : "";
  if (!name) throw new ValidationError("El nombre del comprador es obligatorio.");
  if (!email) throw new ValidationError("El correo del comprador es obligatorio.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError("El correo del comprador no es válido.");
  }
  if (!phone) throw new ValidationError("El teléfono del comprador es obligatorio.");
}

export function assertCheckoutItems(items: unknown): asserts items is CheckoutItemInput[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError("El pedido no tiene productos.");
  }
  for (const item of items) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof item.productId !== "string" ||
      !item.productId ||
      typeof item.size !== "string" ||
      !item.size.trim() ||
      typeof item.quantity !== "number" ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      throw new ValidationError("Cada producto requiere su identificador, talla y una cantidad entera positiva.");
    }
  }
}

export interface OrderCosts {
  subtotal: number;
  shipping: number;
  total: number;
}

export function computeOrderCosts(unitPrices: number[], quantities: number[], shipping: number): OrderCosts {
  if (unitPrices.length !== quantities.length) {
    throw new Error("computeOrderCosts recibió listas de distinta longitud.");
  }
  const subtotal = unitPrices.reduce((sum, price, index) => sum + price * quantities[index], 0);
  const shippingCost = subtotal > 0 ? shipping : 0;
  return { subtotal, shipping: shippingCost, total: subtotal + shippingCost };
}

export function buildReference(now = Date.now(), taken: ReadonlySet<string> = new Set()): string {
  const date = new Date(now);
  const datePart =
    date.toISOString().slice(0, 10).replace(/-/g, "") +
    "-" +
    Math.floor((now / 1000) % 86400).toString().padStart(5, "0");
  const tryRef = (suffix: string) => `#${datePart}${suffix}`;
  let reference = tryRef("");
  let attempt = 0;
  while (taken.has(reference) && attempt < 100) {
    attempt += 1;
    reference = tryRef(`-${Math.floor(Math.random() * 90 + 10)}`);
  }
  return reference;
}