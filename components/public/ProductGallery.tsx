"use client";

import Image from "next/image";
import { useState } from "react";
import type { CloudImage } from "@/types";

export function ProductGallery({ images, name }: { images: CloudImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const image = images[active];
  const hasThumbs = images.length > 1;

  function go(delta: number) {
    setActive((current) => Math.min(images.length - 1, Math.max(0, current + delta)));
  }

  return (
    <div>
      <div className="relative aspect-[3/4] overflow-hidden border border-line bg-surface-soft">
        {image ? (
          <Image
            key={image.publicId}
            src={image.url}
            alt={`${name} — foto ${active + 1} de ${images.length}`}
            width={800}
            height={1067}
            sizes="(min-width: 768px) 50vw, 100vw"
            priority={active === 0}
            className="h-full w-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[11px] uppercase tracking-widest text-taupe/50">
            Sin imagen
          </div>
        )}

        {hasThumbs ? (
          <>
            <div className="absolute left-3 top-3 border border-line bg-background/85 px-2.5 py-1 text-[9px] uppercase tracking-[0.25em] text-foreground/60 backdrop-blur-sm">
              {active + 1} / {images.length}
            </div>
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                disabled={active === 0}
                aria-label="Foto anterior"
                className="grid size-11 place-items-center border border-line bg-background/85 text-foreground/70 backdrop-blur-sm transition-colors hover:border-foreground/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                disabled={active === images.length - 1}
                aria-label="Foto siguiente"
                className="grid size-11 place-items-center border border-line bg-background/85 text-foreground/70 backdrop-blur-sm transition-colors hover:border-foreground/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </>
        ) : null}
      </div>

      {hasThumbs ? (
        <div className="mt-3 grid grid-cols-4 gap-3" role="group" aria-label="Galería de imágenes">
          {images.map((thumbnail, index) => {
            const isActive = index === active;
            return (
              <button
                key={thumbnail.publicId}
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={isActive}
                aria-label={`Ver foto ${index + 1}`}
                className="group relative aspect-[3/4] overflow-hidden border bg-surface-soft transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Image
                  src={thumbnail.url}
                  alt=""
                  width={200}
                  height={267}
                  sizes="(min-width: 768px) 12vw, 24vw"
                  className={`h-full w-full object-cover transition-all duration-300 ${
                    isActive ? "opacity-100" : "opacity-55 group-hover:opacity-80"
                  }`}
                />
                <span
                  aria-hidden
                  className={`absolute inset-0 transition-colors duration-200 ${
                    isActive ? "ring-2 ring-inset ring-foreground" : "ring-1 ring-inset ring-line"
                  }`}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}