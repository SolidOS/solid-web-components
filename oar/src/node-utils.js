import * as $rdf from 'rdflib';
import vocab from 'solid-namespace';
import {SolidNodeClient} from 'solid-node-client';
const client = new SolidNodeClient();

const authFetch = client.fetch.bind(client);
const store = $rdf.graph();
const fetcher = $rdf.fetcher(store,{fetch:authFetch});
const updater = new $rdf.UpdateManager(store);
const sym = $rdf.sym ;
const lit = $rdf.lit ;
const ns = vocab();

export const rdfConfig = {
  ns, sym, lit, store, fetcher, updater
}
//console.log(rdfConfig.ns['foaf']('type'))

