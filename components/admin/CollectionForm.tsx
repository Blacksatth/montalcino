"use client";

import { useActionState, useState } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { inputClass, inputLabelClass } from "@/components/admin/formClasses";
import type { CloudImage } from "@/types";
import type { CollectionActionResult } from "@/app/admin/(panel)/colecciones/actions";

interface CollectionFormProps {
  action: (previous: CollectionActionResult, formData: FormData) => Promise<CollectionActionResult>;
  initial?: {
    name: string;
    slug: string;
    description: string;
    order: number;
    active: boolean;
    heroPublicId?: string;
    heroUrl?: string;
  };
}

const initialState: CollectionActionResult = { ok: true };

export function CollectionForm({ action, initial }: CollectionFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [hero, setHero] = useState<CloudImage>({
    publicId: initial?.heroPublicId ?? "",
    url: initial?.heroUrl ?? "",
  });

  function handleUploaded(image: CloudImage) {
    setHero(image);
  }

  return (
    <form action={formAction} className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className={inputLabelClass}>
                Nombre
              </label>
              <input id="name" name="name" required defaultValue={initial?.name} className={inputClass} />
            </div>
            <div>
              <label htmlFor="slug" className={inputLabelClass}>
                Slug (opcional)
              </label>
              <input
                id="slug"
                name="slug"
                defaultValue={initial?.slug}
                placeholder="ej. la-primera-edicion"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className={inputLabelClass}>
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={initial?.description}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="order" className={inputLabelClass}>
                Orden
              </label>
              <input
                id="order"
                name="order"
                type="number"
                required
                defaultValue={initial?.order ?? 0}
                className={inputClass}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={initial?.active ?? true}
                  className="h-4 w-4 accent-foreground"
                />
                Visible en la tienda
              </label>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="heroPublicId" className={inputLabelClass}>
                Public ID
              </label>
              <input
                id="heroPublicId"
                name="heroPublicId"
                value={hero.publicId}
                onChange={(event) => setHero((prev) => ({ ...prev, publicId: event.target.value }))}
                placeholder="carpeta/imagen"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="heroUrl" className={inputLabelClass}>
                URL de la imagen
              </label>
              <input
                id="heroUrl"
                name="heroUrl"
                value={hero.url}
                onChange={(event) => setHero((prev) => ({ ...prev, url: event.target.value }))}
                placeholder="https://res.cloudinary.com/…"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {"error" in state && state.error ? (
              <p role="alert" className="text-sm text-accent">
                {state.error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="bg-foreground px-6 py-3 text-sm uppercase tracking-widest text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="border border-line bg-surface-soft/40 p-4">
            <p className="text-xs uppercase tracking-widest text-taupe">Portada</p>
            <p className="mt-1 text-[11px] text-taupe">
              Esta imagen se muestra como portada de la colección.
            </p>

            {hero.url ? (
              <div className="relative mt-3 aspect-[4/3] overflow-hidden border border-line bg-surface-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hero.url}
                  alt="Vista previa de la portada"
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-1.5 top-1.5 bg-background/85 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-foreground">
                  Vista previa
                </span>
              </div>
            ) : (
              <div className="mt-3 flex aspect-[4/3] items-center justify-center border border-dashed border-line/70 bg-surface-soft/50 px-4 text-center text-xs text-taupe/60">
                Sin portada todavía
              </div>
            )}

            <div className="mt-4">
              <ImageUploader onUploaded={handleUploaded} label="Subir portada" />
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}