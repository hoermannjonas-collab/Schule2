# Schule2 – Hinweise für die Arbeit an diesem Repository

Unterrichtsmaterial für berufliche Schulen in Bayern. Jede Datei ist eine
eigenständige HTML-Seite, die ohne Installation im Browser läuft und über
GitHub Pages erreichbar ist.

## Grafiken – verbindlich

**In `assets/icons/` liegen die hinterlegten Bilddateien. Diese sind maßgeblich.
Sie dürfen nicht nachgezeichnet, nachempfunden oder durch selbst erzeugte
Grafiken ersetzt werden.**

- Ein Bild in `assets/icons/<name>.png` hat immer Vorrang vor jeder im Code
  gezeichneten Pixelgrafik. Der Dateiname ohne Endung ist der Schlüssel im Code
  (z. B. `smartphone.png` → `<Pixel name="smartphone" />`).
- Neues Icon hinterlegen oder ein bestehendes austauschen:
  1. PNG mit transparentem Hintergrund nach `assets/icons/` legen
  2. `python3 tools/icons_einbetten.py` ausführen
  3. `node tools/offline_bauen.js` ausführen
  Mehr ist nicht nötig – im Code muss dafür nichts geändert werden.
- Nur für Motive, für die **keine** Datei hinterlegt ist, wird die gezeichnete
  Pixelgrafik aus `SPRITES` verwendet. Wird später eine Datei nachgereicht,
  ersetzt sie die gezeichnete Fassung automatisch.
- Wenn eine gewünschte Grafik fehlt: nachfragen, nicht selbst erfinden.

Die Icons stammen aus den Referenzbildern der Lehrkraft und wurden mit
`tools/icons_extrahieren.py` daraus freigestellt. Die Zuschnitte stehen in der
`KARTE` dieses Skripts; ein neues Referenzblatt braucht dort nur neue Kästchen.

Hinterlegt sind derzeit: 16 Güter, 8 Akteure sowie die Symbole `muenze`,
`aktentasche`, `puzzle`, `tausch`, `herz`, `trend`, `stern`, `info`, `frage`,
`hakenKreis`, `haken`, `pfeilAb`, `zahnrad`, `schloss`. Die Symbole ersetzen in
der Oberfläche die früheren Emojis (Tipp, Richtig-/Falsch-Rückmeldung,
Sternewertung, Münzen, gesperrte Abzeichen). Neue Symbole an derselben Stelle
verwenden: `<Pixel name="…" size={0.7} />`.

### Marktwelt

`assets/marktwelt/` enthält die Szene als Ebenen, damit sie auf den Markt
reagieren kann:

- `marktwelt-hintergrund.png` – die feststehende Szene (Gebäude, Marktstand,
  Brunnen, Wege). Wird als Bild dargestellt.
- `marktwelt-figur-1.png`, `-2.png`, … – einzelne Kundinnen und Kunden mit
  transparentem Hintergrund. Sie werden zur Laufzeit auf die in
  `FIGUR_PLAETZE` festgelegten Standorte gesetzt; ihre Anzahl folgt der
  nachgefragten Menge. Die Liste wird aus den Dateinamen gelesen
  (`FIGUR_DATEIEN`) – weitere Figuren einfach durchnummeriert dazulegen,
  im Code ist nichts zu ändern.
- `marktwelt-kiste.png` und `marktwelt-lkw.png` – Warenkisten und Lieferwagen.
  Ihre Anzahl folgt der angebotenen Menge; der Lieferwagen erscheint erst bei
  hohem Angebot.
- Die beiden Infotafeln sind HTML-Elemente mit Live-Werten und liegen exakt
  über den im Bild vorhandenen Tafeln.

**Der Hintergrund sollte keine Personen enthalten.** Solange er welche
enthält, bleibt eine Grundbevölkerung sichtbar und der Rückgang der Nachfrage
ist nur abgeschwächt zu erkennen. Ein personenfreies Bild kann einfach
ausgetauscht werden, im Code ist dafür nichts zu ändern.

Offen: im aktuellen Hintergrund steht rechts neben dem Baum noch eine einzelne
Person (etwa bei x = 248…262 von 287 px). Sie wird bewusst nicht wegretuschiert
– das wäre eine selbst erzeugte Grafik. Sobald ein Bild ohne diese Figur
hinterlegt wird, ist die Szene vollständig personenfrei.

Ist kein Hintergrundbild hinterlegt, zeichnet der Simulator eine einfache
Ersatzszene aus den Sprites. Diese Ersatzdarstellung bitte erhalten.

## Dateien

| Datei | Zweck |
|---|---|
| `markt-simulator.html` | Marktnachfrage-Simulator (Angebot und Nachfrage), Hauptdatei |
| `markt-simulator-offline.html` | daraus erzeugt, alles eingebettet, läuft ohne Internet |
| `index.html`, `sortimentspyramide_random.html` | Sortimentspyramide |
| `assets/icons/` | hinterlegte Bilddateien (siehe oben) |
| `assets/marktwelt/` | Ebenen der Marktszene (Hintergrund, Figuren, Kisten, LKW) |
| `tools/` | Hilfsskripte zum Einbetten und Bauen |

## Aufbau von markt-simulator.html

Eine Datei, React über CDN, Abschnitte im Skript sind nummeriert und
kommentiert:

1. Hilfsfunktionen · 2. Marktmodell (`Qd = a − bP`, `Qs = c + dP`, Renten)
3. Szenarien und Reglerdefinitionen · 3b Pixelgrafik · 4. Aufgabengeneratoren
5. Diagramm · 5b Marktwelt · 6/12 Fortschritt (localStorage)
9b Missionen · 11 Marktabenteuer · 13 Oberfläche · 14 Hauptkomponente

Fachliche Regeln, die nicht verletzt werden dürfen:

- Der Preis des Gutes bewegt den Punkt **auf** der Kurve. Er verschiebt die
  Kurven nicht.
- Nichtpreisfaktoren (Einkommen, Komplementär- und Substitutionsgut,
  Präferenzen, Erwartungen) verändern nur den Achsenabschnitt `a` der
  Nachfrage, also eine Parallelverschiebung.
- Alle angezeigten Werte werden aus den hinterlegten Funktionen berechnet,
  nichts wird fest verdrahtet.

## Nach Änderungen

```
python3 tools/icons_einbetten.py   # nur nötig, wenn assets/icons/ geändert wurde
node tools/offline_bauen.js        # erzeugt markt-simulator-offline.html neu
                                   # einmalig vorher:  cd tools && npm install
```

Die Offline-Fassung ist immer mitzuziehen, sonst laufen beide Stände
auseinander.
