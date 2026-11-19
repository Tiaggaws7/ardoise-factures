/** Miniature HTML d'un modèle de PDF (pour la vitrine des modèles). */
export function MiniInvoice({ variant }: { variant: "classique" | "moderne" | "minimal" | "elegant" }) {
  const lines = [70, 55, 62];
  const base = "relative aspect-[1/1.38] w-full overflow-hidden rounded-md bg-white p-[9%] text-[0] shadow-[0_18px_40px_-18px_rgb(23_32_42/0.45)] ring-1 ring-black/5";
  if (variant === "moderne")
    return (
      <div className={`${base} !p-0`}>
        <div className="flex h-[22%] items-end justify-between bg-accent px-[9%] pb-[5%]">
          <div><div className="h-[7px] w-14 rounded bg-white" /><div className="mt-1.5 h-[4px] w-8 rounded bg-white/60" /></div>
          <div className="h-[6px] w-10 rounded bg-white/70" />
        </div>
        <div className="px-[9%] pt-[7%]">
          <div className="mb-3 flex justify-between"><div className="h-[4px] w-14 rounded bg-ink/20" /><div className="h-[4px] w-14 rounded bg-ink/20" /></div>
          <div className="mb-1.5 h-[9px] rounded bg-slate" />
          {lines.map((w, i) => (<div key={i} className="mb-2 flex justify-between border-b border-line pb-1.5"><div className="h-[4px] rounded bg-ink/25" style={{ width: `${w}%` }} /><div className="h-[4px] w-5 rounded bg-ink/40" /></div>))}
          <div className="ml-auto mt-3 flex h-[14px] w-[55%] items-center justify-end rounded bg-accent pr-1.5"><div className="h-[4px] w-8 rounded bg-white" /></div>
        </div>
      </div>
    );
  if (variant === "elegant")
    return (
      <div className={`${base} !bg-[#fbf7ef]`}>
        <div className="flex flex-col items-center"><div className="h-[5px] w-12 rounded bg-ink/60" /><div className="my-2 h-px w-8 bg-[#a2762c]" /><div className="h-[9px] w-16 rounded bg-ink/80" /><div className="mt-1.5 h-[4px] w-8 rounded bg-[#a2762c]" /></div>
        <div className="mt-[9%] flex justify-between"><div className="h-[4px] w-12 rounded bg-ink/20" /><div className="h-[4px] w-12 rounded bg-ink/20" /></div>
        <div className="mt-[8%]">
          {lines.map((w, i) => (<div key={i} className="mb-2 flex justify-between border-b border-[#e3d9c6] pb-1.5"><div className="h-[4px] rounded bg-ink/25" style={{ width: `${w}%` }} /><div className="h-[4px] w-5 rounded bg-ink/40" /></div>))}
          <div className="ml-auto mt-3 flex h-[14px] w-[55%] items-center justify-between rounded bg-[#f1e8d3] px-1.5"><div className="h-[4px] w-6 rounded bg-ink/50" /><div className="h-[5px] w-7 rounded bg-[#a2762c]" /></div>
        </div>
      </div>
    );
  if (variant === "minimal")
    return (
      <div className={base}>
        <div className="flex justify-between"><div><div className="h-[3px] w-6 rounded bg-ink/30" /><div className="mt-1.5 h-[10px] w-16 rounded bg-ink" /></div><div className="h-[7px] w-9 rounded bg-ink/30" /></div>
        <div className="mt-[14%] flex justify-between"><div className="h-[4px] w-12 rounded bg-ink/15" /><div className="h-[4px] w-12 rounded bg-ink/15" /></div>
        <div className="mt-[10%]">
          {lines.map((w, i) => (<div key={i} className="mb-2.5 flex justify-between border-b border-ink/10 pb-2"><div className="h-[3px] rounded bg-ink/20" style={{ width: `${w}%` }} /><div className="h-[3px] w-5 rounded bg-ink/40" /></div>))}
          <div className="ml-auto mt-4 h-[9px] w-12 rounded bg-ink" />
        </div>
      </div>
    );
  return (
    <div className={base}>
      <div className="flex justify-between"><div className="h-[9px] w-14 rounded bg-slate" /><div className="text-right"><div className="ml-auto h-[8px] w-12 rounded bg-ink" /><div className="ml-auto mt-1 h-[3px] w-8 rounded bg-ink/30" /></div></div>
      <div className="mt-[10%] flex justify-between"><div className="h-[4px] w-12 rounded bg-ink/20" /><div className="h-[4px] w-12 rounded bg-ink/20" /></div>
      <div className="mt-[8%] h-[9px] rounded-sm bg-paper" />
      {lines.map((w, i) => (<div key={i} className="mt-2 flex justify-between border-b border-line pb-1.5"><div className="h-[4px] rounded bg-ink/25" style={{ width: `${w}%` }} /><div className="h-[4px] w-5 rounded bg-ink/40" /></div>))}
      <div className="ml-auto mt-3 h-[9px] w-[45%] border-t-2 border-ink pt-1"><div className="ml-auto h-[5px] w-8 rounded bg-ink" /></div>
    </div>
  );
}
