"use client";

import { useActionState, useRef } from "react";
import { deleteCategoryAction } from "@/app/admin/(panel)/categorias/actions";
import type { CategoryActionResult } from "@/app/admin/(panel)/categorias/actions";

const initialState: CategoryActionResult = { ok: true };

export function DeleteCategoryButton({ id, label }: { id: string; label: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    deleteCategoryAction.bind(null, id),
    initialState,
  );

  return (
    <form ref={formRef} action={formAction} className="inline">
      {"error" in state && state.error ? (
        <p className="mb-1 text-xs text-accent">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        onClick={(event) => {
          if (!window.confirm(`¿Eliminar "${label}"?`)) {
            event.preventDefault();
          }
        }}
        className="text-sm text-taupe underline-offset-2 transition-colors hover:text-accent disabled:opacity-60"
      >
        Eliminar
      </button>
    </form>
  );
}
