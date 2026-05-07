#!/usr/bin/env node
/**
 * validate.mjs
 *
 * Usage:
 *   node validate.mjs x.shacl y.turtle
 *
 * Exit codes:
 *   0 = conforms
 *   1 = does not conform
 *   2 = error
 */

import fs from "node:fs/promises";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { Parser, Store } from "n3";
import SHACLValidator from "rdf-validate-shacl";

function printUsage() {
  console.error("Usage: node validate.mjs x.shacl y.turtle");
}

async function parseTurtleToStore(turtleText, baseIRI) {
  const parser = new Parser({ baseIRI });
  const store = new Store();
  store.addQuads(parser.parse(turtleText));
  return store;
}

function formatTerm(t) {
  if (!t) return "";
  if (t.termType === "NamedNode") return `<${t.value}>`;
  if (t.termType === "BlankNode") return `_:${t.value}`;
  if (t.termType === "Literal") {
    const dt = t.datatype?.value ? `^^<${t.datatype.value}>` : "";
    const lang = t.language ? `@${t.language}` : "";
    return `"${t.value.replaceAll('"', '\\"')}"${lang}${dt}`;
  }
  return String(t.value ?? "");
}

function printReport(report) {
  console.log(`conforms: ${report.conforms}`);

  const results = Array.from(report.results || []);
  if (results.length === 0) return;

  console.log(`results: ${results.length}\n`);

  for (const r of results) {
    const severity = r.severity?.value ?? "";
    const focusNode = formatTerm(r.focusNode);
    const path = r.path ? formatTerm(r.path) : "";
    const message =
      (Array.isArray(r.message) && r.message[0]?.value) ||
      r.message?.value ||
      "";
    const sourceShape = r.sourceShape ? formatTerm(r.sourceShape) : "";
    const sourceConstraintComponent = r.sourceConstraintComponent
      ? formatTerm(r.sourceConstraintComponent)
      : "";

    console.log("- violation");
    if (severity) console.log(`  severity: ${severity}`);
    if (focusNode) console.log(`  focusNode: ${focusNode}`);
    if (path) console.log(`  path: ${path}`);
    if (message) console.log(`  message: ${message}`);
    if (sourceShape) console.log(`  sourceShape: ${sourceShape}`);
    if (sourceConstraintComponent)
      console.log(`  sourceConstraintComponent: ${sourceConstraintComponent}`);
    console.log("");
  }
}

async function main() {
  const [, , shapesPath, dataPath, ...rest] = process.argv;

  if (!shapesPath || !dataPath || rest.length > 0) {
    printUsage();
    process.exit(2);
  }

  try {
    const [shapesTtl, dataTtl] = await Promise.all([
      fs.readFile(shapesPath, "utf8"),
      fs.readFile(dataPath, "utf8"),
    ]);

    const shapesBase = pathToFileURL(shapesPath).href;
    const dataBase = pathToFileURL(dataPath).href;

    const shapesStore = await parseTurtleToStore(shapesTtl, shapesBase);
    const dataStore = await parseTurtleToStore(dataTtl, dataBase);

    const validator = new SHACLValidator(shapesStore);
    const report = await validator.validate(dataStore);

    printReport(report);

    process.exit(report.conforms ? 0 : 1);
  } catch (err) {
    console.error("Error:", err?.message ?? err);
    process.exit(2);
  }
}

main();
