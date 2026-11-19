import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Db = NeonHttpDatabase<typeof schema>;

const g = globalThis as unknown as { __db?: Promise<Db> };

/**
 * - Avec DATABASE_URL (Neon Postgres) : driver HTTP serverless, parfait pour Vercel.
 * - Sans DATABASE_URL : PGlite (Postgres embarqué, dossier .data/) pour développer
 *   sans aucun compte. Interdit en production.
 */
async function connect(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) return drizzleNeon(neon(url), { schema });

  if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
    throw new Error("DATABASE_URL manquant : crée une base Neon et renseigne la variable.");
  }
  const { PGlite } = await import(/* webpackIgnore: true */ "@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const dir = process.env.PGLITE_DIR ?? ".data/pglite";
  const { mkdirSync } = await import("node:fs");
  mkdirSync(dir, { recursive: true });
  const client = new PGlite(dir);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
  return db as unknown as Db;
}

export function getDb(): Promise<Db> {
  return (g.__db ??= connect());
}
