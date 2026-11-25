# -*- coding: utf-8 -*-
"""
Edenwood Apple TV — generateur de visuels SVG.

Produit :
  assets/movies/*.svg        12 affiches verticales 600 x 900 (scenes cinematographiques)
  assets/backgrounds/hero-*  4 bannieres 1920 x 1080
  assets/icons/app-*.svg     8 tuiles d'applications (glyphes originaux)
  assets/logos/edenwood.svg  logo du produit

Tout est vectoriel, sans filtre SVG (couteux sur navigateur de televiseur) :
uniquement des degrades et des formes. Poids total : quelques dizaines de Ko.

Usage :  python tools/generer-visuels.py
"""
import io
import os

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POLICE = 'Helvetica Neue, Helvetica, Arial, sans-serif'


def ecrire(chemin, contenu):
    plein = os.path.join(RACINE, chemin)
    d = os.path.dirname(plein)
    if not os.path.isdir(d):
        os.makedirs(d)
    with io.open(plein, 'w', encoding='utf-8') as f:
        f.write(contenu)
    return plein


# ---------------------------------------------------------------- degrades
def lin(ident, stops, x1='0', y1='0', x2='0', y2='1'):
    s = ''.join('<stop offset="%s" stop-color="%s" stop-opacity="%s"/>' % t for t in stops)
    return '<linearGradient id="%s" x1="%s" y1="%s" x2="%s" y2="%s">%s</linearGradient>' % (
        ident, x1, y1, x2, y2, s)


def rad(ident, stops, cx='0.5', cy='0.5', r='0.7'):
    s = ''.join('<stop offset="%s" stop-color="%s" stop-opacity="%s"/>' % t for t in stops)
    return '<radialGradient id="%s" cx="%s" cy="%s" r="%s">%s</radialGradient>' % (
        ident, cx, cy, r, s)


# ---------------------------------------------------------------- affiches
def affiche(nom, titre, defs, scene, teinte_bas='#04060a'):
    """Assemble une affiche 600 x 900 : scene + voile + titre."""
    svg = u'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900">
<defs>%s
<linearGradient id="scrim" x1="0" y1="0.42" x2="0" y2="1">
  <stop offset="0" stop-color="%s" stop-opacity="0"/>
  <stop offset="0.52" stop-color="%s" stop-opacity="0.62"/>
  <stop offset="1" stop-color="%s" stop-opacity="0.97"/>
</linearGradient>
<radialGradient id="vign" cx="0.5" cy="0.44" r="0.78">
  <stop offset="0.55" stop-color="#000000" stop-opacity="0"/>
  <stop offset="1" stop-color="#000000" stop-opacity="0.46"/>
</radialGradient>
</defs>
%s
<rect width="600" height="900" fill="url(#vign)"/>
<rect width="600" height="900" fill="url(#scrim)"/>
<g font-family="%s">
  <rect x="44" y="760" width="56" height="2" fill="#ffffff" fill-opacity="0.55"/>
  <text x="44" y="824" font-size="50" font-weight="300" letter-spacing="3"
        fill="#ffffff" fill-opacity="0.96">%s</text>
</g>
</svg>
''' % (defs, teinte_bas, teinte_bas, teinte_bas, scene, POLICE, titre.upper())
    ecrire('assets/movies/%s.svg' % nom, svg)


BAN_L, BAN_H = 1920, 630


def banniere(nom, defs, scene):
    """Banniere au format exact de la zone d'affichage : aucun recadrage."""
    svg = u'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d" preserveAspectRatio="xMidYMid slice">
<defs>%s
<radialGradient id="vign" cx="0.64" cy="0.40" r="0.9">
  <stop offset="0.5" stop-color="#000000" stop-opacity="0"/>
  <stop offset="1" stop-color="#000000" stop-opacity="0.45"/>
</radialGradient>
</defs>
%s
<rect width="%d" height="%d" fill="url(#vign)"/>
</svg>
''' % (BAN_L, BAN_H, BAN_L, BAN_H, defs, scene, BAN_L, BAN_H)
    ecrire('assets/backgrounds/%s.svg' % nom, svg)


# =================================================================
#  SCENES — chaque fonction renvoie (defs, corps) a l'echelle 600x900
#  et une variante large 1920x1080 quand elle sert de banniere.
# =================================================================

def sc_horizon(L, H):
    """Mer au crepuscule, soleil bas, station au loin."""
    hz = H * 0.62
    defs = (lin('ciel', [('0', '#0b2039', '1'), ('0.55', '#1d3f5e', '1'), ('1', '#4a6a7e', '1')]) +
            rad('soleil', [('0', '#ffd9a8', '0.95'), ('0.35', '#e8884f', '0.55'),
                           ('1', '#e8884f', '0')], '0.5', '0.5', '0.5') +
            lin('mer', [('0', '#2a4a5e', '1'), ('0.3', '#132839', '1'), ('1', '#050b14', '1')]) +
            lin('reflet', [('0', '#ffc98f', '0.34'), ('0.45', '#ffc98f', '0.14'), ('1', '#ffc98f', '0')]))
    cx, cy, r = L * 0.68, hz - H * 0.015, H * 0.19
    corps = ['<rect width="%d" height="%d" fill="url(#ciel)"/>' % (L, H)]
    # halo + disque solaire
    corps.append('<circle cx="%.0f" cy="%.0f" r="%.0f" fill="url(#soleil)"/>' % (cx, cy, r * 2.6))
    corps.append('<circle cx="%.0f" cy="%.0f" r="%.0f" fill="#ffd9a8" fill-opacity="0.85"/>' % (cx, cy, r * 0.42))
    # bancs de nuages (ellipses tres douces)
    for i, (x, y, rx, ry, o) in enumerate([(0.18, 0.30, 0.26, 0.016, 0.10),
                                           (0.58, 0.24, 0.20, 0.012, 0.08),
                                           (0.40, 0.42, 0.30, 0.014, 0.07)]):
        corps.append('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" fill="#dce9f5" fill-opacity="%.2f"/>'
                     % (L * x, H * y, L * rx, H * ry, o))
    # mer
    corps.append('<rect x="0" y="%.0f" width="%d" height="%.0f" fill="url(#mer)"/>' % (hz, L, H - hz))
    # reflet solaire (fondu vertical, pas de bord net)
    corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" fill="url(#reflet)"/>'
                 % (cx - L * 0.055, hz, L * 0.11, H - hz))
    for i in range(9):
        y = hz + (H - hz) * (0.06 + i * 0.1)
        w = L * (0.06 + i * 0.035)
        corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="2" fill="#ffd9a8" fill-opacity="%.2f"/>'
                     % (cx - w / 2, y, w, 0.30 - i * 0.03))
    # station au loin
    sx = L * 0.30
    corps.append('<g fill="#040a12" fill-opacity="0.92">'
                 '<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f"/>'
                 '<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f"/>'
                 '<rect x="%.0f" y="%.0f" width="4" height="%.0f"/></g>'
                 % (sx, hz - H * 0.075, L * 0.085, H * 0.075,
                    sx + L * 0.012, hz - H * 0.105, L * 0.035, H * 0.032,
                    sx + L * 0.028, hz - H * 0.165, H * 0.062))
    corps.append('<circle cx="%.0f" cy="%.0f" r="3" fill="#ff6b5a"/>' % (sx + L * 0.030, hz - H * 0.168))
    return defs, ''.join(corps)


def sc_sillage(L, H):
    """Port de nuit, cargo et sillage froid."""
    hz = H * 0.58
    defs = (lin('ciel', [('0', '#0a0f1c', '1'), ('0.6', '#14243a', '1'), ('1', '#27465f', '1')]) +
            lin('eau', [('0', '#1b3448', '1'), ('1', '#04080f', '1')]) +
            rad('lune', [('0', '#cfe6ff', '0.9'), ('1', '#cfe6ff', '0')], '0.5', '0.5', '0.5'))
    corps = ['<rect width="%d" height="%d" fill="url(#ciel)"/>' % (L, H)]
    corps.append('<circle cx="%.0f" cy="%.0f" r="%.0f" fill="url(#lune)"/>' % (L * 0.22, H * 0.17, H * 0.14))
    corps.append('<circle cx="%.0f" cy="%.0f" r="%.0f" fill="#e8f2ff" fill-opacity="0.9"/>' % (L * 0.22, H * 0.17, H * 0.022))
    # ville basse
    bx = 0
    import random
    random.seed(7)
    while bx < L:
        w = L * random.uniform(0.02, 0.055)
        h = H * random.uniform(0.02, 0.07)
        corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" fill="#070d16"/>' % (bx, hz - h, w, h))
        if random.random() > 0.45:
            corps.append('<rect x="%.0f" y="%.0f" width="3" height="3" fill="#ffc87a" fill-opacity="0.7"/>'
                         % (bx + w * 0.4, hz - h * 0.6))
        bx += w + L * 0.004
    corps.append('<rect x="0" y="%.0f" width="%d" height="%.0f" fill="url(#eau)"/>' % (hz, L, H - hz))
    # cargo
    cx = L * 0.56
    corps.append('<g fill="#060b13">'
                 '<path d="M%.0f %.0f L%.0f %.0f L%.0f %.0f L%.0f %.0f Z"/>'
                 '<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f"/></g>'
                 % (cx, hz + H * 0.03, cx + L * 0.30, hz + H * 0.03,
                    cx + L * 0.26, hz + H * 0.085, cx + L * 0.035, hz + H * 0.085,
                    cx + L * 0.19, hz - H * 0.045, L * 0.07, H * 0.075))
    for i in range(4):
        corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" fill="#0c1826"/>'
                     % (cx + L * (0.03 + i * 0.038), hz - H * 0.012, L * 0.032, H * 0.042))
    corps.append('<rect x="%.0f" y="%.0f" width="4" height="4" fill="#ffd9a0"/>' % (cx + L * 0.215, hz - H * 0.030))
    # sillage
    for i in range(7):
        y = hz + H * (0.10 + i * 0.045)
        w = L * (0.12 + i * 0.09)
        corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="2" rx="1" fill="#9fc8e8" fill-opacity="%.2f"/>'
                     % (cx + L * 0.16 - w / 2, y, w, 0.26 - i * 0.032))
    return defs, ''.join(corps)


def sc_oasis(L, H):
    """Dunes, caravane, soleil chaud."""
    defs = (lin('ciel', [('0', '#2a1c12', '1'), ('0.45', '#7a4a22', '1'), ('1', '#d99a52', '1')]) +
            rad('astre', [('0', '#fff0cf', '1'), ('0.3', '#ffb866', '0.6'), ('1', '#ffb866', '0')], '0.5', '0.5', '0.5'))
    hz = H * 0.56
    corps = ['<rect width="%d" height="%d" fill="url(#ciel)"/>' % (L, H)]
    corps.append('<circle cx="%.0f" cy="%.0f" r="%.0f" fill="url(#astre)"/>' % (L * 0.38, hz - H * 0.04, H * 0.32))
    corps.append('<circle cx="%.0f" cy="%.0f" r="%.0f" fill="#fff1d2" fill-opacity="0.95"/>' % (L * 0.38, hz - H * 0.04, H * 0.055))
    dunes = [(0.56, '#8a5526', 1.0), (0.64, '#5e3718', 1.0), (0.74, '#3a2110', 1.0), (0.86, '#1c0f08', 1.0)]
    for k, (y, c, o) in enumerate(dunes):
        yy = H * y
        corps.append('<path d="M0 %.0f Q%.0f %.0f %.0f %.0f T%d %.0f L%d %d L0 %d Z" fill="%s"/>'
                     % (yy, L * 0.22, yy - H * (0.045 - k * 0.006), L * 0.5, yy,
                        L, yy - H * (0.02 + k * 0.004), L, H, H, c))
    # caravane
    bx, by = L * 0.60, H * 0.70
    for i in range(3):
        x = bx + i * L * 0.075
        s = H * 0.030
        corps.append('<g fill="#110803">'
                     '<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f"/>'
                     '<rect x="%.0f" y="%.0f" width="3" height="%.0f"/>'
                     '<rect x="%.0f" y="%.0f" width="3" height="%.0f"/>'
                     '<path d="M%.0f %.0f q%.0f %.0f %.0f %.0f" stroke="#110803" stroke-width="4" fill="none"/></g>'
                     % (x, by, s, s * 0.52,
                        x - s * 0.6, by, s * 0.75,
                        x + s * 0.4, by, s * 0.75,
                        x + s * 0.8, by - s * 0.2, s * 0.35, -s * 0.8, s * 0.55, -s * 0.2))
    return defs, ''.join(corps)


def sc_nadir(L, H):
    """Station en orbite, limbe de planete, champ d'etoiles."""
    import random
    random.seed(3)
    defs = (lin('espace', [('0', '#05060f', '1'), ('1', '#0b1026', '1')]) +
            rad('limbe', [('0', '#4b7fd0', '0.0'), ('0.86', '#4b7fd0', '0.0'),
                          ('0.93', '#78b4ff', '0.75'), ('1', '#0a1430', '1')], '0.5', '0.5', '0.5'))
    corps = ['<rect width="%d" height="%d" fill="url(#espace)"/>' % (L, H)]
    for _ in range(90):
        x, y = random.uniform(0, L), random.uniform(0, H * 0.8)
        corps.append('<circle cx="%.0f" cy="%.0f" r="%.1f" fill="#ffffff" fill-opacity="%.2f"/>'
                     % (x, y, random.uniform(0.6, 1.8), random.uniform(0.18, 0.75)))
    # limbe planetaire en bas
    pr = L * 1.25
    corps.append('<circle cx="%.0f" cy="%.0f" r="%.0f" fill="url(#limbe)"/>' % (L * 0.5, H * 1.02 + pr * 0.52, pr))
    corps.append('<circle cx="%.0f" cy="%.0f" r="%.0f" fill="#070d1c"/>' % (L * 0.5, H * 1.02 + pr * 0.52, pr * 0.985))
    # station
    sx, sy = L * 0.62, H * 0.33
    s = H * 0.055
    corps.append('<g stroke="#9fb6d8" stroke-opacity="0.85" stroke-width="3" fill="#0d1322">'
                 '<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" rx="%.0f"/>'
                 '<path d="M%.0f %.0f L%.0f %.0f M%.0f %.0f L%.0f %.0f"/>'
                 '<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f"/>'
                 '<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f"/></g>'
                 % (sx - s * 1.1, sy - s * 0.42, s * 2.2, s * 0.84, s * 0.35,
                    sx - s * 1.1, sy, sx - s * 2.6, sy,
                    sx + s * 1.1, sy, sx + s * 2.6, sy,
                    sx - s * 3.5, sy - s * 0.95, s * 0.95, s * 1.9,
                    sx + s * 2.6, sy - s * 0.95, s * 0.95, s * 1.9))
    corps.append('<circle cx="%.0f" cy="%.0f" r="3" fill="#ff7a68"/>' % (sx + s * 0.8, sy))
    return defs, ''.join(corps)


def sc_acier(L, H):
    """Vallee industrielle, cheminees, fumee chaude."""
    hz = H * 0.70
    defs = (lin('ciel', [('0', '#2b2a27', '1'), ('0.5', '#55483c', '1'), ('1', '#8a6e52', '1')]) +
            lin('sol', [('0', '#1b1a18', '1'), ('1', '#0a0a0a', '1')]))
    corps = ['<rect width="%d" height="%d" fill="url(#ciel)"/>' % (L, H)]
    # collines
    corps.append('<path d="M0 %.0f Q%.0f %.0f %.0f %.0f T%d %.0f L%d %d L0 %d Z" fill="#241f1b"/>'
                 % (hz - H * 0.10, L * 0.25, hz - H * 0.18, L * 0.5, hz - H * 0.09, L, hz - H * 0.13, L, H, H))
    # usine
    for i, (x, w, h) in enumerate([(0.10, 0.16, 0.13), (0.30, 0.10, 0.09), (0.44, 0.22, 0.16)]):
        corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" fill="#121110"/>'
                     % (L * x, hz - H * h, L * w, H * h))
        for j in range(3):
            corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" fill="#e8a65a" fill-opacity="0.45"/>'
                         % (L * x + L * 0.012 + j * L * 0.03, hz - H * h * 0.55, L * 0.016, H * 0.018))
    for i, x in enumerate([0.24, 0.70, 0.80]):
        ch = H * (0.26 + i * 0.05)
        corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" fill="#0e0d0c"/>'
                     % (L * x, hz - ch, L * 0.028, ch))
        for k in range(4):
            corps.append('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" fill="#c9b49a" fill-opacity="%.2f"/>'
                         % (L * x + L * 0.014 + k * L * 0.012, hz - ch - H * (0.02 + k * 0.035),
                            L * (0.035 + k * 0.022), H * (0.018 + k * 0.012), 0.20 - k * 0.04))
    corps.append('<rect x="0" y="%.0f" width="%d" height="%.0f" fill="url(#sol)"/>' % (hz, L, H - hz))
    for i in range(5):
        corps.append('<rect x="0" y="%.0f" width="%d" height="2" fill="#3a332c" fill-opacity="0.5"/>'
                     % (hz + H * (0.03 + i * 0.05), L))
    return defs, ''.join(corps)


def sc_vertige(L, H):
    """Facade de gratte-ciel en contre-plongee, silhouette sur corde."""
    defs = (lin('ciel', [('0', '#2a1410', '1'), ('1', '#120807', '1')]) +
            lin('verre', [('0', '#2d3a46', '1'), ('1', '#0d1319', '1')], '0', '0', '1', '1'))
    corps = ['<rect width="%d" height="%d" fill="url(#ciel)"/>' % (L, H)]
    corps.append('<path d="M%.0f 0 L%d 0 L%d %d L%.0f %d Z" fill="url(#verre)"/>'
                 % (L * 0.26, L, L, H, L * 0.04, H))
    # fenetres en perspective
    for r in range(16):
        y0 = H * (0.03 + r * 0.062)
        for c in range(7):
            x0 = L * (0.30 + c * 0.10) - r * L * 0.008
            w = L * 0.066 + r * L * 0.0016
            h = H * 0.034
            o = 0.10 if (r * 7 + c) % 5 else 0.34
            corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" fill="#9fc0dd" fill-opacity="%.2f"/>'
                         % (x0, y0, w, h, o))
    # cable + silhouette
    corps.append('<path d="M%.0f 0 L%.0f %.0f" stroke="#05080b" stroke-width="3"/>' % (L * 0.21, L * 0.235, H * 0.60))
    hx, hy = L * 0.235, H * 0.60
    s = H * 0.030
    corps.append('<g fill="#04070a"><circle cx="%.0f" cy="%.0f" r="%.0f"/>'
                 '<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" rx="%.0f"/>'
                 '<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" rx="3"/></g>'
                 % (hx, hy, s * 0.42,
                    hx - s * 0.45, hy + s * 0.35, s * 0.9, s * 1.5, s * 0.3,
                    hx - s * 1.3, hy + s * 0.7, s * 1.0, s * 0.26))
    return defs, ''.join(corps)


def sc_fracture(L, H):
    """Ville sous la pluie, nuit froide."""
    import random
    random.seed(11)
    hz = H * 0.74
    defs = (lin('ciel', [('0', '#0a0c14', '1'), ('0.6', '#161c2b', '1'), ('1', '#2b2230', '1')]) +
            lin('rue', [('0', '#14161f', '1'), ('1', '#050608', '1')]))
    corps = ['<rect width="%d" height="%d" fill="url(#ciel)"/>' % (L, H)]
    bx = 0
    while bx < L:
        w = L * random.uniform(0.05, 0.12)
        h = H * random.uniform(0.12, 0.40)
        corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" fill="#0a0d16"/>' % (bx, hz - h, w, h))
        for _ in range(int(h / (H * 0.03))):
            if random.random() > 0.55:
                corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" fill="#ffcf8a" fill-opacity="%.2f"/>'
                             % (bx + random.uniform(0.1, 0.8) * w, hz - h + random.uniform(0.05, 0.9) * h,
                                L * 0.009, H * 0.013, random.uniform(0.25, 0.7)))
        bx += w + L * 0.006
    corps.append('<rect x="0" y="%.0f" width="%d" height="%.0f" fill="url(#rue)"/>' % (hz, L, H - hz))
    # reflets
    for _ in range(14):
        x = random.uniform(0, L)
        corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="2" fill="#ffcf8a" fill-opacity="0.12"/>'
                     % (x, hz + random.uniform(0.02, 0.9) * (H - hz), L * random.uniform(0.02, 0.07)))
    # pluie
    for _ in range(120):
        x, y = random.uniform(-L * 0.05, L), random.uniform(0, H)
        ln = H * random.uniform(0.012, 0.03)
        corps.append('<path d="M%.0f %.0f l%.0f %.0f" stroke="#cfe0f5" stroke-opacity="%.2f" stroke-width="1.2"/>'
                     % (x, y, ln * 0.28, ln, random.uniform(0.07, 0.22)))
    return defs, ''.join(corps)


def sc_littoral(L, H):
    """Falaises, mer grise, digue."""
    hz = H * 0.52
    defs = (lin('ciel', [('0', '#2b3338', '1'), ('0.6', '#49565c', '1'), ('1', '#7a8a8d', '1')]) +
            lin('mer', [('0', '#394d55', '1'), ('1', '#0c1416', '1')]))
    corps = ['<rect width="%d" height="%d" fill="url(#ciel)"/>' % (L, H)]
    for i, y in enumerate([0.18, 0.28, 0.38]):
        corps.append('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" fill="#ffffff" fill-opacity="0.09"/>'
                     % (L * (0.28 + i * 0.2), H * y, L * 0.3, H * 0.014))
    corps.append('<rect x="0" y="%.0f" width="%d" height="%.0f" fill="url(#mer)"/>' % (hz, L, H - hz))
    for i in range(10):
        corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="2" fill="#b9ccd2" fill-opacity="%.2f"/>'
                     % (L * (0.02 + (i % 4) * 0.22), hz + (H - hz) * (0.06 + i * 0.085),
                        L * (0.2 + (i % 3) * 0.16), 0.16 - i * 0.012))
    # falaise a droite
    corps.append('<path d="M%d %.0f L%d %d L%.0f %d L%.0f %.0f Z" fill="#171d1f"/>'
                 % (L, H * 0.30, L, H, L * 0.58, H, L * 0.70, H * 0.34))
    corps.append('<path d="M%d %.0f L%d %.0f L%.0f %.0f Z" fill="#232b2d"/>'
                 % (L, H * 0.30, L, H * 0.62, L * 0.72, H * 0.46))
    # digue
    corps.append('<rect x="0" y="%.0f" width="%.0f" height="%.0f" fill="#0e1213"/>' % (hz + H * 0.14, L * 0.46, H * 0.028))
    for i in range(6):
        corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" fill="#0e1213"/>'
                     % (L * (0.02 + i * 0.08), hz + H * 0.168, L * 0.012, H * 0.05))
    return defs, ''.join(corps)


def sc_transit(L, H):
    """Quai souterrain, lumiere de tunnel."""
    defs = (lin('mur', [('0', '#1a1b20', '1'), ('1', '#08090c', '1')]) +
            rad('phare', [('0', '#ffe9bb', '0.95'), ('0.4', '#ffb15e', '0.35'), ('1', '#ffb15e', '0')], '0.5', '0.5', '0.5'))
    corps = ['<rect width="%d" height="%d" fill="url(#mur)"/>' % (L, H)]
    # tunnel en perspective
    cx, cy = L * 0.5, H * 0.46
    for i in range(7):
        k = 1.0 - i * 0.13
        w, h = L * 0.86 * k, H * 0.52 * k
        corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" rx="%.0f" fill="none" '
                     'stroke="#39404c" stroke-opacity="%.2f" stroke-width="2"/>'
                     % (cx - w / 2, cy - h / 2, w, h, w * 0.08, 0.5 - i * 0.05))
    corps.append('<circle cx="%.0f" cy="%.0f" r="%.0f" fill="url(#phare)"/>' % (cx, cy, H * 0.17))
    corps.append('<circle cx="%.0f" cy="%.0f" r="%.0f" fill="#fff3d6" fill-opacity="0.9"/>' % (cx, cy, H * 0.022))
    # quai
    corps.append('<rect x="0" y="%.0f" width="%d" height="%.0f" fill="#0b0c10"/>' % (H * 0.74, L, H * 0.26))
    corps.append('<rect x="0" y="%.0f" width="%d" height="3" fill="#ffd79a" fill-opacity="0.35"/>' % (H * 0.74, L))
    # silhouette d'attente
    sx, sy, s = L * 0.24, H * 0.74, H * 0.075
    corps.append('<g fill="#05060a"><circle cx="%.0f" cy="%.0f" r="%.0f"/>'
                 '<path d="M%.0f %.0f q%.0f %.0f %.0f %.0f l0 %.0f l%.0f 0 Z"/></g>'
                 % (sx, sy - s * 1.62, s * 0.26,
                    sx - s * 0.34, sy, 0, -s * 1.2, s * 0.68, 0, s * 1.2, -s * 0.68))
    return defs, ''.join(corps)


def sc_antichambre(L, H):
    """Couloir d'hotel, une porte eclairee."""
    defs = (lin('mur', [('0', '#2a2029', '1'), ('1', '#120d14', '1')]) +
            lin('tapis', [('0', '#3a1f26', '1'), ('1', '#150a0e', '1')]) +
            rad('lampe', [('0', '#ffd9a0', '0.8'), ('1', '#ffd9a0', '0')], '0.5', '0.5', '0.5'))
    cx, cy = L * 0.5, H * 0.46
    corps = ['<rect width="%d" height="%d" fill="url(#mur)"/>' % (L, H)]
    # perspective : lignes de fuite
    corps.append('<path d="M0 0 L%.0f %.0f L0 %d Z" fill="#1d1620"/>' % (cx * 0.72, cy, H))
    corps.append('<path d="M%d 0 L%.0f %.0f L%d %d Z" fill="#241b27"/>' % (L, cx * 1.28, cy, L, H))
    corps.append('<path d="M0 %d L%.0f %.0f L%.0f %.0f L%d %d Z" fill="url(#tapis)"/>'
                 % (H, cx * 0.72, cy + H * 0.14, cx * 1.28, cy + H * 0.14, L, H))
    # portes
    for i, k in enumerate([0.18, 0.40, 0.62]):
        w = L * (0.11 - i * 0.025)
        h = H * (0.34 - i * 0.075)
        x = L * (0.055 + i * 0.105)
        y = cy - h * 0.46
        corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" fill="#120c12"/>' % (x, y, w, h))
        x2 = L - x - w
        corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" fill="#150e15"/>' % (x2, y, w, h))
    # porte eclairee au fond
    dw, dh = L * 0.085, H * 0.17
    corps.append('<circle cx="%.0f" cy="%.0f" r="%.0f" fill="url(#lampe)"/>' % (cx, cy, H * 0.17))
    corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" fill="#0a070a"/>' % (cx - dw / 2, cy - dh * 0.5, dw, dh))
    corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" fill="#ffd9a0" fill-opacity="0.85"/>'
                 % (cx - dw / 2, cy + dh * 0.42, dw, H * 0.007))
    corps.append('<rect x="%.0f" y="%.0f" width="3" height="%.0f" fill="#ffd9a0" fill-opacity="0.5"/>'
                 % (cx + dw * 0.32, cy - dh * 0.02, H * 0.012))
    return defs, ''.join(corps)


def sc_latitude(L, H):
    """Bandes de paysages superposees, documentaire."""
    defs = lin('ciel', [('0', '#0d1a26', '1'), ('1', '#1d3140', '1')])
    corps = ['<rect width="%d" height="%d" fill="url(#ciel)"/>' % (L, H)]
    bandes = [('#20394a', 0.26), ('#2d5547', 0.42), ('#5a6b3c', 0.56), ('#7a6a3a', 0.69), ('#6b4630', 0.81), ('#2a1c16', 0.92)]
    for i, (c, y) in enumerate(bandes):
        yy = H * y
        corps.append('<path d="M0 %.0f Q%.0f %.0f %.0f %.0f T%d %.0f L%d %d L0 %d Z" fill="%s"/>'
                     % (yy, L * 0.3, yy - H * 0.035, L * 0.55, yy, L, yy - H * 0.02, L, H, H, c))
        corps.append('<path d="M0 %.0f Q%.0f %.0f %.0f %.0f T%d %.0f" fill="none" stroke="#ffffff" '
                     'stroke-opacity="0.12" stroke-width="2"/>'
                     % (yy, L * 0.3, yy - H * 0.035, L * 0.55, yy, L, yy - H * 0.02))
    # meridien
    corps.append('<circle cx="%.0f" cy="%.0f" r="%.0f" fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="2"/>'
                 % (L * 0.72, H * 0.22, H * 0.12))
    corps.append('<ellipse cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f" fill="none" stroke="#ffffff" '
                 'stroke-opacity="0.22" stroke-width="2"/>' % (L * 0.72, H * 0.22, H * 0.045, H * 0.12))
    corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="2" fill="#ffffff" fill-opacity="0.3"/>'
                 % (L * 0.72 - H * 0.12, H * 0.22, H * 0.24))
    return defs, ''.join(corps)


def sc_sentinelle(L, H):
    """Phare, faisceau dans la nuit."""
    import random
    random.seed(5)
    defs = (lin('ciel', [('0', '#07090f', '1'), ('1', '#141c28', '1')]) +
            lin('faisceau', [('0', '#ffe6b0', '0.42'), ('1', '#ffe6b0', '0')], '0', '0', '1', '0') +
            lin('mer', [('0', '#111c26', '1'), ('1', '#04070a', '1')]))
    hz = H * 0.76
    corps = ['<rect width="%d" height="%d" fill="url(#ciel)"/>' % (L, H)]
    for _ in range(50):
        corps.append('<circle cx="%.0f" cy="%.0f" r="%.1f" fill="#ffffff" fill-opacity="%.2f"/>'
                     % (random.uniform(0, L), random.uniform(0, hz * 0.8),
                        random.uniform(0.6, 1.5), random.uniform(0.15, 0.6)))
    lx, ly = L * 0.30, H * 0.26
    # faisceaux
    corps.append('<path d="M%.0f %.0f L%d %.0f L%d %.0f Z" fill="url(#faisceau)"/>' % (lx, ly, L, H * 0.02, L, H * 0.44))
    corps.append('<path d="M%.0f %.0f L0 %.0f L0 %.0f Z" fill="url(#faisceau)" opacity="0.5"/>' % (lx, ly, H * 0.16, H * 0.40))
    # phare
    corps.append('<g fill="#06080c">'
                 '<path d="M%.0f %.0f L%.0f %.0f L%.0f %.0f L%.0f %.0f Z"/>'
                 '<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f"/>'
                 '<path d="M%.0f %.0f L%.0f %.0f L%.0f %.0f Z"/></g>'
                 % (lx - L * 0.045, hz, lx - L * 0.028, ly + H * 0.03,
                    lx + L * 0.028, ly + H * 0.03, lx + L * 0.045, hz,
                    lx - L * 0.034, ly - H * 0.012, L * 0.068, H * 0.045,
                    lx - L * 0.040, ly - H * 0.012, lx, ly - H * 0.055, lx + L * 0.040, ly - H * 0.012))
    corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="%.0f" fill="#ffe6b0" fill-opacity="0.92"/>'
                 % (lx - L * 0.020, ly + H * 0.002, L * 0.040, H * 0.026))
    corps.append('<rect x="0" y="%.0f" width="%d" height="%.0f" fill="url(#mer)"/>' % (hz, L, H - hz))
    for i in range(8):
        corps.append('<rect x="%.0f" y="%.0f" width="%.0f" height="2" fill="#9fb6cc" fill-opacity="%.2f"/>'
                     % (L * (0.05 + (i % 3) * 0.28), hz + (H - hz) * (0.08 + i * 0.1),
                        L * (0.18 + (i % 4) * 0.12), 0.18 - i * 0.015))
    return defs, ''.join(corps)


# =================================================================
#  TUILES D'APPLICATIONS — glyphes originaux, aucun logo reproduit
# =================================================================
def tuile(nom, c1, c2, glyphe):
    svg = u'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
<defs>
  <linearGradient id="f" x1="0" y1="0" x2="0.35" y2="1">
    <stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/>
  </linearGradient>
  <linearGradient id="l" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffffff" stop-opacity="0.20"/>
    <stop offset="0.48" stop-color="#ffffff" stop-opacity="0.03"/>
    <stop offset="1" stop-color="#000000" stop-opacity="0.22"/>
  </linearGradient>
</defs>
<rect width="240" height="240" rx="54" ry="54" fill="url(#f)"/>
<rect width="240" height="240" rx="54" ry="54" fill="url(#l)"/>
<g fill="#ffffff" fill-opacity="0.95">%s</g>
</svg>
''' % (c1, c2, glyphe)
    ecrire('assets/icons/%s.svg' % nom, svg)


def construire_tuiles():
    # Netflix : trois montants, celui du milieu en diagonale
    tuile('app-netflix', '#c0161d', '#5c0509',
          '<rect x="74" y="62" width="22" height="116" rx="3"/>'
          '<rect x="144" y="62" width="22" height="116" rx="3"/>'
          '<path d="M96 62 L118 62 L166 178 L144 178 Z" fill-opacity="0.62"/>')
    # YouTube : bouton de lecture generique
    tuile('app-youtube', '#d82824', '#6b0d0b',
          '<rect x="52" y="76" width="136" height="88" rx="26"/>'
          '<path d="M107 102 L107 138 L139 120 Z" fill="#b91f1c"/>')
    # Disney+ : etoile filante
    tuile('app-disney', '#2f6bd8', '#0d1c4e',
          '<path d="M120 58 L132 101 L176 103 L141 129 L153 172 L120 146 L87 172 L99 129 L64 103 L108 101 Z"/>'
          '<path d="M44 160 q76 34 152 0" fill="none" stroke="#ffffff" stroke-opacity="0.55" '
          'stroke-width="7" stroke-linecap="round"/>')
    # Prime Video : lecture dans un cercle + sourire
    tuile('app-prime', '#1a9fd0', '#063347',
          '<circle cx="120" cy="108" r="46" fill="none" stroke="#ffffff" stroke-width="8"/>'
          '<path d="M109 90 L109 126 L140 108 Z"/>'
          '<path d="M56 152 q64 36 128 0" fill="none" stroke="#ffffff" stroke-opacity="0.65" '
          'stroke-width="9" stroke-linecap="round"/>')
    # Spotify : egaliseur
    tuile('app-spotify', '#20c45c', '#064d26',
          '<rect x="62" y="104" width="18" height="52" rx="9"/>'
          '<rect x="92" y="78" width="18" height="78" rx="9"/>'
          '<rect x="122" y="60" width="18" height="96" rx="9"/>'
          '<rect x="152" y="92" width="18" height="64" rx="9"/>'
          '<rect x="52" y="172" width="136" height="10" rx="5" fill-opacity="0.45"/>')
    # TF1+ : plus
    tuile('app-tf1', '#4453c4', '#131a4e',
          '<rect x="104" y="56" width="32" height="128" rx="16"/>'
          '<rect x="56" y="104" width="128" height="32" rx="16"/>')
    # Navigateur : globe
    tuile('app-browser', '#5a6880', '#1b2029',
          '<g fill="none" stroke="#ffffff" stroke-width="8">'
          '<circle cx="120" cy="120" r="62"/>'
          '<ellipse cx="120" cy="120" rx="26" ry="62"/>'
          '<path d="M58 120 L182 120 M70 86 q50 22 100 0 M70 154 q50 -22 100 0"/></g>')
    # HDMI : connecteur
    tuile('app-hdmi', '#4a5260', '#171a20',
          '<path d="M52 92 L188 92 L188 126 L168 148 L72 148 L52 126 Z" fill="none" '
          'stroke="#ffffff" stroke-width="8" stroke-linejoin="round"/>'
          '<rect x="76" y="106" width="14" height="16" rx="3"/>'
          '<rect x="104" y="106" width="14" height="16" rx="3"/>'
          '<rect x="132" y="106" width="14" height="16" rx="3"/>'
          '<rect x="160" y="106" width="8" height="16" rx="3"/>')


# =================================================================
#  LOGO
# =================================================================
def construire_logo():
    svg = u'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 88" width="560" height="88">
<defs>
  <linearGradient id="g" x1="0" y1="0" x2="0.9" y2="1">
    <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#9fadc0"/>
  </linearGradient>
</defs>
<g fill="none" stroke="url(#g)" stroke-width="4" stroke-linecap="square">
  <path d="M14 66 L14 22 L46 22"/><path d="M14 44 L40 44"/>
</g>
<text x="64" y="52" font-family="%s" font-size="34" letter-spacing="10"
      fill="url(#g)" font-weight="200">EDENWOOD</text>
<text x="66" y="76" font-family="%s" font-size="12.5" letter-spacing="7.5"
      fill="#7b8698" font-weight="400">APPLE TV</text>
</svg>
''' % (POLICE, POLICE)
    ecrire('assets/logos/edenwood.svg', svg)


# =================================================================
#  PRODUCTION
# =================================================================
SCENES = {
    'horizon': sc_horizon, 'sillage': sc_sillage, 'oasis': sc_oasis, 'nadir': sc_nadir,
    'acier': sc_acier, 'vertige': sc_vertige, 'fracture': sc_fracture,
    'littoral': sc_littoral, 'transit': sc_transit, 'antichambre': sc_antichambre,
    'latitude': sc_latitude, 'sentinelle': sc_sentinelle,
}

AFFICHES = [
    ('film-horizon', 'horizon', 'Horizon'), ('film-sillage', 'sillage', 'Sillage'),
    ('film-acier', 'acier', 'Acier'), ('film-oasis', 'oasis', 'Oasis'),
    ('film-vertige', 'vertige', 'Vertige'), ('film-nadir', 'nadir', 'Nadir'),
    ('serie-fracture', 'fracture', 'Fracture'), ('serie-littoral', 'littoral', 'Littoral'),
    ('serie-transit', 'transit', 'Transit'), ('serie-antichambre', 'antichambre', 'Antichambre'),
    ('serie-latitude', 'latitude', 'Latitude'), ('serie-sentinelle', 'sentinelle', 'Sentinelle'),
]

BANNIERES = ['horizon', 'sillage', 'oasis', 'nadir', 'antichambre', 'sentinelle']


def main():
    for fichier, scene, titre in AFFICHES:
        defs, corps = SCENES[scene](600, 900)
        affiche(fichier, titre, defs, corps)
    for scene in BANNIERES:
        defs, corps = SCENES[scene](BAN_L, BAN_H)
        banniere('hero-%s' % scene, defs, corps)
    construire_tuiles()
    construire_logo()
    print('%d affiches, %d bannieres, 8 tuiles, 1 logo.' % (len(AFFICHES), len(BANNIERES)))


if __name__ == '__main__':
    main()
