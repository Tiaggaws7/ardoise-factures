import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { ArrowRight, Check, Download, FileSignature, Lock, RotateCcw, Send, Trash2, X } from "lucide-react";
import { convertToInvoice, deleteDraft, issueDocument, markPaid, setQuoteStatus } from "@/actions/documents";
import { getDb } from "@/db";
import { clients, documents } from "@/db/schema";
import { DocumentEditor } from "@/components/document-editor";
import { Notice, PageHeader, StatusBadge } from "@/components/ui";
import { SubmitButton } from "@/components/form-bits";
import { displayStatus } from "@/lib/document-status";
import { formatDate } from "@/lib/dates";
import { computeTotals, formatEUR, formatVatRate, lineTotal } from "@/lib/money";
import { FREE_INVOICES_PER_MONTH, TEMPLATES, isPro } from "@/lib/plan";
import { getOwnedClient, getOwnedDocument } from "@/lib/documents";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Document" };

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string }> }) {
  const { id } = await params;
  const { msg } = await searchParams;
  const { user, profile } = await requireUser();
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const doc = await getOwnedDocument(user.id, id);
  if (!doc) notFound();
  const client = await getOwnedClient(user.id, doc.clientId);
  if (!client) notFound();
  const db = await getDb();
  const [linked] = await db
    .select({ id: documents.id, number: documents.number })
    .from(documents)
    .where(and(eq(documents.sourceQuoteId, doc.id), eq(documents.userId, user.id)))
    .limit(1);
  const [source] = doc.sourceQuoteId ? await db.select({ id: documents.id, number: documents.number }).from(documents).where(eq(documents.id, doc.sourceQuoteId)) : [];

  const pro = isPro(user);
  const isInvoice = doc.type === "invoice";
  const display = displayStatus(doc, linked ? new Set([doc.id]) : undefined, doc.id);
  const label = isInvoice ? "Facture" : "Devis";
  const draft = doc.status === "draft";

  const notice = (() => {
    if (!msg) return null;
    if (msg === "emis") return <Notice tone="ok">✓ {label} émis(e) sous le numéro <strong>{doc.number}</strong>. Vous pouvez télécharger le PDF.</Notice>;
    if (msg === "converti") return <Notice tone="ok">✓ Devis converti en facture brouillon. Vérifiez-la puis émettez-la.</Notice>;
    if (msg.startsWith("limite:"))
      return (
        <Notice tone="warn">
          Offre gratuite : {FREE_INVOICES_PER_MONTH} factures émises par mois, c'est la limite atteinte.{" "}
          <Link href="/abonnement" className="font-bold underline">Passer en Pro</Link> pour émettre celle-ci.
        </Notice>
      );
    if (msg.startsWith("profil:"))
      return (
        <Notice tone="warn">
          Complétez d'abord votre <Link href="/profil" className="font-bold underline">profil</Link> ({msg.slice(7)}) avant d'émettre un document.
        </Notice>
      );
    return null;
  })();

  if (draft) {
    const list = await db.select({ id: clients.id, name: clients.name }).from(clients).where(eq(clients.userId, user.id)).orderBy(asc(clients.name));
    return (
      <>
        <PageHeader
          title={`${label} — brouillon`}
          subtitle={doc.sourceQuoteId && source ? `Issue du devis ${source.number}` : "Le numéro sera attribué à l'émission."}
          actions={
            <>
              <a href={`/api/documents/${doc.id}/pdf`} className="btn btn-ghost btn-sm"><Download size={15} />Aperçu PDF</a>
              <form action={deleteDraft}><input type="hidden" name="id" value={doc.id} /><button className="btn btn-ghost btn-sm text-bad"><Trash2 size={15} />Supprimer</button></form>
              <form action={issueDocument}><input type="hidden" name="id" value={doc.id} /><SubmitButton className="btn btn-primary btn-sm"><Send size={15} />Émettre</SubmitButton></form>
            </>
          }
        />
        {notice}
        <DocumentEditor
          id={doc.id}
          type={doc.type}
          clients={list}
          franchise={profile.vatRegime === "franchise"}
          initial={{ clientId: doc.clientId, subject: doc.subject, issueDate: doc.issueDate, dueDate: doc.dueDate, vatRate: doc.vatRate, notes: doc.notes, items: doc.items }}
        />
      </>
    );
  }

  const totals = computeTotals(doc.items, doc.vatRate);
  const seller = doc.sellerSnapshot;
  const buyer = doc.clientSnapshot;
  return (
    <>
      <PageHeader
        title={doc.number ?? label}
        subtitle={`${label} · ${client.name}`}
        actions={
          <>
            <StatusBadge status={display} type={doc.type} />
            <a href={`/api/documents/${doc.id}/pdf`} className="btn btn-dark btn-sm"><Download size={15} />Télécharger le PDF</a>
          </>
        }
      />
      {notice}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className="card p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="eyebrow !text-muted">Émetteur</p>
              <p className="mt-2 font-semibold">{seller?.name}</p>
              {seller?.lines.map((l) => (<p key={l} className="text-sm text-ink/70">{l}</p>))}
              {seller?.siret && <p className="mt-1 text-xs text-muted">SIRET {seller.siret}</p>}
            </div>
            <div>
              <p className="eyebrow !text-muted">{isInvoice ? "Facturé à" : "Destinataire"}</p>
              <p className="mt-2 font-semibold">{buyer?.name}</p>
              {buyer?.lines.map((l) => (<p key={l} className="text-sm text-ink/70">{l}</p>))}
            </div>
          </div>
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-y border-line py-4 text-sm">
            <div><dt className="text-xs text-muted">Émission</dt><dd className="font-semibold">{formatDate(doc.issueDate)}</dd></div>
            <div><dt className="text-xs text-muted">{isInvoice ? "Échéance" : "Validité"}</dt><dd className="font-semibold">{formatDate(doc.dueDate)}</dd></div>
            {doc.paidAt && <div><dt className="text-xs text-muted">Payée le</dt><dd className="font-semibold text-ok">{formatDate(doc.paidAt)}</dd></div>}
            {source && <div><dt className="text-xs text-muted">Issue du devis</dt><dd><Link href={`/documents/${source.id}`} className="font-semibold text-accent hover:underline">{source.number}</Link></dd></div>}
          </dl>
          {doc.subject && <p className="mt-5 font-semibold">{doc.subject}</p>}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wider text-muted"><th className="py-2 font-semibold">Description</th><th className="py-2 text-right font-semibold">Qté</th><th className="py-2 text-right font-semibold">P.U.</th><th className="py-2 text-right font-semibold">Total</th></tr></thead>
              <tbody className="divide-y divide-line border-t border-line">
                {doc.items.map((l, i) => (
                  <tr key={i}><td className="py-3 pr-3">{l.description}</td><td className="py-3 text-right tabular-nums text-muted">{l.quantity} {l.unit}</td><td className="py-3 text-right tabular-nums text-muted">{formatEUR(l.unitPriceCents)}</td><td className="py-3 text-right font-semibold tabular-nums">{formatEUR(lineTotal(l))}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 ml-auto max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted">Total HT</span><span className="tabular-nums">{formatEUR(totals.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted">{doc.vatRate > 0 ? `TVA ${formatVatRate(doc.vatRate)}` : "TVA"}</span><span className="tabular-nums">{doc.vatRate > 0 ? formatEUR(totals.vat) : "—"}</span></div>
            <div className="flex items-baseline justify-between border-t-2 border-ink pt-2"><span className="font-semibold">{doc.vatRate > 0 ? "Total TTC" : "Net à payer"}</span><span className="h-display text-2xl font-semibold tabular-nums">{formatEUR(totals.total)}</span></div>
          </div>
          {seller?.vatMention && <p className="mt-4 text-xs text-muted">{seller.vatMention}</p>}
          {doc.notes && <p className="mt-4 whitespace-pre-line rounded-xl bg-paper p-4 text-sm text-ink/80">{doc.notes}</p>}
        </section>

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold">Actions</h2>
            <div className="space-y-2">
              {isInvoice && doc.status !== "paid" && (
                <form action={markPaid}><input type="hidden" name="id" value={doc.id} /><SubmitButton className="btn btn-primary w-full"><Check size={16} />Marquer comme payée</SubmitButton></form>
              )}
              {isInvoice && doc.status === "paid" && (
                <form action={markPaid}><input type="hidden" name="id" value={doc.id} /><input type="hidden" name="paid" value="0" /><SubmitButton className="btn btn-ghost w-full"><RotateCcw size={15} />Annuler le paiement</SubmitButton></form>
              )}
              {!isInvoice && !linked && (
                <>
                  {doc.status === "sent" && (
                    <>
                      <form action={setQuoteStatus}><input type="hidden" name="id" value={doc.id} /><input type="hidden" name="status" value="accepted" /><SubmitButton className="btn btn-ghost w-full"><Check size={16} />Marquer accepté</SubmitButton></form>
                      <form action={setQuoteStatus}><input type="hidden" name="id" value={doc.id} /><input type="hidden" name="status" value="declined" /><SubmitButton className="btn btn-ghost w-full"><X size={16} />Marquer refusé</SubmitButton></form>
                    </>
                  )}
                  {doc.status !== "declined" && (
                    <form action={convertToInvoice}><input type="hidden" name="id" value={doc.id} /><SubmitButton className="btn btn-primary w-full"><FileSignature size={16} />Transformer en facture</SubmitButton></form>
                  )}
                  {doc.status === "declined" && (
                    <form action={setQuoteStatus}><input type="hidden" name="id" value={doc.id} /><input type="hidden" name="status" value="sent" /><SubmitButton className="btn btn-ghost w-full"><RotateCcw size={15} />Rouvrir le devis</SubmitButton></form>
                  )}
                </>
              )}
              {linked && (
                <Link href={`/documents/${linked.id}`} className="btn btn-dark w-full">Voir la facture {linked.number ?? "(brouillon)"} <ArrowRight size={15} /></Link>
              )}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted">Un document émis est figé : sa numérotation et son contenu ne peuvent plus être modifiés.</p>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold">Modèle de PDF</h2>
            <ul className="space-y-1.5">
              {TEMPLATES.map((t) => {
                const locked = t.pro && !pro;
                return (
                  <li key={t.id}>
                    <a
                      href={locked ? "/abonnement" : `/api/documents/${doc.id}/pdf?modele=${t.id}`}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:bg-paper"
                    >
                      <span className="font-medium">{t.name}</span>
                      {locked ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent"><Lock size={12} />Pro</span> : <Download size={14} className="text-muted" />}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
