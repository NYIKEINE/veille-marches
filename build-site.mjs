// build-site.mjs
// Régénère site.html à partir de tous les comptes rendus Markdown du dossier
// comptes-rendus/ (un fichier par jour, nommé AAAA-MM-JJ.md).
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

const SOUS_TITRE = "CAC 40 · Crypto · Or";

function prepare(raw) {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");

  // Retirer un éventuel titre H1 en tête (le site affiche déjà la date).
  while (lines.length && lines[0].trim() === "") lines.shift();
  if (lines.length && /^#\s+/.test(lines[0])) lines.shift();

  // Retirer les liens vers des images/fichiers locaux qui n'existent pas en ligne.
  const cleaned = lines.filter(l => !/\]\((?!https?:)[^)]*\.(svg|png|jpe?g|gif)\)/i.test(l));

  return cleaned.join("\n").trim();
}

function build() {
  const files = readdirSync(REPORTS_DIR)
    .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .sort()
    .reverse(); // plus récent d'abord

  const reports = files.map(f => ({
    date: f.replace(/\.md$/, ""),
    titre: SOUS_TITRE,
    md: prepare(readFileSync(join(REPORTS_DIR, f), "utf8")),
  }));

  const template = readFileSync(TEMPLATE, "utf8");
  const html = template.replace("__REPORTS__", JSON.stringify(reports));
  writeFileSync(OUTPUT, html, "utf8");

  console.log(`OK — ${reports.length} compte(s) rendu(s) inclus :`);
  reports.forEach(r => console.log(`   - ${r.date} (${r.md.length} caractères)`));
  console.log(`Site écrit dans : ${OUTPUT}`);
}

build();
