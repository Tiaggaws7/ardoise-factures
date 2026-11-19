import path from "node:path";
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { LineItem, PartySnapshot, SellerSnapshot } from "@/db/schema";
import { computeTotals, formatEURPdf, formatVatRate, lineTotal } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import type { TemplateId } from "@/lib/plan";

const dir = path.join(process.cwd(), "assets", "fonts");
let registered = false;
function registerFonts() {
  if (registered) return;
  registered = true;
  Font.register({
    family: "Geist",
    fonts: [
      { src: path.join(dir, "geist-latin-400-normal.woff"), fontWeight: 400 },
      { src: path.join(dir, "geist-latin-600-normal.woff"), fontWeight: 600 },
      { src: path.join(dir, "geist-latin-700-normal.woff"), fontWeight: 700 },
    ],
  });
  Font.register({
    family: "Fraunces",
    fonts: [
      { src: path.join(dir, "fraunces-latin-400-normal.woff"), fontWeight: 400 },
      { src: path.join(dir, "fraunces-latin-600-normal.woff"), fontWeight: 600 },
      { src: path.join(dir, "fraunces-latin-400-italic.woff"), fontWeight: 400, fontStyle: "italic" },
    ],
  });
  Font.registerHyphenationCallback((w) => [w]);
}

export type PdfData = {
  type: "quote" | "invoice";
  number: string | null;
  status: "draft" | "sent" | "accepted" | "declined" | "paid";
  subject: string;
  issueDate: string;
  dueDate: string;
  paidAt?: string | null;
  items: LineItem[];
  vatRate: number;
  notes: string;
  seller: SellerSnapshot;
  client: PartySnapshot;
};

type Theme = {
  font: string;
  heading: string;
  ink: string;
  muted: string;
  accent: string;
  rule: string;
  paper: string;
  headFill: string;
  headText: string;
};

const THEMES: Record<TemplateId, Theme> = {
  classique: { font: "Geist", heading: "Geist", ink: "#0b1633", muted: "#5f6d8a", accent: "#0c1f4a", rule: "#dfe6f2", paper: "#ffffff", headFill: "#eef3fc", headText: "#1c2530" },
  moderne: { font: "Geist", heading: "Geist", ink: "#0b1633", muted: "#5f6d8a", accent: "#2b5cf0", rule: "#dfe6f2", paper: "#ffffff", headFill: "#0c1f4a", headText: "#ffffff" },
  minimal: { font: "Geist", heading: "Geist", ink: "#111418", muted: "#8a929c", accent: "#111418", rule: "#e6e8eb", paper: "#ffffff", headFill: "#ffffff", headText: "#8a929c" },
  elegant: { font: "Geist", heading: "Fraunces", ink: "#26211b", muted: "#7b7164", accent: "#a2762c", rule: "#e3d9c6", paper: "#fbf7ef", headFill: "#fbf7ef", headText: "#a2762c" },
};

const qty = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 2 }).replace(/[  ]/g, " ");

function PartyBlock({ t, label, p }: { t: Theme; label: string; p: PartySnapshot }) {
  return (
    <View style={{ width: "48%" }}>
      <Text style={{ fontSize: 7.5, letterSpacing: 1, textTransform: "uppercase", color: t.muted, marginBottom: 5, fontWeight: 600 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 10.5, fontWeight: 600, color: t.ink, marginBottom: 2 }}>{p.name}</Text>
      {p.lines.map((l, i) => (
        <Text key={i} style={{ fontSize: 9, color: t.ink, lineHeight: 1.45 }}>{l}</Text>
      ))}
      {p.siret ? <Text style={{ fontSize: 8.5, color: t.muted, marginTop: 3 }}>SIRET {p.siret}</Text> : null}
      {p.vatNumber ? <Text style={{ fontSize: 8.5, color: t.muted }}>TVA {p.vatNumber}</Text> : null}
      {p.email ? <Text style={{ fontSize: 8.5, color: t.muted }}>{p.email}</Text> : null}
      {p.phone ? <Text style={{ fontSize: 8.5, color: t.muted }}>{p.phone}</Text> : null}
    </View>
  );
}

function Logo({ seller, t, size = 44 }: { seller: SellerSnapshot; t: Theme; size?: number }) {
  if (seller.logo) {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <Image src={seller.logo} style={{ height: size, maxWidth: 150, objectFit: "contain", objectPosition: "left" }} />;
  }
  return (
    <Text style={{ fontFamily: t.heading, fontSize: 16, fontWeight: 600, color: t.ink }}>{seller.name}</Text>
  );
}

function Meta({ t, rows, align = "right" }: { t: Theme; rows: [string, string][]; align?: "left" | "right" }) {
  return (
    <View style={{ alignItems: align === "right" ? "flex-end" : "flex-start", gap: 2 }}>
      {rows.map(([k, v]) => (
        <Text key={k} style={{ fontSize: 9, color: t.muted }}>
          {k} <Text style={{ color: t.ink, fontWeight: 600 }}>{v}</Text>
        </Text>
      ))}
    </View>
  );
}

function InvoiceDoc({ data, template, watermark }: { data: PdfData; template: TemplateId; watermark: boolean }) {
  const t = THEMES[template];
  const isInvoice = data.type === "invoice";
  const title = isInvoice ? "FACTURE" : "DEVIS";
  const totals = computeTotals(data.items, data.vatRate);
  const draft = data.status === "draft";
  const number = data.number ?? "Brouillon";
  const meta: [string, string][] = [
    ["N°", number],
    ["Date d'émission", formatDate(data.issueDate)],
    [isInvoice ? "Échéance" : "Valable jusqu'au", formatDate(data.dueDate)],
  ];
  const s = StyleSheet.create({
    page: { fontFamily: t.font, fontSize: 9.5, color: t.ink, backgroundColor: t.paper, paddingTop: template === "moderne" ? 0 : 44, paddingBottom: 72, paddingHorizontal: template === "moderne" ? 0 : 44 },
    body: { paddingHorizontal: template === "moderne" ? 44 : 0 },
    th: { flexDirection: "row", backgroundColor: t.headFill, paddingVertical: 7, paddingHorizontal: 8, borderRadius: template === "moderne" ? 3 : 0, borderBottomWidth: template === "minimal" || template === "elegant" ? 0.8 : 0, borderBottomColor: t.accent },
    thText: { color: t.headText, fontSize: 7.5, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 600 },
    tr: { flexDirection: "row", paddingVertical: 9, paddingHorizontal: 8, borderBottomWidth: 0.6, borderBottomColor: t.rule },
  });

  const header =
    template === "moderne" ? (
      <View style={{ backgroundColor: t.accent, paddingHorizontal: 44, paddingTop: 36, paddingBottom: 26, marginBottom: 28, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
        <View>
          <Text style={{ color: "#fff", fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>{title}</Text>
          <Text style={{ color: "#dbe6ff", fontSize: 11, marginTop: 3 }}>{number}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          {data.seller.logo ? <Logo seller={data.seller} t={t} size={36} /> : <Text style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>{data.seller.name}</Text>}
        </View>
      </View>
    ) : template === "elegant" ? (
      <View style={{ alignItems: "center", marginBottom: 26 }}>
        <Logo seller={data.seller} t={t} size={40} />
        <View style={{ height: 0.8, width: 60, backgroundColor: t.accent, marginVertical: 14 }} />
        <Text style={{ fontFamily: "Fraunces", fontSize: 26, fontWeight: 400, letterSpacing: 4, color: t.ink }}>{title}</Text>
        <Text style={{ fontFamily: "Fraunces", fontStyle: "italic", fontSize: 11, color: t.accent, marginTop: 4 }}>n° {number}</Text>
      </View>
    ) : template === "minimal" ? (
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
        <View>
          <Text style={{ fontSize: 9, letterSpacing: 2, color: t.muted, fontWeight: 600 }}>{title}</Text>
          <Text style={{ fontSize: 24, fontWeight: 600, marginTop: 4, letterSpacing: -0.5 }}>{number}</Text>
        </View>
        <Logo seller={data.seller} t={t} size={34} />
      </View>
    ) : (
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30 }}>
        <Logo seller={data.seller} t={t} />
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>{title}</Text>
          <Text style={{ fontSize: 10, color: t.muted, marginTop: 2 }}>{number}</Text>
        </View>
      </View>
    );

  const showMetaRow = template !== "classique";
  const cols = { desc: "46%", qty: "12%", unit: "14%", price: "14%", total: "14%" };

  return (
    <Document title={`${title} ${number}`} author={data.seller.name} creator="Ardoise">
      <Page size="A4" style={s.page}>
        {watermark || draft ? (
          <View fixed style={{ position: "absolute", top: 330, left: 0, right: 0, alignItems: "center" }}>
            <Text style={{ fontSize: 64, fontWeight: 700, color: t.ink, opacity: 0.06, transform: "rotate(-30deg)", letterSpacing: 4 }}>
              {draft ? "BROUILLON" : "ARDOISE"}
            </Text>
          </View>
        ) : null}

        {header}

        <View style={s.body}>
          {showMetaRow && (
            <View style={{ flexDirection: "row", gap: 24, marginBottom: 22, paddingBottom: 14, borderBottomWidth: 0.6, borderBottomColor: t.rule }}>
              {meta.map(([k, v]) => (
                <View key={k}>
                  <Text style={{ fontSize: 7.5, letterSpacing: 0.8, textTransform: "uppercase", color: t.muted, fontWeight: 600 }}>{k}</Text>
                  <Text style={{ fontSize: 10, fontWeight: 600, marginTop: 2 }}>{v}</Text>
                </View>
              ))}
              {data.status === "paid" && (
                <View>
                  <Text style={{ fontSize: 7.5, letterSpacing: 0.8, textTransform: "uppercase", color: t.muted, fontWeight: 600 }}>Statut</Text>
                  <Text style={{ fontSize: 10, fontWeight: 700, marginTop: 2, color: "#1f8a5b" }}>PAYÉE{data.paidAt ? ` le ${formatDate(data.paidAt)}` : ""}</Text>
                </View>
              )}
            </View>
          )}

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 22 }}>
            <PartyBlock t={t} label="Émetteur" p={data.seller} />
            <PartyBlock t={t} label={isInvoice ? "Facturé à" : "Destinataire"} p={data.client} />
          </View>

          {!showMetaRow && (
            <View style={{ marginBottom: 18 }}>
              <Meta t={t} align="left" rows={[...meta.slice(1), ...(data.status === "paid" ? ([["Statut", "Payée"]] as [string, string][]) : [])]} />
            </View>
          )}

          {data.subject ? (
            <Text style={{ fontFamily: t.heading, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>Objet : {data.subject}</Text>
          ) : null}

          <View style={s.th} fixed>
            <Text style={[s.thText, { width: cols.desc }]}>Description</Text>
            <Text style={[s.thText, { width: cols.qty, textAlign: "right" }]}>Qté</Text>
            <Text style={[s.thText, { width: cols.unit, paddingLeft: 8 }]}>Unité</Text>
            <Text style={[s.thText, { width: cols.price, textAlign: "right" }]}>P.U. HT</Text>
            <Text style={[s.thText, { width: cols.total, textAlign: "right" }]}>Total HT</Text>
          </View>
          {data.items.map((l, i) => (
            <View key={i} style={s.tr} wrap={false}>
              <Text style={{ width: cols.desc, paddingRight: 8 }}>{l.description}</Text>
              <Text style={{ width: cols.qty, textAlign: "right" }}>{qty(l.quantity)}</Text>
              <Text style={{ width: cols.unit, paddingLeft: 8, color: t.muted }}>{l.unit}</Text>
              <Text style={{ width: cols.price, textAlign: "right" }}>{formatEURPdf(l.unitPriceCents)}</Text>
              <Text style={{ width: cols.total, textAlign: "right", fontWeight: 600 }}>{formatEURPdf(lineTotal(l))}</Text>
            </View>
          ))}

          <View wrap={false} style={{ alignItems: "flex-end", marginTop: 14 }}>
            <View style={{ width: 230 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 }}>
                <Text style={{ color: t.muted }}>Total HT</Text>
                <Text>{formatEURPdf(totals.subtotal)}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 }}>
                <Text style={{ color: t.muted }}>{data.vatRate > 0 ? `TVA ${formatVatRate(data.vatRate)}` : "TVA"}</Text>
                <Text>{data.vatRate > 0 ? formatEURPdf(totals.vat) : "—"}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6, paddingVertical: 9, paddingHorizontal: template === "classique" || template === "minimal" ? 0 : 10, borderTopWidth: template === "classique" || template === "minimal" ? 1.2 : 0, borderTopColor: t.ink, backgroundColor: template === "moderne" ? t.accent : template === "elegant" ? "#f1e8d3" : "transparent", borderRadius: 3 }}>
                <Text style={{ fontWeight: 700, fontSize: 10.5, color: template === "moderne" ? "#fff" : t.ink }}>{data.vatRate > 0 ? "Total TTC" : "Net à payer"}</Text>
                <Text style={{ fontFamily: t.heading, fontWeight: template === "elegant" ? 600 : 700, fontSize: 15, color: template === "moderne" ? "#fff" : t.ink }}>
                  {formatEURPdf(totals.total)}
                </Text>
              </View>
            </View>
          </View>

          <View wrap={false} style={{ marginTop: 22, flexDirection: "row", gap: 24 }}>
            {isInvoice && (data.seller.iban || data.seller.bic) ? (
              <View style={{ flexGrow: 1, borderWidth: 0.7, borderColor: t.rule, borderRadius: 4, padding: 11 }}>
                <Text style={{ fontSize: 7.5, letterSpacing: 0.8, textTransform: "uppercase", color: t.muted, fontWeight: 600, marginBottom: 5 }}>
                  Règlement par virement
                </Text>
                {data.seller.iban ? <Text style={{ fontSize: 9.5, fontWeight: 600 }}>IBAN {data.seller.iban}</Text> : null}
                {data.seller.bic ? <Text style={{ fontSize: 9, color: t.muted, marginTop: 2 }}>BIC {data.seller.bic}</Text> : null}
                <Text style={{ fontSize: 8.5, color: t.muted, marginTop: 4 }}>Référence à indiquer : {number}</Text>
              </View>
            ) : null}
            {!isInvoice ? (
              <View style={{ flexGrow: 1, borderWidth: 0.7, borderColor: t.rule, borderRadius: 4, padding: 11 }}>
                <Text style={{ fontSize: 7.5, letterSpacing: 0.8, textTransform: "uppercase", color: t.muted, fontWeight: 600, marginBottom: 5 }}>Bon pour accord</Text>
                <Text style={{ fontSize: 8.5, color: t.muted }}>Date, signature précédée de la mention « Bon pour accord » :</Text>
                <View style={{ height: 38 }} />
              </View>
            ) : null}
          </View>

          {data.notes ? (
            <View wrap={false} style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 7.5, letterSpacing: 0.8, textTransform: "uppercase", color: t.muted, fontWeight: 600, marginBottom: 3 }}>Notes</Text>
              <Text style={{ fontSize: 9, lineHeight: 1.45 }}>{data.notes}</Text>
            </View>
          ) : null}
        </View>

        <View fixed style={{ position: "absolute", bottom: 26, left: template === "moderne" ? 44 : 44, right: 44, borderTopWidth: 0.6, borderTopColor: t.rule, paddingTop: 8 }}>
          {data.seller.vatMention ? <Text style={{ fontSize: 7.5, color: t.muted, textAlign: "center" }}>{data.seller.vatMention}</Text> : null}
          {isInvoice && data.seller.legalFooter ? (
            <Text style={{ fontSize: 7, color: t.muted, textAlign: "center", marginTop: 2, lineHeight: 1.4 }}>{data.seller.legalFooter}</Text>
          ) : null}
          <Text style={{ fontSize: 7, color: t.muted, textAlign: "center", marginTop: 3 }}>
            {[data.seller.name, data.seller.siret ? `SIRET ${data.seller.siret}` : ""].filter(Boolean).join(" · ")}
            {watermark ? "  ·  Créé avec Ardoise" : ""}
          </Text>
        </View>
        <Text fixed style={{ position: "absolute", bottom: 14, right: 44, fontSize: 7, color: t.muted }} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  );
}

export async function renderPdf(data: PdfData, template: TemplateId, watermark: boolean): Promise<Buffer> {
  registerFonts();
  return renderToBuffer(<InvoiceDoc data={data} template={template} watermark={watermark} />);
}
