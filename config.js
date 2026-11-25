/* =============================================================
   EDENWOOD APPLE TV — config.js
   Configuration centrale : identité, préférences par défaut,
   applications, sources HDMI, catalogue de démonstration, touches.

   Tout est modifiable ici sans toucher à app.js.
   Écrit en ES5 strict pour rester compatible avec le navigateur
   VIDAA (pas de let/const, pas de fonctions fléchées, pas de
   gabarits de chaînes, pas de Promise).
   ============================================================= */

var EDENWOOD = {

  /* ---------- Identité du produit ---------- */
  version: '1.2.0',
  build: '2026-11-26',
  productName: 'EDENWOOD APPLE TV',
  productShort: 'Edenwood',

  /* ---------- Téléviseur cible (documentation seulement) ---------- */
  device: {
    marque: 'Edenwood',
    modele: 'ED40A02FHD-EL',
    reference: '982166',
    resolution: '1920 x 1080',
    systeme: 'VIDAA',
    firmware: 'V0104.07.00V.N1116'
  },

  /* ---------- Préférences par défaut ---------- */
  defaults: {
    theme: 'nuit',            /* nuit | encre | contraste */
    accent: 'azur',
    fond: 'nuit',             /* clé dans backgrounds, ou 'uni' */
    horloge: true,
    formatHeure: '24',        /* 24 | 12 */
    dateVisible: true,
    animations: true,
    transparence: true,       /* effets de verre dépoli */
    vignettes: true,          /* affiches images ; sinon dégradés CSS */
    langue: 'fr',
    vueDemarrage: 'alaune',
    heroAuto: true,           /* rotation douce de la bannière d'accueil */
    ordreApps: null,          /* tableau d'identifiants, sinon ordre natif */
    appsMasquees: [],
    favoris: []
  },

  /* ---------- Couleurs d'accentuation ---------- */
  accents: [
    { id: 'azur',    nom: 'Azur',     couleur: '#5b9cff', sombre: '#2f6fd0' },
    { id: 'or',      nom: 'Or pâle',  couleur: '#e3c07f', sombre: '#b2904f' },
    { id: 'jade',    nom: 'Jade',     couleur: '#3fc9a3', sombre: '#1f8f72' },
    { id: 'grenat',  nom: 'Grenat',   couleur: '#e2607a', sombre: '#a93b52' },
    { id: 'lilas',   nom: 'Lilas',    couleur: '#a68cff', sombre: '#6f57c8' },
    { id: 'argent',  nom: 'Argent',   couleur: '#d7dde6', sombre: '#8e97a5' }
  ],

  /* ---------- Fonds d'écran ---------- */
  backgrounds: [
    { id: 'nuit',   nom: 'Nuit',      fichier: 'assets/backgrounds/nuit.svg' },
    { id: 'braise', nom: 'Braise',    fichier: 'assets/backgrounds/braise.svg' },
    { id: 'brume',  nom: 'Brume',     fichier: 'assets/backgrounds/brume.svg' },
    { id: 'uni',    nom: 'Noir uni',  fichier: null }
  ],

  /* ---------- Thèmes ---------- */
  themes: [
    { id: 'nuit',      nom: 'Nuit' },
    { id: 'encre',     nom: 'Encre' },
    { id: 'contraste', nom: 'Contraste élevé' }
  ],

  /* =============================================================
     APPLICATIONS
     -------------------------------------------------------------
     « kind » décrit honnêtement ce que le raccourci peut faire :

       web     → ouvre une adresse web réelle dans le navigateur
                 VIDAA (window.location). Fonctionne, mais le site
                 peut refuser la lecture vidéo protégée (DRM).

       native  → application installée sur VIDAA. AUCUNE API
                 publique ne permet de la lancer depuis une page
                 web. Le raccourci affiche donc la marche à suivre
                 avec la télécommande. Ce n'est pas un bug : c'est
                 la limite réelle de la plateforme.

       systeme → fonction du téléviseur (entrées HDMI). Idem :
                 non pilotable depuis une page web.
     ============================================================= */
  apps: [
    {
      id: 'netflix', nom: 'Netflix', kind: 'native',
      icone: 'assets/icons/app-netflix.svg', teinte: '#8c1016',
      instruction: 'Appuyez sur la touche Accueil (Home) de la télécommande, puis sélectionnez Netflix dans la barre d’applications VIDAA.'
    },
    {
      id: 'youtube', nom: 'YouTube', kind: 'web',
      icone: 'assets/icons/app-youtube.svg', teinte: '#a81d1d',
      url: 'https://www.youtube.com/',
      instruction: 'Ouvre le site YouTube dans le navigateur. L’application VIDAA native reste plus fluide : touche Accueil puis YouTube.'
    },
    {
      id: 'disney', nom: 'Disney+', kind: 'native',
      icone: 'assets/icons/app-disney.svg', teinte: '#2c53b8',
      instruction: 'Appuyez sur Accueil (Home), puis sélectionnez Disney+ dans la barre d’applications VIDAA.'
    },
    {
      id: 'prime', nom: 'Prime Video', kind: 'native',
      icone: 'assets/icons/app-prime.svg', teinte: '#0f7fa6',
      instruction: 'Appuyez sur Accueil (Home), puis sélectionnez Prime Video dans la barre d’applications VIDAA.'
    },
    {
      id: 'spotify', nom: 'Spotify', kind: 'web',
      icone: 'assets/icons/app-spotify.svg', teinte: '#17a24a',
      url: 'https://open.spotify.com/',
      instruction: 'Ouvre le lecteur web Spotify. Une connexion à votre compte est nécessaire et le clavier virtuel VIDAA peut être lent.'
    },
    {
      id: 'tf1', nom: 'TF1+', kind: 'native',
      icone: 'assets/icons/app-tf1.svg', teinte: '#3f4fa8',
      instruction: 'Appuyez sur Accueil (Home), puis sélectionnez TF1+ dans la barre d’applications VIDAA.'
    },
    {
      id: 'navigateur', nom: 'Navigateur', kind: 'web',
      icone: 'assets/icons/app-browser.svg', teinte: '#49556b',
      url: 'https://duckduckgo.com/',
      instruction: 'Ouvre une page de recherche. Pour revenir à Edenwood, utilisez la touche Retour du navigateur VIDAA.'
    },
    {
      id: 'hdmi', nom: 'Sources HDMI', kind: 'systeme',
      icone: 'assets/icons/app-hdmi.svg', teinte: '#3c4450',
      vue: 'hdmi',
      instruction: 'Le changement d’entrée n’est pas pilotable depuis une page web. Utilisez la touche Source / Input de la télécommande.'
    }
  ],

  /* ---------- Entrées HDMI (informatif) ---------- */
  hdmi: [
    { id: 'hdmi1', nom: 'HDMI 1', detail: 'Console / lecteur Blu-ray' },
    { id: 'hdmi2', nom: 'HDMI 2', detail: 'Box opérateur' },
    { id: 'hdmi3', nom: 'HDMI 3', detail: 'Ordinateur / clé multimédia' },
    { id: 'av',    nom: 'AV',     detail: 'Entrée composite' },
    { id: 'tnt',   nom: 'TNT',    detail: 'Tuner télévision' }
  ],

  /* =============================================================
     CATALOGUE DE DÉMONSTRATION
     -------------------------------------------------------------
     Tous ces titres sont FICTIFS et créés pour cette interface.
     Ils ne correspondent à aucune œuvre réelle, aucun catalogue,
     aucun service. Le badge « DÉMO » est affiché sur chaque carte.
     ============================================================= */
  demoNotice: 'Contenus fictifs de démonstration. Aucune œuvre réelle, aucun catalogue de service de streaming.',

  catalogue: [
    { id: 'horizon', titre: 'Horizon', type: 'film', annee: 2026, genre: 'Science-fiction',
      duree: '1 h 58', affiche: 'assets/movies/film-horizon.svg', banniere: 'assets/backgrounds/hero-horizon.svg',
      synopsis: 'Une station d’observation perdue au large capte un signal qui ne vient d’aucun satellite connu. Démonstration d’interface : ce film n’existe pas.' },
    { id: 'sillage', titre: 'Sillage', type: 'film', annee: 2025, genre: 'Thriller',
      duree: '2 h 06', affiche: 'assets/movies/film-sillage.svg', banniere: 'assets/backgrounds/hero-sillage.svg',
      synopsis: 'Un pilote de secours suit la trace d’un cargo disparu entre deux ports. Démonstration d’interface : ce film n’existe pas.' },
    { id: 'acier', titre: 'Acier', type: 'film', annee: 2024, genre: 'Drame',
      duree: '1 h 42', affiche: 'assets/movies/film-acier.svg',
      synopsis: 'Dans une vallée industrielle, trois générations se partagent le même atelier. Démonstration d’interface : ce film n’existe pas.' },
    { id: 'oasis', titre: 'Oasis', type: 'film', annee: 2026, genre: 'Aventure',
      duree: '2 h 14', affiche: 'assets/movies/film-oasis.svg', banniere: 'assets/backgrounds/hero-oasis.svg',
      synopsis: 'Une expédition botanique traverse un désert que les cartes donnent pour vide. Démonstration d’interface : ce film n’existe pas.' },
    { id: 'vertige', titre: 'Vertige', type: 'film', annee: 2025, genre: 'Suspense',
      duree: '1 h 36', affiche: 'assets/movies/film-vertige.svg',
      synopsis: 'Un ouvrier cordiste découvre ce que la façade du bâtiment dissimule. Démonstration d’interface : ce film n’existe pas.' },
    { id: 'nadir', titre: 'Nadir', type: 'film', annee: 2023, genre: 'Science-fiction',
      duree: '2 h 21', affiche: 'assets/movies/film-nadir.svg', banniere: 'assets/backgrounds/hero-nadir.svg',
      synopsis: 'Le dernier relais avant l’espace profond perd le contact avec la Terre. Démonstration d’interface : ce film n’existe pas.' },

    { id: 'fracture', titre: 'Fracture', type: 'serie', annee: 2026, genre: 'Policier',
      duree: '2 saisons', affiche: 'assets/movies/serie-fracture.svg',
      synopsis: 'Deux enquêtes ouvertes à vingt ans d’écart finissent par se répondre. Démonstration d’interface : cette série n’existe pas.' },
    { id: 'littoral', titre: 'Littoral', type: 'serie', annee: 2025, genre: 'Drame',
      duree: '1 saison', affiche: 'assets/movies/serie-littoral.svg',
      synopsis: 'Un village de pêcheurs apprend que la digue ne sera pas reconstruite. Démonstration d’interface : cette série n’existe pas.' },
    { id: 'transit', titre: 'Transit', type: 'serie', annee: 2024, genre: 'Anticipation',
      duree: '3 saisons', affiche: 'assets/movies/serie-transit.svg',
      synopsis: 'Une gare souterraine dessert une ligne qui n’apparaît sur aucun plan. Démonstration d’interface : cette série n’existe pas.' },
    { id: 'antichambre', titre: 'Antichambre', type: 'serie', annee: 2026, genre: 'Mystère',
      duree: '1 saison', affiche: 'assets/movies/serie-antichambre.svg', banniere: 'assets/backgrounds/hero-antichambre.svg',
      synopsis: 'Un hôtel de montagne garde une chambre que personne ne réserve. Démonstration d’interface : cette série n’existe pas.' },
    { id: 'latitude', titre: 'Latitude', type: 'serie', annee: 2025, genre: 'Documentaire',
      duree: '6 épisodes', affiche: 'assets/movies/serie-latitude.svg',
      synopsis: 'Six escales le long d’un même parallèle, du nord au sud. Démonstration d’interface : cette série n’existe pas.' },
    { id: 'sentinelle', titre: 'Sentinelle', type: 'serie', annee: 2023, genre: 'Thriller',
      duree: '2 saisons', affiche: 'assets/movies/serie-sentinelle.svg', banniere: 'assets/backgrounds/hero-sentinelle.svg',
      synopsis: 'Un gardien de phare note chaque nuit ce qu’il ne devrait pas voir. Démonstration d’interface : cette série n’existe pas.' }
  ],

  /* ---------- Mise en avant (bannière d'accueil) ---------- */
  heroIds: ['horizon', 'sillage', 'oasis', 'nadir', 'antichambre', 'sentinelle'],

  /* ---------- Rangées de l'écran d'accueil ----------
     type : 'apps' | 'ids' | 'type' | 'recents' | 'favoris'              */
  accueil: [
    { cle: 'apps',    titre: 'Applications',       type: 'apps' },
    { cle: 'reco',    titre: 'Recommandés',        type: 'ids',
      ids: ['horizon', 'fracture', 'oasis', 'sentinelle', 'vertige', 'transit'] },
    { cle: 'films',   titre: 'Films',              type: 'type', valeur: 'film' },
    { cle: 'series',  titre: 'Séries',             type: 'type', valeur: 'serie' },
    { cle: 'recents', titre: 'Récemment ajoutés',  type: 'recents', max: 6 },
    { cle: 'favoris', titre: 'Favoris',            type: 'favoris' }
  ],

  /* ---------- Vues / onglets ---------- */
  vues: [
    { id: 'alaune',  nom: 'À la une' },
    { id: 'films',   nom: 'Films' },
    { id: 'series',  nom: 'Séries' },
    { id: 'favoris', nom: 'Favoris' },
    { id: 'apps',    nom: 'Applications' },
    { id: 'hdmi',    nom: 'Sources HDMI' }
  ],

  /* =============================================================
     TOUCHES DE TÉLÉCOMMANDE
     -------------------------------------------------------------
     CONFIRMÉ (standard, utilisé par les projets VIDAA existants) :
       37/38/39/40 directions, 13 OK, 8 Retour arrière, 27 Échap,
       461 Retour (code HbbTV VK_BACK employé par Hisense/VIDAA).

     À VÉRIFIER sur votre téléviseur avec diagnostic.html :
       10009 (Tizen), 166 (Browser Back), 403-406 (touches de
       couleur HbbTV), 1001 / 36 (Exit / Home).
     Les codes inconnus sont simplement ignorés : en ajouter est
     sans risque.
     ============================================================= */
  touches: {
    haut:    [38],
    bas:     [40],
    gauche:  [37],
    droite:  [39],
    ok:      [13, 32],
    retour:  [8, 27, 461, 10009, 166, 420, 427],
    accueil: [36, 1001],
    rouge:   [403, 112],
    verte:   [404, 113],
    jaune:   [405, 114],
    bleue:   [406, 115]
  },

  /* ---------- Réglages techniques ---------- */
  reglages: {
    cleStockage: 'edenwood.prefs.v1',
    repeatDelai: 380,        /* ms avant répétition auto d'une direction */
    repeatIntervalle: 110,   /* ms entre deux répétitions */
    dureeDefilement: 260,    /* ms d'animation de défilement */
    heroRotation: 11000      /* ms entre deux bannières (si heroAuto) */
  }
};
