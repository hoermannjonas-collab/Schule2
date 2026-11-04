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

Für die Kachel „Diagramme zeichnen" im Startmenü gibt es noch kein eigenes
Motiv; angezeigt wird die Nachfragekurve. Wird `assets/icons/stift.png`
hinterlegt, erscheint automatisch der Stift (`symbolOder('stift', …)`).

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
| `hofa-markt-simulator.html` | Hofa-Fassung (Hotelfachschule), **erzeugt** mit `tools/hofa_bauen.py` |
| `hofa-markt-simulator-offline.html` | deren Offline-Fassung |
| `index.html`, `sortimentspyramide_random.html` | Sortimentspyramide |
| `assets/icons/` | hinterlegte Bilddateien (siehe oben) |
| `assets/marktwelt/` | Ebenen der Marktszene (Hintergrund, Figuren, Kisten, LKW) |
| `tools/` | Hilfsskripte zum Einbetten und Bauen |

## Aufbau von markt-simulator.html

Eine Datei, React über CDN, Abschnitte im Skript sind nummeriert und
kommentiert:

1. Hilfsfunktionen · 2. Marktmodell (`Qd = a − bP`, `Qs = c + dP`, Renten)
3. Szenarien und Reglerdefinitionen · 3b Pixelgrafik · 4. Aufgabengeneratoren
4b Zeichenaufgaben · 5. Diagramm · 5b Marktwelt · 6/12 Fortschritt (localStorage)
9b Missionen · 11 Marktabenteuer · 13 Oberfläche · 13b Zeichenübung
13c Startmenü · 14 Hauptkomponente

Die App startet mit dem **Startmenü** (Themenübersicht). Jedes der fünf Themen
hat zwei Wege: *Rechnen* (Niveaustufe gleicher Nummer) und *Zeichnen*.

### Zeichenübung

Die Schülerinnen und Schüler zeichnen auf Papier und decken dann die
Musterlösung auf. Sieben Aufgabentypen: Wertetabelle und Funktionen (Thema 1),
Renten (2), Verschiebung mit Zahlen und Skizze ohne Zahlen (3), Höchst- bzw.
Mindestpreis (4), Elastizität an der Nachfragekurve (5).

- `papierSkala` legt die Achsen für kariertes Papier fest (glatte Schritte,
  höchstens 12 cm je Achse). Die Musterlösung benutzt **genau dieselbe**
  Einteilung (`achsen` an `MarktChart`), damit man direkt vergleichen kann.
- `zeichenMarkt` nimmt nur Märkte, deren Gleichgewicht mittig auf den Achsen
  liegt – sonst drängt sich die Zeichnung in eine Ecke.
- Musterlösungen laufen über `MarktChart` im Lösungsmodus (`zeichnung`):
  Kurven heißen N/A bzw. N₀/N₁ und A₀/A₁, Gleichgewichte werden an den Achsen
  beschriftet.
- Die Münzen gibt es fürs Zeichnen und Vergleichen, **nicht** für die Anzahl der
  Haken in der Checkliste – sonst lohnt es sich, ungeprüft abzuhaken.

Fachliche Regeln, die nicht verletzt werden dürfen:

- Thema ist ausschließlich **Angebot und Nachfrage**. Der Wirtschaftskreislauf
  wird hier nicht behandelt – keine Banken, kein Ausland, keine Finanzmärkte
  als Marktteilnehmer. Gezeigt werden nur Akteure, die unmittelbar auf Angebot
  oder Nachfrage wirken, sowie der Staat als Rahmensetzer (Höchst- und
  Mindestpreise, Steuern, Subventionen).

- Der Preis des Gutes bewegt den Punkt **auf** der Kurve. Er verschiebt die
  Kurven nicht.
- Nichtpreisfaktoren (Einkommen, Komplementär- und Substitutionsgut,
  Präferenzen, Erwartungen) verändern nur den Achsenabschnitt `a` der
  Nachfrage, also eine Parallelverschiebung.
- Alle angezeigten Werte werden aus den hinterlegten Funktionen berechnet,
  nichts wird fest verdrahtet.

## Hofa-Fassung (Hotelfachschule)

`hofa-markt-simulator.html` wird **nicht von Hand bearbeitet**. Sie entsteht mit
`python3 tools/hofa_bauen.py` aus `markt-simulator.html` und `tools/hofa_inhalte.jsx`.

Grundlage ist die Bestandsaufnahme zu Lernbereich 2 „Zusammenhänge zwischen Markt
und Preis erfassen“ (VWL Hotelfachschule, 1. Schuljahr; Stand 04.11.2026). Daraus
folgen diese verbindlichen Regeln für die Hofa-Fassung:

- **Schreibweise p und x**, Funktionen in der Form N: p = a − b·x, A: p = c + d·x.
  Preis auf der Hochachse, Menge auf der Rechtsachse. Intern rechnet der Simulator
  weiter mit Qd/Qs; angezeigt wird nur die p-Form (`inv`, `nFkt`, `aFkt`).
- **Anrede „Sie“** durchgängig.
- **Nicht Unterrichtsstoff** und daher ausgeblendet: Konsumenten-/Produzentenrente,
  Gesamtwohlfahrt, Prohibitivpreis, Mindestangebotspreis, Sättigungsmenge,
  Revenue Management (als Begriff).
- **Begriffe** wie im Unterricht: Angebotsüberhang, Nachfrageüberhang,
  Kapazitätsgrenze, Bewegung auf der Kurve / Verschiebung.
- **Themen** (Startmenü, Rechnen, Zeichnen): 1 Gleichgewicht (inkl. Umstellen nach x),
  2 Überhänge und Kapazitätsgrenze, 3 Verschiebungen (inkl. Doppelverschiebung und
  Fehlersuche), 4 Höchst-/Mindestpreis (auch nicht bindend), 5 Preis-, Einkommens-
  und Kreuzpreiselastizität.
- **Glatte Zahlen:** Steigungen höchstens drei Nachkommastellen, Preise höchstens
  zwei, Mengen ganzzahlig – auch nach Verschiebungen (`glatterMarkt`).

Aufbau:

- `tools/hofa_inhalte.jsx` enthält die Hofa-Abschnitte (Märkte, Aufgaben,
  Zeichenaufgaben, Mission, Theorie, Spielereignisse, Marktteilnehmer …). Jeder
  Abschnitt beginnt mit `//#ABSCHNITT name` und ersetzt den gleichnamigen Teil des
  Hauptsimulators (Zuordnung in `ABSCHNITTE` in `hofa_bauen.py`).
- Einzelne Texte der Oberfläche ersetzt `ERSETZUNGEN` in `hofa_bauen.py`.
- Der Hauptsimulator hat dafür einen Schalter `VARIANTE` (Renten an/aus) und im
  Diagramm die Option `kapazitaet`. Beides ändert an der FOS/BOS-Fassung nichts.
- Am Ende prüft das Skript, dass keine du-Formen und keine der ausgeblendeten
  Begriffe mehr vorkommen. Findet es etwas, bricht es mit der Zeilenangabe ab.

Diagramm, Oberfläche, Spiel und Fortschritt kommen aus dem Hauptsimulator. Eine
Änderung dort gelangt mit dem nächsten Lauf von `tools/hofa_bauen.py` in die
Hofa-Fassung. Passt ein Anker nicht mehr oder enthält neuer Text eine du-Form,
bricht das Skript ab; dann den Anker bzw. die Ersetzung nachziehen.

Offen laut Bestandsaufnahme: Marktformen (Neun-Felder-Schema), Marktversagen und
Mengensteuer sind Teil von LB 2, aber (noch) nicht im Simulator.

## Veröffentlichung – wichtig

**GitHub Pages ist für dieses Repository auf den Ordner `docs/` eingestellt.**
Nur was in `docs/` liegt, ist unter der Adresse erreichbar. Eine Datei im
Wurzelverzeichnis wird nicht ausgeliefert – der Link ergibt 404.

Die bearbeiteten Quellen bleiben im Wurzelverzeichnis; `tools/veroeffentlichen.py`
spiegelt die fertigen Schülerseiten nach `docs/`.

Adressen:

| Seite | Adresse |
|---|---|
| Sortimentspyramide (Startseite) | `…github.io/Schule2/` |
| Marktnachfrage-Simulator | `…github.io/Schule2/markt-simulator.html` |
| Offline-Fassung | `…github.io/Schule2/markt-simulator-offline.html` |
| Hofa-Simulator | `…github.io/Schule2/hofa-markt-simulator.html` |
| Hofa-Offline-Fassung | `…github.io/Schule2/hofa-markt-simulator-offline.html` |
| Weltkarte live | `…github.io/Schule2/weltkarte-live/` |

## Nach Änderungen

```
python3 tools/icons_einbetten.py    # nur nötig, wenn assets/icons/ geändert wurde
python3 tools/hofa_bauen.py         # erzeugt die Hofa-Fassung aus dem Hauptsimulator
node tools/offline_bauen.js         # erzeugt beide Offline-Fassungen neu
                                    # einmalig vorher:  cd tools && npm install
python3 tools/veroeffentlichen.py   # spiegelt die Seiten nach docs/
```

Beides ist immer mitzuziehen: ohne den Offline-Build laufen die zwei Fassungen
auseinander, ohne den Veröffentlichungsschritt sieht die Klasse den alten Stand.
