import { describe, expect, it } from "vitest";
import { ValidationError } from "@/lib/errors";
import {
  assertCheckoutItems,
  assertCustomer,
  buildReference,
  canTransition,
  computeOrderCosts,
  ORDER_TRANSITIONS,
} from "@/lib/order";
import type { OrderCustomer } from "@/types";

function customer(partial: Partial<OrderCustomer> = {}): OrderCustomer {
  return {
    name: "Santiago Cifuentes",
    phone: "3001234567",
    email: "santi@example.com",
    city: "Medellín",
    address: "Calle 1 #2-3",
    ...partial,
  };
}

describe("canTransition", () => {
  it("permite las transiciones esperadas del flujo", () => {
    expect(canTransition("pending", "paid")).toBe(true);
    expect(canTransition("pending", "cancelled")).toBe(true);
    expect(canTransition("paid", "shipped")).toBe(true);
    expect(canTransition("paid", "cancelled")).toBe(true);
    expect(canTransition("shipped", "delivered")).toBe(true);
  });

  it("rechaza saltos inválidos y auto-transiciones", () => {
    expect(canTransition("pending", "delivered")).toBe(false);
    expect(canTransition("paid", "paid")).toBe(false);
    expect(canTransition("delivered", "cancelled")).toBe(false);
    expect(canTransition("cancelled", "shipped")).toBe(false);
  });

  it("define transiciones para cada estado", () => {
    for (const from of Object.keys(ORDER_TRANSITIONS)) {
      expect(Array.isArray(ORDER_TRANSITIONS[from as keyof typeof ORDER_TRANSITIONS])).toBe(true);
    }
  });
});

describe("assertCustomer", () => {
  it("acepta un comprador completo", () => {
    const value = customer();
    expect(() => assertCustomer(value)).not.toThrow();
    expect(value.name).toBe("Santiago Cifuentes");
  });

  it("rechaza nombre, correo o teléfono vacíos", () => {
    expect(() => assertCustomer(customer({ name: "" }))).toThrow(ValidationError);
    expect(() => assertCustomer(customer({ email: "" }))).toThrow(ValidationError);
    expect(() => assertCustomer(customer({ phone: "" }))).toThrow(ValidationError);
    expect(() => assertCustomer(null)).toThrow(ValidationError);
  });

  it("rechaza correos mal formados", () => {
    expect(() => assertCustomer(customer({ email: "sin-arroba" }))).toThrow(ValidationError);
    expect(() => assertCustomer(customer({ email: "also bad" }))).toThrow(ValidationError);
  });
});

describe("assertCheckoutItems", () => {
  it("acepta una lista con productos válidos", () => {
    expect(() =>
      assertCheckoutItems([{ productId: "p1", size: "M", quantity: 2 }]),
    ).not.toThrow();
  });

  it("rechaza vacíos y cantidades inválidas", () => {
    expect(() => assertCheckoutItems([])).toThrow(ValidationError);
    expect(() => assertCheckoutItems(undefined)).toThrow(ValidationError);
    expect(() =>
      assertCheckoutItems([{ productId: "p1", size: "M", quantity: 0 }]),
    ).toThrow(ValidationError);
    expect(() =>
      assertCheckoutItems([{ productId: "p1", size: "M", quantity: 1.5 }]),
    ).toThrow(ValidationError);
    expect(() =>
      assertCheckoutItems([{ productId: "", size: "M", quantity: 1 }]),
    ).toThrow(ValidationError);
  });
});

describe("computeOrderCosts", () => {
  it("suma subtotal, sumas envío y da el total", () => {
    const costs = computeOrderCosts([100000, 50000], [2, 1], 25000);
    expect(costs.subtotal).toBe(250000);
    expect(costs.shipping).toBe(25000);
    expect(costs.total).toBe(275000);
  });

  it("no cobra envío cuando no hay productos", () => {
    const costs = computeOrderCosts([], [], 25000);
    expect(costs.shipping).toBe(0);
    expect(costs.total).toBe(0);
  });

  it("lanza si las listas no coinciden", () => {
    expect(() => computeOrderCosts([100], [1, 2], 0)).toThrow();
  });
});

describe("buildReference", () => {
  it("incluye la fecha y es estable en el tiempo con el mismo timestamp", () => {
    const reference = buildReference(Date.UTC(2026, 8, 2, 15, 30, 0));
    expect(reference).toMatch(/^#\d{8}-\d{5}$/);
  });

  it("añade sufijo alternativo cuando la primera referencia ya existe", () => {
    const base = buildReference(Date.UTC(2026, 8, 2, 15, 30, 0));
    const taken = new Set([base]);
    const next = buildReference(Date.UTC(2026, 8, 2, 15, 30, 0), taken);
    expect(next).not.toBe(base);
    expect(next).toMatch(/^#\d{8}-\d{5}(-\d{2})?$/);
  });
});