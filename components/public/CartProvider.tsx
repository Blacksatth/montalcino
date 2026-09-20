"use client";

import { useCallback, useEffect, useSyncExternalStore, useState } from "react";
import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import {
  addItem,
  cartCount,
  cartSubtotal,
  removeItem,
  setQuantity,
} from "@/lib/cart";
import type { CartItem, StockQuery } from "@/lib/cart";
import { cartStore } from "@/lib/cart-store";

const UNLIMITED_STOCK: StockQuery = () => 9999;

const EMPTY_CART: CartItem[] = [];

export interface CartContextValue {
  cart: CartItem[];
  count: number;
  subtotal: number;
  add: (item: CartItem, stockOf?: StockQuery) => void;
  changeQuantity: (key: string, quantity: number, stockOf?: StockQuery) => void;
  removeLine: (key: string) => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getCart,
    () => EMPTY_CART,
  );

  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    cartStore.init();
  }, []);

  const add = useCallback((item: CartItem, stockOf: StockQuery = UNLIMITED_STOCK) => {
    const maxQty = stockOf(item.productId, item.size);
    cartStore.setCart(addItem(cartStore.getCart(), { ...item, maxQty }, stockOf));
  }, []);

  const changeQuantity = useCallback(
    (key: string, quantity: number, stockOf: StockQuery = UNLIMITED_STOCK) => {
      cartStore.setCart(setQuantity(cartStore.getCart(), key, quantity, stockOf));
    },
    [],
  );

  const removeLine = useCallback((key: string) => {
    cartStore.setCart(removeItem(cartStore.getCart(), key));
  }, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <CartContext.Provider
      value={{
        cart,
        count: cartCount(cart),
        subtotal: cartSubtotal(cart),
        add,
        changeQuantity,
        removeLine,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (value === null) {
    throw new Error("useCart debe usarse dentro de <CartProvider>.");
  }
  return value;
}