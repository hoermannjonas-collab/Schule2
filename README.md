# Schule2
Sachen für schule

## Dateien

- `index.html` – Sortimentspyramide (Übung, feste Beispiele)
- `sortimentspyramide_random.html` – Sortimentspyramide mit zufälligen Beispielen
- `markt-simulator.html` – **Marktnachfrage-Simulator** für den Wirtschaftsunterricht
  (Angebot und Nachfrage, Marktgleichgewicht, Konsumenten- und Produzentenrente,
  Kurvenverschiebungen, staatliche Eingriffe, Preiselastizität).
  Heller Pixel-Art-Arbeitsbereich in sechs Schritten: Markt wählen → Parameter festlegen →
  Marktdiagramm → Aufgaben → Vorher-Nachher-Analyse → Ergebnisse.
  Sechzehn Güter mit ökonomisch passenden Komplementär- und Substitutionsgütern, Icons aus
  `assets/icons/`, reaktive Pixel-Marktwelt, Marktteilnehmer-Übersicht und
  Diagrammlegende, geführte Missionen nach dem Muster Prognostizieren → Berechnen →
  Simulieren → Beobachten → Erklären. Im Trainingscenter zusätzlich fünf Niveaustufen
  mit Rechenaufgaben und der Spielmodus „Marktabenteuer" (acht Runden Unternehmensführung).
  Für Laptop, iPad und iPhone; Fortschritt nur lokal im Browser.
  Benötigt beim Öffnen eine Internetverbindung (React und Tailwind über CDN).
- `weltkarte-klasse.html` – **Klassen-Weltkarte** „Wo wart ihr schon?“
  Alle Staaten der Welt mit echten Grenzen und deutschen Namen. Auf ein Land tippen
  und eintragen, wie viele aus der Klasse schon dort waren; die Zahl färbt das Land
  von einem dezenten Hellblau bis zu kräftigem Rot ein. Kopfzeile mit Länder- und
  Besuchszahl, Rangliste der meistbesuchten Länder, Zoomen per Mausrad, zwei Fingern
  oder Knöpfen. Eine einzige gemeinsame Fassung für die ganze Klasse, kein Login.
  Läuft ohne Internetverbindung, auch per Doppelklick von einem USB-Stick.
  Die Zahlen liegen im `localStorage` des jeweiligen Geräts.
  Wird aus `tools/weltkarte_vorlage.html` erzeugt (`python3 tools/weltkarte_bauen.py`);
  die Grenzen stammen von Natural Earth (50m, Public Domain).
- `assets/icons/` – hinterlegte Bilddateien. Diese Grafiken sind maßgeblich und werden
  nicht nachgezeichnet; Details in `CLAUDE.md`.
- `assets/marktwelt/` – die Marktszene als Ebenen: feststehender Hintergrund plus
  einzelne Figuren, deren Anzahl der nachgefragten Menge folgt, sowie Warenkisten und
  Lieferwagen, die dem Angebot folgen.
- `docs/` – **das ist der veröffentlichte Ordner.** GitHub Pages liefert nur diesen
  aus; `tools/veroeffentlichen.py` spiegelt die fertigen Seiten dorthin.
- `tools/` – Hilfsskripte: Icons einbetten, Offline-Fassung bauen, Seiten nach
  `docs/` veröffentlichen, Icons aus einem Referenzbild freistellen
- `markt-simulator-offline.html` – inhaltsgleiche Fassung mit eingebetteten Bibliotheken
  (ca. 650 KB). Läuft ohne Internetverbindung, z. B. nach Verteilung per AirDrop.
  Wird aus `markt-simulator.html` erzeugt und muss bei Änderungen neu gebaut werden.

## Adressen für den Unterricht

| Seite | Adresse |
|---|---|
| Sortimentspyramide | https://hoermannjonas-collab.github.io/Schule2/ |
| Marktnachfrage-Simulator | https://hoermannjonas-collab.github.io/Schule2/markt-simulator.html |
| Offline-Fassung zum Verteilen | https://hoermannjonas-collab.github.io/Schule2/markt-simulator-offline.html |
| Klassen-Weltkarte | https://hoermannjonas-collab.github.io/Schule2/weltkarte-klasse.html |
| Weltkarte live | https://hoermannjonas-collab.github.io/Schule2/weltkarte-live/ |
