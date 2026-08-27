# -*- coding: utf-8 -*-
"""Schneidet die Icons aus dem Referenzbild aus, stellt sie frei und speichert sie einzeln."""
from PIL import Image
from collections import deque
import os

QUELLE = '/root/.claude/uploads/3781e9a3-82d6-5b52-a38e-e673a6eb16d3/26fcf35e-image.png'
ZIEL = '/home/user/Schule2/assets/icons'
os.makedirs(ZIEL, exist_ok=True)
im = Image.open(QUELLE).convert('RGBA')

def freistellen(bild, toleranz=26):
    """Hintergrund vom Rand her freistellen (nur zusammenhängende Randfläche)."""
    b = bild.copy(); px = b.load(); w, h = b.size
    ecken = [px[0,0], px[w-1,0], px[0,h-1], px[w-1,h-1]]
    grund = max(set(ecken), key=ecken.count)
    def nah(p): return all(abs(p[i]-grund[i]) <= toleranz for i in range(3))
    besucht = [[False]*w for _ in range(h)]
    q = deque()
    for x in range(w):
        for y in (0, h-1):
            if nah(px[x,y]): q.append((x,y)); besucht[y][x] = True
    for y in range(h):
        for x in (0, w-1):
            if nah(px[x,y]) and not besucht[y][x]: q.append((x,y)); besucht[y][x] = True
    while q:
        x, y = q.popleft()
        px[x,y] = (0,0,0,0)
        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx, ny = x+dx, y+dy
            if 0 <= nx < w and 0 <= ny < h and not besucht[ny][nx] and nah(px[nx,ny]):
                besucht[ny][nx] = True; q.append((nx,ny))
    return b

def zuschneiden(bild):
    k = bild.getbbox()
    return bild.crop(k) if k else bild

def quadratisch(bild, rand=2):
    w, h = bild.size
    s = max(w, h) + rand*2
    neu = Image.new('RGBA', (s, s), (0,0,0,0))
    neu.paste(bild, ((s-w)//2, (s-h)//2))
    return neu

def hole(name, box):
    aus = quadratisch(zuschneiden(freistellen(im.crop(box))))
    aus.save(os.path.join(ZIEL, name + '.png'))
    return name, aus.size

# --- Produktkarten: 4 Spalten × 2 Zeilen, Beschriftung oben, Motiv darunter ---
sx = [12, 130, 248, 369]; sb = 112
sy = [71, 258]; sh = 170
produkte = [['smartphones','kaffee','fahrraeder','wohnungen'],
            ['schokolade','konsolen','kleidung','kinotickets']]
ergebnis = []
for r, zeile in enumerate(produkte):
    for c, name in enumerate(zeile):
        ergebnis.append(hole(name, (sx[c]+4, sy[r]+42, sx[c]+sb-4, sy[r]+sh-6)))

# --- Marktteilnehmer: 3 Spalten × 2 Zeilen, Motiv oben, Text darunter ---
mx = [16, 178, 340]; mb = 150
my = [(508, 604), (676, 782)]
teilnehmer = [['haushalte','unternehmen','staat'], ['banken','ausland','finanzmaerkte']]
for r, zeile in enumerate(teilnehmer):
    for c, name in enumerate(zeile):
        y0, y1 = my[r]
        ergebnis.append(hole(name, (mx[c], y0, mx[c]+mb, y1)))

for n, s in ergebnis: print('%-14s %s' % (n, s))
