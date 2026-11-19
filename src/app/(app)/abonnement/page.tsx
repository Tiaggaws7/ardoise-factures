import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, CreditCard, ExternalLink } from "lucide-react";
import { openPortal, startCheckout } from "@/actions/billing";
import { Notice, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/form-bits";
import { pricing } from "@/config/site";
import { formatDate } from "@/lib/dates";
import { invoicesIssuedThisMonth } from "@/lib/documents";
import { FREE_INVOICES_PER_MONTH, isPro } from "@/lib/plan";
import { requireUser } from "@/lib/session";
import { getStripe, stripeConfigured, stripeIsTestMode, syncSubscription } from "@/lib/stripe";

export const metadata: Metadata = { title: "Abonnement" };

export default async function Page({ searchParams }: { searchParams: Promise<{ session_id?: string; msg?: string }> }) {
  const { session_id, msg } = await searchParams;
  const { user } = await requireUser();

  // Retour de Stripe Checkout : on synchronise tout de suite, sans attendre le webhook.
  if (session_id && stripeConfigured() && !user.isDemo) {
    try {
      const stripe = getStripe();
      const s = await stripe.checkout.sessions.retrieve(session_id);
      if (s.client_reference_id === user.id && s.subscription) {
        const subId = typeof s.subscription === "string" ? s.subscription : s.subscription.id;
        await syncSubscription(await stripe.subscriptions.retrieve(subId));
      }
    } catch (e) {
      console.error("Synchronisation Checkout échouée", e);
    }
    redirect("/abonnement?msg=bienvenue-pro");
  }

  const pro = isPro(user);
  const issued = await invoicesIssuedThisMonth(user.id);
  const configured = stripeConfigured();
  const fmt = (c: number) => (c / 100).toLocaleString("fr-FR", { maximumFractionDigits: 0 });

  return (
    <>
      <PageHeader title="Abonnement" subtitle={pro ? "Merci de soutenir Ardoise 🙏" : "Passez en Pro pour lever les limites."} />

      {msg === "bienvenue-pro" && <Notice tone="ok">🎉 Bienvenue dans l'offre Pro : factures illimitées et 4 modèles de PDF sont débloqués.</Notice>}
      {msg === "annule" && <Notice tone="info">Paiement annulé : vous n'avez rien payé.</Notice>}
      {msg === "demo" && <Notice tone="info">Le compte de démo ne passe pas par Stripe. Créez un vrai compte pour passer en Pro.</Notice>}
      {msg === "stripe-erreur" && <Notice tone="bad">Stripe a refusé la requête : vérifiez STRIPE_SECRET_KEY (clé de test valide) puis réessayez.</Notice>}
      {msg === "stripe-manquant" && <Notice tone="warn">Stripe n'est pas configuré : renseignez STRIPE_SECRET_KEY dans .env.local (voir le README).</Notice>}

      {user.isDemo ? (
        <div className="card p-8">
          <h2 className="text-lg font-semibold">Compte de démo</h2>
          <p className="mt-2 max-w-xl text-ink/70">
            Vous êtes sur l'offre <strong>{pro ? "Pro" : "Gratuite"}</strong>. Utilisez le bouton « Voir l'offre … » en haut de page pour comparer les deux expériences.
            Pour passer réellement en Pro, <Link href="/inscription" className="font-semibold text-accent hover:underline">créez un compte gratuit</Link> puis abonnez-vous.
          </p>
        </div>
      ) : pro ? (
        <div className="card relative overflow-hidden p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-accent/15 blur-2xl" />
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">PRO ACTIF</span>
          <h2 className="h-display mt-4 text-3xl font-semibold">Vous êtes en Pro.</h2>
          <p className="mt-2 text-ink/70">
            {user.cancelAtPeriodEnd
              ? <>Votre abonnement est résilié : il reste actif jusqu'au <strong>{formatDate(user.currentPeriodEnd)}</strong>, puis repasse en gratuit.</>
              : user.currentPeriodEnd
                ? <>Prochain renouvellement le <strong>{formatDate(user.currentPeriodEnd)}</strong>.</>
                : "Abonnement actif."}
          </p>
          <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
            {["Factures et devis illimités", "4 modèles de PDF", "Aucun filigrane", "Support prioritaire"].map((f) => (<li key={f} className="flex gap-2"><Check size={17} className="text-ok" />{f}</li>))}
          </ul>
          <form action={openPortal} className="mt-7">
            <SubmitButton className="btn btn-dark"><CreditCard size={16} />Gérer mon abonnement <ExternalLink size={14} /></SubmitButton>
          </form>
          <p className="mt-3 text-xs text-muted">Changer de carte, télécharger les reçus ou résilier : tout se fait sur le portail Stripe.</p>
        </div>
      ) : (
        <>
          <div className="card mb-6 flex flex-wrap items-center justify-between gap-4 p-5">
            <p className="text-sm"><strong>Offre gratuite</strong> · {issued} / {FREE_INVOICES_PER_MONTH} factures émises ce mois-ci</p>
            <div className="h-2 w-48 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, (issued / FREE_INVOICES_PER_MONTH) * 100)}%` }} /></div>
          </div>
          <form action={startCheckout} className="group">
            <input type="radio" name="interval" value="month" id="i-month" className="sr-only" defaultChecked />
            <input type="radio" name="interval" value="year" id="i-year" className="sr-only" />
            <div className="grid gap-4 sm:grid-cols-2">
              <label htmlFor="i-month" className="card cursor-pointer p-6 transition group-has-[#i-month:checked]:border-accent group-has-[#i-month:checked]:ring-4 group-has-[#i-month:checked]:ring-accent/15">
                <p className="font-semibold">Mensuel</p>
                <p className="mt-3"><span className="h-display text-5xl font-semibold">{fmt(pricing.monthlyCents)} €</span><span className="text-muted"> / mois</span></p>
                <p className="mt-2 text-sm text-muted">Sans engagement.</p>
              </label>
              <label htmlFor="i-year" className="card relative cursor-pointer p-6 transition group-has-[#i-year:checked]:border-accent group-has-[#i-year:checked]:ring-4 group-has-[#i-year:checked]:ring-accent/15">
                <span className="absolute right-4 top-4 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold text-white">2 mois offerts</span>
                <p className="font-semibold">Annuel</p>
                <p className="mt-3"><span className="h-display text-5xl font-semibold">{fmt(pricing.yearlyCents)} €</span><span className="text-muted"> / an</span></p>
                <p className="mt-2 text-sm text-muted">Soit {(pricing.yearlyCents / 1200).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} € par mois.</p>
              </label>
            </div>
            <ul className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
              {["Factures et devis illimités", "4 modèles de PDF élégants", "Plus de filigrane", "Annulation à tout moment"].map((f) => (<li key={f} className="flex gap-2"><Check size={17} className="text-ok" />{f}</li>))}
            </ul>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <SubmitButton className="btn btn-primary btn-lg">Passer en Pro avec Stripe</SubmitButton>
              {!configured && <span className="text-sm text-warn">Stripe n'est pas encore configuré (clés manquantes).</span>}
            </div>
            {configured && stripeIsTestMode() && (
              <p className="mt-4 rounded-xl bg-paper p-4 text-sm text-ink/70">
                <strong>Mode test :</strong> sur la page de paiement, saisissez la carte <code className="rounded bg-white px-1.5 py-0.5 font-mono">4242 4242 4242 4242</code>, une date future et un CVC quelconque. Aucun débit réel.
              </p>
            )}
          </form>
        </>
      )}
    </>
  );
}
