import { describe, expect, it } from "vitest";
import {
  addItem,
  cartCount,
  cartSubtotal,
  cartKey,
  removeItem,
  setQuantity,
  type CartItem,
} from "@/lib/cart";

const neverInStock = () => 0;

function item(partial: Partial<CartItem> = {}): CartItem {
  return {
    productId: "p1",
    name: "Camisa Olivia",
    slug: "camisa-olivia",
    price: 150000,
    size: "M",
    quantity: 1,
    ...partial,
  };
}

describe("cartKey", () => {
  it("identifica producto + talla", () => {
    expect(cartKey("p1", "M")).toBe("p1:M");
  });
});

describe("addItem", () => {
  it("agrega una línea nueva al carrito", () => {
    const next = addItem([], item(), () => 3);
    expect(next).toHaveLength(1);
    expect(next[0].quantity).toBe(1);
  });

  it("acumula cantidad si ya existe la misma talla", () => {
    const first = addItem([], item(), () => 3);
    const next = addItem(first, item(), () => 3);
    expect(next).toHaveLength(1);
    expect(next[0].quantity).toBe(2);
  });

  it("respeta el límite de stock de la talla al acumular", () => {
    const first = addItem([], item({ quantity: 2 }), () => 3);
    const next = addItem(first, item(), () => 3);
    expect(next[0].quantity).toBe(3);
  });

  it("no agrega un producto sin stock en esa talla", () => {
    const next = addItem([], item(), neverInStock);
    expect(next).toHaveLength(0);
  });

  it("trata tallas distintas como líneas separadas", () => {
    const one = addItem([], item({ size: "M" }), () => 3);
    const two = addItem(one, item({ size: "L" }), () => 3);
    expect(two).toHaveLength(2);
  });
});

describe("setQuantity", () => {
  it("actualiza la cantidad de una línea", () => {
    const cart = addItem([], item(), () => 5);
    const next = setQuantity(cart, "p1:M", 4, () => 5);
    expect(next[0].quantity).toBe(4);
  });

  it("limita la cantidad al stock disponible", () => {
    const cart = addItem([], item(), () => 5);
    const next = setQuantity(cart, "p1:M", 99, () => 5);
    expect(next[0].quantity).toBe(5);
  });

  it("elimina la línea al bajar a 0 o negativo", () => {
    const cart = addItem([], item(), () => 5);
    expect(setQuantity(cart, "p1:M", 0, () => 5)).toHaveLength(0);
  });

  it("ignora claves inexistentes", () => {
    const cart = addItem([], item(), () => 5);
    expect(setQuantity(cart, "pX:XL", 2, () => 5)).toHaveLength(1);
  });
});

describe("removeItem", () => {
  it("elimina la línea indicada", () => {
    const cart = addItem(addItem([], item({ size: "M" }), () => 3), item({ size: "L" }), () => 3);
    const next = removeItem(cart, "p1:M");
    expect(next).toHaveLength(1);
    expect(next[0].size).toBe("L");
  });
});

describe("totales", () => {
  it("suma subtotal y cantidad de unidades", () => {
    const cart = addItem(
      addItem([], item({ price: 100000, quantity: 2 }), () => 5),
      item({ size: "L", price: 50000 }),
      () => 5,
    );
    expect(cartSubtotal(cart)).toBe(250000);
    expect(cartCount(cart)).toBe(3);
  });

  it("carrito vacío tiene totales en cero", () => {
    expect(cartSubtotal([])).toBe(0);
    expect(cartCount([])).toBe(0);
  });
});