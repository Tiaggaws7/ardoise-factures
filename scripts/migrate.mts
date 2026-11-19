/**
 * Applique les migrations SQL (dossier ./drizzle) sur la base Neon.
 * Sans DATABASE_URL : ne fait rien (la base locale PGlite se migre toute seule).
 * Lancé automatiquement avant `next build`.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("DATABASE_URL absent : migration ignorée (base locale PGlite).");
  process.exit(0);
}
await migrate(drizzle(neon(url)), { migrationsFolder: "./drizzle" });
console.log("✓ Migrations appliquées sur Neon.");
