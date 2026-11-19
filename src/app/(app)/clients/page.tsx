import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq, sql } from "drizzle-orm";
import { Plus } from "lucide-react";
import { getDb } from "@/db";
import { clients, documents } from "@/db/schema";
import { Empty, Notice, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Clients" };

export default async function Page({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { user } = await requireUser();
  const { erreur } = await searchParams;
  const db = await getDb();
  const rows = await db
    .select({ c: clients, n: sql<number>`(select count(*)::int from ${documents} where ${documents.clientId} = ${clients.id})` })
    .from(clients)
    .where(eq(clients.userId, user.id))
    .orderBy(asc(clients.name));

  return (
    <>
      <PageHeader title="Clients" subtitle="Les personnes et entreprises à qui vous facturez." actions={<Link href="/clients/nouveau" className="btn btn-primary btn-sm"><Plus size={15} />Nouveau client</Link>} />
      {erreur === "utilise" && <Notice tone="warn">Ce client a des documents associés : il ne peut pas être supprimé.</Notice>}
      {rows.length === 0 ? (
        <Empty title="Aucun client" text="Ajoutez votre premier client pour pouvoir créer un devis." action={<Link href="/clients/nouveau" className="btn btn-primary btn-sm">Ajouter un client</Link>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map(({ c, n }, i) => (
            <Link key={c.id} href={`/clients/${c.id}`} className="card animate-rise group p-5 transition hover:-translate-y-0.5 hover:border-accent/40" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-slate text-lg font-semibold text-chalk">{c.name.slice(0, 1).toUpperCase()}</span>
                <div className="min-w-0">
                  <p className="truncate font-semibold group-hover:text-accent">{c.name}</p>
                  <p className="truncate text-sm text-muted">{c.contact || c.email || "—"}</p>
                  <p className="mt-2 text-xs text-muted">{[c.city, `${n} document${n > 1 ? "s" : ""}`].filter(Boolean).join(" · ")}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
