/**
 * @jest-environment jsdom
 *
 * Tests for <sol-settings> — the discovery-driven settings page that walks the
 * document for editable components and renders one flat section per widget
 * (<section><h3>label</h3>…editor…</section> — the shape a <sol-settings-nav>
 * chip row picks up):
 *   - registration
 *   - discovery via the `edit` extension point (static shape / editor / opt-out)
 *   - rendered sections (labels, label= override, labelFromTag fallback)
 *   - empty state
 *   - editors mount eagerly with subject/save-to/shape from the host
 *   - sol-form-save → host.reload()
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
  await import('../../web/sol-settings.js');
  // forms:"self" specs only arise from the manifest registry (editorSpecFromDecl),
  // not from a class's static extensionPoints — so register one explicitly.
  ({ registerExtensionPoints } = await import('../../core/extension-points.js'));
});

afterEach(() => { document.body.innerHTML = ''; });

// sol-settings defers _build() one microtask — a macrotask settle covers it.
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

function headings(settings) {
  return [...settings.querySelectorAll('section > h3')].map(h => h.textContent);
}

// ── registration ─────────────────────────────────────────────────────────────

describe('sol-settings — registration', () => {
  test('registers sol-settings', () => {
    expect(customElements.get('sol-settings')).toBeTruthy();
  });

  test('exports the class as a named + default export', async () => {
    const mod = await import('../../web/sol-settings.js');
    expect(mod.SolSettings).toBe(customElements.get('sol-settings'));
    expect(mod.default).toBe(mod.SolSettings);
  });
});

// ── empty state ──────────────────────────────────────────────────────────────

describe('sol-settings — empty state', () => {
  test('renders NOTHING when no editable widgets exist (no stray note)', async () => {
    const s = mountSettings();
    await settle();
    expect(s.childElementCount).toBe(0);
    expect(s.textContent.trim()).toBe('');
  });
});

// ── discovery + rendered sections ────────────────────────────────────────────

describe('sol-settings — discovery & sections', () => {
  test('builds one section per editable widget (static shape)', async () => {
    const tag = defineEditable({ shape: () => 'https://pod.example/s.shacl' });
    const s = mountSettings(`<${tag} label="Weather"></${tag}>`);
    await settle();

    expect(s.querySelectorAll('section')).toHaveLength(1);
    expect(headings(s)).toEqual(['Weather']);
    expect(s.querySelector('sol-accordion')).toBeNull();   // the accordion is gone
  });

  test('a string static editor also makes a widget editable', async () => {
    const tag = defineEditable({ editor: () => 'https://pod.example/form.ttl' });
    const s = mountSettings(`<${tag} label="Tasks"></${tag}>`);
    await settle();
    expect(headings(s)).toEqual(['Tasks']);
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
    expect(headings(s)).toEqual([expected]);
  });

  test('non-editable elements (no shape/editor) are not collected', async () => {
    const tag = defineEditable({});   // no statics → resolveEditorSpec → null
    const s = mountSettings(`<${tag}></${tag}>`);
    await settle();
    expect(s.childElementCount).toBe(0);   // not collected → nothing rendered
  });

  test('editor:{inline:true} opts out of being collected', async () => {
    const tag = defineEditable({ editor: () => ({ inline: true }) });
    const s = mountSettings(`<${tag}></${tag}>`);
    await settle();
    expect(s.childElementCount).toBe(0);   // not collected → nothing rendered
  });

  test('data-settings-skip removes a widget from discovery', async () => {
    const tag = defineEditable({ shape: () => 'https://pod.example/s.shacl' });
    const s = mountSettings(`<${tag} label="Hidden" data-settings-skip></${tag}>`);
    await settle();
    expect(s.childElementCount).toBe(0);   // not collected → nothing rendered
  });

  test('edit="inPlace" widgets are skipped (only collected ones gathered)', async () => {
    const tag = defineEditable({ shape: () => 'https://pod.example/s.shacl' });
    const s = mountSettings(`<${tag} label="Gear" edit="inPlace"></${tag}>`);
    await settle();
    expect(s.childElementCount).toBe(0);   // not collected → nothing rendered
  });

  test('builds a section each for several widgets', async () => {
    const a = defineEditable({ shape: () => 'https://pod.example/a.shacl' });
    const b = defineEditable({ shape: () => 'https://pod.example/b.shacl' });
    const s = mountSettings(
      `<${a} label="Alpha"></${a}><${b} label="Beta"></${b}>`,
    );
    await settle();
    expect(s.querySelectorAll('section')).toHaveLength(2);
    expect(headings(s)).toEqual(['Alpha', 'Beta']);
  });
});

// ── eager editor mount ───────────────────────────────────────────────────────

describe('sol-settings — editor mount', () => {
  test('mounts a sol-form editor eagerly with subject/save-to/shape from the host', async () => {
    const tag = defineEditable({ shape: () => 'https://pod.example/s.shacl' });
    const s = mountSettings(`<${tag} label="W" source="https://pod.example/w#it"></${tag}>`);
    await settle();

    const form = s.querySelector('section .sol-settings-slot sol-form');
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

    const form = s.querySelector('sol-form');
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

    const btn = s.querySelector('section .sol-settings-self-open');
    expect(btn).toBeTruthy();
    expect(btn.textContent).toBe('Edit Self…');
    expect(s.querySelector('sol-form')).toBeNull();   // self: no generated form

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
    expect(s.querySelectorAll('section')).toHaveLength(1);

    const b = defineEditable({ shape: () => 'https://pod.example/b.shacl' });
    const el = document.createElement(b);
    el.setAttribute('label', 'Beta');
    el.setAttribute('source', 'https://pod.example/b');
    document.body.insertBefore(el, s);

    s.refresh();
    await settle();
    expect(s.querySelectorAll('section')).toHaveLength(2);
    expect(headings(s)).toEqual(['Alpha', 'Beta']);
  });

  test('refresh() is a no-op when the discovered set is unchanged', async () => {
    const a = defineEditable({ shape: () => 'https://pod.example/a.shacl' });
    const s = mountSettings(`<${a} label="Alpha" source="https://pod.example/a"></${a}>`);
    await settle();
    const sectionBefore = s.querySelector('section');

    s.refresh();
    await settle();
    // same node instance → no rebuild happened
    expect(s.querySelector('section')).toBe(sectionBefore);
  });
});
