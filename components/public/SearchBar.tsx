"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onBuscar = pathname.startsWith("/buscar");
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  function handleChange() {
    const q = inputRef.current?.value.trim() ?? "";
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const current = new URLSearchParams(window.location.search).get("q") ?? "";
      if (!q && !onBuscar) return;
      if (q === current) return;
      router.replace(q ? `/buscar?q=${encodeURIComponent(q)}` : "/buscar", {
        scroll: false,
      });
    }, 250);
  }

  const initial = searchParams.get("q") ?? "";

  return (
    <input
      ref={inputRef}
      key={onBuscar ? "buscar" : "home"}
      type="search"
      defaultValue={initial}
      onChange={handleChange}
      autoFocus={onBuscar}
      placeholder="Buscar piezas…"
      aria-label="Buscar en la tienda"
      className="w-full rounded-full border border-line bg-transparent px-4 py-2 text-xs text-foreground placeholder:text-taupe/50 transition-colors focus:border-foreground/60 focus:outline-none"
    />
  );
}