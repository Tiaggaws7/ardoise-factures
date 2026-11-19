import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CheckCircle2, Clock, FilePlus2, FileText, Plus, TrendingUp } from "lucide-react";
import { PageHeader, StatusBadge, Empty } from "@/components/ui";
import { RevenueChart } from "@/components/revenue-chart";
import { daysBetween, formatDate, todayISO } from "@/lib/dates";
import { formatEUR, formatEURRound } from "@/lib/money";
import { FREE_INVOICES_PER_MONTH, isPro } from "@/lib/plan";
import { invoicesIssuedThisMonth } from "@/lib/documents";
import { listDocuments } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function Dashboard() {
  const { user, profile } = await requireUser();
  const [docs, issued] = await Promise.all([listDocuments(user.id), invoicesIssuedThisMonth(user.id)]);
  const today = todayISO();
  const year = today.slice(0, 4);
  const month = today.slice(0, 7);

  const invoices = docs.filter((d) => d.type === "invoice" && d.status !== "draft");
  const paid = invoices.filter((d) => d.status === "paid");
  const paidAt = (d: (typeof paid)[number]) => (d.paidAt ? d.paidAt.toISOString().slice(0, 7) : d.issueDate.slice(0, 7));
  const caYear = paid.filter((d) => paidAt(d).startsWith(year)).reduce((s, d) => s + d.total, 0);
  const caMonth = paid.filter((d) => paidAt(d) === month).reduce((s, d) => s + d.total, 0);
  const pending = invoices.filter((d) => d.display === "sent");
  const overdue = invoices.filter((d) => d.display === "overdue");
  const sum = (a: { total: number }[]) => a.reduce((s, d) => s + d.total, 0);
  const openQuotes = docs.filter((d) => d.type === "quote" && (d.display === "sent" || d.display === "accepted"));

  const chart = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(`${today.slice(0, 7)}-15T12:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() - (11 - i));
    const key = d.toISOString().slice(0, 7);
    return {
      label: new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: "UTC" }).format(d).replace(".", ""),
      value: paid.filter((x) => paidAt(x) === key).reduce((s, x) => s + x.total, 0),
    };
  });

  const unpaid = [...overdue, ...pending].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6);
  const recent = docs.slice(0, 6);
  const pro = isPro(user);

  const kpis = [
    { label: "Encaissé cette année", value: formatEURRound(caYear), hint: `${formatEURRound(caMonth)} ce mois-ci`, icon: TrendingUp, tone: "text-ok bg-ok-soft" },
    { label: "À encaisser", value: formatEURRound(sum(pending)), hint: `${pending.length} facture${pending.length > 1 ? "s" : ""} en attente`, icon: Clock, tone: "text-info bg-info-soft" },
    { label: "En retard", value: formatEURRound(sum(overdue)), hint: overdue.length ? `${overdue.length} impayé${overdue.length > 1 ? "s" : ""} à relancer` : "Rien à relancer 🎉", icon: AlertTriangle, tone: "text-bad bg-bad-soft" },
    { label: "Devis en cours", value: String(openQuotes.length), hint: formatEURRound(sum(openQuotes)) + " potentiels", icon: FileText, tone: "text-accent-dark bg-accent-soft" },
  ];

  return (
    <>
      <PageHeader
        title={`Bonjour ${user.name.split(" ")[0]} 👋`}
        subtitle="Voici où en sont vos finances."
        actions={
          <>
            <Link href="/documents/nouveau?type=quote" className="btn btn-ghost btn-sm"><FilePlus2 size={15} />Nouveau devis</Link>
            <Link href="/documents/nouveau?type=invoice" className="btn btn-primary btn-sm"><Plus size={15} />Nouvelle facture</Link>
          </>
        }
      />

      {!profile.siret && (
        <Link href="/profil" className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-warn/30 bg-warn-soft px-5 py-4 text-sm text-warn transition hover:-translate-y-0.5">
          <span><strong>Complétez votre profil</strong> (SIRET, adresse, IBAN) : il est nécessaire pour émettre vos premiers documents.</span>
          <ArrowUpRight size={18} className="shrink-0" />
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={k.label} className="card animate-rise p-5" style={{ animationDelay: `${i * 70}ms` }}>
            <span className={`grid size-9 place-items-center rounded-xl ${k.tone}`}><k.icon size={18} /></span>
            <p className="mt-4 text-[13px] font-medium text-muted">{k.label}</p>
            <p className="h-display mt-0.5 text-3xl font-semibold tabular-nums">{k.value}</p>
            <p className="mt-1 text-xs text-muted">{k.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="card p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chiffre d'affaires encaissé</h2>
            <span className="text-xs text-muted">12 derniers mois</span>
          </div>
          <RevenueChart data={chart} />
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-semibold">Impayés</h2>
          {unpaid.length === 0 ? (
            <p className="mt-6 flex items-center gap-2 text-sm text-ok"><CheckCircle2 size={18} />Tout est réglé, bravo.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {unpaid.map((d) => (
                <li key={d.id}>
                  <Link href={`/documents/${d.id}`} className="-mx-2 flex items-center justify-between gap-3 rounded-xl px-2 py-3 transition hover:bg-paper">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{d.clientName}</span>
                      <span className={`text-xs ${d.display === "overdue" ? "text-bad" : "text-muted"}`}>
                        {d.number} · {d.display === "overdue" ? `${daysBetween(d.dueDate, today)} j de retard` : `échéance ${formatDate(d.dueDate)}`}
                      </span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums">{formatEUR(d.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {!pro && (
        <div className="card mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="min-w-[220px] flex-1">
            <p className="text-sm font-semibold">Offre gratuite : {issued} / {FREE_INVOICES_PER_MONTH} factures émises ce mois-ci</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${Math.min(100, (issued / FREE_INVOICES_PER_MONTH) * 100)}%` }} />
            </div>
          </div>
          <Link href="/abonnement" className="btn btn-dark btn-sm">Lever la limite</Link>
        </div>
      )}

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Derniers documents</h2>
          <Link href="/documents" className="text-sm font-semibold text-accent hover:underline">Tout voir</Link>
        </div>
        {recent.length === 0 ? (
          <Empty title="Aucun document pour l'instant" text="Créez votre premier client puis votre premier devis : cela prend deux minutes." action={<Link href="/clients/nouveau" className="btn btn-primary btn-sm">Ajouter un client</Link>} />
        ) : (
          <div className="card divide-y divide-line overflow-hidden">
            {recent.map((d) => (
              <Link key={d.id} href={`/documents/${d.id}`} className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-paper">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{d.number ?? "Brouillon"} <span className="font-normal text-muted">· {d.clientName}</span></p>
                  <p className="truncate text-xs text-muted">{d.type === "invoice" ? "Facture" : "Devis"} · {d.subject || "Sans objet"}</p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <StatusBadge status={d.display} type={d.type} />
                  <span className="w-24 text-right text-sm font-semibold tabular-nums">{formatEUR(d.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
