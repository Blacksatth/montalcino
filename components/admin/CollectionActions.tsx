"use client";

import { useRef, useState, useTransition } from "react";
import {
  deleteCollectionAction,
  toggleCollectionActiveAction,
} from "@/app/admin/(panel)/colecciones/actions";

export function CollectionActions({
  id,
  active,
  name,
}: {
  id: string;
  active: boolean;
  name: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const activeRef = useRef<HTMLInputElement>(null);

  function toggle() {
    setError("");
    if (!activeRef.current) return;
    activeRef.current.value = active ? "" : "on";
    startTransition(async () => {
      const result = await toggleCollectionActiveAction(
        id,
        { ok: true },
        new FormData(activeRef.current!.form!),
      );
      if ("error" in result) setError(result.error);
    });
  }

  function remove() {
    setError("");
    if (!window.confirm(`¿Eliminar la colección "${name}"?`)) return;
    startTransition(async () => {
      const result = await deleteCollectionAction(id, { ok: true }, new FormData());
      if ("error" in result) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error ? (
        <p role="alert" className="text-xs text-accent">
          {error}
        </p>
      ) : null}
      <form className="hidden" aria-hidden>
        <input ref={activeRef} name="active" />
      </form>
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        className="text-sm text-taupe underline-offset-2 transition-colors hover:text-foreground disabled:opacity-60"
      >
        {active ? "Ocultar" : "Publicar"}
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={isPending}
        className="text-sm text-taupe underline-offset-2 transition-colors hover:text-accent disabled:opacity-60"
      >
        Eliminar
      </button>
    </div>
  );
}
