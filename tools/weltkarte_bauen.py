#!/usr/bin/env python3
"""Baut `weltkarte-klasse.html` aus Vorlage und Natural-Earth-Daten.

Die fertige Seite ist eine einzelne HTML-Datei ohne Build-Schritt und ohne
Internetverbindung: Ländergrenzen, Namen und Beschriftungspunkte stecken als
Datenliteral in der Datei.

    python3 tools/weltkarte_bauen.py

Quelle der Grenzen: Natural Earth, `ne_50m_admin_0_countries` (Public Domain).
Die 50m-Auflösung wird verwendet, weil die 110m-Fassung sämtliche Kleinstaaten
weglässt (Monaco, San Marino, Malta, Liechtenstein, Vatikanstadt …), die im
Unterricht aber vorkommen sollen.

Ablauf:

1. GeoJSON laden (einmalig in `tools/cache/` zwischengespeichert)
2. Punkte mit der Projektion Natural Earth 1 in Kartenkoordinaten umrechnen
3. Koordinaten auf ein ganzzahliges Raster runden und als SVG-Pfad mit
   relativen Schritten schreiben – das hält die Datei klein und lässt
   gemeinsame Grenzen exakt aufeinanderliegen
4. Vorlage `tools/weltkarte_vorlage.html` füllen und Datei schreiben
"""

import json
import math
import re
import sys
import urllib.request
from pathlib import Path

WURZEL = Path(__file__).resolve().parent.parent
CACHE = WURZEL / 'tools' / 'cache'
VORLAGE = WURZEL / 'tools' / 'weltkarte_vorlage.html'
ZIEL = WURZEL / 'weltkarte-klasse.html'

QUELLE = ('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/'
          'master/geojson/ne_50m_admin_0_countries.geojson')

# Breite des ganzzahligen Rasters. Je größer der Wert, desto feiner die
# Grenzen beim starken Hineinzoomen; die Pfadlänge wächst kaum mit, weil die
# Schritte relativ notiert werden.
RASTER = 1000000

# Nicht auf der Karte: die Antarktis (laut Auftrag) und Flächen, die keine
# Länder sind.
WEGLASSEN = {'Antarctica', 'Siachen Glacier'}

# Natural Earth führt einige Staaten unter ihrem amtlichen Langnamen, einige
# Namen sind für die Beschriftung zu lang. Schlüssel ist das Feld ADMIN, das
# jedes Gebiet eindeutig bezeichnet – nicht SOVEREIGNT, sonst bekämen alle
# Überseegebiete den Namen ihres Mutterlandes.
NAMEN = {
    'China': 'China',
    'Taiwan': 'Taiwan',
    'Cyprus': 'Zypern',
    'Northern Cyprus': 'Nordzypern',
    'Federated States of Micronesia': 'Mikronesien',
    'Cayman Islands': 'Kaimaninseln',
    'Democratic Republic of the Congo': 'DR Kongo',
    'Republic of the Congo': 'Kongo',
    'Moldova': 'Moldau',
    'Saint Pierre and Miquelon': 'St. Pierre und Miquelon',
    'Saint Barthelemy': 'St. Barthélemy',
    'Saint Martin': 'St. Martin',
    'Bosnia and Herzegovina': 'Bosnien-Herzegowina',
    'British Indian Ocean Territory': 'Brit. Ind.-Ozean-Territorium',
    'French Southern and Antarctic Lands': 'Französische Südgebiete',
    'Indian Ocean Territories': 'Austral. Inseln im Ind. Ozean',
    'South Georgia and the Islands': 'Südgeorgien',
    'Central African Republic': 'Zentralafrikan. Republik',
    'United Arab Emirates': 'Ver. Arabische Emirate',
    'Saint Vincent and the Grenadines': 'St. Vincent u. d. Grenadinen',
    'United States Virgin Islands': 'Amerik. Jungferninseln',
    'British Virgin Islands': 'Brit. Jungferninseln',
    'Northern Mariana Islands': 'Nördliche Marianen',
}


# ---------------------------------------------------------------- Projektion

def natural_earth(lam_grad, phi_grad):
    """Projektion Natural Earth 1 – dieselbe Formel wie d3.geoNaturalEarth1."""
    lam = math.radians(lam_grad)
    phi = math.radians(phi_grad)
    p2 = phi * phi
    p4 = p2 * p2
    x = lam * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4)))
    y = phi * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)))
    return x, y


# ------------------------------------------------------------------ Hilfsteil

def lade_quelle():
    CACHE.mkdir(parents=True, exist_ok=True)
    datei = CACHE / 'ne_50m_admin_0_countries.geojson'
    if not datei.exists():
        print(f'lade {QUELLE}')
        with urllib.request.urlopen(QUELLE, timeout=300) as antwort:
            datei.write_bytes(antwort.read())
    return json.loads(datei.read_text(encoding='utf-8'))


def polygone(geometrie):
    """Liefert jede Fläche als Liste von Ringen (äußerer Ring zuerst)."""
    art = geometrie['type']
    if art == 'Polygon':
        return [geometrie['coordinates']]
    if art == 'MultiPolygon':
        return geometrie['coordinates']
    return []


def ringflaeche(ring):
    """Doppelte Fläche eines geschlossenen Rings (Schnürsenkelformel)."""
    summe = 0.0
    for i in range(len(ring) - 1):
        x1, y1 = ring[i]
        x2, y2 = ring[i + 1]
        summe += x1 * y2 - x2 * y1
    return abs(summe) / 2


def schwerpunkt(ring):
    flaeche = 0.0
    cx = cy = 0.0
    for i in range(len(ring) - 1):
        x1, y1 = ring[i]
        x2, y2 = ring[i + 1]
        f = x1 * y2 - x2 * y1
        flaeche += f
        cx += (x1 + x2) * f
        cy += (y1 + y2) * f
    if abs(flaeche) < 1e-12:
        xs = [p[0] for p in ring]
        ys = [p[1] for p in ring]
        return sum(xs) / len(xs), sum(ys) / len(ys)
    flaeche *= 0.5
    return cx / (6 * flaeche), cy / (6 * flaeche)


def zahl(n):
    return str(int(n))


# ----------------------------------------------------------------- Hauptteil

def main():
    daten = lade_quelle()

    # Schritt 1: alle Punkte projizieren und den Ausschnitt bestimmen.
    laender = []
    xmin = ymin = float('inf')
    xmax = ymax = float('-inf')

    for merkmal in daten['features']:
        eig = merkmal['properties']
        if eig.get('SOVEREIGNT') in WEGLASSEN or eig.get('NAME') in WEGLASSEN:
            continue

        flaechen = []
        for polygon in polygone(merkmal['geometry']):
            ringe = []
            for ring in polygon:
                punkte = [natural_earth(lon, lat) for lon, lat in ring]
                if len(punkte) >= 4:
                    ringe.append(punkte)
            if ringe:
                flaechen.append(ringe)
        if not flaechen:
            continue

        for ringe in flaechen:
            for punkt in ringe[0]:
                xmin = min(xmin, punkt[0])
                xmax = max(xmax, punkt[0])
                ymin = min(ymin, punkt[1])
                ymax = max(ymax, punkt[1])

        laender.append((eig, flaechen))

    # Schritt 2: Maßstab auf das Raster. y wird nach unten positiv gezählt.
    breite_welt = xmax - xmin
    mass = RASTER / breite_welt
    hoehe = int(round((ymax - ymin) * mass))

    def raster(punkt):
        return (round((punkt[0] - xmin) * mass), round((ymax - punkt[1]) * mass))

    eintraege = []
    punkte_gesamt = 0

    offen = set(NAMEN)
    for eig, flaechen in laender:
        offen.discard(eig.get('ADMIN'))
        name = NAMEN.get(eig.get('ADMIN')) or eig['NAME_DE']

        teile = []
        bx0 = by0 = 10 ** 9
        bx1 = by1 = -10 ** 9
        groesster_ring = None
        groesste_flaeche = -1.0
        max_diagonale = 0
        flaeche_gesamt = 0.0

        for ringe in flaechen:
            rx0 = ry0 = 10 ** 9
            rx1 = ry1 = -10 ** 9
            for nummer, ring in enumerate(ringe):
                gerastert = []
                letzter = None
                for punkt in ring:
                    p = raster(punkt)
                    if p != letzter:
                        gerastert.append(p)
                        letzter = p
                if len(gerastert) < 3:
                    continue
                if gerastert[0] != gerastert[-1]:
                    gerastert.append(gerastert[0])
                if len(gerastert) < 4:
                    continue

                # Pfad mit relativen Schritten – kurze Zahlen, kleine Datei.
                stueck = ['M', zahl(gerastert[0][0]), ' ', zahl(gerastert[0][1]), 'l']
                vx, vy = gerastert[0]
                for x, y in gerastert[1:-1]:
                    dx, dy = x - vx, y - vy
                    stueck.append(zahl(dx))
                    if dy >= 0:
                        stueck.append(' ')
                    stueck.append(zahl(dy))
                    stueck.append(' ')
                    vx, vy = x, y
                    punkte_gesamt += 1
                if stueck[-1] == ' ':
                    stueck.pop()
                if stueck[-1] == 'l':
                    stueck.pop()
                teile.append(''.join(stueck) + 'z')

                if nummer == 0:
                    flaeche = ringflaeche(gerastert)
                    flaeche_gesamt += flaeche
                    if flaeche > groesste_flaeche:
                        groesste_flaeche = flaeche
                        groesster_ring = gerastert
                    for x, y in gerastert:
                        rx0, ry0 = min(rx0, x), min(ry0, y)
                        rx1, ry1 = max(rx1, x), max(ry1, y)
            if rx1 > rx0 or ry1 > ry0:
                bx0, by0 = min(bx0, rx0), min(by0, ry0)
                bx1, by1 = max(bx1, rx1), max(by1, ry1)
                diagonale = math.hypot(rx1 - rx0, ry1 - ry0)
                max_diagonale = max(max_diagonale, diagonale)

        if not teile or groesster_ring is None:
            continue

        # Beschriftungspunkt: Natural Earth liefert für fast jedes Land einen
        # gesetzten Punkt; sonst der Schwerpunkt der größten Fläche.
        if eig.get('LABEL_X') is not None and eig.get('LABEL_Y') is not None:
            anker = raster(natural_earth(eig['LABEL_X'], eig['LABEL_Y']))
            if not (bx0 - 5 <= anker[0] <= bx1 + 5 and by0 - 5 <= anker[1] <= by1 + 5):
                anker = schwerpunkt(groesster_ring)
        else:
            anker = schwerpunkt(groesster_ring)

        eintraege.append({
            'id': eig.get('ADM0_A3') or eig.get('ISO_A3') or eig['NAME'],
            'n': name,
            'd': ''.join(teile),
            'x': int(round(anker[0])),
            'y': int(round(anker[1])),
            'r': int(eig.get('LABELRANK') or 6),
            'g': int(round(max_diagonale)),
            'f': round(math.sqrt(max(flaeche_gesamt, 1.0)), 1),
        })

    # Doppelte Kennungen (Natural Earth vergibt -99) eindeutig machen.
    gesehen = {}
    for eintrag in eintraege:
        kennung = eintrag['id']
        if kennung in gesehen or kennung == '-99':
            gesehen[kennung] = gesehen.get(kennung, 0) + 1
            eintrag['id'] = f"{kennung}{gesehen[kennung]}"
        else:
            gesehen[kennung] = 0

    # Beschriftungsreihenfolge: erst die von Natural Earth als wichtig
    # eingestuften, innerhalb einer Stufe die flächengrößten.
    eintraege.sort(key=lambda e: (e['r'], -e['f']))

    inhalt = ','.join(
        '{{i:"{i}",n:"{n}",x:{x},y:{y},r:{r},g:{g},d:"{d}"}}'.format(
            i=e['id'], n=e['n'].replace('"', '\\"'), x=e['x'], y=e['y'],
            r=e['r'], g=e['g'], d=e['d'])
        for e in eintraege)

    vorlage = VORLAGE.read_text(encoding='utf-8')
    for platzhalter, wert in (
        ('/*__LAENDER__*/', '[' + inhalt + ']'),
        ('/*__BREITE__*/', str(RASTER)),
        ('/*__HOEHE__*/', str(hoehe)),
    ):
        if platzhalter not in vorlage:
            print(f'Platzhalter fehlt in der Vorlage: {platzhalter}')
            return 1
        vorlage = vorlage.replace(platzhalter, wert)

    ZIEL.write_text(vorlage, encoding='utf-8')

    if offen:
        print('Warnung: kein Land zu diesen Einträgen in NAMEN: ' + ', '.join(sorted(offen)))
    doppelt = {}
    for eintrag in eintraege:
        doppelt.setdefault(eintrag['n'], []).append(eintrag['id'])
    for name, kennungen in doppelt.items():
        if len(kennungen) > 1:
            print(f'Warnung: Name doppelt vergeben: {name} ({", ".join(kennungen)})')

    print(f'{len(eintraege)} Länder, {punkte_gesamt} Punkte')
    print(f'Karte {RASTER} x {hoehe} Rastereinheiten')
    print(f'{ZIEL.name}: {ZIEL.stat().st_size // 1024} KB')
    return 0


if __name__ == '__main__':
    sys.exit(main())
