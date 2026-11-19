/**
 * Fichier unique de personnalisation : marque, éditeur, mentions légales, tarifs.
 * ⚠️ Public (envoyé au navigateur) : jamais de secret ici.
 */
export const brand = {
  name: "Ardoise",
  tagline: "Les factures et devis des freelances, sans la paperasse.",
  description:
    "Ardoise crée vos devis et factures conformes (numérotation, TVA, mentions légales), les transforme en PDF élégants et suit vos paiements. Gratuit pour démarrer.",
  repoUrl: "https://github.com/Tiaggaws7/ardoise-factures",
};

/** Éditeur du service — repris de lamainbasque.fr (à adapter si besoin). */
export const publisher = {
  name: "Thiago Buil",
  status: "Entrepreneur individuel (auto-entrepreneur) · développeur web freelance",
  siret: "988 494 035 00013",
  address: "5 rue Roland, 64600 Anglet, France",
  email: "tiagobuil.tb@gmail.com",
  phone: "06 99 73 34 36",
  vat: "TVA non applicable, art. 293 B du CGI",
  director: "Thiago Buil",
  host: "Vercel Inc. (États-Unis) — https://vercel.com",
  database: "Neon, Inc. (États-Unis) — https://neon.tech",
  payments: "Stripe Payments Europe, Ltd. (Irlande) — https://stripe.com",
  updatedAt: "19 novembre 2026",
};

export const pricing = {
  currency: "EUR",
  monthlyCents: 900,
  yearlyCents: 9000,
  freeInvoicesPerMonth: 3,
};

export const DEMO = {
  /** Mot de passe commun aux comptes de démo jetables (public par conception). */
  password: "ardoise-demo-public",
  emailDomain: "demo.ardoise.invalid",
  /** Les comptes de démo plus vieux que ça sont supprimés à chaque nouvelle démo. */
  ttlHours: 12,
};
