import { formatEURRound } from "@/lib/money";

/** Histogramme SVG léger (aucune librairie) : chiffre d'affaires encaissé sur 12 mois. */
export function RevenueChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const H = 180;
  return (
    <div role="img" aria-label="Chiffre d'affaires encaissé par mois sur les 12 derniers mois">
      <div className="flex h-[180px] items-end gap-1.5 sm:gap-2.5">
        {data.map((d, i) => {
          const h = Math.max(d.value > 0 ? 6 : 2, Math.round((d.value / max) * H));
          return (
            <div key={d.label + i} className="group relative flex flex-1 flex-col items-center justify-end">
              <span className="pointer-events-none absolute -top-8 z-10 whitespace-nowrap rounded-lg bg-slate px-2 py-1 text-[11px] font-semibold text-chalk opacity-0 transition group-hover:opacity-100">{formatEURRound(d.value)}</span>
              <div
                className={`bar w-full rounded-t-lg ${d.value > 0 ? "bg-slate group-hover:bg-accent" : "bg-line"} ${i === data.length - 1 ? "!bg-accent" : ""} transition-colors`}
                style={{ height: h, animationDelay: `${i * 45}ms` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5 sm:gap-2.5">
        {data.map((d, i) => (<span key={i} className="flex-1 text-center text-[10.5px] capitalize text-muted">{d.label}</span>))}
      </div>
    </div>
  );
}
