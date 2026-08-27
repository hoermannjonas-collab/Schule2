#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bettet die Bilddateien aus assets/icons/ als Daten-URIs in markt-simulator.html ein.

Damit bleibt der Simulator eine einzige, eigenständige HTML-Datei und verwendet
trotzdem exakt die hinterlegten Grafiken.

Aufruf:  python3 tools/icons_einbetten.py

Neues Icon hinzufügen oder austauschen:
  1. PNG mit transparentem Hintergrund nach assets/icons/ legen
  2. Dateiname = Schlüssel im Code, z. B. smartphone.png, haushalte.png
  3. dieses Skript ausführen
Ein hinterlegtes Bild hat immer Vorrang vor der gezeichneten Pixelgrafik.
"""
import base64, glob, os, re, sys

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORDNER = os.path.join(WURZEL, 'assets', 'icons')
ZIEL = os.path.join(WURZEL, 'markt-simulator.html')
ANFANG, ENDE = '/* BILDER-ANFANG */', '/* BILDER-ENDE */'

def main():
    eintraege = []
    for pfad in sorted(glob.glob(os.path.join(ORDNER, '*.png'))):
        name = os.path.splitext(os.path.basename(pfad))[0]
        with open(pfad, 'rb') as f:
            b64 = base64.b64encode(f.read()).decode('ascii')
        eintraege.append("  %s: 'data:image/png;base64,%s'," % (name, b64))

    block = (ANFANG + "\n// Hinterlegte Bilddateien aus assets/icons/ – erzeugt von tools/icons_einbetten.py.\n"
             "// Nicht von Hand bearbeiten: Änderungen an den Grafiken gehören in assets/icons/.\n"
             "const BILDER = {\n" + "\n".join(eintraege) + "\n};\n" + ENDE)

    html = open(ZIEL, encoding='utf-8').read()
    if ANFANG not in html or ENDE not in html:
        sys.exit('Markierungen %s / %s fehlen in %s' % (ANFANG, ENDE, ZIEL))
    neu = re.sub(re.escape(ANFANG) + r'.*?' + re.escape(ENDE), lambda m: block, html, flags=re.S)
    open(ZIEL, 'w', encoding='utf-8').write(neu)
    kb = sum(os.path.getsize(p) for p in glob.glob(os.path.join(ORDNER, '*.png'))) / 1024
    print('%d Bilder eingebettet (%d KB Quellgröße)' % (len(eintraege), round(kb)))

if __name__ == '__main__':
    main()
