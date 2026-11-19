import "server-only";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { pricing } from "@/config/site";

let client: Stripe | null = null;

export const stripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);

/** Test ou live : uniquement déterminé par la clé secrète fournie. */
export { isTestMode as stripeIsTestMode } from "./mode";

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY manquante (voir .env.example).");
  return (client ??= new Stripe(key));
}

export const appUrl = () =>
  (process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3300").replace(/\/$/, "");

export type BillingInterval = "month" | "year";

/**
 * Prix déclarés « à la volée » (price_data) : aucun produit à créer à la main
 * dans Stripe. Pour utiliser des Prix existants, renseigner STRIPE_PRICE_MONTHLY /
 * STRIPE_PRICE_YEARLY.
 */
export function lineItemFor(interval: BillingInterval): Stripe.Checkout.SessionCreateParams.LineItem {
  const existing = interval === "month" ? process.env.STRIPE_PRICE_MONTHLY : process.env.STRIPE_PRICE_YEARLY;
  if (existing) return { price: existing, quantity: 1 };
  return {
    quantity: 1,
    price_data: {
      currency: pricing.currency.toLowerCase(),
      unit_amount: interval === "month" ? pricing.monthlyCents : pricing.yearlyCents,
      recurring: { interval },
      product_data: {
        name: "Ardoise Pro",
        description: "Factures et devis illimités, 4 modèles de PDF, sans filigrane.",
      },
    },
  };
}

/** Reporte l'état d'un abonnement Stripe dans notre base (appelé par le webhook et au retour de Checkout). */
export async function syncSubscription(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const active = sub.status === "active" || sub.status === "trialing" || sub.status === "past_due";
  const item = sub.items.data[0] as unknown as { current_period_end?: number } | undefined;
  const periodEnd =
    item?.current_period_end ?? (sub as unknown as { current_period_end?: number }).current_period_end;

  const db = await getDb();
  const updated = await db
    .update(users)
    .set({
      plan: active ? "pro" : "free",
      stripeSubscriptionId: sub.id,
      subscriptionStatus: sub.status,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end || Boolean(sub.cancel_at),
    })
    .where(eq(users.stripeCustomerId, customerId))
    .returning({ id: users.id });
  return updated.length;
}
