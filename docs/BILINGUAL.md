# Bilinguisme FR / EN — fonctionnement i18n

# Bilingual layer — how FR/EN works

Le site est entièrement bilingue français/anglais, sans préfixe d'URL : une seule adresse par page, la langue choisie est mémorisée dans un cookie.

The site is fully bilingual French/English with no URL prefixes: one address per page, the chosen language is stored in a cookie.

## Sélection de la langue / Language selection

1. Bascule `FR / EN` dans la barre de navigation (client, `LanguageToggle`).
2. Écrit le cookie `rs-locale` (`fr` par défaut, `en`), recharge côté serveur.
3. Côté serveur : `getLocale()` lit le cookie ; `getDict()` / `dictFor(locale)` chargent le dictionnaire.
4. Côté client : `LocaleProvider` expose `locale` + `t` ; `LanguageToggle` et les formulaires utilisent ce contexte.
5. `src/app/layout.tsx` écrit `<html lang="fr|en">` — important pour les lecteurs d'écran et le SEO.

## Dictionaries / Les dictionnaires

- `src/lib/i18n/dictionaries/fr.ts` — **source de vérité** ; le type `Dictionary = typeof fr`.
- `src/lib/i18n/dictionaries/en.ts` — doit avoir exactement les mêmes clés ; TypeScript refuse le build sinon (parité garantie par les types).
- **Pour ajouter une chaîne** : ajoutez la clé dans `fr.ts` puis dans `en.ts` (même emplacement). L'IDE signalera toute clé manquante.

## Contenu de la base / DB content

- Les contenus éditoriaux (produits, articles) ont des champs `*En` optionnels (`titleEn`, `excerptEn`, …) ; s'ils sont vides, la version FR est affichée dans les deux langues.
- Les libellés de taxonomie et d'état passent par des constantes localisées (`CATEGORY_LABELS`, `PART_CONDITIONS`, `categoryLabel()` dans `src/lib/constants.ts`).
- Les e-mails utilisent la langue stockée dans la commande (`order.lang`), lue au moment de l'envoi.
- La devise (EUR) et les dates sont formatées localement (`fr-FR` / `en-GB`) via `src/lib/format.ts`.

## Back-office / Admin

Le chrome d'administration reste en anglais par choix (utilisateur unique, opérationnel). Les méthodes de paiement éditées dans Admin → Settings portent à la fois un libellé FR (`label`/`hint`) et EN (`labelEn`/`hintEn`) ; ce sont ceux affichés au client selon sa langue.
