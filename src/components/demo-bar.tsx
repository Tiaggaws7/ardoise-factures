import { RotateCcw, Shuffle } from "lucide-react";
import { resetDemo, toggleDemoPlan } from "@/actions/demo";

export function DemoBar({ pro }: { pro: boolean }) {
  return (
    <div className="border-b border-accent/20 bg-accent-soft text-[13px] text-accent-dark">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2">
        <span className="font-semibold">Compte de démo · données fictives</span>
        <form action={toggleDemoPlan}>
          <button className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 font-semibold transition hover:bg-white">
            <Shuffle size={13} /> Voir l'offre {pro ? "Gratuite" : "Pro"}
          </button>
        </form>
        <form action={resetDemo}>
          <button className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 font-semibold transition hover:bg-white">
            <RotateCcw size={13} /> Réinitialiser les données
          </button>
        </form>
      </div>
    </div>
  );
}
