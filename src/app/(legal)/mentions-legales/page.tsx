import type { Metadata } from "next";
import { brand, publisher as p } from "@/config/site";
import { isTestMode } from "@/lib/mode";

export const metadata: Metadata = { title: "Mentions légales" };

export default function Page() {
  return (
    <>
      <h1>Mentions légales</h1>
      <p className="text-sm text-muted">Dernière mise à jour : {p.updatedAt}</p>

      <h2>Éditeur du service</h2>
      <p>
        {brand.name} est édité par <strong>{p.name}</strong>, {p.status}.
      </p>
      <ul>
        <li>SIRET : {p.siret}</li>
        <li>Adresse : {p.address}</li>
        <li>E-mail : <a href={`mailto:${p.email}`}>{p.email}</a></li>
        <li>Téléphone : {p.phone}</li>
        <li>{p.vat}</li>
        <li>Directeur de la publication : {p.director}</li>
      </ul>

      <h2>Nature du service</h2>
      {isTestMode() ? (
        <p>
          {brand.name} est un <strong>projet de démonstration</strong> présenté dans un portfolio de développement web. Il fonctionne de bout
          en bout, mais le paiement par Stripe est configuré en <strong>mode test</strong> : aucune somme n'est réellement prélevée. Les
          comptes de démonstration contiennent des données fictives et sont supprimés automatiquement.
        </p>
      ) : (
        <p>
          {brand.name} est un service en ligne indépendant, également présenté dans un portfolio de développement web. L'abonnement Pro est
          facturé via Stripe. Les comptes de démonstration contiennent des données fictives et sont supprimés automatiquement.
        </p>
      )}

      <h2>Hébergement et prestataires techniques</h2>
      <ul>
        <li>Application : {p.host}</li>
        <li>Base de données : {p.database}</li>
        <li>Paiement : {p.payments}</li>
      </ul>

      <h2>Propriété intellectuelle</h2>
      <p>
        Le code source est publié sur <a href={brand.repoUrl}>GitHub</a>. Les marques, textes et visuels d'{brand.name} sont la propriété de
        l'éditeur, sauf mention contraire dans le fichier de crédits du dépôt (polices sous licence libre SIL OFL, icônes Lucide sous licence ISC).
      </p>

      <h2>Responsabilité</h2>
      <p>
        Les documents générés (devis, factures) le sont à titre indicatif : l'utilisateur reste responsable de leur contenu et de leur conformité
        à sa situation. En cas de doute, il lui appartient de consulter un expert-comptable.
      </p>

      <h2>Contact</h2>
      <p>Pour toute question : <a href={`mailto:${p.email}`}>{p.email}</a>.</p>
    </>
  );
}
