"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { EmptyState } from "@/components/public/EmptyState";
import { useCart } from "@/components/public/CartProvider";
import { cartKey } from "@/lib/cart";
import { formatCOP } from "@/lib/money";
import type { Product } from "@/types";

export function CartView({
  products,
  shippingFlatRate,
}: {
  products: Product[];
  shippingFlatRate: number;
}) {
  const { cart, count, subtotal, changeQuantity, removeLine } = useCart();

  const stockOf = useCallback(
    (productId: string, size: string) => {
      const product = products.find((item) => item.id === productId);
      return product?.sizes.find((variant) => variant.size === size)?.quantity ?? 0;
    },
    [products],
  );

  const total = subtotal + (cart.length > 0 ? shippingFlatRate : 0);

  const lines = useMemo(
    () =>
      cart.map((line) => {
        const product = products.find((item) => item.id === line.productId);
        return {
          line,
          key: cartKey(line.productId, line.size),
          available: product !== undefined,
          stock: stockOf(line.productId, line.size),
        };
      }),
    [cart, products, stockOf],
  );

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <EmptyState title="Tu carrito está vacío" hint="Explora las colecciones y agrega tus piezas." />
        <div className="pt-2 text-center">
          <Link
            href="/buscar"
            className="inline-block border border-line px-6 py-3 text-sm uppercase tracking-widest transition-all duration-300 hover:border-foreground/50 hover:bg-foreground/[0.03]"
          >
            Explorar la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-line" />
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-taupe/50">Tu selección</p>
          <h1 className="mt-1 font-serif text-4xl">Tu carrito</h1>
          <p className="mt-1 text-sm text-taupe">
            {count} {count === 1 ? "pieza" : "piezas"} — verifica tu pedido antes de finalizar.
          </p>
        </div>
        <div className="h-px flex-1 bg-line" />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-line">
          {lines.map(({ line, key, available, stock }) => {
            const atMax = stock > 0 && line.quantity >= stock;
            const outOfStock = stock === 0;
            return (
              <li key={key} className="flex gap-5 py-6 first:pt-0 last:pb-0">
                <Link
                  href={`/producto/${line.slug}`}
                  className={`relative block h-36 w-28 shrink-0 overflow-hidden border bg-surface-soft ${
                    available ? "border-line" : "border-line/60"
                  }`}
                >
                  {line.image ? (
                    <Image
                      src={line.image}
                      alt={line.name}
                      width={200}
                      height={260}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                    />
                  ) : null}
                  {outOfStock && (
                    <span className="absolute inset-0 flex items-center justify-center bg-background/70 text-[9px] uppercase tracking-widest text-taupe">
                      Sin stock
                    </span>
                  )}
                </Link>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/producto/${line.slug}`}
                        className="font-serif text-lg leading-tight hover:underline"
                      >
                        {line.name}
                      </Link>
                      <p className="pt-1 text-xs uppercase tracking-widest text-taupe">
                        Talla {line.size}
                      </p>
                    </div>
                    <p className="shrink-0 text-right font-serif text-lg tabular-nums">
                      {formatCOP(line.price * line.quantity)}
                      <span className="block pt-0.5 text-[10px] font-sans uppercase tracking-widest text-taupe/50">
                        {formatCOP(line.price)} c/u
                      </span>
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-full border border-line text-sm">
                      <button
                        type="button"
                        aria-label={`Quitar uno a ${line.name}`}
                        disabled={line.quantity <= 1}
                        onClick={() => changeQuantity(key, line.quantity - 1, stockOf)}
                        className="grid size-8 place-items-center transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="min-w-9 text-center tabular-nums">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Añadir uno a ${line.name}`}
                        disabled={available ? atMax : false}
                        onClick={() => changeQuantity(key, line.quantity + 1, stockOf)}
                        className="grid size-8 place-items-center transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(key)}
                      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-taupe underline-offset-2 transition-colors hover:text-foreground hover:underline"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                      </svg>
                      Quitar
                    </button>
                  </div>

                  {!available ? (
                    <p className="pt-2 text-xs text-accent">
                      Esta pieza ya no está disponible y se retirará del carrito.
                    </p>
                  ) : outOfStock ? (
                    <p className="pt-2 text-xs text-accent">Sin stock — elige otra talla.</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit border border-line bg-surface-soft/40 p-6">
          <h2 className="font-serif text-xl">Resumen del pedido</h2>
          <dl className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-taupe">Subtotal</dt>
              <dd className="tabular-nums">{formatCOP(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-taupe">Envío</dt>
              <dd className="tabular-nums">
                {shippingFlatRate === 0 ? (
                  <span className="text-accent">Gratis</span>
                ) : (
                  formatCOP(shippingFlatRate)
                )}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 font-serif text-lg">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatCOP(total)}</dd>
            </div>
          </dl>

          <button
            type="button"
            disabled
            className="mt-6 w-full cursor-not-allowed bg-foreground py-3.5 text-[11px] uppercase tracking-[0.3em] text-background opacity-60"
          >
            Finalizar compra
          </button>

          <div className="mt-4 border border-line bg-background p-3.5">
            <p className="flex items-start gap-2.5 text-xs leading-relaxed text-taupe">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0" aria-hidden>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              El pago con MercadoPago estará disponible próximamente.
            </p>
          </div>

          <p className="mt-4 text-center text-[10px] uppercase tracking-[0.25em] text-taupe/40">
            Envíos solo dentro de Colombia
          </p>
        </aside>
      </div>
    </div>
  );
}