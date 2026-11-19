"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { clients, documents } from "@/db/schema";
import { requireUser } from "@/lib/session";
import type { FormState } from "./auth";

const schema = z.object({
  name: z.string().trim().min(2, "Le nom du client est obligatoire.").max(120),
  contact: z.string().trim().max(120),
  email: z
    .string()
    .trim()
    .refine((v) => v === "" || z.string().email().safeParse(v).success, "E-mail invalide."),
  phone: z.string().trim().max(30),
  address: z.string().trim().max(200),
  postalCode: z.string().trim().max(12),
  city: z.string().trim().max(80),
  siret: z.string().trim().max(20),
  vatNumber: z.string().trim().max(20),
  notes: z.string().trim().max(1000),
});

export async function saveClient(_: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireUser();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const id = String(formData.get("id") ?? "");
  const db = await getDb();
  if (id) {
    await db
      .update(clients)
      .set(parsed.data)
      .where(and(eq(clients.id, id), eq(clients.userId, user.id)));
  } else {
    await db.insert(clients).values({ ...parsed.data, userId: user.id });
  }
  revalidatePath("/clients");
  redirect("/clients");
}

export async function deleteClient(formData: FormData) {
  const { user } = await requireUser();
  const id = String(formData.get("id"));
  const db = await getDb();
  const [used] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(documents)
    .where(and(eq(documents.clientId, id), eq(documents.userId, user.id)));
  if (used.n > 0) redirect(`/clients?erreur=utilise`);
  await db.delete(clients).where(and(eq(clients.id, id), eq(clients.userId, user.id)));
  revalidatePath("/clients");
  redirect("/clients");
}
