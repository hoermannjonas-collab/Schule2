#!/usr/bin/env node
/**
 * Erzeugt markt-simulator-offline.html aus markt-simulator.html.
 *
 * Dabei werden React, ReactDOM und die benötigte Tailwind-CSS in die Datei
 * eingebettet und das JSX vorab übersetzt. Die Offline-Fassung lädt dadurch
 * nichts aus dem Netz nach.
 *
 * Einmalig:  cd tools && npm install
 * Aufruf:    node tools/offline_bauen.js
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const WERKZEUGE = __dirname;
const WURZEL = path.dirname(WERKZEUGE);
const QUELLE = path.join(WURZEL, 'markt-simulator.html');
const ZIEL = path.join(WURZEL, 'markt-simulator-offline.html');
const mod = (p) => path.join(WERKZEUGE, 'node_modules', p);

if (!fs.existsSync(mod('@babel/standalone'))) {
  console.error('Abhängigkeiten fehlen. Bitte einmalig ausführen:  cd tools && npm install');
  process.exit(1);
}

// Tailwind-CSS immer frisch erzeugen, sonst fehlen neu verwendete Klassen
const twConfig = path.join(WERKZEUGE, '.tailwind.config.js');
const twEingabe = path.join(WERKZEUGE, '.tailwind.css');
const twAusgabe = path.join(WERKZEUGE, '.tailwind.out.css');
fs.writeFileSync(twConfig, `module.exports = { content: ['${QUELLE}'] };\n`);
fs.writeFileSync(twEingabe, '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n');
execFileSync(path.join(WERKZEUGE, 'node_modules', '.bin', 'tailwindcss'),
  ['-c', twConfig, '-i', twEingabe, '-o', twAusgabe, '--minify'], { stdio: 'pipe' });

const Babel = require(mod('@babel/standalone'));
const lies = (f) => fs.readFileSync(f, 'utf8');
let html = lies(QUELLE);

const treffer = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
if (!treffer) { console.error('Kein <script type="text/babel"> gefunden.'); process.exit(1); }
const { code } = Babel.transform(treffer[1], { presets: [['react', { runtime: 'classic' }]] });

const react = lies(mod('react/umd/react.production.min.js'));
const reactDom = lies(mod('react-dom/umd/react-dom.production.min.js'));
const tw = lies(twAusgabe);

// Ersetzungsfunktionen statt Zeichenketten: minifizierter Code enthält $-Muster,
// die String.replace sonst als Rückverweise deuten würde.
html = html.replace(/<script src="https:\/\/cdnjs[^"]*"><\/script>\n?/g, '');
html = html.replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>\n?/, '');
html = html.replace('<style>', () => '<style>\n' + tw + '\n</style>\n<style>');
html = html.replace(treffer[0], () =>
  '<script>\n' + react + '\n</script>\n<script>\n' + reactDom + '\n</script>\n<script>\n' + code + '\n</script>');
html = html.replace('<title>', '<!-- Offline-Fassung: erzeugt aus markt-simulator.html mit tools/offline_bauen.js.\n' +
  '     Nicht von Hand bearbeiten. -->\n<title>');

fs.writeFileSync(ZIEL, html);
for (const f of [twConfig, twEingabe, twAusgabe]) fs.unlinkSync(f);
console.log('markt-simulator-offline.html erzeugt: ' + Math.round(html.length / 1024) + ' KB');
