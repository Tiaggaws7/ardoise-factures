import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { clients } from "@/db/schema";
import { DocumentEditor } from "@/components/document-editor";
import { Empty, PageHeader } from "@/components/ui";
import { addDaysISO, todayISO } from "@/lib/dates";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Nouveau document" };

export default async function Page({ searchParams }: { searchParams: Promise<{ type?: string; client?: string }> }) {
  const { type: t, client } = await searchParams;
  const type = t === "quote" ? "quote" : "invoice";
  const { user, profile } = await requireUser();
  const db = await getDb();
  const list = await db.select({ id: clients.id, name: clients.name }).from(clients).where(eq(clients.userId, user.id)).orderBy(asc(clients.name));

  if (list.length === 0)
    return (
      <>
        <PageHeader title={type === "quote" ? "Nouveau devis" : "Nouvelle facture"} />
        <Empty title="Il faut d'abord un client" text="Ajoutez le client à qui s'adresse ce document." action={<Link href="/clients/nouveau" className="btn btn-primary btn-sm">Ajouter un client</Link>} />
      </>
    );

  const today = todayISO();
  return (
    <>
      <PageHeader title={type === "quote" ? "Nouveau devis" : "Nouvelle facture"} subtitle="Enregistrez d'abord un brouillon : le numéro est attribué à l'émission." />
      <DocumentEditor
        type={type}
        clients={list}
        franchise={profile.vatRegime === "franchise"}
        initial={{
          clientId: list.find((c) => c.id === client)?.id ?? "",
          subject: "",
          issueDate: today,
          dueDate: addDaysISO(today, type === "invoice" ? profile.paymentDays : 30),
          vatRate: profile.defaultVatRate,
          notes: "",
          items: [],
        }}
      />
    </>
  );
}
