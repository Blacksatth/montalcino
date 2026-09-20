"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useCart } from "@/components/public/CartProvider";
import { SearchBar } from "@/components/public/SearchBar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

function SearchFallback() {
  return (
    <input
      type="search"
      placeholder="Buscar piezas…"
      aria-label="Buscar en la tienda"
      disabled
      className="w-full rounded-full border border-line bg-transparent px-4 py-2 text-xs text-foreground placeholder:text-taupe/50"
    />
  );
}

function CartButton() {
  const { count, openDrawer } = useCart();
  return (
    <button
      type="button"
      onClick={openDrawer}
      className="grid size-9 place-items-center rounded-full border border-line text-foreground/70 transition-colors hover:border-foreground/40 hover:text-foreground"
      aria-label={`Abrir carrito, ${count} ${count === 1 ? "pieza" : "piezas"}`}
    >
      <span className="relative">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -right-2 -top-1.5 grid size-4 place-items-center rounded-full bg-accent text-[9px] font-semibold text-background">
            {count}
          </span>
        )}
      </span>
    </button>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="shrink-0 font-serif text-xl tracking-[0.15em] text-foreground transition-colors hover:text-foreground/70"
        >
          Montalchino
        </Link>

        <nav className="ml-8 hidden items-center gap-7 text-[11px] uppercase tracking-[0.2em] text-foreground/50 sm:flex">
          <Link href="/" className="relative py-1 transition-colors hover:text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-foreground/60 after:transition-transform after:duration-300 hover:after:scale-x-100">
            Colecciones
          </Link>
          <Link href="/buscar" className="relative py-1 transition-colors hover:text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-foreground/60 after:transition-transform after:duration-300 hover:after:scale-x-100">
            Explorar
          </Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <div className="hidden w-44 sm:block">
            <Suspense fallback={<SearchFallback />}>
              <SearchBar />
            </Suspense>
          </div>

          <Link href="/buscar" className="grid size-9 place-items-center rounded-full border border-line text-foreground/70 transition-colors hover:border-foreground/40 hover:text-foreground sm:hidden" aria-label="Buscar">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>

          <CartButton />

          <div className="ml-1">
            <ThemeToggle compact />
          </div>
        </div>
      </div>
    </header>
  );
}