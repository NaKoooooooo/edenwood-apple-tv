/* =============================================================
   EDENWOOD APPLE TV — app.js
   ES5 strict. Aucune dépendance. Aucun appel réseau.

   Sommaire
     1.  Utilitaires DOM
     2.  Stockage des préférences (avec repli mémoire)
     3.  Application du thème
     4.  Horloge, date française, état réseau
     5.  Mise à l'échelle 1920x1080
     6.  Construction des vues
     7.  Réglages
     8.  Moteur de focus (lignes + mémoire de colonne)
     9.  Défilement
     10. Modale et notifications
     11. Actions
     12. Télécommande / clavier
     13. Démarrage
   ============================================================= */
(function () {
  'use strict';

  var C = window.EDENWOOD;
  if (!C) { document.title = 'Edenwood — config.js manquant'; return; }

  /* =========================================================
     1. UTILITAIRES DOM
     ========================================================= */
  function id(s) { return document.getElementById(s); }
  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) { return (r || document).querySelectorAll(s); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (html !== undefined && html !== null) { e.innerHTML = html; }
    return e;
  }
  function hasClass(e, c) {
    return !!e && (' ' + e.className + ' ').indexOf(' ' + c + ' ') > -1;
  }
  function addClass(e, c) { if (e && !hasClass(e, c)) { e.className = (e.className + ' ' + c).replace(/^\s+/, ''); } }
  function removeClass(e, c) {
    if (!e) { return; }
    e.className = (' ' + e.className + ' ').split(' ' + c + ' ').join(' ').replace(/^\s+|\s+$/g, '');
  }
  function toggleClass(e, c, on) { if (on) { addClass(e, c); } else { removeClass(e, c); } }
  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function indexOf(arr, v) {
    if (!arr) { return -1; }
    for (var i = 0; i < arr.length; i++) { if (arr[i] === v) { return i; } }
    return -1;
  }
  function ico(name, cls) {
    return '<svg class="' + (cls || 'ico') + '" aria-hidden="true"><use xlink:href="#i-' + name +
           '" href="#i-' + name + '"></use></svg>';
  }
  /* Offset d'un élément par rapport à un conteneur positionné */
  function offsetIn(e, container, axis) {
    var v = 0, n = e;
    while (n && n !== container) {
      v += (axis === 'x' ? n.offsetLeft : n.offsetTop);
      n = n.offsetParent;
    }
    return v;
  }
  function visible(e) {
    return !!(e && (e.offsetWidth > 0 || e.offsetHeight > 0));
  }

  /* =========================================================
     2. STOCKAGE DES PRÉFÉRENCES
     ========================================================= */
  var Stockage = (function () {
    var dispo = false, memoire = {};
    try {
      var t = '__edw_test__';
      window.localStorage.setItem(t, '1');
      window.localStorage.removeItem(t);
      dispo = true;
    } catch (err) { dispo = false; }

    return {
      disponible: function () { return dispo; },
      lire: function (cle) {
        try { return dispo ? window.localStorage.getItem(cle) : (memoire[cle] || null); }
        catch (e) { return memoire[cle] || null; }
      },
      ecrire: function (cle, val) {
        memoire[cle] = val;
        if (!dispo) { return false; }
        try { window.localStorage.setItem(cle, val); return true; } catch (e) { return false; }
      },
      effacer: function (cle) {
        delete memoire[cle];
        if (!dispo) { return; }
        try { window.localStorage.removeItem(cle); } catch (e) { /* ignoré */ }
      }
    };
  })();

  var P = {};   /* préférences actives */

  function chargerPrefs() {
    var d = C.defaults, k;
    P = {};
    for (k in d) { if (d.hasOwnProperty(k)) { P[k] = d[k]; } }
    P.appsMasquees = []; P.favoris = []; P.ordreApps = null;

    var brut = Stockage.lire(C.reglages.cleStockage);
    if (brut) {
      try {
        var o = JSON.parse(brut);
        for (k in o) {
          if (o.hasOwnProperty(k) && d.hasOwnProperty(k)) { P[k] = o[k]; }
        }
      } catch (e) { /* préférences illisibles : on garde les valeurs par défaut */ }
    }
    if (!P.favoris || typeof P.favoris.length !== 'number') { P.favoris = []; }
    if (!P.appsMasquees || typeof P.appsMasquees.length !== 'number') { P.appsMasquees = []; }
    if (P.ordreApps && typeof P.ordreApps.length !== 'number') { P.ordreApps = null; }
  }

  function sauverPrefs() {
    var ok = Stockage.ecrire(C.reglages.cleStockage, JSON.stringify(P));
    if (!ok && !Stockage.disponible()) {
      notifier('Stockage local indisponible : les réglages ne seront pas conservés après la fermeture.');
    }
    return ok;
  }

  /* =========================================================
     3. APPLICATION DU THÈME
     ========================================================= */
  function trouver(liste, cle, val) {
    for (var i = 0; i < liste.length; i++) { if (liste[i][cle] === val) { return liste[i]; } }
    return liste[0];
  }

  function appliquerTheme() {
    var b = document.body, racine = document.documentElement;
    var acc = trouver(C.accents, 'id', P.accent);
    var fond = trouver(C.backgrounds, 'id', P.fond);

    if (racine.style.setProperty) {
      racine.style.setProperty('--accent', acc.couleur);
      racine.style.setProperty('--accent-sombre', acc.sombre);
    }
    /* Repli pour les moteurs sans variables CSS : feuille de style injectée */
    styleReplis(acc.couleur);

    var th = ['nuit', 'encre', 'contraste'];
    for (var i = 0; i < th.length; i++) { removeClass(b, 'theme-' + th[i]); }
    addClass(b, 'theme-' + P.theme);

    toggleClass(b, 'sans-animation', !P.animations);
    toggleClass(b, 'sans-transparence', !P.transparence);
    toggleClass(b, 'sans-vignettes', !P.vignettes);

    var f = id('fond');
    f.style.backgroundImage = fond.fichier ? 'url("' + fond.fichier + '")' : 'none';

    toggleClass(id('horloge'), 'masquee', !P.horloge);
    toggleClass(id('date-jour'), 'masquee', !P.dateVisible);
  }

  var feuilleReplis = null;
  function styleReplis(couleur) {
    var css =
      '.focus .carte-visuel,.focus .carte-app-visuel{box-shadow:0 0 0 3px ' + couleur + ',0 28px 62px rgba(0,0,0,.72)}' +
      '.focus.carte-hdmi{box-shadow:0 0 0 3px ' + couleur + ',0 22px 48px rgba(0,0,0,.6)}' +
      '.focus.bouton{box-shadow:0 0 0 3px ' + couleur + ',0 14px 36px rgba(0,0,0,.5)}' +
      '.focus.bouton-icone{box-shadow:0 0 0 3px ' + couleur + '}' +
      '.focus.onglet{box-shadow:0 0 0 2px ' + couleur + '}' +
      '.focus.ligne-reglage{box-shadow:0 0 0 2px ' + couleur + '}' +
      '.focus.ligne-reglage .ligne-reglage-valeur{color:' + couleur + '}' +
      '.onglet.actif:after{background:' + couleur + '}' +
      '.bouton.actif{background:' + couleur + ';color:#05070b}' +
      '.demarrage-barre span{background:' + couleur + '}';
    if (!feuilleReplis) {
      feuilleReplis = document.createElement('style');
      feuilleReplis.type = 'text/css';
      document.getElementsByTagName('head')[0].appendChild(feuilleReplis);
    }
    if (feuilleReplis.styleSheet) { feuilleReplis.styleSheet.cssText = css; }
    else { feuilleReplis.innerHTML = css; }
  }

  /* =========================================================
     4. HORLOGE, DATE, RÉSEAU
     ========================================================= */
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
              'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var derniereHeure = '', derniereDate = '';

  function deuxChiffres(n) { return (n < 10 ? '0' : '') + n; }

  function majHorloge() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes(), txt;
    if (P.formatHeure === '12') {
      var suf = h < 12 ? 'AM' : 'PM', h12 = h % 12; if (h12 === 0) { h12 = 12; }
      txt = h12 + ':' + deuxChiffres(m) + ' ' + suf;
    } else {
      txt = deuxChiffres(h) + ':' + deuxChiffres(m);
    }
    if (txt !== derniereHeure) { derniereHeure = txt; id('heure').innerHTML = esc(txt); }

    var jour = d.getDate();
    var nomJour = JOURS[d.getDay()];
    var dateTxt = nomJour.charAt(0).toUpperCase() + nomJour.substring(1) + ' ' +
                  (jour === 1 ? '1er' : jour) + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear();
    if (dateTxt !== derniereDate) { derniereDate = dateTxt; id('date-jour').innerHTML = esc(dateTxt); }
  }

  function majReseau() {
    var e = id('etat-reseau');
    if (!e) { return; }
    if (typeof navigator.onLine !== 'boolean') { e.setAttribute('title', 'Réseau'); return; }
    var enLigne = navigator.onLine;
    toggleClass(e, 'hors-ligne', !enLigne);
    e.setAttribute('title', enLigne ? 'Connecté au réseau' : 'Hors ligne');
  }

  /* =========================================================
     5. MISE À L'ÉCHELLE
     ========================================================= */
  function ajusterEchelle() {
    var w = window.innerWidth || document.documentElement.clientWidth || 1920;
    var h = window.innerHeight || document.documentElement.clientHeight || 1080;
    var k = Math.min(w / 1920, h / 1080);
    var app = id('app');
    var dx = Math.round((w - 1920 * k) / 2);
    var dy = Math.round((h - 1080 * k) / 2);
    var tr = 'translate(' + dx + 'px,' + dy + 'px) scale(' + k + ')';
    app.style.webkitTransform = tr;
    app.style.transform = tr;
  }

  /* =========================================================
     6. CONSTRUCTION DES VUES
     ========================================================= */
  var vueActive = 'alaune';

  function appsVisibles() {
    var ordre = P.ordreApps, liste = [], i, a;
    if (ordre && ordre.length) {
      for (i = 0; i < ordre.length; i++) {
        a = trouverApp(ordre[i]);
        if (a && indexOf(liste, a) === -1) { liste.push(a); }
      }
    }
    for (i = 0; i < C.apps.length; i++) {
      if (indexOf(liste, C.apps[i]) === -1) { liste.push(C.apps[i]); }
    }
    var out = [];
    for (i = 0; i < liste.length; i++) {
      if (indexOf(P.appsMasquees, liste[i].id) === -1) { out.push(liste[i]); }
    }
    return out;
  }
  function appsOrdonnees() {
    var ordre = P.ordreApps, liste = [], i, a;
    if (ordre && ordre.length) {
      for (i = 0; i < ordre.length; i++) {
        a = trouverApp(ordre[i]);
        if (a && indexOf(liste, a) === -1) { liste.push(a); }
      }
    }
    for (i = 0; i < C.apps.length; i++) {
      if (indexOf(liste, C.apps[i]) === -1) { liste.push(C.apps[i]); }
    }
    return liste;
  }
  function trouverApp(idApp) {
    for (var i = 0; i < C.apps.length; i++) { if (C.apps[i].id === idApp) { return C.apps[i]; } }
    return null;
  }
  function trouverTitre(idT) {
    for (var i = 0; i < C.catalogue.length; i++) { if (C.catalogue[i].id === idT) { return C.catalogue[i]; } }
    return null;
  }
  function parType(t) {
    var out = [];
    for (var i = 0; i < C.catalogue.length; i++) { if (C.catalogue[i].type === t) { out.push(C.catalogue[i]); } }
    return out;
  }
  function favoris() {
    var out = [], i, t;
    for (i = 0; i < P.favoris.length; i++) { t = trouverTitre(P.favoris[i]); if (t) { out.push(t); } }
    return out;
  }
  function estFavori(idT) { return indexOf(P.favoris, idT) > -1; }

  /* Rangée d'accueil : liste de titres correspondant à une définition de config.js */
  function titresDe(d) {
    var out = [], i, t;
    if (d.type === 'ids') {
      for (i = 0; i < d.ids.length; i++) { t = trouverTitre(d.ids[i]); if (t) { out.push(t); } }
      return out;
    }
    if (d.type === 'type') { return parType(d.valeur); }
    if (d.type === 'favoris') { return favoris(); }
    if (d.type === 'recents') {
      var l = C.catalogue.slice(0);
      l.sort(function (a, b) { return b.annee - a.annee; });
      return l.slice(0, d.max || 6);
    }
    return [];
  }

  var genreLabel = { web: 'Site web', native: 'Application TV', systeme: 'Entrées du téléviseur' };

  /* ---------- Fabriques de cartes ---------- */
  function carteTitre(t) {
    var c = el('div', 'carte focusable' + (estFavori(t.id) ? ' est-favori' : ''));
    c.setAttribute('data-action', 'titre');
    c.setAttribute('data-id', t.id);
    c.setAttribute('tabindex', '-1');
    var v = el('div', 'carte-visuel');
    if (P.vignettes && t.affiche) { v.style.backgroundImage = 'url("' + t.affiche + '")'; }
    v.innerHTML = '<span class="carte-badge">DÉMO</span>' +
                  '<span class="carte-favori">' + ico('etoile') + '</span>';
    c.appendChild(v);
    c.appendChild(el('div', 'carte-titre', esc(t.titre)));
    c.appendChild(el('div', 'carte-sous', esc(t.annee + ' · ' + t.genre)));
    return c;
  }

  function carteApp(a, numero) {
    var c = el('div', 'carte-app focusable');
    c.setAttribute('data-action', 'app');
    c.setAttribute('data-id', a.id);
    c.setAttribute('tabindex', '-1');
    var v = el('div', 'carte-app-visuel');
    v.innerHTML =
      '<img src="' + esc(a.icone) + '" alt="" width="204" height="204">' +
      (numero ? '<span class="carte-app-touche">' + numero + '</span>' : '');
    c.appendChild(v);
    c.appendChild(el('div', 'carte-app-nom', esc(a.nom)));
    c.appendChild(el('div', 'carte-app-note', esc(genreLabel[a.kind] || '')));
    return c;
  }

  function carteHdmi(s) {
    var c = el('div', 'carte-hdmi focusable');
    c.setAttribute('data-action', 'hdmi');
    c.setAttribute('data-id', s.id);
    c.setAttribute('tabindex', '-1');
    c.innerHTML = ico('hdmi') +
      '<div class="carte-hdmi-nom">' + esc(s.nom) + '</div>' +
      '<div class="carte-hdmi-detail">' + esc(s.detail) + '</div>';
    return c;
  }

  /* cle : identifiant stable de la ligne de navigation (mémoire de colonne) */
  function rail(cle, titre, compte, cartes) {
    var r = el('div', 'rail');
    var entete = el('div', 'rail-entete');
    entete.appendChild(el('h2', 'rail-titre', esc(titre)));
    if (compte) { entete.appendChild(el('span', 'rail-compte', esc(compte))); }
    r.appendChild(entete);
    var fen = el('div', 'rail-fenetre');
    var piste = el('div', 'rail-piste');
    piste.setAttribute('data-nav-row', 'rail-' + cle);
    for (var i = 0; i < cartes.length; i++) { piste.appendChild(cartes[i]); }
    fen.appendChild(piste);
    r.appendChild(fen);
    return r;
  }

  function cartesDe(liste) {
    var out = [];
    for (var i = 0; i < liste.length; i++) { out.push(carteTitre(liste[i])); }
    return out;
  }
  function cartesApps(liste) {
    var out = [];
    for (var i = 0; i < liste.length; i++) { out.push(carteApp(liste[i], i < 9 ? (i + 1) : 0)); }
    return out;
  }

  function encart(titre, texte) {
    var d = el('div', 'encart');
    d.innerHTML = '<h3>' + esc(titre) + '</h3><p>' + texte + '</p>';
    return d;
  }

  /* ---------- Onglets ---------- */
  function construireOnglets() {
    var n = id('onglets');
    n.innerHTML = '';
    for (var i = 0; i < C.vues.length; i++) {
      var v = C.vues[i];
      var b = el('button', 'onglet focusable' + (v.id === vueActive ? ' actif' : ''), '<span>' + esc(v.nom) + '</span>');
      b.setAttribute('type', 'button');
      b.setAttribute('data-action', 'vue');
      b.setAttribute('data-id', v.id);
      b.setAttribute('tabindex', '-1');
      n.appendChild(b);
    }
  }
  function majOnglets() {
    var o = qsa('.onglet', id('onglets'));
    for (var i = 0; i < o.length; i++) {
      toggleClass(o[i], 'actif', o[i].getAttribute('data-id') === vueActive);
    }
  }

  /* ---------- Bannière : fondu enchaîné entre deux couches ---------- */
  var heroIndex = 0, heroCouche = 0, heroTimer = null;

  function heroListe() {
    var out = [], i, t;
    for (i = 0; i < C.heroIds.length; i++) {
      t = trouverTitre(C.heroIds[i]);
      if (t) { out.push(t); }
    }
    return out.length ? out : [C.catalogue[0]];
  }
  function heroCourant() {
    var l = heroListe();
    return l[heroIndex % l.length];
  }

  function construireBanniere(anime) {
    var t = heroCourant();
    if (!t) { return; }
    var src = (P.vignettes && (t.banniere || t.affiche)) ? 'url("' + (t.banniere || t.affiche) + '")' : 'none';
    var a = id('hero-a'), b = id('hero-b');
    var entrant = heroCouche ? a : b;
    var sortant = heroCouche ? b : a;
    entrant.style.backgroundImage = src;
    addClass(entrant, 'visible');
    removeClass(sortant, 'visible');
    heroCouche = heroCouche ? 0 : 1;

    var txt = id('hero-texte');
    if (anime && P.animations) {
      addClass(txt, 'transition');
      window.setTimeout(function () { remplirHero(t); removeClass(txt, 'transition'); }, 300);
    } else {
      remplirHero(t);
    }
  }

  function remplirHero(t) {
    id('banniere-type').innerHTML = t.type === 'film' ? 'Film' : 'Série';
    id('banniere-titre').innerHTML = esc(t.titre);
    id('banniere-annee').innerHTML = esc(t.annee);
    id('banniere-genre').innerHTML = esc(t.genre);
    id('banniere-duree').innerHTML = esc(t.duree);
    id('banniere-synopsis').innerHTML = esc(t.synopsis);
    id('banniere').setAttribute('data-id', t.id);
    majBoutonFavoriHero(t);
  }

  function majBoutonFavoriHero(t) {
    var b = id('btn-hero-favori'), f = estFavori(t.id);
    toggleClass(b, 'actif', f);
    id('btn-hero-favori-texte').innerHTML = f ? 'Dans les favoris' : 'Ajouter aux favoris';
    var u = qs('use', id('btn-hero-favori-ico'));
    if (u) {
      u.setAttribute('xlink:href', f ? '#i-etoile' : '#i-etoile-vide');
      u.setAttribute('href', f ? '#i-etoile' : '#i-etoile-vide');
    }
  }

  /* Rotation douce de la mise en avant */
  function planifierHero() {
    if (heroTimer) { window.clearInterval(heroTimer); heroTimer = null; }
    if (!P.heroAuto || !C.reglages.heroRotation) { return; }
    heroTimer = window.setInterval(function () {
      if (modaleOuverte || vueActive !== 'alaune') { return; }
      heroIndex++;
      construireBanniere(true);
    }, C.reglages.heroRotation);
  }

  /* ---------- Grille de cartes (section Favoris) ---------- */
  function grille(cle, liste, parLigne) {
    var g = el('div', 'grille'), i, ligne = null;
    for (i = 0; i < liste.length; i++) {
      if (i % parLigne === 0) {
        ligne = el('div', 'grille-ligne');
        ligne.setAttribute('data-nav-row', 'grille-' + cle + '-' + Math.floor(i / parLigne));
        g.appendChild(ligne);
      }
      ligne.appendChild(carteTitre(liste[i]));
    }
    return g;
  }

  /* ---------- Vues ---------- */
  function construireVues() {
    construireBanniere(false);

    /* --- À la une : rangées décrites dans config.js --- */
    var a = id('rails-alaune'), i, d, l;
    a.innerHTML = '';
    for (i = 0; i < C.accueil.length; i++) {
      d = C.accueil[i];
      if (d.type === 'apps') {
        a.appendChild(rail('ac-' + d.cle, d.titre, '', cartesApps(appsVisibles())));
        continue;
      }
      l = titresDe(d);
      if (!l.length) { continue; }
      a.appendChild(rail('ac-' + d.cle, d.titre, '', cartesDe(l)));
    }

    /* --- Films et Séries : grilles --- */
    construireCatalogue(id('vue-films'), 'Films', 'film', 'films');
    construireCatalogue(id('vue-series'), 'Séries', 'serie', 'series');

    /* --- Favoris --- */
    var fv = id('vue-favoris'), lf = favoris();
    fv.innerHTML = '';
    fv.appendChild(enteteVue('Favoris', lf.length
      ? (lf.length > 1 ? lf.length + ' titres mis de côté sur ce téléviseur.' : '1 titre mis de côté sur ce téléviseur.')
      : 'Les titres que vous mettez de côté apparaissent ici.'));
    if (lf.length) {
      fv.appendChild(grille('fav', lf, 6));
    } else {
      fv.appendChild(encart('Aucun favori pour le moment',
        'Ouvrez un titre dans <b>Films</b> ou <b>Séries</b>, puis choisissez <b>Ajouter aux favoris</b>.<br>' +
        'Raccourci : touche <b>rouge</b> de la télécommande sur une carte sélectionnée — code à vérifier sur votre modèle avec <b>diagnostic.html</b>.'));
    }

    /* --- Applications --- */
    var ap = id('vue-apps');
    ap.innerHTML = '';
    ap.appendChild(enteteVue('Applications',
      'Deux natures de raccourcis : <b>Site web</b>, réellement ouvert ici dans le navigateur, et <b>Application TV</b>, que seule la télécommande peut lancer.'));
    ap.appendChild(rail('apps-tous', 'Mes applications', '', cartesApps(appsVisibles())));
    ap.appendChild(encart('Pourquoi certaines applications ne se lancent pas ?',
      'VIDAA n’expose aucune interface publique permettant à une page web de démarrer une application installée — Netflix, Disney+, Prime Video, TF1+. ' +
      'Les projets existants pour ces téléviseurs se heurtent à la même limite : un lancement réel exige soit une modification du système, soit un boîtier externe relais. ' +
      'Edenwood Apple TV ne fait ni l’un ni l’autre, et affiche donc la procédure télécommande plutôt que d’inventer un lien qui n’existe pas.'));

    /* --- Sources HDMI --- */
    var hd = id('vue-hdmi'), cartes = [];
    hd.innerHTML = '';
    hd.appendChild(enteteVue('Sources HDMI',
      'Liste indicative. Le changement d’entrée s’effectue avec la touche <b>Source</b> (ou <b>Input</b>) de la télécommande.'));
    for (i = 0; i < C.hdmi.length; i++) { cartes.push(carteHdmi(C.hdmi[i])); }
    hd.appendChild(rail('hdmi-tous', 'Entrées du téléviseur', '', cartes));

    id('aide-demo').innerHTML = esc(C.demoNotice);
  }

  function construireCatalogue(vue, titre, type, cle) {
    var l = parType(type);
    vue.innerHTML = '';
    vue.appendChild(enteteVue(titre, esc(C.demoNotice)));
    vue.appendChild(grille(cle, l, 6));
  }

  function enteteVue(titre, sousTitre) {
    var h = el('header', 'vue-entete');
    h.appendChild(el('h2', 'vue-titre', esc(titre)));
    h.appendChild(el('p', 'vue-sous-titre', sousTitre));
    return h;
  }

  function allerVue(v, focusPremier) {
    var vues = qsa('.vue');
    for (var i = 0; i < vues.length; i++) {
      var estActive = vues[i].getAttribute('data-vue') === v;
      removeClass(vues[i], 'entrante');
      toggleClass(vues[i], 'active', estActive);
      if (!estActive) { defilerVue(vues[i], 0, true); }
    }
    var act = qs('.vue.active');
    if (act && P.animations) { var ignore = act.offsetHeight; addClass(act, 'entrante'); }
    vueActive = v;
    majOnglets();
    construireLignes();
    if (focusPremier !== false) {
      var r = premiereLigneContenu();
      if (r >= 0) { focusLigne(r, 0); } else { focusLigne(1, Math.max(0, indexOngletActif())); }
    }
  }
  function indexOngletActif() {
    for (var i = 0; i < C.vues.length; i++) { if (C.vues[i].id === vueActive) { return i; } }
    return 0;
  }

  /* =========================================================
     7. RÉGLAGES
     ========================================================= */
  var modeDeplacement = null;   /* id d'application en cours de déplacement */

  function defReglages() {
    var g = [];

    g.push({ titre: 'Apparence', lignes: [
      { id: 'theme', nom: 'Thème', ico: 'r-theme',
        aide: 'Intensité du voile sombre appliqué au fond', type: 'choix', options: C.themes },
      { id: 'accent', nom: 'Couleur d’accentuation', ico: 'r-couleur',
        aide: 'Couleur du cadre de sélection', type: 'choix', options: C.accents, couleur: true },
      { id: 'fond', nom: 'Fond d’écran', ico: 'r-image',
        aide: 'Image d’arrière-plan de l’interface', type: 'choix', options: C.backgrounds },
      { id: 'transparence', nom: 'Transparences', ico: 'r-calque',
        aide: 'Panneaux en verre dépoli. À désactiver si l’affichage saccade', type: 'bascule' },
      { id: 'animations', nom: 'Animations', ico: 'r-eclair',
        aide: 'Agrandissement, fondus et défilement animés', type: 'bascule' },
      { id: 'vignettes', nom: 'Affiches', ico: 'r-affiche',
        aide: 'Visuels de démonstration. Désactivé : dégradés seuls, plus léger', type: 'bascule' }
    ] });

    g.push({ titre: 'Accueil et en-tête', lignes: [
      { id: 'heroAuto', nom: 'Bannière animée', ico: 'r-ecran',
        aide: 'Fait défiler lentement les titres mis en avant', type: 'bascule' },
      { id: 'vueDemarrage', nom: 'Section au démarrage', ico: 'r-grille', aide: '', type: 'choix', options: C.vues },
      { id: 'horloge', nom: 'Afficher l’horloge', ico: 'r-horloge', aide: '', type: 'bascule' },
      { id: 'formatHeure', nom: 'Format de l’heure', ico: 'r-horloge', aide: '', type: 'choix',
        options: [{ id: '24', nom: '24 heures' }, { id: '12', nom: '12 heures (AM/PM)' }] },
      { id: 'dateVisible', nom: 'Afficher la date', ico: 'r-calendrier', aide: 'Date complète en français', type: 'bascule' }
    ] });

    /* Ordre des applications */
    var lignesOrdre = [], apps = appsOrdonnees(), i;
    for (i = 0; i < apps.length; i++) {
      lignesOrdre.push({ id: 'ordre:' + apps[i].id, nom: apps[i].nom, ico: 'r-grille',
        aide: 'OK pour prendre ou déposer, puis Gauche / Droite', type: 'ordre', app: apps[i].id });
    }
    g.push({ titre: 'Ordre des applications', lignes: lignesOrdre });

    /* Visibilité */
    var lignesVis = [];
    for (i = 0; i < apps.length; i++) {
      lignesVis.push({ id: 'vis:' + apps[i].id, nom: apps[i].nom, ico: 'r-oeil', aide: '', type: 'visibilite', app: apps[i].id });
    }
    g.push({ titre: 'Raccourcis affichés', lignes: lignesVis });

    /* Favoris */
    var lignesFav = [], fv = favoris();
    if (fv.length) {
      for (i = 0; i < fv.length; i++) {
        lignesFav.push({ id: 'fav:' + fv[i].id, nom: fv[i].titre, ico: 'i-etoile',
          aide: (fv[i].type === 'film' ? 'Film' : 'Série') + ' · ' + fv[i].annee,
          type: 'action', valeur: 'Retirer', action: 'retirer-favori', cible: fv[i].id });
      }
      lignesFav.push({ id: 'fav:vider', nom: 'Vider les favoris', ico: 'r-reinit', aide: '', type: 'action',
        valeur: 'Tout retirer', action: 'vider-favoris' });
    } else {
      lignesFav.push({ id: 'fav:aucun', nom: 'Aucun favori', ico: 'i-etoile-vide', aide: 'Ajoutez un titre depuis Films ou Séries', type: 'info', valeur: '—' });
    }
    g.push({ titre: 'Favoris', lignes: lignesFav });

    /* Système */
    var ecran = (window.screen ? (screen.width + ' x ' + screen.height) : 'inconnu');
    var fenetre = (window.innerWidth || 0) + ' x ' + (window.innerHeight || 0);
    g.push({ titre: 'Système', lignes: [
      { id: 'sys:langue', nom: 'Langue', ico: 'r-info', aide: 'Cette version est intégralement en français', type: 'info', valeur: 'Français' },
      { id: 'sys:version', nom: 'Version', ico: 'r-info', aide: 'Edenwood Apple TV', type: 'info', valeur: C.version + ' (' + C.build + ')' },
      { id: 'sys:tv', nom: 'Téléviseur déclaré', ico: 'r-ecran', aide: C.device.marque + ' ' + C.device.modele + ' · ' + C.device.systeme, type: 'info', valeur: C.device.firmware },
      { id: 'sys:ecran', nom: 'Écran détecté', ico: 'r-ecran', aide: 'Fenêtre : ' + fenetre, type: 'info', valeur: ecran },
      { id: 'sys:stockage', nom: 'Stockage local', ico: 'r-calque', aide: 'Conservation des réglages', type: 'info',
        valeur: Stockage.disponible() ? 'Disponible' : 'Indisponible (mode dégradé)' },
      { id: 'sys:agent', nom: 'Navigateur', ico: 'r-info', aide: 'Chaîne User-Agent abrégée', type: 'info',
        valeur: (navigator.userAgent || 'inconnu').substring(0, 46) },
      { id: 'sys:diag', nom: 'Diagnostic des touches', ico: 'r-cle', aide: 'Ouvre l’outil de relevé des codes de la télécommande', type: 'action',
        valeur: 'Ouvrir', action: 'diagnostic' },
      { id: 'sys:reset', nom: 'Réinitialiser les préférences', ico: 'r-reinit', aide: 'Rétablit tous les réglages d’origine', type: 'action',
        valeur: 'Réinitialiser', action: 'reset' }
    ] });

    return g;
  }

  function valeurReglage(l) {
    var i;
    if (l.type === 'bascule') { return P[l.id] ? 'Activé' : 'Désactivé'; }
    if (l.type === 'choix') {
      for (i = 0; i < l.options.length; i++) {
        if (l.options[i].id === P[l.id]) {
          var nom = esc(l.options[i].nom);
          if (l.couleur) {
            return '<span class="puce-couleur" style="background:' + l.options[i].couleur + '"></span>' + nom;
          }
          return nom;
        }
      }
      return esc(String(P[l.id]));
    }
    if (l.type === 'visibilite') { return indexOf(P.appsMasquees, l.app) === -1 ? 'Affiché' : 'Masqué'; }
    if (l.type === 'ordre') {
      var apps = appsOrdonnees(), pos = 0;
      for (i = 0; i < apps.length; i++) { if (apps[i].id === l.app) { pos = i + 1; } }
      return (modeDeplacement === l.app ? 'Déplacement · ' : '') + 'Position ' + pos;
    }
    return esc(l.valeur || '');
  }

  function construireReglages() {
    var c = id('reglages-contenu'), groupes = defReglages(), i, j;
    c.innerHTML = '';
    for (i = 0; i < groupes.length; i++) {
      var gr = el('div', 'reglages-groupe');
      gr.appendChild(el('div', 'reglages-groupe-titre', esc(groupes[i].titre)));
      var bloc = el('div', 'reglages-bloc');
      for (j = 0; j < groupes[i].lignes.length; j++) {
        bloc.appendChild(ligneReglage(groupes[i].lignes[j]));
      }
      gr.appendChild(bloc);
      c.appendChild(gr);
    }
  }

  function ligneReglage(l) {
    var ligne = el('div', 'ligne-reglage' + (l.type !== 'info' ? ' focusable' : ''));
    ligne.setAttribute('data-nav-row', 'reg-' + l.id);
    ligne.setAttribute('data-reglage', l.id);
    ligne.setAttribute('data-type', l.type);
    if (l.app) { ligne.setAttribute('data-app', l.app); }
    if (l.action) { ligne.setAttribute('data-sous-action', l.action); }
    if (l.cible) { ligne.setAttribute('data-cible', l.cible); }
    if (l.type === 'ordre' && modeDeplacement === l.app) { addClass(ligne, 'deplacement'); }

    var fleches = (l.type === 'choix' || l.type === 'ordre')
      ? '<svg class="ico fl fl-g" aria-hidden="true"><use xlink:href="#i-fleche" href="#i-fleche"></use></svg>'
      : '';
    var fleches2 = (l.type === 'choix' || l.type === 'ordre')
      ? '<svg class="ico fl" aria-hidden="true"><use xlink:href="#i-fleche" href="#i-fleche"></use></svg>'
      : '';

    ligne.innerHTML =
      (l.ico ? '<svg class="ico ico-reg" aria-hidden="true"><use xlink:href="#' + l.ico +
               '" href="#' + l.ico + '"></use></svg>' : '') +
      '<div class="ligne-reglage-texte">' +
        '<div class="ligne-reglage-nom">' + esc(l.nom) + '</div>' +
        (l.aide ? '<div class="ligne-reglage-aide">' + esc(l.aide) + '</div>' : '') +
      '</div>' +
      '<div class="ligne-reglage-valeur' + (l.type === 'info' ? ' valeur-info' : '') + '">' +
        fleches + '<span class="vr">' + valeurReglage(l) + '</span>' + fleches2 +
      '</div>';
    if (l.type !== 'info') { ligne.setAttribute('tabindex', '-1'); }
    return ligne;
  }

  function majValeurLigne(ligne) {
    var idR = ligne.getAttribute('data-reglage');
    var groupes = defReglages(), i, j;
    for (i = 0; i < groupes.length; i++) {
      for (j = 0; j < groupes[i].lignes.length; j++) {
        if (groupes[i].lignes[j].id === idR) {
          qs('.vr', ligne).innerHTML = valeurReglage(groupes[i].lignes[j]);
          toggleClass(ligne, 'deplacement',
            groupes[i].lignes[j].type === 'ordre' && modeDeplacement === groupes[i].lignes[j].app);
          return;
        }
      }
    }
  }

  /* Changement de valeur : sens = -1 ou +1, ou 0 pour OK */
  function modifierReglage(ligne, sens) {
    var idR = ligne.getAttribute('data-reglage');
    var type = ligne.getAttribute('data-type');
    var app = ligne.getAttribute('data-app');
    var i, opts, pos;

    if (type === 'bascule') {
      if (sens === 0) { P[idR] = !P[idR]; } else { return false; }
    } else if (type === 'choix') {
      opts = optionsDe(idR);
      if (!opts) { return false; }
      pos = 0;
      for (i = 0; i < opts.length; i++) { if (opts[i].id === P[idR]) { pos = i; } }
      pos = (pos + (sens === 0 ? 1 : sens) + opts.length) % opts.length;
      P[idR] = opts[pos].id;
    } else if (type === 'visibilite') {
      if (sens !== 0) { return false; }
      var k = indexOf(P.appsMasquees, app);
      if (k > -1) { P.appsMasquees.splice(k, 1); }
      else {
        if (appsVisibles().length <= 1) { notifier('Au moins un raccourci doit rester affiché.'); return false; }
        P.appsMasquees.push(app);
      }
    } else if (type === 'ordre') {
      if (sens === 0) {
        modeDeplacement = (modeDeplacement === app) ? null : app;
        notifier(modeDeplacement
          ? 'Déplacement activé : Gauche / Droite pour changer la position, OK pour déposer.'
          : 'Position enregistrée.');
      } else {
        if (modeDeplacement !== app) {
          notifier('Appuyez d’abord sur OK pour prendre ce raccourci.');
          return false;
        }
        var liste = appsOrdonnees(), ids = [];
        for (i = 0; i < liste.length; i++) { ids.push(liste[i].id); }
        pos = indexOf(ids, app);
        var cible = pos + sens;
        if (cible < 0 || cible >= ids.length) { return false; }
        ids.splice(pos, 1);
        ids.splice(cible, 0, app);
        P.ordreApps = ids;
      }
    } else if (type === 'action') {
      if (sens !== 0) { return false; }
      executerActionReglage(ligne);
      return false;
    } else { return false; }

    sauverPrefs();
    appliquerTheme();
    majHorloge();
    if (idR === 'heroAuto' || idR === 'animations') { planifierHero(); }
    reconstruireApresReglage(idR);
    return true;
  }

  function optionsDe(idR) {
    if (idR === 'theme') { return C.themes; }
    if (idR === 'accent') { return C.accents; }
    if (idR === 'fond') { return C.backgrounds; }
    if (idR === 'formatHeure') { return [{ id: '24' }, { id: '12' }]; }
    if (idR === 'vueDemarrage') { return C.vues; }
    return null;
  }

  function reconstruireApresReglage(idR) {
    var besoinVues = (idR === 'vignettes' || idR.indexOf('vis:') === 0 || idR.indexOf('ordre:') === 0);
    if (besoinVues) { construireVues(); }
    /* on reconstruit toutes les lignes de réglages pour mettre les positions à jour */
    var memoire = focusCourant();
    construireReglages();
    construireLignes();
    restaurerFocus(memoire);
  }

  function executerActionReglage(ligne) {
    var act = ligne.getAttribute('data-sous-action');
    if (act === 'reset') {
      ouvrirModale({
        surtitre: 'Réglages',
        titre: 'Réinitialiser les préférences ?',
        texte: 'Tous les réglages (thème, couleur, fond, ordre des applications, favoris) reviendront à leur valeur d’origine. Cette action est immédiate et ne peut pas être annulée.',
        actions: [
          { nom: 'Réinitialiser', primaire: true, fn: function () {
              Stockage.effacer(C.reglages.cleStockage);
              chargerPrefs();
              modeDeplacement = null;
              appliquerTheme(); majHorloge();
              construireOnglets(); construireVues(); construireReglages();
              construireLignes(); focusLigne(premiereLigneContenu(), 0);
              notifier('Préférences réinitialisées.');
            } },
          { nom: 'Annuler' }
        ]
      });
    } else if (act === 'retirer-favori') {
      basculerFavori(ligne.getAttribute('data-cible'), true);
    } else if (act === 'vider-favoris') {
      P.favoris = []; sauverPrefs();
      construireVues(); construireReglages(); construireLignes();
      focusLigne(premiereLigneContenu(), 0);
      notifier('Favoris vidés.');
    } else if (act === 'diagnostic') {
      ouvrirModale({
        surtitre: 'Outil',
        titre: 'Diagnostic des touches',
        texte: 'Cette page affiche le code envoyé par chaque touche de votre télécommande. Elle sert à vérifier les codes de Retour, Exit et des touches de couleur sur votre Edenwood, puis à les renseigner dans <b>config.js</b>.<br><br>Pour revenir ensuite à Edenwood Apple TV, utilisez la touche Retour du navigateur VIDAA.',
        actions: [
          { nom: 'Ouvrir le diagnostic', primaire: true, fn: function () { window.location.href = 'diagnostic.html'; } },
          { nom: 'Annuler' }
        ]
      });
    }
  }

  /* =========================================================
     8. MOTEUR DE FOCUS
     ========================================================= */
  var lignes = [];          /* [{cle, el, items:[]}] */
  var fLigne = 0, fItem = 0;
  var memoireColonne = {};  /* cle de ligne -> index */

  function construireLignes() {
    lignes = [];
    if (modaleOuverte) {
      ajouterLignesDe(id('modale'));
      normaliserFocus();
      return;
    }
    /* En-tête (bouton réglages) */
    lignes.push({ cle: 'entete', el: id('entete'), items: [id('btn-reglages')] });
    /* Onglets */
    ajouterLignesDe(id('onglets'));
    /* Vue active */
    var v = qs('.vue.active');
    if (v) { ajouterLignesDe(v); }
    normaliserFocus();
  }

  function ajouterLignesDe(racine) {
    if (!racine) { return; }
    var conteneurs = qsa('[data-nav-row]', racine);
    if (racine.getAttribute && racine.getAttribute('data-nav-row')) {
      ajouterLigne(racine);
    }
    for (var i = 0; i < conteneurs.length; i++) { ajouterLigne(conteneurs[i]); }
  }

  function ajouterLigne(c) {
    if (!visible(c)) { return; }
    var items = [];
    if (hasClass(c, 'focusable')) { items.push(c); }
    else {
      var f = qsa('.focusable', c);
      for (var i = 0; i < f.length; i++) { if (visible(f[i])) { items.push(f[i]); } }
    }
    if (!items.length) { return; }
    lignes.push({ cle: c.getAttribute('data-nav-row'), el: c, items: items });
  }

  function premiereLigneContenu() {
    for (var i = 0; i < lignes.length; i++) {
      if (lignes[i].cle !== 'entete' && lignes[i].cle !== 'onglets') { return i; }
    }
    return lignes.length ? 0 : -1;
  }

  function normaliserFocus() {
    if (!lignes.length) { return; }
    if (fLigne >= lignes.length) { fLigne = lignes.length - 1; }
    if (fLigne < 0) { fLigne = 0; }
    if (fItem >= lignes[fLigne].items.length) { fItem = lignes[fLigne].items.length - 1; }
    if (fItem < 0) { fItem = 0; }
  }

  function elementFocus() {
    if (!lignes.length) { return null; }
    normaliserFocus();
    return lignes[fLigne].items[fItem];
  }

  /* Retire toute marque de focus résiduelle (changement de vue, reconstruction) */
  function nettoyerFocus() {
    var f = qsa('.focus'), i;
    for (i = 0; i < f.length; i++) { removeClass(f[i], 'focus'); }
  }

  function focusLigne(r, i) {
    if (r < 0 || r >= lignes.length) { return; }
    nettoyerFocus();
    fLigne = r;
    fItem = Math.max(0, Math.min(i, lignes[r].items.length - 1));
    memoireColonne[lignes[r].cle] = fItem;
    var e = elementFocus();
    if (!e) { return; }
    addClass(e, 'focus');
    assurerVisible(e);
  }

  function focusCourant() {
    var e = elementFocus();
    return { cle: lignes.length ? lignes[fLigne].cle : null, item: fItem,
             reglage: e && e.getAttribute ? e.getAttribute('data-reglage') : null };
  }
  function restaurerFocus(m) {
    if (!m || !m.cle) { focusLigne(premiereLigneContenu(), 0); return; }
    for (var i = 0; i < lignes.length; i++) {
      if (lignes[i].cle === m.cle) { focusLigne(i, m.item); return; }
    }
    focusLigne(Math.min(m.item >= 0 ? fLigne : 0, lignes.length - 1), 0);
  }

  function centreX(e) {
    var r = e.getBoundingClientRect();
    return r.left + r.width / 2;
  }

  function deplacer(dir) {
    if (!lignes.length) { return; }
    var e = elementFocus();
    if (dir === 'gauche' || dir === 'droite') {
      var d = dir === 'droite' ? 1 : -1;
      var n = fItem + d;
      if (n < 0 || n >= lignes[fLigne].items.length) { return; }
      focusLigne(fLigne, n);
      return;
    }
    var pas = dir === 'bas' ? 1 : -1;
    var r = fLigne + pas;
    while (r >= 0 && r < lignes.length && !lignes[r].items.length) { r += pas; }
    if (r < 0 || r >= lignes.length) { return; }
    var cible = lignes[r];
    var i;
    if (memoireColonne.hasOwnProperty(cible.cle)) {
      i = Math.min(memoireColonne[cible.cle], cible.items.length - 1);
    } else {
      /* le plus proche horizontalement */
      var x = e ? centreX(e) : 0, best = 0, bd = 1e9;
      for (var k = 0; k < cible.items.length; k++) {
        var dd = Math.abs(centreX(cible.items[k]) - x);
        if (dd < bd) { bd = dd; best = k; }
      }
      i = best;
    }
    focusLigne(r, i);
  }

  /* =========================================================
     9. DÉFILEMENT
     ========================================================= */
  function appliquerTransform(e, x, y) {
    var tr = 'translate3d(' + x + 'px,' + y + 'px,0)';
    e.style.webkitTransform = tr;
    e.style.transform = tr;
  }

  function defilerVue(vue, y, immediat) {
    if (!vue) { return; }
    if (immediat) {
      var t = vue.style.transition, wt = vue.style.webkitTransition;
      vue.style.transition = 'none'; vue.style.webkitTransition = 'none';
      appliquerTransform(vue, 0, -y);
      vue._y = y;
      /* forcer le recalcul puis restaurer */
      var ignore = vue.offsetHeight;
      vue.style.transition = t; vue.style.webkitTransition = wt;
      return;
    }
    appliquerTransform(vue, 0, -y);
    vue._y = y;
  }

  function assurerVisible(e) {
    if (!e) { return; }
    /* --- horizontal : piste de rail --- */
    var piste = e.parentNode;
    while (piste && !hasClass(piste, 'rail-piste')) { piste = piste.parentNode; }
    if (piste) {
      var cur = piste._x || 0;
      var gauche = offsetIn(e, piste, 'x');
      var droite = gauche + e.offsetWidth;
      var marge = 72, large = 1920;
      var maxX = Math.max(0, piste.scrollWidth - large);
      if (gauche < cur + marge) { cur = gauche - marge; }
      else if (droite > cur + large - marge) { cur = droite - large + marge; }
      cur = Math.max(0, Math.min(cur, maxX));
      if (cur !== (piste._x || 0)) { piste._x = cur; appliquerTransform(piste, -cur, 0); }
    }
    /* --- vertical : vue active --- */
    var vue = e.parentNode;
    while (vue && !hasClass(vue, 'vue')) { vue = vue.parentNode; }
    if (!vue) { return; }
    var y = vue._y || 0;
    var haut = offsetIn(e, vue, 'y');
    var bas = haut + e.offsetHeight;
    var hScene = 1012, pad = 44;
    var maxY = Math.max(0, vue.offsetHeight - hScene);
    if (haut - pad < y) { y = haut - pad; }
    else if (bas + pad > y + hScene) { y = bas + pad - hScene; }
    y = Math.max(0, Math.min(y, maxY));
    if (y !== (vue._y || 0)) { defilerVue(vue, y); }
  }

  /* =========================================================
     10. MODALE ET NOTIFICATIONS
     ========================================================= */
  var modaleOuverte = false, modaleActions = [], focusAvantModale = null;

  function ouvrirModale(opt) {
    focusAvantModale = focusCourant();
    modaleActions = opt.actions || [{ nom: 'Fermer' }];
    id('modale-surtitre').innerHTML = esc(opt.surtitre || '');
    id('modale-titre').innerHTML = esc(opt.titre || '');
    id('modale-meta').innerHTML = opt.meta || '';
    id('modale-texte').innerHTML = opt.texte || '';

    var v = id('modale-visuel');
    if (opt.visuel && P.vignettes) {
      removeClass(v, 'vide'); v.style.backgroundImage = 'url("' + opt.visuel + '")';
    } else { addClass(v, 'vide'); v.style.backgroundImage = 'none'; }

    var a = id('modale-actions');
    a.innerHTML = '';
    for (var i = 0; i < modaleActions.length; i++) {
      var b = el('button', 'bouton compact focusable ' +
        (modaleActions[i].primaire ? 'bouton-primaire' : 'bouton-secondaire') +
        (modaleActions[i].actif ? ' actif' : ''), '<span>' + esc(modaleActions[i].nom) + '</span>');
      b.setAttribute('type', 'button');
      b.setAttribute('data-modale-index', i);
      b.setAttribute('tabindex', '-1');
      a.appendChild(b);
    }
    id('modale-fond').removeAttribute('hidden');
    modaleOuverte = true;
    construireLignes();
    focusLigne(0, 0);
  }

  function fermerModale() {
    if (!modaleOuverte) { return; }
    id('modale-fond').setAttribute('hidden', 'hidden');
    modaleOuverte = false;
    modaleActions = [];
    construireLignes();
    restaurerFocus(focusAvantModale);
  }

  var toastTimer = null;
  function notifier(texte) {
    var t = id('toast');
    id('toast-texte').innerHTML = texte;
    t.removeAttribute('hidden');
    if (toastTimer) { window.clearTimeout(toastTimer); }
    toastTimer = window.setTimeout(function () { t.setAttribute('hidden', 'hidden'); }, 4200);
  }

  /* =========================================================
     11. ACTIONS
     ========================================================= */
  function basculerFavori(idT, silencieux) {
    var t = trouverTitre(idT);
    if (!t) { return; }
    var k = indexOf(P.favoris, idT);
    if (k > -1) { P.favoris.splice(k, 1); } else { P.favoris.push(idT); }
    sauverPrefs();
    var m = focusCourant();
    construireVues();
    if (vueActive === 'reglages') { construireReglages(); }
    construireLignes();
    restaurerFocus(m);
    if (!silencieux) {
      notifier(k > -1 ? '« ' + esc(t.titre) + ' » retiré des favoris.'
                      : '« ' + esc(t.titre) + ' » ajouté aux favoris.');
    }
  }

  function ouvrirTitre(idT) {
    var t = trouverTitre(idT);
    if (!t) { return; }
    var fav = estFavori(idT);
    ouvrirModale({
      surtitre: (t.type === 'film' ? 'Film' : 'Série') + ' · Contenu de démonstration',
      titre: t.titre,
      meta: esc(t.annee) + ' <span style="color:#4d535e">·</span> ' + esc(t.genre) +
            ' <span style="color:#4d535e">·</span> ' + esc(t.duree),
      texte: esc(t.synopsis) +
             '<br><br><span style="color:#6e7685">Aucune source vidéo n’est associée à ce titre : ' +
             'il sert uniquement à présenter l’interface.</span>',
      visuel: t.affiche,
      actions: [
        { nom: fav ? 'Retirer des favoris' : 'Ajouter aux favoris', primaire: true, actif: fav,
          fn: function () { fermerModale(); basculerFavori(idT); } },
        { nom: 'Fermer' }
      ]
    });
  }

  function ouvrirApp(idApp) {
    var a = trouverApp(idApp);
    if (!a) { return; }
    if (a.kind === 'systeme') {
      allerVue(a.vue || 'hdmi');
      return;
    }
    if (a.kind === 'web') {
      ouvrirModale({
        surtitre: 'Site web',
        titre: a.nom,
        texte: esc(a.instruction) +
          '<br><br><span style="color:#6e7685">Edenwood Apple TV va se fermer et le navigateur VIDAA ouvrira ' +
          esc(a.url) + '. Pour revenir, utilisez la touche Retour du navigateur.</span>',
        actions: [
          { nom: 'Ouvrir le site', primaire: true, fn: function () { window.location.href = a.url; } },
          { nom: 'Annuler' }
        ]
      });
      return;
    }
    ouvrirModale({
      surtitre: 'Application VIDAA',
      titre: a.nom,
      texte: '<b>Ce raccourci ne peut pas lancer l’application.</b><br><br>' + esc(a.instruction) +
        '<br><br><span style="color:#6e7685">VIDAA n’offre aucune interface publique permettant à une page web ' +
        'de démarrer une application installée. Aucun « deep link » n’est inventé ici.</span>',
      actions: [{ nom: 'Compris', primaire: true }]
    });
  }

  function ouvrirHdmi(idS) {
    var s = null;
    for (var i = 0; i < C.hdmi.length; i++) { if (C.hdmi[i].id === idS) { s = C.hdmi[i]; } }
    if (!s) { return; }
    ouvrirModale({
      surtitre: 'Entrée du téléviseur',
      titre: s.nom,
      meta: esc(s.detail),
      texte: 'Le changement d’entrée n’est pas pilotable depuis une page web.<br><br>' +
        'Sur la télécommande Edenwood : appuyez sur <b>Source</b> (ou <b>Input</b>), ' +
        'puis sélectionnez <b>' + esc(s.nom) + '</b> avec les flèches et validez avec OK.',
      actions: [{ nom: 'Compris', primaire: true }]
    });
  }

  function actionSurElement(e) {
    if (!e) { return; }
    if (modaleOuverte) {
      var k = parseInt(e.getAttribute('data-modale-index'), 10);
      var a = modaleActions[k];
      if (a && a.fn) { a.fn(); } else { fermerModale(); }
      return;
    }
    if (hasClass(e, 'ligne-reglage')) { modifierReglage(e, 0); majValeurLigne(e); return; }

    var act = e.getAttribute('data-action');
    var idA = e.getAttribute('data-id');
    if (act === 'vue') { allerVue(idA); }
    else if (act === 'ouvrir-reglages') { allerVue('reglages'); }
    else if (act === 'titre') { ouvrirTitre(idA); }
    else if (act === 'app') { ouvrirApp(idA); }
    else if (act === 'hdmi') { ouvrirHdmi(idA); }
    else if (act === 'hero-lire') { ouvrirTitre(id('banniere').getAttribute('data-id')); }
    else if (act === 'hero-favori') {
      basculerFavori(id('banniere').getAttribute('data-id'));
      majBoutonFavoriHero(heroCourant());
    }
  }

  function retour() {
    if (modaleOuverte) { fermerModale(); return; }
    if (vueActive === 'reglages') {
      modeDeplacement = null;
      allerVue(P.vueDemarrage || 'alaune');
      return;
    }
    if (fLigne > 1) { focusLigne(1, indexOngletActif()); return; }
    if (vueActive !== (P.vueDemarrage || 'alaune')) { allerVue(P.vueDemarrage || 'alaune'); return; }
    ouvrirModale({
      surtitre: 'Edenwood Apple TV',
      titre: 'Quitter l’interface ?',
      texte: 'Pour revenir à l’accueil VIDAA du téléviseur, appuyez sur la touche <b>Accueil</b> (Home) de la télécommande, ou fermez le navigateur avec la touche <b>Exit</b>.<br><br>' +
             'Edenwood Apple TV ne peut pas fermer le navigateur à votre place : aucune page web n’a cette autorisation.',
      actions: [{ nom: 'Rester ici', primaire: true }]
    });
  }

  /* =========================================================
     12. TÉLÉCOMMANDE / CLAVIER
     ========================================================= */
  function codeDans(liste, code) { return indexOf(liste, code) > -1; }

  var dernierMouvement = 0;
  var enfoncees = {};   /* codes actuellement maintenus enfoncés */

  function surRelache(ev) {
    var code = (ev || window.event).keyCode || (ev || window.event).which || 0;
    delete enfoncees[code];
  }

  function surTouche(ev) {
    var code = ev.keyCode || ev.which || 0;
    /* toute action relance le compte à rebours : la bannière ne change
       jamais pendant que l'utilisateur manipule la télécommande */
    planifierHero();
    var k = C.touches;
    var maintenant = (new Date()).getTime();

    /* Directions (avec limitation de cadence pour l'appui maintenu) */
    var dir = null;
    if (codeDans(k.haut, code)) { dir = 'haut'; }
    else if (codeDans(k.bas, code)) { dir = 'bas'; }
    else if (codeDans(k.gauche, code)) { dir = 'gauche'; }
    else if (codeDans(k.droite, code)) { dir = 'droite'; }

    if (dir) {
      if (ev.preventDefault) { ev.preventDefault(); }
      /* Limitation de cadence uniquement sur l'appui MAINTENU (auto-répétition
         de la télécommande). Deux appuis distincts ne sont jamais perdus. */
      var repetition = (ev.repeat === true) || (enfoncees[code] === true);
      enfoncees[code] = true;
      if (repetition && (maintenant - dernierMouvement < C.reglages.repeatIntervalle)) { return; }
      dernierMouvement = maintenant;
      /* Dans les réglages, Gauche/Droite change la valeur */
      var e = elementFocus();
      if (!modaleOuverte && e && hasClass(e, 'ligne-reglage') && (dir === 'gauche' || dir === 'droite')) {
        if (modifierReglage(e, dir === 'droite' ? 1 : -1)) { return; }
        return;
      }
      deplacer(dir);
      return;
    }

    if (codeDans(k.ok, code)) {
      if (ev.preventDefault) { ev.preventDefault(); }
      actionSurElement(elementFocus());
      return;
    }
    if (codeDans(k.retour, code)) {
      if (ev.preventDefault) { ev.preventDefault(); }
      retour();
      return;
    }
    if (codeDans(k.accueil, code)) {
      if (ev.preventDefault) { ev.preventDefault(); }
      if (modaleOuverte) { fermerModale(); }
      allerVue(P.vueDemarrage || 'alaune');
      return;
    }
    /* Touche rouge : favori sur la carte sélectionnée */
    if (codeDans(k.rouge, code)) {
      if (ev.preventDefault) { ev.preventDefault(); }
      var c = elementFocus();
      if (c && c.getAttribute('data-action') === 'titre') { basculerFavori(c.getAttribute('data-id')); }
      else if (!modaleOuverte && vueActive === 'alaune') {
        basculerFavori(id('banniere').getAttribute('data-id'));
        majBoutonFavoriHero(heroCourant());
      }
      return;
    }
    /* Touche verte : réglages */
    if (codeDans(k.verte, code)) {
      if (ev.preventDefault) { ev.preventDefault(); }
      if (modaleOuverte) { fermerModale(); }
      allerVue('reglages');
      return;
    }
    /* Chiffres 1 à 9 : applications */
    var num = -1;
    if (code >= 49 && code <= 57) { num = code - 49; }
    else if (code >= 97 && code <= 105) { num = code - 97; }
    if (num > -1 && !modaleOuverte) {
      if (ev.preventDefault) { ev.preventDefault(); }
      var apps = appsVisibles();
      if (apps[num]) { ouvrirApp(apps[num].id); }
    }
  }

  /* Souris / tactile : pratique pour les tests sur Windows */
  function surClic(ev) {
    var t = ev.target, n = t;
    while (n && n !== document.body) {
      if (hasClass(n, 'focusable')) {
        for (var r = 0; r < lignes.length; r++) {
          for (var i = 0; i < lignes[r].items.length; i++) {
            if (lignes[r].items[i] === n) { focusLigne(r, i); actionSurElement(n); return; }
          }
        }
        actionSurElement(n);
        return;
      }
      n = n.parentNode;
    }
  }

  /* =========================================================
     13. DÉMARRAGE
     ========================================================= */
  function demarrer() {
    chargerPrefs();
    appliquerTheme();
    ajusterEchelle();

    construireOnglets();
    construireVues();
    construireReglages();

    vueActive = P.vueDemarrage || 'alaune';
    if (vueActive === 'reglages') { vueActive = 'alaune'; }
    allerVue(vueActive, false);

    majHorloge();
    majReseau();
    window.setInterval(majHorloge, 1000);

    if (document.addEventListener) {
      document.addEventListener('keydown', surTouche, false);
      document.addEventListener('keyup', surRelache, false);
      document.addEventListener('click', surClic, false);
      window.addEventListener('resize', ajusterEchelle, false);
      window.addEventListener('online', majReseau, false);
      window.addEventListener('offline', majReseau, false);
    } else if (document.attachEvent) {
      document.attachEvent('onkeydown', function () { surTouche(window.event); });
      document.attachEvent('onkeyup', function () { surRelache(window.event); });
      document.attachEvent('onclick', function () { surClic(window.event); });
    }

    construireLignes();
    focusLigne(premiereLigneContenu(), 0);
    planifierHero();

    /* Fin de l'écran de démarrage */
    window.setTimeout(function () {
      var d = id('demarrage');
      addClass(d, 'parti');
      window.setTimeout(function () { d.setAttribute('hidden', 'hidden'); }, 450);
      removeClass(document.body, 'chargement');
    }, 520);

    if (!Stockage.disponible()) {
      window.setTimeout(function () {
        notifier('Stockage local indisponible sur ce navigateur : l’interface fonctionne, mais les réglages seront perdus à la fermeture.');
      }, 1400);
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    window.setTimeout(demarrer, 0);
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', demarrer, false);
  } else {
    window.onload = demarrer;
  }

})();
