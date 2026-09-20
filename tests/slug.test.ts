import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("convierte a minúsculas y espacios a guiones", () => {
    expect(slugify("Camisa Cuadros Montalchino")).toBe("camisa-cuadros-montalchino");
  });

  it("quita acentos y mantiene ñ normalizada", () => {
    expect(slugify("Añoranza Café")).toBe("anoranza-cafe");
    expect(slugify("Estación Árbol")).toBe("estacion-arbol");
  });

  it("elimina caracteres especiales y colapsa guiones", () => {
    expect(slugify("Olivia!!! — Edición #2 (Limited)")).toBe("olivia-edicion-2-limited");
  });

  it("trima guiones al inicio y final", () => {
    expect(slugify("  camisa  ")).toBe("camisa");
  });

  it("devuelve cadena vacía si no queda nada válido", () => {
    expect(slugify("¿¡?!")).toBe("");
  });
});