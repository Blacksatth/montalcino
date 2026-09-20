"use client";

import { useState } from "react";
import { useCart } from "@/components/public/CartProvider";
import { SizeSelector } from "@/components/public/SizeSelector";
import { cartKey } from "@/lib/cart";
import type { Product } from "@/types";

export function AddToCart({ product }: { product: Product }) {
  const { add, openDrawer, cart, changeQuantity } = useCart();
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<"idle" | "added" | "error">("idle");

  const variant = product.sizes.find((item) => item.size === size);
  const stock = variant?.quantity ?? 0;
  const lineKey = size ? cartKey(product.id, size) : "";
  const inCart = lineKey ? cart.find((line) => cartKey(line.productId, line.size) === lineKey) : undefined;

  function handleAdd() {
    if (!size) {
      setFeedback("error");
      return;
    }
    if (variant === undefined || variant.quantity <= 0) {
      setFeedback("error");
      return;
    }
    add(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images[0]?.url,
        size,
        quantity,
      },
      () => variant.quantity,
    );
    setFeedback("added");
    openDrawer();
    window.setTimeout(() => setFeedback("idle"), 1800);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.35em] text-taupe/60">Tallas</p>
        {inCart ? (
          <p className="text-[10px] uppercase tracking-widest text-taupe/60">
            En tu carrito: {inCart.quantity}
          </p>
        ) : null}
      </div>
      <SizeSelector sizes={product.sizes} selected={size} onChange={setSize} />

      {size ? (
        <div className="mt-6 flex items-center gap-5">
          <div className="flex items-center border border-line">
            <button
              type="button"
              aria-label="Disminuir cantidad"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="px-3.5 py-2 text-sm transition-colors hover:bg-foreground/5"
            >
              −
            </button>
            <span className="min-w-10 text-center text-sm tabular-nums">{quantity}</span>
            <button
              type="button"
              aria-label="Aumentar cantidad"
              disabled={quantity >= stock}
              onClick={() => setQuantity((value) => Math.min(stock, value + 1))}
              className="px-3.5 py-2 text-sm transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-30"
            >
              +
            </button>
          </div>
          <p className="text-[11px] tabular-nums text-taupe/60">
            Quedan {stock}
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleAdd}
        className="mt-6 w-full border border-foreground/20 bg-foreground py-3.5 text-[11px] uppercase tracking-[0.3em] text-background transition-all duration-300 hover:bg-cream hover:text-background hover:border-cream active:scale-[0.98]"
      >
        Añadir al carrito
      </button>
      {feedback === "error" ? (
        <p className="mt-3 text-center text-xs text-accent">
          {size ? "Esta talla está agotada en este momento." : "Elige una talla para continuar."}
        </p>
      ) : null}
      {feedback === "added" ? (
        <p className="mt-3 text-center text-xs text-foreground/50">
          {product.name} (talla {size}) está en tu carrito.
        </p>
      ) : null}

      {inCart ? (
        <button
          type="button"
          onClick={() => changeQuantity(lineKey, inCart.quantity + quantity, () => variant?.quantity ?? 0)}
          className="mt-2 w-full border border-line py-3 text-[11px] uppercase tracking-[0.3em] text-foreground/50 transition-all duration-300 hover:border-foreground/40 hover:text-foreground"
        >
          Añadir otra unidad
        </button>
      ) : null}
    </div>
  );
}