import type { LineItem } from "@/db/schema";

const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const eurRound = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const nb = (s: string) => s.replace(/\u202f/g, "\u00a0");
export const formatEUR = (cents: number) => nb(eur.format(cents / 100));
export const formatEURRound = (cents: number) => nb(eurRound.format(cents / 100));

/** Version « police PDF » : espaces insécables fines remplacées (absentes des polices embarquées). */
export const formatEURPdf = (cents: number) =>
  eur.format(cents / 100).replace(/[  ]/g, " ");

/** Taux de TVA stockés ×10 : 200 = 20 %, 55 = 5,5 %. */
export const VAT_RATES = [
  { value: 0, label: "0 %" },
  { value: 21, label: "2,1 %" },
  { value: 55, label: "5,5 %" },
  { value: 100, label: "10 %" },
  { value: 200, label: "20 %" },
] as const;

export const formatVatRate = (rate: number) =>
  `${(rate / 10).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;

export const lineTotal = (l: LineItem) => Math.round(l.quantity * l.unitPriceCents);

export function computeTotals(items: LineItem[], vatRate: number) {
  const subtotal = items.reduce((s, l) => s + lineTotal(l), 0);
  const vat = Math.round((subtotal * vatRate) / 1000);
  return { subtotal, vat, total: subtotal + vat };
}

/** "12,5" ou "12.50" → centimes. */
export function parseEuroToCents(input: string | number): number {
  if (typeof input === "number") return Math.round(input * 100);
  const n = Number(input.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}
