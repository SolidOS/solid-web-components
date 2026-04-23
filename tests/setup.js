// Tests inject the mock rdflib via moduleNameMapper (^rdflib$ → mock).
// Provide minimal browser globals for any code that probes them.
if (typeof window === 'undefined') {
  global.window = {};
}
if (typeof document === 'undefined') {
  global.document = {
    addEventListener() {},
    createElement(tag) {
      return { tagName: tag, textContent: '', appendChild() {} };
    },
    querySelector() { return null; },
    head: { appendChild() {} },
  };
}
if (typeof HTMLElement === 'undefined') {
  global.HTMLElement = class HTMLElement {};
}
if (typeof customElements === 'undefined') {
  global.customElements = {
    _reg: new Map(),
    define(name, cls) { this._reg.set(name, cls); },
    get(name) { return this._reg.get(name); },
  };
}
if (typeof localStorage === 'undefined') {
  const _store = {};
  global.localStorage = {
    getItem(k) { return _store[k] ?? null; },
    setItem(k, v) { _store[k] = String(v); },
    removeItem(k) { delete _store[k]; },
  };
}
