/**
 * @jest-environment jsdom
 *
 * Tests for web/utils/feed-fetch.js — the proxy URL builder and the RSS /
 * Atom feed parser (getFeedItems). jsdom supplies DOMParser; fetch is mocked.
 * The RDF source-list readers (parseSourceList / parseEngineList) lazily
 * import rdflib and are covered at the integration level, not here.
 */

import { applyProxy, getFeedItems } from '../../web/utils/feed-fetch.js';

// ── applyProxy ───────────────────────────────────────────────────────────────

describe('applyProxy', () => {
  const url = 'https://example.org/a b.xml?q=1';

  test('returns the URL unchanged when no proxy', () => {
    expect(applyProxy(url, '')).toBe(url);
    expect(applyProxy(url, undefined)).toBe(url);
  });

  test('substitutes a {url} placeholder with the encoded URL', () => {
    expect(applyProxy(url, 'https://proxy/?u={url}'))
      .toBe(`https://proxy/?u=${encodeURIComponent(url)}`);
  });

  test('appends the encoded URL when no placeholder', () => {
    expect(applyProxy(url, 'https://proxy/'))
      .toBe('https://proxy/' + encodeURI(url));
  });
});

// ── getFeedItems ─────────────────────────────────────────────────────────────

/** Mock global.fetch to return one body; records the URLs requested. */
function mockFetch(body, { ok = true, status = 200 } = {}) {
  const urls = [];
  global.fetch = (url) => {
    urls.push(url);
    return Promise.resolve({ ok, status, text: () => Promise.resolve(body) });
  };
  return urls;
}

const RSS = `<?xml version="1.0"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Example Feed</title>
    <item>
      <title>First &amp; Best</title>
      <link>http://example.org/1</link>
      <description><![CDATA[<p>Hello <b>world</b></p><img src="http://img.example/a.jpg">]]></description>
      <pubDate>Tue, 10 Jun 2025 09:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Second</title>
      <link>https://example.org/2</link>
      <media:thumbnail url="http://img.example/thumb.png" />
    </item>
  </channel>
</rss>`;

const ATOM = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom Example</title>
  <entry>
    <title>Atom One</title>
    <id>https://atom.example/post-1</id>
    <updated>2025-06-01T12:00:00Z</updated>
    <summary>Just a summary</summary>
  </entry>
</feed>`;

describe('getFeedItems — RSS', () => {
  test('parses items with title, link, summary, image and pubDate', async () => {
    mockFetch(RSS);
    const items = await getFeedItems('https://example.org/rss.xml');
    expect(items).toHaveLength(2);

    const [a, b] = items;
    expect(a.title).toBe('First & Best');           // entities decoded
    expect(a.link).toBe('https://example.org/1');   // http upgraded to https
    expect(a.summary).toBe('Hello world');          // HTML collapsed to text
    expect(a.image).toBe('http://img.example/a.jpg'); // pulled from description
    expect(a.pubDate).toBe('Tue, 10 Jun 2025 09:00:00 GMT');
    expect(a.source).toBe('Example Feed');           // channel title

    expect(b.title).toBe('Second');
    expect(b.image).toBe('http://img.example/thumb.png'); // media:thumbnail wins
  });

  test('routes a cross-origin fetch through the proxy', async () => {
    const urls = mockFetch(RSS);
    await getFeedItems('https://example.org/rss.xml', { proxy: 'https://proxy/?u={url}' });
    expect(urls[0]).toContain('https://proxy/?u=');
    expect(urls[0]).toContain(encodeURIComponent('https://example.org/rss.xml'));
  });
});

describe('getFeedItems — Atom', () => {
  test('falls back to <entry>, using <id> as the link', async () => {
    mockFetch(ATOM);
    const items = await getFeedItems('https://atom.example/feed');
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('Atom One');
    expect(items[0].link).toBe('https://atom.example/post-1'); // <id> used as link
    expect(items[0].summary).toBe('Just a summary');
  });
});

describe('getFeedItems — errors', () => {
  test('throws on a non-ok HTTP response', async () => {
    mockFetch('', { ok: false, status: 404 });
    await expect(getFeedItems('https://example.org/rss.xml')).rejects.toThrow(/HTTP 404/);
  });
});
