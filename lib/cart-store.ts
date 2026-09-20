import type { CartItem } from "@/lib/cart";

const STORAGE_KEY = "montalchino:cart";

let cart: CartItem[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export const cartStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getCart(): CartItem[] {
    return cart;
  },
  setCart(next: CartItem[]): void {
    cart = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // almacenamiento no disponible
    }
    emit();
  },
  init(): void {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          cart = parsed as CartItem[];
        }
      }
    } catch {
      // datos corruptos: se descartan
    }
    emit();
  },
};