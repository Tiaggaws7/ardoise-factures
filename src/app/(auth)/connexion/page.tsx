import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = { title: "Connexion" };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if ((await auth())?.user) redirect("/tableau-de-bord");
  const { next } = await searchParams;
  return (
    <AuthShell
      title="Bon retour."
      subtitle="Connectez-vous pour retrouver vos factures."
      footer={<>Pas encore de compte ? <Link href="/inscription" className="font-semibold text-accent hover:underline">S'inscrire</Link></>}
    >
      <AuthForm mode="login" next={next} />
    </AuthShell>
  );
}
