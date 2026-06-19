/**
 * @jest-environment jsdom
 *
 * Tests for <sol-settings> — the discovery-driven settings page that walks the
 * document for editable components and builds one accordion panel per widget:
 *   - registration
 *   - discovery via the `edit` extension point (static shape / editor / opt-out)
 *   - rendered accordion (labels, label= override, labelFromTag fallback)
 *   - empty state
 *   - lazy editor mount on panel expand + sol-form-save → host.reload()
 *   - the inPlace placement is skipped; opt-out via data-settings-skip
 *   - forms:"self" path renders an "Edit …" trigger button
 *   - refresh() rebuilds only when the discovered set changed (signature)
 *
 * No network is touched: sol-settings has no fetch. Editable widgets are tiny
 * locally-defined custom elements that declare `static get shape()` / `editor`,
 * so discovery (core/extension-points.js + core/editor.js) resolves a real spec.
 */

window.__SolSuppressDefineWarn = true;

let registerExtensionPoints;

beforeAll(async () => {
  // sol-settings pulls in sol-accordion; both register on import.
  await import('../../web/sol-settings.js');
  // forms:"self" specs only arise from the manifest registry (editorSpecFromDecl),
  // not from a class's static extensionPoints — so register one explicitly.
  ({ registerExtensionPoints } = await import('../../core/extension-points.js'));
});

afterEach(() => { document.body.innerHTML = ''; });

// sol-settings defers _build() one microtask, then sol-accordion runs on
// connect and lazy-wiring waits another microtask — a couple of macrotask
// settles cover all of it deterministically.
function settle() { return new Promise(r => setTimeout(r, 0)); }

let _seq = 0;
/** Define a throwaway editable element class with the given statics, return its
 *  unique tag. Each call gets a fresh tag so customElements never collides. */
function defineEditable(statics = {}) {
  const tag = `x-editable-${_seq++}`;
  const cls = class extends HTMLElement {};
  Object.entries(statics).forEach(([k, get]) => {
    Object.defineProperty(cls, k, { get, configurable: true });
  });
  customElements.define(tag, cls);
  return tag;
}

function mountSettings(inner = '') {
  document.body.innerHTML = `${inner}<sol-settings></sol-settings>`;
  return document.querySelector('sol-settings');
}

function summaries(settings) {
  return [...settings.querySelectorAll('summary')].map(s => s.textContent);
}

// ── registration ─────────────────────────────────────────────────────────────

describe('sol-settings — registration', () => {
  test('registers sol-settings and sol-accordion', () => {
    expect(customElements.get('sol-settings')).toBeTruthy();
    expect(customElements.get('sol-accordion')).toBeTruthy();
  });

  test('exports the class as a named + default export', async () => {
    const mod = await import('../../web/sol-settings.js');
    expect(mod.SolSettings).toBe(customElements.get('sol-settings'));
    expect(mod.default).toBe(mod.SolSettings);
  });
});

// ── empty state ──────────────────────────────────────────────────────────────

describe('sol-settings — empty state', () => {
  test('shows the empty note when no editable widgets exist', async () => {
    const s = mountSettings();
    await settle();
    const note = s.querySelector('.sol-settings-empty');
    expect(note).toBeTruthy();
    expect(note.textContent).toBe('No editable widgets found on this page.');
    expect(s.querySelector('sol-accordion')).toBeNull();
  });
});

// ── discovery + rendered accordion ───────────────────────────────────────────

describe('sol-settings — discovery & accordion', () => {
  test('builds one panel per editable widget (static shape)', async () => {
    const tag = defineEditable({ shape: () => 'https://pod.example/s.shacl' });
    const s = mountSettings(`<${tag} label="Weather"></${tag}>`);
    await settle();

    const accordion = s.querySelector('sol-accordion');
    expect(accordion).toBeTruthy();
    expect(accordion.style.width).toBe('100%');
    expect(s.querySelectorAll('details')).toHaveLength(1);
    expect(summaries(s)).toEqual(['Weather']);
  });

  test('a string static editor also makes a widget editable', async () => {
    const tag = defineEditable({ editor: () => 'https://pod.example/form.ttl' });
    const s = mountSettings(`<${tag} label="Tasks"></${tag}>`);
    await settle();
    expect(summaries(s)).toEqual(['Tasks']);
  });

  test('label falls back to labelFromTag (drops vendor prefix, title-cases)', async () => {
    // tag is x-editable-N → "Editable N" (prefix "x-" dropped, rest title-cased)
    const tag = defineEditable({ shape: () => 'https://pod.example/s.shacl' });
    const s = mountSettings(`<${tag}></${tag}>`);
    await settle();
    const expected = tag
      .replace(/^[a-z0-9]+-/, '')
      .split('-')
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
    expect(summaries(s)).toEqual([expected]);
  });

  test('non-editable elements (no shape/editor) are not collected', async () => {
    const tag = defineEditable({});   // no statics → resolveEditorSpec → null
    const s = mountSettings(`<${tag}></${tag}>`);
    await settle();
    expect(s.querySelector('.sol-settings-empty')).toBeTruthy();
  });

  test('editor:{inline:true} opts out of being collected', async () => {
    const tag = defineEditable({ editor: () => ({ inline: true }) });
    const s = mountSettings(`<${tag}></${tag}>`);
    await settle();
    expect(s.querySelector('.sol-settings-empty')).toBeTruthy();
  });

  test('data-settings-skip removes a widget from discovery', async () => {
    const tag = defineEditable({ shape: () => 'https://pod.example/s.shacl' });
    const s = mountSettings(`<${tag} label="Hidden" data-settings-skip></${tag}>`);
    await settle();
    expect(s.querySelector('.sol-settings-empty')).toBeTruthy();
  });

  test('edit="inPlace" widgets are skipped (only collected ones gathered)', async () => {
    const tag = defineEditable({ shape: () => 'https://pod.example/s.shacl' });
    const s = mountSettings(`<${tag} label="Gear" edit="inPlace"></${tag}>`);
    await settle();
    expect(s.querySelector('.sol-settings-empty')).toBeTruthy();
  });

  test('builds a panel each for several widgets', async () => {
    const a = defineEditable({ shape: () => 'https://pod.example/a.shacl' });
    const b = defineEditable({ shape: () => 'https://pod.example/b.shacl' });
    const s = mountSettings(
      `<${a} label="Alpha"></${a}><${b} label="Beta"></${b}>`,
    );
    await settle();
    expect(s.querySelectorAll('details')).toHaveLength(2);
    expect(summaries(s)).toEqual(['Alpha', 'Beta']);
  });
});

// ── lazy editor mount ────────────────────────────────────────────────────────

describe('sol-settings — lazy editor mount', () => {
  test('mounts a sol-form editor only when its panel is opened', async () => {
    const tag = defineEditable({ shape: () => 'https://pod.example/s.shacl' });
    const s = mountSettings(`<${tag} label="W" source="https://pod.example/w#it"></${tag}>`);
    await settle();

    const det = s.querySelector('details');
    expect(det.querySelector('sol-form')).toBeNull();   // start-closed: nothing yet

    det.open = true;
    det.dispatchEvent(new Event('toggle'));
    await settle();

    const form = det.querySelector('sol-form');
    expect(form).toBeTruthy();
    // subject + save-to come from the host's source= (made absolute)
    const abs = new URL('https://pod.example/w#it', document.baseURI).href;
    expect(form.getAttribute('subject')).toBe(abs);
    expect(form.getAttribute('save-to')).toBe(abs);
    expect(form.getAttribute('shape')).toBe('https://pod.example/s.shacl');
  });

  test('sol-form-save from the editor calls host.reload()', async () => {
    let reloaded = 0;
    const tag = defineEditable({ shape: () => 'https://pod.example/s.shacl' });
    customElements.get(tag).prototype.reload = function () { reloaded++; return Promise.resolve(); };

    const s = mountSettings(`<${tag} label="W" source="https://pod.example/w"></${tag}>`);
    await settle();
    const det = s.querySelector('details');
    det.open = true;
    det.dispatchEvent(new Event('toggle'));
    await settle();

    const form = det.querySelector('sol-form');
    form.dispatchEvent(new CustomEvent('sol-form-save', { bubbles: true }));
    await settle();
    expect(reloaded).toBe(1);
  });
});

// ── forms:"self" path ────────────────────────────────────────────────────────

describe('sol-settings — forms:"self"', () => {
  test('renders an "Edit …" trigger that invokes the component\'s own editor', async () => {
    let opened = 0;
    const tag = defineEditable({});
    customElements.get(tag).prototype.openEditor = function () { opened++; };
    // A manifest descriptor whose forms:"self" → editorSpecFromDecl yields a
    // {self:true,...} spec; present:"collected" so sol-settings gathers it.
    registerExtensionPoints(tag, {
      edit: { forms: 'self', present: 'collected', open: { method: 'openEditor' } },
    });

    const s = mountSettings(`<${tag} label="Self"></${tag}>`);
    await settle();
    const det = s.querySelector('details');
    det.open = true;
    det.dispatchEvent(new Event('toggle'));
    await settle();

    const btn = det.querySelector('.sol-settings-self-open');
    expect(btn).toBeTruthy();
    expect(btn.textContent).toBe('Edit Self…');
    expect(det.querySelector('sol-form')).toBeNull();   // self: no generated form

    btn.click();
    expect(opened).toBe(1);
  });
});

// ── refresh() / signature ────────────────────────────────────────────────────

describe('sol-settings — refresh()', () => {
  test('refresh() rebuilds when a new editable widget appears', async () => {
    const a = defineEditable({ shape: () => 'https://pod.example/a.shacl' });
    const s = mountSettings(`<${a} label="Alpha"></${a}>`);
    await settle();
    expect(s.querySelectorAll('details')).toHaveLength(1);

    const b = defineEditable({ shape: () => 'https://pod.example/b.shacl' });
    const el = document.createElement(b);
    el.setAttribute('label', 'Beta');
    el.setAttribute('source', 'https://pod.example/b');
    document.body.insertBefore(el, s);

    s.refresh();
    await settle();
    expect(s.querySelectorAll('details')).toHaveLength(2);
    expect(summaries(s)).toEqual(['Alpha', 'Beta']);
  });

  test('refresh() is a no-op when the discovered set is unchanged', async () => {
    const a = defineEditable({ shape: () => 'https://pod.example/a.shacl' });
    const s = mountSettings(`<${a} label="Alpha" source="https://pod.example/a"></${a}>`);
    await settle();
    const accordionBefore = s.querySelector('sol-accordion');

    s.refresh();
    await settle();
    // same node instance → no rebuild happened
    expect(s.querySelector('sol-accordion')).toBe(accordionBefore);
  });
});
