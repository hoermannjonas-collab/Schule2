/* ==========================================================================
   Inhalte der Hofa-Fassung (VWL Hotelfachschule, 1. Schuljahr, Lernbereich 2
   „Zusammenhänge zwischen Markt und Preis erfassen“).

   tools/hofa_bauen.py setzt jeden Abschnitt dieser Datei an die passende
   Stelle von markt-simulator.html und schreibt das Ergebnis nach
   hofa-markt-simulator.html. Ein Abschnitt beginnt mit einer Zeile
   „//#ABSCHNITT name“ und reicht bis zum nächsten Abschnitt.

   Grundlage: Bestandsaufnahme LB 2 vom 04.11.2026 (Lehrplan, Sequenzplanung,
   Fachinput DS09–DS28, Statusdokumente T21–T23):
   - Schreibweise p (Preis) und x (Menge), Funktionen p = a − b·x bzw. p = c + d·x
   - Anrede „Sie“
   - keine Konsumenten-/Produzentenrente, kein Prohibitivpreis, keine Sättigungsmenge
   - Angebots- und Nachfrageüberhang, Kapazitätsgrenze, Doppelverschiebung,
     Fehlersuche, Einkommens- und Kreuzpreiselastizität
   ========================================================================== */

//#ABSCHNITT maerkte
const P_EINKOMMEN = { key:'einkommen', label:'Einkommen der Gäste', sprite:'geld',
  min:70, max:130, step:5, basis:100, einheit:'%', k:0.0060,
  hilfe:'Bei einem normalen Gut steigt die Nachfrage mit dem Einkommen.' };
const P_GESCHMACK = { key:'geschmack', label:'Bewertungen / Trends', sprite:'herz',
  min:70, max:130, step:5, basis:100, einheit:'%', k:0.0070,
  hilfe:'Gute Bewertungen und Trends erhöhen die Nachfrage bei jedem Preis.' };
const P_ERWARTUNG = { key:'erwartung', label:'Erwarteter Preis in Zukunft', sprite:'trend',
  min:80, max:120, step:5, basis:100, einheit:'%', k:0.0040,
  hilfe:'Wer künftig steigende Preise erwartet, bucht früher – die Nachfrage steigt schon heute.' };

const SCENARIOS = [
  { key:'hotel', name:'Hotelübernachtungen', kurz:'Hotel', emoji:'🏨', sprite:'hotel',
    qUnit:'Zimmer', gutTyp:'normales Gut', komp:'Anreise', subst:'Ferienwohnungen',
    prices:[60,80,100,120], quantities:[400,600,800,1000], kb:[20,25,40,50,80], kd:[20,25,40,50], steps:[5,10,20],
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
    prices:[70,90,110], quantities:[400,500,800], kb:[20,25,40,50], kd:[10,20,25,40], steps:[5,10,20],
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
    prices:[15,20,25,30], quantities:[400,500,600,800], kb:[5,8,10,20], kd:[4,5,8,10], steps:[1,2,5],
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
    prices:[3,4,5], quantities:[400,500,600,800], kb:[1,2,2.5,4], kd:[1,2,2.5], steps:[0.5,1],
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
    prices:[40,50,60,80], quantities:[400,500,800,1000], kb:[20,25,40,50], kd:[10,20,25], steps:[5,10,20],
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
    prices:[600,800,1000], quantities:[400,500,800,1000], kb:[200,250,400], kd:[100,200,250], steps:[25,50,100],
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
    prices:[30,40,50,60], quantities:[400,500,800,1000], kb:[10,20,25,40], kd:[10,20,25], steps:[5,10],
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
    prices:[20,25,30,40], quantities:[200,250,400,500], kb:[5,10,20], kd:[5,10], steps:[1,2,5],
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
    prices:[40,50,60,80], quantities:[400,500,800,1000], kb:[20,25,40,50], kd:[10,20,25], steps:[5,10,20],
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
];

//#ABSCHNITT marktgenerator
// Im Unterricht stehen die Funktionen in der Form p = a − b·x. Die Steigungen
// 1/b und 1/d müssen deshalb glatte Dezimalzahlen sein (z. B. 0,25 oder 0,125).
const glatteDezimale = (v, n = 3) => Math.abs(v * 10 ** n - Math.round(v * 10 ** n)) < 1e-9;
function makeMarket(sc) {
  const cand = [];
  for (const P of sc.prices) for (const Q of sc.quantities)
    for (const kb of sc.kb) for (const kd of sc.kd) {
      if (kd >= P) continue;                       // Angebot muss bei einem positiven Preis beginnen
      const b = Q / kb, d = Q / kd;
      if (!Number.isInteger(b) || !Number.isInteger(d)) continue;
      if (b < 1 || d < 1 || d > 12 * b || b > 12 * d) continue;
      if (!glatteDezimale(1 / b) || !glatteDezimale(1 / d)) continue;
      // Bei jedem Preisschritt der Aufgaben ganze Mengen (keine 562,5 Tassen)
      if (!sc.steps.every(st => Number.isInteger(b * st) && Number.isInteger(d * st))) continue;
      cand.push({ a: Q + b * P, b, c: Q - d * P, d, P, Q, kb, kd, sc });
    }
  return cand.length ? pick(cand) : { a: 1200, b: 4, c: -400, d: 4, P: 200, Q: 400, kb: 100, kd: 100, sc };
}

//#ABSCHNITT aufgaben
const STUFEN = [
  { nr:1, name:'Marktgleichgewicht',      emoji:'⚖️', kurz:'Gleichgewicht',        reward:15 },
  { nr:2, name:'Überhänge und Kapazität', emoji:'🏨', kurz:'Überhang & Kapazität', reward:20 },
  { nr:3, name:'Marktveränderungen',      emoji:'↔️', kurz:'Verschiebungen',       reward:25 },
  { nr:4, name:'Staatliche Eingriffe',    emoji:'🏛️', kurz:'Höchst-/Mindestpreis', reward:25 },
  { nr:5, name:'Elastizitäten',           emoji:'📐', kurz:'Elastizitäten',        reward:30 },
];

const TOL_P = 0.02, TOL_Q = 0.5;

/* --- Schreibweise wie im Hofa-Unterricht -------------------------------
   Intern rechnet der Simulator mit Qd = a − b·P und Qs = c + d·P.
   Angezeigt wird die nach p umgestellte Form:  N: p = a − b·x,  A: p = c + d·x */
const dez = (v) => {
  for (const n of [0, 1, 2, 3]) if (Math.abs(v * 10 ** n - Math.round(v * 10 ** n)) < 1e-6) return fmt(v, n);
  return fmt(v, 3);
};
const zs = (v) => (v < 0 ? '−' + dez(-v) : dez(v));           // Zahl mit Vorzeichen bei negativen Werten
const inv = (m) => ({ a: m.a / m.b, b: 1 / m.b, c: -m.c / m.d, d: 1 / m.d });
const nFkt = (m, i = '') => `N${i}: p = ${dez(inv(m).a)} − ${dez(inv(m).b)}x`;
const aFkt = (m, i = '') => `A${i}: p = ${zs(inv(m).c)} + ${dez(inv(m).d)}x`;
const xVonN = (m, p) => qd(m, p);                              // x aus N bei gegebenem p
const xVonA = (m, p) => qs(m, p);

function wegGleichgewicht(m, sc, i = '*') {
  const f = inv(m), k = marktKennzahlen(m);
  return [
    `Gleichsetzen N = A:  ${dez(f.a)} − ${dez(f.b)}x = ${zs(f.c)} + ${dez(f.d)}x`,
    `${dez(f.a)} ${f.c < 0 ? '+ ' + dez(-f.c) : '− ' + dez(f.c)} = ${dez(f.b)}x + ${dez(f.d)}x   →   ${dez(f.a - f.c)} = ${dez(f.b + f.d)}x`,
    `x${i} = ${dez(f.a - f.c)} : ${dez(f.b + f.d)} = ${fmt(k.Q)} ${sc.qUnit}`,
    `p${i} = ${dez(f.a)} − ${dez(f.b)} · ${fmt(k.Q)} = ${eur(k.P)}`,
    `Probe mit A:  p = ${zs(f.c)} + ${dez(f.d)} · ${fmt(k.Q)} = ${eur(k.P)} ✓`,
  ];
}

function mischen(optionen, richtig) {
  const idx = optionen.map((_, i) => i).sort(() => Math.random() - 0.5);
  return { options: idx.map(i => optionen[i]), correct: idx.indexOf(richtig) };
}

/* --- Stufe 1: Gleichgewicht berechnen ----------------------------------- */
function taskGleichgewicht() {
  const sc = pick(SCENARIOS), m = makeMarket(sc), k = marktKennzahlen(m);
  return {
    stufe:1, sc, m, titel:'Marktgleichgewicht berechnen',
    aufgabe:[
      `Auf dem Markt für ${sc.name} gelten folgende Funktionen (p in €, x in ${sc.qUnit}):`,
      'FUNKTIONEN',
      'Berechnen Sie die Gleichgewichtsmenge x* und den Gleichgewichtspreis p*.',
    ],
    fields:[
      { key:'q', label:'Gleichgewichtsmenge x*', unit:sc.qUnit, correct:k.Q, tol:TOL_Q, dec:0 },
      { key:'p', label:'Gleichgewichtspreis p*', unit:'€', correct:k.P, tol:TOL_P, dec:2 },
    ],
    tipp:'Im Gleichgewicht stimmen die Preise beider Funktionen überein. Setzen Sie N und A gleich und lösen Sie nach x auf. Setzen Sie x* anschließend in eine der Funktionen ein.',
    loesung: wegGleichgewicht(m, sc),
    chart:{ showEq:false },
    reward:15,
  };
}

/* --- Stufe 1: Funktion nach x umstellen ---------------------------------- */
function taskUmstellen() {
  const sc = pick(SCENARIOS), m = makeMarket(sc), f = inv(m);
  const nachfrage = Math.random() < 0.5;
  const faktor = nachfrage ? -m.b : m.d, konst = nachfrage ? m.a : m.c;
  return {
    stufe:1, sc, m, titel:'Funktion nach x umstellen',
    aufgabe:[
      `Auf dem Markt für ${sc.name} lautet die ${nachfrage ? 'Nachfragefunktion' : 'Angebotsfunktion'} (p in €, x in ${sc.qUnit}):`,
      nachfrage ? nFkt(m) : aFkt(m),
      `Stellen Sie die Funktion nach x um, sodass sie die Form x = … · p + … hat. Wie viele ${sc.qUnit} werden bei einem Preis von ${eur(m.P)} ${nachfrage ? 'nachgefragt' : 'angeboten'}?`,
    ],
    fields:[
      { key:'f', label:'Zahl vor p (mit Vorzeichen)', unit:'', correct:faktor, tol:0.01, dec:2 },
      { key:'k', label:'Absolutes Glied (mit Vorzeichen)', unit:'', correct:konst, tol:0.5, dec:0 },
      { key:'x', label:`Menge bei p = ${eur(m.P)}`, unit:sc.qUnit, correct:m.Q, tol:TOL_Q, dec:0 },
    ],
    tipp: nachfrage
      ? 'Bringen Sie den x-Term auf eine Seite: p = a − b·x  →  b·x = a − p  →  x = a : b − p : b.'
      : 'Bringen Sie das absolute Glied auf die andere Seite: p = c + d·x  →  d·x = p − c  →  x = p : d − c : d.',
    loesung: nachfrage ? [
      `${nFkt(m).slice(3)}   | + ${dez(f.b)}x − p`,
      `${dez(f.b)}x = ${dez(f.a)} − p   | : ${dez(f.b)}`,
      `x = ${fmt(m.a)} − ${fmt(m.b)}p`,
      `Bei p = ${eur(m.P)}:  x = ${fmt(m.a)} − ${fmt(m.b)} · ${dez(m.P)} = ${fmt(m.Q)} ${sc.qUnit}`,
    ] : [
      `${aFkt(m).slice(3)}   | ${f.c < 0 ? '+ ' + dez(-f.c) : '− ' + dez(f.c)}`,
      `p ${f.c < 0 ? '+ ' + dez(-f.c) : '− ' + dez(f.c)} = ${dez(f.d)}x   | : ${dez(f.d)}`,
      `x = ${fmt(m.d)}p ${m.c < 0 ? '− ' + fmt(-m.c) : '+ ' + fmt(m.c)}`,
      `Bei p = ${eur(m.P)}:  x = ${fmt(m.d)} · ${dez(m.P)} ${m.c < 0 ? '− ' + fmt(-m.c) : '+ ' + fmt(m.c)} = ${fmt(m.Q)} ${sc.qUnit}`,
    ],
    chart:false,
    reward:15,
  };
}

/* --- Stufe 2: Überhang bei einem gegebenen Preis ------------------------- */
const ueberhangWort = (zuHoch) => zuHoch ? 'Angebotsüberhang' : 'Nachfrageüberhang';

function taskUeberhang() {
  const sc = pick(SCENARIOS), m = makeMarket(sc), f = inv(m);
  const zuHoch = Math.random() < 0.5;
  const grenze = zuHoch ? m.kb : m.kd;
  const moeglich = sc.steps.filter(s => s > 0 && s < grenze);
  const d = moeglich.length ? pick(moeglich) : grenze / 2;
  const p = zuHoch ? m.P + d : m.P - d;
  const xn = xVonN(m, p), xa = xVonA(m, p), ue = Math.abs(xn - xa);
  return {
    stufe:2, sc, m, titel:'Überhang bei einem gegebenen Preis',
    aufgabe:[
      `Auf dem Markt für ${sc.name} gelten folgende Funktionen (p in €, x in ${sc.qUnit}):`,
      'FUNKTIONEN',
      `Angenommen, der Preis liegt bei p = ${eur(p)}.`,
      'Berechnen Sie die nachgefragte und die angebotene Menge zu diesem Preis sowie die Höhe des Überhangs.',
    ],
    choices:[{ key:'art', frage:'Welcher Marktzustand liegt bei diesem Preis vor?',
      options:['Angebotsüberhang', 'Nachfrageüberhang', 'Gleichgewicht – kein Überhang'], correct: zuHoch ? 0 : 1 }],
    fields:[
      { key:'xn', label:`nachgefragte Menge bei ${eur(p)}`, unit:sc.qUnit, correct:xn, tol:TOL_Q, dec:0 },
      { key:'xa', label:`angebotene Menge bei ${eur(p)}`, unit:sc.qUnit, correct:xa, tol:TOL_Q, dec:0 },
      { key:'ue', label:'Höhe des Überhangs', unit:sc.qUnit, correct:ue, tol:TOL_Q, dec:0 },
    ],
    tipp:'Setzen Sie den Preis in beide Funktionen ein und lösen Sie jeweils nach x auf. Ist die angebotene Menge größer, entsteht ein Angebotsüberhang, sonst ein Nachfrageüberhang.',
    loesung:[
      `N:  ${dez(p)} = ${dez(f.a)} − ${dez(f.b)}x  →  x = (${dez(f.a)} − ${dez(p)}) : ${dez(f.b)} = ${fmt(xn)} ${sc.qUnit}`,
      `A:  ${dez(p)} = ${zs(f.c)} + ${dez(f.d)}x  →  x = (${dez(p)} ${f.c < 0 ? '+ ' + dez(-f.c) : '− ' + dez(f.c)}) : ${dez(f.d)} = ${fmt(xa)} ${sc.qUnit}`,
      zuHoch
        ? `Angebotsüberhang = ${fmt(xa)} − ${fmt(xn)} = ${fmt(ue)} ${sc.qUnit}. Der Preis liegt über dem Gleichgewichtspreis (${eur(m.P)}); ein Teil des Angebots bleibt ungenutzt – der Preis gerät unter Druck.`
        : `Nachfrageüberhang = ${fmt(xn)} − ${fmt(xa)} = ${fmt(ue)} ${sc.qUnit}. Der Preis liegt unter dem Gleichgewichtspreis (${eur(m.P)}); nicht alle Gäste kommen zum Zug – der Preis steigt.`,
    ],
    chart:{ showEq:true, priceLine:p, gapLabel:true },
    reward:20,
  };
}

/* --- Stufe 2: Kapazitätsgrenze -------------------------------------------- */
function kapazitaetsFall() {
  for (let v = 0; v < 60; v++) {
    const sc = pick(SCENARIOS), m = makeMarket(sc), k0 = marktKennzahlen(m);
    const ev = pick(SHIFT_EVENTS.filter(e => e.curve === 'N' && e.dir === 'rechts'));
    const vs = verschiebeMarkt(sc, m, ev, true);
    if (!vs) continue;
    const { m2, delta } = vs;
    const k1 = marktKennzahlen(m2);
    const raster = k0.Q >= 1000 ? 50 : 20;
    const K = Math.round((k0.Q + (k1.Q - k0.Q) * (0.3 + 0.35 * Math.random())) / raster) * raster;
    if (!(K > k0.Q && K < k1.Q - raster / 2)) continue;
    const pK = (m2.a - K) / m2.b;                       // Preis aus der neuen Nachfrage bei der Grenzmenge
    if (!glatteDezimale(pK, 2) || !glatteDezimale(delta, 0) || !glatteDezimale(inv(m2).a, 2)) continue;
    return { sc, m, m2, ev, delta, K, pK, k0, k1 };
  }
  return null;
}

function taskKapazitaet() {
  const fall = kapazitaetsFall();
  if (!fall) return taskUeberhang();
  const { sc, m, m2, ev, delta, K, pK, k1 } = fall;
  const f1 = inv(m2);
  return {
    stufe:2, sc, m, m2, titel:'Gleichgewicht mit Kapazitätsgrenze',
    aufgabe:[
      `Auf dem Markt für ${sc.name} gelten folgende Funktionen (p in €, x in ${sc.qUnit}):`,
      'FUNKTIONEN',
      `Die Anbieter in der Region können zusammen höchstens ${fmt(K)} ${sc.qUnit} anbieten (Kapazitätsgrenze).`,
      `Ereignis: ${ev.t(sc)} Dadurch steigt die Nachfrage bei jedem Preis um ${fmt(delta)} ${sc.qUnit}.`,
      'Berechnen Sie das neue Marktgleichgewicht unter Beachtung der Kapazitätsgrenze.',
    ],
    choices:[{ key:'grenze', frage:'Was bestimmt nach dem Ereignis die gehandelte Menge?', ...mischen([
      'Die Kapazitätsgrenze – mehr kann nicht angeboten werden, der Preis ergibt sich aus der Nachfrage.',
      'Der Schnittpunkt der neuen Nachfrage mit der ursprünglichen Angebotsgeraden.',
      'Die ursprüngliche Gleichgewichtsmenge – an der Menge ändert sich nichts.',
    ], 0) }],
    fields:[
      { key:'x', label:'neue gehandelte Menge x₁', unit:sc.qUnit, correct:K, tol:TOL_Q, dec:0 },
      { key:'p', label:'neuer Gleichgewichtspreis p₁', unit:'€', correct:pK, tol:TOL_P, dec:2 },
    ],
    tipp:'Stellen Sie zuerst die neue Nachfragefunktion auf und berechnen Sie den Schnittpunkt mit A. Liegt diese Menge über der Kapazitätsgrenze, wird nur die Grenzmenge gehandelt – den Preis liefert dann die Nachfragefunktion.',
    loesung:[
      `Neue Nachfrage: p = ${dez(inv(m).a)} − ${dez(f1.b)} · (x − ${fmt(delta)}) = ${dez(f1.a)} − ${dez(f1.b)}x  →  ${nFkt(m2, '₁')}`,
      `Schnittpunkt N₁ = A ohne Grenze: x = ${dez(f1.a - f1.c)} : ${dez(f1.b + f1.d)} = ${fmt(k1.Q)} ${sc.qUnit} – das ist mehr als die Kapazität von ${fmt(K)}.`,
      `Gehandelt werden deshalb nur x₁ = ${fmt(K)} ${sc.qUnit}. Ab der Kapazitätsgrenze verläuft die Angebotskurve senkrecht.`,
      `Preis aus N₁:  p₁ = ${dez(f1.a)} − ${dez(f1.b)} · ${fmt(K)} = ${eur(pK)}`,
      `Ohne Kapazitätsgrenze läge der Preis nur bei ${eur(k1.P)} – die knappe Kapazität treibt den Preis zusätzlich nach oben.`,
    ],
    chart:{ showEq:true, kapazitaet:K },
    reward:20,
  };
}

/* --- Stufe 3: Verschiebung von Angebot / Nachfrage ----------------------- */
const SHIFT_EVENTS = [
  { t:sc=>`Die Konjunktur läuft gut: Die Haushalte haben mehr Geld für Urlaub und Freizeit. ${sc.name} sind ein normales Gut.`,
    curve:'N', dir:'rechts', why:'Bei einem normalen Gut steigt die Nachfrage, wenn das Einkommen steigt – die Nachfragekurve verschiebt sich nach rechts.' },
  { t:sc=>`Eine Rezession lässt die verfügbaren Einkommen sinken; viele sparen zuerst bei Reisen und beim Essengehen. ${sc.name} sind ein normales Gut.`,
    curve:'N', dir:'links', why:'Sinkendes Einkommen senkt bei einem normalen Gut die Nachfrage bei jedem Preis – die Nachfragekurve verschiebt sich nach links.' },
  { t:sc=>`Der Preis für ${sc.komp} steigt kräftig. Es handelt sich um ein Komplementärgut.`,
    curve:'N', dir:'links', why:'Komplementärgüter werden gemeinsam genutzt. Wird das Ergänzungsgut teurer, sinkt die Nachfrage nach dem Hauptgut.' },
  { t:sc=>`Der Preis für ${sc.komp} (Komplementärgut) fällt deutlich.`,
    curve:'N', dir:'rechts', why:'Wird das Ergänzungsgut billiger, wird das Gesamtpaket günstiger – die Nachfrage nach dem Hauptgut steigt.' },
  { t:sc=>`Der Preis für ${sc.subst} steigt stark an. Es handelt sich um ein Substitutionsgut.`,
    curve:'N', dir:'rechts', why:'Wird das Ersatzgut teurer, weichen die Gäste auf dieses Angebot aus – die Nachfrage steigt.' },
  { t:sc=>`Der Preis für ${sc.subst} (Substitutionsgut) fällt spürbar.`,
    curve:'N', dir:'links', why:'Ein billigeres Ersatzangebot zieht Gäste ab – die Nachfragekurve verschiebt sich nach links.' },
  { t:()=>`In der Stadt findet ein großes Festival mit tausenden Besucherinnen und Besuchern statt.`,
    curve:'N', dir:'rechts', why:'Mehr Nachfrager in der Region erhöhen die nachgefragte Menge bei jedem Preis – die Nachfragekurve verschiebt sich nach rechts.' },
  { t:()=>`Die Hauptsaison beginnt, und der Wetterbericht verspricht wochenlang Sonnenschein.`,
    curve:'N', dir:'rechts', why:'Saison und Wetter erhöhen die Zahl der Gäste bei jedem Preis – die Nachfragekurve verschiebt sich nach rechts.' },
  { t:sc=>`Die Gäste erwarten, dass ${sc.name} in der nächsten Saison deutlich teurer werden, und buchen früher.`,
    curve:'N', dir:'rechts', why:'Erwartete Preissteigerungen ziehen Buchungen in die Gegenwart vor – die heutige Nachfrage steigt.' },
  { t:()=>`Eine Sturmwarnung für das kommende Wochenende führt zu zahlreichen Stornierungen.`,
    curve:'N', dir:'links', why:'Weniger Gäste wollen bei jedem Preis buchen – die Nachfragekurve verschiebt sich nach links.' },
  { t:()=>`Nach einem Bericht über Hygienemängel in mehreren Betrieben der Region bleiben Gäste fern.`,
    curve:'N', dir:'links', why:'Verschlechterte Präferenzen senken die Nachfrage bei jedem Preis – die Nachfragekurve verschiebt sich nach links.' },
  { t:()=>`Die Preise für Energie und Lebensmittel steigen kräftig.`,
    curve:'A', dir:'links', why:'Höhere Kosten je Gast senken die angebotene Menge bei jedem Preis – die Angebotskurve verschiebt sich nach links (oben).' },
  { t:()=>`Der gesetzliche Mindestlohn steigt. Für die personalintensive Branche steigen damit die Kosten je Gast.`,
    curve:'A', dir:'links', why:'Höhere Personalkosten wirken wie eine Kostenerhöhung – die Angebotskurve verschiebt sich nach links (oben).' },
  { t:()=>`Fachkräftemangel: Viele Betriebe finden kein Personal und müssen Zimmer, Tische oder Öffnungszeiten reduzieren.`,
    curve:'A', dir:'links', why:'Weniger verfügbare Kapazität senkt die angebotene Menge bei jedem Preis – die Angebotskurve verschiebt sich nach links.' },
  { t:()=>`Digitaler Self-Check-in und neue Buchungssoftware senken die Kosten je Gast deutlich.`,
    curve:'A', dir:'rechts', why:'Sinkende Kosten erhöhen die angebotene Menge bei jedem Preis – die Angebotskurve verschiebt sich nach rechts.' },
  { t:sc=>`Mehrere neue Betriebe eröffnen in der Region und bieten ${sc.name} an.`,
    curve:'A', dir:'rechts', why:'Mehr Anbieter erhöhen die Menge, die bei jedem Preis angeboten wird – die Angebotskurve verschiebt sich nach rechts.' },
  { t:()=>`Der Freistaat zahlt den Betrieben in der Nebensaison einen Zuschuss je Gast.`,
    curve:'A', dir:'rechts', why:'Eine Subvention senkt die effektiven Kosten – die Angebotskurve verschiebt sich nach rechts (unten).' },
];

const SHIFT_OPTIONS = [
  'Die Nachfragekurve verschiebt sich nach rechts (Nachfrage steigt).',
  'Die Nachfragekurve verschiebt sich nach links (Nachfrage sinkt).',
  'Die Angebotskurve verschiebt sich nach rechts (Angebot steigt).',
  'Die Angebotskurve verschiebt sich nach links (Angebot sinkt).',
];

// Parallelverschiebung einer Kurve: nur der Achsenabschnitt ändert sich.
// k ist die Preisänderung im neuen Gleichgewicht, delta die Mengenverschiebung bei jedem Preis.
// Liefert null, wenn auf diesem Markt keine Verschiebung mit glatten Zahlen möglich ist –
// die Aufrufer ziehen dann einen neuen Markt.
const glatterMarkt = (m2) => {
  const f = inv(m2), k2 = marktKennzahlen(m2);
  return glatteDezimale(f.a, 2) && glatteDezimale(f.c, 2) && f.c > 0
    && glatteDezimale(k2.Q, 0) && glatteDezimale(k2.P, 2) && k2.Q > 0 && k2.P > f.c;
};
function verschiebeMarkt(sc, m, ev, gross = false) {
  const grenze = Math.min(m.kb, m.kd, m.P);
  const moeglich = sc.steps.filter(s => s > 0 && s < grenze);
  const vz = ev.dir === 'rechts' ? 1 : -1;
  const reihenfolge = gross ? [...moeglich].sort((x, y) => y - x) : [...moeglich].sort(() => Math.random() - 0.5);
  for (const k of reihenfolge) {
    const delta = k * (m.b + m.d);
    const m2 = ev.curve === 'N' ? { ...m, a: m.a + vz * delta } : { ...m, c: m.c + vz * delta };
    if (Number.isInteger(delta) && glatterMarkt(m2)) return { m2, k, delta };
  }
  return null;
}

// So entsteht die neue Funktion in p-Schreibweise aus der Mengenverschiebung
function neueFunktionText(m, m2, ev, delta) {
  const f = inv(m), f2 = inv(m2), mehr = ev.dir === 'rechts';
  if (ev.curve === 'N')
    return `Neue Nachfrage: p = ${dez(f.a)} − ${dez(f.b)} · (x ${mehr ? '−' : '+'} ${fmt(delta)}) = ${dez(f2.a)} − ${dez(f2.b)}x  →  ${nFkt(m2, '₁')}`;
  return `Neues Angebot: p = ${zs(f.c)} + ${dez(f.d)} · (x ${mehr ? '−' : '+'} ${fmt(delta)}) = ${zs(f2.c)} + ${dez(f2.d)}x  →  ${aFkt(m2, '₁')}`;
}

function verschiebungsFall(marktVon, gross = false) {
  for (let v = 0; v < 80; v++) {
    const sc = pick(SCENARIOS), m = marktVon(sc), ev = pick(SHIFT_EVENTS);
    const vs = verschiebeMarkt(sc, m, ev, gross);
    if (vs) return { sc, m, ev, ...vs };
  }
  throw new Error('Keine Verschiebung mit glatten Zahlen gefunden');
}

function taskVerschiebung() {
  const { sc, m, ev, m2, delta } = verschiebungsFall(makeMarket);
  const k0 = marktKennzahlen(m), k1 = marktKennzahlen(m2), f2 = inv(m2);
  const nachfrage = ev.curve === 'N';
  const optIdx = nachfrage ? (ev.dir === 'rechts' ? 0 : 1) : (ev.dir === 'rechts' ? 2 : 3);
  return {
    stufe:3, sc, m, m2, titel:'Marktveränderung berechnen',
    aufgabe:[
      'Ausgangslage – gegeben sind die Funktionen:',
      'FUNKTIONEN',
      `Gleichgewicht: x* = ${fmt(k0.Q)} ${sc.qUnit}, p* = ${eur(k0.P)}.`,
      `Ereignis: ${ev.t(sc)}`,
      `Dadurch wird bei jedem Preis ${nachfrage ? 'die nachgefragte' : 'die angebotene'} Menge um ${fmt(delta)} ${sc.qUnit} ${ev.dir === 'rechts' ? 'größer' : 'kleiner'}.`,
      `Beurteilen Sie, welche Kurve sich in welche Richtung verschiebt. Stellen Sie die neue ${nachfrage ? 'Nachfragefunktion' : 'Angebotsfunktion'} auf und berechnen Sie das neue Gleichgewicht.`,
    ],
    choices:[{ key:'shift', frage:'Was passiert im Diagramm (ceteris paribus)?', options:SHIFT_OPTIONS, correct:optIdx }],
    fields:[
      { key:'achse', label:`Achsenabschnitt der neuen ${nachfrage ? 'Nachfrage' : 'Angebots'}funktion (p bei x = 0)`, unit:'€',
        correct: nachfrage ? f2.a : f2.c, tol:TOL_P, dec:2 },
      { key:'q', label:'Neue Gleichgewichtsmenge x₁', unit:sc.qUnit, correct:k1.Q, tol:TOL_Q, dec:0 },
      { key:'p', label:'Neuer Gleichgewichtspreis p₁', unit:'€', correct:k1.P, tol:TOL_P, dec:2 },
    ],
    tipp: nachfrage
      ? 'Steigt die Nachfrage bei jedem Preis um Δ, ersetzen Sie x durch (x − Δ): p = a − b · (x − Δ). Bei sinkender Nachfrage entsprechend (x + Δ). Die Steigung bleibt gleich.'
      : 'Steigt das Angebot bei jedem Preis um Δ, ersetzen Sie x durch (x − Δ): p = c + d · (x − Δ). Bei sinkendem Angebot entsprechend (x + Δ). Die Steigung bleibt gleich.',
    loesung:[
      ev.why,
      neueFunktionText(m, m2, ev, delta),
      ...wegGleichgewicht(m2, sc, '₁').slice(0, 4),
      `Veränderung: Der Preis ${k1.P > k0.P ? 'steigt' : 'sinkt'} um ${eur(Math.abs(k1.P - k0.P))}, die Menge ${k1.Q > k0.Q ? 'steigt' : 'sinkt'} um ${fmt(Math.abs(k1.Q - k0.Q))} ${sc.qUnit}.`,
    ],
    chart:{ showEq:true },
    reward:25,
  };
}

/* --- Stufe 3: Doppelverschiebung ------------------------------------------ */
function taskDoppel() {
  for (let v = 0; v < 40; v++) {
    const sc = pick(SCENARIOS), m = makeMarket(sc);
    const evN = pick(SHIFT_EVENTS.filter(e => e.curve === 'N'));
    const evA = pick(SHIFT_EVENTS.filter(e => e.curve === 'A'));
    const n = verschiebeMarkt(sc, m, evN), a = verschiebeMarkt(sc, m, evA);
    if (!n || !a) continue;
    const m2 = { ...m, a: n.m2.a, c: a.m2.c };
    const k0 = marktKennzahlen(m), k1 = marktKennzahlen(m2);
    if (!(k1.Q > 0.2 * k0.Q) || !glatterMarkt(m2)) continue;
    const gleich = evN.dir === evA.dir;          // beide rechts oder beide links → nur die Menge ist eindeutig
    const optionen = [
      'Nur die Menge verändert sich eindeutig; die Preiswirkung hängt davon ab, welche Verschiebung stärker ist.',
      'Nur der Preis verändert sich eindeutig; die Mengenwirkung hängt davon ab, welche Verschiebung stärker ist.',
      'Preis und Menge verändern sich beide eindeutig.',
    ];
    return {
      stufe:3, sc, m, m2, titel:'Doppelverschiebung',
      aufgabe:[
        'Ausgangslage – gegeben sind die Funktionen:',
        'FUNKTIONEN',
        `Gleichzeitig treten zwei Ereignisse ein: (1) ${evN.t(sc)} (2) ${evA.t(sc)}`,
        `Die neuen Funktionen lauten:  ${nFkt(m2, '₁')}  und  ${aFkt(m2, '₁')}`,
        'Beurteilen Sie zuerst ohne Rechnung, was sich eindeutig sagen lässt. Berechnen Sie danach das neue Gleichgewicht.',
      ],
      choices:[{ key:'eindeutig', frage:'Was lässt sich ohne Zahlen eindeutig sagen?', options:optionen, correct: gleich ? 0 : 1 }],
      fields:[
        { key:'q', label:'Neue Gleichgewichtsmenge x₁', unit:sc.qUnit, correct:k1.Q, tol:TOL_Q, dec:0 },
        { key:'p', label:'Neuer Gleichgewichtspreis p₁', unit:'€', correct:k1.P, tol:TOL_P, dec:2 },
      ],
      tipp:'Zeichnen Sie beide Verschiebungen in eine Skizze. Verschieben sich beide Kurven in dieselbe Richtung, ist nur die Mengenwirkung eindeutig; verschieben sie sich gegenläufig, nur die Preiswirkung.',
      loesung:[
        `${evN.why} ${evA.why}`,
        gleich
          ? `Beide Kurven verschieben sich nach ${evN.dir}: Die Menge ${evN.dir === 'rechts' ? 'steigt' : 'sinkt'} sicher; ob der Preis steigt oder sinkt, hängt von der Stärke der Verschiebungen ab.`
          : `Die Kurven verschieben sich gegenläufig: Der Preis ${evN.dir === 'rechts' ? 'steigt' : 'sinkt'} sicher; die Mengenwirkung hängt von der Stärke der Verschiebungen ab.`,
        ...wegGleichgewicht(m2, sc, '₁').slice(0, 4),
        `Mit diesen Zahlen: Preis ${k1.P > k0.P + 1e-9 ? 'steigt' : k1.P < k0.P - 1e-9 ? 'sinkt' : 'bleibt gleich'} (${eur(k0.P)} → ${eur(k1.P)}), Menge ${k1.Q > k0.Q + 1e-9 ? 'steigt' : k1.Q < k0.Q - 1e-9 ? 'sinkt' : 'bleibt gleich'} (${fmt(k0.Q)} → ${fmt(k1.Q)}).`,
      ],
      chart:{ showEq:true },
      reward:25,
    };
  }
  return taskVerschiebung();
}

/* --- Fehlersuche (Stufen 3–5) ---------------------------------------------- */
const FEHLER = [
  { thema:3, aussage:sc => `„Der Preis für ${sc.name} steigt. Deshalb verschiebt sich die Nachfragekurve nach links.“`,
    richtig:'Falsch: Ändert sich der Preis des Gutes selbst, bewegt man sich auf der Nachfragekurve nach oben – die Kurve verschiebt sich nicht.',
    falsch:['Richtig: Ein höherer Preis senkt die Nachfrage, also wandert die Kurve nach links.',
            'Falsch: Die Nachfragekurve verschiebt sich nach rechts.'] },
  { thema:3, aussage:() => '„Die Energiepreise steigen. Deshalb verschiebt sich die Nachfragekurve nach links.“',
    richtig:'Falsch: Energie ist ein Kostenfaktor der Betriebe – betroffen ist das Angebot. Die Angebotskurve verschiebt sich nach links.',
    falsch:['Richtig: Die Gäste haben weniger Geld und fragen weniger nach.',
            'Falsch: Die Angebotskurve verschiebt sich nach rechts.'] },
  { thema:3, aussage:sc => `„Wenn die Nachfrage nach ${sc.name} steigt, sinkt der Gleichgewichtspreis, weil mehr verkauft wird.“`,
    richtig:'Falsch: Verschiebt sich die Nachfragekurve nach rechts, steigen Gleichgewichtspreis und Gleichgewichtsmenge.',
    falsch:['Richtig: Mehr Absatz senkt den Preis.',
            'Falsch: Der Preis bleibt gleich, nur die Menge steigt.'] },
  { thema:3, aussage:() => '„Steigen Angebot und Nachfrage gleichzeitig, steigen Preis und Menge auf jeden Fall.“',
    richtig:'Falsch: Eindeutig ist nur, dass die Menge steigt. Ob der Preis steigt oder sinkt, hängt davon ab, welche Verschiebung stärker ist.',
    falsch:['Richtig: Beide Verschiebungen erhöhen den Preis.',
            'Falsch: Eindeutig ist nur, dass der Preis steigt.'] },
  { thema:3, aussage:() => '„Ist die Kapazitätsgrenze erreicht, kann der Preis nicht mehr steigen.“',
    richtig:'Falsch: An der Kapazitätsgrenze kann die Menge nicht mehr steigen. Steigt die Nachfrage weiter, steigt nur noch der Preis.',
    falsch:['Richtig: Ohne freie Kapazität bleibt der Preis gleich.',
            'Falsch: An der Kapazitätsgrenze sinkt der Preis.'] },
  { thema:4, aussage:() => '„Ein Höchstpreis führt immer zu einem Angebotsüberhang.“',
    richtig:'Falsch: Ein bindender Höchstpreis liegt unter dem Gleichgewichtspreis und führt zu einem Nachfrageüberhang.',
    falsch:['Richtig: Bei einem Höchstpreis bieten die Betriebe zu viel an.',
            'Falsch: Ein Höchstpreis hat nie eine Wirkung.'] },
  { thema:4, aussage:sc => `„Der Staat legt für ${sc.name} einen Mindestpreis unter dem Gleichgewichtspreis fest. Dadurch entsteht ein Angebotsüberhang.“`,
    richtig:'Falsch: Ein Mindestpreis unter dem Gleichgewichtspreis ist nicht bindend – der Markt bleibt im Gleichgewicht.',
    falsch:['Richtig: Jeder Mindestpreis erzeugt einen Angebotsüberhang.',
            'Falsch: Es entsteht ein Nachfrageüberhang.'] },
  { thema:4, aussage:() => '„Der Mindestlohn ist ein Höchstpreis auf dem Arbeitsmarkt.“',
    richtig:'Falsch: Der Mindestlohn ist ein Mindestpreis – der Lohn darf nicht darunter liegen.',
    falsch:['Richtig: Der Staat begrenzt damit die Löhne nach oben.',
            'Falsch: Der Mindestlohn ist kein staatlicher Eingriff in den Markt.'] },
  { thema:5, aussage:() => '„Die Nachfrage ist elastisch (|ε| > 1). Eine Preiserhöhung steigert also den Umsatz.“',
    richtig:'Falsch: Bei elastischer Nachfrage sinkt die Menge überproportional – der Umsatz sinkt.',
    falsch:['Richtig: Ein höherer Preis bringt immer mehr Umsatz.',
            'Falsch: Der Umsatz bleibt gleich.'] },
  { thema:5, aussage:() => '„Der Umsatz ist gestiegen, also hat der Betrieb auch mehr Gewinn gemacht.“',
    richtig:'Falsch: Umsatz ist nicht Gewinn – vom Umsatz müssen erst die Kosten abgezogen werden.',
    falsch:['Richtig: Mehr Umsatz bedeutet immer mehr Gewinn.',
            'Falsch: Umsatz und Gewinn hängen nicht zusammen.'] },
  { thema:5, aussage:() => '„Eine negative Kreuzpreiselastizität zeigt, dass zwei Güter Substitute sind.“',
    richtig:'Falsch: Eine negative Kreuzpreiselastizität kennzeichnet Komplementärgüter, eine positive Substitute.',
    falsch:['Richtig: Substitute haben immer eine negative Kreuzpreiselastizität.',
            'Falsch: Das Vorzeichen sagt über die Güterbeziehung nichts aus.'] },
];

function taskFehlersuche(thema) {
  const item = pick(FEHLER.filter(f => f.thema === thema));
  const sc = pick(SCENARIOS);
  const { options, correct } = mischen([item.richtig, ...item.falsch], 0);
  return {
    stufe:thema, sc, m:makeMarket(sc), titel:'Fehlersuche',
    aufgabe:['Jana schreibt in ihrer Hausaufgabe:', item.aussage(sc), 'Prüfen Sie die Aussage.'],
    choices:[{ key:'urteil', frage:'Welche Beurteilung trifft zu?', options, correct }],
    fields:[],
    tipp:'Fragen Sie sich: Welche Marktseite ist betroffen? Ändert sich der Preis des Gutes selbst oder ein anderer Einflussfaktor?',
    loesung:[item.richtig],
    chart:false,
    reward:20,
  };
}

/* --- Stufe 4: Höchst- und Mindestpreise ------------------------------------ */
function taskEingriff() {
  const sc = pick(SCENARIOS), m = makeMarket(sc), f = inv(m);
  const hoechst = Math.random() < 0.5;
  const bindend = Math.random() < 0.8;
  const grenze = hoechst === bindend ? m.kd : m.kb;
  const moeglich = sc.steps.filter(s => s > 0 && s < grenze);
  const k = moeglich.length ? pick(moeglich) : grenze / 2;
  // bindender Höchstpreis unter p*, bindender Mindestpreis über p*; sonst umgekehrt (wirkungslos)
  const Pfix = (hoechst === bindend) ? m.P - k : m.P + k;
  const art = hoechst ? 'Höchstpreis' : 'Mindestpreis';
  const einleitung = hoechst
    ? `Der Staat legt zum Schutz der Gäste einen Höchstpreis von ${eur(Pfix)} fest.`
    : `Der Staat legt zum Schutz der Anbieter einen Mindestpreis von ${eur(Pfix)} fest.`;

  if (!bindend) {
    return {
      stufe:4, sc, m, titel:`${art} prüfen`,
      aufgabe:['Gegeben sind die Funktionen:', 'FUNKTIONEN',
        `Das freie Marktgleichgewicht liegt bei x* = ${fmt(m.Q)} ${sc.qUnit} und p* = ${eur(m.P)}.`, einleitung,
        'Beurteilen Sie die Wirkung des Eingriffs und geben Sie die gehandelte Menge an.'],
      choices:[{ key:'zustand', frage:'Welcher Marktzustand entsteht?', options:[
        'Nachfrageüberhang', 'Angebotsüberhang', 'Der Markt bleibt im Gleichgewicht – der Eingriff ist nicht bindend.',
      ], correct:2 }],
      fields:[{ key:'x', label:'gehandelte Menge', unit:sc.qUnit, correct:m.Q, tol:TOL_Q, dec:0 }],
      tipp:'Ein Höchstpreis wirkt nur, wenn er unter dem Gleichgewichtspreis liegt; ein Mindestpreis nur, wenn er darüber liegt.',
      loesung:[
        hoechst
          ? `Der Höchstpreis von ${eur(Pfix)} liegt über dem Gleichgewichtspreis von ${eur(m.P)}. Der Marktpreis darf ihn ohnehin nicht erreichen – der Eingriff ist nicht bindend.`
          : `Der Mindestpreis von ${eur(Pfix)} liegt unter dem Gleichgewichtspreis von ${eur(m.P)}. Der Marktpreis liegt ohnehin darüber – der Eingriff ist nicht bindend.`,
        `Es bleibt beim Gleichgewicht: gehandelt werden ${fmt(m.Q)} ${sc.qUnit} zu ${eur(m.P)}.`,
      ],
      chart:{ showEq:true, priceLine:Pfix },
      reward:25,
    };
  }

  const xn = xVonN(m, Pfix), xa = xVonA(m, Pfix), ue = Math.abs(xn - xa);
  return {
    stufe:4, sc, m, titel:`${art} analysieren`,
    aufgabe:['Gegeben sind die Funktionen:', 'FUNKTIONEN',
      `Das freie Marktgleichgewicht liegt bei x* = ${fmt(m.Q)} ${sc.qUnit} und p* = ${eur(m.P)}.`, einleitung,
      'Berechnen Sie die nachgefragte und die angebotene Menge zu diesem Preis sowie den entstehenden Überhang.'],
    choices:[{ key:'zustand', frage:'Welcher Marktzustand entsteht?', options:[
      'Nachfrageüberhang', 'Angebotsüberhang', 'Der Markt bleibt im Gleichgewicht – der Eingriff ist nicht bindend.',
    ], correct: hoechst ? 0 : 1 }],
    fields:[
      { key:'qn', label:`nachgefragte Menge bei ${eur(Pfix)}`, unit:sc.qUnit, correct:xn, tol:TOL_Q, dec:0 },
      { key:'qa', label:`angebotene Menge bei ${eur(Pfix)}`, unit:sc.qUnit, correct:xa, tol:TOL_Q, dec:0 },
      { key:'ue', label: hoechst ? 'Nachfrageüberhang' : 'Angebotsüberhang', unit:sc.qUnit, correct:ue, tol:TOL_Q, dec:0 },
    ],
    tipp: hoechst
      ? 'Ein bindender Höchstpreis liegt unter dem Gleichgewichtspreis. Setzen Sie den Preis in beide Funktionen ein – die Nachfrage ist dann größer als das Angebot.'
      : 'Ein bindender Mindestpreis liegt über dem Gleichgewichtspreis. Setzen Sie den Preis in beide Funktionen ein – das Angebot ist dann größer als die Nachfrage.',
    loesung:[
      `N:  ${dez(Pfix)} = ${dez(f.a)} − ${dez(f.b)}x  →  x = (${dez(f.a)} − ${dez(Pfix)}) : ${dez(f.b)} = ${fmt(xn)} ${sc.qUnit}`,
      `A:  ${dez(Pfix)} = ${zs(f.c)} + ${dez(f.d)}x  →  x = (${dez(Pfix)} ${f.c < 0 ? '+ ' + dez(-f.c) : '− ' + dez(f.c)}) : ${dez(f.d)} = ${fmt(xa)} ${sc.qUnit}`,
      hoechst
        ? `Nachfrageüberhang = ${fmt(xn)} − ${fmt(xa)} = ${fmt(ue)} ${sc.qUnit}. Gehandelt wird nur die kleinere Menge (${fmt(xa)}); typische Folgen sind Wartelisten und Schwarzmärkte.`
        : `Angebotsüberhang = ${fmt(xa)} − ${fmt(xn)} = ${fmt(ue)} ${sc.qUnit}. Gehandelt wird nur die kleinere Menge (${fmt(xn)}); ein Teil des Angebots findet keine Abnehmer.`,
    ],
    chart:{ showEq:true, priceLine:Pfix, gapLabel:true },
    reward:25,
  };
}

/* --- Stufe 5: Elastizitäten ------------------------------------------------ */
const prozent = (v) => fmt(v * 100, Math.abs(v * 100 - Math.round(v * 100)) < 1e-9 ? 0 : 2) + ' %';

// Preiselastizität aus der Nachfragefunktion
function taskPreisFunktion() {
  const sc = pick(SCENARIOS), m = makeMarket(sc), f = inv(m);
  const kombis = [];
  for (const p1 of [m.P, m.P - Math.min(...sc.steps), m.P + Math.min(...sc.steps)])
    for (const k of sc.steps)
      if (p1 > 0 && qd(m, p1) > 0.25 * m.Q && qd(m, p1 + k) > 0.2 * m.Q) kombis.push([p1, k]);
  const [P1, k] = kombis.length ? pick(kombis) : [m.P, m.kb / 4];
  const P2 = P1 + k, X1 = qd(m, P1), X2 = qd(m, P2);
  const eps = ((X2 - X1) / X1) / ((P2 - P1) / P1), abs = Math.abs(eps);
  const interp = abs > 1.0001 ? 0 : abs < 0.9999 ? 1 : 2;
  const U1 = P1 * X1, U2 = P2 * X2, umsatz = U2 > U1 + 0.01 ? 0 : U2 < U1 - 0.01 ? 1 : 2;
  return {
    stufe:5, sc, m, titel:'Preiselastizität der Nachfrage',
    aufgabe:[
      `Die Nachfrage nach ${sc.name} lautet (p in €, x in ${sc.qUnit}):`, nFkt(m),
      `Der Preis steigt von p₀ = ${eur(P1)} auf p₁ = ${eur(P2)}.`,
      'Berechnen Sie die zugehörigen Mengen und die Preiselastizität der Nachfrage (Ausgangswerte, zwei Nachkommastellen). Beurteilen Sie die Preiserhöhung.',
    ],
    choices:[
      { key:'interp', frage:'Wie ist die Nachfrage in diesem Bereich zu beurteilen?', options:[
        'elastisch (|ε| > 1) – die Menge reagiert überproportional',
        'unelastisch (|ε| < 1) – die Menge reagiert unterproportional',
        'einheitselastisch (|ε| = 1)'], correct:interp },
      { key:'umsatz', frage:'Wie verändert sich der Umsatz (U = p · x)?', options:[
        'Der Umsatz steigt.', 'Der Umsatz sinkt.', 'Der Umsatz bleibt gleich.'], correct:umsatz },
    ],
    fields:[
      { key:'x0', label:'Menge x₀', unit:sc.qUnit, correct:X1, tol:TOL_Q, dec:0 },
      { key:'x1', label:'Menge x₁', unit:sc.qUnit, correct:X2, tol:TOL_Q, dec:0 },
      { key:'e',  label:'Preiselastizität ε (mit Vorzeichen)', unit:'', correct:eps, tol:0.03, dec:2 },
    ],
    tipp:'ε = (Δx : x₀) : (Δp : p₀). Die Mengen erhalten Sie, indem Sie die Preise in die nach x umgestellte Nachfragefunktion einsetzen.',
    loesung:[
      `x = (${dez(f.a)} − p) : ${dez(f.b)}  →  x₀ = ${fmt(X1)} ${sc.qUnit},  x₁ = ${fmt(X2)} ${sc.qUnit}`,
      `Δx : x₀ = ${fmt(X2 - X1)} : ${fmt(X1)} = ${fmt((X2 - X1) / X1, 4)}`,
      `Δp : p₀ = ${dez(P2 - P1)} : ${dez(P1)} = ${fmt((P2 - P1) / P1, 4)}`,
      `ε = ${fmt((X2 - X1) / X1, 4)} : ${fmt((P2 - P1) / P1, 4)} = ${fmt(eps, 2)}  →  ${['elastisch', 'unelastisch', 'einheitselastisch'][interp]}`,
      `Umsatz: ${eur(U1)} → ${eur(U2)}  →  der Umsatz ${['steigt', 'sinkt', 'bleibt gleich'][umsatz]}.`,
    ],
    chart:{ showEq:false, points:[
      { p:P1, q:X1, label:'p₀', color:'#7C3AED' },
      { p:P2, q:X2, label:'p₁', color:'#DB2777' },
    ] },
    reward:30,
  };
}

// Preiselastizität aus Kassendaten
const PREIS_DATEN = [
  { sc:'restaurant', gut:'ein Dessert', einheit:'Portionen', p0:[6.9, 7.9], dp:[1], x0:[400, 500, 600] },
  { sc:'hotel', gut:'ein Doppelzimmer am Wochenende', einheit:'Übernachtungen', p0:[110, 120, 140], dp:[10, 20], x0:[200, 300, 400] },
  { sc:'cafe', gut:'einen Cappuccino', einheit:'Tassen', p0:[3.2, 3.5, 4], dp:[0.4, 0.5], x0:[800, 1000, 1200] },
  { sc:'event', gut:'ein Ticket für die Dinnershow', einheit:'Tickets', p0:[49, 59], dp:[10], x0:[300, 400, 500] },
  { sc:'ebike', gut:'eine E-Bike-Tagesmiete', einheit:'Tagesmieten', p0:[25, 30], dp:[5], x0:[200, 300] },
  { sc:'restaurant', gut:'das Mittagsmenü', einheit:'Menüs', p0:[11.9, 12.9], dp:[1, 2], x0:[500, 600, 800] },
];

function taskPreisDaten() {
  for (let v = 0; v < 50; v++) {
    const d = pick(PREIS_DATEN), sc = scById(d.sc);
    const p0 = pick(d.p0), p1 = Math.round((p0 + pick(d.dp)) * 100) / 100, x0 = pick(d.x0);
    const r = pick([-0.05, -0.08, -0.1, -0.12, -0.15, -0.2, -0.25, -0.3]);
    const x1 = Math.round(x0 * (1 + r));
    const rx = (x1 - x0) / x0, rp = (p1 - p0) / p0, eps = rx / rp, abs = Math.abs(eps);
    const U0 = p0 * x0, U1 = p1 * x1;
    // Nur eindeutige Fälle: elastisch ↔ Umsatz sinkt, unelastisch ↔ Umsatz steigt
    if (Math.abs(abs - 1) < 0.15 || (abs > 1) !== (U1 < U0)) continue;
    const interp = abs > 1 ? 0 : 1;
    return {
      stufe:5, sc, m:makeMarket(sc), titel:'Preiselastizität aus Kassendaten',
      aufgabe:[
        `Ein Betrieb erhöht den Preis für ${d.gut} von ${eur(p0)} auf ${eur(p1)}.`,
        `Die Kassendaten zeigen: Die verkaufte Menge sinkt von ${fmt(x0)} auf ${fmt(x1)} ${d.einheit} im Monat.`,
        'Berechnen Sie die Preiselastizität der Nachfrage (Ausgangswerte, zwei Nachkommastellen) sowie den Umsatz vorher und nachher. Beurteilen Sie die Preiserhöhung.',
      ],
      choices:[
        { key:'interp', frage:'Wie reagiert die Nachfrage?', options:[
          'elastisch (|ε| > 1)', 'unelastisch (|ε| < 1)', 'einheitselastisch (|ε| = 1)'], correct:interp },
        { key:'urteil', frage:'Hat sich die Preiserhöhung für den Umsatz gelohnt?', options:[
          'Ja – der Umsatz ist gestiegen.', 'Nein – der Umsatz ist gesunken.'], correct: U1 > U0 ? 0 : 1 },
      ],
      fields:[
        { key:'e',  label:'Preiselastizität ε (mit Vorzeichen)', unit:'', correct:eps, tol:0.03, dec:2 },
        { key:'u0', label:'Umsatz vorher', unit:'€', correct:U0, tol:0.5, dec:2 },
        { key:'u1', label:'Umsatz nachher', unit:'€', correct:U1, tol:0.5, dec:2 },
      ],
      tipp:'ε = (Δx : x₀) : (Δp : p₀). Umsatz U = p · x.',
      loesung:[
        `Δx : x₀ = (${fmt(x1)} − ${fmt(x0)}) : ${fmt(x0)} = ${prozent(rx)}`,
        `Δp : p₀ = (${dez(p1)} − ${dez(p0)}) : ${dez(p0)} = ${prozent(rp)}`,
        `ε = ${prozent(rx)} : ${prozent(rp)} = ${fmt(eps, 2)}  →  ${interp === 0 ? 'elastisch' : 'unelastisch'}`,
        `Umsatz vorher: ${dez(p0)} € · ${fmt(x0)} = ${eur(U0)};  nachher: ${dez(p1)} € · ${fmt(x1)} = ${eur(U1)}`,
        U1 > U0
          ? 'Der Umsatz steigt: Die Gäste reagieren unterproportional, die Preiserhöhung lohnt sich für den Umsatz.'
          : 'Der Umsatz sinkt: Die Gäste reagieren überproportional, die Preiserhöhung schadet dem Umsatz.',
      ],
      chart:false,
      reward:30,
    };
  }
  return taskPreisFunktion();
}

// Einkommenselastizität
const EINKOMMEN_DATEN = [
  { sc:'restaurant', gut:'Restaurantbesuche am Wochenende', einheit:'Besuche', normal:true },
  { sc:'hotel', gut:'Wellnesswochenenden im Hotel', einheit:'Buchungen', normal:true },
  { sc:'pauschalreise', gut:'Fernreisen', einheit:'Buchungen', normal:true },
  { sc:'cafe', gut:'Brunch im Café', einheit:'Gedecke', normal:true },
  { sc:'restaurant', gut:'Mahlzeiten an der Imbissbude', einheit:'Mahlzeiten', normal:false },
  { sc:'hotel', gut:'Übernachtungen in der Jugendherberge', einheit:'Übernachtungen', normal:false },
  { sc:'cafe', gut:'Automatenkaffee', einheit:'Becher', normal:false },
];

function taskEinkommen() {
  for (let v = 0; v < 50; v++) {
    const d = pick(EINKOMMEN_DATEN), sc = scById(d.sc);
    const y0 = pick([2000, 2400, 2500, 3000]), ry = pick([0.04, 0.05, 0.08, 0.1, -0.04, -0.05]);
    const y1 = Math.round(y0 * (1 + ry));
    const eta = (d.normal ? 1 : -1) * pick([0.5, 0.8, 1.2, 1.5, 2]);
    const x0 = pick([400, 500, 600, 800, 1000]), x1 = Math.round(x0 * (1 + eta * ry));
    const rx = (x1 - x0) / x0, ryEcht = (y1 - y0) / y0, wert = rx / ryEcht;
    if (x1 === x0 || Math.sign(wert) !== (d.normal ? 1 : -1)) continue;
    return {
      stufe:5, sc, m:makeMarket(sc), titel:'Einkommenselastizität',
      aufgabe:[
        `Das durchschnittliche verfügbare Monatseinkommen der Gäste ${y1 > y0 ? 'steigt' : 'sinkt'} von ${eur(y0, 0)} auf ${eur(y1, 0)}.`,
        `Die Nachfrage nach ${d.gut} verändert sich daraufhin von ${fmt(x0)} auf ${fmt(x1)} ${d.einheit} im Monat.`,
        'Berechnen Sie die Einkommenselastizität der Nachfrage (zwei Nachkommastellen) und ordnen Sie das Gut ein.',
      ],
      choices:[{ key:'typ', frage:'Um welche Art von Gut handelt es sich?', options:[
        'normales Gut – die Nachfrage steigt mit dem Einkommen (Elastizität > 0)',
        'inferiores Gut – die Nachfrage sinkt, wenn das Einkommen steigt (Elastizität < 0)'], correct: d.normal ? 0 : 1 }],
      fields:[{ key:'e', label:'Einkommenselastizität (mit Vorzeichen)', unit:'', correct:wert, tol:0.03, dec:2 }],
      tipp:'Einkommenselastizität = (Δx : x₀) : (ΔEinkommen : Einkommen₀). Das Vorzeichen entscheidet über die Einordnung.',
      loesung:[
        `Δx : x₀ = (${fmt(x1)} − ${fmt(x0)}) : ${fmt(x0)} = ${prozent(rx)}`,
        `ΔEinkommen : Einkommen₀ = (${fmt(y1)} − ${fmt(y0)}) : ${fmt(y0)} = ${prozent(ryEcht)}`,
        `Einkommenselastizität = ${prozent(rx)} : ${prozent(ryEcht)} = ${fmt(wert, 2)}`,
        d.normal
          ? 'Positives Vorzeichen: Nachfrage und Einkommen bewegen sich in dieselbe Richtung – ein normales Gut.'
          : 'Negatives Vorzeichen: Mit steigendem Einkommen weichen die Gäste auf bessere Angebote aus – ein inferiores Gut.',
      ],
      chart:false,
      reward:30,
    };
  }
  return taskPreisFunktion();
}

// Kreuzpreiselastizität
const KREUZ_DATEN = [
  { sc:'ferienwohnung', a:'Ferienwohnungen', ea:'Übernachtungen', b:'ein Hotelzimmer', p0:[100, 110, 120], dp:[10, 20], substitut:true },
  { sc:'restaurant', a:'Restaurantbesuche', ea:'Gedecke', b:'ein Gericht vom Lieferdienst', p0:[14, 16], dp:[2], substitut:true },
  { sc:'cafe', a:'Tee', ea:'Kännchen', b:'einen Kaffee', p0:[3, 3.5, 4], dp:[0.5], substitut:true },
  { sc:'cafe', a:'Kuchen', ea:'Stück', b:'einen Kaffee', p0:[3, 3.5, 4], dp:[0.5], substitut:false },
  { sc:'tagung', a:'Tagungspauschalen', ea:'Teilnehmertage', b:'eine Übernachtung der Teilnehmer', p0:[90, 100, 120], dp:[10, 20], substitut:false },
  { sc:'hotel', a:'Hotelübernachtungen im Skiort', ea:'Übernachtungen', b:'einen Skipass', p0:[50, 60], dp:[5, 10], substitut:false },
];

function taskKreuzpreis() {
  for (let v = 0; v < 50; v++) {
    const d = pick(KREUZ_DATEN), sc = scById(d.sc);
    const p0 = pick(d.p0), p1 = Math.round((p0 + pick(d.dp)) * 100) / 100;
    const wert0 = (d.substitut ? 1 : -1) * pick([0.4, 0.5, 0.8, 1, 1.2, 1.5]);
    const x0 = pick([400, 500, 600, 800, 1000]), x1 = Math.round(x0 * (1 + wert0 * (p1 - p0) / p0));
    const rx = (x1 - x0) / x0, rp = (p1 - p0) / p0, wert = rx / rp;
    if (x1 === x0 || Math.sign(wert) !== (d.substitut ? 1 : -1)) continue;
    return {
      stufe:5, sc, m:makeMarket(sc), titel:'Kreuzpreiselastizität',
      aufgabe:[
        `Der Preis für ${d.b} steigt von ${eur(p0)} auf ${eur(p1)}.`,
        `Die Nachfrage nach ${d.a} verändert sich im selben Zeitraum von ${fmt(x0)} auf ${fmt(x1)} ${d.ea}.`,
        'Berechnen Sie die Kreuzpreiselastizität (zwei Nachkommastellen) und bestimmen Sie die Beziehung der beiden Güter.',
      ],
      choices:[{ key:'typ', frage:'In welcher Beziehung stehen die beiden Güter?', options:[
        'Substitutionsgüter – sie ersetzen einander (Kreuzpreiselastizität > 0)',
        'Komplementärgüter – sie ergänzen einander (Kreuzpreiselastizität < 0)',
        'unabhängige Güter (Kreuzpreiselastizität = 0)'], correct: d.substitut ? 0 : 1 }],
      fields:[{ key:'e', label:'Kreuzpreiselastizität (mit Vorzeichen)', unit:'', correct:wert, tol:0.03, dec:2 }],
      tipp:'Kreuzpreiselastizität = (Δx des einen Gutes : x₀) : (Δp des anderen Gutes : p₀).',
      loesung:[
        `Δx : x₀ = (${fmt(x1)} − ${fmt(x0)}) : ${fmt(x0)} = ${prozent(rx)}`,
        `Δp : p₀ = (${dez(p1)} − ${dez(p0)}) : ${dez(p0)} = ${prozent(rp)}`,
        `Kreuzpreiselastizität = ${prozent(rx)} : ${prozent(rp)} = ${fmt(wert, 2)}`,
        d.substitut
          ? 'Positives Vorzeichen: Wird das eine Gut teurer, weichen die Gäste auf das andere aus – Substitutionsgüter.'
          : 'Negatives Vorzeichen: Wird das eine Gut teurer, sinkt auch die Nachfrage nach dem anderen – Komplementärgüter.',
      ],
      chart:false,
      reward:30,
    };
  }
  return taskPreisFunktion();
}

const GENERATOREN = {
  1: [taskGleichgewicht, taskGleichgewicht, taskUmstellen],
  2: [taskUeberhang, taskKapazitaet],
  3: [taskVerschiebung, taskVerschiebung, taskDoppel, () => taskFehlersuche(3)],
  4: [taskEingriff, taskEingriff, () => taskFehlersuche(4)],
  5: [taskPreisFunktion, taskPreisDaten, taskEinkommen, taskKreuzpreis, () => taskFehlersuche(5)],
};
function makeTask(stufe) {
  const s = stufe === 0 ? pick([1, 2, 3, 4, 5]) : stufe;
  return pick(GENERATOREN[s])();
}
function makeRunde(stufe, anzahl = 5) {
  return Array.from({ length: anzahl }, () => makeTask(stufe));
}

//#ABSCHNITT zeichnen
/* ============================================================
   4b. ZEICHENAUFGABEN – auf Papier zeichnen, dann mit der Lösung vergleichen
   Hofa-Fassung: Schreibweise p/x, Funktionen p = a − b·x.
   ============================================================ */
const glatt = (v) => fmt(v, Math.abs(v - Math.round(v)) < 1e-9 ? 0 : 2);

// Höchstens 12 cm je Achse und "glatte" Schritte (1, 2, 2,5 oder 5 mal Zehnerpotenz)
function papierSkala(max) {
  for (let e = -2; e <= 7; e++)
    for (const f of [1, 2, 2.5, 5]) {
      const step = f * Math.pow(10, e);
      const n = Math.ceil(max * 1.02 / step - 1e-9);
      if (n <= 12) return { step, max: n * step };
    }
  return niceScale(max, 10);
}
const papierAchsen = (maerkte, qExtra = 0) => ({
  p: papierSkala(Math.max(...maerkte.map(prohibitiv))),
  q: papierSkala(Math.max(qExtra, ...maerkte.map(x => x.a))),
});
const massstabText = (achsen, sc) => [
  `Hochachse (Preis p): 1 cm ≙ ${glatt(achsen.p.step)} €, von 0 bis ${glatt(achsen.p.max)} €`,
  `Rechtsachse (Menge x): 1 cm ≙ ${glatt(achsen.q.step)} ${sc.qUnit}, von 0 bis ${glatt(achsen.q.max)} ${sc.qUnit}`,
];

// Nur Märkte, deren Gleichgewicht mittig liegt – sonst drängt sich die Zeichnung in eine Ecke
function zeichenMarkt(sc) {
  let bester = null, besteWertung = -Infinity;
  for (let i = 0; i < 60; i++) {
    const m = makeMarket(sc), k = marktKennzahlen(m);
    const qRel = k.Q / m.a, sRel = k.pMinS / k.pMaxD;
    if (qRel >= 0.28 && qRel <= 0.62 && sRel <= 0.5) return m;
    const wertung = -Math.abs(qRel - 0.45) - Math.max(0, sRel - 0.5);
    if (wertung > besteWertung) { bester = m; besteWertung = wertung; }
  }
  return bester;
}

const K_ACHSEN = 'Achsen richtig: Preis p auf der Hochachse, Menge x auf der Rechtsachse – beide mit Einheit beschriftet';
const K_MASSSTAB = 'Achsen gleichmäßig eingeteilt, Maßstab eingehalten';
const punktHinweis = 'Ein Punkt hat die Form (x | p): erst nach rechts zur Menge, dann nach oben zum Preis.';

// Zwei Punkte je Gerade: Schnittpunkt mit der Preisachse und ein zweiter Punkt mit glatter Menge
function geradenpunkte(m, achsen) {
  const f = inv(m), k = marktKennzahlen(m);
  let x2 = 0;
  for (let x = achsen.q.max; x > 0; x -= achsen.q.step)
    if (f.c + f.d * x <= achsen.p.max + 1e-9) { x2 = x; break; }
  return { ...k, f, x2, p2: f.c + f.d * x2 };
}
const kurvenSchritte = (m, gp, sc) => [
  `Nachfrage ${nFkt(m).slice(3)}:  x = 0 → p = ${dez(gp.f.a)} (Schnittpunkt mit der Preisachse);  p = 0 → x = ${dez(gp.f.a)} : ${dez(gp.f.b)} = ${fmt(m.a)} (Schnittpunkt mit der Mengenachse). Punkte (0 | ${dez(gp.f.a)}) und (${fmt(m.a)} | 0) verbinden → N.`,
  `Angebot ${aFkt(m).slice(3)}:  x = 0 → p = ${zs(gp.f.c)};  x = ${fmt(gp.x2)} → p = ${zs(gp.f.c)} + ${dez(gp.f.d)} · ${fmt(gp.x2)} = ${dez(gp.p2)}. Punkte (0 | ${zs(gp.f.c)}) und (${fmt(gp.x2)} | ${dez(gp.p2)}) verbinden → A.`,
];
const ggSchritt = (m, sc) => {
  const f = inv(m), k = marktKennzahlen(m);
  return `Gleichgewicht: ${dez(f.a)} − ${dez(f.b)}x = ${zs(f.c)} + ${dez(f.d)}x → x* = ${dez(f.a - f.c)} : ${dez(f.b + f.d)} = ${fmt(k.Q)} ${sc.qUnit}, p* = ${eur(k.P)}. Schnittpunkt markieren und an beiden Achsen ablesen.`;
};
const achsenSchritt = (achsen, sc) =>
  `Achsen anlegen: Preis p auf der Hochachse, Menge x auf der Rechtsachse. ${massstabText(achsen, sc).join('; ')}.`;

/* --- Thema 1a: aus einer Wertetabelle ------------------------------------ */
function zeichneTabelle() {
  for (let versuch = 0; versuch < 40; versuch++) {
    const sc = pick(SCENARIOS), m = zeichenMarkt(sc);
    const hs = [...sc.steps, ...sc.steps.map(x => 2 * x)]
      .filter(h => m.P - 2 * h > 0 && qs(m, m.P - 2 * h) >= 0 && qd(m, m.P + 2 * h) >= 0);
    if (!hs.length) continue;
    const h = Math.max(...hs);
    const tabelle = [-2, -1, 1, 2].map(i => ({ p: m.P + i * h, qd: qd(m, m.P + i * h), qs: qs(m, m.P + i * h) }));
    const achsen = papierAchsen([m], Math.max(...tabelle.map(z => z.qs)));
    const k = marktKennzahlen(m);
    const punkte = (f) => tabelle.map(z => `(${fmt(z[f])} | ${glatt(z.p)})`).join(', ');
    return {
      thema:1, typ:'tabelle', typName:'Aus einer Wertetabelle', sc, m, tabelle, achsen,
      titel:'Kurven aus einer Wertetabelle zeichnen',
      auftrag:[
        `Die Tabelle zeigt, welche Mengen an ${sc.name} bei verschiedenen Preisen nachgefragt und angeboten werden.`,
        'TABELLE',
        'Stellen Sie Nachfrage und Angebot in einem Preis-Mengen-Diagramm dar und bestimmen Sie das Marktgleichgewicht grafisch.',
      ],
      einzeichnen:['Nachfragekurve N', 'Angebotskurve A', 'Gleichgewichtspunkt mit p* und x* an den Achsen'],
      hilfe:[
        punktHinweis,
        'Tragen Sie zuerst alle Nachfragepunkte ein und verbinden Sie sie mit dem Lineal, dann alle Angebotspunkte.',
        `Das Gleichgewicht liegt zwischen ${glatt(m.P - h)} € und ${glatt(m.P + h)} € – dort schneiden sich die beiden Geraden.`,
      ],
      schritte:[
        achsenSchritt(achsen, sc),
        `Nachfragepunkte (x | p) eintragen: ${punkte('qd')} – mit dem Lineal zu einer fallenden Geraden verbinden → N.`,
        `Angebotspunkte (x | p) eintragen: ${punkte('qs')} – zu einer steigenden Geraden verbinden → A.`,
        `Der Schnittpunkt von N und A ist das Marktgleichgewicht: x* = ${glatt(k.Q)} ${sc.qUnit}, p* = ${eur(k.P)}.`,
      ],
      kriterien:[
        K_ACHSEN, K_MASSSTAB,
        'Nachfragekurve fällt und läuft durch alle vier Nachfragepunkte',
        'Angebotskurve steigt und läuft durch alle vier Angebotspunkte',
        'Kurven mit N und A beschriftet',
        `Gleichgewicht abgelesen: x* = ${glatt(k.Q)} ${sc.qUnit}, p* = ${eur(k.P)}`,
      ],
      chart:{ m, achsen, zeichnung:true, showEq:true, marken:[
        ...tabelle.map(z => ({ p: z.p, q: z.qd, farbe:'#2563EB' })),
        ...tabelle.map(z => ({ p: z.p, q: z.qs, farbe:'#EF4444' })),
      ] },
    };
  }
  return zeichneFunktionen();
}

/* --- Thema 1b: aus den Funktionen ----------------------------------------- */
function zeichneFunktionen() {
  const sc = pick(SCENARIOS), m = zeichenMarkt(sc);
  const achsen = papierAchsen([m]);
  const gp = geradenpunkte(m, achsen);
  return {
    thema:1, typ:'funktionen', typName:'Aus den Funktionen', sc, m, achsen,
    titel:'Nachfrage und Angebot aus den Funktionen zeichnen',
    auftrag:[
      `Auf dem Markt für ${sc.name} gelten folgende Funktionen (p in €, x in ${sc.qUnit}):`,
      'FUNKTIONEN',
      'Stellen Sie Nachfrage und Angebot grafisch dar. Berechnen Sie das Marktgleichgewicht und kennzeichnen Sie es im Diagramm.',
    ],
    einzeichnen:['Nachfragekurve N', 'Angebotskurve A', 'Gleichgewichtspunkt mit p* und x* an den Achsen'],
    hilfe:[
      'Für eine Gerade genügen zwei Punkte. Am einfachsten ist x = 0 – dort liest man p direkt aus der Funktion ab.',
      'Nachfrage: Setzen Sie einmal x = 0 und einmal p = 0.',
      `Angebot: Setzen Sie x = 0 und als zweiten Wert z. B. x = ${fmt(gp.x2)} ein.`,
      punktHinweis,
    ],
    schritte:[ achsenSchritt(achsen, sc), ...kurvenSchritte(m, gp, sc), ggSchritt(m, sc) ],
    kriterien:[
      K_ACHSEN, K_MASSSTAB,
      `Nachfragekurve von (0 | ${dez(gp.f.a)}) bis (${fmt(m.a)} | 0), beschriftet mit N`,
      `Angebotskurve beginnt bei (0 | ${zs(gp.f.c)}) und steigt, beschriftet mit A`,
      `Gleichgewicht x* = ${glatt(gp.Q)} ${sc.qUnit}, p* = ${eur(gp.P)} eingetragen und abgelesen`,
    ],
    chart:{ m, achsen, zeichnung:true, showEq:true, marken:[
      { p: gp.f.a, q: 0, farbe:'#2563EB' }, { p: 0, q: m.a, farbe:'#2563EB' },
      { p: gp.f.c, q: 0, farbe:'#EF4444' }, { p: gp.p2, q: gp.x2, farbe:'#EF4444' },
    ] },
  };
}

/* --- Thema 2a: Überhang bei einem Preis ------------------------------------ */
function zeichneUeberhang() {
  const sc = pick(SCENARIOS), m = zeichenMarkt(sc);
  const zuHoch = Math.random() < 0.5;
  const grenze = zuHoch ? m.kb : m.kd;
  const moeglich = sc.steps.filter(x => x > 0 && x < grenze);
  const d = moeglich.length ? Math.max(...moeglich) : grenze / 2;
  const p = zuHoch ? m.P + d : m.P - d;
  const xn = qd(m, p), xa = qs(m, p), ue = Math.abs(xn - xa);
  const achsen = papierAchsen([m], xa);
  const gp = geradenpunkte(m, achsen);
  const wort = ueberhangWort(zuHoch);
  return {
    thema:2, typ:'ueberhang', typName:'Überhang', sc, m, achsen,
    titel:'Einen Überhang einzeichnen',
    auftrag:[
      `Auf dem Markt für ${sc.name} gelten folgende Funktionen (p in €, x in ${sc.qUnit}):`,
      'FUNKTIONEN',
      `Der Preis liegt bei p = ${eur(p)}.`,
      'Zeichnen Sie Nachfrage, Angebot und das Gleichgewicht. Tragen Sie den Preis als waagrechte Linie ein, markieren Sie die nachgefragte und die angebotene Menge und kennzeichnen Sie den Überhang.',
    ],
    einzeichnen:['Nachfragekurve N und Angebotskurve A', 'Gleichgewicht', `Preislinie bei ${eur(p)}`, `nachgefragte und angebotene Menge, ${wort}`],
    hilfe:[
      'Wo die Preislinie die Nachfragekurve schneidet, lesen Sie die nachgefragte Menge ab; wo sie die Angebotskurve schneidet, die angebotene.',
      'Liegt der Preis über dem Gleichgewichtspreis, ist das Angebot größer – sonst die Nachfrage.',
    ],
    schritte:[
      achsenSchritt(achsen, sc), ...kurvenSchritte(m, gp, sc), ggSchritt(m, sc),
      `Waagrechte Linie bei p = ${eur(p)} – ${zuHoch ? 'oberhalb' : 'unterhalb'} von p*.`,
      `Nachgefragte Menge: ${fmt(xn)} ${sc.qUnit}; angebotene Menge: ${fmt(xa)} ${sc.qUnit}.`,
      `Die Strecke dazwischen ist der ${wort}: ${fmt(ue)} ${sc.qUnit}.`,
    ],
    kriterien:[
      K_ACHSEN,
      'Nachfrage- und Angebotskurve richtig, Gleichgewicht markiert',
      `Preislinie waagrecht bei ${eur(p)}, ${zuHoch ? 'oberhalb' : 'unterhalb'} von p*`,
      `Mengen markiert: nachgefragt ${fmt(xn)}, angeboten ${fmt(xa)}`,
      `${wort} von ${fmt(ue)} ${sc.qUnit} gekennzeichnet und benannt`,
    ],
    chart:{ m, achsen, zeichnung:true, showEq:true, priceLine:p, gapLabel:true, priceLineLabel:'gegebener Preis' },
  };
}

/* --- Thema 2b: Kapazitätsgrenze --------------------------------------------- */
function zeichneKapazitaet() {
  const fall = kapazitaetsFall();
  if (!fall) return zeichneUeberhang();
  const { sc, m, m2, ev, delta, K, pK, k0 } = fall;
  const achsen = papierAchsen([m, m2]);
  const gp = geradenpunkte(m, achsen);
  return {
    thema:2, typ:'kapazitaet', typName:'Kapazitätsgrenze', sc, m, m2, achsen,
    neu:{ kind:'d', m: m2 },
    titel:'Gleichgewicht an der Kapazitätsgrenze einzeichnen',
    auftrag:[
      'Ausgangslage – gegeben sind die Funktionen:',
      'FUNKTIONEN',
      `Mehr als ${fmt(K)} ${sc.qUnit} können die Anbieter nicht bereitstellen (Kapazitätsgrenze).`,
      `Ereignis: ${ev.t(sc)} Die Nachfrage steigt bei jedem Preis um ${fmt(delta)} ${sc.qUnit}:`,
      'FUNKTION_NEU',
      'Zeichnen Sie die Ausgangslage, die Kapazitätsgrenze und die neue Nachfragekurve. Kennzeichnen Sie das alte und das neue Gleichgewicht.',
    ],
    einzeichnen:['Nachfragekurve N₀ und Angebotskurve A', `Kapazitätsgrenze bei x = ${fmt(K)}`, 'neue Nachfragekurve N₁', 'altes und neues Gleichgewicht'],
    hilfe:[
      'Ab der Kapazitätsgrenze verläuft die Angebotskurve senkrecht nach oben.',
      'Schneidet die neue Nachfrage den senkrechten Teil, wird genau die Grenzmenge gehandelt – den Preis liefert die Nachfragefunktion.',
    ],
    schritte:[
      achsenSchritt(achsen, sc), ...kurvenSchritte(m, gp, sc),
      `Kapazitätsgrenze: Bei x = ${fmt(K)} die Angebotskurve senkrecht nach oben weiterführen.`,
      `Altes Gleichgewicht: x₀ = ${fmt(k0.Q)} ${sc.qUnit}, p₀ = ${eur(k0.P)}.`,
      `Neue Nachfrage ${nFkt(m2, '₁').slice(4)} parallel zu N₀ einzeichnen.`,
      `N₁ schneidet den senkrechten Teil: x₁ = ${fmt(K)} ${sc.qUnit}, p₁ = ${dez(inv(m2).a)} − ${dez(inv(m2).b)} · ${fmt(K)} = ${eur(pK)}.`,
    ],
    kriterien:[
      K_ACHSEN,
      'Ausgangslage N₀ und A richtig gezeichnet',
      `Angebotskurve ab x = ${fmt(K)} senkrecht`,
      'Neue Nachfragekurve N₁ parallel nach rechts verschoben',
      `Neues Gleichgewicht an der Kapazitätsgrenze: x₁ = ${fmt(K)}, p₁ = ${eur(pK)}`,
    ],
    chart:{ m: m2, compare: m, achsen, zeichnung:true, showEq:true, verschiebung:true, kapazitaet:K },
  };
}

/* --- Thema 3a: Verschiebung mit Zahlen -------------------------------------- */
const richtungsText = (ev) => `${ev.curve === 'N' ? 'Nachfragekurve' : 'Angebotskurve'} nach ${ev.dir}`;
const wirkungText = (vor, nach) => ({
  preis: nach.P > vor.P + 1e-9 ? 'steigt' : nach.P < vor.P - 1e-9 ? 'sinkt' : 'bleibt gleich',
  menge: nach.Q > vor.Q + 1e-9 ? 'steigt' : nach.Q < vor.Q - 1e-9 ? 'sinkt' : 'bleibt gleich',
});

function zeichneVerschiebung() {
  const { sc, m, ev, m2, delta } = verschiebungsFall(zeichenMarkt);
  const achsen = papierAchsen([m, m2]);
  const k0 = marktKennzahlen(m), k1 = marktKennzahlen(m2), w = wirkungText(k0, k1);
  const nachfrage = ev.curve === 'N';
  return {
    thema:3, typ:'verschiebung', typName:'Verschiebung mit Zahlen', sc, m, m2, achsen,
    neu:{ kind: nachfrage ? 'd' : 's', m: m2 },
    titel:'Eine Marktveränderung einzeichnen',
    auftrag:[
      'Ausgangslage – gegeben sind die Funktionen:',
      'FUNKTIONEN',
      `Ereignis: ${ev.t(sc)}`,
      `Bei jedem Preis wird ${nachfrage ? 'die nachgefragte' : 'die angebotene'} Menge um ${fmt(delta)} ${sc.qUnit} ${ev.dir === 'rechts' ? 'größer' : 'kleiner'}. Neue Funktion:`,
      'FUNKTION_NEU',
      'Zeichnen Sie die Ausgangslage (N₀, A₀) und die neue Kurve in dasselbe Diagramm. Kennzeichnen Sie das alte und das neue Gleichgewicht und die Verschiebung mit einem Pfeil.',
    ],
    einzeichnen:['Ausgangslage N₀ und A₀', `neue ${nachfrage ? 'Nachfragekurve N₁' : 'Angebotskurve A₁'}`, 'altes und neues Gleichgewicht', 'Pfeil für die Verschiebung'],
    hilfe:[
      'Zeichnen Sie zuerst die Ausgangslage vollständig, dann die neue Kurve.',
      'Nur eine Kurve ändert sich. Die neue Kurve hat dieselbe Steigung – sie verläuft parallel zur alten.',
    ],
    schritte:[
      achsenSchritt(achsen, sc),
      `Ausgangslage zeichnen (N₀, A₀). Gleichgewicht: x₀ = ${glatt(k0.Q)} ${sc.qUnit}, p₀ = ${eur(k0.P)}.`,
      ev.why,
      `Neue Kurve ${nachfrage ? nFkt(m2, '₁') : aFkt(m2, '₁')} parallel zur alten einzeichnen.`,
      `Neues Gleichgewicht: x₁ = ${glatt(k1.Q)} ${sc.qUnit}, p₁ = ${eur(k1.P)}.`,
      `Ergebnis: Der Preis ${w.preis}, die Menge ${w.menge}.`,
    ],
    kriterien:[
      K_ACHSEN,
      'Ausgangslage N₀ und A₀ richtig gezeichnet',
      `Richtige Kurve in die richtige Richtung verschoben: ${richtungsText(ev)}`,
      'Neue Kurve parallel zur alten (gleiche Steigung)',
      `Gleichgewichte markiert: x₀ = ${glatt(k0.Q)} / p₀ = ${glatt(k0.P)} und x₁ = ${glatt(k1.Q)} / p₁ = ${glatt(k1.P)}`,
      'Verschiebung mit einem Pfeil gekennzeichnet',
    ],
    chart:{ m: m2, compare: m, achsen, zeichnung:true, showEq:true, verschiebung:true },
  };
}

/* --- Thema 3b: Skizze ohne Zahlen (Vier-Schritte-Analyse) -------------------- */
function zeichneSkizze() {
  const { sc, m, ev, m2 } = verschiebungsFall(zeichenMarkt, true);
  const achsen = papierAchsen([m, m2]);
  const w = wirkungText(marktKennzahlen(m), marktKennzahlen(m2));
  return {
    thema:3, typ:'skizze', typName:'Skizze ohne Zahlen', sc, m, m2,
    titel:'Eine Marktveränderung skizzieren',
    auftrag:[
      `Ereignis auf dem Markt für ${sc.name}: ${ev.t(sc)}`,
      'Stellen Sie die Wirkung ohne Zahlen in einem Preis-Mengen-Diagramm dar (ceteris paribus): Ausgangslage, Verschiebung, neues Gleichgewicht. Wie verändern sich Gleichgewichtspreis und -menge?',
    ],
    einzeichnen:['Ausgangslage N₀ und A₀ mit p₀ und x₀', 'die verschobene Kurve mit Pfeil', 'neues Gleichgewicht mit p₁ und x₁'],
    hilfe:[
      'Schritt 1: Welche Marktseite ist betroffen – die Gäste (Nachfrage) oder die Betriebe (Angebot)?',
      'Schritt 2: Verschiebt sich die Kurve nach rechts (mehr bei jedem Preis) oder nach links (weniger)?',
      'Schritt 3: Neues Gleichgewicht einzeichnen. Schritt 4: Wirkung auf p und x ablesen.',
    ],
    schritte:[
      'Achsen beschriften: Preis p auf der Hochachse, Menge x auf der Rechtsachse. Zahlen sind nicht nötig.',
      'Ausgangslage skizzieren: fallende Nachfragekurve N₀, steigende Angebotskurve A₀. Schnittpunkt mit p₀ und x₀ an den Achsen markieren.',
      ev.why,
      `Die ${richtungsText(ev)} parallel verschieben und als ${ev.curve === 'N' ? 'N₁' : 'A₁'} beschriften; Pfeil einzeichnen.`,
      'Neuen Schnittpunkt markieren und p₁ und x₁ an den Achsen eintragen.',
      `Ergebnis: Der Gleichgewichtspreis ${w.preis}, die Gleichgewichtsmenge ${w.menge}.`,
    ],
    kriterien:[
      'Achsen beschriftet: p auf der Hochachse, x auf der Rechtsachse',
      'Ausgangslage: fallende N₀ und steigende A₀',
      `Richtige Kurve verschoben: ${richtungsText(ev)}`,
      'Parallel verschoben – die Steigung bleibt gleich',
      'Altes und neues Gleichgewicht mit p₀/x₀ und p₁/x₁ markiert',
      `Wirkung erkannt: Preis ${w.preis}, Menge ${w.menge}`,
    ],
    chart:{ m: m2, compare: m, achsen, zeichnung:true, ohneZahlen:true, showEq:true, verschiebung:true },
  };
}

/* --- Thema 3c: Doppelverschiebung als Skizze -------------------------------- */
function zeichneDoppel() {
  for (let v = 0; v < 40; v++) {
    const sc = pick(SCENARIOS), m = zeichenMarkt(sc);
    const evN = pick(SHIFT_EVENTS.filter(e => e.curve === 'N'));
    const evA = pick(SHIFT_EVENTS.filter(e => e.curve === 'A'));
    const n = verschiebeMarkt(sc, m, evN, true), a = verschiebeMarkt(sc, m, evA, true);
    if (!n || !a) continue;
    const m2 = { ...m, a: n.m2.a, c: a.m2.c };
    const k0 = marktKennzahlen(m), k1 = marktKennzahlen(m2);
    if (!(k1.Q > 0.25 * k0.Q) || !glatterMarkt(m2)) continue;
    const gleich = evN.dir === evA.dir;
    const eindeutig = gleich
      ? `Eindeutig ist nur die Menge: sie ${evN.dir === 'rechts' ? 'steigt' : 'sinkt'}. Die Preiswirkung hängt davon ab, welche Verschiebung stärker ist.`
      : `Eindeutig ist nur der Preis: er ${evN.dir === 'rechts' ? 'steigt' : 'sinkt'}. Die Mengenwirkung hängt davon ab, welche Verschiebung stärker ist.`;
    const achsen = papierAchsen([m, m2]);
    return {
      thema:3, typ:'doppel', typName:'Doppelverschiebung', sc, m, m2,
      titel:'Eine Doppelverschiebung skizzieren',
      auftrag:[
        `Auf dem Markt für ${sc.name} treten gleichzeitig zwei Ereignisse ein:`,
        `(1) ${evN.t(sc)}`,
        `(2) ${evA.t(sc)}`,
        'Skizzieren Sie beide Verschiebungen ohne Zahlen in einem Diagramm. Welche Wirkung auf Preis und Menge lässt sich eindeutig angeben?',
      ],
      einzeichnen:['Ausgangslage N₀, A₀ mit Gleichgewicht', 'verschobene Kurven N₁ und A₁ mit Pfeilen', 'neues Gleichgewicht', 'Aussage, welche Größe eindeutig ist'],
      hilfe:[
        'Behandeln Sie die Ereignisse nacheinander: Erst die Nachfrage verschieben, dann das Angebot.',
        'Probieren Sie in Gedanken eine starke und eine schwache Verschiebung aus – was ändert sich dann am Ergebnis?',
      ],
      schritte:[
        'Achsen beschriften und die Ausgangslage N₀, A₀ mit p₀ und x₀ skizzieren.',
        evN.why, evA.why,
        `Beide Kurven verschieben (${richtungsText(evN)}, ${richtungsText(evA)}) und mit N₁ und A₁ beschriften.`,
        'Neues Gleichgewicht markieren.',
        eindeutig,
      ],
      kriterien:[
        'Achsen beschriftet, Ausgangslage richtig',
        `Nachfrage richtig verschoben: ${richtungsText(evN)}`,
        `Angebot richtig verschoben: ${richtungsText(evA)}`,
        'Beide Verschiebungen parallel, Kurven beschriftet',
        eindeutig.split('.')[0],
      ],
      chart:{ m: m2, compare: m, achsen, zeichnung:true, ohneZahlen:true, showEq:true, verschiebung:true },
    };
  }
  return zeichneSkizze();
}

/* --- Thema 4: Höchst- oder Mindestpreis -------------------------------------- */
function zeichneEingriff() {
  const sc = pick(SCENARIOS), m = zeichenMarkt(sc);
  const hoechst = Math.random() < 0.5;
  const grenze = hoechst ? m.kd : m.kb;
  const moeglich = sc.steps.filter(x => x > 0 && x < grenze);
  const k = moeglich.length ? Math.max(...moeglich) : grenze / 2;
  const Pfix = hoechst ? m.P - k : m.P + k;
  const nach = qd(m, Pfix), ang = qs(m, Pfix), ueber = Math.abs(nach - ang);
  const achsen = papierAchsen([m], ang);
  const gp = geradenpunkte(m, achsen);
  const art = hoechst ? 'Höchstpreis' : 'Mindestpreis';
  const zustand = ueberhangWort(!hoechst);
  return {
    thema:4, typ:'eingriff', typName: art, sc, m, achsen,
    titel:`${art} einzeichnen`,
    auftrag:[
      `Auf dem Markt für ${sc.name} gelten folgende Funktionen (p in €, x in ${sc.qUnit}):`,
      'FUNKTIONEN',
      hoechst
        ? `Der Staat legt zum Schutz der Gäste einen Höchstpreis von ${eur(Pfix)} fest.`
        : `Der Staat legt zum Schutz der Anbieter einen Mindestpreis von ${eur(Pfix)} fest.`,
      `Zeichnen Sie Angebot, Nachfrage und das freie Gleichgewicht. Tragen Sie den ${art} als waagrechte Linie ein, markieren Sie die nachgefragte und die angebotene Menge und kennzeichnen Sie den ${zustand}.`,
    ],
    einzeichnen:['Nachfragekurve N und Angebotskurve A', 'freies Gleichgewicht', `${art}linie`, `nachgefragte und angebotene Menge, ${zustand}`],
    hilfe:[
      hoechst ? 'Ein bindender Höchstpreis liegt unter dem Gleichgewichtspreis.' : 'Ein bindender Mindestpreis liegt über dem Gleichgewichtspreis.',
      `Setzen Sie ${eur(Pfix)} in beide Funktionen ein – so erhalten Sie die beiden Mengen auf der Preislinie.`,
      'Der Überhang ist die waagrechte Strecke zwischen den beiden Mengen.',
    ],
    schritte:[
      achsenSchritt(achsen, sc), ...kurvenSchritte(m, gp, sc), ggSchritt(m, sc),
      `${art}: waagrechte Linie bei p = ${eur(Pfix)} – ${hoechst ? 'unterhalb' : 'oberhalb'} von p* = ${eur(gp.P)}.`,
      `Nachgefragte Menge ${fmt(nach)} ${sc.qUnit}, angebotene Menge ${fmt(ang)} ${sc.qUnit} auf der Linie markieren.`,
      `Die Strecke dazwischen ist der ${zustand}: ${fmt(ueber)} ${sc.qUnit}. Gehandelt wird nur die kleinere Menge (${fmt(Math.min(nach, ang))} ${sc.qUnit}).`,
    ],
    kriterien:[
      K_ACHSEN, K_MASSSTAB,
      'Nachfrage- und Angebotskurve richtig, freies Gleichgewicht markiert',
      `${art}linie waagrecht bei ${eur(Pfix)} und ${hoechst ? 'unterhalb' : 'oberhalb'} von p*`,
      `Mengen markiert: nachgefragt ${fmt(nach)}, angeboten ${fmt(ang)}`,
      `${zustand} von ${fmt(ueber)} ${sc.qUnit} gekennzeichnet und benannt`,
    ],
    chart:{ m, achsen, zeichnung:true, showEq:true, priceLine:Pfix, gapLabel:true, priceLineLabel: art },
  };
}

/* --- Thema 5: Preiselastizität an der Nachfragekurve -------------------------- */
function zeichneElastizitaet() {
  const sc = pick(SCENARIOS), m = zeichenMarkt(sc), f = inv(m);
  const pAchse = papierSkala(prohibitiv(m));
  const kombis = [];
  for (const p1 of [m.P, m.P - Math.min(...sc.steps), m.P + Math.min(...sc.steps)])
    for (const k of [...new Set(sc.steps.flatMap(x => [x, 2 * x, 3 * x, 4 * x]))])
      if (p1 > 0 && qd(m, p1) > 0.25 * m.Q && qd(m, p1 + k) > 0.2 * m.Q) kombis.push([p1, k]);
  const deutlich = kombis.filter(([, k]) => k >= 1.2 * pAchse.step);
  const [P1, k] = deutlich.length ? pick(deutlich)
    : kombis.length ? kombis.reduce((x, y) => (y[1] > x[1] ? y : x)) : [m.P, m.kb / 4];
  const P2 = P1 + k, X1 = qd(m, P1), X2 = qd(m, P2);
  const eps = ((X2 - X1) / X1) / ((P2 - P1) / P1), abs = Math.abs(eps);
  const urteil = abs > 1.0001 ? 'elastisch (|ε| > 1)' : abs < 0.9999 ? 'unelastisch (|ε| < 1)' : 'einheitselastisch (|ε| = 1)';
  const achsen = { p: pAchse, q: papierSkala(m.a) };
  return {
    thema:5, typ:'elastizitaet', typName:'Elastizität', sc, m, achsen,
    titel:'Eine Preisänderung an der Nachfragekurve einzeichnen',
    auftrag:[
      `Die Nachfrage nach ${sc.name} lautet (p in €, x in ${sc.qUnit}):`,
      'NACHFRAGE',
      `Der Preis steigt von p₀ = ${eur(P1)} auf p₁ = ${eur(P2)}.`,
      'Zeichnen Sie die Nachfragekurve. Tragen Sie beide Preis-Mengen-Kombinationen ein, kennzeichnen Sie Δp an der Hochachse und Δx an der Rechtsachse und berechnen Sie die Preiselastizität der Nachfrage.',
    ],
    einzeichnen:['Nachfragekurve N', 'Punkte (x₀ | p₀) und (x₁ | p₁)', 'Δp und Δx an den Achsen'],
    hilfe:[
      'Die Angebotskurve brauchen Sie hier nicht.',
      'Setzen Sie p₀ und p₁ in die nach x umgestellte Nachfragefunktion ein.',
      'ε = (Δx : x₀) : (Δp : p₀)',
    ],
    schritte:[
      achsenSchritt(achsen, sc),
      `Nachfragekurve: Punkte (0 | ${dez(f.a)}) und (${fmt(m.a)} | 0) verbinden → N.`,
      `x₀ = (${dez(f.a)} − ${dez(P1)}) : ${dez(f.b)} = ${glatt(X1)} und x₁ = (${dez(f.a)} − ${dez(P2)}) : ${dez(f.b)} = ${glatt(X2)}. Punkte (${glatt(X1)} | ${glatt(P1)}) und (${glatt(X2)} | ${glatt(P2)}) eintragen.`,
      `Δp = ${glatt(P2 - P1)} € an der Hochachse, Δx = ${glatt(X2 - X1)} ${sc.qUnit} an der Rechtsachse markieren.`,
      `ε = (${glatt(X2 - X1)} : ${glatt(X1)}) : (${glatt(P2 - P1)} : ${glatt(P1)}) = ${fmt(eps, 2)}`,
      `|ε| = ${fmt(abs, 2)} → die Nachfrage ist hier ${urteil}.`,
    ],
    kriterien:[
      K_ACHSEN, K_MASSSTAB,
      `Nachfragekurve von (0 | ${dez(f.a)}) bis (${fmt(m.a)} | 0)`,
      `Punkte (${glatt(X1)} | ${glatt(P1)}) und (${glatt(X2)} | ${glatt(P2)}) richtig eingetragen`,
      'Δp und Δx an den Achsen gekennzeichnet',
      `ε = ${fmt(eps, 2)} berechnet – Nachfrage ${urteil}`,
    ],
    chart:{ m, achsen, zeichnung:true, nurNachfrage:true, showEq:false,
      points:[ { p:P1, q:X1, label:'(x₀ | p₀)', color:'#7C3AED' }, { p:P2, q:X2, label:'(x₁ | p₁)', color:'#DB2777' } ],
      delta:{ p1:P1, p2:P2, q1:X1, q2:X2 } },
  };
}

const ZEICHEN_TYPEN = [
  { typ:'tabelle',      thema:1, gen:zeichneTabelle },
  { typ:'funktionen',   thema:1, gen:zeichneFunktionen },
  { typ:'ueberhang',    thema:2, gen:zeichneUeberhang },
  { typ:'kapazitaet',   thema:2, gen:zeichneKapazitaet },
  { typ:'verschiebung', thema:3, gen:zeichneVerschiebung },
  { typ:'skizze',       thema:3, gen:zeichneSkizze },
  { typ:'doppel',       thema:3, gen:zeichneDoppel },
  { typ:'eingriff',     thema:4, gen:zeichneEingriff },
  { typ:'elastizitaet', thema:5, gen:zeichneElastizitaet },
];
// thema 0 = gemischt. Nach Möglichkeit nicht zweimal hintereinander derselbe Aufgabentyp.
function makeZeichnung(thema, vorherTyp) {
  const kand = ZEICHEN_TYPEN.filter(z => thema === 0 || z.thema === thema);
  const frisch = kand.filter(z => z.typ !== vorherTyp);
  return pick(frisch.length ? frisch : kand).gen();
}

//#ABSCHNITT funktionsanzeige
// Hofa-Schreibweise: N: p = a − b·x und A: p = c + d·x
const Fn = ({ m, kind, i = '' }) => {
  const f = inv(m);
  return kind === 'd'
    ? <span className="whitespace-nowrap">N{i}: p = {dez(f.a)} − {dez(f.b)}x</span>
    : <span className="whitespace-nowrap">A{i}: p = {zs(f.c)} + {dez(f.d)}x</span>;
};

const FunktionsBox = ({ m }) => (
  <div className="my-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 font-mono text-[13px] sm:text-sm leading-7">
    <div className="text-blue-700 font-semibold"><Fn m={m} kind="d" /></div>
    <div className="text-red-600 font-semibold"><Fn m={m} kind="s" /></div>
  </div>
);

//#ABSCHNITT fnstrich
const FnStrich = ({ m, kind }) => <Fn m={m} kind={kind} i="₁" />;

//#ABSCHNITT mission
function macheMission(sc, basis) {
  const uebung = makeMarket(sc);                 // eigener Übungsmarkt mit glatten Zahlen
  const ku = marktKennzahlen(uebung);
  const komp = sc.parameter.find(p => p.key === 'komplement');
  const eink = sc.parameter.find(p => p.key === 'einkommen');
  const kBasis = marktKennzahlen(basis);

  const kompZiel = AUF_SCHRITT(komp.basis + (komp.max - komp.basis) * 0.7, komp.step);
  const zielMenge = Math.round((kBasis.Q * 1.12) / 10) * 10;
  let noetigesEinkommen = eink.max;
  const startW = startParameter(sc, basis);
  for (let v = eink.basis; v <= eink.max + 1e-9; v += eink.step) {
    if (marktKennzahlen(simulierterMarkt(sc, basis, { ...startW, einkommen: v })).Q >= zielMenge) {
      noetigesEinkommen = v; break;
    }
  }

  // Preis über dem Gleichgewicht für die Überhang-Aufgabe
  const schritte = sc.steps.filter(s => s > 0 && s < uebung.kb);
  const pU = uebung.P + (schritte.length ? Math.max(...schritte) : uebung.kb / 2);
  const xnU = qd(uebung, pU), xaU = qs(uebung, pU), fU = inv(uebung);

  const aufgaben = [
    {
      id:'gleichgewicht', titel:'Gleichgewicht berechnen', kurz:'Gleichgewicht berechnen',
      phase:'BERECHNEN', markt: uebung, zeigFunktionen: true,
      einleitung:`Für den Markt für ${sc.name} gelten die folgenden Funktionen (p in €, x in ${sc.qUnit}):`,
      schritte:[{
        art:'rechnen', text:'Berechnen Sie die Gleichgewichtsmenge x* und den Gleichgewichtspreis p*.',
        tipp:'Setzen Sie N und A gleich, lösen Sie nach x auf und setzen Sie x* anschließend in eine der beiden Funktionen ein.',
        felder:[
          { key:'q', label:'x* =', unit:sc.qUnit, correct:ku.Q, tol:0.5, dec:0 },
          { key:'p', label:'p* =', unit:pEinheit(sc), correct:ku.P, tol:0.02, dec:2 },
        ],
        loesung: wegGleichgewicht(uebung, sc).slice(0, 4),
      }],
    },
    {
      id:'komplement', titel:`Wirkung des Komplementärguts (${sc.komp})`, kurz:`Komplementärgut ${sc.komp}`,
      phase:'PROGNOSE → SIMULATION → ERKLÄRUNG', live: true,
      einleitung:`Der Preis für ${sc.komp} steigt von ${geld(komp.basis, { pEinheit: komp.einheit })} auf ${geld(kompZiel, { pEinheit: komp.einheit })}.`,
      schritte:[
        { art:'wahl', phase:'1 · PROGNOSE',
          text:`Prognostizieren Sie zuerst – ohne zu simulieren: Wie wirkt der höhere Preis für ${sc.komp} auf die Nachfrage nach ${sc.name}?`,
          optionen:[
            `Die Nachfrage nach ${sc.name} sinkt bei jedem Preis.`,
            `Die Nachfrage nach ${sc.name} steigt bei jedem Preis.`,
            'Die Nachfrage bleibt unverändert.',
          ], richtig:0,
          erklaerung:`${sc.komp} und ${sc.name} werden gemeinsam genutzt. Wird das Komplementärgut teurer, wird das Gesamtpaket teurer – die Nachfragekurve verschiebt sich nach links.`,
          tipp:'Komplementärgüter werden zusammen konsumiert. Überlegen Sie, wie sich der Gesamtpreis des Pakets verändert.' },
        { art:'regler', phase:'2 · SIMULATION', parameter:'komplement', ziel:kompZiel,
          text:`Stellen Sie jetzt den Regler „${komp.label}“ auf ${geld(kompZiel, { pEinheit: komp.einheit })} und beobachten Sie das Diagramm.`,
          tipp:'Der Regler befindet sich im Bereich 2 – Parameter ändern.' },
        { art:'ablesen', phase:'3 · BEOBACHTUNG',
          text:'Lesen Sie das neue Marktgleichgewicht ab und tragen Sie es ein.',
          felder:[
            { key:'q', was:'Q', label:'neue Gleichgewichtsmenge x*', unit:sc.qUnit, dec:0 },
            { key:'p', was:'P', label:'neuer Gleichgewichtspreis p*', unit:pEinheit(sc), dec:2 },
          ],
          tipp:'Die Werte stehen unter dem Diagramm bei „Aktuelle Ergebnisse“.' },
        { art:'wahl', phase:'4 · ERKLÄRUNG',
          text:'Begründen Sie, weshalb sich der Gleichgewichtspreis verändert hat.',
          optionen:[
            'Das Komplementärgut ist teurer geworden. Dadurch sinkt die Zahlungsbereitschaft für das Gut, die gesamte Nachfragekurve verschiebt sich nach links und der Gleichgewichtspreis sinkt.',
            'Die Kosten der Betriebe sind gestiegen, deshalb hat sich die Angebotskurve verschoben.',
            'Der Preis des Gutes selbst ist gestiegen, deshalb bewegt man sich auf der Nachfragekurve nach oben.',
          ], richtig:0,
          erklaerung:'Nur ein anderer Einflussfaktor als der eigene Preis verschiebt die ganze Kurve. Der Preis des Gutes selbst würde lediglich zu einer Bewegung auf der Kurve führen; das Angebot bleibt hier unverändert.',
          tipp:'Achten Sie auf den Unterschied: Bewegung AUF der Kurve gegenüber Verschiebung DER Kurve.' },
        { art:'notiz', text:'Formulieren Sie die Wirkungskette in einem Satz (wird nicht bewertet).',
          muster:`Preis für ${sc.komp} steigt → ${sc.name} und ${sc.komp} werden gemeinsam gekauft → Nachfrage nach ${sc.name} sinkt bei jedem Preis → Nachfragekurve verschiebt sich nach links → Gleichgewichtspreis und Gleichgewichtsmenge sinken.` },
      ],
    },
    {
      id:'einkommen', titel:'Einkommensänderung – Experiment', kurz:'Einkommensänderung',
      phase:'PROGNOSE → EXPERIMENT', live: true, resetVorher: true,
      einleitung:`${sc.name} sind ein ${sc.gutTyp}. Alle übrigen Regler stehen wieder auf ihren Ausgangswerten (ceteris paribus). Bringen Sie die Gleichgewichtsmenge auf mindestens ${fmt(zielMenge)} ${sc.qUnit}.`,
      schritte:[
        { art:'wahl', phase:'1 · PROGNOSE', text:'Wie müssen Sie das Einkommen der Gäste verändern, damit die Gleichgewichtsmenge steigt?',
          optionen:['Das Einkommen erhöhen.', 'Das Einkommen senken.', 'Das Einkommen hat keinen Einfluss auf die Nachfrage.'],
          richtig:0,
          erklaerung:`Bei einem ${sc.gutTyp} steigt die Nachfrage mit dem Einkommen – die Nachfragekurve verschiebt sich nach rechts, Gleichgewichtspreis und -menge steigen.`,
          tipp:'Denken Sie an die Definition eines normalen Gutes.' },
        { art:'bedingung', phase:'2 · EXPERIMENT', pruefung:'menge_min', ziel:zielMenge,
          text:`Stellen Sie das Einkommen jetzt so ein, dass die Gleichgewichtsmenge mindestens ${fmt(zielMenge)} ${sc.qUnit} beträgt.`,
          tipp:'Beobachten Sie beim Schieben die Gleichgewichtsmenge unter dem Diagramm.' },
        { art:'rechnen', phase:'3 · AUSWERTUNG', ziel: zielMenge,
          text:'Bei welchem Einkommen (in Prozent) wird das Ziel gerade eben erreicht? Verändern Sie dabei nur den Einkommensregler.',
          felder:[{ key:'e', label:'Einkommen =', unit:'%', correct:noetigesEinkommen, liveMin:'einkommen',
                    tol:eink.step * 0.6, dec:0 }],
          tipp:'Gehen Sie mit dem Regler schrittweise zurück, bis das Ziel gerade noch erfüllt ist.',
          loesung:[`Ab einem Einkommen von ${fmt(noetigesEinkommen)} % erreicht die Gleichgewichtsmenge ${fmt(zielMenge)} ${sc.qUnit}.`] },
      ],
    },
    {
      id:'ueberhang', titel:'Überhang bei einem zu hohen Preis', kurz:'Überhang berechnen',
      phase:'BERECHNEN', markt: uebung, zeigFunktionen: true,
      einleitung:`Zurück zu den Funktionen von Aufgabe 1 (Gleichgewicht bei x* = ${fmt(ku.Q)} ${sc.qUnit} und p* = ${geld(ku.P, sc)}). Ein Anbieter verlangt ${geld(pU, sc)}.`,
      schritte:[{
        art:'rechnen', text:`Berechnen Sie die nachgefragte und die angebotene Menge bei p = ${geld(pU, sc)} sowie den Angebotsüberhang.`,
        tipp:'Setzen Sie den Preis in beide Funktionen ein und lösen Sie jeweils nach x auf.',
        felder:[
          { key:'xn', label:'nachgefragte Menge', unit:sc.qUnit, correct:xnU, tol:0.5, dec:0 },
          { key:'xa', label:'angebotene Menge', unit:sc.qUnit, correct:xaU, tol:0.5, dec:0 },
          { key:'ue', label:'Angebotsüberhang', unit:sc.qUnit, correct:xaU - xnU, tol:0.5, dec:0 },
        ],
        loesung:[
          `N:  ${dez(pU)} = ${dez(fU.a)} − ${dez(fU.b)}x  →  x = ${fmt(xnU)} ${sc.qUnit}`,
          `A:  ${dez(pU)} = ${zs(fU.c)} + ${dez(fU.d)}x  →  x = ${fmt(xaU)} ${sc.qUnit}`,
          `Angebotsüberhang = ${fmt(xaU)} − ${fmt(xnU)} = ${fmt(xaU - xnU)} ${sc.qUnit}`,
        ],
      }],
    },
  ];

  return { scKey: sc.key, uebung, aufgaben, aktiv: 0, schritt: 0, antworten: {},
           versuch: 0, res: null, zeigLoesung: false, tippAn: false, ergebnisse: [] };
}

//#ABSCHNITT theorie
const THEORIE = [
  { t:'Nachfrage, Angebot und Gleichgewicht', e:'⚖️', body:(
    <div className="space-y-2">
      <p><b>Gesetz der Nachfrage:</b> Je höher der Preis, desto geringer die nachgefragte Menge – die Nachfragekurve fällt.
         <b> Gesetz des Angebots:</b> Je höher der Preis, desto größer die angebotene Menge – die Angebotskurve steigt.</p>
      <p>Im Unterricht stehen die Funktionen in der Form</p>
      <p className="font-mono bg-slate-50 border border-slate-200 rounded p-2">
        N: p = a − b·x &nbsp;&nbsp;&nbsp; A: p = c + d·x
      </p>
      <p>Der Preis p steht auf der Hochachse, die Menge x auf der Rechtsachse.</p>
      <p className="font-mono bg-slate-50 border border-slate-200 rounded p-2">
        Gleichgewicht: a − b·x = c + d·x → x* = (a − c) : (b + d) → p* = a − b·x*
      </p>
      <p>Im Gleichgewicht wird der Markt <b>geräumt</b>: Alle, die zu diesem Preis kaufen oder verkaufen wollen, kommen zum Zug.</p>
      <p><b>Umstellen nach x:</b> Aus p = 19 + 0,25x wird x = 4p − 76. So berechnen Sie die Menge zu einem bestimmten Preis.</p>
    </div>) },
  { t:'Überhänge und Kapazitätsgrenze', e:'🏨', body:(
    <div className="space-y-2">
      <p>Liegt der Preis <b>über</b> dem Gleichgewichtspreis, wird mehr angeboten als nachgefragt: <b>Angebotsüberhang</b>.
         Zimmer bleiben leer, der Preis gerät unter Druck.</p>
      <p>Liegt der Preis <b>unter</b> dem Gleichgewichtspreis, wird mehr nachgefragt als angeboten: <b>Nachfrageüberhang</b>.
         Nicht alle Gäste bekommen einen Platz, der Preis steigt.</p>
      <p className="font-mono bg-slate-50 border border-slate-200 rounded p-2">
        Überhang = Differenz der beiden Mengen beim gegebenen Preis
      </p>
      <p>Im Gastgewerbe ist die Menge oft durch die <b>Kapazität</b> begrenzt – ein Hotel hat nur eine bestimmte Zahl an Zimmern.
         Ab der Kapazitätsgrenze verläuft die Angebotskurve <b>senkrecht</b>. Steigt die Nachfrage darüber hinaus,
         bleibt die Menge gleich und nur der Preis steigt; ihn liefert dann die Nachfragefunktion an der Grenzmenge.</p>
    </div>) },
  { t:'Verschiebung der Kurven', e:'↔️', body:(
    <div className="space-y-2">
      <p><b>Wichtig:</b> Eine Änderung des <i>Preises des Gutes selbst</i> führt zu einer <b>Bewegung auf</b> der Kurve.
         Alle <i>anderen</i> Einflussgrößen verschieben die <b>ganze Kurve</b> (ceteris paribus).</p>
      <table className="w-full text-[12.5px] border-collapse">
        <thead><tr className="bg-slate-100"><th className="border p-1.5 text-left">Änderung</th><th className="border p-1.5 text-left">Wirkung</th></tr></thead>
        <tbody>
          <tr><td className="border p-1.5">Einkommen steigt (normales Gut)</td><td className="border p-1.5 text-blue-700">Nachfrage → rechts</td></tr>
          <tr><td className="border p-1.5">Preis des Komplementärguts steigt</td><td className="border p-1.5 text-blue-700">Nachfrage → links</td></tr>
          <tr><td className="border p-1.5">Preis des Substitutionsguts steigt</td><td className="border p-1.5 text-blue-700">Nachfrage → rechts</td></tr>
          <tr><td className="border p-1.5">Präferenzen, Bewertungen, Trends verbessern sich</td><td className="border p-1.5 text-blue-700">Nachfrage → rechts</td></tr>
          <tr><td className="border p-1.5">Mehr Nachfrager (Saison, Wetter, Veranstaltung)</td><td className="border p-1.5 text-blue-700">Nachfrage → rechts</td></tr>
          <tr><td className="border p-1.5">Erwartung steigender Preise</td><td className="border p-1.5 text-blue-700">Nachfrage heute → rechts</td></tr>
          <tr><td className="border p-1.5">Kosten (Energie, Lebensmittel, Löhne) steigen</td><td className="border p-1.5 text-red-600">Angebot → links</td></tr>
          <tr><td className="border p-1.5">Neue Technik / Subvention</td><td className="border p-1.5 text-red-600">Angebot → rechts</td></tr>
          <tr><td className="border p-1.5">Mehr Anbieter im Markt</td><td className="border p-1.5 text-red-600">Angebot → rechts</td></tr>
        </tbody>
      </table>
      <p><b>Rechnerisch:</b> Steigt die Nachfrage bei jedem Preis um Δ, wird aus p = a − b·x die Funktion p = a − b·(x − Δ).
         Die Steigung bleibt gleich, nur der Achsenabschnitt ändert sich.</p>
      <p><b>Vier-Schritte-Analyse:</b> (1) Welche Marktseite ist betroffen? (2) In welche Richtung verschiebt sich die Kurve?
         (3) Neues Gleichgewicht einzeichnen. (4) Wirkung auf Preis und Menge ablesen.</p>
      <p><b>Doppelverschiebung:</b> Verschieben sich beide Kurven in dieselbe Richtung, ist nur die Mengenwirkung eindeutig;
         verschieben sie sich gegenläufig, nur die Preiswirkung.</p>
    </div>) },
  { t:'Höchst- und Mindestpreise', e:'🏛️', body:(
    <div className="space-y-2">
      <p>Ein <b>Höchstpreis</b> wirkt nur, wenn er <b>unter</b> dem Gleichgewichtspreis liegt.
         Dann entsteht ein <b>Nachfrageüberhang</b>. Gehandelt wird die kleinere Menge, also das Angebot.</p>
      <p>Ein <b>Mindestpreis</b> wirkt nur, wenn er <b>über</b> dem Gleichgewichtspreis liegt.
         Dann entsteht ein <b>Angebotsüberhang</b>. Gehandelt wird die kleinere Menge, also die Nachfrage.</p>
      <p>Liegt der festgesetzte Preis auf der anderen Seite des Gleichgewichtspreises, ist er <b>nicht bindend</b> – der Markt bleibt im Gleichgewicht.</p>
      <p>Wichtigstes Beispiel im Gastgewerbe: der <b>Mindestlohn</b> als Mindestpreis auf dem Arbeitsmarkt
         (13,90 € je Stunde ab 2026, 14,60 € ab 2027).</p>
    </div>) },
  { t:'Elastizitäten', e:'📐', body:(
    <div className="space-y-2">
      <p className="font-mono bg-slate-50 border border-slate-200 rounded p-2">
        Preiselastizität ε = (Δx : x₀) : (Δp : p₀)
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li><b>|ε| &gt; 1 elastisch:</b> Die Menge reagiert überproportional. Preiserhöhung → Umsatz sinkt.</li>
        <li><b>|ε| &lt; 1 unelastisch:</b> Die Menge reagiert unterproportional. Preiserhöhung → Umsatz steigt.</li>
        <li><b>|ε| = 1:</b> Der Umsatz bleibt gleich.</li>
      </ul>
      <p className="font-mono bg-slate-50 border border-slate-200 rounded p-2">Umsatz U = p · x</p>
      <p><b>Einkommenselastizität</b> = (Δx : x₀) : (ΔEinkommen : Einkommen₀).
         Positiv → <b>normales Gut</b>, negativ → <b>inferiores Gut</b>.</p>
      <p><b>Kreuzpreiselastizität</b> = (Δx des Gutes A : x₀) : (Δp des Gutes B : p₀).
         Positiv → <b>Substitutionsgüter</b>, negativ → <b>Komplementärgüter</b>.</p>
      <p><b>Im Gastgewerbe:</b> Urlaubsgäste vergleichen Angebote und können Ziel oder Termin wechseln – sie reagieren eher elastisch.
         Geschäftsreisende sind an Termin und Ort gebunden – sie reagieren eher unelastisch. Deshalb unterscheiden Betriebe
         ihre Preise, zum Beispiel nach Zimmerkategorie, Buchungszeitpunkt oder Vertriebskanal.</p>
    </div>) },
  { t:'Im Marktabenteuer: Umsatz ist nicht Gewinn', e:'🏪', body:(
    <div className="space-y-2">
      <p>Im Spielmodus führen Sie einen Betrieb. Ihr Ergebnis hängt an zwei Größen, die Sie selbst steuern:
         dem <b>Preis</b> und der daraus folgenden <b>Absatzmenge</b>.</p>
      <p className="font-mono bg-slate-50 border border-slate-200 rounded p-2">
        Umsatz = Preis · Absatz<br />
        variable Kosten = Kosten je Gast · Absatz<br />
        Deckungsbeitrag = Umsatz − variable Kosten<br />
        Gewinn = Deckungsbeitrag − Fixkosten
      </p>
      <p><b>Der Zielkonflikt:</b> Ein hoher Preis bringt viel je Gast, kostet aber Gäste – teils weil die Marktnachfrage sinkt,
         teils weil Gäste zum günstigeren Mitbewerber wechseln. Ein niedriger Preis bringt Gäste, aber wenig je Gast.
         Der beste Preis liegt dazwischen.</p>
    </div>) },
  { t:'Rechenweg-Spickzettel', e:'🧮', body:(
    <div className="space-y-2 font-mono text-[12.5px]">
      <p>1. Gleichsetzen:  a − b·x = c + d·x</p>
      <p>2. Sortieren:     a − c = (b + d)·x</p>
      <p>3. Auflösen:      x* = (a − c) : (b + d)</p>
      <p>4. Einsetzen:     p* = a − b·x*   (Probe: p* = c + d·x*)</p>
      <p>5. Überhang:      p einsetzen, beide x berechnen, Differenz bilden</p>
      <p>6. Verschiebung:  x durch (x − Δ) ersetzen, neu gleichsetzen</p>
      <p>7. Kapazität:     Gleichgewichtsmenge &gt; Grenze → x = Grenze, p aus N</p>
      <p>8. Elastizität:   ε = (Δx : x₀) : (Δp : p₀)</p>
    </div>) },
];

//#ABSCHNITT spiel
const F_NACHFRAGE = { frage:'Wie wirkt sich das auf die Marktnachfrage aus?', optionen:[
  'Die Nachfrage steigt bei jedem Preis – die Kurve verschiebt sich nach rechts.',
  'Die Nachfrage sinkt bei jedem Preis – die Kurve verschiebt sich nach links.',
  'An der Nachfrage ändert sich nichts.'] };
const F_KOSTEN = { frage:'Wie wirkt sich das auf Ihre Kosten und das Marktangebot aus?', optionen:[
  'Die Kosten je Gast steigen, das Angebot verschiebt sich nach links.',
  'Die Kosten je Gast sinken, das Angebot verschiebt sich nach rechts.',
  'Kosten und Angebot bleiben unverändert.'] };
const F_KONKURRENZ = { frage:'Was passiert mit Ihrer Gästezahl, wenn Sie Ihren Preis unverändert lassen?', optionen:[
  'Sie sinkt – Gäste wandern zur Konkurrenz ab.',
  'Sie steigt – ich bin jetzt vergleichsweise günstiger.',
  'Sie bleibt unverändert.'] };
const F_KAPAZITAET = { frage:'Was bedeutet das für diese Runde?', optionen:[
  'Ich kann höchstens die genannte Zahl an Gästen bedienen, auch wenn mehr kommen wollen.',
  'Meine Kosten je Gast sinken.',
  'Die Marktnachfrage steigt.'] };

const SPIEL_EREIGNISSE = [
  { id:'trend', emoji:'🔥', titel:'Reise-Influencer begeistert', art:'nachfrage', vz:1, staerke:0.18, richtig:0,
    text:sc => `Ein Reise-Influencer stellt ${sc.name} in Ihrer Region vor. Auf einmal wollen bei jedem Preis deutlich mehr Gäste buchen.`,
    erklaerung:'Geänderte Präferenzen verschieben die gesamte Nachfragekurve nach rechts.', ...F_NACHFRAGE },
  { id:'rezession', emoji:'📉', titel:'Die Konjunktur schwächelt', art:'nachfrage', vz:-1, staerke:0.15, richtig:1,
    text:() => 'Die Wirtschaft kühlt ab. Die Haushalte halten ihr Geld zusammen und sparen zuerst bei Reisen und beim Essengehen.',
    erklaerung:'Bei einem normalen Gut senkt ein niedrigeres Einkommen die Nachfrage bei jedem Preis.', ...F_NACHFRAGE },
  { id:'festival', emoji:'🎪', titel:'Festival in der Stadt', art:'nachfrage', vz:1, staerke:0.16, richtig:0,
    text:() => 'Ein großes Festival bringt für mehrere Tage tausende Besucherinnen und Besucher in die Stadt.',
    erklaerung:'Mehr Nachfrager erhöhen die Nachfrage bei jedem Preis – die Kurve verschiebt sich nach rechts.', ...F_NACHFRAGE },
  { id:'sturm', emoji:'🌧️', titel:'Sturmwarnung', art:'nachfrage', vz:-1, staerke:0.14, richtig:1,
    text:() => 'Für das kommende Wochenende ist ein Sturm angekündigt. Viele Gäste stornieren oder verschieben ihren Besuch.',
    erklaerung:'Weniger Gäste wollen bei jedem Preis buchen – die Kurve verschiebt sich nach links.', ...F_NACHFRAGE },
  { id:'komp', emoji:'🔗', titel:'Ergänzungsgut wird teurer', art:'nachfrage', vz:-1, staerke:0.13, richtig:1,
    text:sc => `Der Preis für ${sc.komp} steigt kräftig. Ihre Gäste brauchen es zusammen mit Ihrem Angebot.`,
    erklaerung:'Wird das Komplementärgut teurer, wird das Gesamtpaket teurer – die Nachfrage nach Ihrem Angebot sinkt.', ...F_NACHFRAGE },
  { id:'subst', emoji:'🔁', titel:'Ersatzangebot wird teurer', art:'nachfrage', vz:1, staerke:0.15, richtig:0,
    text:sc => `Der Preis für ${sc.subst} zieht stark an – für viele Gäste ist das die Alternative zu Ihrem Angebot.`,
    erklaerung:'Wird das Substitutionsgut teurer, weichen Gäste auf Ihr Angebot aus – Ihre Nachfrage steigt.', ...F_NACHFRAGE },
  { id:'bewertung', emoji:'⭐', titel:'Top-Bewertungen', art:'nachfrage', vz:1, staerke:0.16, richtig:0,
    text:() => 'Nach vielen Fünf-Sterne-Bewertungen steht Ihr Betrieb auf einem großen Bewertungsportal ganz oben.',
    erklaerung:'Ein besseres Image erhöht die Zahlungsbereitschaft – die Nachfragekurve verschiebt sich nach rechts.', ...F_NACHFRAGE },
  { id:'presse', emoji:'📰', titel:'Schlechte Schlagzeilen', art:'nachfrage', vz:-1, staerke:0.16, richtig:1,
    text:() => 'Ein Zeitungsbericht über Hygienemängel in mehreren Betrieben der Region verunsichert die Gäste.',
    erklaerung:'Verschlechterte Präferenzen senken die Nachfrage bei jedem Preis.', ...F_NACHFRAGE },
  { id:'energie', emoji:'🏭', titel:'Energie und Lebensmittel werden teurer', art:'kosten', vz:1, staerke:0.14, richtig:0,
    text:() => 'Strom, Heizung und Lebensmittel kosten deutlich mehr. Jeder Gast verursacht Ihnen höhere Kosten.',
    erklaerung:'Höhere Kosten je Gast verschieben die Angebotskurve nach oben bzw. links.', ...F_KOSTEN },
  { id:'mindestlohn', emoji:'💶', titel:'Der Mindestlohn steigt', art:'kosten', vz:1, staerke:0.12, richtig:0,
    text:() => 'Der gesetzliche Mindestlohn wird angehoben. Im personalintensiven Gastgewerbe steigen damit Ihre Kosten je Gast.',
    erklaerung:'Höhere Personalkosten wirken wie eine Kostenerhöhung – das Angebot verschiebt sich nach links.', ...F_KOSTEN },
  { id:'digital', emoji:'⚙️', titel:'Digitaler Check-in', art:'kosten', vz:-1, staerke:0.13, richtig:1,
    text:() => 'Ein neues Buchungs- und Check-in-System spart viel Arbeitszeit an der Rezeption und senkt Ihre Kosten je Gast.',
    erklaerung:'Sinkende Kosten je Gast verschieben die Angebotskurve nach unten bzw. rechts.', ...F_KOSTEN },
  { id:'kurbeitrag', emoji:'🏛️', titel:'Neue Abgabe je Gast', art:'kosten', vz:1, staerke:0.12, richtig:0,
    text:() => 'Die Gemeinde führt eine Abgabe je Gast ein, die Sie an die Gemeindekasse abführen müssen.',
    erklaerung:'Eine Abgabe je Gast wirkt wie eine Mengensteuer – das Angebot verschiebt sich nach links.', ...F_KOSTEN },
  { id:'subvention', emoji:'🤝', titel:'Förderprogramm Nebensaison', art:'kosten', vz:-1, staerke:0.12, richtig:1,
    text:() => 'Der Freistaat fördert Betriebe in der Nebensaison mit einem Zuschuss je Gast.',
    erklaerung:'Eine Subvention senkt die effektiven Kosten – das Angebot verschiebt sich nach rechts.', ...F_KOSTEN },
  { id:'preiskampf', emoji:'⚔️', titel:'Die Konkurrenz greift an', art:'konkurrenz', vz:-1, staerke:0.12, richtig:0,
    text:() => 'Ihr größter Mitbewerber senkt seine Preise auf den Buchungsportalen deutlich und wirbt offensiv um Ihre Gäste.',
    erklaerung:'Wird der Konkurrent günstiger, verlieren Sie bei unverändertem Preis Gäste.', ...F_KONKURRENZ },
  { id:'konkTeuer', emoji:'💸', titel:'Die Konkurrenz wird teurer', art:'konkurrenz', vz:1, staerke:0.12, richtig:1,
    text:() => 'Ihr Mitbewerber hebt die Preise an, weil seine Energie- und Personalkosten gestiegen sind.',
    erklaerung:'Ist der Konkurrent teurer, wirken Sie im Vergleich günstiger und gewinnen Gäste.', ...F_KONKURRENZ },
  { id:'neuerAnbieter', emoji:'🏬', titel:'Neueröffnung nebenan', art:'konkurrenz', vz:-1, staerke:0.10, angebotRechts:true, richtig:0,
    text:sc => `Eine Kette eröffnet in Ihrer Stadt und lockt mit Eröffnungspreisen für ${sc.name}.`,
    erklaerung:'Mehr Anbieter drücken das Preisniveau – bei unverändertem Preis sinkt Ihre Gästezahl.', ...F_KONKURRENZ },
  { id:'konkUmbau', emoji:'🚧', titel:'Konkurrent baut um', art:'konkurrenz', vz:1, staerke:0.14, richtig:1,
    text:() => 'Beim Mitbewerber wird renoviert. Er hat kaum freie Kapazität und hebt die Preise an.',
    erklaerung:'Der Konkurrent wird teurer – Ihre relative Position verbessert sich.', ...F_KONKURRENZ },
  { id:'personal', emoji:'🤒', titel:'Personalausfall', art:'kapazitaet', richtig:0,
    text:() => 'Mehrere Mitarbeitende fallen krankheitsbedingt aus. Diese Runde können Sie nur eine begrenzte Zahl an Gästen bedienen.',
    erklaerung:'Die Kapazitätsgrenze begrenzt Ihren Absatz – mehr Gäste können Sie nicht bedienen, auch wenn mehr kommen wollen.', ...F_KAPAZITAET },
];

//#ABSCHNITT teilnehmer
/* Akteure auf dem Markt im Gastgewerbe – nur hinterlegte Figuren aus assets/icons/ */
const NACHFRAGESEITE = [
  { sprite:'tourist',   name:'Urlaubsgäste',              text:'Reisen in der Freizeit und vergleichen Preise – sie reagieren stark auf den Preis.' },
  { sprite:'haendler',  name:'Geschäfts­reisende',  text:'Reisen beruflich, der Arbeitgeber zahlt – sie reagieren kaum auf den Preis.' },
  { sprite:'haushalte', name:'Tagesgäste',                text:'Besuchen Restaurant, Café oder Veranstaltung. Ihr Einkommen bestimmt die Nachfrage mit.' },
];

const ANGEBOTSSEITE = [
  { sprite:'unternehmen', name:'Hotels & Gastronomie', text:'Bieten Zimmer, Speisen und Service an – bis zur Grenze ihrer Kapazität.' },
  { sprite:'lieferant',   name:'Lieferanten',         text:'Liefern Lebensmittel, Getränke und Wäsche – ihre Preise wirken auf das Angebot.' },
  { sprite:'investor',    name:'Investor:innen',       text:'Bauen und modernisieren Betriebe – mehr Kapazität bedeutet mehr Angebot.' },
];

const RAHMEN = [
  { sprite:'staat', name:'Staat & Gemeinde', text:'Mindestlohn, Kurbeitrag, Steuern und Förderprogramme greifen in den Markt ein.' },
];

//#ABSCHNITT legende
const LEGENDE = [
  { sprite:'punkt',  name:'Gleichgewicht',  text:'Schnittpunkt von Nachfrage und Angebot: Gleichgewichtsmenge x* und -preis p*.' },
  { sprite:'kurveN', name:'Nachfragekurve', text:'Fällt: Bei höherem Preis wird weniger nachgefragt.' },
  { sprite:'kurveA', name:'Angebotskurve',  text:'Steigt: Bei höherem Preis wird mehr angeboten.' },
];

//#ABSCHNITT ergebnisraster
function ErgebnisRaster({ sc, markt, preis }) {
  const k = marktKennzahlen(markt);
  const n = Math.max(0, qd(markt, preis)), a = Math.max(0, qs(markt, preis));
  const diff = a - n;
  const felder = [
    { s:'muenze', l:'Gleichgewichtspreis p*', v:geld(k.P, sc),               f:'text-amber-600' },
    { s:'paket',  l:'Gleichgewichtsmenge x*', v:`${fmt(k.Q)} ${sc.qUnit}`,   f:'text-amber-600' },
    { s:'kurveN', l:`Nachfrage bei ${geld(preis, sc)}`, v:`${fmt(n)} ${sc.qUnit}`, f:'text-blue-600' },
    { s:'kurveA', l:`Angebot bei ${geld(preis, sc)}`,   v:`${fmt(a)} ${sc.qUnit}`, f:'text-red-600' },
    { s:'aktentasche', l:'Umsatz im Gleichgewicht', v:geld(k.P * k.Q, sc), f:'text-green-700' },
    { s:'tausch', l: Math.abs(diff) < 0.5 ? `Überhang bei ${geld(preis, sc)}` : diff > 0 ? 'Angebotsüberhang' : 'Nachfrageüberhang',
      v: Math.abs(diff) < 0.5 ? 'keiner' : `${fmt(Math.abs(diff))} ${sc.qUnit}`, f:'text-purple-700' },
  ];
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {felder.map(x => (
          <div key={x.s} className="flex items-center gap-2 rounded-lg bg-[#FBF8F1] border border-[#EAE2D2] px-2 py-1.5">
            <span className="shrink-0"><Pixel name={x.s} size={2} /></span>
            <span className="min-w-0">
              <span className="block text-[10px] text-slate-500 leading-tight">{x.l}</span>
              <span className={`block text-[13px] font-bold num-input leading-tight ${x.f}`}>{x.v}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <span>Funktionen: <b className="num-input text-blue-700"><Fn m={markt} kind="d" /></b> · <b className="num-input text-red-600"><Fn m={markt} kind="s" /></b></span>
        <span className={Math.abs(diff) < 0.5 ? 'text-green-600' : 'text-purple-700'}>
          {Math.abs(diff) < 0.5 ? 'Markt geräumt' : 'Preis liegt nicht im Gleichgewicht'}
        </span>
      </div>
    </div>
  );
}

//#ABSCHNITT analyse
const ANALYSE_TABS = [
  { key:'preis', label:'Preisänderung', par:'preis', braucht:'gleichgewicht',
    frage:'Was passiert, wenn sich der Preis des Gutes selbst ändert?',
    fazit:'Eine Änderung des Preises verschiebt die Kurven nicht. Man bewegt sich nur auf der Nachfrage- bzw. Angebotskurve: Die nachgefragte und die angebotene Menge ändern sich, Gleichgewichtspreis und -menge bleiben gleich. Erst ein anderer Einflussfaktor verschiebt eine Kurve.' },
  { key:'einkommen', label:'Einkommensänderung', par:'einkommen', braucht:'einkommen',
    frage:'Was passiert, wenn sich das Einkommen der Gäste ändert?',
    fazit:'Bei einem normalen Gut verschiebt ein höheres Einkommen die Nachfragekurve nach rechts: Gleichgewichtspreis und Gleichgewichtsmenge steigen. Bei einem inferioren Gut wäre die Richtung umgekehrt.' },
  { key:'komplement', label:'Komplementärgut', par:'komplement', braucht:'komplement',
    frage:'Was passiert, wenn sich der Preis des Komplementärgutes ändert?',
    fazit:'Ein höherer Preis des Komplementärgutes verteuert das gemeinsam genutzte Paket. Die Nachfrage sinkt bei jedem Preis, die Nachfragekurve verschiebt sich nach links – Gleichgewichtspreis und -menge sinken.' },
  { key:'substitut', label:'Substitutionsgut', par:'substitut', braucht:null,
    frage:'Was passiert, wenn sich der Preis des Substitutionsgutes ändert?',
    fazit:'Wird das Ersatzangebot teurer, weichen die Gäste auf das betrachtete Angebot aus. Die Nachfragekurve verschiebt sich nach rechts – Gleichgewichtspreis und -menge steigen.' },
  { key:'erwartung', label:'Erwartungen', par:'erwartung', braucht:null,
    frage:'Was passiert, wenn die Gäste künftig höhere Preise erwarten?',
    fazit:'Wer künftig steigende Preise erwartet, bucht früher. Die heutige Nachfragekurve verschiebt sich nach rechts – Gleichgewichtspreis und -menge steigen heute.' },
];

//#ABSCHNITT themen
const THEMEN = [
  { nr:1, sprite:'punkt',  text:'Wo sich Angebot und Nachfrage treffen: Gleichgewicht berechnen, Funktionen umstellen und grafisch darstellen.' },
  { nr:2, sprite:'hotel',  text:'Angebots- und Nachfrageüberhang bei einem gegebenen Preis – und was passiert, wenn alle Zimmer belegt sind.' },
  { nr:3, sprite:'tausch', text:'Was verschiebt die Kurven – und wohin? Neues Gleichgewicht, Doppelverschiebung und Fehlersuche.' },
  { nr:4, sprite:'staat',  text:'Höchst- und Mindestpreise: bindend oder nicht? Überhänge berechnen und beurteilen.' },
  { nr:5, sprite:'trend',  text:'Preis-, Einkommens- und Kreuzpreiselastizität berechnen und deuten – mit Umsatzwirkung.' },
].map(t => ({ ...STUFEN.find(s => s.nr === t.nr), ...t }));

//#ABSCHNITT badges
const BADGES = [
  { id:'first',   emoji:'🎯', name:'Erster Treffer',        cond:p => p.totalOk >= 1 },
  { id:'eq5',     emoji:'⚖️', name:'Gleichgewichts-Profi',  cond:p => p.stats[1].ok >= 5 },
  { id:'kap5',    emoji:'🏨', name:'Kapazitäts-Profi',      cond:p => p.stats[2].ok >= 5 },
  { id:'shift5',  emoji:'↔️', name:'Kurven-Kenner:in',      cond:p => p.stats[3].ok >= 5 },
  { id:'staat5',  emoji:'🏛️', name:'Marktwächter:in',       cond:p => p.stats[4].ok >= 5 },
  { id:'elast5',  emoji:'📐', name:'Elastizitäts-Ass',      cond:p => p.stats[5].ok >= 5 },
  { id:'streak5', emoji:'🔥', name:'5er-Serie',             cond:p => p.bestStreak >= 5 },
  { id:'coins',   emoji:'🪙', name:'Münzsammler:in (500)',  cond:p => p.coins >= 500 },
  { id:'all3',    emoji:'🏅', name:'Allrounder:in',         cond:p => [1,2,3,4,5].every(s => p.stats[s].ok >= 3) },
  { id:'zeich5',  emoji:'✏️', name:'Zeichenprofi',          cond:p => zeichnungenVoll(p) >= 5 },
];
