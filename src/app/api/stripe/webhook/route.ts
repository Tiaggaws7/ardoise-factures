import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { getStripe, syncSubscription } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Webhook Stripe : source de vérité de l'abonnement.
 * Événements écoutés : checkout.session.completed, customer.subscription.created|updated|deleted.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Webhook non configuré" }, { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription" || !session.subscription) break;
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
      const userId = session.client_reference_id;
      if (userId && customerId) {
        const db = await getDb();
        await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, userId));
      }
      const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
      await syncSubscription(await stripe.subscriptions.retrieve(subId));
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;
  }
  return NextResponse.json({ received: true });
}
