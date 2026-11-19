"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { getDb } from "@/db";
import { profiles, users } from "@/db/schema";
import { DEMO } from "@/config/site";
import { createDemoUser } from "@/lib/demo";

export type FormState = { error?: string; ok?: boolean } | undefined;

const signupSchema = z.object({
  name: z.string().trim().min(2, "Indique ton nom."),
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide."),
  password: z.string().min(8, "8 caractères minimum."),
});

export async function signUp(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, password } = parsed.data;
  if (email.endsWith(`@${DEMO.emailDomain}`)) return { error: "Adresse e-mail invalide." };

  const db = await getDb();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing) return { error: "Un compte existe déjà avec cet e-mail." };

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(users).values({ name, email, passwordHash }).returning();
  await db.insert(profiles).values({ userId: user.id, fullName: name, email });

  await signIn("credentials", { email, password, redirectTo: "/profil?bienvenue=1" });
}

export async function logIn(_: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: next.startsWith("/") && !next.startsWith("//") ? next : "/tableau-de-bord",
    });
  } catch (e) {
    if (e instanceof AuthError) return { error: "E-mail ou mot de passe incorrect." };
    throw e; // la redirection de Next passe par une exception
  }
}

export async function startDemo() {
  const { email } = await createDemoUser();
  await signIn("credentials", { email, password: DEMO.password, redirectTo: "/tableau-de-bord" });
}

export async function logOut() {
  await signOut({ redirectTo: "/" });
}
