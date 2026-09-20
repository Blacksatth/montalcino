"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProductAction } from "@/app/admin/(panel)/productos/actions";

export function ProductRowActions({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function remove() {
    setError("");
    if (!window.confirm(`¿Eliminar el producto "${name}"?`)) return;
    startTransition(async () => {
      const result = await deleteProductAction(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error ? (
        <p role="alert" className="text-xs text-accent">
          {error}
        </p>
      ) : null}
      <Link
        href={`/admin/productos/${id}`}
        className="text-sm text-foreground underline-offset-2 transition-colors hover:text-accent"
      >
        Editar
      </Link>
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