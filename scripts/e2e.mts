/**
 * Test de bout en bout de la logique métier sur une base PGlite jetable :
 * numérotation séquentielle sans trou, limite de l'offre gratuite, calcul des totaux,
 * synchronisation de l'abonnement Stripe (sans appel réseau).
 * Lancer : npm run test:e2e
 */
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

const dir = `.data/e2e-${Date.now()}`;
process.env.PGLITE_DIR = dir;
delete process.env.DATABASE_URL;

const { getDb } = await import("../src/db");
const { users, profiles, clients, documents, counters } = await import("../src/db/schema");
const { issueDraft, freeLimitReached, invoicesIssuedThisMonth } = await import("../src/lib/documents");
const { computeTotals } = await import("../src/lib/money");
const { syncSubscription } = await import("../src/lib/stripe");
const { todayISO } = await import("../src/lib/dates");

const db = await getDb();
const ok = (m: string) => console.log(`  ✓ ${m}`);

// --- totaux
assert.deepEqual(computeTotals([{ description: "x", quantity: 2.5, unit: "h", unitPriceCents: 4000 }], 200), { subtotal: 10000, vat: 2000, total: 12000 });
ok("totaux HT / TVA / TTC");

// --- données
const [user] = await db.insert(users).values({ email: "e2e@example.com", name: "E2E", passwordHash: "x" }).returning();
const [profile] = await db.insert(profiles).values({ userId: user.id, fullName: "E2E", address: "1 rue", siret: "12345678900012" }).returning();
const [client] = await db.insert(clients).values({ userId: user.id, name: "Client" }).returning();
const today = todayISO();
const draft = async (type: "invoice" | "quote") =>
  (await db.insert(documents).values({ userId: user.id, clientId: client.id, type, issueDate: today, dueDate: today, items: [{ description: "p", quantity: 1, unit: "forfait", unitPriceCents: 10000 }] }).returning())[0];

// --- numérotation
const year = today.slice(0, 4);
const nums: (string | null)[] = [];
for (let i = 0; i < 3; i++) nums.push(await issueDraft(user.id, await draft("invoice"), profile, client));
assert.deepEqual(nums, [`F-${year}-0001`, `F-${year}-0002`, `F-${year}-0003`]);
ok("factures numérotées F-AAAA-0001…0003");
const q = await issueDraft(user.id, await draft("quote"), profile, client);
assert.equal(q, `D-${year}-0001`);
ok("séquence des devis indépendante (D-AAAA-0001)");

// --- pas de trou : ré-émettre un document déjà émis ne consomme aucun numéro
const [issued] = await db.select().from(documents).where(eq(documents.number, `F-${year}-0002`));
assert.equal(await issueDraft(user.id, issued, profile, client), null);
const [c] = await db.select().from(counters).where(eq(counters.kind, "invoice"));
assert.equal(c.seq, 3);
ok("ré-émission refusée, compteur inchangé (aucun trou)");

// --- le prochain numéro continue la séquence
assert.equal(await issueDraft(user.id, await draft("invoice"), profile, client), `F-${year}-0004`);
ok("séquence continue après refus");

// --- limite gratuite
assert.equal(await invoicesIssuedThisMonth(user.id), 4);
assert.equal(await freeLimitReached(user.id), true);
ok("limite de l'offre gratuite détectée (≥ 3 factures / mois)");

// --- abonnement Stripe → plan
await db.update(users).set({ stripeCustomerId: "cus_test_123" }).where(eq(users.id, user.id));
const sub = (status: string, extra: object = {}) =>
  ({ id: "sub_1", customer: "cus_test_123", status, cancel_at_period_end: false, cancel_at: null, items: { data: [{ current_period_end: 1893456000 }] }, ...extra }) as unknown as Stripe.Subscription;
const plan = async () => (await db.select().from(users).where(eq(users.id, user.id)))[0];

assert.equal(await syncSubscription(sub("active")), 1);
assert.equal((await plan()).plan, "pro");
ok("subscription active → plan Pro");
await syncSubscription(sub("active", { cancel_at_period_end: true }));
const u2 = await plan();
assert.equal(u2.plan, "pro");
assert.equal(u2.cancelAtPeriodEnd, true);
ok("résiliation programmée → Pro jusqu'à la fin de période");
await syncSubscription(sub("canceled"));
assert.equal((await plan()).plan, "free");
ok("subscription annulée → retour au plan gratuit");
assert.equal(await syncSubscription({ ...sub("active"), customer: "cus_inconnu" } as Stripe.Subscription), 0);
ok("client Stripe inconnu ignoré");

rmSync(dir, { recursive: true, force: true });
console.log("\nTous les tests passent ✔");
process.exit(0);
