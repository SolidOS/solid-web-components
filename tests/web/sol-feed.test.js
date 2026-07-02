/**
 * @jest-environment jsdom
 *
 * Tests for <sol-feed> — the RSS / Atom feed viewer web component. Covers the
 * parts that are deterministic without a real browser: registration, the
 * `editor` opt-out, status region, the inline-reader decision, topic grouping,
 * the article list / news cards, the simple `view="feed"` render, the pop-out
 * reader, and the threePanel selection persistence (loadSelection).
 *
 * Network-bound RDF source lists (topic / topics / threePanel views) lazily
 * import rdflib and are exercised at the integration level, not here.
 */

window.__SolSuppressDefineWarn = true;

let SolFeed;

beforeAll(async () => {
  ({ SolFeed } = await import('../../web/sol-feed.js'));
});

/** Mock global.fetch to return one feed body for view="feed" renders. */
function mockFeedFetch(body) {
  global.fetch = () => Promise.resolve({
    ok: true, status: 200, text: () => Promise.resolve(body),
  });
}

function settle() { return new Promise(r => setTimeout(r, 20)); }

afterEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
  delete global.fetch;
});

const RSS = `<?xml version="1.0"?>
<rss version="2.0"><channel><title>Demo</title>
  <item><title>One</title><link>https://example.org/1</link>
    <pubDate>Tue, 10 Jun 2025 09:00:00 GMT</pubDate></item>
  <item><title>Two</title><link>https://example.org/2</link></item>
</channel></rss>`;

// ── registration & static editor ─────────────────────────────────────────────

describe('registration', () => {
  test('the element is defined', () => {
    expect(customElements.get('sol-feed')).toBe(SolFeed);
  });

  test('declares itself an inline editor (skipped by discovery surfaces)', () => {
    expect(SolFeed.editor).toEqual({ inline: true });
  });
});

// ── status region ────────────────────────────────────────────────────────────

describe('setStatus', () => {
  test('shows / hides the polite live region and flags errors', () => {
    const el = document.createElement('sol-feed');
    document.body.appendChild(el);
    el.setStatus('Loading…');
    const status = el.shadowRoot.querySelector('.sol-feed-status');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toBe('Loading…');
    expect(status.style.display).toBe('');
    expect(status.hasAttribute('data-error')).toBe(false);

    el.setStatus('Boom', true);
    expect(status.hasAttribute('data-error')).toBe(true);

    el.setStatus('');
    expect(status.style.display).toBe('none');
    expect(status.hasAttribute('data-error')).toBe(false);
  });
});

// ── inline-reader decision ───────────────────────────────────────────────────

describe('_readerInline', () => {
  test('reader="inline" forces on, reader="window" forces off', () => {
    const el = document.createElement('sol-feed');
    el.setAttribute('reader', 'inline');
    expect(el._readerInline()).toBe(true);
    el.setAttribute('reader', 'window');
    expect(el._readerInline()).toBe(false);
  });

  test('defaults off outside Electron (jsdom user agent)', () => {
    const el = document.createElement('sol-feed');
    expect(el._readerInline()).toBe(false);
  });
});

// ── groupByTopic ─────────────────────────────────────────────────────────────

describe('groupByTopic', () => {
  test('groups feeds by topic, preserving first-seen topic order', () => {
    const el = document.createElement('sol-feed');
    const groups = el.groupByTopic([
      { url: 'a', topic: 'News' },
      { url: 'b', topic: 'Sport' },
      { url: 'c', topic: 'News' },
    ]);
    expect(groups.map(g => g.topic)).toEqual(['News', 'Sport']);
    expect(groups[0].feeds.map(f => f.url)).toEqual(['a', 'c']);
  });

  test('untopiced feeds collapse into a single untitled group', () => {
    const el = document.createElement('sol-feed');
    const groups = el.groupByTopic([{ url: 'a' }, { url: 'b' }]);
    expect(groups).toHaveLength(1);
    expect(groups[0].topic).toBe('');
    expect(groups[0].feeds).toHaveLength(2);
  });
});

// ── itemsList ────────────────────────────────────────────────────────────────

describe('itemsList', () => {
  test('renders a placeholder when there are no items', () => {
    const el = document.createElement('sol-feed');
    const ul = el.itemsList([]);
    expect(ul.querySelector('.sol-feed-empty').textContent).toBe('No articles');
  });

  test('renders one anchor per item with href, title and meta', () => {
    const el = document.createElement('sol-feed');
    const ul = el.itemsList([
      { title: 'One', link: 'https://example.org/1', source: 'Demo', pubDate: '' },
      { title: '', link: '', source: '', pubDate: '' },
    ]);
    const links = ul.querySelectorAll('a.feed-link');
    expect(links).toHaveLength(2);
    expect(links[0].href).toBe('https://example.org/1');
    expect(links[0].textContent).toContain('One');
    expect(links[0].querySelector('.feed-link-meta').textContent).toBe('Demo');
    // missing title falls back to "(untitled)" and missing link to "#"
    expect(links[1].textContent).toContain('(untitled)');
    expect(links[1].getAttribute('href')).toBe('#');
  });
});

// ── newsCard ─────────────────────────────────────────────────────────────────

describe('newsCard', () => {
  test('builds an image card with an accessible label', () => {
    const el = document.createElement('sol-feed');
    const card = el.newsCard({ title: 'Headline', link: 'https://example.org/x', image: 'https://img.example/p.jpg' });
    expect(card.tagName).toBe('A');
    expect(card.getAttribute('aria-label')).toBe('Headline');
    expect(card.querySelector('img.feed-card-img').src).toBe('https://img.example/p.jpg');
    expect(card.querySelector('.feed-card-title').textContent).toBe('Headline');
    expect(card.classList.contains('no-image')).toBe(false);
  });

  test('marks cards with no image', () => {
    const el = document.createElement('sol-feed');
    const card = el.newsCard({ title: 'No pic', link: '#' });
    expect(card.querySelector('img')).toBeNull();
    expect(card.classList.contains('no-image')).toBe(true);
  });
});

// ── view="feed" render ───────────────────────────────────────────────────────

describe('view="feed"', () => {
  test('reports an error when no source is given', async () => {
    mockFeedFetch(RSS);
    const el = document.createElement('sol-feed');
    el.setAttribute('view', 'feed');
    document.body.appendChild(el);
    await settle();
    const status = el.shadowRoot.querySelector('.sol-feed-status');
    expect(status.hasAttribute('data-error')).toBe(true);
    expect(status.textContent).toMatch(/No feed source/i);
  });

  test('fetches the feed and renders its items as a link list', async () => {
    mockFeedFetch(RSS);
    const el = document.createElement('sol-feed');
    el.setAttribute('view', 'feed');
    el.setAttribute('source', 'https://example.org/rss.xml');
    document.body.appendChild(el);
    await settle();
    const links = el.shadowRoot.querySelectorAll('.sol-feed-list.feed a.feed-link');
    expect(links).toHaveLength(2);
    expect(links[0].textContent).toContain('One');
  });
});

// ── pop-out reader ───────────────────────────────────────────────────────────

describe('openArticle (pop-out reader)', () => {
  test('opens the URL in a reader window and suppresses the click', () => {
    const calls = [];
    const fakeWin = { closed: false, focus() {}, location: {} };
    const orig = window.open;
    window.open = (...args) => { calls.push(args); return fakeWin; };
    try {
      const el = document.createElement('sol-feed');   // no inline pane → pop-out path
      expect(el.openArticle('https://example.org/a')).toBe(true);
      expect(calls).toHaveLength(1);
      expect(calls[0][0]).toBe('https://example.org/a');
      expect(calls[0][1]).toBe('sol-feed-reader');
      expect(typeof calls[0][2]).toBe('string');        // window features
    } finally {
      window.open = orig;
    }
  });

  test('returns false (lets the link through) for an empty URL', () => {
    const el = document.createElement('sol-feed');
    expect(el.openArticle('#')).toBe(false);
    expect(el.openArticle('')).toBe(false);
  });

  test('refuses to open a non-http(s) (e.g. javascript:) feed link', () => {
    const el = document.createElement('sol-feed');
    expect(el.openArticle('javascript:alert(1)')).toBe(false);
    expect(el.openArticle('data:text/html,<script>1</script>')).toBe(false);
    expect(el.openArticle('file:///etc/passwd')).toBe(false);
  });
});

// ── threePanel selection persistence ─────────────────────────────────────────

describe('loadSelection', () => {
  test('reads the cached URL list from localStorage', () => {
    const el = document.createElement('sol-feed');
    el.setAttribute('source', 'feeds.ttl#Feeds');
    localStorage.setItem(el.selectionKey, JSON.stringify(['https://a', 'https://b']));
    expect(el.loadSelection()).toEqual(['https://a', 'https://b']);
  });

  test('falls back to position-ordered feeds when nothing is cached', () => {
    const el = document.createElement('sol-feed');
    el.setAttribute('source', 'feeds.ttl#Feeds');
    const sources = [
      { url: 'https://b', position: 1 },
      { url: 'https://a', position: 0 },
      { url: 'https://c' },                  // no position → excluded
    ];
    expect(el.loadSelection(sources)).toEqual(['https://a', 'https://b']);
  });

  test('returns an empty list when neither cache nor positions exist', () => {
    const el = document.createElement('sol-feed');
    el.setAttribute('source', 'feeds.ttl#Feeds');
    expect(el.loadSelection([{ url: 'https://a' }])).toEqual([]);
  });
});
