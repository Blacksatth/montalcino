"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart } from "@/components/public/CartProvider";
import { formatCOP } from "@/lib/money";
import { cartKey } from "@/lib/cart";

export function CartDrawer() {
  const { cart, count, subtotal, isDrawerOpen, closeDrawer, changeQuantity, removeLine } =
    useCart();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!isDrawerOpen) {
      const resetId = requestAnimationFrame(() => setEntered(false));
      return () => cancelAnimationFrame(resetId);
    }
    const raf = requestAnimationFrame(() => setEntered(true));

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Carrito">
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={closeDrawer}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto border-l border-line bg-background shadow-xl transition-transform duration-300 ease-out ${
          entered ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-serif text-lg">
            Tu carrito
            {count > 0 && (
              <span className="ml-1.5 text-[10px] font-sans uppercase tracking-widest text-taupe/50">
                ({count})
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Cerrar"
            className="rounded-full p-1.5 text-taupe transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M2 2l12 12M14 2 2 14"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-serif text-2xl">Tu carrito está vacío</p>
            <p className="text-sm text-taupe">Explora las colecciones y agrega tus piezas.</p>
            <Link
                href="/buscar"
                onClick={closeDrawer}
                className="mt-3 inline-block border border-line px-8 py-2.5 text-[11px] uppercase tracking-[0.3em] transition-all duration-300 hover:border-foreground/50 hover:bg-foreground/[0.03]"
              >
                Explorar la tienda
              </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line px-6">
              {cart.map((line) => {
                const key = cartKey(line.productId, line.size);
                const stock = line.maxQty ?? 9999;
                const atMax = line.quantity >= stock;
                const outOfStock = stock === 0;
                const stockOfLine = () => stock;

                return (
                  <li key={key} className="flex gap-4 py-5 first:pt-0">
                    <Link
                      href={`/producto/${line.slug}`}
                      onClick={closeDrawer}
                      className="relative block h-24 w-20 shrink-0 overflow-hidden rounded-md bg-foreground/5"
                    >
                      {line.image ? (
                        <Image
                          src={line.image}
                          alt={line.name}
                          width={160}
                          height={200}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                      {outOfStock && (
                        <span className="absolute inset-0 flex items-center justify-center bg-background/70 text-[9px] uppercase tracking-widest text-taupe">
                          Sin stock
                        </span>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col">
                      <Link
                        href={`/producto/${line.slug}`}
                        onClick={closeDrawer}
                        className="font-serif text-base leading-tight hover:underline"
                      >
                        {line.name}
                      </Link>
                      <p className="pt-0.5 text-xs text-taupe">
                        Talla {line.size} · {formatCOP(line.price)}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center rounded-md border border-line text-sm">
                          <button
                            type="button"
                            aria-label={`Quitar uno de ${line.name}`}
                            disabled={line.quantity <= 1}
                            onClick={() => changeQuantity(key, line.quantity - 1, stockOfLine)}
                            className="px-2.5 py-1 transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            −
                          </button>
                          <span className="min-w-8 text-center tabular-nums">{line.quantity}</span>
                          <button
                            type="button"
                            aria-label={`Añadir uno a ${line.name}`}
                            disabled={atMax}
                            onClick={() => changeQuantity(key, line.quantity + 1, stockOfLine)}
                            className="px-2.5 py-1 transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLine(key)}
                          className="text-xs uppercase tracking-widest text-taupe underline-offset-2 hover:text-foreground hover:underline"
                        >
                          Quitar
                        </button>
                      </div>
                      {outOfStock && (
                        <p className="pt-1.5 text-xs text-accent">Ya no disponible</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

              <div className="border-t border-line px-6 py-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-taupe/50">
                    Subtotal ({count} {count === 1 ? "pieza" : "piezas"})
                  </span>
                  <span className="font-serif text-lg tabular-nums">{formatCOP(subtotal)}</span>
                </div>
                <p className="pt-1 text-[10px] text-taupe/40">
                  El envío se calcula en el siguiente paso.
                </p>
                <Link
                  href="/carrito"
                  onClick={closeDrawer}
                  className="mt-4 block w-full bg-foreground py-3 text-center text-[11px] uppercase tracking-[0.3em] text-background transition-all duration-300 hover:bg-foreground/90"
                >
                  Ver carrito y finalizar
                </Link>
                <Link
                  href="/buscar"
                  onClick={closeDrawer}
                  className="mt-2 block w-full border border-line py-3 text-center text-[11px] uppercase tracking-[0.3em] text-taupe transition-all duration-300 hover:border-foreground/50 hover:text-foreground"
                >
                  Seguir explorando
                </Link>
              </div>
          </>
        )}
      </aside>
    </div>
  );
}