"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getClientAuth } from "@/lib/firebase/client";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    const auth = getClientAuth();
    if (auth) {
      await signOut(auth).catch(() => undefined);
    }
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={busy}
      className="text-sm text-taupe transition-colors hover:text-foreground disabled:opacity-60"
    >
      Salir
    </button>
  );
}