import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = { title: "Inscription" };

export default async function Page() {
  if ((await auth())?.user) redirect("/tableau-de-bord");
  return (
    <AuthShell
      title="Créez votre compte."
      subtitle="Gratuit, sans carte bancaire. Prêt en une minute."
      footer={<>Déjà inscrit ? <Link href="/connexion" className="font-semibold text-accent hover:underline">Se connecter</Link></>}
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
