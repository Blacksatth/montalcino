"use client";

import { useActionState } from "react";
import { inputClass, inputLabelClass } from "@/components/admin/formClasses";
import type { CategoryActionResult } from "@/app/admin/(panel)/categorias/actions";

interface CategoryFormProps {
  action: (previous: CategoryActionResult, formData: FormData) => Promise<CategoryActionResult>;
  initial?: { name: string; slug: string; order: number };
}

const initialState: CategoryActionResult = { ok: true };

export function CategoryForm({ action, initial }: CategoryFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  return (
    <form action={formAction} className="max-w-md space-y-5">
      <div>
        <label htmlFor="name" className={inputLabelClass}>
          Nombre
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={initial?.name}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="slug" className={inputLabelClass}>
          Slug (opcional)
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={initial?.slug}
          placeholder="ej. camisas"
          className={inputClass}
        />
      </div>
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
    </form>
  );
}
