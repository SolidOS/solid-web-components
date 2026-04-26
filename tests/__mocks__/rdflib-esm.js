// ESM re-export of the rdflib mock for use in ESM test files.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const rdflib = require('./rdflib.cjs');
export const { graph, sym, literal, blankNode, parse, NamedNode, BlankNode, Literal, Statement, Fetcher } = rdflib;
export default rdflib;
