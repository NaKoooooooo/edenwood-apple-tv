# Rapport de compatibilité — Edenwood Apple TV

Téléviseur cible : **Edenwood ED40A02FHD-EL** (réf. 982166) · VIDAA · firmware **V0104.07.00V.N1116** · 1920 × 1080.

Ce document sépare strictement **ce qui a été vérifié**, **ce qui est raisonnablement sûr** et **ce qui reste à tester sur votre téléviseur**.

---

## 1. Ce qui a réellement été testé

Testé le 25 novembre 2026, dans un navigateur **Chromium** sous Windows 11, page servie en HTTP local
(`python -m http.server`), fenêtre forcée à 1920 × 1080 puis 1280 × 720.

| Élément | Résultat |
|---|---|
| Chargement de l'accueil | OK — aucune erreur console |
| Affichage des images (SVG) | OK — affiches, icônes, fonds, bannière |
| Navigation clavier haut/bas/gauche/droite | OK |
| Sélection des cartes (Entrée / code 13) | OK |
| Retour (codes 27, 8, 461) | OK — ferme la fenêtre, puis remonte aux onglets, puis propose de quitter |
| Touche Accueil (code 36) | OK — retour à « À la une » |
| Touche rouge (code 403) | OK — bascule le favori de la carte sélectionnée |
| Raccourcis chiffrés 1 à 8 | OK — ouvrent l'application correspondante |
| Défilement horizontal des rails | OK — la carte sélectionnée reste visible |
| Défilement vertical des sections | OK |
| Page Réglages | OK — thème, accent, fond, horloge, format, bascules |
| Ordre des applications | OK — OK pour prendre, Gauche/Droite pour déplacer, enregistré |
| Favoris | OK — ajout, retrait, section Favoris, badge étoile |
| Horloge et date française | OK — « Mercredi 25 novembre 2026 » |
| Sauvegarde des préférences (LocalStorage) | OK — relues après rechargement |
| Redimensionnement 1920×1080 → 1280×720 | OK — mise à l'échelle homothétique, mise en page identique |

### Refonte visuelle (version 1.1.0) — retesté le 26 novembre 2026

Mêmes conditions (Chromium, Windows 11, serveur HTTP local, 1920 × 1080 puis 1280 × 720).

| Élément | Résultat |
|---|---|
| Nouvelles affiches et bannières SVG | OK — rendu correct, aucun recadrage (bannières au format exact 1920 × 630) |
| Nouvelles tuiles d'applications | OK |
| Bannière plein cadre + en-tête superposé | OK — texte lisible sur toute la largeur grâce aux voiles dégradés |
| Fondu enchaîné entre deux bannières | OK — Horizon → Sillage → Oasis |
| Rotation automatique au repos (11 s) | OK — relancée à chaque appui, donc jamais pendant la navigation |
| Rangées d'accueil (Applications, Recommandés, Films, Séries, Récemment ajoutés) | OK |
| Films / Séries / Favoris en grille | OK — navigation ligne par ligne |
| Réglages : icônes, catégories, valeurs à droite | OK |
| Accentuation uniquement sur la ligne sélectionnée | OK (corrigé : la feuille de repli colorait toutes les valeurs) |
| Une seule marque de focus à tout instant | OK (corrigé : le focus restait sur la vue quittée) |
| Premier écran sans défilement | OK — bannière + rangée Applications tiennent dans 1012 px |
| Mise à l'échelle 1280 × 720 | OK — facteur 0,667, mise en page identique |
| Aucune erreur console | OK |

**Non testé :** le comportement réel sur le téléviseur. Aucune opération n'a été lancée sur la TV.

---

## 2. Choix techniques faits pour VIDAA

Le navigateur VIDAA est un moteur de type WebKit/Chromium dont la version exacte n'est pas publiée par
Hisense et varie selon le firmware. Faute de certitude, le projet s'interdit tout ce qui est récent.

### JavaScript
* **ES5 uniquement** : aucun `let` / `const`, aucune fonction fléchée, aucun gabarit de chaîne,
  aucune `Promise`, aucune `class`, aucun `Array.from` / `Object.assign` / `fetch`.
* Lecture des touches via `event.keyCode || event.which` (et non `event.key`, absent sur certains firmwares).
* `requestAnimationFrame` non requis : les animations sont confiées au CSS.
* Aucun appel réseau : tout est local, l'interface fonctionne hors ligne.
* `localStorage` encapsulé dans un `try / catch` avec **repli mémoire** : si le stockage est refusé,
  l'interface fonctionne quand même et prévient l'utilisateur.

### CSS
* **Pas de `gap`** en flexbox (support tardif) — espacement par `margin`.
* **Pas de** `clamp()`, `min()`, `max()`, `:is()`, `:where()`, `aspect-ratio`, `backdrop-filter`.
* Variables CSS utilisées **avec une valeur de repli déclarée juste avant** chaque usage, plus une
  feuille de style de secours générée par `app.js` pour les couleurs d'accentuation.
* Préfixes `-webkit-` systématiques sur `transform`, `transition`, `flex` et les dégradés.
* Animations limitées à `transform` et `opacity` (composables par le GPU) ; aucune animation de
  `box-shadow`, `filter` ou `blur`.

### Mise en page
* Scène **fixe de 1920 × 1080 px**, mise à l'échelle par une seule `transform: scale()` sur `#app`.
  C'est la technique la plus fiable sur téléviseur : la mise en page ne dépend jamais des unités
  relatives ni du `viewport` déclaré par le firmware.
* Marges de 72 px à gauche et à droite (zone de sécurité écran).
* Défilement par `transform` et non par `scrollTop` : le défilement natif est souvent capricieux
  dans les navigateurs TV.

---

## 3. Ce qui reste à vérifier sur votre Edenwood

Ouvrez **`diagnostic.html`** sur le téléviseur et appuyez sur chaque touche.

| Point | Pourquoi c'est incertain | Quoi faire |
|---|---|---|
| Code de la touche **Retour** | 461 est le code HbbTV `VK_BACK` utilisé par Hisense/VIDAA, mais non garanti sur ce firmware | Relever le code et l'ajouter à `touches.retour` dans `config.js` |
| Code de la touche **Exit** | Aucun standard | Relever et ajouter à `touches.retour` ou `touches.accueil` |
| Codes des **touches de couleur** (403-406) | Codes HbbTV ; le navigateur VIDAA peut les intercepter avant la page | Relever ; si rien ne s'affiche, la touche est consommée par le système |
| Touche **Accueil (Home)** | Très probablement interceptée par le système (elle quitte le navigateur) | Comportement normal, aucune action possible |
| **Flèches consommées par le navigateur** | Certains navigateurs TV utilisent les flèches pour un curseur à l'écran | Si le curseur apparaît, désactiver le mode pointeur dans le navigateur, ou utiliser la souris/pointeur |
| **Support de `localStorage`** | Peut être désactivé en navigation privée ou restreint par le firmware | Réglages → Système → « Stockage local » indique l'état réel |
| **Polices** | Helvetica Neue / Arial peuvent être absentes ; repli `sans-serif` | Vérifier visuellement |
| **Rendu des SVG** | Très largement supporté, mais un firmware ancien peut mal gérer `dominant-baseline` | Si les lettres des icônes sont mal centrées, remplacer les SVG par des PNG |
| **Performances des transparences** | `rgba` sur grandes surfaces peut coûter cher | Réglages → Apparence → désactiver **Transparences** et **Animations** |

---

## 4. Limites de plateforme — ce qui est impossible, et pourquoi

Ces points ne sont pas des défauts du projet : ce sont les limites réelles de VIDAA.

### 4.1 Lancer une application installée (Netflix, Disney+, Prime Video, TF1+)
**Impossible depuis une page web.** VIDAA n'expose aucune API publique de lancement d'application,
et aucun schéma d'URL (`netflix://`, `vidaa://`…) documenté pour le navigateur.

Ce que montrent les deux projets étudiés :
* **homeos-vidaa** (shachindran) — tableau de bord web pour VIDAA. Ses tuiles d'applications natives
  n'ouvrent **rien** : elles affichent un message demandant d'appuyer sur Home. Son README le dit
  explicitement : les raccourcis d'applications sont visuels et ne lancent pas les applications natives.
* **alvidaa** (carteakey) — launcher alternatif. Son unique voie *sans root* passe par un **boîtier
  externe** (Raspberry Pi ou NAS) exécutant un pont Go/Python qui pilote la TV en **MQTT sur TLS,
  port 36669**, via le canal « RemoteNow », après un appairage par code à 4 chiffres avec un certificat
  client extrait de l'application mobile. La page web ne pilote rien elle-même : elle parle au pont.
  Les autres voies exigent le root du téléviseur.

**Conséquence pour Edenwood Apple TV :** le projet n'invente aucun lien profond et ne fait tourner aucun
pont. Les applications natives affichent une consigne télécommande claire. C'est le comportement honnête.

> Si vous souhaitez un jour un lancement réel, la seule voie sans modification du téléviseur est celle
> d'alvidaa : un boîtier externe allumé en permanence, un appairage, et un certificat extrait d'une
> application tierce. Ce n'est pas mis en place ici et cela sort du cadre de ce projet.

### 4.2 Changer d'entrée HDMI
Même situation : aucune API web. La section « Sources HDMI » est informative et renvoie vers la
touche **Source / Input** de la télécommande.

### 4.3 Fermer le navigateur ou revenir à l'accueil VIDAA
Aucune page web n'a le droit de fermer le navigateur. La fenêtre « Quitter l'interface ? » explique
d'utiliser la touche **Accueil** ou **Exit**.

### 4.4 Remplacer l'écran d'accueil du téléviseur
Impossible sans root. Edenwood Apple TV est une **page web**, pas un launcher système. Elle s'ouvre
depuis le navigateur VIDAA (idéalement en page d'accueil ou en favori).

### 4.5 Lecture vidéo des services de streaming dans le navigateur
Netflix, Disney+, Prime Video et TF1+ exigent la DRM Widevine à un niveau que le navigateur VIDAA
n'expose généralement pas. Même en ouvrant leur site web, la lecture échouera probablement. C'est
pourquoi ces quatre services sont classés « Application TV » et non « Site web ».

---

## 5. Compatibilité des sources étudiées avec ce téléviseur

| Projet | Compatible Edenwood ED40A02FHD-EL ? | Remarque |
|---|---|---|
| **homeos-vidaa** | Oui, techniquement (c'est une page web statique) | Aucun modèle ni firmware n'est documenté dans le dépôt. Mêmes limites de lancement d'applications. |
| **alvidaa — launcher via pont externe** | Non vérifiable | Le tableau des modèles testés ne liste que des Hisense (50A51HUV, 43E7DS, 55A7KAU…) avec des firmwares en `V0000.09.xx`. Votre firmware est en **V0104.07.00V.N1116**, d'une autre famille. Aucune ligne Edenwood. |
| **alvidaa — voies root** | **Écarté volontairement** | Hors cadre : aucun root, aucun exploit, aucune modification de partition. |
| **Guide WebApp VIDAA (PDF officiel)** | Non consultable | L'URL fournie renvoie **404** sur vidaa.com. Le document n'a donc pas pu être lu et **aucune API VIDAA n'est supposée** dans ce projet. |

**Important :** l'absence de votre modèle dans les tableaux d'alvidaa ne veut pas dire que ça ne
marcherait pas — cela veut dire que **personne ne l'a testé**. Et comme nous n'utilisons ni root ni
pont, cela n'a aucune conséquence sur Edenwood Apple TV, qui ne dépend que du navigateur.

---

## 6. Résultats de vos tests sur le téléviseur

À remplir après la première ouverture sur l'Edenwood.

| Test | Résultat | Notes |
|---|---|---|
| Ouverture de la page | | |
| Affichage 1920 × 1080 (pas de bandes, pas de zoom) | | |
| Temps de chargement | | |
| Flèches de la télécommande | | |
| Touche OK | | |
| Touche Retour (code relevé : ____) | | |
| Touche Exit (code relevé : ____) | | |
| Touches de couleur (codes relevés : ____) | | |
| Chiffres 1 à 8 | | |
| Fluidité du défilement | | |
| Transparences activées | | |
| Animations activées | | |
| Persistance des réglages après extinction | | |
| Ouverture d'un raccourci « Site web » | | |
