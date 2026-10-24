import type { BlogPost } from "./types";

/** Seed articles — French base with English variants for the EN locale. */
export const SEED_BLOG_POSTS: BlogPost[] = [
  {
    slug: "comment-verifier-compatibilite-piece",
    title: "Comment vérifier qu’une pièce est compatible (sans se tromper)",
    titleEn: "How to check a part fits (without getting it wrong)",
    excerpt:
      "Marque, modèle, année, référence : la méthode en trois points que l’on applique à l’atelier avant chaque commande.",
    excerptEn:
      "Make, model, year, reference: the three-point method we use in the workshop before every order.",
    category: "Guides",
    tags: ["compatibilité", "guide", "référence"],
    author: "Rouillard Sport",
    date: "2026-09-10",
    image: "/images/editorial/blog-fitment.jpg",
    readMinutes: 6,
    featured: true,
    status: "live",
    body: `La majorité des retours que l’on traite ne vient jamais d’une pièce défectueuse : elle vient d’une pièce commandée pour le mauvais véhicule. Voici la méthode que l’on applique à l’atelier, et que vous pouvez suivre en deux minutes.

## 1. La marque, le modèle, l’année, ensemble

Une « pièce pour Golf » n’existe pas. Il existe une pièce pour Golf VII 1.6 TDI 2015, et une autre pour Golf VIII 2.0 TDI 2021. La génération change tout : cotes, connectiques, connecteurs électriques.

Sur chaque fiche, la section **Compatibilité** liste les modèles et les années testés. Si votre véhicule n’y figure pas, demandez-nous avant de commander : un message avec le numéro de châssis suffit.

## 2. La référence constructeur

Au dos de la pièce usagée, il y a souvent une référence gravée ou une étiquette. C’est la clé : elle est unique, elle ne dépend pas du langage ni de la nomenclature du vendeur.

Notez-la, puis comparez-la aux **numéros OEM** indiqués sur nos fiches. Si les deux correspondent, la compatibilité n’est plus une opinion, c’est un fait.

## 3. L’état et l’usure autour

Une pièce compatible n’est pas forcément la bonne pièce à monter. Sur un système de distribution, on remplace toujours l’ensemble : courroie, galets, pompe à eau. Sur des freinages, on remplace par essieu.

Dans le doute, notre règle : **si nous ne l’avons pas contrôlé, nous ne l’affichons pas.** Chaque fiche indique ce que nous avons mesuré, photographié et vérifié avant de la publier.

---

Envoyez-nous la référence, une photo de la pièce ou le numéro de châssis : la réponse arrive sous 24 h ouvrées.`,
    bodyEn: `Most returns we handle never come from a defective part. They come from a part ordered for the wrong vehicle. Here is the method we use in the workshop, and you can follow it in two minutes.

## 1. Make, model, year, together

There is no such thing as a “Golf part”. There is a part for a 2015 Golf VII 1.6 TDI, and another for a 2021 Golf VIII 2.0 TDI. The generation changes everything: dimensions, connectors, wiring.

Every listing’s **Compatibility** section lists the tested models and years. If your vehicle isn’t there, ask us before ordering: a message with the chassis number is enough.

## 2. The manufacturer reference

On the back of the used part there’s usually a stamped reference or a label. That’s the key: unique, independent of any seller’s naming.

Note it, then compare it with the **OEM numbers** on our listings. If both match, compatibility stops being an opinion. It is a fact.

## 3. Condition and surrounding wear

A compatible part isn’t automatically the right part to fit. On a timing system, always replace the whole set: belt, idlers, water pump. On brakes, replace axle-wide.

When in doubt, our rule: **if we haven’t checked it, we don’t show it.** Every listing states what we measured, photographed and verified before publishing.

---

Send us the reference, a photo of the part or the chassis number: the answer comes within 24 working hours.`,
    createdAt: "2026-09-10",
  },
  {
    slug: "kit-distribution-quand-changer",
    title: "Kit de distribution : quand le changer vraiment",
    titleEn: "Timing kit: when to actually replace it",
    excerpt:
      "Kilométrage, bruit, historique : les signes qui comptent, et ceux que l’on peut ignorer sans risque.",
    excerptEn:
      "Mileage, noise, history: the signs that matter, and the ones you can safely ignore.",
    category: "Entretien",
    tags: ["distribution", "moteur", "entretien"],
    author: "Rouillard Sport",
    date: "2026-09-22",
    image: "/images/editorial/blog-engine.jpg",
    readMinutes: 5,
    featured: true,
    status: "live",
    body: `Le kit de distribution est la pièce la plus surveillée du moteur, et la moins chère à remplacer… tant qu’on le change avant l’irréversible.

## Le calendrier d’abord

Sur les moteurs à courroie, l’intervalle constructeur tourne autour de 120 000 à 160 000 km ou 10 ans, selon les motorisations. C’est un maximum, pas une cible : la courroie vieillit aussi avec le temps, pas seulement avec les kilomètres.

Un véhicule qui roule peu mais qui a huit ans ? Le changement se justifie.

## Les signes qui doivent alerter

- **Un grincement au démarrage froid** : souvent un galet en fin de vie.
- **Des traces de fissures en surface** de la courroie, visibles au démontage.
- **Une fuite de pompe à eau** : la pompe est dans le kit pour une raison.
- **Un historique incomplet** : sans facture, on considère que rien n’a été fait.

## Ce que l’on peut ignorer

Le moteur qui tourne « un peu plus haut » après un changement d’huile, le voyant qui clignote par grand froid : rien à voir avec la distribution. Ne remplacez pas une courroie pour un bruit qui vient d’ailleurs.

## Notre conseil

Changez toujours l’ensemble, toujours avec des pièces de qualité, toujours à froid sur vérification du point mort. Un kit complet coûte une fraction d’un moteur ouvert, et le temps de pose est le même.

Sur nos fiches, chaque kit indique exactement ce qu’il contient : nombre d’éléments, fournitures incluses, garantie.`,
    bodyEn: `The timing kit is the most watched part of the engine, and the cheapest to replace… as long as you replace it before the irreversible happens.

## The calendar first

On belt-driven engines, manufacturer intervals run around 120,000 to 160,000 km or 10 years, depending on the engine. That’s a maximum, not a target: the belt also ages with time, not only with miles.

Low mileage but eight years old? Replacement is justified.

## Signs that should alert you

- **A squeal on a cold start**: often an idler at the end of its life.
- **Surface cracks on the belt**, visible at teardown.
- **A water-pump leak**: the pump is in the kit for a reason.
- **Incomplete history**: no invoice means assume nothing was done.

## What you can ignore

An engine idling “a little higher” after an oil change, a warning light blinking in deep cold: nothing to do with timing. Don’t replace a belt for a noise coming from somewhere else.

## Our advice

Always replace the set, always with quality parts, always checked at TDC on a cold engine. A complete kit costs a fraction of an opened engine, and the labour is the same.

On our listings, every kit states exactly what’s inside: element count, hardware included, warranty.`,
    createdAt: "2026-09-22",
  },
  {
    slug: "retour-piece-en-3-etapes",
    title: "Retourner une pièce en 3 étapes, sans accroc",
    titleEn: "Return a part in 3 steps, hassle-free",
    excerpt:
      "Emballage, documents, délai : tout ce qu’il faut pour un retour accepté du premier coup.",
    excerptEn: "Packaging, paperwork, deadline: everything for a first-time accepted return.",
    category: "Atelier",
    tags: ["retour", "service", "guide"],
    author: "Équipe Rouillard Sport",
    date: "2026-10-01",
    image: "/images/products/gasket-set.jpg",
    readMinutes: 4,
    featured: false,
    status: "live",
    body: `Un retour, ça se prépare. Voici la procédure exacte que l’on applique : les trois étapes suffisent dans la grande majorité des cas.

## 1. Prévenez-nous avant d’envoyer

Répondez à l’e-mail de commande ou utilisez la page Contact avec votre référence RS-XXXXXX. On vérifie ensemble :

- que la pièce n’a pas été montée ;
- que l’incompatibilité éventuelle vient de nous ;
- le délai restant (30 jours après réception).

Si l’incompatibilité est notre faute, le retour est intégralement pris en charge, étiquette retour comprise.

## 2. Emballez comme à l’expédition

La pièce doit repartir dans son emballage d’origine, avec les fournitures (vis, joints, notices) qui l’accompagnaient. Une pièce jetée dans un carton à moitié ouvert arrive toujours abîmée, et personne n’y gagne.

Joignez la facture ou un papier avec votre référence : c’est ce qui relie le colis à votre dossier.

## 3. Envoyez et suivez

Conservez le numéro de suivi jusqu’au remboursement. Dès réception et contrôle, le remboursement part sous 5 à 10 jours ouvrés, sur le moyen de paiement d’origine.

---

Une question avant d’envoyer ? Écrivez-nous : un renvoi évité, c’est du temps et de l’argent de gagnés des deux côtés.`,
    bodyEn: `Returns work best when prepared. Here is the exact procedure we follow. Three steps cover the vast majority of cases.

## 1. Tell us before you ship

Reply to the order email or use the Contact page with your RS-XXXXXX reference. We check together:

- the part hasn’t been fitted;
- any incompatibility is ours;
- the remaining window (30 days after receipt).

If the incompatibility is our fault, the return is fully covered, return label included.

## 2. Pack it as it arrived

The part goes back in its original packaging with the hardware (screws, seals, instructions) it came with. A part tossed into a half-open box always arrives damaged, and nobody wins.

Include the invoice or a note with your reference: that’s what links the parcel to your file.

## 3. Send and track

Keep the tracking number until the refund lands. Once received and checked, the refund goes out within 5 to 10 working days, to the original payment method.

---

Any question before shipping? Write to us: an avoided return saves time and money on both sides.`,
    createdAt: "2026-10-01",
  },
  {
    slug: "piece-reconditionnee-ou-neuve",
    title: "Reconditionnée ou neuve ? Le vrai calcul",
    titleEn: "Refurbished or new? The real maths",
    excerpt:
      "Quand le reconditionné a du sens, quand il n’en a pas, et comment reconnaître un vrai travail d’atelier.",
    excerptEn:
      "When refurbished makes sense, when it doesn’t, and how to spot real workshop work.",
    category: "Guides",
    tags: ["reconditionné", "prix", "alternateur"],
    author: "Rouillard Sport",
    date: "2026-10-07",
    image: "/images/products/alternator.jpg",
    readMinutes: 7,
    featured: false,
    status: "live",
    body: `« Reconditionné » veut dire mille choses différentes selon le vendeur. Voici comment on distingue un vrai travail d’atelier d’un simple nettoyage.

## Quand le reconditionné a du sens

Les pièces électriques tournantes (alternateurs, démarreurs, certains moteurs de direction) ont des pièces d’usure identifiées : paliers, collecteur, balais, roulement. Remplacer ces pièces et tester au banc redonne une pièce fiable, souvent à 40-60 % du prix du neuf.

C’est le cas de notre alternateur Transit : paliers neufs, collecteur refait, testé à 140 A, garantie 12 mois.

## Quand il n’en a pas

- **Les pièces de sécurité structurelles** : plaquettes, disques, courroie de distribution. L’usure est intrinsèque et le reconditionnement n’a aucun sens.
- **Sans test au banc** : un alternateur « nettoyé » n’est pas un alternateur testé.
- **Sans garantie claire** : si personne ne s’engage sur la durée, c’est que personne ne croit au produit.

## Les trois questions à poser

1. Qu’est-ce qui a été remplacé ? (liste précise)
2. Comment est-elle testée ? (bench, valeurs relevées)
3. Quelle est la garantie ? (durée, couverture)

Un vendeur sérieux répond à ces trois questions sans hésiter. Nous, on les écrit sur la fiche.

---

Le calcul, en pratique : une pièce reconditionnée à 245 € avec 12 mois de garantie et un test au banc vaut plus qu’une pièce « neuve » anonyme à 300 € sans historique.`,
    bodyEn: `“Refurbished” means a thousand different things depending on the seller. Here’s how to separate real workshop work from a wipe-down.

## When refurbished makes sense

Rotating electrical parts (alternators, starters, some steering motors) have identified wear items: bearings, commutator, brushes, race. Replace those and bench-test, and you get a reliable part, often at 40-60% of new.

That’s our Transit alternator: new bearings, reconditioned commutator, tested at 140 A, 12-month warranty.

## When it doesn’t

- **Structural safety parts**: pads, discs, timing belts. Wear is intrinsic and refurbishing makes no sense.
- **Without bench testing**: a “cleaned” alternator is not a tested alternator.
- **Without a clear warranty**: if nobody commits to a duration, nobody believes in the product.

## The three questions to ask

1. What was replaced? (exact list)
2. How is it tested? (bench, recorded values)
3. What’s the warranty? (duration, coverage)

A serious seller answers all three without hesitation. We print them on the listing.

---

The maths in practice: a refurbished part at €245 with 12 months warranty and a bench test beats an anonymous “new” part at €300 with no history.`,
    createdAt: "2026-10-07",
  },
];
