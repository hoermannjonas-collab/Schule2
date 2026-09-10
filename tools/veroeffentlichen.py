#!/usr/bin/env python3
"""Kopiert die Schülerseiten nach docs/.

GitHub Pages ist für dieses Repository auf den Ordner `docs/` eingestellt.
Alles, was ausserhalb von `docs/` liegt, wird nicht ausgeliefert – ein Link
darauf ergibt 404. Dieses Skript spiegelt die fertigen Seiten dorthin.

    python3 tools/veroeffentlichen.py

Nach jeder Änderung an einer der unten gelisteten Dateien ausführen.
"""

import shutil
import sys
from pathlib import Path

WURZEL = Path(__file__).resolve().parent.parent
DOCS = WURZEL / 'docs'

# Dateien, die Schülerinnen und Schüler aufrufen sollen.
SEITEN = [
    'markt-simulator.html',
    'markt-simulator-offline.html',
    'index.html',
    'sortimentspyramide_random.html',
]


def kopiere(name: str) -> int:
    quelle = WURZEL / name
    if not quelle.exists():
        print(f'  fehlt:  {name}')
        return 0
    ziel = DOCS / name
    if ziel.exists() and ziel.read_bytes() == quelle.read_bytes():
        print(f'  gleich: {name}')
        return 0
    ziel.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(quelle, ziel)
    print(f'  neu:    {name}  ({quelle.stat().st_size // 1024} KB)')
    return 1


def main() -> int:
    if not DOCS.exists():
        print('docs/ existiert nicht – GitHub Pages steht auf diesem Ordner.')
        return 1
    print('Veröffentliche nach docs/ :')
    geaendert = sum(kopiere(n) for n in SEITEN)
    print(f'{geaendert} Datei(en) aktualisiert.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
