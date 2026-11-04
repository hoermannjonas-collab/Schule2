#!/usr/bin/env python3
"""Erzeugt die Hofa-Fassung hofa-markt-simulator.html aus markt-simulator.html.

Die Hofa-Fassung (Hotelfachschule, VWL 1. Schuljahr, Lernbereich 2) folgt dem
Hofa-Unterricht:
- Schreibweise p (Preis) und x (Menge), Funktionen p = a − b·x und p = c + d·x
- Anrede „Sie“
- keine Konsumenten-/Produzentenrente, kein Prohibitivpreis, keine Sättigungsmenge
- Angebots-/Nachfrageüberhang, Kapazitätsgrenze, Doppelverschiebung, Fehlersuche,
  Einkommens- und Kreuzpreiselastizität
- Märkte, Ereignisse und Beispiele aus Hotellerie, Gastronomie und Tourismus

So funktioniert es:
1. Ganze Abschnitte (Märkte, Aufgaben, Zeichenaufgaben, Mission, Theorie …)
   kommen aus tools/hofa_inhalte.jsx und ersetzen den entsprechenden
   Abschnitt des Hauptsimulators.
2. Einzelne Texte der Oberfläche werden ersetzt (Sie-Form, Begriffe, p/x).
3. Zum Schluss wird geprüft, dass keine du-Formen und keine Begriffe mehr
   vorkommen, die im Hofa-Unterricht nicht verwendet werden.

Diagramm, Oberfläche, Spiel und Fortschritt bleiben gemeinsam mit dem
Hauptsimulator. Passt ein Ankertext nicht mehr, bricht das Skript mit einer
Meldung ab, statt eine halb angepasste Datei zu schreiben.

    python3 tools/hofa_bauen.py
"""

import re
import sys
from pathlib import Path

WERKZEUGE = Path(__file__).resolve().parent
WURZEL = WERKZEUGE.parent
QUELLE = WURZEL / 'markt-simulator.html'
INHALTE = WERKZEUGE / 'hofa_inhalte.jsx'
ZIEL = WURZEL / 'hofa-markt-simulator.html'

KOPF = '/* ============================================================\n'

# Abschnittsname: (Beginn im Hauptsimulator, Text direkt nach dem Abschnitt)
ABSCHNITTE = {
    'maerkte':          ('const P_EINKOMMEN = {', '\nconst scById'),
    'marktgenerator':   ('function makeMarket(sc) {', '\n\n/* Reglerstellungen'),
    'aufgaben':         ('const STUFEN = [', KOPF + '   4b. ZEICHENAUFGABEN'),
    'zeichnen':         (KOPF + '   4b. ZEICHENAUFGABEN', KOPF + '   5. DIAGRAMM'),
    'funktionsanzeige': ('const Fn = ({ m, kind }) =>', '\nconst Maskottchen'),
    'mission':          ('function macheMission(sc, basis) {', '\n/* Einen Schritt prüfen.'),
    'theorie':          ('const THEORIE = [', '\nfunction Theorie() {'),
    'spiel':            ('const F_NACHFRAGE = {', '\n\nconst preisSchritt'),
    'teilnehmer':       ('const NACHFRAGESEITE = [', '\nconst TeilnehmerRaster'),
    'legende':          ('const LEGENDE = [', '\n\nconst Legende = () =>'),
    'ergebnisraster':   ('function ErgebnisRaster({ sc, markt, preis }) {', '\n\n/* ---------- 1 · Markt wählen'),
    'analyse':          ('const ANALYSE_TABS = [', '\n\nconst Pfeil'),
    'fnstrich':         ('const FnStrich = ({ m, kind }) =>', '\n\nfunction Wertetabelle('),
    'themen':           ('const THEMEN = [', '\n\nfunction Kachel('),
    'badges':           ('const BADGES = [', '\n\n' + KOPF + '   7.'),
}

# Einzelne Ersetzungen: (alt, neu, Anzahl der Vorkommen)
ERSETZUNGEN = [
    # --- Variante und Speicher ------------------------------------------------
    ("const VARIANTE = { renten: true };", "const VARIANTE = { renten: false };", 1),
    ("const STORE_KEY = 'marktsim_v1';", "const STORE_KEY = 'marktsim_hofa_v1';", 1),

    # --- Diagramm: p und x, Überhang statt Überschuss --------------------------
    ('fill="#7C3AED">P = {fmt(priceLine,2)} €</text>', 'fill="#7C3AED">p = {fmt(priceLine,2)} €</text>', 1),
    ("{plQd > plQs ? 'Mangel' : 'Überschuss'}: {fmt(Math.abs(plQd-plQs))}",
     "{plQd > plQs ? 'Nachfrageüberhang' : 'Angebotsüberhang'}: {fmt(Math.abs(plQd-plQs))}", 1),
    ('strokeWidth="3">ΔP</text>', 'strokeWidth="3">Δp</text>', 1),
    ('strokeWidth="3">ΔQ</text>', 'strokeWidth="3">Δx</text>', 1),
    ("ohneZahlen ? `P${l.i}` : `P${l.i} = ${zahl(l.k.P)}`", "ohneZahlen ? `p${l.i}` : `p${l.i} = ${zahl(l.k.P)}`", 1),
    ("ohneZahlen ? `Q${l.i}` : `Q${l.i} = ${zahl(l.k.Q)}`", "ohneZahlen ? `x${l.i}` : `x${l.i} = ${zahl(l.k.Q)}`", 1),
    ('Preis ({pEinheit(sc)})', 'Preis p ({pEinheit(sc)})', 1),
    ("Menge ({sc ? sc.qUnit : 'Stück'})", "Menge x ({sc ? sc.qUnit : 'Stück'})", 1),
    ("label:'P₁', color:'#7C3AED'", "label:'p₀', color:'#7C3AED'", 0),

    ('''        {showSurplus && <>
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-green-300"></span>Konsumentenrente</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-red-300"></span>Produzentenrente</span>
        </>}
''', '', 1),

    # --- Marktwelt --------------------------------------------------------------
    ('titel="HERSTELLER"', 'titel="ANBIETER"', 1),
    ('titel="KONSUMENTEN"', 'titel="GÄSTE"', 1),
    ("['Käufer heute', fmt(nachfrage)]", "['Gäste heute', fmt(nachfrage)]", 1),
    ('`Angebotsüberschuss: ${fmt(differenz)}', '`Angebotsüberhang: ${fmt(differenz)}', 1),
    ('`Nachfrageüberschuss: ${fmt(-differenz)}', '`Nachfrageüberhang: ${fmt(-differenz)}', 1),

    # --- Marktlage (Kennzahlenliste) --------------------------------------------
    ("diff > 0 ? 'Angebotsüberschuss' : 'Nachfrageüberschuss'}", "diff > 0 ? 'Angebotsüberhang' : 'Nachfrageüberhang'}", 1),
    ("""      <Zeile l={'Konsumenten\\u00ADrente'} v={geld(k.KR, sc)} farbe="text-green-700" />
      <Zeile l={'Produzenten\\u00ADrente'} v={geld(k.PR, sc)} farbe="text-red-600" />
      <Zeile l={'Gesamt\\u00ADwohlfahrt'} v={geld(k.W, sc)} />
      <Zeile l={'Prohibitiv\\u00ADpreis'} v={geld(k.pMaxD, sc)} />
      <Zeile l={'Mindest\\u00ADangebotspreis'} v={geld(k.pMinS, sc)} />
""", """      <Zeile l={'Umsatz im Gleich\\u00ADgewicht'} v={geld(k.P * k.Q, sc)} farbe="text-green-700" />
""", 1),

    # --- Tiefer gehen (Analyse) --------------------------------------------------
    ("""        ['Konsumenten\\u00ADrente', kn.KR - kv.KR, geld(kn.KR, sc)],
        ['Produzenten\\u00ADrente', kn.PR - kv.PR, geld(kn.PR, sc)],""",
     """        ['Umsatz im Gleich\\u00ADgewicht', kn.P * kn.Q - kv.P * kv.Q, geld(kn.P * kn.Q, sc)],""", 1),
    ('Verschiebe den Regler und beobachte die Auswirkungen auf Nachfrage, Gleichgewicht und Renten.',
     'Verschieben Sie den Regler und beobachten Sie die Auswirkungen auf Nachfrage, Gleichgewicht und Umsatz.', 1),
    ('P* = {geld(kv.P, sc)} · Q* = {fmt(kv.Q)}', 'x* = {fmt(kv.Q)} · p* = {geld(kv.P, sc)}', 1),
    ('P* = {geld(kn.P, sc)} · Q* = {fmt(kn.Q)}', 'x* = {fmt(kn.Q)} · p* = {geld(kn.P, sc)}', 1),
    ('P*={fmt(v.P, v.P < 100 ? 2 : 0)} Q*={fmt(v.Q)}', 'x*={fmt(v.Q)} p*={fmt(v.P, v.P < 100 ? 2 : 0)}', 1),
    ("sobald du die passende Aufgabe im Bereich 4 bearbeitet hast.", "sobald Sie die passende Aufgabe im Bereich 4 bearbeitet haben.", 1),

    # --- Parameter und Marktwahl ---------------------------------------------------
    ('Preis des Gutes (P)', 'Preis des Gutes (p)', 1),
    ('Wähle ein Gut aus:', 'Wählen Sie einen Markt aus:', 1),
    ("'Die gestrichelte Kurve zeigt die Ausgangslage. Ein Nichtpreisfaktor hat die ganze Nachfragekurve verschoben.'",
     "'Die gestrichelte Kurve zeigt die Ausgangslage. Ein anderer Einflussfaktor als der Preis hat die ganze Nachfragekurve verschoben.'", 1),
    ("'Bewege die Regler und beobachte, wie sich der Markt verändert. Löse danach die Aufgaben.'",
     "'Bewegen Sie die Regler und beobachten Sie, wie sich der Markt verändert. Lösen Sie danach die Aufgaben.'", 1),

    # --- Wertetabelle der Zeichenübung ----------------------------------------------
    ('>Preis P</th>', '>Preis p</th>', 1),
    ('nachgefragte Menge Q<sub>d</sub></th>', 'nachgefragte Menge</th>', 1),
    ('angebotene Menge Q<sub>s</sub></th>', 'angebotene Menge</th>', 1),

    # --- Rückmeldungen in den Übungsrunden -----------------------------------------
    ('Noch nicht ganz richtig – schau dir die rot markierten Felder nochmal an. Du hast noch einen Versuch.',
     'Noch nicht ganz richtig – sehen Sie sich die rot markierten Felder noch einmal an. Sie haben noch einen Versuch.', 1),
    ('Leider nicht richtig. Sieh dir den Lösungsweg an – die nächste Aufgabe schaffst du!',
     'Leider nicht richtig. Sehen Sie sich den Lösungsweg an – die nächste Aufgabe schaffen Sie!', 1),

    # --- Mission -------------------------------------------------------------------
    ('placeholder="Deine Begründung …"', 'placeholder="Ihre Begründung …"', 1),
    ("'Noch nicht erreicht. Stelle den Regler links im Bereich 2 ein.'", "'Noch nicht erreicht. Stellen Sie den Regler im Bereich 2 ein.'", 1),
    ('titel="Deine Ergebnisse"', 'titel="Ihre Ergebnisse"', 1),
    ('Mission abgeschlossen. Wähle ein anderes Gut oder starte eine neue Mission.',
     'Mission abgeschlossen. Wählen Sie einen anderen Markt oder starten Sie eine neue Mission.', 1),
    ('>Deine Lösung</th>', '>Ihre Lösung</th>', 1),
    ('So kannst du verschiedene Marktsituationen nebeneinander vergleichen.',
     'So können Sie verschiedene Marktsituationen nebeneinander vergleichen.', 1),

    # --- Zeichenübung ----------------------------------------------------------------
    ("t:'Stark – deine Zeichnung ist vollständig!'", "t:'Sehr gut – Ihre Zeichnung ist vollständig!'", 1),
    ("t:'Schon gut. Ergänze die offenen Punkte in deinem Heft.'", "t:'Schon gut. Ergänzen Sie die offenen Punkte in Ihrem Heft.'", 1),
    ("t:'Übertrage die Musterlösung sauber ins Heft und versuch danach eine neue Aufgabe.'",
     "t:'Übertragen Sie die Musterlösung sauber ins Heft und versuchen Sie danach eine neue Aufgabe.'", 1),
    ('Das gehört in deine Zeichnung', 'Das gehört in Ihre Zeichnung', 1),
    ('>Auf dein Papier<', '>Auf Ihr Papier<', 1),
    ('Kariertes Blatt, Lineal, zwei Farben. Erst fertig zeichnen, dann vergleichen.',
     'Kariertes Blatt, Lineal, zwei Farben. Erst fertig zeichnen, dann vergleichen – wie in der Prüfung.', 1),
    ('title="So gehst du vor"', 'title="So gehen Sie vor"', 1),
    ('title="Vergleiche deine Zeichnung"', 'title="Vergleichen Sie Ihre Zeichnung"', 1),
    ('Tippe an, was in deiner Zeichnung stimmt.', 'Tippen Sie an, was in Ihrer Zeichnung stimmt.', 1),
    ('Zeichne auf Papier. Danach deckst du die Musterlösung auf und hakst ab, was bei dir stimmt.',
     'Zeichnen Sie auf Papier. Danach decken Sie die Musterlösung auf und haken ab, was bei Ihnen stimmt.', 1),

    # --- Startmenü ---------------------------------------------------------------------
    ('Was möchtest du bearbeiten?', 'Was möchten Sie bearbeiten?', 1),
    ('{hallo} Wähle ein Thema. Du kannst <b>rechnen</b>', '{hallo} Wählen Sie ein Thema. Sie können <b>rechnen</b>', 1),
    ('Angebot und Nachfrage · Level {lvl}', 'Hotel &amp; Tourismus · Level {lvl}', 1),
    ('text={`Führe ein Unternehmen: ${SPIEL_RUNDEN} Runden, jede Runde eine neue Preisentscheidung.`}',
     'text={`Führen Sie einen Betrieb im Gastgewerbe: ${SPIEL_RUNDEN} Runden, jede Runde eine neue Preisentscheidung.`}', 1),
    ('text="Aufgaben aus allen Themen: auf Papier zeichnen und mit der Musterlösung vergleichen."',
     'text="Aufgaben aus allen Themen: von Hand zeichnen und mit der Musterlösung vergleichen."', 1),

    # --- Marktabenteuer ------------------------------------------------------------------
    ('Deine Stückkosten ändern sich von', 'Ihre Kosten je Gast ändern sich von', 1),
    ('`Du kannst diese Runde höchstens ${fmt(g.kapazitaet)} ${g.sc.qUnit} produzieren.`',
     '`Sie können diese Runde höchstens ${fmt(g.kapazitaet)} ${g.sc.qUnit} anbieten.`', 1),
    ('title={`Deine Entscheidung – Runde ${g.runde}`}', 'title={`Ihre Entscheidung – Runde ${g.runde}`}', 1),
    ('>Dein Verkaufspreis<', '>Ihr Verkaufspreis<', 1),
    ('Rechne nach – wie viel Gewinn bringt dieser Preis?', 'Rechnen Sie nach – wie viel Gewinn bringt dieser Preis?', 1),
    ('placeholder="dein Ergebnis"', 'placeholder="Ihr Ergebnis"', 1),
    ('– du warst praktisch am Optimum.', '– Sie lagen praktisch am Optimum.', 1),
    ("'dein Preis war zu hoch – zu viele Kunden sind zur Konkurrenz gegangen'",
     "'Ihr Preis war zu hoch – zu viele Gäste sind zur Konkurrenz gegangen'", 1),
    ("'dein Preis war zu niedrig – die Marge je Stück war zu klein'", "'Ihr Preis war zu niedrig – der Betrag je Gast war zu klein'", 1),
    ('`✅ Deine Gewinnrechnung stimmt:', '`✅ Ihre Gewinnrechnung stimmt:', 1),
    ('`Deine Schätzung lag bei', '`Ihre Schätzung lag bei', 1),
    ("label: 'dein Preis' }", "label: 'Ihr Preis' }", 1),
    ('Führe dein eigenes Unternehmen', 'Führen Sie Ihren eigenen Betrieb', 1),
    ('Über {SPIEL_RUNDEN} Runden entscheidest du jede Runde neu über deinen Verkaufspreis.',
     'Über {SPIEL_RUNDEN} Runden entscheiden Sie jede Runde neu über Ihren Verkaufspreis.', 1),
    ('Ereignisse verändern Nachfrage, Kosten und den Preis deines Mitbewerbers.',
     'Ereignisse verändern Nachfrage, Kosten und den Preis Ihres Mitbewerbers.', 1),
    ('<span>Prohibitivpreis {eur(max, 0)}</span>', '<span>höchster Preis {eur(max, 0)}</span>', 1),
    ('text={<>Lege deinen Verkaufspreis fest. Je weiter du über dem Konkurrenzpreis von <b>{eur(g.konkurrenz)}</b> liegst, '
     'desto mehr Kunden verlierst du – zu billig verkaufst du zwar viel, verdienst aber je Stück kaum etwas.</>}',
     'text={<>Legen Sie Ihren Verkaufspreis fest. Je weiter Sie über dem Konkurrenzpreis von <b>{eur(g.konkurrenz)}</b> liegen, '
     'desto mehr Gäste verlieren Sie – zu billig füllen Sie zwar das Haus, verdienen aber je Gast kaum etwas.</>}', 1),

    # --- Fortschritt und Einstellungen -----------------------------------------------------
    ('title="Dein Stand"', 'title="Ihr Stand"', 1),
    ('Dein Name (nur auf diesem Gerät gespeichert)', 'Ihr Name (nur auf diesem Gerät gespeichert)', 2),

    # --- Titel und Kennzeichnung --------------------------------------------------------------
    ('<title>Marktnachfrage-Simulator – Angebot &amp; Nachfrage</title>',
     '<title>Markt-Simulator Hotel &amp; Tourismus – Angebot &amp; Nachfrage</title>', 1),
    ('<span className="sm:hidden">Marktsimulator</span><span className="hidden sm:inline">Marktnachfrage-Simulator</span>',
     '<span className="sm:hidden">Hofa-Markt</span><span className="hidden sm:inline">Markt-Simulator Hotel &amp; Tourismus</span>', 1),
    ('Verstehe Märkte. Analysiere Zusammenhänge. Löse Aufgaben.',
     'Angebot und Nachfrage in Hotellerie, Gastronomie und Tourismus.', 1),
    ("""                Marktnachfrage-Simulator für den Wirtschaftsunterricht: Angebot und Nachfrage, Marktgleichgewicht,
                Konsumenten- und Produzentenrente, Verschiebung der Kurven, staatliche Eingriffe und Preiselastizität.""",
     """                Markt-Simulator für den VWL-Unterricht an der Hotelfachschule (Lernbereich 2): Marktgleichgewicht,
                Überhänge und Kapazitätsgrenze, Verschiebung der Kurven, staatliche Eingriffe und Elastizitäten –
                mit Märkten aus Hotellerie, Gastronomie und Tourismus.""", 1),
    ('Marktnachfrage-Simulator · Fortschritt wird nur lokal auf diesem Gerät gespeichert',
     'Markt-Simulator Hotel &amp; Tourismus · Fortschritt wird nur lokal auf diesem Gerät gespeichert', 1),
]

# Diese Wörter dürfen in der Hofa-Fassung nirgends mehr vorkommen
VERBOTEN = [
    r'(?<![.\w])(du|Du|dein\w*|Dein\w*|dich|Dich|dir|Dir)\b(?!\s*[:=.(])',
    r'Konsumentenrente', r'Produzentenrente', r'Konsumenten\\u00ADrente', r'Produzenten\\u00ADrente',
    r'Prohibitivpreis', r'Mindestangebotspreis', r'Sättigungsmenge', r'Gesamtwohlfahrt',
    r'[Üü]berschuss', r'\bQ<sub>', r'\bQd\b', r'\bQs\b', r'P\*', r'Q\*',
    r'Revenue Management', r'Nichtpreisfaktor',
]
# Häufige du-Imperative am Satzanfang
DU_IMPERATIVE = (r"(?:^|['`\"(>]|[.!?:–]\s)\s*(Berechne|Bestimme|Zeichne|Wähle|Stelle|Bewege|Lies|Trage|Setze|"
                 r"Prognostiziere|Begründe|Formuliere|Beobachte|Gehe|Verschiebe|Markiere|Skizziere|Kennzeichne|"
                 r"Schraffiere|Tippe|Achte|Denke|Überlege|Löse|Führe|Vergleiche|Ergänze|Übertrage|Versuch|Hake|"
                 r"Nimm|Gib|Bringe|Lege|Schau|Sieh|Teste|Spiele|Starte|Entscheide|Schätze|Rechne|Probiere|Behandle)\b")


def lies_abschnitte():
    text = INHALTE.read_text(encoding='utf-8')
    teile = re.split(r'^//#ABSCHNITT (\w+)\n', text, flags=re.M)
    return {teile[i]: teile[i + 1].rstrip('\n') for i in range(1, len(teile), 2)}


def setze_abschnitt(s, name, inhalt):
    anfang, danach = ABSCHNITTE[name]
    if s.count(anfang) != 1:
        sys.exit(f'Abschnitt {name}: Anfang {anfang[:60]!r} kommt {s.count(anfang)}-mal vor – Hofa-Fassung nicht erzeugt.')
    i = s.index(anfang)
    j = s.find(danach, i + len(anfang))
    if j < 0:
        sys.exit(f'Abschnitt {name}: Ende {danach[:60]!r} nicht gefunden – Hofa-Fassung nicht erzeugt.')
    trenner = '' if danach.startswith('\n') else '\n\n'
    return s[:i] + inhalt + trenner + s[j:]


def pruefe(s):
    """Sucht im Skript- und Textteil (ohne eingebettete Bilder) nach Verbotenem."""
    a = s.index('<script type="text/babel">')
    zeilen = s[a:].split('\n')
    start = s[:a].count('\n') + 1
    funde = []
    im_kommentar = False
    for nr, z in enumerate(zeilen):
        if 'data:image' in z:
            continue
        if im_kommentar:
            if '*/' not in z:
                continue
            im_kommentar, z = False, z.split('*/', 1)[1]
        if z.lstrip().startswith('/*') and '*/' not in z:
            im_kommentar = True
            continue
        z = re.sub(r'/\*.*?\*/', '', z)                 # Kommentar innerhalb der Zeile
        z = re.sub(r'(?<![:/])//.*$', '', z)             # Zeilenkommentar, aber keine URL
        for muster in VERBOTEN + [DU_IMPERATIVE]:
            m = re.search(muster, z)
            if m:
                funde.append(f'  Zeile {start + nr}: {m.group(0)!r} in {z.strip()[:110]}')
                break
    return funde


def main():
    s = QUELLE.read_text(encoding='utf-8')
    abschnitte = lies_abschnitte()
    fehlend = set(ABSCHNITTE) - set(abschnitte)
    if fehlend:
        sys.exit(f'In {INHALTE.name} fehlen Abschnitte: {", ".join(sorted(fehlend))}')
    for name, inhalt in abschnitte.items():
        if name not in ABSCHNITTE:
            sys.exit(f'Unbekannter Abschnitt {name} in {INHALTE.name}')
        s = setze_abschnitt(s, name, inhalt)

    for alt, neu, anzahl in ERSETZUNGEN:
        n = s.count(alt)
        if anzahl and n != anzahl:
            sys.exit(f'Text {alt[:70]!r} kommt {n}-mal statt {anzahl}-mal vor – Hofa-Fassung nicht erzeugt.')
        s = s.replace(alt, neu)

    funde = pruefe(s)
    if funde:
        print('Noch nicht angepasst (du-Form oder Begriff, der im Hofa-Unterricht nicht vorkommt):')
        print('\n'.join(funde))
        sys.exit(1)

    hinweis = ('<!-- Hofa-Fassung: erzeugt aus markt-simulator.html mit tools/hofa_bauen.py und\n'
               '     tools/hofa_inhalte.jsx. Nicht von Hand bearbeiten. -->\n')
    s = s.replace('<title>', hinweis + '<title>', 1)
    ZIEL.write_text(s, encoding='utf-8')
    print(f'{ZIEL.name} erzeugt: {len(s) // 1024} KB')


if __name__ == '__main__':
    main()
