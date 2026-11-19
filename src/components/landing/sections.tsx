import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Check,
  ChevronDown,
  FileCheck2,
  FileSignature,
  Hash,
  LineChart,
  Palette,
  Sparkles,
} from "lucide-react";
import { startDemo } from "@/actions/auth";
import { Logo } from "@/components/logo";
import { brand, pricing } from "@/config/site";
import { MiniInvoice } from "./mini-invoice";

export function DemoButton({ className = "btn btn-ghost btn-lg", children = "Essayer la démo" }: { className?: string; children?: React.ReactNode }) {
  return (
    <form action={startDemo}>
      <button className={className} type="submit">{children}</button>
    </form>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink/75 md:flex" aria-label="Navigation principale">
          <a href="#fonctionnalites" className="transition hover:text-ink">Fonctionnalités</a>
          <a href="#modeles" className="transition hover:text-ink">Modèles</a>
          <a href="#tarifs" className="transition hover:text-ink">Tarifs</a>
          <a href="#faq" className="transition hover:text-ink">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/connexion" className="hidden px-3 text-sm font-medium text-ink/75 transition hover:text-ink sm:block">Connexion</Link>
          <Link href="/inscription" className="btn btn-dark btn-sm">Commencer</Link>
        </div>
      </div>
    </header>
  );
}

export function Hero({ preview }: { preview: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(60%_60%_at_80%_0%,rgb(228_87_46/0.14),transparent_70%),radial-gradient(50%_60%_at_5%_10%,rgb(29_40_51/0.08),transparent_70%)]" />
      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-14 text-center sm:px-6 sm:pt-20">
        <p className="mx-auto mb-6 inline-flex animate-rise items-center gap-2 rounded-full border border-line bg-chalk px-3.5 py-1.5 text-[13px] font-medium text-ink/80 shadow-card">
          <Sparkles size={14} className="text-accent" /> Pensé pour les freelances et micro-entrepreneurs
        </p>
        <h1 className="h-display mx-auto max-w-4xl text-[2.6rem] font-semibold leading-[1.04] sm:text-6xl lg:text-[4.4rem]">
          Des factures qui font pro,{" "}
          <span className="relative inline-block whitespace-nowrap italic text-accent">
            en deux minutes
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 14" fill="none" preserveAspectRatio="none" aria-hidden="true">
              <path d="M3 9c40-7 90-8 140-4s100 4 154-2" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </span>
          .
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-ink/70">
          {brand.name} crée vos devis et factures avec numérotation, TVA et mentions légales justes, les transforme en PDF élégants
          et vous montre qui vous doit quoi. Gratuit pour démarrer.
        </p>
        <div className="mt-9 flex animate-rise flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: "220ms" }}>
          <Link href="/inscription" className="btn btn-primary btn-lg">
            Créer mon compte gratuit <ArrowRight size={18} />
          </Link>
          <DemoButton>Essayer la démo — sans inscription</DemoButton>
        </div>
        <p className="mt-4 animate-rise text-[13px] text-muted" style={{ animationDelay: "280ms" }}>
          Aucune carte bancaire · 3 factures offertes chaque mois
        </p>
      </div>
      <div className="relative mx-auto max-w-6xl animate-rise px-4 pb-24 pt-6 sm:px-6" style={{ animationDelay: "340ms" }}>
        <div className="float-slow">{preview}</div>
      </div>
    </section>
  );
}

function ConvertVisual() {
  return (
    <div className="mt-7 flex items-center gap-3 text-[11px] font-semibold" aria-hidden="true">
      <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.06] p-3.5">
        <p className="text-chalk/50">DEVIS · D-2026-0007</p>
        <p className="mt-1 text-base text-chalk">1 450 €</p>
        <span className="mt-2 inline-block rounded-full bg-ok/20 px-2 py-0.5 text-[#6ee0aa]">Accepté</span>
      </div>
      <ArrowRight className="shrink-0 text-accent" size={22} />
      <div className="flex-1 rounded-xl border border-accent/40 bg-accent/10 p-3.5">
        <p className="text-chalk/50">FACTURE · F-2026-0012</p>
        <p className="mt-1 text-base text-chalk">1 450 €</p>
        <span className="mt-2 inline-block rounded-full bg-white/10 px-2 py-0.5 text-chalk/80">Brouillon</span>
      </div>
    </div>
  );
}

function ChartVisual() {
  const h = [38, 56, 44, 70, 52, 84, 62, 96];
  return (
    <div className="mt-7 flex h-24 items-end gap-2" aria-hidden="true">
      {h.map((v, i) => (
        <div key={i} className={`flex-1 rounded-t-md ${i === h.length - 1 ? "bg-accent" : "bg-white/20"}`} style={{ height: `${v}%` }} />
      ))}
    </div>
  );
}

const FEATURES = [
  { icon: FileSignature, title: "Du devis à la facture, en un clic", text: "Le client accepte ? Transformez le devis en facture : lignes, tarifs et client sont repris. Rien à ressaisir.", span: "lg:col-span-2", visual: "convert" },
  { icon: Hash, title: "Numérotation sans trou", text: "Séquence continue D-2026-0001, F-2026-0001… attribuée à l'émission, comme l'exige la loi.", span: "" },
  { icon: BadgeCheck, title: "Mentions légales prêtes", text: "SIRET, IBAN, « TVA non applicable, art. 293 B du CGI », pénalités de retard : saisies une fois, ajoutées partout.", span: "" },
  { icon: Palette, title: "PDF dignes d'un studio", text: "Quatre modèles soignés, votre logo, vos couleurs. Téléchargement instantané.", span: "" },
  { icon: Banknote, title: "Suivi des paiements", text: "Brouillon, envoyée, payée, en retard : le retard est détecté tout seul à l'échéance.", span: "" },
  { icon: LineChart, title: "Tableau de bord clair", text: "Chiffre d'affaires par mois, factures en attente, impayés en retard : l'essentiel d'un coup d'œil.", span: "lg:col-span-2", visual: "chart" },
];

export function Features() {
  return (
    <section id="fonctionnalites" className="relative overflow-hidden bg-slate py-24 text-chalk grain sm:py-32">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="reveal max-w-2xl">
          <p className="eyebrow">Fonctionnalités</p>
          <h2 className="h-display mt-3 text-4xl font-semibold leading-tight sm:text-5xl">Tout ce qu'il faut, rien de superflu.</h2>
          <p className="mt-4 text-lg text-chalk/65">Une facturation pensée pour celles et ceux qui préfèrent facturer plutôt que remplir des cases.</p>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text, span, visual }) => (
            <article
              key={title}
              className={`reveal group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-7 transition duration-300 hover:-translate-y-1 hover:border-accent/50 hover:bg-white/[0.07] ${span}`}
            >
              <span className="mb-5 grid size-11 place-items-center rounded-2xl bg-accent/15 text-accent transition group-hover:bg-accent group-hover:text-white">
                <Icon size={21} />
              </span>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-2 leading-relaxed text-chalk/65">{text}</p>
              {visual === "convert" && <ConvertVisual />}
              {visual === "chart" && <ChartVisual />}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Steps() {
  const steps = [
    ["1", "Votre profil, une seule fois", "Identité, SIRET, régime de TVA, IBAN et logo. Ardoise les reporte sur chaque document."],
    ["2", "Un devis, puis une facture", "Ajoutez vos lignes, envoyez le devis, transformez-le en facture quand il est accepté."],
    ["3", "Un PDF, un suivi", "Téléchargez le PDF, marquez la facture payée, surveillez les retards depuis le tableau de bord."],
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
      <div className="reveal mx-auto max-w-2xl text-center">
        <p className="eyebrow">Comment ça marche</p>
        <h2 className="h-display mt-3 text-4xl font-semibold leading-tight sm:text-5xl">De zéro à votre première facture en cinq minutes.</h2>
      </div>
      <ol className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map(([n, t, d]) => (
          <li key={n} className="reveal card relative p-8">
            <span className="h-display absolute right-6 top-3 text-7xl font-semibold text-accent/15">{n}</span>
            <h3 className="relative text-xl font-semibold">{t}</h3>
            <p className="relative mt-3 leading-relaxed text-ink/65">{d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Templates() {
  const items = [
    ["classique", "Classique", "Inclus gratuitement"],
    ["moderne", "Moderne", "Pro"],
    ["minimal", "Minimal", "Pro"],
    ["elegant", "Élégant", "Pro"],
  ] as const;
  return (
    <section id="modeles" className="border-y border-line bg-chalk py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="reveal max-w-2xl">
          <p className="eyebrow">Modèles de PDF</p>
          <h2 className="h-display mt-3 text-4xl font-semibold leading-tight sm:text-5xl">Un document qui vous ressemble.</h2>
          <p className="mt-4 text-lg text-ink/65">Vos clients jugent le sérieux d'un freelance à ses documents. Choisissez le ton, {brand.name} s'occupe de la mise en page.</p>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-6 md:grid-cols-4">
          {items.map(([id, name, tag], i) => (
            <figure key={id} className="reveal group" style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="transition duration-500 group-hover:-translate-y-2 group-hover:rotate-[-1deg]">
                <MiniInvoice variant={id} />
              </div>
              <figcaption className="mt-4 flex items-center justify-between">
                <span className="font-semibold">{name}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tag === "Pro" ? "bg-accent-soft text-accent-dark" : "bg-line/70 text-muted"}`}>{tag}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

const fmt = (c: number) => (c / 100).toLocaleString("fr-FR", { maximumFractionDigits: 0 });

export function Pricing() {
  const free = ["3 factures par mois", "Devis et clients illimités", "Modèle de PDF classique", "Tableau de bord et suivi des paiements"];
  const pro = ["Factures et devis illimités", "4 modèles de PDF, sans filigrane", "Logo et IBAN sur chaque document", "Annulation en un clic, à tout moment"];
  return (
    <section id="tarifs" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
      <div className="reveal mx-auto max-w-2xl text-center">
        <p className="eyebrow">Tarifs</p>
        <h2 className="h-display mt-3 text-4xl font-semibold leading-tight sm:text-5xl">Gratuit pour démarrer. Pro quand vous grandissez.</h2>
      </div>

      <div className="group mt-12">
        <input type="radio" name="billing" id="billing-month" className="peer sr-only" defaultChecked aria-label="Facturation mensuelle" />
        <input type="radio" name="billing" id="billing-year" className="peer sr-only" aria-label="Facturation annuelle" />
        <div className="mx-auto mb-10 flex w-fit rounded-full border border-line bg-chalk p-1 text-sm font-semibold">
          <label htmlFor="billing-month" className="cursor-pointer rounded-full px-5 py-2 transition group-has-[#billing-month:checked]:bg-slate group-has-[#billing-month:checked]:text-chalk">Mensuel</label>
          <label htmlFor="billing-year" className="cursor-pointer rounded-full px-5 py-2 transition group-has-[#billing-year:checked]:bg-slate group-has-[#billing-year:checked]:text-chalk">
            Annuel <span className="ml-1 rounded-full bg-accent px-2 py-0.5 text-[11px] text-white">2 mois offerts</span>
          </label>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          <article className="reveal card flex flex-col p-8">
            <h3 className="text-lg font-semibold">Gratuit</h3>
            <p className="mt-4 flex items-baseline gap-1"><span className="h-display text-6xl font-semibold">0 €</span><span className="text-muted">/ mois</span></p>
            <p className="mt-2 text-sm text-muted">Pour tester et facturer ponctuellement.</p>
            <ul className="mt-7 flex-1 space-y-3">
              {free.map((f) => (<li key={f} className="flex gap-3 text-[15px]"><Check size={18} className="mt-0.5 shrink-0 text-ok" />{f}</li>))}
              <li className="flex gap-3 text-[15px] text-muted"><Check size={18} className="mt-0.5 shrink-0 text-muted" />Filigrane « Créé avec Ardoise » sur le PDF</li>
            </ul>
            <Link href="/inscription" className="btn btn-ghost mt-8">Commencer gratuitement</Link>
          </article>

          <article className="reveal relative flex flex-col overflow-hidden rounded-2xl bg-slate p-8 text-chalk shadow-float grain">
            <span className="absolute right-6 top-6 rounded-full bg-accent px-3 py-1 text-xs font-bold">Le plus choisi</span>
            <h3 className="relative text-lg font-semibold">Pro</h3>
            <div className="relative mt-4">
              <p className="price-month flex items-baseline gap-1"><span className="h-display text-6xl font-semibold">{fmt(pricing.monthlyCents)} €</span><span className="text-chalk/60">/ mois</span></p>
              <p className="price-year flex items-baseline gap-1"><span className="h-display text-6xl font-semibold">{fmt(pricing.yearlyCents)} €</span><span className="text-chalk/60">/ an</span></p>
            </div>
            <p className="price-month relative mt-2 text-sm text-chalk/60">Sans engagement.</p>
            <p className="price-year relative mt-2 text-sm text-chalk/60">Soit {(pricing.yearlyCents / 1200).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} € par mois.</p>
            <ul className="relative mt-7 flex-1 space-y-3">
              {pro.map((f) => (<li key={f} className="flex gap-3 text-[15px]"><Check size={18} className="mt-0.5 shrink-0 text-accent" />{f}</li>))}
            </ul>
            <Link href="/inscription?offre=pro" className="btn btn-primary relative mt-8">Passer en Pro</Link>
          </article>
        </div>
        <p className="mt-6 text-center text-[13px] text-muted">
          Démonstration : le paiement passe par Stripe en <strong>mode test</strong> — utilisez la carte 4242 4242 4242 4242. Aucun débit réel.
        </p>
      </div>
    </section>
  );
}

const QA = [
  ["Mes factures sont-elles conformes ?", "Ardoise ajoute les mentions usuelles obligatoires : numéro séquentiel sans rupture, dates, identité des deux parties, SIRET, détail des prestations, régime de TVA, conditions de règlement et pénalités de retard. Vous restez responsable du contenu : en cas de doute, rapprochez-vous de votre expert-comptable."],
  ["Je suis en franchise de TVA, ça marche ?", "Oui. Choisissez « TVA non applicable, art. 293 B du CGI » dans votre profil : la mention est ajoutée automatiquement et aucune TVA n'est calculée. Si vous êtes assujetti, indiquez votre numéro de TVA et choisissez le taux par document."],
  ["Comment fonctionne la numérotation ?", "Chaque document reçoit son numéro (D-2026-0001, F-2026-0001…) au moment de l'émission, pas avant : les brouillons n'en ont pas, donc la séquence ne comporte jamais de trou. Une facture émise ne peut plus être modifiée."],
  ["Que se passe-t-il à la limite de 3 factures ?", "Dans l'offre gratuite, vous pouvez émettre 3 factures par mois civil. Vos brouillons, devis et clients restent disponibles ; passez en Pro pour lever la limite instantanément."],
  ["Puis-je annuler le Pro ?", "À tout moment depuis votre espace abonnement (portail Stripe). Vous gardez le Pro jusqu'à la fin de la période payée, puis vous repassez en gratuit sans rien perdre."],
  ["Est-ce un vrai service ?", "C'est un projet de démonstration qui fonctionne de bout en bout, publié en open source. Les paiements sont en mode test : aucune somme n'est débitée. Utilisez le bouton « Essayer la démo » pour explorer avec des données fictives."],
  ["Mes données sont-elles protégées ?", "Mots de passe hachés (bcrypt), connexions chiffrées, base Postgres hébergée en Europe. Détails dans la politique de confidentialité."],
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-line bg-chalk py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="reveal text-center">
          <p className="eyebrow">FAQ</p>
          <h2 className="h-display mt-3 text-4xl font-semibold leading-tight sm:text-5xl">Questions fréquentes</h2>
        </div>
        <div className="mt-12 divide-y divide-line rounded-2xl border border-line bg-paper/60">
          {QA.map(([q, a]) => (
            <details key={q} className="group px-6 py-5">
              <summary className="flex items-center justify-between gap-4 text-left text-[17px] font-semibold">
                {q}
                <ChevronDown className="chev shrink-0 text-muted transition-transform duration-300" size={20} />
              </summary>
              <p className="mt-3 leading-relaxed text-ink/70">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="px-4 pb-24 pt-8 sm:px-6">
      <div className="reveal relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-slate px-6 py-16 text-center text-chalk grain sm:py-24">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-accent/25 blur-3xl" />
        <FileCheck2 className="relative mx-auto text-accent" size={36} />
        <h2 className="h-display relative mx-auto mt-5 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">Votre prochaine facture mérite mieux qu'un tableur.</h2>
        <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/inscription" className="btn btn-primary btn-lg">Créer mon compte gratuit <ArrowRight size={18} /></Link>
          <DemoButton className="btn btn-lg border border-white/20 text-chalk hover:bg-white/10">Essayer la démo</DemoButton>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 py-12 sm:flex-row sm:px-6">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm text-muted">{brand.tagline}</p>
          <p className="mt-3 text-xs text-muted">Projet de démonstration — paiements en mode test.</p>
        </div>
        <nav className="grid grid-cols-2 gap-x-14 gap-y-2 text-sm" aria-label="Pied de page">
          <Link href="/mentions-legales" className="text-ink/70 hover:text-ink">Mentions légales</Link>
          <Link href="/cgu-cgv" className="text-ink/70 hover:text-ink">CGU / CGV</Link>
          <Link href="/confidentialite" className="text-ink/70 hover:text-ink">Confidentialité</Link>
          <a href={brand.repoUrl} className="text-ink/70 hover:text-ink" rel="noopener">Code source</a>
          <Link href="/connexion" className="text-ink/70 hover:text-ink">Connexion</Link>
          <Link href="/inscription" className="text-ink/70 hover:text-ink">Inscription</Link>
        </nav>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-muted">© {new Date().getFullYear()} {brand.name}</div>
    </footer>
  );
}
