/**
 * @jest-environment jsdom
 *
 * Tests for <sol-form> — the RDF-driven form renderer.
 *
 * sol-form's heavy paths (form-driven render via solid-ui, shape-driven
 * record forms, the rolodex) all delegate to solid-ui's `fieldFunction`
 * and a fully-featured rdflib store/fetcher/updater — none of which the
 * Jest mock rdflib provides. So these tests stay on the deterministic,
 * DOM-observable seams that DON'T need solid-ui or a live store:
 *
 *   - registration + exports
 *   - observedAttributes + attributeChangedCallback guard
 *   - the shell shadow DOM (save bar, location prompt, save button)
 *   - the save-bar visibility logic (_syncSaveBar via its callers)
 *   - the Set-location flow (URL validation, docUrl re-anchoring)
 *   - validation-summary rendering (_showValidation / _hideValidation)
 *   - status text (_setStatus / _clearStatus) and HTML escaping (_esc)
 *   - getTurtle's empty-store guard
 *   - _load's no-op when neither source nor shape is present, plus its
 *     error path, and _loadShape against an injected global fetch
 *
 * The `jest` global is intentionally not used (per the harness rules for
 * native-ESM tests): fetch is stubbed by hand and restored in afterEach.
 */

window.__SolSuppressDefineWarn = true;

import { SolForm, buildAddInserts } from '../../web/sol-form.js';

// ── manual fetch stub ────────────────────────────────────────────────────────

const _origFetch = global.fetch;

/** Replace global.fetch with a recorder returning a configurable response. */
function stubFetch({ ok = true, status = 200, body = '', contentType = 'text/turtle' } = {}) {
  const calls = [];
  global.fetch = (url, init) => {
    calls.push({ url: String(url), init });
    return Promise.resolve({
      ok, status,
      headers: new Map([['content-type', contentType]]),
      text: () => Promise.resolve(body),
    });
  };
  global.fetch.calls = calls;
  return global.fetch;
}

function settle() { return new Promise(r => setTimeout(r, 20)); }

afterEach(() => {
  global.fetch = _origFetch;
  document.body.innerHTML = '';
});

// A form mounted but with no source/shape: the shell is built and _load
// returns early, so the DOM is in a known, stable state.
function mountBare(extra = '') {
  document.body.innerHTML = `<sol-form id="f" ${extra}></sol-form>`;
  return document.getElementById('f');
}

function bar(el)  { return el.shadowRoot.querySelector('.sol-form-save-bar'); }
function visible(el) { return !!el && el.style.display !== 'none'; }

// ── registration + exports ───────────────────────────────────────────────────

describe('SolForm — registration', () => {
  test('registers the <sol-form> custom element', () => {
    expect(customElements.get('sol-form')).toBe(SolForm);
  });

  test('is an HTMLElement subclass', () => {
    expect(SolForm.prototype instanceof HTMLElement).toBe(true);
  });
});

// ── observedAttributes ───────────────────────────────────────────────────────

describe('SolForm — observedAttributes', () => {
  test('observes source, subject, shape, save-to and view', () => {
    expect(SolForm.observedAttributes).toEqual(['source', 'subject', 'shape', 'save-to', 'view']);
  });
});

// ── shell shadow DOM ─────────────────────────────────────────────────────────

describe('SolForm — shell', () => {
  let el;
  beforeEach(() => { el = mountBare(); });

  test('attaches an open shadow root', () => {
    expect(el.shadowRoot).toBeTruthy();
    expect(el.shadowRoot.mode).toBe('open');
  });

  test('renders the body, save bar, location prompt and save button', () => {
    const root = el.shadowRoot;
    expect(root.querySelector('.sol-form-body')).toBeTruthy();
    expect(root.querySelector('.sol-form-save-bar')).toBeTruthy();
    expect(root.querySelector('.sol-form-pod-url')).toBeTruthy();
    expect(root.querySelector('.sol-form-pod-input')).toBeTruthy();
    expect(root.querySelector('.sol-form-save-btn')).toBeTruthy();
    expect(root.querySelector('.sol-form-validation-summary')).toBeTruthy();
  });

  test('the save bar, location prompt and save button start hidden', () => {
    const root = el.shadowRoot;
    expect(bar(el).style.display).toBe('none');
    expect(root.querySelector('.sol-form-pod-url').style.display).toBe('none');
    expect(root.querySelector('.sol-form-save-btn').style.display).toBe('none');
  });
});

// ── public getters / getTurtle ───────────────────────────────────────────────

describe('SolForm — public API', () => {
  test('store and subject getters start null', () => {
    const el = mountBare();
    expect(el.store).toBe(null);
    expect(el.subject).toBe(null);
  });

  test('getTurtle returns empty string with no store/docNode', () => {
    const el = mountBare();
    expect(el.getTurtle()).toBe('');
  });

  test('reload is a function (delegates to _load)', () => {
    const el = mountBare();
    expect(typeof el.reload).toBe('function');
  });
});

// ── attributeChangedCallback guard ───────────────────────────────────────────

describe('SolForm — attributeChangedCallback', () => {
  test('no-ops (no _load) when old === new value', () => {
    const el = mountBare();
    let loaded = 0;
    el._load = () => { loaded++; };
    el.attributeChangedCallback('source', 'same', 'same');
    expect(loaded).toBe(0);
  });

  test('reloads when source changes after first render', () => {
    const el = mountBare();
    expect(el._rendered).toBe(true);
    let loaded = 0;
    el._load = () => { loaded++; };
    el.attributeChangedCallback('source', 'a.ttl', 'b.ttl');
    expect(loaded).toBe(1);
  });

  test('reloads when view changes after first render', () => {
    const el = mountBare();
    let loaded = 0;
    el._load = () => { loaded++; };
    el.attributeChangedCallback('view', null, 'rolodex');
    expect(loaded).toBe(1);
  });

  test('does NOT reload when subject changes (not source/view)', () => {
    const el = mountBare();
    let loaded = 0;
    el._load = () => { loaded++; };
    el.attributeChangedCallback('subject', null, '#x');
    expect(loaded).toBe(0);
  });
});

// ── _esc (HTML escaping) ─────────────────────────────────────────────────────

describe('SolForm — _esc', () => {
  let el;
  beforeEach(() => { el = mountBare(); });

  test('escapes angle brackets and ampersands', () => {
    expect(el._esc('<b>&"x"')).toBe('&lt;b&gt;&amp;"x"');
  });

  test('leaves a plain string unchanged', () => {
    expect(el._esc('hello world')).toBe('hello world');
  });
});

// ── status text + save-bar visibility ────────────────────────────────────────

describe('SolForm — _setStatus / _clearStatus', () => {
  let el;
  beforeEach(() => { el = mountBare(); });

  test('_setStatus writes the message and class, and shows the bar', () => {
    el._setStatus('ok', 'Saved');
    const status = el.shadowRoot.querySelector('.sol-form-save-status');
    expect(status.textContent).toBe('Saved');
    expect(status.className).toContain('ok');
    // a non-empty status makes the otherwise-empty bar visible
    expect(visible(bar(el))).toBe(true);
  });

  test('_clearStatus empties the message and re-hides the empty bar', () => {
    el._setStatus('err', 'boom');
    expect(visible(bar(el))).toBe(true);
    el._clearStatus();
    const status = el.shadowRoot.querySelector('.sol-form-save-status');
    expect(status.textContent).toBe('');
    expect(visible(bar(el))).toBe(false);
  });
});

// ── _showSaveButton / save-bar sync ──────────────────────────────────────────

describe('SolForm — _showSaveButton', () => {
  let el;
  beforeEach(() => { el = mountBare(); });

  test('showing the save button reveals it and the bar', () => {
    el._showSaveButton(true);
    expect(el.shadowRoot.querySelector('.sol-form-save-btn').style.display).toBe('');
    expect(visible(bar(el))).toBe(true);
  });

  test('hiding the save button (nothing else visible) hides the bar', () => {
    el._showSaveButton(true);
    el._showSaveButton(false);
    expect(el.shadowRoot.querySelector('.sol-form-save-btn').style.display).toBe('none');
    expect(visible(bar(el))).toBe(false);
  });

  test('_barSuppressed forces the bar hidden even with a visible piece', () => {
    el._showSaveButton(true);
    expect(visible(bar(el))).toBe(true);
    el._barSuppressed = true;
    el._syncSaveBar();
    expect(visible(bar(el))).toBe(false);
  });
});

// ── _showLocationInput ───────────────────────────────────────────────────────

describe('SolForm — _showLocationInput', () => {
  test('showing the prompt reveals the location block and the bar', () => {
    const el = mountBare();
    el._showLocationInput(true);
    expect(el.shadowRoot.querySelector('.sol-form-pod-url').style.display).toBe('flex');
    expect(visible(bar(el))).toBe(true);
  });

  test('prefills the input from the save-to attribute', () => {
    const el = mountBare('save-to="https://you.pod/data.ttl"');
    el._showLocationInput(true);
    const input = el.shadowRoot.querySelector('.sol-form-pod-input');
    expect(input.value).toBe('https://you.pod/data.ttl');
  });

  test('hiding the prompt collapses the location block', () => {
    const el = mountBare();
    el._showLocationInput(true);
    el._showLocationInput(false);
    expect(el.shadowRoot.querySelector('.sol-form-pod-url').style.display).toBe('none');
  });
});

// ── _onSetLocation (URL validation + docUrl re-anchoring) ────────────────────

describe('SolForm — _onSetLocation', () => {
  let el;
  beforeEach(() => {
    el = mountBare();
    // _onSetLocation may call _save(); stub it so we only test the
    // location-setting half deterministically.
    el._save = () => Promise.resolve();
  });

  test('rejects an empty URL with an error status', async () => {
    el.shadowRoot.querySelector('.sol-form-pod-input').value = '   ';
    await el._onSetLocation();
    const status = el.shadowRoot.querySelector('.sol-form-save-status');
    expect(status.textContent).toBe('Enter a URL');
    expect(status.className).toContain('err');
    expect(el._docUrl).toBeFalsy();
  });

  test('rejects an invalid URL with an error status', async () => {
    el.shadowRoot.querySelector('.sol-form-pod-input').value = 'not a url';
    await el._onSetLocation();
    const status = el.shadowRoot.querySelector('.sol-form-save-status');
    expect(status.textContent).toBe('Invalid URL');
    expect(el._docUrl).toBeFalsy();
  });

  test('accepts a valid URL, re-anchors docUrl/docNode and hides the prompt', async () => {
    el.shadowRoot.querySelector('.sol-form-pod-url').style.display = 'flex';
    el.shadowRoot.querySelector('.sol-form-pod-input').value = 'https://you.pod/notes.ttl';
    await el._onSetLocation();
    expect(el._docUrl).toBe('https://you.pod/notes.ttl');
    expect(el._docNode.value).toBe('https://you.pod/notes.ttl');
    expect(el.shadowRoot.querySelector('.sol-form-pod-url').style.display).toBe('none');
  });
});

// ── validation summary ───────────────────────────────────────────────────────

describe('SolForm — _showValidation / _hideValidation', () => {
  let el;
  beforeEach(() => { el = mountBare(); });

  test('a conforming report keeps the summary hidden', () => {
    el._showValidation({ conforms: true, results: [] });
    const sum = el.shadowRoot.querySelector('.sol-form-validation-summary');
    expect(sum.style.display).toBe('none');
  });

  test('a non-conforming report lists each error and shows the bar', () => {
    el._showValidation({
      conforms: false,
      results: [
        { path: { value: 'http://example.org/title' }, message: { value: 'is required' } },
        { message: { value: 'bad value' } },
      ],
    });
    const sum = el.shadowRoot.querySelector('.sol-form-validation-summary');
    expect(sum.style.display).toBe('block');
    expect(sum.textContent).toContain('title: is required');
    expect(sum.textContent).toContain('bad value');
    expect(visible(bar(el))).toBe(true);
  });

  test('message arrays use the first entry', () => {
    el._showValidation({
      conforms: false,
      results: [{ path: { value: 'http://ex/age' }, message: [{ value: 'too low' }] }],
    });
    const sum = el.shadowRoot.querySelector('.sol-form-validation-summary');
    expect(sum.textContent).toContain('age: too low');
  });

  test('a missing message falls back to a generic label', () => {
    el._showValidation({ conforms: false, results: [{ path: { value: 'http://ex/x' } }] });
    const sum = el.shadowRoot.querySelector('.sol-form-validation-summary');
    expect(sum.textContent).toContain('x: Validation error');
  });

  test('_hideValidation collapses the summary', () => {
    el._showValidation({ conforms: false, results: [{ message: { value: 'oops' } }] });
    expect(el.shadowRoot.querySelector('.sol-form-validation-summary').style.display).toBe('block');
    el._hideValidation();
    expect(el.shadowRoot.querySelector('.sol-form-validation-summary').style.display).toBe('none');
  });
});

// ── _load: no source / no shape ──────────────────────────────────────────────

describe('SolForm — _load with no source and no shape', () => {
  test('returns early without touching the body or erroring', async () => {
    const el = mountBare();        // no source, no shape
    await el._load();
    // The guard returns before the body's loading marker is set, so the
    // body is left untouched (empty) — and never shows an error panel.
    const body = el.shadowRoot.querySelector('.sol-form-body');
    expect(body.querySelector('.sol-form-error')).toBeNull();
    expect(body.textContent).toBe('');
  });
});

// ── _load error path (source fetch fails) ────────────────────────────────────

describe('SolForm — _load error path', () => {
  test('renders an error panel when the form source fails to load', async () => {
    stubFetch({ ok: false, status: 404 });
    const el = mountBare('source="https://pod.example/missing-form.ttl"');
    await el._load();
    await settle();
    const err = el.shadowRoot.querySelector('.sol-form-body .sol-form-error');
    expect(err).toBeTruthy();
  });
});

// ── _loadShape (injected fetch) ──────────────────────────────────────────────

describe('SolForm — _loadShape', () => {
  test('stores the fetched shape text on success', async () => {
    const TTL = '@prefix sh: <http://www.w3.org/ns/shacl#> .\n<#S> a sh:NodeShape .';
    stubFetch({ ok: true, status: 200, body: TTL });
    const el = mountBare();
    await el._loadShape('https://pod.example/shape.ttl');
    expect(el._shapeText).toBe(TTL);
    expect(global.fetch.calls[0].url).toContain('shape.ttl');
  });

  test('leaves shape text null on a non-ok response', async () => {
    stubFetch({ ok: false, status: 403 });
    const el = mountBare();
    await el._loadShape('https://pod.example/forbidden.ttl');
    expect(el._shapeText).toBe(null);
  });
});

// ── _validate without a shape ────────────────────────────────────────────────

describe('SolForm — _validate', () => {
  test('conforms trivially when no shape text is loaded', async () => {
    const el = mountBare();
    el._shapeText = null;
    const report = await el._validate();
    expect(report.conforms).toBe(true);
    expect(report.results).toEqual([]);
  });
});

// ── buildAddInserts (rolodex "Add new record") ───────────────────────────────
//
// Pure helper: computes the insert statements for a new rolodex record. The
// container mode (shape+subject ItemList forms — pod locations, search
// engines) must emit the membership triple + sh:class type; ordered rolodexes
// (ui:sortedBy) must assign position = max(existing)+1 so the new record is
// immediately reorderable.

describe('SolForm — buildAddInserts', () => {
  const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
  const doc       = { value: 'https://x/doc.ttl',            termType: 'NamedNode' };
  const subj      = { value: 'https://x/doc.ttl#n1',         termType: 'NamedNode' };
  const pred      = { value: 'http://schema.org/itemListElement', termType: 'NamedNode' };
  const list      = { value: 'https://x/doc.ttl#Locations',  termType: 'NamedNode' };
  const itemClass = { value: 'http://schema.org/ListItem',   termType: 'NamedNode' };
  const sortedBy  = { value: 'http://schema.org/position',   termType: 'NamedNode' };

  // dataStore stub: anyValue(subject, pred) → the canned position string.
  const storeWith = (positions) => ({
    anyValue: (s) => positions[s.value],
    any: () => null,
  });
  const subjectsOf = (positions) => Object.keys(positions).map((v) => ({ value: v }));

  test('container mode: membership + type + next position', () => {
    const positions = { '#a': '1', '#b': '7', '#c': 'not-a-number' };
    const out = buildAddInserts({
      subj, docNode: doc,
      container: { subject: list, pred, itemClass, reverse: false },
      sortedBy, dataStore: storeWith(positions), subjects: subjectsOf(positions),
    });
    expect(out).toHaveLength(3);
    expect(out[0].subject.value).toBe(list.value);        // <#Locations> itemListElement <#n1>
    expect(out[0].predicate.value).toBe(pred.value);
    expect(out[0].object.value).toBe(subj.value);
    expect(out[1].subject.value).toBe(subj.value);        // <#n1> a schema:ListItem
    expect(out[1].predicate.value).toBe(RDF_TYPE);
    expect(out[1].object.value).toBe(itemClass.value);
    expect(out[2].predicate.value).toBe(sortedBy.value);  // position = max(1,7)+1
    expect(out[2].object.value).toBe('8');
    out.forEach((st) => expect(st.graph.value).toBe(doc.value));
  });

  test('reverse container flips the membership triple', () => {
    const out = buildAddInserts({
      subj, docNode: doc,
      container: { subject: list, pred, itemClass: null, reverse: true },
      dataStore: storeWith({}), subjects: [],
    });
    expect(out).toHaveLength(1);
    expect(out[0].subject.value).toBe(subj.value);        // <#n1> pred <#Locations>
    expect(out[0].object.value).toBe(list.value);
  });

  test('no sortedBy → no position statement', () => {
    const out = buildAddInserts({
      subj, docNode: doc,
      container: { subject: list, pred, itemClass, reverse: false },
      dataStore: storeWith({}), subjects: [],
    });
    expect(out.map((s) => s.predicate.value)).not.toContain(sortedBy.value);
  });

  test('non-container mode keeps the target-class behavior, plus position', () => {
    const klass = { value: 'https://x/vocab#Thing', termType: 'NamedNode' };
    const out = buildAddInserts({
      subj, docNode: doc, targets: { classes: [klass] },
      sortedBy, dataStore: storeWith({ '#a': '2' }), subjects: subjectsOf({ '#a': '2' }),
    });
    expect(out[0].predicate.value).toBe(RDF_TYPE);
    expect(out[0].object.value).toBe(klass.value);
    expect(out[1].predicate.value).toBe(sortedBy.value);
    expect(out[1].object.value).toBe('3');
  });

  test('nothing derivable → empty (caller bails), even when sorted', () => {
    const out = buildAddInserts({
      subj, docNode: doc, targets: {},
      sortedBy, dataStore: storeWith({}), subjects: [],
    });
    expect(out).toEqual([]);
  });
});
