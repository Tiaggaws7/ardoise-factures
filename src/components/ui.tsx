import { STATUS_LABEL, type DisplayStatus } from "@/lib/document-status";

const TONES: Record<DisplayStatus, string> = {
  draft: "bg-line/70 text-muted",
  sent: "bg-info-soft text-info",
  overdue: "bg-bad-soft text-bad",
  paid: "bg-ok-soft text-ok",
  accepted: "bg-ok-soft text-ok",
  declined: "bg-bad-soft text-bad",
  expired: "bg-warn-soft text-warn",
  invoiced: "bg-accent-soft text-accent-dark",
};

export function StatusBadge({ status, type }: { status: DisplayStatus; type?: "quote" | "invoice" }) {
  const label = type === "invoice" && status === "sent" ? "Envoyée" : status === "accepted" && type === "quote" ? "Accepté" : STATUS_LABEL[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${TONES[status]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="h-display text-3xl font-semibold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-ink/60">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Empty({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-accent-soft text-2xl">✎</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-ink/60">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "ok" | "warn" | "bad"; children: React.ReactNode }) {
  const t = { info: "bg-info-soft text-info", ok: "bg-ok-soft text-ok", warn: "bg-warn-soft text-warn", bad: "bg-bad-soft text-bad" }[tone];
  return <div role="status" className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${t}`}>{children}</div>;
}
