# Navigation à la télécommande — Edenwood Apple TV

## 1. Principe

L'interface est pilotée **uniquement au clavier directionnel**. Aucune souris n'est nécessaire
(le clic est néanmoins accepté, ce qui facilite les tests sous Windows).

Le moteur de focus repose sur des **lignes de navigation** (`data-nav-row`) et non sur une
recherche géométrique approximative :

* chaque rail, chaque barre de boutons, chaque ligne de réglage est une **ligne** ;
* **Gauche / Droite** se déplace à l'intérieur de la ligne, sans rebouclage ;
* **Haut / Bas** change de ligne et retombe sur la **colonne mémorisée** de la ligne visée
  (ou, à défaut, sur l'élément le plus proche horizontalement) ;
* le focus n'est jamais perdu : si une ligne disparaît (section vide, réglage modifié),
  le focus est restauré sur la ligne équivalente après reconstruction.

Ordre des lignes, de haut en bas :

```
1. En-tête          → bouton Réglages
2. Onglets          → À la une · Films · Séries · Favoris · Applications · Sources HDMI
3..n  Contenu de la section active (bannière, puis chaque rangée ou ligne de grille)
```

Une seule marque de focus existe à tout instant : changer de section efface toute marque
résiduelle avant d'en poser une nouvelle.

## 2. Table des touches

| Touche | Codes écoutés | Effet |
|---|---|---|
| Haut | 38 | Ligne précédente |
| Bas | 40 | Ligne suivante |
| Gauche | 37 | Élément précédent — **ou** valeur précédente dans les Réglages |
| Droite | 39 | Élément suivant — **ou** valeur suivante dans les Réglages |
| OK | 13, 32 | Activer l'élément sélectionné |
| Retour | 8, 27, 461, 10009, 166, 420, 427 | Fermer la fenêtre → remonter aux onglets → revenir à l'accueil → proposer de quitter |
| Accueil | 36, 1001 | Retour direct à la section de démarrage |
| Rouge | 403, 112 | Ajouter / retirer des favoris le titre sélectionné |
| Verte | 404, 113 | Ouvrir les Réglages |
| 1 à 9 | 49-57 et 97-105 | Ouvrir directement l'application correspondante |

Les codes sont regroupés dans `config.js` → objet `touches`. **Ajouter un code est sans risque** :
un code inconnu est simplement ignoré.

> Codes **confirmés** par les projets VIDAA existants : 37, 38, 39, 40, 13, 8, 27, 461.
> Codes **à vérifier** sur votre téléviseur avec `diagnostic.html` : 10009, 166, 420, 427, 36, 1001, 403-406.

## 3. Comportement du Retour (hiérarchie)

Le Retour applique toujours l'action la **moins destructrice** disponible :

```
Fenêtre ouverte ?        → la fermer
Dans les Réglages ?      → revenir à la section de démarrage
Focus dans le contenu ?  → remonter à la barre d'onglets
Pas sur la section de démarrage ? → y revenir
Sinon                    → fenêtre « Quitter l'interface ? »
```

L'interface ne peut pas fermer le navigateur : la dernière fenêtre explique d'utiliser
la touche Accueil ou Exit du téléviseur.

## 4. Repères visuels du focus

* agrandissement léger (`scale 1.05` à `1.07`) ;
* **anneau lumineux de 4 px** à la couleur d'accentuation ;
* ombre portée renforcée ;
* titre de la carte passé en blanc pur ;
* dans les Réglages : fond de ligne éclairci + flèches ‹ › révélées quand la valeur est modifiable.

Tous ces effets sont désactivables (Réglages → Apparence → Animations) pour les téléviseurs lents.

## 5. Défilement

* **Horizontal** : la piste du rail est translatée (`transform`), jamais `scrollLeft`.
  La carte sélectionnée reste toujours à au moins 72 px du bord.
* **Vertical** : la section entière est translatée, avec une marge de 36 px au-dessus et au-dessous
  de l'élément sélectionné.
* Durée d'animation : 260 ms (`reglages.dureeDefilement` dans `config.js`).

## 6. Procédure de test sous Windows

1. Ouvrir `index.html` (double-clic) **ou**, pour être au plus près du téléviseur, servir le dossier :
   ```powershell
   python -m http.server 8099
   ```
   puis ouvrir `http://127.0.0.1:8099/index.html`.
2. Mettre le navigateur en plein écran (**F11**).
3. Dérouler la liste ci-dessous **sans toucher la souris**.

| # | Test | Attendu |
|---|---|---|
| 1 | Au chargement | Le bouton « Lire » de la bannière est sélectionné |
| 2 | Bas | Passage au rail Applications, première icône sélectionnée |
| 3 | Droite × 5 | Déplacement icône par icône, sans saut |
| 4 | Bas | Passage au rail Films, colonne proche conservée |
| 5 | Droite jusqu'au bout | Le rail défile, la dernière carte reste visible |
| 6 | Haut | Retour au rail Applications sur la **même colonne** |
| 7 | OK sur Netflix | Fenêtre « Ce raccourci ne peut pas lancer l'application » |
| 8 | Échap | La fenêtre se ferme, le focus revient sur Netflix |
| 9 | Haut × 2 | Barre d'onglets puis bouton Réglages |
| 10 | OK | Page Réglages, première ligne sélectionnée |
| 11 | Droite sur « Couleur d'accentuation » | La couleur change immédiatement partout |
| 12 | Bas jusqu'à « Ordre des applications » | |
| 13 | OK puis Droite | Le raccourci change de position, message de confirmation |
| 14 | OK | Position enregistrée |
| 15 | Échap | Retour à « À la une », nouvel ordre visible |
| 15b | Ne rien toucher 11 s | La bannière change de titre en fondu (réglage « Bannière animée ») |
| 16 | Touche `1` | Fenêtre Netflix |
| 17 | Sélectionner un film, touche `A` (code 403 ≈ rouge) | Ajout aux favoris, étoile sur la carte |
| 18 | Onglet Favoris | Le titre y figure, présenté en grille |
| 19 | **F5** | Thème, couleur et favoris sont conservés |
| 20 | Réduire la fenêtre | L'interface se met à l'échelle, mise en page identique |

> Sur un clavier d'ordinateur, les touches de couleur (403-406) ne sont pas envoyées.
> Pour tester ce chemin, utilisez `diagnostic.html` sur le téléviseur, ou ajoutez temporairement
> un code de clavier dans `touches.rouge` (par exemple `65` pour la touche A).

## 7. Procédure de test sur le téléviseur

1. Publier le dossier (voir `README.md`, section GitHub Pages) ou le servir depuis le PC.
2. Sur la TV : **Accueil → Navigateur → barre d'adresse**, saisir l'URL.
3. Ouvrir d'abord **`.../diagnostic.html`** et relever les codes des touches
   Retour, Exit, Accueil et des quatre touches de couleur.
4. Reporter ces codes dans `config.js` → `touches`, republier.
5. Ouvrir **`.../index.html`** et dérouler la liste du § 6 (sauf les tests 17 à 20 propres au clavier).
6. Noter les résultats dans `tests/compatibility.md`, § 6.

> Ne déclarez pas un test réussi sans l'avoir réellement effectué : le tableau du § 6 de
> `compatibility.md` est volontairement laissé vide.
