import type { Metadata } from "next";
import { brand, pricing, publisher as p } from "@/config/site";

export const metadata: Metadata = { title: "CGU / CGV" };

export default function Page() {
  return (
    <>
      <h1>Conditions générales d'utilisation et de vente</h1>
      <p className="text-sm text-muted">Dernière mise à jour : {p.updatedAt}</p>

      <h2>1. Objet</h2>
      <p>
        Les présentes conditions encadrent l'usage du service {brand.name}, outil en ligne de création de devis et de factures, édité par {p.name}
        ({p.status}, SIRET {p.siret}).
      </p>

      <h2>2. Un service de démonstration</h2>
      <p>
        {brand.name} est un projet de démonstration. Les paiements sont traités par Stripe en <strong>mode test</strong> : la carte de test
        4242 4242 4242 4242 permet de simuler un abonnement, <strong>sans aucun débit réel</strong>. Le service est fourni « en l'état », sans garantie
        de disponibilité ni de conservation des données ; il peut être suspendu ou réinitialisé à tout moment.
      </p>

      <h2>3. Compte</h2>
      <p>
        L'inscription est gratuite et réservée aux personnes majeures. L'utilisateur choisit un mot de passe d'au moins 8 caractères et en
        préserve la confidentialité. Il peut supprimer son compte en écrivant à <a href={`mailto:${p.email}`}>{p.email}</a>.
      </p>

      <h2>4. Offres et prix</h2>
      <ul>
        <li><strong>Gratuit</strong> : 3 factures émises par mois civil, devis et clients illimités, modèle de PDF classique avec filigrane.</li>
        <li><strong>Pro</strong> : factures et devis illimités, 4 modèles de PDF sans filigrane — {(pricing.monthlyCents / 100).toLocaleString("fr-FR")} € par mois ou {(pricing.yearlyCents / 100).toLocaleString("fr-FR")} € par an.</li>
      </ul>
      <p>{p.vat}. Les prix sont indiqués en euros.</p>

      <h2>5. Abonnement, résiliation, rétractation</h2>
      <p>
        L'abonnement Pro est reconductible tacitement à chaque échéance. L'utilisateur le résilie à tout moment depuis son espace « Abonnement »
        (portail Stripe) ; la résiliation prend effet à la fin de la période en cours, sans remboursement au prorata. Conformément à l'article
        L221-28 du Code de la consommation, le service numérique étant exécuté dès la souscription avec l'accord du client, le droit de rétractation
        ne s'applique pas à l'exécution immédiate. Dans le cadre de la démonstration, aucun montant n'étant prélevé, aucune demande de remboursement n'est à prévoir.
      </p>

      <h2>6. Responsabilité de l'utilisateur</h2>
      <p>
        L'utilisateur est seul responsable des informations saisies et des documents émis (identité, régime de TVA, mentions, montants). {brand.name}
        propose une aide à la mise en forme et à la numérotation ; elle ne constitue ni un conseil juridique, fiscal ou comptable, ni une
        certification de conformité. Une facture émise ne peut plus être modifiée.
      </p>

      <h2>7. Responsabilité de l'éditeur</h2>
      <p>
        L'éditeur met en œuvre des moyens raisonnables pour assurer le service mais ne saurait être tenu responsable des interruptions, pertes de
        données ou dommages indirects, dans la limite permise par la loi.
      </p>

      <h2>8. Droit applicable</h2>
      <p>Les présentes conditions sont soumises au droit français. En cas de litige, une solution amiable sera recherchée avant toute action. Le consommateur peut recourir gratuitement à un médiateur de la consommation.</p>
    </>
  );
}
