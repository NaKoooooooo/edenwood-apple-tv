# EDENWOOD APPLE TV

Interface Smart TV premium, inspirée de l'esthétique Apple TV, conçue pour le **navigateur VIDAA**
d'un téléviseur **Edenwood ED40A02FHD-EL** (1920 × 1080, firmware V0104.07.00V.N1116).

HTML5 · CSS3 · JavaScript ES5 · aucune dépendance · aucun appel réseau · aucune modification du téléviseur.

---

## Sommaire

1. [Ce que fait ce projet — et ce qu'il ne peut pas faire](#1-ce-que-fait-ce-projet--et-ce-quil-ne-peut-pas-faire)
2. [Démarrage rapide sous Windows](#2-démarrage-rapide-sous-windows)
3. [Arborescence](#3-arborescence)
4. [Navigation à la télécommande](#4-navigation-à-la-télécommande)
5. [Réglages](#5-réglages)
6. [Personnalisation (config.js)](#6-personnalisation-configjs)
7. [Publication sur GitHub Pages](#7-publication-sur-github-pages)
8. [Test sur le téléviseur](#8-test-sur-le-téléviseur)
9. [Retour à l'interface native du téléviseur](#9-retour-à-linterface-native-du-téléviseur)
10. [Ce qui a été étudié](#10-ce-qui-a-été-étudié)
11. [Licence, marques et contenus](#11-licence-marques-et-contenus)

---

## 1. Ce que fait ce projet — et ce qu'il ne peut pas faire

### Ce qu'il fait

* Un **écran d'accueil cinématographique** : bannière plein cadre qui change doucement lorsque la
  télécommande est au repos, rangées d'affiches, tuiles d'applications, noir profond, ombres
  douces, transitions discrètes.
* Six sections : **À la une · Films · Séries · Favoris · Applications · Sources HDMI**. L'accueil
  réunit les rangées Applications, Recommandés, Films, Séries, Récemment ajoutés — et Favoris
  dès qu'il y en a.
* **Films**, **Séries** et **Favoris** présentent les affiches en **grille**.
* Une **navigation entièrement télécommande**, pensée pour un écran de 40 pouces vu du canapé.
* Une **page Réglages** complète : thème, couleur d'accentuation, fond d'écran, horloge,
  ordre et visibilité des raccourcis, favoris, animations, transparences, informations système,
  réinitialisation.
* Une **persistance locale** des préférences, avec fonctionnement dégradé si le stockage est refusé.
* Un **outil de diagnostic** (`diagnostic.html`) pour relever les codes réels de votre télécommande.

### Ce qu'il ne peut pas faire — et pourquoi

> **Une page web ne peut pas lancer une application VIDAA installée.**
> VIDAA n'expose aucune interface publique pour cela, et aucun schéma d'URL documenté.
> Ce projet **n'invente donc aucun lien profond**.

| Raccourci | Type | Comportement réel |
|---|---|---|
| YouTube, Spotify, Navigateur | **Site web** | Ouvre réellement l'adresse dans le navigateur VIDAA |
| Netflix, Disney+, Prime Video, TF1+ | **Application TV** | Affiche la marche à suivre : touche Accueil, puis l'application |
| Sources HDMI | **Téléviseur** | Affiche la marche à suivre : touche Source / Input |

Chaque carte porte une étiquette (`SITE WEB`, `APPLICATION TV`, `TÉLÉVISEUR`) : la distinction est
visible **avant** d'appuyer sur OK.

Le détail complet des limites de plateforme est dans **[`tests/compatibility.md`](tests/compatibility.md)**.

### Contenus de démonstration

Les 12 films et séries affichés sont **fictifs**, créés pour ce projet. Aucun ne correspond à une
œuvre réelle ni au catalogue d'un service. Chaque affiche porte le badge **DÉMO**, chaque synopsis
le rappelle, et un avertissement est affiché en permanence en bas de l'écran.
Aucune fausse donnée n'est présentée comme réelle.

---

## 2. Démarrage rapide sous Windows

### Le plus simple

Double-cliquez sur **`index.html`**. L'interface s'ouvre dans votre navigateur.
Appuyez sur **F11** pour le plein écran, puis naviguez aux flèches et à Entrée.

### Recommandé pour tester (identique au téléviseur)

Ouvrez PowerShell dans le dossier du projet :

```powershell
python -m http.server 8099
```

Puis ouvrez `http://127.0.0.1:8099/index.html`.

Cette méthode est préférable : elle reproduit le service HTTP du téléviseur et évite les
restrictions du protocole `file://` (notamment sur `localStorage`).

> Pas de Python ? `npx serve -l 8099` fait la même chose avec Node.

### Diagnostic des touches

```powershell
start http://127.0.0.1:8099/diagnostic.html
```

---

## 3. Arborescence

```
edenwood-apple-tv/
├── index.html              Interface principale (coquille ; le contenu est généré par app.js)
├── style.css               Feuille de style unique, compatible navigateurs TV
├── app.js                  Logique : focus, navigation, réglages, persistance
├── config.js               TOUTE la configuration : applications, catalogue, touches, couleurs
├── diagnostic.html         Outil autonome de relevé des codes de la télécommande
├── README.md               Ce document
├── .nojekyll               Nécessaire à GitHub Pages
├── style.v1.bak            Sauvegarde de la feuille de style d'origine (v1)
├── assets/
│   ├── backgrounds/        3 fonds d'écran + 6 bannières cinéma 1920x630 (SVG)
│   ├── movies/             12 affiches verticales 600x900 (SVG)
│   ├── icons/              8 tuiles d'applications (SVG, créées pour ce projet)
│   ├── logos/              Logo Edenwood Apple TV (SVG)
│   └── screenshots/        Vos captures d'écran (vide au départ)
├── tools/
│   └── generer-visuels.py  Génère toutes les illustrations
└── tests/
    ├── navigation.md       Table des touches + procédures de test détaillées
    └── compatibility.md    Rapport de compatibilité honnête (testé / à vérifier / impossible)
```

Tous les visuels sont des **SVG générés par un script** : affiches, bannières, tuiles et logo sont
dessinés par `tools/generer-visuels.py` (dégradés et formes seulement, aucun filtre SVG — trop
coûteux sur un téléviseur). Aucun téléchargement, mise à l'échelle parfaite en 1080p, projet
entier sous 400 Ko.

Pour regénérer les illustrations après modification du script :

```powershell
python tools/generer-visuels.py
```

---

## 4. Navigation à la télécommande

| Touche | Effet |
|---|---|
| ▲ ▼ ◀ ▶ | Déplacer la sélection (dans les Réglages : ◀ ▶ change la valeur) |
| **OK** | Activer |
| **Retour** | Fermer la fenêtre → remonter aux onglets → accueil → proposer de quitter |
| **Accueil** | Revenir directement à la section de démarrage |
| **Rouge** | Ajouter / retirer des favoris |
| **Verte** | Ouvrir les Réglages |
| **1 à 8** | Ouvrir une application directement |

Table complète des codes et procédures de test : **[`tests/navigation.md`](tests/navigation.md)**.

---

## 5. Réglages

Accessibles par l'**icône d'engrenage** en haut à droite, ou par la **touche verte**.

| Groupe | Contenu |
|---|---|
| **Apparence** | Thème (Nuit / Encre / Contraste élevé), couleur d'accentuation (6 teintes), fond d'écran (4), transparences, animations, affiches |
| **Accueil et en-tête** | Bannière animée, section de démarrage, horloge, format 24 h / 12 h, date française |
| **Ordre des applications** | OK pour prendre un raccourci, ◀ ▶ pour le déplacer, OK pour déposer |
| **Raccourcis affichés** | Masquer ou afficher chaque application |
| **Favoris** | Retirer un titre, tout vider |
| **Système** | Langue, version, téléviseur déclaré, écran détecté, état du stockage, navigateur, diagnostic des touches, réinitialisation |

**Si le téléviseur saccade** : désactivez **Transparences**, **Animations**, puis **Affiches**.
L'interface reste complète, simplement plus sobre.

Les préférences sont enregistrées sous la clé `edenwood.prefs.v1` dans le stockage local. Si celui-ci
est indisponible, l'interface continue de fonctionner et vous en avertit ; les réglages seront
simplement perdus à la fermeture.

---

## 6. Personnalisation (config.js)

**Tout se modifie dans `config.js`.** `app.js` n'a normalement pas besoin d'être touché.

### Ajouter un raccourci web

```js
{
  id: 'arte', nom: 'ARTE', kind: 'web',
  icone: 'assets/icons/app-browser.svg', teinte: '#3c4450',
  url: 'https://www.arte.tv/fr/',
  instruction: 'Ouvre le site ARTE dans le navigateur.'
}
```

`kind` vaut `'web'` (ouvre réellement l'URL), `'native'` (affiche la consigne télécommande)
ou `'systeme'` (ouvre une section interne).

### Corriger un code de télécommande

Après relevé dans `diagnostic.html` :

```js
touches: {
  retour: [8, 27, 461, 10009, 166, 420, 427, VOTRE_CODE],
  ...
}
```

### Changer les couleurs, fonds, catalogue

Les tableaux `accents`, `backgrounds`, `themes`, `catalogue`, `hdmi` et `vues` sont documentés
en commentaire dans le fichier.

### Remplacer les visuels

Déposez vos images dans `assets/` et pointez-les depuis `config.js`
(`affiche`, `banniere`, `icone`, `fichier`). Formats conseillés :
affiches **600 × 900**, bannières **1920 × 840**, icônes **200 × 200**.
Privilégiez le JPEG progressif ou le SVG ; évitez le PNG lourd et les vidéos de fond.

---

## 7. Publication sur GitHub Pages

C'est la méthode recommandée : le téléviseur accède à l'interface en HTTPS, sans allumer le PC.

1. **Créer le dépôt**
   Sur [github.com](https://github.com) → **New repository** → nom `edenwood-apple-tv` → **Public** → *Create*.

2. **Envoyer les fichiers**
   Dans PowerShell, depuis le dossier du projet :

   ```powershell
   git init
   ```

   ```powershell
   git add .
   ```

   ```powershell
   git commit -m "Edenwood Apple TV - version initiale"
   ```

   ```powershell
   git branch -M main
   ```

   ```powershell
   git remote add origin https://github.com/VOTRE-COMPTE/edenwood-apple-tv.git
   ```

   ```powershell
   git push -u origin main
   ```

   > Sans Git : sur la page du dépôt, **Add file → Upload files**, glissez tout le contenu du
   > dossier (y compris les sous-dossiers `assets/` et `tests/`), puis *Commit changes*.

3. **Activer Pages**
   Dépôt → **Settings** → **Pages** → *Build and deployment* → **Deploy from a branch** →
   branche **main**, dossier **/ (root)** → **Save**.

4. **Attendre une à deux minutes**, puis relever l'adresse affichée :
   `https://VOTRE-COMPTE.github.io/edenwood-apple-tv/`

5. **Vérifier depuis le PC** avant de passer au téléviseur.

### Mise à jour ultérieure — piège du cache

Les navigateurs de téléviseur mettent agressivement en cache les fichiers JavaScript, **par nom de
fichier**, et un simple paramètre d'URL (`?v=2`) ne suffit pas toujours à forcer le rechargement.
Si une modification ne semble pas prise en compte sur la TV :

* videz les données du navigateur VIDAA (Réglages du navigateur → Effacer les données), **ou**
* renommez le fichier modifié (`app.js` → `app-v2.js`) et ajustez la balise `<script>` dans `index.html`.

### Alternative : hébergement local

Si vous préférez ne rien publier, servez le dossier depuis le PC (`python -m http.server 8099`)
et ouvrez `http://ADRESSE-DU-PC:8099/index.html` sur la TV. Pour connaître cette adresse, tapez
`ipconfig` dans PowerShell et relevez la ligne « Adresse IPv4 » de votre carte Wi-Fi.
Il faut alors que le PC reste allumé, et autoriser le port 8099 dans le pare-feu Windows.

> La TV et le PC doivent être sur le même réseau local.
> **Aucun réglage DNS, filtrage ou box Internet n'est à modifier pour ce projet.**

---

## 8. Test sur le téléviseur

> Rien n'est lancé automatiquement sur votre téléviseur. Toutes les étapes ci-dessous sont
> manuelles, réversibles, et n'écrivent rien sur la TV en dehors du cache du navigateur.

1. Sur la télécommande : **Accueil (Home)** → **Navigateur**.
2. Ouvrez la barre d'adresse et saisissez d'abord :
   `https://VOTRE-COMPTE.github.io/edenwood-apple-tv/diagnostic.html`
3. Appuyez sur chaque touche et notez les codes (Retour, Exit, Accueil, couleurs).
4. Reportez-les dans `config.js`, republiez.
5. Ouvrez :
   `https://VOTRE-COMPTE.github.io/edenwood-apple-tv/`
6. **Mettez la page en favori**, et si le navigateur VIDAA le permet, définissez-la comme
   **page de démarrage** (Réglages du navigateur → Page d'accueil).
7. Déroulez la liste de tests de [`tests/navigation.md`](tests/navigation.md) § 7 et remplissez
   le tableau de [`tests/compatibility.md`](tests/compatibility.md) § 6.

---

## 9. Retour à l'interface native du téléviseur

Ce projet **ne remplace rien** et **ne s'installe pas**. C'est une page web. Pour revenir à VIDAA :

| Situation | Action |
|---|---|
| Revenir à l'accueil VIDAA | Touche **Accueil (Home)** |
| Fermer le navigateur | Touche **Exit** (ou **Retour** maintenue selon le modèle) |
| Annuler la page de démarrage du navigateur | Navigateur → Réglages → Page d'accueil → remettre la valeur d'origine ou « vide » |
| Retirer le favori | Navigateur → Favoris → sélectionner → Supprimer |
| Effacer les préférences Edenwood | Réglages d'Edenwood → Système → **Réinitialiser les préférences** · ou Navigateur → Effacer les données de navigation |
| Tout effacer | Navigateur VIDAA → Réglages → **Effacer les données de navigation** |

Aucune de ces opérations ne touche au firmware, aux applications installées, aux entrées HDMI,
au réseau, aux DNS ni à la box Internet. Il n'y a **rien à désinstaller**.

---

## 10. Ce qui a été étudié

| Source | Apport | Conclusion |
|---|---|---|
| [shachindran/homeos-vidaa](https://github.com/shachindran/homeos-vidaa) | Tableau de bord web pour VIDAA : HTML/CSS/JS pur, LocalStorage, GitHub Pages, codes de touches 37-40 / 13 / 8 / 27 / **461** | Confirme la viabilité de l'approche « page web statique ». Confirme aussi que les tuiles d'applications natives **n'ouvrent rien**. Reprise : les codes de touches et le principe du déploiement. |
| [carteakey/alvidaa](https://github.com/carteakey/alvidaa) | Launcher alternatif. Voie **sans root** : boîtier externe (Pi/NAS) + pont Go/Python + MQTT TLS 36669 « RemoteNow » + appairage à 4 chiffres. Page 1920 × 1080, repli 540p, piège du cache JS par nom de fichier | **Non repris.** Exige un matériel tiers allumé en permanence et un certificat extrait d'une application mobile. Les voies root du dépôt sont **volontairement écartées**. Reprise : la cible 1920 × 1080 et l'avertissement sur le cache. |
| [Guide WebApp VIDAA (PDF)](https://www.vidaa.com/wp-content/uploads/2020/12/WebApp_Development_Guide_for_VIDAA.pdf) | — | **URL en erreur 404.** Document non consultable. **Aucune API VIDAA n'est donc supposée** : le projet n'utilise que des API web standard. |
| [GitHub Pages](https://pages.github.com/) | Hébergement statique gratuit en HTTPS | **Retenu** comme méthode de publication principale. |

Aucun root, aucun exploit, aucun flashage, aucune modification de partition, aucun hook de démarrage,
aucun script de dépôt tiers exécuté, aucune modification réseau, DNS ou box Internet.

---

## 11. Licence, marques et contenus

* **Code et visuels de ce projet** : libres d'usage personnel et de modification.
* **Icônes d'applications** : créées pour ce projet (monogrammes sur dégradé). **Aucun logo
  propriétaire n'est reproduit.** Les noms « Netflix », « Disney+ », « Prime Video », « Spotify »,
  « YouTube », « TF1+ » sont les marques de leurs titulaires respectifs et ne sont utilisés qu'à
  titre de désignation. Ce projet n'est affilié à aucun de ces services.
* **« Apple TV »** figure dans le nom choisi par l'utilisateur pour son interface personnelle.
  Aucun logo, aucune icône, aucune police ni aucun élément graphique Apple n'est reproduit :
  la direction artistique est une création originale inspirée de cette esthétique. Ce projet
  n'est affilié ni à Apple, ni à Hisense, ni à VIDAA, ni à Edenwood.
* **Films et séries affichés** : entièrement fictifs, créés pour la démonstration.

---

*Edenwood Apple TV — version 1.1.0 · 26 novembre 2026*
