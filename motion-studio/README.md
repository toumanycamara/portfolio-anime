# motion-studio — Publicité motion design « École 221 » (90 s)

Film publicitaire de **2 minutes (125 s)** (1920×1080, 30 fps, H.264 + AAC stéréo) construit avec **Remotion + React**.
Les écrans montrés sont de **vraies captures** de l'application PHP (voir « Captures authentiques »), jamais des maquettes.

> Les fichiers PHP d'origine n'ont **pas** été modifiés. Ils sont copiés dans un dossier temporaire et exécutés
> avec une base **MariaDB de démonstration contenant uniquement des données fictives**.

## Démarrage rapide

```bash
cd motion-studio
npm install

npm run audio      # (re)génère la bande-son originale  -> public/audio/soundtrack.wav
npm run studio     # prévisualisation interactive (une composition par scène + le film complet)
npm run render     # export MP4 -> out/ecole221-publicite-125s.mp4
npm run verify     # contrôle qualité (durée, résolution, fps, codecs, loudness, planche contact)
```

Aperçu d'images précises : `node tools/stills.mjs 120 900 2000` → `out/stills/fXXXX.png`.

## Storyboard (coupes sur les temps, 120 BPM)

| Scène | Composant | Durée | Contenu |
|---|---|---|---|
| 1 | `Introduction` | 0–8 s | « Une école. Trois profils. » puis le blason |
| 2 | `DashboardReveal` | 8–18 s | Vraie connexion, révélation du tableau de bord, chiffres clés |
| 3 | `InterfaceNavigation` | 18–33 s | Étudiant / Formateur / Secrétaire |
| 4 | `FeatureShowcase` (+ `StatisticsAnimation`) | 33–48 s | Appel, saisie des notes, statistiques |
| 5 | `ManagementShowcase` | 48–83 s | Ajouter un étudiant, une classe, un niveau, un formateur, une filière, une matière ; modifier |
| 6 | `UserExperience` | 83–98 s | De la saisie d'une note au résultat ; « Annuler » une suppression |
| 7 | `ResponsiveShowcase` | 98–110 s | Ordinateur → smartphone (menu hamburger) |
| 8 | `ValueProps` | 110–120 s | 4 bénéfices réels, chacun prouvé par un extrait d'écran |
| 9 | `ClosingScene` | 120–125 s | Blason, nom, signature |

## Où modifier quoi

- `src/config.ts` — **tout** le réglable : couleurs, textes, chiffres des statistiques, volume.
- `src/timeline.json` — début/fin de chaque scène + **repères sonores** (impacts, whooshes, clics…), partagé par la vidéo et l'audio.
- `src/scenes/*` — une scène = un composant indépendant (caméra, curseur et captures décrits par images-clés).
- `src/components/*` — briques réutilisables : `UIWindow` (fenêtre + caméra virtuelle + curseur), `PhoneFrame`, `Rise` (typographie cinétique), `Wipe` (transition), `Backdrop`.

## Captures authentiques

`tools/build_demo.py` monte l'environnement (copie des pages, base fictive, sidebars reconstruites),
puis `tools/capture.mjs` pilote un vrai navigateur : connexion par le vrai formulaire, clics réels, états réels
(erreurs de validation, notifications, modales…) → `public/captures/*.png` (+ `manifest.json` : position des cibles de clic).

```bash
# prérequis : php, mariadb-server, faketime (date figée au 5/11/2026), chromium
python3 -I tools/build_demo.py <dossier des .php> <dossier démo> <logo.png>
cd <dossier démo>/app && faketime -f "@2026-11-05 10:20:00" php -S 127.0.0.1:8221 -t . &
DEMO=<dossier démo> node tools/capture.mjs
```

Comptes de démonstration (mot de passe `demo1234`) : `demo.secretaire@…`, `demo.formateur@…`, `demo.etudiant@ecole221.sn`.

### Ce qui est reconstruit (à connaître)
- Les **3 menus latéraux** (`includes/sidebar*.php`) n'ont pas été fournis : ils sont **reconstruits** (même charte, entrées déduites des pages). Si vous fournissez les originaux, relancez `build_demo.py` en les copiant puis `capture.mjs`.
- Les **photos de profil** sont des avatars neutres générés (aucune vraie personne).
- Tous les noms, matricules, e-mails, téléphones et notes sont **fictifs**.

## Audio

`tools/make_audio.py` synthétise une musique **originale** (120 BPM, la mineur) + des effets, tous déclenchés par `src/timeline.json`.
Aucun échantillon externe → libre de droits. Pour utiliser votre propre musique : déposez `public/audio/music.wav`
(WAV 16 bits ; il est rééchantillonné à 48 kHz si besoin) puis relancez `npm run audio` : votre musique remplace la musique générée et les effets restent synchronisés.

## Licence Remotion
Remotion est gratuit pour les particuliers et les petites structures ; un usage en entreprise au-delà d'un certain effectif nécessite une licence : <https://remotion.pro>.
