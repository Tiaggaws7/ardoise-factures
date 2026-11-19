import "server-only";
import { and, eq, gte, isNotNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  clients,
  documents,
  type Client,
  type DocumentRow,
  type PartySnapshot,
  type Profile,
  type SellerSnapshot,
} from "@/db/schema";
import { addDaysISO, monthStartISO, todayISO } from "./dates";
import { FREE_INVOICES_PER_MONTH } from "./plan";

export function sellerSnapshot(p: Profile): SellerSnapshot {
  const vatMention =
    p.vatRegime === "franchise"
      ? "TVA non applicable, art. 293 B du CGI"
      : p.vatNumber
        ? `N° de TVA intracommunautaire : ${p.vatNumber}`
        : "";
  return {
    name: p.businessName || p.fullName,
    lines: [
      p.businessName && p.fullName && p.businessName !== p.fullName ? p.fullName : "",
      p.address,
      [p.postalCode, p.city].filter(Boolean).join(" "),
    ].filter(Boolean),
    siret: p.siret || null,
    vatNumber: p.vatRegime === "assujetti" ? p.vatNumber || null : null,
    email: p.email || null,
    phone: p.phone || null,
    vatMention,
    iban: p.iban || null,
    bic: p.bic || null,
    logo: p.logo,
    legalFooter: p.legalFooter,
    template: p.template,
  };
}

export function clientSnapshot(c: Client): PartySnapshot {
  return {
    name: c.name,
    lines: [c.contact, c.address, [c.postalCode, c.city].filter(Boolean).join(" ")].filter(Boolean),
    siret: c.siret || null,
    vatNumber: c.vatNumber || null,
    email: c.email || null,
    phone: c.phone || null,
  };
}

/** Nombre de factures émises ce mois-ci (pour la limite de l'offre gratuite). */
export async function invoicesIssuedThisMonth(userId: string): Promise<number> {
  const db = await getDb();
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(documents)
    .where(
      and(
        eq(documents.userId, userId),
        eq(documents.type, "invoice"),
        isNotNull(documents.issuedAt),
        gte(documents.issueDate, monthStartISO()),
      ),
    );
  return row?.n ?? 0;
}

export async function freeLimitReached(userId: string): Promise<boolean> {
  return (await invoicesIssuedThisMonth(userId)) >= FREE_INVOICES_PER_MONTH;
}

/**
 * Émet un brouillon : attribue le numéro suivant de la séquence et fige les
 * identités (vendeur / client). Une SEULE instruction SQL atomique : le compteur
 * n'est incrémenté que si le brouillon existe, donc jamais de trou dans la
 * numérotation (exigence de continuité pour les factures).
 */
export async function issueDraft(
  userId: string,
  doc: DocumentRow,
  profile: Profile,
  client: Client,
): Promise<string | null> {
  const db = await getDb();
  const today = todayISO();
  const year = Number(today.slice(0, 4));
  const dueDate =
    doc.dueDate < today
      ? addDaysISO(today, doc.type === "invoice" ? profile.paymentDays : 30)
      : doc.dueDate;
  const seller = JSON.stringify(sellerSnapshot(profile));
  const buyer = JSON.stringify(clientSnapshot(client));

  const res = await db.execute(sql`
    WITH target AS (
      SELECT id, type FROM documents
      WHERE id = ${doc.id}::uuid AND user_id = ${userId}::uuid AND number IS NULL AND status = 'draft'
    ), bump AS (
      INSERT INTO counters (user_id, kind, year, seq)
      SELECT ${userId}::uuid, type, ${year}::int, 1 FROM target
      ON CONFLICT (user_id, kind, year) DO UPDATE SET seq = counters.seq + 1
      RETURNING kind, seq
    )
    UPDATE documents d SET
      number = (CASE WHEN d.type = 'invoice' THEN 'F' ELSE 'D' END) || '-' || ${year}::text || '-' || lpad(bump.seq::text, 4, '0'),
      status = 'sent',
      issued_at = now(),
      issue_date = ${today}::date,
      due_date = ${dueDate}::date,
      seller_snapshot = ${seller}::jsonb,
      client_snapshot = ${buyer}::jsonb
    FROM bump
    WHERE d.id = ${doc.id}::uuid
    RETURNING d.number AS number
  `);
  const rows = (res as unknown as { rows: { number: string }[] }).rows;
  return rows[0]?.number ?? null;
}

export async function getOwnedDocument(userId: string, id: string) {
  const db = await getDb();
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .limit(1);
  return doc ?? null;
}

export async function getOwnedClient(userId: string, id: string) {
  const db = await getDb();
  const [c] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.userId, userId)))
    .limit(1);
  return c ?? null;
}
