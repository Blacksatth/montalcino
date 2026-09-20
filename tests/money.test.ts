import { describe, expect, it } from "vitest";
import { formatCOP, parsePrice } from "@/lib/money";

describe("formatCOP", () => {
  it("formatea enteros COP con separador de miles y símbolo", () => {
    expect(formatCOP(1200000)).toBe("$1.200.000");
  });

  it("no muestra decimales", () => {
    expect(formatCOP(50000)).toBe("$50.000");
  });

  it("redondea a entero", () => {
    expect(formatCOP(19999.6)).toBe("$20.000");
  });

  it("formatea cero", () => {
    expect(formatCOP(0)).toBe("$0");
  });
});

describe("parsePrice", () => {
  it("parsea entrada con separadores, símbolo y texto", () => {
    expect(parsePrice("$ 1.200.000 COP")).toBe(1200000);
  });

  it("parsea entrada sin separadores", () => {
    expect(parsePrice("50000")).toBe(50000);
  });

  it("devuelve 0 ante una entrada vacía o sin dígitos", () => {
    expect(parsePrice("")).toBe(0);
    expect(parsePrice("ninguno")).toBe(0);
  });
});