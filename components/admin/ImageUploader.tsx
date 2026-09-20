"use client";

import { useRef, useState } from "react";
import type { CloudImage } from "@/types";

interface SignResponse {
  timestamp: number;
  folder: string;
  signature: string;
  cloudName: string;
  apiKey: string;
}

interface ImageUploaderProps {
  label?: string;
  onUploaded: (image: CloudImage) => void;
  accept?: string;
}

export function ImageUploader({ label = "Subir imagen", onUploaded, accept = "image/*" }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(file: File) {
    setError("");
    setBusy(true);
    try {
      const signRes = await fetch("/api/cloudinary/sign", { method: "POST" });
      if (signRes.status === 401) {
        setError("Tu sesión expiró. Vuelve a iniciar sesión.");
        return;
      }
      if (!signRes.ok) {
        setError("No se pudo preparar la subida a Cloudinary.");
        return;
      }
      const sign = (await signRes.json()) as SignResponse;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sign.apiKey);
      formData.append("timestamp", String(sign.timestamp));
      formData.append("folder", sign.folder);
      formData.append("signature", sign.signature);

      const upRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`,
        { method: "POST", body: formData },
      );
      if (!upRes.ok) {
        setError("La imagen no se pudo subir a Cloudinary.");
        return;
      }
      const data = (await upRes.json()) as {
        public_id?: string;
        secure_url?: string;
      };
      if (!data.public_id || !data.secure_url) {
        setError("La respuesta de Cloudinary no incluye la imagen.");
        return;
      }
      onUploaded({ publicId: data.public_id, url: data.secure_url });
    } catch {
      setError("Error inesperado al subir la imagen.");
    } finally {
      setBusy(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleChange(file);
        }}
        className="sr-only"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="border border-line px-4 py-2 text-sm uppercase tracking-widest text-foreground transition-colors hover:border-foreground disabled:opacity-60"
      >
        {busy ? "Subiendo…" : label}
      </button>
      {error ? (
        <p role="alert" className="mt-1 text-xs text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}
