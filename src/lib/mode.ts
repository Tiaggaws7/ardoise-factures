/**
 * Mode Stripe, déduit de la seule clé secrète : `sk_live_` / `rk_live_` → production, sinon test.
 * Sans dépendance serveur : utilisable depuis les pages statiques (évalué au build).
 */
export const isTestMode = () => !/^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY ?? "");
