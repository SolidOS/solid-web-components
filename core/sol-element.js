// SolElement — an OPTIONAL base for sol-* components.
//
// It does NOT force a shadow root: roughly half the components render to light
// DOM (sol-tabs, sol-accordion, sol-wac, …), so shadow stays each component's own
// choice. What it provides is the one pattern the library repeats ~20 times and
// occasionally forgets: teardown. Listeners and callbacks registered while the
// element is connected are removed automatically on disconnect, so components stop
// hand-rolling `disconnectedCallback` teardown (and stop leaking when it's missed).
//
//   class Foo extends SolElement {
//     connectedCallback() {
//       this._on(document, 'keydown', (e) => …);   // auto-removed on disconnect
//       const id = setInterval(tick, 1000);
//       this._cleanup(() => clearInterval(id));     // auto-run on disconnect
//     }
//   }
//
// A subclass with its OWN disconnectedCallback must call super.disconnectedCallback().
export class SolElement extends HTMLElement {
  // Add an event listener that is auto-removed on disconnect. Returns the handler.
  _on(target, type, handler, opts) {
    target.addEventListener(type, handler, opts);
    if (!this.__cleanups) this.__cleanups = [];
    this.__cleanups.push(() => target.removeEventListener(type, handler, opts));
    return handler;
  }

  // Register an arbitrary teardown callback, run (once) on disconnect.
  _cleanup(fn) {
    if (typeof fn !== 'function') return fn;
    if (!this.__cleanups) this.__cleanups = [];
    this.__cleanups.push(fn);
    return fn;
  }

  disconnectedCallback() {
    const cleanups = this.__cleanups;
    this.__cleanups = null;
    if (cleanups) for (const fn of cleanups) { try { fn(); } catch { /* ignore teardown errors */ } }
  }
}
