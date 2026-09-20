"use client";

import { useActionState, useState } from "react";
import type { FormEvent } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { inputClass, inputLabelClass } from "@/components/admin/formClasses";
import { parsePrice } from "@/lib/money";
import type { CloudImage, SizeVariant } from "@/types";
import type { ProductActionResult } from "@/app/admin/(panel)/productos/actions";

interface ProductFormProps {
  action: (previous: ProductActionResult, formData: FormData) => Promise<ProductActionResult>;
  collections: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  initial?: {
    name: string;
    slug: string;
    description: string;
    price: number;
    collectionId: string;
    categoryId: string;
    sizes: SizeVariant[];
    images: CloudImage[];
    featured: boolean;
    active: boolean;
  };
}

const initialState: ProductActionResult = { ok: true };

export function ProductForm({ action, collections, categories, initial }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [sizes, setSizes] = useState<SizeVariant[]>(initial?.sizes ?? []);
  const [images, setImages] = useState<CloudImage[]>(initial?.images ?? []);

  function addSize() {
    setSizes((prev) => [...prev, { size: "", quantity: 0 }]);
  }
  function updateSize(index: number, patch: Partial<SizeVariant>) {
    setSizes((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }
  function removeSize(index: number) {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  }
  function moveImage(index: number, delta: number) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const hidden = event.currentTarget;
    const sizesField = hidden.querySelector<HTMLInputElement>("input[name=sizesJson]");
    const imagesField = hidden.querySelector<HTMLInputElement>("input[name=imagesJson]");
    if (sizesField) sizesField.value = JSON.stringify(sizes);
    if (imagesField) imagesField.value = JSON.stringify(images);
  }

  const price = parsePrice(String(initial?.price ?? ""));

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
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
                placeholder="ej. camisa-olivia"
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

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="price" className={inputLabelClass}>
                Precio (COP)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min={0}
                required
                defaultValue={price > 0 ? price : ""}
                placeholder="150000"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="collectionId" className={inputLabelClass}>
                Colección
              </label>
              <select
                id="collectionId"
                name="collectionId"
                defaultValue={initial?.collectionId ?? ""}
                className={inputClass}
              >
                <option value="">Selecciona…</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="categoryId" className={inputLabelClass}>
                Categoría
              </label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={initial?.categoryId ?? ""}
                className={inputClass}
              >
                <option value="">Selecciona…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={initial?.featured ?? false}
                className="h-4 w-4 accent-foreground"
              />
              Destacado en la tienda
            </label>
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

          <fieldset className="border border-line p-4">
            <legend className="px-1 text-xs uppercase tracking-widest text-taupe">
              Tallas y stock
            </legend>
            {sizes.length === 0 ? (
              <p className="text-sm text-taupe">Añade al menos una talla.</p>
            ) : null}
            <ul className="space-y-2">
              {sizes.map((variant, index) => (
                <li key={index} className="flex items-center gap-3">
                  <input
                    aria-label={`Talla ${index + 1}`}
                    value={variant.size}
                    onChange={(event) => updateSize(index, { size: event.target.value })}
                    placeholder="Talla (S, M, L…)"
                    className="w-32 border border-line bg-transparent px-3 py-2 text-foreground focus:border-foreground focus:outline-none"
                  />
                  <input
                    aria-label={`Cantidad ${index + 1}`}
                    type="number"
                    min={0}
                    value={variant.quantity}
                    onChange={(event) => updateSize(index, { quantity: Number(event.target.value) })}
                    placeholder="Stock"
                    className="w-24 border border-line bg-transparent px-3 py-2 text-foreground focus:border-foreground focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeSize(index)}
                    className="text-sm text-taupe hover:text-accent"
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={addSize}
              className="mt-3 border border-line px-4 py-2 text-sm uppercase tracking-widest text-foreground transition-colors hover:border-foreground"
            >
              + Añadir talla
            </button>
          </fieldset>

          <input type="hidden" name="sizesJson" />
          <input type="hidden" name="imagesJson" />

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
              {pending ? "Guardando…" : "Guardar producto"}
            </button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="border border-line bg-surface-soft/40 p-4">
            <p className="text-xs uppercase tracking-widest text-taupe">Imágenes</p>
            <p className="mt-1 text-[11px] leading-relaxed text-taupe">
              La primera imagen es la portada del producto. Usa las flechas para reordenar.
            </p>

            {images.length === 0 ? (
              <div className="mt-3 flex aspect-[3/4] items-center justify-center border border-dashed border-line/70 bg-surface-soft/50 px-4 text-center text-xs text-taupe/60">
                Sin imágenes todavía
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {images.map((image, index) => (
                  <div
                    key={`${image.publicId}-${index}`}
                    className="group relative aspect-[3/4] overflow-hidden border border-line bg-surface-soft"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt={`Imagen ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-1.5 top-1.5 bg-background/85 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-foreground">
                      {index === 0 ? "Portada" : `Imagen ${index + 1}`}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-2 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                      <div className="flex gap-0.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveImage(index, -1)}
                          aria-label={`Mover imagen ${index + 1} una posición antes`}
                          className="grid size-6 place-items-center rounded-sm bg-white/10 text-white hover:bg-white/25 disabled:opacity-30"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          disabled={index === images.length - 1}
                          onClick={() => moveImage(index, 1)}
                          aria-label={`Mover imagen ${index + 1} una posición después`}
                          className="grid size-6 place-items-center rounded-sm bg-white/10 text-white hover:bg-white/25 disabled:opacity-30"
                        >
                          ›
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                        aria-label={`Quitar imagen ${index + 1}`}
                        className="grid size-6 place-items-center rounded-sm bg-white/10 text-white hover:bg-white/25"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <ImageUploader
                onUploaded={(image) => setImages((prev) => [...prev, image])}
                label="Subir imagen"
              />
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}