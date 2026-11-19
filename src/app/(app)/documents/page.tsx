import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus2, Plus } from "lucide-react";
import { Empty, PageHeader, StatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/dates";
import { formatEUR } from "@/lib/money";
import { listDocuments } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Devis & factures" };

const TABS = [
  ["tout", "Tout"],
  ["invoice", "Factures"],
  ["quote", "Devis"],
] as const;

export default async function Page({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type = "tout" } = await searchParams;
  const { user } = await requireUser();
  const all = await listDocuments(user.id);
  const docs = type === "tout" ? all : all.filter((d) => d.type === type);

  return (
    <>
      <PageHeader
        title="Devis & factures"
        actions={
          <>
            <Link href="/documents/nouveau?type=quote" className="btn btn-ghost btn-sm"><FilePlus2 size={15} />Devis</Link>
            <Link href="/documents/nouveau?type=invoice" className="btn btn-primary btn-sm"><Plus size={15} />Facture</Link>
          </>
        }
      />
      <div className="mb-5 inline-flex rounded-full border border-line bg-chalk p-1 text-sm font-semibold" role="tablist">
        {TABS.map(([k, label]) => (
          <Link key={k} href={k === "tout" ? "/documents" : `/documents?type=${k}`} role="tab" aria-selected={type === k} className={`rounded-full px-4 py-1.5 transition ${type === k ? "bg-slate text-chalk" : "text-ink/70 hover:text-ink"}`}>
            {label}
          </Link>
        ))}
      </div>
      {docs.length === 0 ? (
        <Empty title="Rien ici pour l'instant" text="Créez un devis ou une facture : il apparaîtra dans cette liste." action={<Link href="/documents/nouveau?type=quote" className="btn btn-primary btn-sm">Nouveau devis</Link>} />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="hidden bg-paper text-xs uppercase tracking-wider text-muted sm:table-header-group">
              <tr><th className="px-5 py-3 font-semibold">Numéro</th><th className="px-3 py-3 font-semibold">Client</th><th className="px-3 py-3 font-semibold">Date</th><th className="px-3 py-3 font-semibold">Statut</th><th className="px-5 py-3 text-right font-semibold">Total</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {docs.map((d) => (
                <tr key={d.id} className="group relative transition hover:bg-paper">
                  <td className="px-5 py-3.5">
                    <Link href={`/documents/${d.id}`} className="font-semibold after:absolute after:inset-0 group-hover:text-accent">{d.number ?? "Brouillon"}</Link>
                    <span className="block text-xs text-muted">{d.type === "invoice" ? "Facture" : "Devis"}{d.subject ? ` · ${d.subject}` : ""}</span>
                  </td>
                  <td className="hidden px-3 py-3.5 sm:table-cell">{d.clientName}</td>
                  <td className="hidden px-3 py-3.5 text-muted sm:table-cell">{formatDate(d.issueDate)}</td>
                  <td className="px-3 py-3.5"><StatusBadge status={d.display} type={d.type} /></td>
                  <td className="px-5 py-3.5 text-right font-semibold tabular-nums">{formatEUR(d.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
