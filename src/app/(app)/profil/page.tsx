import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { ProfileForm } from "@/components/profile-form";
import { isPro } from "@/lib/plan";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Profil" };

export default async function Page({ searchParams }: { searchParams: Promise<{ bienvenue?: string }> }) {
  const { bienvenue } = await searchParams;
  const { user, profile } = await requireUser();
  return (
    <>
      <PageHeader title="Profil freelance" subtitle="Ces informations figurent sur vos devis et factures." />
      <ProfileForm profile={profile} pro={isPro(user)} welcome={Boolean(bienvenue)} />
    </>
  );
}
