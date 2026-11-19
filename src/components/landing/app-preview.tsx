import { Bell, Check, FileText, Home, Users, Wallet } from "lucide-react";

/** Aperçu animé de l'app — 100 % CSS (aucun JS), boucle de 15 s. */
export function AppPreview() {
  const rows = [
    ["Direction artistique", "1,5 j × 420 €", "630 €", "r1"],
    ["Déclinaisons réseaux (6)", "6 × 45 €", "270 €", "r2"],
    ["Retouches photo", "1 h × 55 €", "55 €", "r3"],
  ] as const;
  return (
    <div className="demo-loop relative mx-auto w-full max-w-[880px]" aria-hidden="true">
      <div className="overflow-hidden rounded-[22px] border border-white/10 bg-chalk shadow-float">
        {/* barre de fenêtre */}
        <div className="flex items-center gap-2 border-b border-line bg-paper px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-[#ff6159]" />
          <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="size-2.5 rounded-full bg-[#28c940]" />
          <span className="mx-auto rounded-full bg-white px-4 py-0.5 text-[11px] text-muted">ardoise.vercel.app/documents/f-2026-0012</span>
        </div>
        <div className="flex">
          <div className="hidden w-14 shrink-0 flex-col items-center gap-5 border-r border-line bg-slate py-5 text-chalk/60 sm:flex">
            <Home size={18} className="text-chalk" />
            <FileText size={18} />
            <Users size={18} />
            <Wallet size={18} />
          </div>
          <div className="relative min-w-0 flex-1 p-5 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Facture</p>
                <p className="h-display text-2xl font-semibold sm:text-[28px]">F-2026-0012</p>
                <p className="mt-0.5 text-[13px] text-muted">Studio Nova · Campagne de printemps</p>
              </div>
              <div className="relative h-7 w-24 shrink-0 text-[12px] font-semibold">
                <span className="demo-pill p1 rounded-full bg-line/70 text-muted">Brouillon</span>
                <span className="demo-pill p2 rounded-full bg-info-soft text-info">Envoyée</span>
                <span className="demo-pill p3 rounded-full bg-ok-soft text-ok">
                  <Check size={13} className="mr-1" /> Payée
                </span>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-line">
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 bg-paper px-4 py-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted sm:grid-cols-[1fr_120px_90px]">
                <span>Description</span>
                <span className="hidden sm:block">Détail</span>
                <span className="text-right">Total</span>
              </div>
              {rows.map(([d, q, t, c]) => (
                <div key={d} className={`demo-row ${c} grid grid-cols-[1fr_auto_auto] gap-x-4 border-t border-line px-4 py-2.5 text-[13px] sm:grid-cols-[1fr_120px_90px]`}>
                  <span className="truncate font-medium">{d}</span>
                  <span className="hidden text-muted sm:block">{q}</span>
                  <span className="text-right font-semibold tabular-nums">{t}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-end justify-between">
              <p className="max-w-[180px] text-[11.5px] leading-snug text-muted">TVA non applicable, art. 293 B du CGI</p>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Net à payer</p>
                <p className="h-display text-3xl font-semibold tabular-nums">
                  <span className="demo-total" /> €
                </p>
              </div>
            </div>

            <div className="demo-stamp pointer-events-none absolute right-6 top-24 rounded-lg border-[3px] border-ok px-4 py-1 text-xl font-extrabold uppercase tracking-[0.2em] text-ok sm:right-12 sm:top-28 sm:text-2xl">
              Payée
            </div>
          </div>
        </div>
      </div>

      <div className="demo-toast absolute -bottom-5 right-3 flex items-center gap-3 rounded-2xl border border-line bg-chalk px-4 py-3 shadow-float sm:-right-6">
        <span className="grid size-9 place-items-center rounded-full bg-ok-soft text-ok"><Bell size={16} /></span>
        <span className="text-left">
          <span className="block text-[13px] font-semibold">Paiement reçu</span>
          <span className="block text-[12px] text-muted">Studio Nova · +955 €</span>
        </span>
      </div>
    </div>
  );
}
