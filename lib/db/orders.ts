import "server-only";
import { getDb } from "@/lib/firebase/admin";
import { getSettings } from "@/lib/settings";
import { ValidationError } from "@/lib/errors";
import {
  assertCheckoutItems,
  assertCustomer,
  buildReference,
  canTransition,
  computeOrderCosts,
  type CheckoutItemInput,
} from "@/lib/order";
import type { Order, OrderCustomer, OrderStatus } from "@/types";

const ORDERS = "orders";

function withId<T extends object>(id: string, data: T): T & { id: string } {
  return { id, ...data };
}

function requireDb() {
  const db = getDb();
  if (!db) {
    throw new ValidationError(
      "Firebase no está configurado (FIREBASE_SERVICE_ACCOUNT_JSON). Revisa .env.local",
    );
  }
  return db;
}

export interface CreateOrderInput {
  customer: OrderCustomer;
  items: CheckoutItemInput[];
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  assertCustomer(input.customer);
  assertCheckoutItems(input.items);
  const db = requireDb();

  const items = [];
  for (const line of input.items) {
    const product = await db.collection("products").doc(line.productId).get();
    const data = product.data();
    if (!product.exists || !data) {
      throw new ValidationError("Uno de los productos ya no está disponible.");
    }
    if (data.active === false) {
      throw new ValidationError(`"${data.name}" ya no está disponible.`);
    }
    const variant = data.sizes?.find(
      (option: { size: string }) => option.size === line.size,
    );
    if (!variant || typeof variant.quantity !== "number" || variant.quantity < line.quantity) {
      throw new ValidationError(`No hay suficiente stock de "${data.name}" (talla ${line.size}).`);
    }
    items.push({
      productId: line.productId,
      name: data.name,
      size: line.size,
      quantity: line.quantity,
      unitPrice: data.price,
    });
  }

  const settings = await getSettings();
  const costs = computeOrderCosts(
    items.map((item) => item.unitPrice),
    items.map((item) => item.quantity),
    settings.shippingFlatRate,
  );

  const taken = new Set<string>();
  const existingRefs = await db.collection(ORDERS).get();
  existingRefs.docs.forEach((doc) => taken.add(doc.data()?.reference ?? ""));
  const reference = buildReference(Date.now(), taken);

  const now = Date.now();
  const doc = await db.collection(ORDERS).add({
    reference,
    status: "pending" satisfies OrderStatus,
    items,
    subtotal: costs.subtotal,
    shipping: costs.shipping,
    total: costs.total,
    customer: input.customer,
    payment: {},
    createdAt: now,
    updatedAt: now,
  });

  return withId(doc.id, {
    reference,
    status: "pending" satisfies OrderStatus,
    items,
    subtotal: costs.subtotal,
    shipping: costs.shipping,
    total: costs.total,
    customer: input.customer,
    payment: {},
    createdAt: now,
    updatedAt: now,
  });
}

export async function getOrderById(id: string): Promise<Order | null> {
  const db = getDb();
  if (!db) {
    return null;
  }
  const doc = await db.collection(ORDERS).doc(id).get();
  if (!doc.exists) {
    return null;
  }
  return withId(doc.id, doc.data() as Omit<Order, "id">);
}

export async function listOrders(): Promise<Order[]> {
  const db = getDb();
  if (!db) {
    return [];
  }
  const snap = await db.collection(ORDERS).orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => withId(doc.id, doc.data() as Omit<Order, "id">));
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  const db = requireDb();
  const current = await getOrderById(id);
  if (!current) {
    return null;
  }
  if (!canTransition(current.status, status)) {
    throw new ValidationError(
      `No se puede pasar el pedido de "${current.status}" a "${status}".`,
    );
  }
  await db.collection(ORDERS).doc(id).update({ status, updatedAt: Date.now() });
  return { ...current, status, updatedAt: Date.now() };
}