"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/session";
import {
  appUrl,
  getStripe,
  lineItemFor,
  stripeConfigured,
  type BillingInterval,
} from "@/lib/stripe";

async function ensureCustomer(userId: string, email: string, name: string, existing: string | null) {
  if (existing) return existing;
  const stripe = getStripe();
  const customer = await stripe.customers.create({ email, name, metadata: { userId } });
  const db = await getDb();
  await db.update(users).set({ stripeCustomerId: customer.id }).where(eq(users.id, userId));
  return customer.id;
}

/** Ouvre Stripe Checkout en mode abonnement. */
export async function startCheckout(formData: FormData) {
  const { user } = await requireUser();
  if (user.isDemo) redirect("/abonnement?msg=demo");
  if (!stripeConfigured()) redirect("/abonnement?msg=stripe-manquant");
  if (user.plan === "pro") redirect("/abonnement");
  const interval: BillingInterval = formData.get("interval") === "year" ? "year" : "month";

  let url: string;
  try {
    const customer = await ensureCustomer(user.id, user.email, user.name, user.stripeCustomerId);
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer,
      client_reference_id: user.id,
      line_items: [lineItemFor(interval)],
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url: `${appUrl()}/abonnement?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl()}/abonnement?msg=annule`,
      locale: "fr",
      // Service numérique exécuté immédiatement : information de renonciation à la rétractation (art. L221-28).
      custom_text: {
        submit: {
          message: `En vous abonnant, vous acceptez les CGV (${appUrl()}/cgu-cgv) et demandez l'exécution immédiate du service : vous renoncez à votre droit de rétractation.`,
        },
      },
    });
    url = session.url!;
  } catch (e) {
    console.error("Stripe Checkout", e);
    redirect("/abonnement?msg=stripe-erreur");
  }
  redirect(url);
}

/** Ouvre le Customer Portal (changer de carte, résilier, factures). */
export async function openPortal() {
  const { user } = await requireUser();
  if (!user.stripeCustomerId || !stripeConfigured()) redirect("/abonnement");
  const stripe = getStripe();
  const params = { customer: user.stripeCustomerId, return_url: `${appUrl()}/abonnement` };
  let url: string;
  try {
    url = (await stripe.billingPortal.sessions.create(params)).url;
  } catch (e) {
    // Première utilisation : aucune configuration de portail n'existe encore dans le compte Stripe.
    if (!String((e as Error).message).toLowerCase().includes("configuration")) throw e;
    const configuration = await stripe.billingPortal.configurations.create({
      business_profile: { headline: "Gérer mon abonnement Ardoise" },
      features: {
        invoice_history: { enabled: true },
        payment_method_update: { enabled: true },
        customer_update: { enabled: true, allowed_updates: ["email", "name", "address"] },
        subscription_cancel: { enabled: true, mode: "at_period_end" },
      } as Stripe.BillingPortal.ConfigurationCreateParams["features"],
    });
    url = (await stripe.billingPortal.sessions.create({ ...params, configuration: configuration.id })).url;
  }
  redirect(url);
}
