"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { documents } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { addDaysISO, todayISO } from "@/lib/dates";
import { FREE_INVOICES_PER_MONTH, isPro } from "@/lib/plan";
import {
  freeLimitReached,
  getOwnedClient,
  getOwnedDocument,
  issueDraft,
} from "@/lib/documents";

const itemSchema = z.object({
  description: z.string().trim().min(1, "Chaque ligne a besoin d'une description.").max(300),
  quantity: z.number().positive("Quantité invalide.").max(1_000_000),
  unit: z.string().trim().max(20),
  unitPriceCents: z.number().int().min(0).max(1_000_000_00),
});

const inputSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(["quote", "invoice"]),
  clientId: z.string().uuid("Choisis un client."),
  subject: z.string().trim().max(160),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  items: z.array(itemSchema).min(1, "Ajoute au moins une ligne."),
  vatRate: z.number().int().min(0).max(200),
  notes: z.string().trim().max(1000),
});

export type DocumentInput = z.input<typeof inputSchema>;
export type SaveResult = { error: string } | { id: string };

export async function saveDocument(input: DocumentInput): Promise<SaveResult> {
  const { user, profile } = await requireUser();
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;
  if (v.dueDate < v.issueDate)
    return { error: "L'échéance doit être postérieure à la date d'émission." };
  if (!(await getOwnedClient(user.id, v.clientId))) return { error: "Client introuvable." };

  const vatRate = profile.vatRegime === "franchise" ? 0 : v.vatRate;
  const db = await getDb();
  const values = {
    clientId: v.clientId,
    subject: v.subject,
    issueDate: v.issueDate,
    dueDate: v.dueDate,
    items: v.items,
    vatRate,
    notes: v.notes,
  };

  if (v.id) {
    const doc = await getOwnedDocument(user.id, v.id);
    if (!doc) return { error: "Document introuvable." };
    if (doc.status !== "draft")
      return { error: "Un document émis ne peut plus être modifié (numérotation légale)." };
    await db.update(documents).set(values).where(eq(documents.id, doc.id));
    revalidatePath("/documents");
    return { id: doc.id };
  }
  const [created] = await db
    .insert(documents)
    .values({ ...values, userId: user.id, type: v.type })
    .returning({ id: documents.id });
  revalidatePath("/documents");
  return { id: created.id };
}

function back(id: string, msg?: string): never {
  redirect(`/documents/${id}${msg ? `?msg=${encodeURIComponent(msg)}` : ""}`);
}

/** Émet le brouillon : attribue le numéro, fige les identités. */
export async function issueDocument(formData: FormData) {
  const { user, profile } = await requireUser();
  const id = String(formData.get("id"));
  const doc = await getOwnedDocument(user.id, id);
  if (!doc || doc.status !== "draft") back(id);

  const missing = [
    !(profile.businessName || profile.fullName) && "ton nom",
    !profile.address && "ton adresse",
    !profile.siret && "ton SIRET",
  ].filter(Boolean);
  if (missing.length) back(id, `profil:${missing.join(", ")}`);

  if (doc.type === "invoice" && !isPro(user) && (await freeLimitReached(user.id)))
    back(id, `limite:${FREE_INVOICES_PER_MONTH}`);

  const client = await getOwnedClient(user.id, doc.clientId);
  if (!client) back(id);
  await issueDraft(user.id, doc, profile, client);
  revalidatePath("/", "layout");
  back(id, "emis");
}

export async function markPaid(formData: FormData) {
  const { user } = await requireUser();
  const id = String(formData.get("id"));
  const paid = formData.get("paid") !== "0";
  const db = await getDb();
  await db
    .update(documents)
    .set(paid ? { status: "paid", paidAt: new Date() } : { status: "sent", paidAt: null })
    .where(
      and(eq(documents.id, id), eq(documents.userId, user.id), eq(documents.type, "invoice")),
    );
  revalidatePath("/", "layout");
  back(id);
}

export async function setQuoteStatus(formData: FormData) {
  const { user } = await requireUser();
  const id = String(formData.get("id"));
  const status = z.enum(["sent", "accepted", "declined"]).parse(formData.get("status"));
  const doc = await getOwnedDocument(user.id, id);
  if (!doc || doc.type !== "quote" || doc.status === "draft") back(id);
  const db = await getDb();
  await db.update(documents).set({ status }).where(eq(documents.id, id));
  revalidatePath("/", "layout");
  back(id);
}

export async function convertToInvoice(formData: FormData) {
  const { user, profile } = await requireUser();
  const id = String(formData.get("id"));
  const quote = await getOwnedDocument(user.id, id);
  if (!quote || quote.type !== "quote" || quote.status === "draft") back(id);

  const db = await getDb();
  const [existing] = await db
    .select({ id: documents.id })
    .from(documents)
    .where(and(eq(documents.sourceQuoteId, quote.id), eq(documents.userId, user.id)))
    .limit(1);
  if (existing) redirect(`/documents/${existing.id}`);

  const today = todayISO();
  const [invoice] = await db
    .insert(documents)
    .values({
      userId: user.id,
      clientId: quote.clientId,
      type: "invoice",
      subject: quote.subject,
      issueDate: today,
      dueDate: addDaysISO(today, profile.paymentDays),
      items: quote.items,
      vatRate: profile.vatRegime === "franchise" ? 0 : quote.vatRate,
      notes: quote.notes,
      sourceQuoteId: quote.id,
    })
    .returning({ id: documents.id });
  if (quote.status === "sent") {
    await db.update(documents).set({ status: "accepted" }).where(eq(documents.id, quote.id));
  }
  revalidatePath("/", "layout");
  redirect(`/documents/${invoice.id}?msg=converti`);
}

export async function deleteDraft(formData: FormData) {
  const { user } = await requireUser();
  const id = String(formData.get("id"));
  const db = await getDb();
  await db
    .delete(documents)
    .where(
      and(eq(documents.id, id), eq(documents.userId, user.id), eq(documents.status, "draft")),
    );
  revalidatePath("/", "layout");
  redirect("/documents");
}
