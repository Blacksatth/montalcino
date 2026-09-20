"use client";

import type { Product } from "@/types";

export function SizeSelector({
  sizes,
  selected,
  onChange,
}: {
  sizes: Product["sizes"];
  selected: string;
  onChange: (size: string) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {sizes.map((variant) => {
        const unavailable = variant.quantity <= 0;
        const isSelected = selected === variant.size;
        return (
          <button
            key={variant.size}
            type="button"
            onClick={() => onChange(variant.size)}
            aria-pressed={isSelected}
            disabled={unavailable}
            className={`min-w-[44px] px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] transition-all duration-200 ${
              isSelected
                ? "border border-foreground bg-foreground text-background"
                : "border border-line text-foreground/70 hover:border-foreground/50 hover:text-foreground"
            } ${unavailable ? "cursor-not-allowed border-line/40 text-foreground/15 line-through" : ""}`}
          >
            {variant.size}
          </button>
        );
      })}
    </div>
  );
}