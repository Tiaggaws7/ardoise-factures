import "server-only";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq, and, lt } from "drizzle-orm";
import { getDb } from "@/db";
import {
  clients,
  counters,
  documents,
  profiles,
  users,
  type LineItem,
} from "@/db/schema";
import { DEMO } from "@/config/site";
import { addDaysISO, todayISO } from "./dates";
import { clientSnapshot, sellerSnapshot } from "./documents";

type SeedDoc = {
  type: "quote" | "invoice";
  client: number;
  status: "draft" | "sent" | "accepted" | "declined" | "paid";
  /** Jours par rapport à aujourd'hui (négatif = passé). */
  offset: number;
  subject: string;
  items: [string, number, string, number][]; // description, qté, unité, prix € HT
  term: number; // jours avant échéance / validité
  fromQuote?: number; // index d'un devis source
};

const SEED_CLIENTS = [
  { name: "Maison Alba", contact: "Inès Alba", email: "ines@maison-alba.example", address: "8 place des Capucins", postalCode: "33800", city: "Bordeaux", siret: "812 345 678 00019" },
  { name: "Cabinet Moreau Architectes", contact: "Paul Moreau", email: "paul@moreau-archi.example", address: "27 cours de l'Intendance", postalCode: "33000", city: "Bordeaux", siret: "752 987 431 00026" },
  { name: "Brasserie du Port", contact: "Marc Delmas", email: "contact@brasserie-du-port.example", address: "2 quai des Chartrons", postalCode: "33300", city: "Bordeaux", siret: "901 234 567 00014" },
  { name: "Studio Nova", contact: "Sarah Benali", email: "sarah@studio-nova.example", address: "14 rue Sainte-Catherine", postalCode: "33000", city: "Bordeaux", siret: "843 210 987 00033" },
  { name: "Léa Fontaine", contact: "", email: "lea.fontaine@example.com", address: "5 allée des Pins", postalCode: "33200", city: "Bordeaux", siret: "" },
];

const SEED_DOCS: SeedDoc[] = [
  { type: "invoice", client: 0, status: "paid", offset: -230, subject: "Identité visuelle — logo & charte", items: [["Création du logotype (3 pistes + finalisation)", 1, "forfait", 1400], ["Charte graphique (PDF 12 pages)", 1, "forfait", 600]], term: 30 },
  { type: "invoice", client: 1, status: "paid", offset: -200, subject: "Plaquette commerciale 8 pages", items: [["Conception graphique de la plaquette", 1, "forfait", 1200], ["Retouches photos", 6, "heure", 55]], term: 30 },
  { type: "invoice", client: 2, status: "paid", offset: -170, subject: "Cartes de menu & ardoises", items: [["Création de 2 menus (recto-verso)", 2, "pièce", 380], ["Adaptation ardoise extérieure", 1, "forfait", 150]], term: 15 },
  { type: "invoice", client: 3, status: "paid", offset: -140, subject: "Refonte du site vitrine — design", items: [["Maquettes UI (5 pages)", 5, "page", 320], ["Kit de composants Figma", 1, "forfait", 480]], term: 30 },
  { type: "invoice", client: 0, status: "paid", offset: -105, subject: "Packaging boîte à gâteaux", items: [["Design packaging + dieline", 1, "forfait", 950], ["Déclinaison 3 formats", 3, "pièce", 120]], term: 30 },
  { type: "invoice", client: 1, status: "paid", offset: -75, subject: "Signalétique cabinet", items: [["Conception plaques et vitrophanie", 1, "forfait", 1100]], term: 30 },
  { type: "invoice", client: 3, status: "paid", offset: -48, subject: "Direction artistique campagne printemps", items: [["Direction artistique", 3, "jour", 420], ["Déclinaisons réseaux sociaux (12 visuels)", 12, "pièce", 45]], term: 30 },
  { type: "invoice", client: 2, status: "sent", offset: -49, subject: "Affiches soirée dégustation", items: [["Création affiche A2 + déclinaisons", 1, "forfait", 520]], term: 30 }, // en retard
  { type: "invoice", client: 4, status: "sent", offset: -41, subject: "Faire-part de mariage", items: [["Création faire-part + menu + plan de table", 1, "forfait", 640]], term: 30 }, // en retard
  { type: "quote", client: 1, status: "accepted", offset: -30, subject: "Rapport annuel 2026 — mise en page", items: [["Mise en page du rapport (32 pages)", 32, "page", 38], ["Infographies (6)", 6, "pièce", 90]], term: 30 },
  { type: "invoice", client: 3, status: "sent", offset: -12, subject: "Illustrations de blog (lot 1)", items: [["Illustrations éditoriales", 6, "pièce", 140]], term: 30 },
  { type: "invoice", client: 0, status: "sent", offset: -4, subject: "Refonte étiquettes confitures", items: [["Design des étiquettes (4 parfums)", 4, "pièce", 210], ["Fichiers d'impression", 1, "forfait", 80]], term: 30 },
  { type: "quote", client: 2, status: "sent", offset: -6, subject: "Habillage vitrine d'hiver", items: [["Conception visuels vitrine", 1, "forfait", 780], ["Suivi de pose", 2, "heure", 55]], term: 30 },
  { type: "quote", client: 4, status: "draft", offset: 0, subject: "Carte de vœux personnalisée", items: [["Illustration + mise en page", 1, "forfait", 260]], term: 30 },
  { type: "invoice", client: 3, status: "draft", offset: 0, subject: "Illustrations de blog (lot 2)", items: [["Illustrations éditoriales", 4, "pièce", 140]], term: 30 },
];

async function seedProfileAndData(userId: string) {
  const db = await getDb();
  await db
    .insert(profiles)
    .values({
      userId,
      businessName: "Atelier Laurent",
      fullName: "Camille Laurent",
      address: "12 rue des Tanneurs",
      postalCode: "33000",
      city: "Bordeaux",
      email: "camille@atelier-laurent.example",
      phone: "06 12 34 56 78",
      siret: "123 456 789 00012",
      vatRegime: "franchise",
      iban: "FR76 3000 6000 0112 3456 7890 189",
      bic: "AGRIFRPP",
      paymentDays: 30,
      template: "classique",
    })
    .onConflictDoNothing();
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));

  const insertedClients = await db
    .insert(clients)
    .values(SEED_CLIENTS.map((c) => ({ ...c, userId })))
    .returning();
  // returning() ne garantit pas l'ordre : on réaligne sur la liste d'origine.
  const byName = new Map(insertedClients.map((c) => [c.name, c]));
  const clientList = SEED_CLIENTS.map((c) => byName.get(c.name)!);

  const today = todayISO();
  // Attribue les numéros dans l'ordre chronologique, par type et par année.
  const order = SEED_DOCS.map((d, i) => ({ d, i })).sort((a, b) => a.d.offset - b.d.offset);
  const seq = new Map<string, number>();
  const numbers = new Map<number, string>();
  for (const { d, i } of order) {
    if (d.status === "draft") continue;
    const year = addDaysISO(today, d.offset).slice(0, 4);
    const key = `${d.type}-${year}`;
    const n = (seq.get(key) ?? 0) + 1;
    seq.set(key, n);
    numbers.set(i, `${d.type === "invoice" ? "F" : "D"}-${year}-${String(n).padStart(4, "0")}`);
  }

  for (const [key, n] of seq) {
    const [kind, year] = key.split("-") as ["quote" | "invoice", string];
    await db.insert(counters).values({ userId, kind, year: Number(year), seq: n });
  }

  const rows = SEED_DOCS.map((d, i) => {
    const client = clientList[d.client];
    const issueDate = addDaysISO(today, d.offset);
    const items: LineItem[] = d.items.map(([description, quantity, unit, price]) => ({
      description,
      quantity,
      unit,
      unitPriceCents: Math.round(price * 100),
    }));
    const issued = d.status !== "draft";
    return {
      userId,
      clientId: client.id,
      type: d.type,
      number: numbers.get(i) ?? null,
      status: d.status,
      subject: d.subject,
      issueDate,
      dueDate: addDaysISO(issueDate, d.term),
      items,
      vatRate: 0,
      notes: "",
      issuedAt: issued ? new Date(`${issueDate}T09:00:00Z`) : null,
      paidAt: d.status === "paid" ? new Date(`${addDaysISO(issueDate, Math.min(d.term, 18))}T10:00:00Z`) : null,
      sellerSnapshot: issued ? sellerSnapshot(profile) : null,
      clientSnapshot: issued ? clientSnapshot(client) : null,
    };
  });
  await db.insert(documents).values(rows);
}

export async function resetDemoData(userId: string) {
  const db = await getDb();
  await db.delete(documents).where(eq(documents.userId, userId));
  await db.delete(clients).where(eq(clients.userId, userId));
  await db.delete(counters).where(eq(counters.userId, userId));
  await db.delete(profiles).where(eq(profiles.userId, userId));
  await seedProfileAndData(userId);
}

/** Crée un compte de démo jetable (un par visiteur) et purge les anciens. */
export async function createDemoUser(): Promise<{ email: string }> {
  const db = await getDb();
  const cutoff = new Date(Date.now() - DEMO.ttlHours * 3600 * 1000);
  await db.delete(users).where(and(eq(users.isDemo, true), lt(users.createdAt, cutoff)));

  const email = `demo-${randomBytes(5).toString("hex")}@${DEMO.emailDomain}`;
  const passwordHash = await bcrypt.hash(DEMO.password, 8);
  const [user] = await db
    .insert(users)
    .values({ email, name: "Camille Laurent", passwordHash, isDemo: true, plan: "pro" })
    .returning();
  await seedProfileAndData(user.id);
  return { email };
}
