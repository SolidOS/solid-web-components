/**
 * core/menu-consumer.js — the from-rdf loader registry. Wiring must be
 * order-independent in BOTH directions, including the define-before-register
 * hole: customElements.define() upgrades elements (running connectedCallback
 * → _loadFromRdf → deferUntilLoader) BEFORE the component module's own
 * registerMenuConsumer() line executes. With the add-on already installed,
 * the old code neither wired the class nor parked the element — it was
 * stranded with an empty bar. Parallel importers (sol-load's Promise.all)
 * hit that ordering roughly half the time; component-interop's sequencing
 * never did, which is why it stayed latent.
 */
import {
  registerMenuConsumer, deferUntilLoader, installFromRdfLoader,
} from '../../core/menu-consumer.js';

const REG_KEY = Symbol.for('sol-components.menu-consumers');

// The registry global survives across tests — reset it each time.
beforeEach(() => {
  const reg = globalThis[REG_KEY];
  reg.consumers.clear();
  reg.pending.clear();
  reg.loader = null;
});

const microtasks = () => new Promise((r) => setTimeout(r, 0));

function fakeElement() {
  class Klass { }
  const el = { reloads: 0, constructor: Klass };
  el.reload = () => { el.reloads += 1; };
  return el;
}

test('register-then-install wires the class and replays parked elements', async () => {
  const el = fakeElement();
  registerMenuConsumer(el.constructor);
  expect(deferUntilLoader(el)).toBe(true);          // no loader yet → parked

  const loader = () => {};
  installFromRdfLoader(loader);
  expect(el.constructor.fromRdfLoader).toBe(loader);
  await microtasks();
  expect(el.reloads).toBe(1);                       // replayed from pending
});

test('install-then-register wires the class at registration', () => {
  const loader = () => {};
  installFromRdfLoader(loader);
  class Klass { }
  registerMenuConsumer(Klass);
  expect(Klass.fromRdfLoader).toBe(loader);
});

test('define-before-register: element upgraded before registration is wired and re-driven', async () => {
  const loader = () => {};
  installFromRdfLoader(loader);                     // add-on won the race

  // The element upgrades and calls deferUntilLoader BEFORE its module's
  // registerMenuConsumer() line has run — the class static is unset.
  const el = fakeElement();
  expect(el.constructor.fromRdfLoader).toBeUndefined();
  expect(deferUntilLoader(el)).toBe(false);

  expect(el.constructor.fromRdfLoader).toBe(loader); // wired on the spot
  await microtasks();
  expect(el.reloads).toBe(1);                        // re-driven async
});

test('a re-driven element whose class is wired does not loop', async () => {
  const loader = () => {};
  installFromRdfLoader(loader);
  const el = fakeElement();
  deferUntilLoader(el);
  await microtasks();
  await microtasks();
  expect(el.reloads).toBe(1);
});
