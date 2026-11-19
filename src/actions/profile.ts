"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { profiles } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { isPro, templateAllowed } from "@/lib/plan";
import type { FormState } from "./auth";

const schema = z.object({
  businessName: z.string().trim().max(120),
  fullName: z.string().trim().min(2, "Indique ton nom complet.").max(120),
  address: z.string().trim().max(200),
  postalCode: z.string().trim().max(12),
  city: z.string().trim().max(80),
  email: z.string().trim().email("E-mail de contact invalide."),
  phone: z.string().trim().max(30),
  siret: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{14}$/.test(v.replace(/\s/g, "")), "Le SIRET compte 14 chiffres."),
  vatRegime: z.enum(["franchise", "assujetti"]),
  vatNumber: z.string().trim().max(20),
  defaultVatRate: z.coerce.number().int().min(0).max(200),
  iban: z.string().trim().max(40),
  bic: z.string().trim().max(15),
  paymentDays: z.coerce.number().int().min(0).max(120),
  legalFooter: z.string().trim().max(600),
  template: z.string(),
});

export async function saveProfile(_: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireUser();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;
  if (v.vatRegime === "assujetti" && !v.vatNumber)
    return { error: "Renseigne ton numéro de TVA intracommunautaire." };
  if (!templateAllowed(v.template, isPro(user)))
    return { error: "Ce modèle de PDF est réservé à l'offre Pro." };

  const logoField = formData.get("logo");
  const logo = typeof logoField === "string" ? logoField : undefined;
  if (logo && (!/^data:image\/(png|jpeg);base64,/.test(logo) || logo.length > 450_000))
    return { error: "Logo invalide (PNG ou JPEG, 300 Ko maximum)." };

  const db = await getDb();
  await db
    .update(profiles)
    .set({
      ...v,
      siret: v.siret.replace(/\s/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, "$1 $2 $3 $4"),
      iban: v.iban.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim().toUpperCase(),
      bic: v.bic.toUpperCase(),
      vatNumber: v.vatRegime === "assujetti" ? v.vatNumber : "",
      defaultVatRate: v.vatRegime === "franchise" ? 0 : v.defaultVatRate,
      ...(logo !== undefined ? { logo: logo === "" ? null : logo } : {}),
    })
    .where(eq(profiles.userId, user.id));
  revalidatePath("/", "layout");
  return { ok: true };
}
