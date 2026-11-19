import { pricing } from "@/config/site";

export type TemplateId = "classique" | "moderne" | "minimal" | "elegant";

export const TEMPLATES: { id: TemplateId; name: string; blurb: string; pro: boolean }[] = [
  { id: "classique", name: "Classique", blurb: "Sobre et lisible, l'incontournable.", pro: false },
  { id: "moderne", name: "Moderne", blurb: "Bandeau de couleur et grands chiffres.", pro: true },
  { id: "minimal", name: "Minimal", blurb: "Beaucoup d'air, typographie fine.", pro: true },
  { id: "elegant", name: "Élégant", blurb: "Serif éditorial, ton premium.", pro: true },
];

export const FREE_INVOICES_PER_MONTH = pricing.freeInvoicesPerMonth;

export const isPro = (u: { plan: string }) => u.plan === "pro";

export const templateAllowed = (id: string, pro: boolean) =>
  TEMPLATES.some((t) => t.id === id && (pro || !t.pro));
