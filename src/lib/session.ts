import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { profiles, users, type Profile, type User } from "@/db/schema";

/** Utilisateur connecté + profil (ou redirection vers la connexion). */
export const requireUser = cache(async (): Promise<{ user: User; profile: Profile }> => {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  const db = await getDb();
  const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  if (!user) redirect("/connexion");
  let [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
  if (!profile) {
    [profile] = await db
      .insert(profiles)
      .values({ userId: user.id, fullName: user.name, email: user.email })
      .returning();
  }
  return { user, profile };
});

export async function getOptionalUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
