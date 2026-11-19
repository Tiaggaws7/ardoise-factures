import { Info } from "lucide-react";
import { isTestMode } from "@/lib/mode";

/** Bandeau discret : projet de démonstration, paiements Stripe en mode test. */
export function DemoBanner() {
  if (process.env.SHOW_DEMO_BANNER === "false" || !isTestMode()) return null;
  return (
    <div className="bg-slate text-[12.5px] text-chalk/90">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-4 py-1.5 text-center">
        <Info size={13} className="shrink-0 text-accent" aria-hidden />
        <span>
          Projet de démonstration — paiements Stripe en <strong className="font-semibold">mode test</strong>. Carte test :{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12px] tracking-wide">4242 4242 4242 4242</code>
          <span className="hidden sm:inline">, date et CVC au choix</span>.
        </span>
      </div>
    </div>
  );
}
