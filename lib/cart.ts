export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
  size: string;
  quantity: number;
  maxQty?: number;
}

export type StockQuery = (productId: string, size: string) => number;

export function cartKey(productId: string, size: string): string {
  return `${productId}:${size}`;
}

function findIndex(cart: CartItem[], key: string): number {
  return cart.findIndex((line) => cartKey(line.productId, line.size) === key);
}

function clampQty(item: CartItem, quantity: number, stockOf: StockQuery): number {
  const stock = stockOf(item.productId, item.size);
  return Math.max(0, Math.min(quantity, stock));
}

export function addItem(cart: CartItem[], item: CartItem, stockOf: StockQuery): CartItem[] {
  if (stockOf(item.productId, item.size) <= 0) {
    return cart;
  }
  const key = cartKey(item.productId, item.size);
  const at = findIndex(cart, key);
  if (at === -1) {
    return [...cart, { ...item }];
  }
  const existing = cart[at];
  const nextQty = clampQty(existing, existing.quantity + item.quantity, stockOf);
  if (nextQty === existing.quantity) {
    return cart;
  }
  const next = [...cart];
  next[at] = { ...existing, quantity: nextQty };
  return next;
}

export function setQuantity(cart: CartItem[], key: string, quantity: number, stockOf: StockQuery): CartItem[] {
  const at = findIndex(cart, key);
  if (at === -1) {
    return cart;
  }
  const existing = cart[at];
  const nextQty = clampQty(existing, quantity, stockOf);
  if (nextQty <= 0) {
    return cart.filter((_, i) => i !== at);
  }
  if (nextQty === existing.quantity) {
    return cart;
  }
  const next = [...cart];
  next[at] = { ...existing, quantity: nextQty };
  return next;
}

export function removeItem(cart: CartItem[], key: string): CartItem[] {
  return cart.filter((line) => cartKey(line.productId, line.size) !== key);
}

export function cartSubtotal(cart: CartItem[]): number {
  return cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
}

export function cartCount(cart: CartItem[]): number {
  return cart.reduce((sum, line) => sum + line.quantity, 0);
}