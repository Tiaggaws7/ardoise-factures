import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { clients, profiles, users } from "@/db/schema";
import { clientSnapshot, getOwnedDocument, sellerSnapshot } from "@/lib/documents";
import { renderPdf } from "@/lib/pdf/render";
import { TEMPLATES, isPro, type TemplateId } from "@/lib/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Non connecté", { status: 401 });
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new NextResponse("Introuvable", { status: 404 });

  const db = await getDb();
  const doc = await getOwnedDocument(session.user.id, id);
  if (!doc) return new NextResponse("Introuvable", { status: 404 });
  const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
  const pro = isPro(user);

  // Brouillon : identités actuelles. Document émis : identités figées à l'émission.
  let seller = doc.sellerSnapshot;
  let client = doc.clientSnapshot;
  if (!seller || !client) {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
    const [c] = await db.select().from(clients).where(eq(clients.id, doc.clientId));
    seller = sellerSnapshot(profile);
    client = clientSnapshot(c);
  }

  const asked = new URL(req.url).searchParams.get("modele");
  const wanted = (TEMPLATES.find((t) => t.id === asked)?.id ?? seller.template) as TemplateId;
  const allowed = TEMPLATES.find((t) => t.id === wanted);
  const template: TemplateId = pro && allowed ? wanted : "classique";

  const pdf = await renderPdf(
    {
      type: doc.type,
      number: doc.number,
      status: doc.status,
      subject: doc.subject,
      issueDate: doc.issueDate,
      dueDate: doc.dueDate,
      paidAt: doc.paidAt?.toISOString() ?? null,
      items: doc.items,
      vatRate: doc.vatRate,
      notes: doc.notes,
      seller,
      client,
    },
    template,
    !pro, // filigrane sur l'offre gratuite
  );

  const inline = new URL(req.url).searchParams.has("inline");
  const base = doc.number ?? `brouillon-${doc.type === "invoice" ? "facture" : "devis"}`;
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${base}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
