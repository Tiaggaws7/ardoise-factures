import Link from "next/link";
import { CreditCard, FileText, LayoutDashboard, LogOut, Settings, Sparkles, Users } from "lucide-react";
import { logOut } from "@/actions/auth";
import { DemoBanner } from "@/components/demo-banner";
import { Logo } from "@/components/logo";
import { NavLink } from "@/components/nav-link";
import { DemoBar } from "@/components/demo-bar";
import { requireUser } from "@/lib/session";
import { isPro } from "@/lib/plan";

const NAV = [
  { href: "/tableau-de-bord", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/documents", label: "Devis & factures", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/profil", label: "Profil", icon: Settings },
  { href: "/abonnement", label: "Abonnement", icon: CreditCard },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser();
  const pro = isPro(user);
  return (
    <div className="min-h-dvh">
      <DemoBanner />
      {user.isDemo && <DemoBar pro={pro} />}
      <div className="lg:grid lg:grid-cols-[250px_1fr]">
        <aside className="hidden border-r border-line bg-chalk lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:p-5">
          <div className="px-2 pb-7 pt-1"><Logo href="/tableau-de-bord" /></div>
          <nav className="flex-1 space-y-1" aria-label="Application">
            {NAV.map((n) => (
              <NavLink key={n.href} href={n.href}><n.icon size={18} />{n.label}</NavLink>
            ))}
          </nav>
          {!pro && (
            <Link href="/abonnement" className="group mb-4 block rounded-2xl bg-slate p-4 text-chalk transition hover:-translate-y-0.5">
              <Sparkles size={18} className="text-accent" />
              <p className="mt-2 text-sm font-semibold">Passez en Pro</p>
              <p className="mt-0.5 text-xs text-chalk/60">Factures illimitées, 4 modèles, sans filigrane.</p>
            </Link>
          )}
          <div className="border-t border-line pt-4">
            <p className="truncate px-2 text-sm font-semibold">{user.name}</p>
            <p className="flex items-center gap-2 truncate px-2 text-xs text-muted">
              <span className={`rounded-full px-2 py-0.5 font-bold ${pro ? "bg-accent text-white" : "bg-line text-muted"}`}>{pro ? "PRO" : "GRATUIT"}</span>
              {user.isDemo ? "Démo" : user.email}
            </p>
            <form action={logOut}>
              <button className="mt-3 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm text-ink/70 transition hover:bg-paper hover:text-ink"><LogOut size={16} />Déconnexion</button>
            </form>
          </div>
        </aside>

        <div className="min-w-0 pb-24 lg:pb-0">
          <div className="flex items-center justify-between border-b border-line bg-chalk px-4 py-3 lg:hidden">
            <Logo href="/tableau-de-bord" />
            <form action={logOut}><button className="rounded-full p-2 text-ink/70" aria-label="Déconnexion"><LogOut size={18} /></button></form>
          </div>
          <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">{children}</main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-chalk/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Application (mobile)">
        {NAV.map((n) => (
          <NavLink key={n.href} href={n.href} mobile><n.icon size={20} /><span>{n.label.split(" ")[0]}</span></NavLink>
        ))}
      </nav>
    </div>
  );
}
