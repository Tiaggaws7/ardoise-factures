import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  date,
} from "drizzle-orm/pg-core";

/** Une ligne de devis / facture (montants en centimes). */
export type LineItem = {
  description: string;
  quantity: number;
  unit: string;
  unitPriceCents: number;
};

/** Identité figée à l'émission : une facture émise ne change plus jamais. */
export type PartySnapshot = {
  name: string;
  lines: string[];
  siret?: string | null;
  vatNumber?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type SellerSnapshot = PartySnapshot & {
  vatMention: string;
  iban?: string | null;
  bic?: string | null;
  logo?: string | null;
  legalFooter: string;
  template: string;
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  isDemo: boolean("is_demo").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  // Abonnement (synchronisé par le webhook Stripe)
  plan: text("plan", { enum: ["free", "pro"] }).notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
});

export const profiles = pgTable("profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  businessName: text("business_name").notNull().default(""),
  fullName: text("full_name").notNull().default(""),
  address: text("address").notNull().default(""),
  postalCode: text("postal_code").notNull().default(""),
  city: text("city").notNull().default(""),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  siret: text("siret").notNull().default(""),
  vatRegime: text("vat_regime", { enum: ["franchise", "assujetti"] }).notNull().default("franchise"),
  vatNumber: text("vat_number").notNull().default(""),
  defaultVatRate: integer("default_vat_rate").notNull().default(200), // % × 10 (200 = 20 %, 55 = 5,5 %)
  iban: text("iban").notNull().default(""),
  bic: text("bic").notNull().default(""),
  logo: text("logo"), // data URL PNG/JPEG redimensionnée côté client
  paymentDays: integer("payment_days").notNull().default(30),
  legalFooter: text("legal_footer")
    .notNull()
    .default(
      "En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée, ainsi qu'une indemnité forfaitaire de 40 € pour frais de recouvrement.",
    ),
  template: text("template").notNull().default("classique"),
});

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    contact: text("contact").notNull().default(""),
    email: text("email").notNull().default(""),
    phone: text("phone").notNull().default(""),
    address: text("address").notNull().default(""),
    postalCode: text("postal_code").notNull().default(""),
    city: text("city").notNull().default(""),
    siret: text("siret").notNull().default(""),
    vatNumber: text("vat_number").notNull().default(""),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("clients_user_idx").on(t.userId)],
);

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    type: text("type", { enum: ["quote", "invoice"] }).notNull(),
    /** Null tant que le document est un brouillon : le numéro est attribué à l'émission. */
    number: text("number"),
    status: text("status", {
      enum: ["draft", "sent", "accepted", "declined", "paid"],
    })
      .notNull()
      .default("draft"),
    subject: text("subject").notNull().default(""),
    issueDate: date("issue_date", { mode: "string" }).notNull(),
    /** Échéance de paiement (facture) ou date de validité (devis). */
    dueDate: date("due_date", { mode: "string" }).notNull(),
    items: jsonb("items").$type<LineItem[]>().notNull().default(sql`'[]'::jsonb`),
    vatRate: integer("vat_rate").notNull().default(0), // en % × 10 (200 = 20 %, 55 = 5,5 %)
    notes: text("notes").notNull().default(""),
    sourceQuoteId: uuid("source_quote_id"),
    sellerSnapshot: jsonb("seller_snapshot").$type<SellerSnapshot>(),
    clientSnapshot: jsonb("client_snapshot").$type<PartySnapshot>(),
    issuedAt: timestamp("issued_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("documents_user_idx").on(t.userId, t.type),
    uniqueIndex("documents_number_uq").on(t.userId, t.number),
  ],
);

/** Compteurs de numérotation séquentielle, par utilisateur, type et année. */
export const counters = pgTable(
  "counters",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: ["quote", "invoice"] }).notNull(),
    year: integer("year").notNull(),
    seq: integer("seq").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.kind, t.year] })],
);

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type DocumentRow = typeof documents.$inferSelect;
