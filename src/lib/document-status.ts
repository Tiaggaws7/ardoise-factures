import type { DocumentRow } from "@/db/schema";
import { todayISO } from "./dates";

export type DisplayStatus =
  | "draft"
  | "sent"
  | "overdue"
  | "paid"
  | "accepted"
  | "declined"
  | "expired"
  | "invoiced";

export const STATUS_LABEL: Record<DisplayStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  overdue: "En retard",
  paid: "Payée",
  accepted: "Accepté",
  declined: "Refusé",
  expired: "Expiré",
  invoiced: "Facturé",
};

/** Le retard est calculé (échéance dépassée), jamais stocké : toujours exact. */
export function displayStatus(
  d: Pick<DocumentRow, "type" | "status" | "dueDate">,
  invoicedQuoteIds?: Set<string> & { has(id: string): boolean },
  id?: string,
): DisplayStatus {
  const today = todayISO();
  if (d.type === "invoice") {
    if (d.status === "paid") return "paid";
    if (d.status === "draft") return "draft";
    return d.dueDate < today ? "overdue" : "sent";
  }
  if (id && invoicedQuoteIds?.has(id)) return "invoiced";
  if (d.status === "accepted") return "accepted";
  if (d.status === "declined") return "declined";
  if (d.status === "draft") return "draft";
  return d.dueDate < today ? "expired" : "sent";
}

export const invoiceStatusLabel = (s: DisplayStatus, type: "quote" | "invoice") =>
  type === "invoice" && s === "sent" ? "Envoyée" : STATUS_LABEL[s];
