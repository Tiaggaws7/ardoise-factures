import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { clients, documents, type DocumentRow } from "@/db/schema";
import { computeTotals } from "./money";
import { displayStatus, type DisplayStatus } from "./document-status";

export type DocView = DocumentRow & {
  clientName: string;
  total: number;
  display: DisplayStatus;
};

export async function listDocuments(userId: string): Promise<DocView[]> {
  const db = await getDb();
  const rows = await db
    .select({ doc: documents, clientName: clients.name })
    .from(documents)
    .innerJoin(clients, eq(clients.id, documents.clientId))
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.issueDate), desc(documents.createdAt));
  const invoiced = new Set(rows.map((r) => r.doc.sourceQuoteId).filter((x): x is string => Boolean(x)));
  return rows.map(({ doc, clientName }) => ({
    ...doc,
    clientName,
    total: computeTotals(doc.items, doc.vatRate).total,
    display: displayStatus(doc, invoiced, doc.id),
  }));
}
