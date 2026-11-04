#!/usr/bin/env python3
"""Erzeugt die Hofa-Fassung hofa-markt-simulator.html aus markt-simulator.html.

Die Hofa-Fassung (Hotelfachschule) ist inhaltlich auf Hotellerie, Gastronomie
und Tourismus zugeschnitten: eigene Märkte, Ereignisse, Marktteilnehmer und
Beispiele. Programmlogik, Diagramm, Aufgabentypen und Oberfläche kommen
unverändert aus dem Hauptsimulator – eine Fehlerkorrektur dort gelangt beim
nächsten Lauf dieses Skripts automatisch auch in die Hofa-Fassung.

    python3 tools/hofa_bauen.py

Danach wie gewohnt:  node tools/offline_bauen.js  und  python3 tools/veroeffentlichen.py

Jede Ersetzung prüft, dass ihr Ankertext genau einmal vorkommt. Wurde der
Hauptsimulator so geändert, dass ein Anker nicht mehr passt, bricht das Skript
mit einer Meldung ab, statt eine halb angepasste Datei zu schreiben.
"""

import sys
from pathlib import Path

WURZEL = Path(__file__).resolve().parent.parent
QUELLE = WURZEL / 'markt-simulator.html'
ZIEL = WURZEL / 'hofa-markt-simulator.html'


def block(s, anfang, ende, neu):
    """Ersetzt den Abschnitt von `anfang` bis einschließlich `ende`."""
    if s.count(anfang) != 1:
        sys.exit(f'Anker {anfang!r} kommt {s.count(anfang)}-mal vor – Hofa-Fassung nicht erzeugt.')
    i = s.index(anfang)
    j = s.find(ende, i)
    if j < 0:
        sys.exit(f'Ende {ende!r} nach {anfang!r} nicht gefunden.')
    return s[:i] + neu + s[j + len(ende):]


def ersetze(s, alt, neu, anzahl=1):
    if s.count(alt) != anzahl:
        sys.exit(f'Text {alt[:70]!r} kommt {s.count(alt)}-mal statt {anzahl}-mal vor – Hofa-Fassung nicht erzeugt.')
    return s.replace(alt, neu)


# ---------------------------------------------------------------------------
# Märkte aus Hotellerie, Gastronomie und Tourismus
# Zahlenräume so gewählt, dass makeMarket glatte Funktionen findet:
# b = Q/kb und d = Q/kd ganzzahlig, kd < P.
# Bilder: nur hinterlegte Grafiken aus assets/icons/ bzw. vorhandene Sprites.
# ---------------------------------------------------------------------------
SZENARIEN = r"""const SCENARIOS = [
  { key:'hotel', name:'Hotelübernachtungen', kurz:'Hotel', emoji:'🏨', sprite:'hotel',
    qUnit:'Übernachtungen', gutTyp:'normales Gut', komp:'Anreise', subst:'Ferienwohnungen',
    prices:[60,80,100,120], quantities:[600,800,1000], kb:[30,40,50,60], kd:[20,30,40,50], steps:[10,20],
    parameter:[
      P_EINKOMMEN,
      { key:'komplement', label:'Preis Komplementärgut (Anreise mit der Bahn)', sprite:'puzzle',
        min:20, max:120, step:5, basis:60, einheit:'€', k:-0.0018,
        hilfe:'Ohne Anreise keine Übernachtung – beides gehört zur selben Reise.' },
      { key:'substitut', label:'Preis Substitutionsgut (Ferienwohnung je Nacht)', sprite:'tausch',
        min:40, max:160, step:5, basis:90, einheit:'€', k:0.0020,
        hilfe:'Eine Ferienwohnung erfüllt für Urlaubsgäste denselben Zweck.' },
      P_GESCHMACK, P_ERWARTUNG,
    ] },

  { key:'ferienwohnung', name:'Ferienwohnungen', kurz:'Ferienwohnung', emoji:'🏡', sprite:'wohnung',
    qUnit:'Übernachtungen', gutTyp:'normales Gut', komp:'Endreinigung', subst:'Hotelzimmer',
    prices:[70,90,110], quantities:[400,600,800], kb:[20,25,40,50], kd:[10,20,25,40], steps:[5,10,20],
    parameter:[
      P_EINKOMMEN,
      { key:'komplement', label:'Preis Komplementärgut (Endreinigung je Aufenthalt)', sprite:'puzzle',
        min:30, max:120, step:5, basis:60, einheit:'€', k:-0.0020,
        hilfe:'Die Endreinigung wird mit jeder Buchung fällig – sie verteuert den ganzen Aufenthalt.' },
      { key:'substitut', label:'Preis Substitutionsgut (Hotelzimmer je Nacht)', sprite:'tausch',
        min:50, max:180, step:5, basis:110, einheit:'€', k:0.0020,
        hilfe:'Ein Hotelzimmer ist die naheliegende Alternative zur Ferienwohnung.' },
      P_GESCHMACK, P_ERWARTUNG,
    ] },

  { key:'restaurant', name:'Restaurantbesuche', kurz:'Restaurant', emoji:'🍽️', sprite:'restaurant',
    qUnit:'Gedecke', gutTyp:'normales Gut', komp:'Getränke', subst:'Lieferdienste',
    prices:[15,20,25,30], quantities:[400,600,800], kb:[5,10,15,20], kd:[5,10,15], steps:[1,2,5],
    parameter:[
      P_EINKOMMEN,
      { key:'komplement', label:'Preis Komplementärgut (Getränk zum Essen)', sprite:'puzzle',
        min:2, max:9, step:0.5, basis:4.5, einheit:'€', k:-0.030,
        hilfe:'Zum Essen im Restaurant wird fast immer etwas getrunken – Speisen und Getränke ergänzen sich.' },
      { key:'substitut', label:'Preis Substitutionsgut (Gericht vom Lieferdienst)', sprite:'tausch',
        min:8, max:30, step:1, basis:16, einheit:'€', k:0.010,
        hilfe:'Ein Lieferdienst stillt denselben Hunger – nur ohne Restaurantbesuch.' },
      P_GESCHMACK, P_ERWARTUNG,
    ] },

  { key:'cafe', name:'Kaffeespezialitäten', kurz:'Café', emoji:'☕', sprite:'kaffee',
    qUnit:'Tassen', gutTyp:'normales Gut', komp:'Kuchen', subst:'Tee',
    prices:[2,3,4,5], quantities:[400,600,800], kb:[1,2,3,4], kd:[1,2,3], steps:[0.5,1],
    parameter:[
      P_EINKOMMEN,
      { key:'komplement', label:'Preis Komplementärgut (Stück Kuchen)', sprite:'puzzle',
        min:2, max:6, step:0.1, basis:3.5, einheit:'€', k:-0.060,
        hilfe:'Im Café gehören Kaffee und Kuchen zusammen.' },
      { key:'substitut', label:'Preis Substitutionsgut (Tee je Kännchen)', sprite:'tausch',
        min:1.5, max:5, step:0.1, basis:3, einheit:'€', k:0.070,
        hilfe:'Tee ist für viele Gäste die Alternative zum Kaffee.' },
      P_GESCHMACK, P_ERWARTUNG,
    ] },

  { key:'tagung', name:'Tagungspauschalen', kurz:'Tagung', emoji:'💼', sprite:'diagramm',
    qUnit:'Teilnehmertage', gutTyp:'normales Gut', komp:'Hotelübernachtung', subst:'Online-Meetings',
    prices:[40,50,60,80], quantities:[800,1000,1200], kb:[20,25,40,50], kd:[10,20,25,30], steps:[5,10,20],
    parameter:[
      P_EINKOMMEN,
      { key:'komplement', label:'Preis Komplementärgut (Übernachtung der Teilnehmer)', sprite:'puzzle',
        min:50, max:180, step:5, basis:100, einheit:'€', k:-0.0020,
        hilfe:'Mehrtägige Tagungen gibt es nur zusammen mit Übernachtungen.' },
      { key:'substitut', label:'Preis Substitutionsgut (Online-Meeting-Lizenz je Teilnehmer)', sprite:'tausch',
        min:5, max:40, step:1, basis:15, einheit:'€', k:0.0060,
        hilfe:'Ein Online-Meeting ersetzt manche Tagung vor Ort.' },
      P_GESCHMACK, P_ERWARTUNG,
    ] },

  { key:'pauschalreise', name:'Pauschalreisen', kurz:'Pauschalreise', emoji:'✈️', sprite:'flugreise',
    qUnit:'Buchungen', gutTyp:'normales Gut', komp:'Reiseversicherung', subst:'Individualreisen',
    prices:[600,800,1000], quantities:[800,1000,1200], kb:[200,250,400], kd:[100,200,250], steps:[25,50,100],
    parameter:[
      P_EINKOMMEN,
      { key:'komplement', label:'Preis Komplementärgut (Reiseversicherung)', sprite:'puzzle',
        min:20, max:150, step:5, basis:60, einheit:'€', k:-0.0016,
        hilfe:'Eine Reiseversicherung wird zusammen mit der Pauschalreise abgeschlossen.' },
      { key:'substitut', label:'Preis Substitutionsgut (Individualreise)', sprite:'tausch',
        min:400, max:1400, step:50, basis:850, einheit:'€', k:0.00025,
        hilfe:'Wer Flug und Hotel selbst bucht, braucht keine Pauschalreise.' },
      P_GESCHMACK, P_ERWARTUNG,
    ] },

  { key:'event', name:'Veranstaltungstickets', kurz:'Events', emoji:'🎟️', sprite:'kinoticket',
    qUnit:'Tickets', gutTyp:'normales Gut', komp:'Übernachtung am Veranstaltungsort', subst:'Kinobesuche',
    prices:[30,40,50,60], quantities:[600,800,1000], kb:[10,20,25,40], kd:[10,20,25], steps:[5,10],
    parameter:[
      P_EINKOMMEN,
      { key:'komplement', label:'Preis Komplementärgut (Hotelzimmer am Veranstaltungsort)', sprite:'puzzle',
        min:50, max:200, step:5, basis:100, einheit:'€', k:-0.0016,
        hilfe:'Wer zu einem Konzert anreist, braucht oft auch ein Zimmer.' },
      { key:'substitut', label:'Preis Substitutionsgut (Kinokarte)', sprite:'tausch',
        min:6, max:20, step:0.5, basis:11, einheit:'€', k:0.016,
        hilfe:'Ein Kinoabend ist eine günstigere Abendunterhaltung.' },
      P_GESCHMACK, P_ERWARTUNG,
    ] },

  { key:'ebike', name:'E-Bike-Tagesmieten', kurz:'E-Bike-Verleih', emoji:'🚲', sprite:'fahrrad',
    qUnit:'Tagesmieten', gutTyp:'normales Gut', komp:'geführte Radtouren', subst:'Leihräder ohne Motor',
    prices:[20,25,30,40], quantities:[300,400,600], kb:[10,15,20], kd:[5,10,15], steps:[1,2,5],
    parameter:[
      P_EINKOMMEN,
      { key:'komplement', label:'Preis Komplementärgut (geführte Radtour)', sprite:'puzzle',
        min:5, max:40, step:1, basis:15, einheit:'€', k:-0.0060,
        hilfe:'Viele Gäste mieten das E-Bike für eine geführte Tour.' },
      { key:'substitut', label:'Preis Substitutionsgut (Leihrad ohne Motor)', sprite:'tausch',
        min:5, max:30, step:1, basis:12, einheit:'€', k:0.0080,
        hilfe:'Ein normales Leihrad erfüllt denselben Zweck – mit mehr Muskelkraft.' },
      P_GESCHMACK, P_ERWARTUNG,
    ] },

  { key:'mietwagen', name:'Mietwagen', kurz:'Mietwagen', emoji:'🚗', sprite:'eauto',
    qUnit:'Miettage', gutTyp:'normales Gut', komp:'Kraftstoff', subst:'Shuttle- und Taxifahrten',
    prices:[40,50,60,80], quantities:[800,1000,1200], kb:[20,25,40,50], kd:[10,20,25,30], steps:[5,10,20],
    parameter:[
      P_EINKOMMEN,
      { key:'komplement', label:'Preis Komplementärgut (Kraftstoff je Liter)', sprite:'puzzle',
        min:1.2, max:2.6, step:0.05, basis:1.8, einheit:'€', k:-0.15,
        hilfe:'Ohne Kraftstoff fährt kein Mietwagen – beides wird zusammen gebraucht.' },
      { key:'substitut', label:'Preis Substitutionsgut (Shuttlefahrt)', sprite:'tausch',
        min:10, max:60, step:1, basis:30, einheit:'€', k:0.0050,
        hilfe:'Ein Hotelshuttle oder Taxi ersetzt für viele Gäste den Mietwagen.' },
      P_GESCHMACK, P_ERWARTUNG,
    ] },
];"""


# ---------------------------------------------------------------------------
# Ereignisse für Stufe 3 und die Zeichenübung (Verschiebungen)
# curve: N = Nachfrage, A = Angebot; dir: rechts/links
# ---------------------------------------------------------------------------
VERSCHIEBUNGEN = r"""const SHIFT_EVENTS = [
  { t:sc=>`Die Konjunktur läuft gut: Die Haushalte haben mehr Geld für Urlaub und Freizeit. ${sc.name} sind ein normales Gut.`,
    curve:'N', dir:'rechts', why:'Bei einem normalen Gut steigt die Nachfrage, wenn das Einkommen steigt – die Nachfragekurve wandert nach rechts.' },
  { t:sc=>`Eine Rezession lässt die verfügbaren Einkommen sinken; viele sparen zuerst bei Reisen und beim Essengehen. ${sc.name} sind ein normales Gut.`,
    curve:'N', dir:'links', why:'Sinkendes Einkommen senkt bei einem normalen Gut die Nachfrage bei jedem Preis – die Nachfragekurve wandert nach links.' },
  { t:sc=>`Der Preis für ${sc.komp} steigt kräftig. Es handelt sich um ein Komplementärgut.`,
    curve:'N', dir:'links', why:'Komplementärgüter werden gemeinsam genutzt. Wird das Ergänzungsgut teurer, sinkt die Nachfrage nach dem Hauptgut.' },
  { t:sc=>`Der Preis für ${sc.komp} (Komplementärgut) fällt deutlich.`,
    curve:'N', dir:'rechts', why:'Wird das Ergänzungsgut billiger, wird das Gesamtpaket günstiger – die Nachfrage nach dem Hauptgut steigt.' },
  { t:sc=>`Der Preis für ${sc.subst} steigt stark an. Es handelt sich um ein Substitutionsgut.`,
    curve:'N', dir:'rechts', why:'Wird das Ersatzgut teurer, weichen die Gäste auf dieses Angebot aus – die Nachfrage steigt.' },
  { t:sc=>`Der Preis für ${sc.subst} (Substitutionsgut) fällt spürbar.`,
    curve:'N', dir:'links', why:'Ein billigeres Ersatzangebot zieht Gäste ab – die Nachfragekurve wandert nach links.' },
  { t:()=>`In der Stadt findet eine große Messe mit tausenden Besucherinnen und Besuchern statt.`,
    curve:'N', dir:'rechts', why:'Mehr Besucher in der Region erhöhen die nachgefragte Menge bei jedem Preis – die Nachfragekurve wandert nach rechts.' },
  { t:()=>`Ein großes Reiseportal kürt die Region zum „Geheimtipp des Jahres“.`,
    curve:'N', dir:'rechts', why:'Ein besseres Image der Region steigert die Präferenzen der Gäste – die Nachfrage steigt bei jedem Preis.' },
  { t:sc=>`Die Gäste erwarten, dass ${sc.name} in der nächsten Saison deutlich teurer werden, und buchen früher.`,
    curve:'N', dir:'rechts', why:'Erwartete Preissteigerungen ziehen Buchungen in die Gegenwart vor – die heutige Nachfrage steigt.' },
  { t:()=>`Nach einem Bericht über Hygienemängel in mehreren Betrieben der Region bleiben Gäste fern.`,
    curve:'N', dir:'links', why:'Verschlechterte Präferenzen senken die Nachfrage bei jedem Preis – Nachfrage nach links.' },
  { t:()=>`Die Preise für Energie und Lebensmittel steigen kräftig.`,
    curve:'A', dir:'links', why:'Höhere Kosten je Gast senken die angebotene Menge bei jedem Preis – die Angebotskurve wandert nach links (oben).' },
  { t:()=>`Der gesetzliche Mindestlohn steigt. Für die personalintensive Branche steigen damit die Kosten je Gast.`,
    curve:'A', dir:'links', why:'Höhere Personalkosten wirken wie eine Kostenerhöhung – die Angebotskurve verschiebt sich nach links (oben).' },
  { t:()=>`Fachkräftemangel: Viele Betriebe finden kein Personal und müssen Zimmer, Tische oder Öffnungszeiten reduzieren.`,
    curve:'A', dir:'links', why:'Weniger verfügbare Kapazität senkt die angebotene Menge bei jedem Preis – Angebot nach links.' },
  { t:()=>`Digitaler Self-Check-in und neue Buchungssoftware senken die Kosten je Gast deutlich.`,
    curve:'A', dir:'rechts', why:'Sinkende Kosten erhöhen die angebotene Menge bei jedem Preis – Angebot nach rechts.' },
  { t:sc=>`Mehrere neue Betriebe eröffnen in der Region und bieten ${sc.name} an.`,
    curve:'A', dir:'rechts', why:'Mehr Anbieter erhöhen die Menge, die bei jedem Preis angeboten wird – Angebot nach rechts.' },
  { t:()=>`Die Gemeinde führt eine Übernachtungssteuer je Gast ein, die die Betriebe abführen müssen.`,
    curve:'A', dir:'links', why:'Eine Abgabe je Gast wirkt wie eine Stücksteuer und damit wie eine Kostenerhöhung – Angebot nach links (oben).' },
  { t:()=>`Der Freistaat zahlt den Betrieben in der Nebensaison einen Zuschuss je Gast.`,
    curve:'A', dir:'rechts', why:'Eine Subvention senkt die effektiven Kosten – die Angebotskurve verschiebt sich nach rechts (unten).' },
];"""


# ---------------------------------------------------------------------------
# Marktabenteuer: Ereignisse rund um einen Betrieb im Gastgewerbe
# ---------------------------------------------------------------------------
SPIEL = r"""const SPIEL_EREIGNISSE = [
  { id:'trend', emoji:'🔥', titel:'Reise-Influencer begeistert', art:'nachfrage', vz:1, staerke:0.18, richtig:0,
    text:sc => `Ein Reise-Influencer stellt ${sc.name} in deiner Region vor. Auf einmal wollen bei jedem Preis deutlich mehr Gäste buchen.`,
    erklaerung:'Geänderte Präferenzen verschieben die gesamte Nachfragekurve nach rechts.', ...F_NACHFRAGE },
  { id:'rezession', emoji:'📉', titel:'Die Konjunktur schwächelt', art:'nachfrage', vz:-1, staerke:0.15, richtig:1,
    text:() => 'Die Wirtschaft kühlt ab. Die Haushalte halten ihr Geld zusammen und sparen zuerst bei Reisen und beim Essengehen.',
    erklaerung:'Bei einem normalen Gut senkt ein niedrigeres Einkommen die Nachfrage bei jedem Preis.', ...F_NACHFRAGE },
  { id:'messe', emoji:'🎪', titel:'Große Messe in der Stadt', art:'nachfrage', vz:1, staerke:0.16, richtig:0,
    text:() => 'Eine internationale Fachmesse bringt für mehrere Tage tausende Besucherinnen und Besucher in die Stadt.',
    erklaerung:'Mehr Besucher in der Region erhöhen die Nachfrage bei jedem Preis – die Kurve wandert nach rechts.', ...F_NACHFRAGE },
  { id:'regen', emoji:'🌧️', titel:'Wochenlanger Regen', art:'nachfrage', vz:-1, staerke:0.14, richtig:1,
    text:() => 'Der Wetterbericht sagt für die nächsten Wochen Dauerregen voraus. Viele Gäste verschieben ihren Ausflug.',
    erklaerung:'Ungünstige äußere Umstände senken die Nachfrage bei jedem Preis – die Kurve wandert nach links.', ...F_NACHFRAGE },
  { id:'komp', emoji:'🔗', titel:'Ergänzungsgut wird teurer', art:'nachfrage', vz:-1, staerke:0.13, richtig:1,
    text:sc => `Der Preis für ${sc.komp} steigt kräftig. Deine Gäste brauchen es zusammen mit deinem Angebot.`,
    erklaerung:'Wird das Komplementärgut teurer, wird das Gesamtpaket teurer – die Nachfrage nach deinem Angebot sinkt.', ...F_NACHFRAGE },
  { id:'subst', emoji:'🔁', titel:'Ersatzangebot wird teurer', art:'nachfrage', vz:1, staerke:0.15, richtig:0,
    text:sc => `Der Preis für ${sc.subst} zieht stark an – für viele Gäste ist das die Alternative zu deinem Angebot.`,
    erklaerung:'Wird das Substitutionsgut teurer, weichen Gäste auf dein Angebot aus – deine Nachfrage steigt.', ...F_NACHFRAGE },
  { id:'bewertung', emoji:'⭐', titel:'Top-Bewertungen', art:'nachfrage', vz:1, staerke:0.16, richtig:0,
    text:() => 'Nach vielen Fünf-Sterne-Bewertungen steht dein Betrieb auf einem großen Bewertungsportal ganz oben.',
    erklaerung:'Ein besseres Image erhöht die Zahlungsbereitschaft – die Nachfragekurve wandert nach rechts.', ...F_NACHFRAGE },
  { id:'presse', emoji:'📰', titel:'Schlechte Schlagzeilen', art:'nachfrage', vz:-1, staerke:0.16, richtig:1,
    text:() => 'Ein Zeitungsbericht über Hygienemängel in mehreren Betrieben der Region verunsichert die Gäste.',
    erklaerung:'Verschlechterte Präferenzen senken die Nachfrage bei jedem Preis.', ...F_NACHFRAGE },
  { id:'energie', emoji:'🏭', titel:'Energie und Lebensmittel werden teurer', art:'kosten', vz:1, staerke:0.14, richtig:0,
    text:() => 'Strom, Heizung und Lebensmittel kosten deutlich mehr. Jeder Gast verursacht dir höhere Kosten.',
    erklaerung:'Höhere Kosten je Gast verschieben die Angebotskurve nach oben bzw. links.', ...F_KOSTEN },
  { id:'mindestlohn', emoji:'💶', titel:'Der Mindestlohn steigt', art:'kosten', vz:1, staerke:0.12, richtig:0,
    text:() => 'Der gesetzliche Mindestlohn wird angehoben. Im personalintensiven Gastgewerbe steigen damit deine Kosten je Gast.',
    erklaerung:'Höhere Personalkosten wirken wie eine Kostenerhöhung – das Angebot wandert nach links.', ...F_KOSTEN },
  { id:'digital', emoji:'⚙️', titel:'Digitaler Check-in', art:'kosten', vz:-1, staerke:0.13, richtig:1,
    text:() => 'Ein neues Buchungs- und Check-in-System spart viel Arbeitszeit an der Rezeption und senkt deine Kosten je Gast.',
    erklaerung:'Sinkende Kosten je Gast verschieben die Angebotskurve nach unten bzw. rechts.', ...F_KOSTEN },
  { id:'steuer', emoji:'🏛️', titel:'Neue Übernachtungssteuer', art:'kosten', vz:1, staerke:0.12, richtig:0,
    text:() => 'Die Gemeinde führt eine Abgabe je Gast ein, die du an die Stadtkasse abführen musst.',
    erklaerung:'Eine Abgabe je Gast wirkt wie eine Stücksteuer – das Angebot wandert nach links.', ...F_KOSTEN },
  { id:'subvention', emoji:'🤝', titel:'Förderprogramm Nebensaison', art:'kosten', vz:-1, staerke:0.12, richtig:1,
    text:() => 'Der Freistaat fördert Betriebe in der Nebensaison mit einem Zuschuss je Gast.',
    erklaerung:'Eine Subvention senkt die effektiven Kosten – das Angebot wandert nach rechts.', ...F_KOSTEN },
  { id:'preiskampf', emoji:'⚔️', titel:'Die Konkurrenz greift an', art:'konkurrenz', vz:-1, staerke:0.12, richtig:0,
    text:() => 'Dein größter Mitbewerber senkt seine Preise auf den Buchungsportalen deutlich und wirbt offensiv um deine Gäste.',
    erklaerung:'Wird der Konkurrent günstiger, verlierst du bei unverändertem Preis Gäste.', ...F_KONKURRENZ },
  { id:'konkTeuer', emoji:'💸', titel:'Die Konkurrenz wird teurer', art:'konkurrenz', vz:1, staerke:0.12, richtig:1,
    text:() => 'Dein Mitbewerber hebt die Preise an, weil seine Energie- und Personalkosten gestiegen sind.',
    erklaerung:'Ist der Konkurrent teurer, wirkst du im Vergleich günstiger und gewinnst Gäste.', ...F_KONKURRENZ },
  { id:'neuerAnbieter', emoji:'🏬', titel:'Neueröffnung nebenan', art:'konkurrenz', vz:-1, staerke:0.10, angebotRechts:true, richtig:0,
    text:sc => `Eine Kette eröffnet in deiner Stadt und lockt mit Eröffnungspreisen für ${sc.name}.`,
    erklaerung:'Mehr Anbieter drücken das Preisniveau – bei unverändertem Preis sinkt dein Absatz.', ...F_KONKURRENZ },
  { id:'konkUmbau', emoji:'🚧', titel:'Konkurrent baut um', art:'konkurrenz', vz:1, staerke:0.14, richtig:1,
    text:() => 'Beim Mitbewerber wird renoviert. Er hat kaum freie Kapazität und hebt die Preise an.',
    erklaerung:'Der Konkurrent wird teurer – deine relative Position verbessert sich.', ...F_KONKURRENZ },
  { id:'personal', emoji:'🤒', titel:'Personalausfall', art:'kapazitaet', richtig:0,
    text:() => 'Mehrere Mitarbeitende fallen krankheitsbedingt aus. Diese Runde kannst du nur eine begrenzte Zahl an Gästen bedienen.',
    erklaerung:'Die Kapazitätsgrenze begrenzt deinen Absatz – mehr Gäste kannst du nicht bedienen, auch wenn mehr kommen wollen.', ...F_KAPAZITAET },
];"""


# ---------------------------------------------------------------------------
# Marktteilnehmer im Gastgewerbe – nur hinterlegte Figuren aus assets/icons/
# ---------------------------------------------------------------------------
TEILNEHMER = r"""const NACHFRAGESEITE = [
  { sprite:'tourist',   name:'Urlaubsgäste',       text:'Reisen in der Freizeit und vergleichen Preise – sie reagieren stark auf den Preis.' },
  { sprite:'haendler',  name:'Geschäfts\u00ADreisende', text:'Reisen beruflich, der Arbeitgeber zahlt – sie reagieren kaum auf den Preis.' },
  { sprite:'haushalte', name:'Tagesgäste',         text:'Besuchen Restaurant, Café oder Veranstaltung. Ihr Einkommen bestimmt die Nachfrage mit.' },
];

const ANGEBOTSSEITE = [
  { sprite:'unternehmen', name:'Hotels & Gastronomie', text:'Bieten Zimmer, Speisen und Service an. Ihre Kosten je Gast bilden die Angebotskurve.' },
  { sprite:'lieferant',   name:'Lieferanten',         text:'Liefern Lebensmittel, Getränke und Wäsche – ihre Preise wirken auf das Angebot.' },
  { sprite:'investor',    name:'Investor:innen',       text:'Bauen und modernisieren Betriebe – mehr Kapazität bedeutet mehr Angebot.' },
];

const RAHMEN = [
  { sprite:'staat', name:'Staat & Gemeinde', text:'Mindestlohn, Übernachtungssteuer, Kurbeitrag und Förderprogramme greifen in den Markt ein.' },
];"""


def main():
    s = QUELLE.read_text(encoding='utf-8')

    # --- Inhalte ---------------------------------------------------------
    s = block(s, 'const SCENARIOS = [', '\n];', SZENARIEN)
    s = block(s, 'const SHIFT_EVENTS = [', '\n];', VERSCHIEBUNGEN)
    s = block(s, 'const SPIEL_EREIGNISSE = [', '\n];', SPIEL)
    # NACHFRAGESEITE, ANGEBOTSSEITE und RAHMEN stehen direkt hintereinander
    s = block(s, 'const NACHFRAGESEITE = [', '\n];\n\nconst TeilnehmerRaster',
              TEILNEHMER + '\n\nconst TeilnehmerRaster')

    # Fortschritt getrennt vom FOS/BOS-Simulator speichern
    s = ersetze(s, "const STORE_KEY = 'marktsim_v1';", "const STORE_KEY = 'marktsim_hofa_v1';")

    # Gäste statt Konsumenten
    s = ersetze(s, 'Einkommen der Konsumenten', 'Einkommen der Gäste', 4)
    s = ersetze(s, "label:'Geschmack / Trends'", "label:'Bewertungen / Trends'")
    s = ersetze(s, 'titel="HERSTELLER"', 'titel="ANBIETER"')
    s = ersetze(s, 'titel="KONSUMENTEN"', 'titel="GÄSTE"')
    s = ersetze(s, "['Käufer heute', fmt(nachfrage)]", "['Gäste heute', fmt(nachfrage)]")

    # --- Marktabenteuer --------------------------------------------------
    s = ersetze(s, 'Führe dein eigenes Unternehmen', 'Führe deinen eigenen Betrieb')
    s = ersetze(s, 'Im Spielmodus führst du ein Unternehmen.', 'Im Spielmodus führst du einen Betrieb im Gastgewerbe.')
    s = ersetze(s, 'text={`Führe ein Unternehmen: ${SPIEL_RUNDEN} Runden, jede Runde eine neue Preisentscheidung.`}',
                   'text={`Führe einen Betrieb im Gastgewerbe: ${SPIEL_RUNDEN} Runden, jede Runde eine neue Preisentscheidung.`}')

    # --- Theorie: Beispiele aus dem Gastgewerbe --------------------------
    s = ersetze(s, 'Ein <b>Mindestpreis</b> (z. B. Mindestlohn, Agrarpreise) wirkt',
                   'Ein <b>Mindestpreis</b> (z. B. der Mindestlohn auf dem Arbeitsmarkt – im Gastgewerbe besonders wichtig) wirkt')
    s = ersetze(s, """      <p>Unelastisch reagieren typischerweise lebensnotwendige Güter ohne Ersatz (Medikamente, Benzin, Grundnahrungsmittel),
         elastisch dagegen Luxusgüter und Güter mit vielen Substituten.</p>""",
"""      <p>Unelastisch reagieren typischerweise lebensnotwendige Güter ohne Ersatz (Medikamente, Benzin, Grundnahrungsmittel),
         elastisch dagegen Luxusgüter und Güter mit vielen Substituten.</p>
      <p><b>Im Tourismus:</b> Urlaubsgäste reagieren meist <b>elastisch</b> – sie vergleichen Angebote und können
         Reiseziel oder Termin wechseln. Geschäftsreisende reagieren eher <b>unelastisch</b> – Termin und Ort stehen fest,
         oft zahlt der Arbeitgeber. Deshalb verlangen Hotels je nach Gästegruppe, Wochentag und Saison
         unterschiedliche Preise (<i>Revenue Management</i>).</p>""")

    # --- Titel und Kennzeichnung -----------------------------------------
    s = ersetze(s, '<title>Marktnachfrage-Simulator – Angebot &amp; Nachfrage</title>',
                   '<title>Markt-Simulator Hotel &amp; Tourismus – Angebot &amp; Nachfrage</title>')
    s = ersetze(s, '<span className="sm:hidden">Marktsimulator</span><span className="hidden sm:inline">Marktnachfrage-Simulator</span>',
                   '<span className="sm:hidden">Hofa-Markt</span><span className="hidden sm:inline">Markt-Simulator Hotel &amp; Tourismus</span>')
    s = ersetze(s, 'Verstehe Märkte. Analysiere Zusammenhänge. Löse Aufgaben.',
                   'Angebot und Nachfrage in Hotellerie, Gastronomie und Tourismus.')
    s = ersetze(s, 'Angebot und Nachfrage · Level {lvl}', 'Hotel &amp; Tourismus · Level {lvl}')
    s = ersetze(s, """                Marktnachfrage-Simulator für den Wirtschaftsunterricht: Angebot und Nachfrage, Marktgleichgewicht,""",
                   """                Markt-Simulator für den VWL-Unterricht an der Hotelfachschule – mit Märkten aus Hotellerie,
                Gastronomie und Tourismus: Angebot und Nachfrage, Marktgleichgewicht,""")
    s = ersetze(s, 'Marktnachfrage-Simulator · Fortschritt wird nur lokal auf diesem Gerät gespeichert',
                   'Markt-Simulator Hotel &amp; Tourismus · Fortschritt wird nur lokal auf diesem Gerät gespeichert')

    hinweis = ('<!-- Hofa-Fassung: erzeugt aus markt-simulator.html mit tools/hofa_bauen.py.\n'
               '     Nicht von Hand bearbeiten – Änderungen im Hauptsimulator bzw. im Skript vornehmen. -->\n')
    s = ersetze(s, '<title>', hinweis + '<title>')

    ZIEL.write_text(s, encoding='utf-8')
    print(f'{ZIEL.name} erzeugt: {len(s) // 1024} KB')


if __name__ == '__main__':
    main()
