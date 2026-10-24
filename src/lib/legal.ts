import type { Locale } from "./i18n/config";

/**
 * Static legal content — required by the master prompt §5 (privacy, terms,
 * legal notice, returns, cancellation, shipping, delivery, compliance).
 * Structure: slug → { updated, fr/en sections }. Sections render as
 * h2 + paragraphs on /legal/[slug].
 */

export type LegalSection = { heading: string; body: string[] };

export type LegalPage = {
  slug: string;
  title: { fr: string; en: string };
  updated: string;
  sections: Record<Locale, LegalSection[]>;
};

export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: "privacy",
    title: {
      fr: "Politique de confidentialité",
      en: "Privacy policy",
    },
    updated: "2026-10-01",
    sections: {
      fr: [
        {
          heading: "1. Responsable du traitement",
          body: [
            "Rouillard Sport est responsable du traitement des données personnelles collectées sur ce site. Pour toute question : contact@rouillard-sport.com.",
          ],
        },
        {
          heading: "2. Données collectées",
          body: [
            "Nous collectons uniquement les données nécessaires au traitement de vos commandes : nom, e-mail, téléphone, adresse de livraison, contenu de vos messages et historique de commande.",
            "Aucune donnée de carte bancaire n’est collectée : le règlement s’effectue par virement bancaire ou par Western Union. Seuls la preuve de règlement que vous nous transmettez et vos coordonnées de facturation sont conservés le temps du traitement de la commande.",
          ],
        },
        {
          heading: "3. Finalités et base légale",
          body: [
            "Ces données servent à exécuter le contrat de vente (commande, livraison, facture), répondre à vos demandes et respecter nos obligations comptables.",
            "Les avis publiés le sont avec votre consentement. Votre e-mail n’est jamais publié.",
          ],
        },
        {
          heading: "4. Durée de conservation",
          body: [
            "Données de commande et pièces comptables : 10 ans (obligation légale). Correspondances de contact : 3 ans après le dernier échange. Prospection : 3 ans sans interaction.",
          ],
        },
        {
          heading: "5. Vos droits",
          body: [
            "Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation et d’opposition. Écrivez à contact@rouillard-sport.com : nous répondons sous 30 jours.",
            "Vous pouvez également saisir la CNIL (cnil.fr) si vous estimez que vos droits ne sont pas respectés.",
          ],
        },
        {
          heading: "6. Cookies",
          body: [
            "Ce site utilise uniquement des cookies techniques : panier, préférence de langue et session d’administration. Aucun cookie publicitaire ni traceur tiers n’est déposé.",
          ],
        },
      ],
      en: [
        {
          heading: "1. Data controller",
          body: [
            "Rouillard Sport is the controller of personal data collected on this site. For any question: contact@rouillard-sport.com.",
          ],
        },
        {
          heading: "2. Data we collect",
          body: [
            "We only collect data required to fulfil your orders: name, email, phone, delivery address, message content and order history.",
            "No card details are ever collected: settlement is made by bank transfer or Western Union. Only the payment proof you send us and your billing details are kept for the duration of order processing.",
          ],
        },
        {
          heading: "3. Purposes and legal basis",
          body: [
            "This data is used to perform the sales contract (ordering, delivery, invoicing), answer your requests and meet our accounting obligations.",
            "Reviews are published with your consent. Your email address is never published.",
          ],
        },
        {
          heading: "4. Retention periods",
          body: [
            "Order and accounting records: 10 years (legal obligation). Contact correspondence: 3 years after the last exchange. Marketing: 3 years without interaction.",
          ],
        },
        {
          heading: "5. Your rights",
          body: [
            "You have the right to access, rectify, erase, restrict and object. Email contact@rouillard-sport.com. We reply within 30 days.",
            "You may also lodge a complaint with your supervisory authority (in France: cnil.fr).",
          ],
        },
        {
          heading: "6. Cookies",
          body: [
            "This site uses strictly technical cookies only: bag, language preference and admin session. No advertising cookies or third-party trackers are set.",
          ],
        },
      ],
    },
  },
  {
    slug: "terms",
    title: { fr: "Conditions générales de vente", en: "Terms of service" },
    updated: "2026-10-01",
    sections: {
      fr: [
        {
          heading: "1. Objet",
          body: [
            "Les présentes conditions régissent les ventes de pièces détachées conclues sur rouillard-sport.com entre Rouillard Sport et tout client particulier ou professionnel.",
          ],
        },
        {
          heading: "2. Commande",
          body: [
            "La commande est ferme après validation des coordonnées et réception de notre e-mail de confirmation portant une référence RS-XXXXXX. Les photographies et descriptions sont non contractuelles dans les limites de la série.",
            "L’enregistrement de la commande dans nos systèmes fait foi jusqu’à preuve contraire.",
          ],
        },
        {
          heading: "3. Prix et paiement",
          body: [
            "Les prix sont indiqués en euros, toutes taxes comprises pour la France métropolitaine. Les frais de livraison sont indiqués avant validation définitive.",
            "Le paiement s’effectue selon les modalités proposées à la commande (virement bancaire ou Western Union). Les instructions de règlement sont envoyées par e-mail ou affichées sur la page de commande.",
          ],
        },
        {
          heading: "4. Disponibilité",
          body: [
            "Les pièces sont proposées dans la limite des stocks disponibles. En cas d’indisponibilité après commande, nous vous informons sous 24 h ouvrées et procédons au remboursement intégral.",
          ],
        },
        {
          heading: "5. Livraison",
          body: [
            "Les délais annoncés sont indicatifs et courent à compter de la réception du paiement. Le transporteur est désigné selon la destination. Voir les politiques d’expédition et de livraison.",
          ],
        },
        {
          heading: "6. Garanties",
          body: [
            "Les pièces neuves bénéficient de la garantie légale de conformité (2 ans) et de la garantie des vices cachés. Les pièces reconditionnées bénéficient d’une garantie atelier de 12 mois, indiquée sur la fiche.",
          ],
        },
        {
          heading: "7. Droit applicable",
          body: [
            "Les présentes conditions sont soumises au droit français. En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. Conformément au règlement (UE) 524/2013, la plateforme européenne de règlement en ligne des litiges est accessible sur ec.europa.eu/odr.",
          ],
        },
      ],
      en: [
        {
          heading: "1. Scope",
          body: [
            "These terms govern sales of spare parts concluded on rouillard-sport.com between Rouillard Sport and any retail or trade customer.",
          ],
        },
        {
          heading: "2. Orders",
          body: [
            "An order becomes firm once details are validated and our confirmation email with an RS-XXXXXX reference is issued. Photographs and descriptions are non-contractual within the same series.",
            "The order record in our systems is authoritative until proven otherwise.",
          ],
        },
        {
          heading: "3. Prices and payment",
          body: [
            "Prices are shown in euros, VAT included for metropolitan France. Delivery fees are displayed before final confirmation.",
            "Payment follows the methods offered at checkout (bank transfer or Western Union). Instructions are sent by email.",
          ],
        },
        {
          heading: "4. Availability",
          body: [
            "Parts are offered subject to stock. If a part becomes unavailable after ordering, we inform you within 24 working hours and issue a full refund.",
          ],
        },
        {
          heading: "5. Delivery",
          body: [
            "Stated lead times are indicative and run from receipt of payment. The carrier is selected by destination. See the shipping and delivery policies.",
          ],
        },
        {
          heading: "6. Warranties",
          body: [
            "New parts carry the statutory conformity guarantee (2 years) and the hidden-defect guarantee. Refurbished parts carry a 12-month workshop warranty stated on the listing.",
          ],
        },
        {
          heading: "7. Governing law",
          body: [
            "These terms are governed by French law. Any dispute will first be handled amicably before legal proceedings. Under Regulation (EU) 524/2013, the European online dispute resolution platform is available at ec.europa.eu/odr.",
          ],
        },
      ],
    },
  },
  {
    slug: "notice",
    title: { fr: "Mentions légales", en: "Legal notice" },
    updated: "2026-10-01",
    sections: {
      fr: [
        {
          heading: "Éditeur",
          body: [
            "Rouillard Sport, vente de pièces détachées automobiles et machines, restauration et maintenance.",
            "Adresse : 14 Rue de la Vitrine, 69150 Décines-Charpieu, France. Téléphone : +33 4 72 84 09 63. E-mail : contact@rouillard-sport.com.",
            "Directeur de la publication : La direction de Rouillard Sport.",
          ],
        },
        {
          heading: "Hébergement",
          body: [
            "Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.",
          ],
        },
        {
          heading: "Propriété intellectuelle",
          body: [
            "L’ensemble des contenus (textes, photographies, charte graphique, références) est la propriété exclusive de l’atelier ou de ses partenaires. Toute reproduction sans autorisation est interdite.",
          ],
        },
        {
          heading: "Médiation de la consommation",
          body: [
            "Conformément à l’article L612-1 du Code de la consommation, tout consommateur peut recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d’un litige, après réclamation écrite préalable restée infructueuse.",
          ],
        },
      ],
      en: [
        {
          heading: "Publisher",
          body: [
            "Rouillard Sport, sale of automotive and machine spare parts, restoration and maintenance.",
            "Address: 14 Rue de la Vitrine, 69150 Décines-Charpieu, France. Phone: +33 4 72 84 09 63. Email: contact@rouillard-sport.com.",
            "Publication director: Rouillard Sport.",
          ],
        },
        {
          heading: "Hosting",
          body: [
            "The site is hosted by Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, United States.",
          ],
        },
        {
          heading: "Intellectual property",
          body: [
            "All content (texts, photographs, graphic design, references) is the exclusive property of the workshop or its partners. Reproduction without permission is prohibited.",
          ],
        },
        {
          heading: "Consumer mediation",
          body: [
            "Under Article L612-1 of the French Consumer Code, any consumer may free of charge refer a dispute to a consumer mediator for amicable resolution, after an unsuccessful written complaint.",
          ],
        },
      ],
    },
  },
  {
    slug: "returns",
    title: { fr: "Politique de retour", en: "Return policy" },
    updated: "2026-10-01",
    sections: {
      fr: [
        {
          heading: "Délai",
          body: [
            "Vous disposez de 30 jours après réception pour retourner une pièce non montée, dans son emballage d’origine, accompagnée de la facture.",
          ],
        },
        {
          heading: "Conditions",
          body: [
            "La pièce ne doit avoir fait l’aucun montage : traces de vis, de joint, de graisse ou d’usure entraînent le refus du retour. Les kits ouverts (joints, distributeurs) sont exclus pour des raisons d’hygiène mécanique.",
            "Si l’incompatibilité provient d’une erreur de notre part, le retour est intégralement pris en charge, étiquette retour comprise.",
          ],
        },
        {
          heading: "Remboursement",
          body: [
            "Après réception et contrôle de la pièce, le remboursement part sous 5 à 10 jours ouvrés sur le moyen de paiement d’origine. Les frais initiaux d’expédition ne sont remboursés qu’en cas d’erreur avérée de notre part.",
          ],
        },
        {
          heading: "Procédure",
          body: [
            "Contactez-nous avec votre référence RS-XXXXXX avant tout envoi. Nous vous confirmons l’éligibilité et, le cas échéant, l’étiquette retour.",
          ],
        },
      ],
      en: [
        {
          heading: "Window",
          body: [
            "You have 30 days after receipt to return a part that has not been fitted, in its original packaging, accompanied by the invoice.",
          ],
        },
        {
          heading: "Conditions",
          body: [
            "The part must not have been fitted: screw traces, seal, grease or wear marks will cause the return to be refused. Opened kits (seals, timing) are excluded for mechanical hygiene reasons.",
            "If the incompatibility results from our error, the return is fully covered, return label included.",
          ],
        },
        {
          heading: "Refund",
          body: [
            "After receipt and inspection, the refund is issued within 5 to 10 working days to the original payment method. Initial shipping fees are only refunded in case of proven error on our part.",
          ],
        },
        {
          heading: "Procedure",
          body: [
            "Contact us with your RS-XXXXXX reference before sending anything. We confirm eligibility and, where applicable, provide the return label.",
          ],
        },
      ],
    },
  },
  {
    slug: "cancellation",
    title: { fr: "Politique d’annulation", en: "Cancellation policy" },
    updated: "2026-10-01",
    sections: {
      fr: [
        {
          heading: "Avant expédition",
          body: [
            "Une commande peut être modifiée ou annulée sans frais tant qu’elle n’est pas expédiée. Répondez à l’e-mail de confirmation ou contactez-nous avec votre référence.",
          ],
        },
        {
          heading: "Après expédition",
          body: [
            "Une fois le colis remis au transporteur, la commande ne peut plus être annulée. Vous pouvez alors refuser la livraison ou retourner la pièce selon la politique de retour.",
          ],
        },
        {
          heading: "Annulation par l’atelier",
          body: [
            "Nous nous réservons le droit d’annuler une commande en cas d’indisponibilité durable, d’erreur de prix manifeste ou de suspicion de fraude. Le cas échéant, le paiement est intégralement remboursé sous 5 jours ouvrés.",
          ],
        },
      ],
      en: [
        {
          heading: "Before dispatch",
          body: [
            "An order can be changed or cancelled free of charge as long as it has not shipped. Reply to the confirmation email or contact us with your reference.",
          ],
        },
        {
          heading: "After dispatch",
          body: [
            "Once the parcel is handed to the carrier, the order can no longer be cancelled. You can refuse delivery or return the part under the return policy.",
          ],
        },
        {
          heading: "Cancellation by the workshop",
          body: [
            "We reserve the right to cancel an order in case of prolonged unavailability, a manifest pricing error or suspected fraud. If so, payment is fully refunded within 5 working days.",
          ],
        },
      ],
    },
  },
  {
    slug: "shipping",
    title: { fr: "Politique d’expédition", en: "Shipping policy" },
    updated: "2026-10-01",
    sections: {
      fr: [
        {
          heading: "Préparation",
          body: [
            "Les pièces en stock sont préparées et expédiées sous 48 heures ouvrées après validation du paiement. Les pièces reconditionnées sur demande nécessitent 3 à 5 jours ouvrés (test banc inclus).",
          ],
        },
        {
          heading: "Transport",
          body: [
            "Colis suivi standard (2 à 4 jours ouvrés en France métropolitaine), 9,90 €, offerts dès 150 € d’achat. Envoi express possible sur demande.",
            "Pour les pièces volumineuses ou lourdes (plus de 30 kg), un devis de transport vous est adressé avant expédition.",
          ],
        },
        {
          heading: "Suivi",
          body: [
            "Un e-mail de suivi est envoyé au départ de l’atelier. Le suivi est également consultable sur la page « Suivi de commande » avec votre référence.",
          ],
        },
        {
          heading: "International",
          body: [
            "Nous expédions dans l’Union européenne et vers la plupart des destinations. Les droits et taxes à l’arrivée sont à la charge du destinataire hors UE.",
          ],
        },
      ],
      en: [
        {
          heading: "Handling",
          body: [
            "In-stock parts are packed and dispatched within 48 working hours after payment validation. Refurbished parts on demand need 3 to 5 working days (bench test included).",
          ],
        },
        {
          heading: "Carrier",
          body: [
            "Standard tracked parcel (2-4 working days in metropolitan France), €9.90, free over €150. Express service available on request.",
            "For bulky or heavy parts (over 30 kg), we send a transport quote before dispatch.",
          ],
        },
        {
          heading: "Tracking",
          body: [
            "A tracking email is sent when the parcel leaves the workshop. Tracking is also visible on the Track Order page with your reference.",
          ],
        },
        {
          heading: "International",
          body: [
            "We ship across the European Union and to most destinations. Import duties and taxes outside the EU are the recipient’s responsibility.",
          ],
        },
      ],
    },
  },
  {
    slug: "delivery",
    title: { fr: "Politique de livraison", en: "Delivery policy" },
    updated: "2026-10-01",
    sections: {
      fr: [
        {
          heading: "Délais",
          body: [
            "Les délais annoncés courent à compter de la réception du paiement et sont donnés à titre indicatif. Un retard de transport n’ouvre pas droit automatiquement à annulation sous 5 jours ouvrés.",
          ],
        },
        {
          heading: "Réception",
          body: [
            "À réception, vérifiez l’état du colis en présence du transporteur. Toute réserve (colis ouvert, casse, manquant) doit être formulée sur le bon de livraison et signalée sous 48 h avec photographies.",
          ],
        },
        {
          heading: "Retrait à l’atelier",
          body: [
            "Le retrait est gratuit sur rendez-vous, du lundi au vendredi de 8h30 à 18h00 et le samedi matin. Présentez votre référence de commande.",
          ],
        },
        {
          heading: "Livraison internationale",
          body: [
            "Les délais hors UE varient de 5 à 10 jours ouvrés selon la destination et le dédouanement. Vérifiez la compatibilité de la pièce avec votre pays de destination avant commande.",
          ],
        },
      ],
      en: [
        {
          heading: "Timelines",
          body: [
            "Stated times run from receipt of payment and are indicative. A carrier delay does not automatically entitle you to cancellation within 5 working days.",
          ],
        },
        {
          heading: "Receipt",
          body: [
            "On arrival, inspect the parcel in the carrier’s presence. Any reservation (opened parcel, damage, missing item) must be noted on the delivery note and reported within 48 hours with photographs.",
          ],
        },
        {
          heading: "Workshop collection",
          body: [
            "Collection is free by appointment, Monday to Friday 8:30-18:00 and Saturday mornings. Present your order reference.",
          ],
        },
        {
          heading: "International delivery",
          body: [
            "Times outside the EU vary from 5 to 10 working days depending on destination and customs clearance. Check the part suits your destination country before ordering.",
          ],
        },
      ],
    },
  },
  {
    slug: "compliance",
    title: { fr: "Conformité réglementaire", en: "Regulatory compliance" },
    updated: "2026-10-01",
    sections: {
      fr: [
        {
          heading: "Qualité des pièces",
          body: [
            "Les pièces neuves proviennent de fabricants identifiés et sont accompagnées de leurs références. Les pièces reconditionnées sont contrôlées à l’atelier et garanties 12 mois.",
            "Aucune pièce défectueuse n’est remise en vente : les pièces démontées sont détruites ou rendues aux fournisseurs spécialisés.",
          ],
        },
        {
          heading: "Traçabilité",
          body: [
            "Chaque commande est rattachée à sa référence RS-XXXXXX, à sa facture et aux références de pièces expédiées. Cette traçabilité est conservée 10 ans.",
          ],
        },
        {
          heading: "Environnement",
          body: [
            "Les pièces d’occasion et reconditionnées participent à l’allongement de la durée de vie des véhicules. Les emballages sont recyclables et les huides usagées sont collectées par un prestataire agréé.",
          ],
        },
        {
          heading: "Accessibilité",
          body: [
            "Ce site vise le niveau AA du RGAA/WCAG 2.2 : navigation clavier complète, contrastes vérifiés, textes alternatifs et respect de « prefers-reduced-motion ». Un problème rencontré ? Signalez-le à contact@rouillard-sport.com.",
          ],
        },
      ],
      en: [
        {
          heading: "Part quality",
          body: [
            "New parts come from identified manufacturers and ship with their references. Refurbished parts are checked in the workshop and carry a 12-month warranty.",
            "No defective part is resold: stripped parts are destroyed or returned to specialist suppliers.",
          ],
        },
        {
          heading: "Traceability",
          body: [
            "Every order is linked to its RS-XXXXXX reference, its invoice and the shipped part numbers. Traceability is retained for 10 years.",
          ],
        },
        {
          heading: "Environment",
          body: [
            "Used and refurbished parts extend vehicle lifespans. Packaging is recyclable and waste oil is collected by a licensed operator.",
          ],
        },
        {
          heading: "Accessibility",
          body: [
            "This site targets RGAA/WCAG 2.2 level AA: full keyboard navigation, verified contrast, alternative text and respect for “prefers-reduced-motion”. Hit a problem? Report it to contact@rouillard-sport.com.",
          ],
        },
      ],
    },
  },
];

export function getLegalPage(slug: string): LegalPage | undefined {
  return LEGAL_PAGES.find((p) => p.slug === slug);
}

export function legalTitle(page: LegalPage, locale: Locale): string {
  return page.title[locale];
}
