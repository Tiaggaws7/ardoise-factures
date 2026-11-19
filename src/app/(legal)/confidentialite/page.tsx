import type { Metadata } from "next";
import { brand, publisher as p } from "@/config/site";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function Page() {
  return (
    <>
      <h1>Politique de confidentialité</h1>
      <p className="text-sm text-muted">Dernière mise à jour : {p.updatedAt}</p>

      <h2>Responsable du traitement</h2>
      <p>{p.name}, {p.address} — <a href={`mailto:${p.email}`}>{p.email}</a>.</p>

      <h2>Données collectées</h2>
      <ul>
        <li><strong>Compte</strong> : nom, adresse e-mail, mot de passe (stocké haché avec bcrypt, jamais en clair).</li>
        <li><strong>Profil et documents</strong> : identité professionnelle, SIRET, IBAN, logo, clients, devis et factures que vous saisissez.</li>
        <li><strong>Abonnement</strong> : identifiant client Stripe et statut de l'abonnement. Les données de carte sont saisies chez Stripe et ne transitent jamais par nos serveurs.</li>
      </ul>

      <h2>Finalités et base légale</h2>
      <p>
        Fournir le service {brand.name} (exécution du contrat), gérer l'abonnement et sécuriser les accès (intérêt légitime). Aucune donnée n'est
        vendue ni utilisée à des fins publicitaires. Aucun traceur de mesure d'audience n'est installé ; seul un cookie technique de session est utilisé, ce qui ne nécessite pas de consentement.
      </p>

      <h2>Destinataires et hébergement</h2>
      <ul>
        <li>{p.host} — hébergement de l'application</li>
        <li>{p.database} — base de données (région européenne)</li>
        <li>{p.payments} — paiement des abonnements</li>
      </ul>

      <h2>Durée de conservation</h2>
      <p>
        Les données sont conservées tant que le compte existe. Les comptes de démonstration (données fictives) sont supprimés automatiquement après quelques heures.
        Un utilisateur qui supprime son compte voit ses données effacées ; les factures émises peuvent devoir être conservées 10 ans par l'utilisateur lui-même, selon ses obligations comptables.
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous disposez des droits d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité. Écrivez à{" "}
        <a href={`mailto:${p.email}`}>{p.email}</a> ; en cas de désaccord, vous pouvez saisir la <a href="https://www.cnil.fr">CNIL</a>.
      </p>
    </>
  );
}
