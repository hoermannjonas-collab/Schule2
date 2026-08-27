#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Schneidet die Grafiken aus einem Referenzblatt der Lehrkraft aus, stellt sie
frei und legt sie in assets/ ab.

Aufruf:  python3 tools/icons_extrahieren.py <referenzblatt.png>

Die Koordinaten in KARTE beziehen sich auf das Blatt
"MARKT – ANGEBOT & NACHFRAGE / ALLE ELEMENTE ALS EINZELNE VORLAGE" (1536×1024).
Für ein anderes Blatt müssen sie angepasst werden.
"""
import os, sys
from collections import deque
from PIL import Image

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def freistellen(bild, tol=16):
    """Weißen Panel-Hintergrund vom Rand her entfernen."""
    b = bild.copy(); px = b.load(); w, h = b.size
    weiss = lambda p: p[0] > 255-tol and p[1] > 255-tol and p[2] > 255-tol
    frei = [[False]*w for _ in range(h)]; q = deque()
    def saat(x, y):
        if not frei[y][x] and weiss(px[x, y]): frei[y][x] = True; q.append((x, y))
    for x in range(w): saat(x, 0); saat(x, h-1)
    for y in range(h): saat(0, y); saat(w-1, y)
    while q:
        x, y = q.popleft()
        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx, ny = x+dx, y+dy
            if 0 <= nx < w and 0 <= ny < h and not frei[ny][nx] and weiss(px[nx, ny]):
                frei[ny][nx] = True; q.append((nx, ny))
    for y in range(h):
        for x in range(w):
            if frei[y][x]: px[x, y] = (0, 0, 0, 0)
    return b

def groesste(bild):
    """Nur den größten zusammenhängenden Bereich behalten (entfernt Textreste)."""
    px = bild.load(); w, h = bild.size
    gesehen = [[False]*w for _ in range(h)]; best = []
    for sy in range(h):
        for sx in range(w):
            if gesehen[sy][sx] or px[sx, sy][3] == 0: continue
            q = deque([(sx, sy)]); gesehen[sy][sx] = True; z = []
            while q:
                x, y = q.popleft(); z.append((x, y))
                for dx in (-2,-1,0,1,2):
                    for dy in (-2,-1,0,1,2):
                        nx, ny = x+dx, y+dy
                        if 0 <= nx < w and 0 <= ny < h and not gesehen[ny][nx] and px[nx, ny][3]:
                            gesehen[ny][nx] = True; q.append((nx, ny))
            if len(z) > len(best): best = z
    b = bild.copy(); bpx = b.load(); behalten = set(best)
    for y in range(h):
        for x in range(w):
            if (x, y) not in behalten: bpx[x, y] = (0, 0, 0, 0)
    k = b.getbbox(); return b.crop(k) if k else b

def speichere(bild, pfad, hoehe=None, maxkante=None, farben=64):
    os.makedirs(os.path.dirname(pfad), exist_ok=True)
    if hoehe and bild.height != hoehe:
        bild = bild.resize((max(1, round(bild.width * hoehe / bild.height)), hoehe), Image.LANCZOS)
    if maxkante and max(bild.size) > maxkante:
        bild.thumbnail((maxkante, maxkante), Image.LANCZOS)
    alpha = bild.split()[3]
    q = bild.convert('RGB').quantize(colors=farben, method=Image.MEDIANCUT).convert('RGBA')
    q.putalpha(alpha); q.save(pfad, optimize=True)
    return bild.size

# name -> (Ausschnitt, Zielordner, Optionen)
KARTE = {}
def eintrag(name, box, ordner='icons', **opt): KARTE[name] = (box, ordner, opt)

# 1. Produkt-Icons (3 Zeilen × 4 Spalten)
_p_namen = [['smartphone','kaffee','fahrrad','wohnung'],
            ['schokolade','konsole','kleidung','kinoticket'],
            ['hotel','flugreise','restaurant','buch']]
for r, (y0, y1) in enumerate([(118,210),(230,322),(342,434)]):
    for c, (x0, x1) in enumerate([(20,116),(117,213),(214,311),(312,424)]):
        eintrag(_p_namen[r][c], (x0, y0, x1, y1), maxkante=96)

# 4. Akteure (2 Zeilen × 4 Spalten)
_a_namen = [['haushalte','unternehmen','staat','banken'],
            ['lieferant','tourist','haendler','investor']]
for r, (y0, y1) in enumerate([(505,573),(608,683)]):
    for c, (x0, x1) in enumerate([(30,105),(112,190),(192,265),(268,340)]):
        eintrag(_a_namen[r][c], (x0, y0, x1, y1), maxkante=96)

# 6. Symbole und UI-Icons (4 Zeilen)
for name, box in [('muenze',(593,527,624,562)), ('aktentasche',(623,528,672,562)),
                  ('puzzle',(668,528,711,562)), ('tausch',(702,528,748,562)),
                  ('herz',(591,572,631,606)), ('trend',(626,572,668,608)),
                  ('stern',(668,572,706,607)), ('info',(705,572,746,606)),
                  ('frage',(591,614,630,647)), ('hakenKreis',(625,614,670,647)),
                  ('haken',(671,615,706,646)), ('pfeilAb',(713,614,741,647)),
                  ('zahnrad',(593,655,629,687)), ('schloss',(668,655,705,686))]:
    eintrag(name, box, maxkante=48, farben=32)

# 2. Markt-Welt: Ebene 2 ist der menschenleere Marktplatz
eintrag('marktwelt-hintergrund', (448,267,735,362), 'marktwelt', roh=True, farben=192)

# 13. Pixel-Charaktere als Kundschaft (auf Szenengröße gebracht)
for i, (x0, x1) in enumerate([(500,545),(548,594),(596,642),(644,690)]):
    eintrag('marktwelt-figur-%d' % (i+1), (x0, 925, x1, 1000), 'marktwelt', hoehe=47)

# 15. Warenkiste und Lieferung für die Angebotsseite
eintrag('marktwelt-kiste', (1170,952,1210,998), 'marktwelt', hoehe=22)
eintrag('marktwelt-lkw', (1278,948,1345,1000), 'marktwelt', hoehe=30)

def main():
    quelle = sys.argv[1] if len(sys.argv) > 1 else None
    if not quelle or not os.path.exists(quelle):
        sys.exit('Aufruf: python3 tools/icons_extrahieren.py <referenzblatt.png>')
    blatt = Image.open(quelle).convert('RGBA')
    for name, (box, ordner, opt) in KARTE.items():
        aus = blatt.crop(box)
        if not opt.pop('roh', False):
            aus = groesste(freistellen(aus))
        pfad = os.path.join(WURZEL, 'assets', ordner, name + '.png')
        groesse = speichere(aus, pfad, **opt)
        print('%-24s %-10s %s' % (name, ordner, groesse))
    print('%d Grafiken geschrieben' % len(KARTE))

if __name__ == '__main__':
    main()
