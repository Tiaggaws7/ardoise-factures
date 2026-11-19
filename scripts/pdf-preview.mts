/** Génère un PDF d'exemple pour chaque modèle (aperçu visuel pendant le développement). */
import { writeFileSync } from "node:fs";
import { renderPdf } from "../src/lib/pdf/render";

const out = process.argv[2] ?? ".";
const data = {
  type: "invoice" as const,
  number: "F-2026-0012",
  status: "sent" as const,
  subject: "Direction artistique — campagne de printemps",
  issueDate: "2026-11-02",
  dueDate: "2026-12-02",
  items: [
    { description: "Direction artistique", quantity: 3, unit: "jour", unitPriceCents: 42000 },
    { description: "Déclinaisons réseaux sociaux (12 visuels)", quantity: 12, unit: "pièce", unitPriceCents: 4500 },
    { description: "Retouches photo", quantity: 4, unit: "heure", unitPriceCents: 5500 },
  ],
  vatRate: 0,
  notes: "Merci pour votre confiance !",
  seller: {
    name: "Atelier Laurent",
    lines: ["Camille Laurent", "12 rue des Tanneurs", "33000 Bordeaux"],
    siret: "123 456 789 00012", email: "camille@atelier-laurent.example", phone: "06 12 34 56 78",
    vatMention: "TVA non applicable, art. 293 B du CGI",
    iban: "FR76 3000 6000 0112 3456 7890 189", bic: "AGRIFRPP",
    logo: null,
    legalFooter: "En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée, ainsi qu'une indemnité forfaitaire de 40 € pour frais de recouvrement.",
    template: "classique",
  },
  client: { name: "Studio Nova", lines: ["Sarah Benali", "14 rue Sainte-Catherine", "33000 Bordeaux"], siret: "843 210 987 00033", email: "sarah@studio-nova.example" },
};
for (const t of ["classique", "moderne", "minimal", "elegant"] as const) {
  writeFileSync(`${out}/${t}.pdf`, await renderPdf(data, t, t === "classique"));
}
console.log("ok");
