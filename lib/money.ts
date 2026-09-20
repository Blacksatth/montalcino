const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCOP(value: number): string {
  return copFormatter.format(Math.round(value)).replace(/[\s\u00A0]/g, "");
}

export function parsePrice(input: string): number {
  const digits = input.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}