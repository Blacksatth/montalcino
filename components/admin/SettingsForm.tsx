"use client";

import { useActionState } from "react";
import type { SettingsActionResult } from "@/app/admin/(panel)/settings/actions";

export function SettingsForm({
  action,
  initialShipping,
}: {
  action: (previous: SettingsActionResult, formData: FormData) => Promise<SettingsActionResult>;
  initialShipping: number;
}) {
  const [state, formAction, pending] = useActionState(action, { ok: true } as SettingsActionResult);
  return (
    <form action={formAction} className="max-w-md space-y-5">
      <div>
        <label htmlFor="shippingFlatRate" className="text-xs uppercase tracking-widest text-taupe">
          Tarifa de envío (COP)
        </label>
        <input
          id="shippingFlatRate"
          name="shippingFlatRate"
          type="number"
          min={0}
          required
          defaultValue={initialShipping}
          placeholder="12000"
          className="mt-1 w-full border border-foreground/20 bg-transparent px-3 py-2 text-foreground focus:border-foreground focus:outline-none"
        />
        <p className="mt-1 text-xs text-taupe">
          Se aplica una sola vez por pedido en el carrito y checkout.
        </p>
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
        {pending ? "Guardando…" : "Guardar ajustes"}
      </button>
    </form>
  );
}
