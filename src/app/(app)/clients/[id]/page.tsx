import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { deleteClient } from "@/actions/clients";
import { ClientForm } from "@/components/client-form";
import { PageHeader } from "@/components/ui";
import { getOwnedClient } from "@/lib/documents";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Client" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await requireUser();
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const client = await getOwnedClient(user.id, id);
  if (!client) notFound();
  return (
    <>
      <PageHeader
        title={client.name}
        actions={
          <>
            <Link href={`/documents/nouveau?type=quote&client=${client.id}`} className="btn btn-ghost btn-sm"><Plus size={15} />Devis</Link>
            <Link href={`/documents/nouveau?type=invoice&client=${client.id}`} className="btn btn-primary btn-sm"><Plus size={15} />Facture</Link>
          </>
        }
      />
      <ClientForm client={client} />
      <form action={deleteClient} className="mt-6">
        <input type="hidden" name="id" value={client.id} />
        <button className="inline-flex items-center gap-2 text-sm font-medium text-bad hover:underline"><Trash2 size={15} />Supprimer ce client</button>
      </form>
    </>
  );
}
