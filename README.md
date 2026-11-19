# Ardoise — factures et devis pour freelances

Micro-SaaS **fonctionnel de bout en bout** : inscription, profil freelance, clients, devis → facture, numérotation
séquentielle, PDF élégants, tableau de bord, et abonnement **Stripe** (mode test) qui lève les limites de l'offre gratuite.

> Projet de démonstration (portfolio). Les paiements sont en **mode test** : aucune somme n'est débitée.
> Carte de test : `4242 4242 4242 4242`, date future, CVC au choix.

**Essayer sans s'inscrire :** bouton « Essayer la démo » → un compte jetable pré-rempli (données fictives, réinitialisables) est créé pour chaque visiteur.

## Fonctionnalités

- **Landing** soignée (hero, aperçu animé 100 % CSS, fonctionnalités, modèles, tarifs, FAQ), pages légales.
- **Profil freelance** : identité, SIRET, régime de TVA (franchise « TVA non applicable, art. 293 B du CGI » ou assujetti), IBAN/BIC, logo, pénalités de retard, modèle de PDF.
- **Clients**, **devis**, **factures** ; devis → facture en un clic.
- **Numérotation légale** `D-AAAA-0001` / `F-AAAA-0001` : attribuée à l'**émission** (les brouillons n'ont pas de numéro), en une seule requête SQL atomique → jamais de trou. Un document émis est figé (identités du vendeur et du client copiées dans le document).
- **Statuts** : brouillon, envoyée, payée, **en retard** (calculé à partir de l'échéance, donc toujours exact) ; devis accepté / refusé / expiré / facturé.
- **PDF** côté serveur (`@react-pdf/renderer`) : 4 modèles (Classique gratuit ; Moderne, Minimal, Élégant en Pro).
- **Tableau de bord** : CA encaissé (année / mois), à encaisser, impayés en retard, histogramme sur 12 mois.
- **Abonnement** : Gratuit (3 factures émises / mois, filigrane, 1 modèle) · Pro 9 €/mois ou 90 €/an (illimité, 4 modèles, sans filigrane) via Stripe Checkout (mode abonnement) + Customer Portal + webhook.

## Stack et choix

| Besoin | Choix | Pourquoi |
| --- | --- | --- |
| Framework | Next.js 16 (App Router), TypeScript, Tailwind CSS 4 | Pages statiques ultra rapides + server actions |
| Base de données | **Neon Postgres** + Drizzle ORM | Offre gratuite avec réveil automatique (Supabase gratuit se met en pause après 7 jours, ce qui casserait une démo de portfolio) |
| Auth | **Auth.js v5** (e-mail + mot de passe, sessions JWT) | Aucun compte tiers ni clé supplémentaire, les utilisateurs restent dans notre base ; Clerk aurait ajouté un service à configurer pour un besoin très simple |
| Paiement | Stripe Billing | Checkout `subscription`, Customer Portal, webhook |
| PDF | `@react-pdf/renderer` | Génération serveur, polices embarquées, rendu net |
| Base locale | PGlite (Postgres embarqué) | Développer **sans aucun compte** : si `DATABASE_URL` est vide, la base vit dans `.data/` |

## Démarrage local (0 compte nécessaire pour tout sauf Stripe)

```bash
npm install
cp .env.example .env.local        # puis renseigner AUTH_SECRET (openssl rand -base64 32)
npm run dev                       # http://localhost:3300
```

Sans `DATABASE_URL`, la base PGlite est créée et migrée automatiquement. Le bouton « Essayer la démo » et tout le parcours
(inscription → client → devis → facture → PDF) fonctionnent déjà. Pour le paiement :

1. Créez un compte [Stripe](https://dashboard.stripe.com) et restez en **mode test**.
2. Copiez la clé secrète `sk_test_…` dans `.env.local` (`STRIPE_SECRET_KEY`).
3. Installez la [CLI Stripe](https://stripe.com/docs/stripe-cli) puis :
   ```bash
   stripe listen --forward-to localhost:3300/api/stripe/webhook
   ```
   Copiez le `whsec_…` affiché dans `STRIPE_WEBHOOK_SECRET`, puis relancez `npm run dev`.
4. Dans l'app : créez un compte → **Abonnement** → « Passer en Pro » → carte `4242 4242 4242 4242`.
   Au retour de Checkout, l'abonnement est synchronisé immédiatement (le webhook assure ensuite la cohérence : renouvellement, résiliation, échec de paiement).
5. Le bouton « Gérer mon abonnement » ouvre le Customer Portal. Si aucune configuration de portail n'existe encore dans votre compte Stripe, l'app en crée une par défaut automatiquement.

Les produits et prix sont déclarés à la volée (`price_data`) : rien à créer dans Stripe. Pour utiliser vos propres Prix, renseignez `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_YEARLY`.

## Déploiement (Vercel + Neon + Stripe)

1. **Neon** — créez un projet (région **Europe / Francfort**, proche de Vercel `fra1`) et copiez la *connection string* dans `DATABASE_URL`.
2. **GitHub** — le dépôt est déjà prêt ; importez-le dans **Vercel** (framework détecté automatiquement, région `fra1` dans `vercel.json`).
3. **Variables d'environnement Vercel** :
   | Variable | Valeur |
   | --- | --- |
   | `AUTH_SECRET` | `openssl rand -base64 32` |
   | `DATABASE_URL` | connection string Neon |
   | `APP_URL` | `https://<votre-projet>.vercel.app` |
   | `STRIPE_SECRET_KEY` | `sk_test_…` |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_…` (étape 5) |
4. **Déployez.** Le script de build applique automatiquement les migrations Drizzle sur Neon (`scripts/migrate.mts`).
5. **Webhook Stripe** — Dashboard → Développeurs → Webhooks → *Ajouter un endpoint* : `https://<votre-projet>.vercel.app/api/stripe/webhook`, événements `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`. Copiez le *Signing secret* dans `STRIPE_WEBHOOK_SECRET` puis redéployez.
6. **Test → live** : il suffit de remplacer `STRIPE_SECRET_KEY` (et le webhook) par les clés live. Le bandeau « démo / carte test » disparaît tout seul avec une clé `sk_live_`.

## Personnalisation

- Marque, éditeur / mentions légales, tarifs : [`src/config/site.ts`](src/config/site.ts) — **un seul fichier**.
- Limite gratuite : `pricing.freeInvoicesPerMonth`.

## Tests et qualité

```bash
npm run lint       # TypeScript
npm run test:e2e   # numérotation sans trou, limite gratuite, synchro d'abonnement (base PGlite jetable)
npm run build
```

Performance : la landing est 100 % statique, sans JavaScript d'animation (aperçu animé, apparitions au scroll, bascule mensuel/annuel et FAQ en CSS pur), polices préchargées.

## Limites connues (volontairement simples)

- Pas de vérification d'e-mail, de mot de passe oublié ni d'envoi de documents par e-mail.
- Pas d'avoirs (annulation d'une facture émise) ni d'acomptes.
- Pas de limitation de débit sur l'inscription / la connexion (à ajouter avant un usage réel).
- Ardoise aide à la mise en forme et à la numérotation ; elle ne remplace pas un conseil comptable ou juridique.

## Licence

MIT — voir [LICENSE](LICENSE) et [CREDITS.md](CREDITS.md).
