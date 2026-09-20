import { describe, expect, it } from "vitest";
import { availableSlug, isSlugAvailable } from "@/lib/validation";

const docs = [
  { id: "a", slug: "camisa" },
  { id: "b", slug: "camisa-2" },
];

describe("isSlugAvailable", () => {
  it("devuelve true para un slug libre", () => {
    expect(isSlugAvailable("pantalon", docs)).toBe(true);
  });

  it("devuelve false para un slug en uso", () => {
    expect(isSlugAvailable("camisa", docs)).toBe(false);
  });

  it("ignora el propio documento al validar (edición)", () => {
    expect(isSlugAvailable("camisa", docs, "a")).toBe(true);
  });
});

describe("availableSlug", () => {
  it("devuelve el slug base si está libre", () => {
    expect(availableSlug("Pantalón Lino", docs)).toBe("pantalon-lino");
  });

  it("anexa sufijo numérico si el slug ya existe", () => {
    expect(availableSlug("Camisa", docs)).toBe("camisa-3");
  });

  it("excluye el propio documento al generar", () => {
    expect(availableSlug("Camisa", docs, "a")).toBe("camisa");
  });

  it("asegura un slug válido si el nombre no deja caracteres", () => {
    expect(availableSlug("¿¡?!", docs)).toBe("sin-nombre");
  });
});