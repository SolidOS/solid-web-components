import rdf from 'rdf-ext';
import SHACLValidator from 'rdf-validate-shacl';
import { Parser } from 'n3';
import { readFile } from 'fs/promises';
import clownface from 'clownface';
import namespace from '@rdfjs/namespace';

const factory = {
  ...rdf,
  clownface: (options) => clownface(options)
};

async function parseTurtle(content) {
  const dataset = rdf.dataset();
  const parser = new Parser();
  
  return new Promise((resolve, reject) => {
    parser.parse(content, (error, quad) => {
      if (error) {
        reject(error);
      } else if (quad) {
        dataset.add(quad);
      } else {
        resolve(dataset);
      }
    });
  });
}

async function validate(shaclPath, dataPath) {
  const shaclContent = await readFile(shaclPath, 'utf-8');
  const dataContent = await readFile(dataPath, 'utf-8');
  
  const shapes = await parseTurtle(shaclContent);
  const data = await parseTurtle(dataContent);
  
  const validator = new SHACLValidator(shapes, { factory });
  const report = validator.validate(data);
  
  console.log(`Conforms: ${report.conforms}\n`);
  
  if (!report.conforms) {
    console.log('Validation Results:');
    for (const result of report.results) {
      console.log(`\n  Focus Node: ${result.focusNode?.value || 'unknown'}`);
      console.log(`  Path: ${result.path?.value || 'none'}`);
      console.log(`  Message: ${result.message?.[0]?.value || 'No message'}`);
      console.log(`  Severity: ${result.severity?.value || 'unknown'}`);
    }
  }
  
  return report.conforms;
}

const [shaclFile, dataFile] = process.argv.slice(2);

if (!shaclFile || !dataFile) {
  console.error('Usage: node validate.js <shacl-file.ttl> <data-file.ttl>');
  process.exit(1);
}

validate(shaclFile, dataFile)
  .then(conforms => process.exit(conforms ? 0 : 1))
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(2);
  });
