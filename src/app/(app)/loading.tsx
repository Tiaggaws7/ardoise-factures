export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Chargement">
      <div className="skeleton mb-3 h-10 w-64" />
      <div className="skeleton mb-10 h-5 w-96 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-3"><div className="skeleton h-28" /><div className="skeleton h-28" /><div className="skeleton h-28" /></div>
      <div className="skeleton mt-6 h-72" />
    </div>
  );
}
