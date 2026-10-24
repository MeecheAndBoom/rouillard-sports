import type { Product, Review } from "./types";

/**
 * Seed inventory — intentionally empty. All products now live in MongoDB +
 * Cloudinary; there is no local product fallback. If the database is
 * unreachable the shop renders zero products by design (see products.ts).
 */
export const SEED_PRODUCTS: Product[] = [];

/** Seed reviews (published) — French base with occasional English. */
export const SEED_REVIEWS: Review[] = [
  {
    name: "Julien M.",
    city: "Lyon",
    email: "julien@example.com",
    rating: 5,
    title: "La bonne pièce, du premier coup",
    body: "Kit de distribution reçu en 48 h, tout était dans la boîte, notices comprises. Référence exacte, compatible 208 1.2 VTi comme annoncé. On sent que quelqu’un a vérifié avant d’envoyer.",
    purchased: "Kit de distribution Peugeot 208",
    date: "2026-09-12",
    published: true,
  },
  {
    name: "Sophie L.",
    city: "Nantes",
    email: "sophie@example.com",
    rating: 5,
    title: "Service client au top",
    body: "J’avais peur de me tromper sur la compatibilité, j’ai envoyé mon numéro de châssis, réponse en 2 h avec la référence exacte. Plaquettes montées sans souci. Je recommande.",
    purchased: "Plaquettes avant Citroën C3",
    date: "2026-09-18",
    published: true,
  },
  {
    name: "Marc D.",
    city: "Bruxelles",
    email: "marc@example.com",
    rating: 4,
    title: "Bon prix, livraison correcte",
    body: "Alternateur reconditionné pour Transit, monté depuis 3 semaines, aucune miette. Délai un peu long vers la Belgique (4 j), mais suivi clair par e-mail.",
    purchased: "Alternateur Ford Transit 140 A",
    date: "2026-09-24",
    published: true,
  },
  {
    name: "Élodie R.",
    city: "Toulouse",
    email: "elodie@example.com",
    rating: 5,
    title: "Rapidité impressionnante",
    body: "Commandé le mardi matin, reçu le jeudi. Emballage soigné, facture dans le colis. Le suivi de commande en ligne est très clair, on voit l’état à chaque étape.",
    purchased: "Batterie AGM 74 Ah",
    date: "2026-09-30",
    published: true,
  },
  {
    name: "Thomas K.",
    city: "Lille",
    email: "thomas@example.com",
    rating: 5,
    title: "Refurbished, mais comme du neuf",
    body: "Alternateur Bosch reconditionné : testé sur banc, cartouche avec les relevés. 150 € économisés par rapport au neuf, et l’atelier m’a rappelé pour confirmer la compatibilité.",
    purchased: "Alternateur reconditionné 140 A",
    date: "2026-10-03",
    published: true,
  },
  {
    name: "Amélie B.",
    city: "Bordeaux",
    email: "amelie@example.com",
    rating: 5,
    title: "Très satisfaite",
    body: "Première commande sur ce site, tout est allé vite. La page de suivi avec l’historique est vraiment pratique, et le paiement par virement s’est fait sans accroc.",
    purchased: "Filtre à huile BMW B48",
    date: "2026-10-08",
    published: true,
  },
];
