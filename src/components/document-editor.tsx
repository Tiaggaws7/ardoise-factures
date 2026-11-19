"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { saveDocument } from "@/actions/documents";
import { VAT_RATES, computeTotals, formatEUR, parseEuroToCents } from "@/lib/money";

type Line = { description: string; quantity: string; unit: string; price: string };

export type EditorProps = {
  id?: string;
  type: "quote" | "invoice";
  clients: { id: string; name: string }[];
  franchise: boolean;
  initial: {
    clientId: string;
    subject: string;
    issueDate: string;
    dueDate: string;
    vatRate: number;
    notes: string;
    items: { description: string; quantity: number; unit: string; unitPriceCents: number }[];
  };
};

const UNITS = ["forfait", "heure", "jour", "pièce", "page", "mois"];

export function DocumentEditor({ id, type, clients, franchise, initial }: EditorProps) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [clientId, setClientId] = useState(initial.clientId);
  const [subject, setSubject] = useState(initial.subject);
  const [issueDate, setIssueDate] = useState(initial.issueDate);
  const [dueDate, setDueDate] = useState(initial.dueDate);
  const [vatRate, setVatRate] = useState(initial.vatRate);
  const [notes, setNotes] = useState(initial.notes);
  const [lines, setLines] = useState<Line[]>(
    initial.items.length
      ? initial.items.map((l) => ({ description: l.description, quantity: String(l.quantity).replace(".", ","), unit: l.unit, price: (l.unitPriceCents / 100).toFixed(2).replace(".", ",") }))
      : [{ description: "", quantity: "1", unit: "forfait", price: "" }],
  );

  const items = useMemo(
    () => lines.map((l) => ({ description: l.description, quantity: Number(l.quantity.replace(",", ".")) || 0, unit: l.unit, unitPriceCents: parseEuroToCents(l.price) })),
    [lines],
  );
  const totals = computeTotals(items, franchise ? 0 : vatRate);
  const setLine = (i: number, patch: Partial<Line>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setSaved(false);
    start(async () => {
      const res = await saveDocument({ id, type, clientId, subject, issueDate, dueDate, items, vatRate: franchise ? 0 : vatRate, notes });
      if ("error" in res) return setError(res.error);
      setSaved(true);
      if (!id) router.push(`/documents/${res.id}`);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="card grid gap-4 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="clientId">Client <span className="text-accent">*</span></label>
          <select id="clientId" className="input" value={clientId} onChange={(e) => setClientId(e.target.value)} required>
            <option value="" disabled>Choisir un client…</option>
            {clients.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="subject">Objet</label>
          <input id="subject" className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Refonte de l'identité visuelle" maxLength={160} />
        </div>
        <div>
          <label className="label" htmlFor="issueDate">Date d'émission</label>
          <input id="issueDate" type="date" className="input" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="dueDate">{type === "invoice" ? "Échéance de paiement" : "Valable jusqu'au"}</label>
          <input id="dueDate" type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </div>
      </section>

      <section className="card p-6">
        <h2 className="mb-4 text-lg font-semibold">Prestations</h2>
        <div className="space-y-3">
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-[1fr_72px_96px] gap-2 rounded-xl border border-line bg-white p-3 sm:grid-cols-[1fr_80px_110px_120px_auto] sm:items-center sm:border-0 sm:bg-transparent sm:p-0">
              <input aria-label="Description" className="input col-span-3 sm:col-span-1" placeholder="Description de la prestation" value={l.description} onChange={(e) => setLine(i, { description: e.target.value })} required />
              <input aria-label="Quantité" className="input text-right tabular-nums" inputMode="decimal" value={l.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} />
              <select aria-label="Unité" className="input" value={l.unit} onChange={(e) => setLine(i, { unit: e.target.value })}>
                {[...new Set([...UNITS, l.unit])].map((u) => (<option key={u}>{u}</option>))}
              </select>
              <div className="relative col-span-2 sm:col-span-1">
                <input aria-label="Prix unitaire HT" className="input pr-8 text-right tabular-nums" inputMode="decimal" placeholder="0,00" value={l.price} onChange={(e) => setLine(i, { price: e.target.value })} />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">€</span>
              </div>
              <button type="button" onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((_, j) => j !== i) : ls))} className="grid size-10 place-items-center rounded-xl text-muted transition hover:bg-bad-soft hover:text-bad disabled:opacity-30" aria-label="Supprimer la ligne" disabled={lines.length === 1}>
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setLines((ls) => [...ls, { description: "", quantity: "1", unit: "forfait", price: "" }])} className="btn btn-ghost btn-sm mt-4"><Plus size={15} />Ajouter une ligne</button>

        <div className="mt-8 flex flex-col items-end gap-1">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">Total HT</span><span className="tabular-nums">{formatEUR(totals.subtotal)}</span></div>
            <div className="flex items-center justify-between gap-3">
              {franchise ? (
                <span className="text-muted">TVA non applicable</span>
              ) : (
                <label className="flex items-center gap-2 text-muted">TVA
                  <select className="rounded-lg border border-line bg-white px-2 py-1 text-ink" value={vatRate} onChange={(e) => setVatRate(Number(e.target.value))}>
                    {VAT_RATES.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
                  </select>
                </label>
              )}
              <span className="tabular-nums">{franchise ? "—" : formatEUR(totals.vat)}</span>
            </div>
            <div className="flex items-baseline justify-between border-t-2 border-ink pt-3">
              <span className="font-semibold">{franchise ? "Net à payer" : "Total TTC"}</span>
              <span className="h-display text-3xl font-semibold tabular-nums">{formatEUR(totals.total)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <label className="label" htmlFor="notes">Notes (affichées sur le document)</label>
        <textarea id="notes" rows={3} className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Merci pour votre confiance !" maxLength={1000} />
      </section>

      {error && <p role="alert" className="rounded-xl bg-bad-soft px-4 py-3 text-sm font-medium text-bad">{error}</p>}
      <div className="flex items-center gap-3">
        <button className="btn btn-primary" disabled={pending}>
          {pending && <Loader2 className="animate-spin" size={16} />}
          Enregistrer le brouillon
        </button>
        {saved && <span className="animate-page text-sm font-medium text-ok">✓ Enregistré</span>}
      </div>
    </form>
  );
}
