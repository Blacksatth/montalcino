"use client";

import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { getClientAuth } from "@/lib/firebase/client";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function exchangeSession(idToken: string) {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (response.status === 403) {
      setError("Tu correo no está autorizado para el panel de Montalchino.");
      return;
    }
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "No se pudo iniciar la sesión.");
      return;
    }
    router.replace(next.startsWith("/admin") ? next : "/admin");
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const auth = getClientAuth();
    if (!auth) {
      setError("El panel requiere configuración de Firebase en las variables de entorno.");
      return;
    }
    setBusy(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();
      await exchangeSession(idToken);
    } catch {
      setError("El correo o la contraseña son incorrectos.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError("");
    const auth = getClientAuth();
    if (!auth) {
      setError("El panel requiere configuración de Firebase en las variables de entorno.");
      return;
    }
    setBusy(true);
    try {
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      const idToken = await credential.user.getIdToken();
      await exchangeSession(idToken);
    } catch {
      setError("No se pudo iniciar sesión con Google.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="email" className="text-xs uppercase tracking-widest text-taupe">
          Correo
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full border border-foreground/20 bg-transparent px-3 py-2 text-foreground focus:border-foreground focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-xs uppercase tracking-widest text-taupe">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full border border-foreground/20 bg-transparent px-3 py-2 text-foreground focus:border-foreground focus:outline-none"
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full bg-foreground py-3 text-sm uppercase tracking-widest text-background transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {busy ? "Ingresando…" : "Ingresar"}
      </button>
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-foreground/20" />
        <span className="text-xs text-taupe">o continúa con tu correo de Google</span>
        <span className="h-px flex-1 bg-foreground/20" />
      </div>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={busy}
        className="w-full border border-foreground/25 py-3 text-sm uppercase tracking-widest text-foreground transition-colors hover:border-foreground disabled:opacity-60"
      >
        Continuar con Google
      </button>
    </form>
  );
}