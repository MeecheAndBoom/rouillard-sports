import fs from "node:fs";

const ED = "\u2014";
const EN = "\u2013";

/** file -> list of [from, to] pairs applied in order. */
const PLAN = {
  "src/lib/blog-seed.ts": [
    ["Marque, modèle, année, référence " + ED + " la méthode", "Marque, modèle, année, référence : la méthode"],
    ["Make, model, year, reference " + ED + " the three-point method", "Make, model, year, reference: the three-point method"],
    ["## 1. La marque, le modèle, l’année " + ED + " ensemble", "## 1. La marque, le modèle, l’année, ensemble"],
    ["demandez-nous avant de commander " + ED + " un message", "demandez-nous avant de commander : un message"],
    ["n’est plus une opinion " + ED + " c’est un fait.", "n’est plus une opinion, c’est un fait."],
    ["never come from a defective part " + ED + " they come", "never come from a defective part. They come"],
    ["## 1. Make, model, year " + ED + " together", "## 1. Make, model, year, together"],
    ["ask us before ordering " + ED + " a message with the chassis number", "ask us before ordering: a message with the chassis number"],
    ["compatibility stops being an opinion " + ED + " it’s a fact.", "compatibility stops being an opinion. It is a fact."],
    ["Kilométrage, bruit, historique " + ED + " les signes", "Kilométrage, bruit, historique : les signes"],
    ["Mileage, noise, history " + ED + " the signs", "Mileage, noise, history: the signs"],
    ["**Un grincement au démarrage froid** " + ED + " souvent", "**Un grincement au démarrage froid** : souvent"],
    ["**Une fuite de pompe à eau** " + ED + " la pompe", "**Une fuite de pompe à eau** : la pompe"],
    ["**Un historique incomplet** " + ED + " sans facture", "**Un historique incomplet** : sans facture"],
    ["un moteur ouvert " + ED + " et le temps de pose", "un moteur ouvert, et le temps de pose"],
    ["**A squeal on a cold start** " + ED + " often", "**A squeal on a cold start**: often"],
    ["**A water-pump leak** " + ED + " the pump", "**A water-pump leak**: the pump"],
    ["**Incomplete history** " + ED + " no invoice", "**Incomplete history**: no invoice"],
    ["an opened engine " + ED + " and the labour", "an opened engine, and the labour"],
    ["Emballage, documents, délai " + ED + " tout ce qu’il faut", "Emballage, documents, délai : tout ce qu’il faut"],
    ["Packaging, paperwork, deadline " + ED + " everything", "Packaging, paperwork, deadline: everything"],
    ["la procédure exacte que l’on applique " + ED + " les trois étapes", "la procédure exacte que l’on applique : les trois étapes"],
    ["intégralement pris en charge " + ED + " étiquette retour comprise.", "intégralement pris en charge, étiquette retour comprise."],
    ["arrive toujours abîmée " + ED + " et personne n’y gagne.", "arrive toujours abîmée, et personne n’y gagne."],
    ["the exact procedure we follow " + ED + " three steps cover", "the exact procedure we follow. Three steps cover"],
    ["the return is fully covered " + ED + " return label included.", "the return is fully covered, return label included."],
    ["always arrives damaged " + ED + " and nobody wins.", "always arrives damaged, and nobody wins."],
    [
      "Les pièces électriques tournantes " + ED + " alternateurs, démarreurs, certains moteurs de direction " + ED + " ont des pièces",
      "Les pièces électriques tournantes (alternateurs, démarreurs, certains moteurs de direction) ont des pièces",
    ],
    ["40" + EN + "60% of new", "40-60% of new"],
  ],
  "src/lib/i18n/dictionaries/en.ts": [
    ["subjectPart: \"Part wanted " + ED + " {part}\"", "subjectPart: \"Part wanted: {part}\""],
    ["\"Order received " + ED + " {ref}\"", "\"Order received | {ref}\""],
    ["\"New order {ref} " + ED + " {name}\"", "\"New order {ref} | {name}\""],
    ["\"Payment instructions " + ED + " {ref}\"", "\"Payment instructions | {ref}\""],
    ["\"Payment confirmed " + ED + " {ref}\"", "\"Payment confirmed | {ref}\""],
    ["\"Payment proof received " + ED + " {ref}\"", "\"Payment proof received | {ref}\""],
    ["\"Payment approved " + ED + " {ref}\"", "\"Payment approved | {ref}\""],
    ["\"Please resend your proof " + ED + " {ref}\"", "\"Please resend your proof | {ref}\""],
    ["\"Order update " + ED + " {ref}\"", "\"Order update | {ref}\""],
    ["\"Your message " + ED + " received\"", "\"Your message was received\""],
  ],
  "src/lib/i18n/dictionaries/fr.ts": [
    ["subjectPart: \"Pièce recherchée " + ED + " {part}\"", "subjectPart: \"Pièce recherchée : {part}\""],
    ["\"Commande enregistrée " + ED + " {ref}\"", "\"Commande enregistrée | {ref}\""],
    ["\"Nouvelle commande {ref} " + ED + " {name}\"", "\"Nouvelle commande {ref} | {name}\""],
    ["\"Instructions de paiement " + ED + " {ref}\"", "\"Instructions de paiement | {ref}\""],
    ["\"Paiement confirmé " + ED + " {ref}\"", "\"Paiement confirmé | {ref}\""],
    ["\"Preuve de paiement reçue " + ED + " {ref}\"", "\"Preuve de paiement reçue | {ref}\""],
    ["\"Paiement validé " + ED + " {ref}\"", "\"Paiement validé | {ref}\""],
    ["\"Merci de renvoyer votre preuve " + ED + " {ref}\"", "\"Merci de renvoyer votre preuve | {ref}\""],
    ["\"Mise à jour de la commande " + ED + " {ref}\"", "\"Mise à jour de la commande | {ref}\""],
    ["\"Votre message " + ED + " bien reçu\"", "\"Votre message a bien été reçu\""],
  ],
  "src/actions/orders.ts": [
    ["\"Format non accepté " + ED + " utilisez JPG, PNG ou WebP.\"", "\"Format non accepté, utilisez JPG, PNG ou WebP.\""],
    ["\"SMTP non configuré " + ED + " e-mail enregistré localement.\"", "\"SMTP non configuré, e-mail enregistré localement.\""],
  ],
  "src/lib/db.ts": [
    ["\"MongoDB recently unreachable " + ED + " using local store\"", "\"MongoDB recently unreachable, using local store\""],
  ],
  "src/lib/mailer.ts": [
    ["\"SMTP not configured " + ED + " saved to data/outbox\"", "\"SMTP not configured, saved to data/outbox\""],
  ],
  "src/app/api/cloudinary/upload/route.ts": [
    [
      "\"Cloudinary non configuré " + ED + " ajoutez",
      "\"Cloudinary non configuré, ajoutez",
    ],
  ],
};

let applied = 0;
let missed = 0;

for (const [file, pairs] of Object.entries(PLAN)) {
  let src = fs.readFileSync(file, "utf8");
  for (const [from, to] of pairs) {
    if (!src.includes(from)) {
      console.log("MISS", file, JSON.stringify(from.slice(0, 60)));
      missed += 1;
      continue;
    }
    src = src.split(from).join(to);
    applied += 1;
  }
  fs.writeFileSync(file, src, "utf8");
}

console.log(`applied ${applied}, missed ${missed}`);
