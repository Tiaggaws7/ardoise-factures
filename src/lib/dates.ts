const TZ = "Europe/Paris";

/** Date du jour à Paris, au format AAAA-MM-JJ. */
export function todayISO(d = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }).format(d);
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function monthStartISO(d = new Date()): string {
  return `${todayISO(d).slice(0, 7)}-01`;
}

export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(`${iso.slice(0, 10)}T12:00:00Z`) : iso;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeZone: "UTC" }).format(d);
}

export function formatDateLong(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${iso}T12:00:00Z`),
  );
}

export function daysBetween(fromISO: string, toISO: string): number {
  return Math.round(
    (new Date(`${toISO}T12:00:00Z`).getTime() - new Date(`${fromISO}T12:00:00Z`).getTime()) / 86400000,
  );
}
