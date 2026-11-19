import Link from "next/link";
import { DemoButton } from "@/components/landing/sections";
import { Logo } from "@/components/logo";
import { DemoBanner } from "@/components/demo-banner";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <>
      <DemoBanner />
      <div className="grid min-h-[calc(100dvh-34px)] lg:grid-cols-[1.05fr_1fr]">
        <aside className="grain relative hidden overflow-hidden bg-slate p-12 text-chalk lg:flex lg:flex-col lg:justify-between">
          <div className="relative"><Logo light /></div>
          <div className="relative max-w-md">
            <p className="h-display text-5xl font-semibold leading-[1.08]">Facturez comme un <span className="text-[#6f9bff]">studio</span>, sans le tableur.</p>
            <ul className="mt-8 space-y-3 text-chalk/70">
              <li>✓ Numérotation séquentielle et mentions légales</li>
              <li>✓ PDF élégants, en un clic</li>
              <li>✓ 3 factures offertes chaque mois</li>
            </ul>
          </div>
          <div className="pointer-events-none absolute -bottom-32 -right-24 size-[420px] rounded-full bg-accent/25 blur-3xl" />
          <p className="relative text-sm text-chalk/50">Projet de démonstration</p>
        </aside>
        <main className="flex items-center justify-center px-5 py-12">
          <div className="w-full max-w-sm animate-rise">
            <div className="mb-8 lg:hidden"><Logo /></div>
            <h1 className="h-display text-4xl font-semibold">{title}</h1>
            <p className="mt-2 text-ink/65">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-6 text-center text-sm text-ink/70">{footer}</div>
            <div className="mt-8 border-t border-line pt-6 text-center">
              <p className="mb-3 text-sm text-muted">Juste envie de jeter un œil ?</p>
              <DemoButton className="btn btn-ghost btn-sm">Essayer la démo</DemoButton>
            </div>
            <p className="mt-6 text-center text-xs"><Link href="/" className="text-muted hover:text-ink">← Retour à l'accueil</Link></p>
          </div>
        </main>
      </div>
    </>
  );
}
