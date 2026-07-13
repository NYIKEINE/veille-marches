// build-site.mjs
// Régénère site.html à partir de tous les comptes rendus Markdown du dossier
// comptes-rendus/.
//
// Trois types de contenu, distingués par le nom du fichier :
//   AAAA-MM-JJ.md          → veille quotidienne (CAC 40 · Crypto · Or)
//   AAAA-MM-JJ-crypto.md   → revue de presse crypto hebdomadaire
//   AAAA-MM-JJ-flash.md    → flash crypto urgent
//
// Usage : node build-site.mjs
//
// Ne rien coder à la main dans site.html : ce script l'écrase à chaque exécution.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = join(HERE, "comptes-rendus");
const TEMPLATE = join(HERE, "_template.html");
const OUTPUT = join(HERE, "index.html");

// Sous-titre affiché sur chaque carte, et priorité d'affichage à date égale
// (rang le plus élevé en premier : un flash passe devant la revue, puis la veille).
const TYPES = {
  flash:  { subtitle: "⚡ Flash crypto urgent",           rank: 2 },
  crypto: { subtitle: "Revue de presse crypto de la semaine", rank: 1 },
  daily:  { subtitle: "CAC 40 · Crypto · Or",             rank: 0 },
};

function prepare(raw) {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");

  // Retirer un éventuel titre H1 en tête (le site affiche déjà la date).
  while (lines.length && lines[0].trim() === "") lines.shift();
  if (lines.length && /^#\s+/.test(lines[0])) lines.shift();

  // Retirer les liens vers des images/fichiers locaux qui n'existent pas en ligne.
  const cleaned = lines.filter(l => !/\]\((?!https?:)[^)]*\.(svg|png|jpe?g|gif)\)/i.test(l));

  return cleaned.join("\n").trim();
}

function classify(filename) {
  const m = filename.match(/^(\d{4}-\d{2}-\d{2})(?:-(crypto|flash))?\.md$/);
  if (!m) return null;
  const type = m[2] || "daily";
  return { date: m[1], type, filename };
}

function build() {
  const reports = readdirSync(REPORTS_DIR)
    .map(classify)
    .filter(Boolean)
    // Plus récent d'abord ; à date égale, le rang le plus élevé passe devant.
    .sort((a, b) =>
      a.date === b.date
        ? TYPES[b.type].rank - TYPES[a.type].rank
        : b.date.localeCompare(a.date))
    .map(r => ({
      date: r.date,
      titre: TYPES[r.type].subtitle,
      md: prepare(readFileSync(join(REPORTS_DIR, r.filename), "utf8")),
    }));

  const template = readFileSync(TEMPLATE, "utf8");
  const html = template.replace("__REPORTS__", JSON.stringify(reports));
  writeFileSync(OUTPUT, html, "utf8");

  console.log(`OK — ${reports.length} compte(s) rendu(s) inclus :`);
  reports.forEach(r => console.log(`   - ${r.date} (${r.md.length} caractères)`));
  console.log(`Site écrit dans : ${OUTPUT}`);
}

build();
