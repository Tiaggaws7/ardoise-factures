"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { resetDemoData } from "@/lib/demo";

export async function resetDemo() {
  const { user } = await requireUser();
  if (!user.isDemo) return;
  const db = await getDb();
  await resetDemoData(user.id);
  await db.update(users).set({ plan: "pro" }).where(eq(users.id, user.id));
  revalidatePath("/", "layout");
}

/** Bascule la démo entre Free et Pro pour montrer les limites et le filigrane. */
export async function toggleDemoPlan() {
  const { user } = await requireUser();
  if (!user.isDemo) return;
  const db = await getDb();
  await db
    .update(users)
    .set({ plan: user.plan === "pro" ? "free" : "pro" })
    .where(eq(users.id, user.id));
  revalidatePath("/", "layout");
}
