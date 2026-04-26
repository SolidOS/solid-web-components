// Environment-agnostic helpers for walking ui:Form definitions and
// managing rdf:Collection data in an rdflib store. Used by both the
// browser <sol-form> component and the Node.js sol-form API.

import * as $rdf from 'rdflib';

export const UI  = 'http://www.w3.org/ns/ui#';
export const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

// Thin shim so the rest of the file reads the same whether the caller
// passes the core/rdf.js singleton or raw rdflib.
const rdf = {
  sym:       (u) => $rdf.sym(u),
  literal:   (v, d) => $rdf.literal(v, d),
  blankNode: (id) => $rdf.blankNode(id),
  Collection: $rdf.Collection,
};

export const MAX_DEPTH = 5;

export function fieldType(store, field) {
  const typeP = rdf.sym(RDF + 'type');
  const types = store.each(field, typeP);
  for (const t of types) {
    if (t.value && t.value.startsWith(UI)) return t.value;
  }
  return UI + 'SingleLineTextField';
}

export function readFormParts(store, form) {
  const node = store.any(form, rdf.sym(UI + 'parts'));
  if (node && node.elements) return node.elements;
  const alt = store.each(form, rdf.sym(UI + 'part'));
  return alt.length ? alt : [];
}

export function readList(store, subject, property, doc) {
  const val = store.any(subject, property, null, doc);
  if (!val) return [];
  if (val.elements) return [...val.elements];
  const FIRST = rdf.sym(RDF + 'first'), REST = rdf.sym(RDF + 'rest'), NIL = rdf.sym(RDF + 'nil');
  const result = [];
  let cur = val;
  while (cur && cur.termType === 'BlankNode') {
    const f = store.any(cur, FIRST);
    if (!f) break;
    result.push(f);
    const next = store.any(cur, REST);
    if (!next || next.value === NIL.value) break;
    cur = next;
  }
  return result;
}

export function syncCollection(store, subject, property, items, doc) {
  for (const st of [...store.statementsMatching(subject, property, null, doc)]) {
    if (st.object.termType === 'BlankNode') removeChain(store, st.object, doc);
    store.remove(st);
  }
  if (!items.length) return;
  const col = new (rdf.Collection)(items);
  store.add(subject, property, col, doc);
}

export function removeChain(store, node, doc) {
  const FIRST = rdf.sym(RDF + 'first'), REST = rdf.sym(RDF + 'rest');
  let cur = node;
  while (cur && cur.termType === 'BlankNode') {
    const rests = store.statementsMatching(cur, REST, null, doc);
    const next = rests.length ? rests[0].object : null;
    for (const s of store.statementsMatching(cur, FIRST, null, doc)) store.remove(s);
    for (const s of rests) store.remove(s);
    if (!next || next.termType !== 'BlankNode') break;
    cur = next;
  }
}

export function removeItemData(store, item, doc) {
  for (const st of [...store.statementsMatching(item, null, null, doc)]) {
    if (st.object.termType === 'BlankNode') removeItemData(store, st.object, doc);
    if (st.object.elements) {
      for (const el of st.object.elements) {
        if (el.termType === 'BlankNode') removeItemData(store, el, doc);
      }
    }
  }
  for (const s of [...store.statementsMatching(item, null, null, doc)]) store.remove(s);
}

export function setDefaults(store, form, subject, doc) {
  for (const field of readFormParts(store, form)) {
    const property = store.any(field, rdf.sym(UI + 'property'));
    const dflt = store.any(field, rdf.sym(UI + 'default'));
    if (!property || !dflt) continue;
    const nn = store.anyValue(field, rdf.sym(UI + 'namedNode')) === 'true';
    store.add(subject, property, nn ? rdf.sym(dflt.value) : rdf.literal(dflt.value), doc);
  }
}

// Walk a form definition and populate an rdflib store from a plain JS
// data object. Used by the Node.js programmatic API; the browser version
// uses DOM-based rendering instead.
export function populateStore(store, form, subject, doc, data, depth) {
  if (!data || depth > MAX_DEPTH) return;
  const fields = readFormParts(store, form);

  for (const field of fields) {
    const type = fieldType(store, field);
    const property = store.any(field, rdf.sym(UI + 'property'));

    if (type === UI + 'Form' || type === UI + 'Group') {
      populateStore(store, field, subject, doc, data, depth);
      continue;
    }

    if (type === UI + 'Options') {
      const dependsOn = store.any(field, rdf.sym(UI + 'dependingOn'));
      if (!dependsOn) continue;
      const cur = store.any(subject, dependsOn, null, doc);
      if (!cur) continue;
      const cases = store.each(field, rdf.sym(UI + 'case'));
      for (const c of cases) {
        const forVal = store.any(c, rdf.sym(UI + 'for'));
        if (forVal && forVal.value === cur.value) {
          const useForm = store.any(c, rdf.sym(UI + 'use'));
          if (useForm) populateStore(store, useForm, subject, doc, data, depth);
          break;
        }
      }
      continue;
    }

    if (!property) continue;
    const localName = property.value.replace(/.*[/#]/, '');

    if (type === UI + 'Multiple') {
      const arr = data[localName];
      if (!Array.isArray(arr) || !arr.length) continue;
      const partForm = store.any(field, rdf.sym(UI + 'part'));
      if (!partForm) continue;
      const items = [];
      for (const itemData of arr) {
        const node = rdf.blankNode();
        setDefaults(store, partForm, node, doc);
        populateStore(store, partForm, node, doc, itemData, depth + 1);
        items.push(node);
      }
      syncCollection(store, subject, property, items, doc);
      continue;
    }

    if (type === UI + 'Choice') {
      const val = data[localName];
      for (const s of [...store.statementsMatching(subject, property, null, doc)]) store.remove(s);
      if (val == null) {
        const dflt = store.any(field, rdf.sym(UI + 'default'));
        if (dflt) {
          const nn = store.anyValue(field, rdf.sym(UI + 'namedNode')) === 'true';
          store.add(subject, property, nn ? rdf.sym(dflt.value) : rdf.literal(dflt.value), doc);
        }
        continue;
      }
      const nn = store.anyValue(field, rdf.sym(UI + 'namedNode')) === 'true';
      const resolved = nn ? resolveChoiceValue(store, field, String(val)) : null;
      if (nn && resolved) {
        store.add(subject, property, rdf.sym(resolved), doc);
      } else {
        store.add(subject, property, rdf.literal(String(val)), doc);
      }
      continue;
    }

    const val = data[localName];
    for (const s of [...store.statementsMatching(subject, property, null, doc)]) store.remove(s);
    if (val != null && String(val).trim()) {
      store.add(subject, property, rdf.literal(String(val)), doc);
    } else {
      const dflt = store.anyValue(field, rdf.sym(UI + 'default'));
      if (dflt) store.add(subject, property, rdf.literal(dflt), doc);
    }
  }
}

// Resolve a short Choice value (e.g. "ui:Link" or "Link") to the full
// URI by matching against the declared ui:option values.
function resolveChoiceValue(store, field, val) {
  const opts = store.each(field, rdf.sym(UI + 'option'));
  for (const opt of opts) {
    if (opt.value === val) return val;
    if (opt.value.endsWith('#' + val) || opt.value.endsWith('/' + val)) return opt.value;
    const local = opt.value.replace(/.*[/#]/, '');
    if (local === val) return opt.value;
  }
  if (val.includes(':') || val.includes('/')) return val;
  return null;
}

// Find the first ui:Form node in a store, optionally matching a fragment.
export function findForm(store, sourceUri) {
  const formType = rdf.sym(UI + 'Form');
  const typeP = rdf.sym(RDF + 'type');
  const docUrl = sourceUri.split('#')[0];
  const fragment = sourceUri.includes('#') ? sourceUri.split('#')[1] : null;
  if (fragment) {
    const candidate = rdf.sym(docUrl + '#' + fragment);
    if (store.holds(candidate, typeP, formType)) return candidate;
  }
  const forms = store.each(null, typeP, formType);
  return forms[0] || null;
}
