// Provide a minimal window global so getRdflib() doesn't throw during import.
// Tests inject the mock rdflib via moduleNameMapper, not window.$rdf.
if (typeof window === 'undefined') {
  global.window = {};
}
