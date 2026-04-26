/**
 * Tests for node/sol-include.js — the Node.js include API.
 * Pure JS, no browser DOM. Mock fetch to control network responses.
 */

import { solInclude } from '../../node/sol-include.js';

function mockFetch(body, { contentType = 'text/html', status = 200 } = {}) {
  return (url) => Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    headers: new Map([['content-type', contentType]]),
    text: () => Promise.resolve(body),
  });
}

describe('solInclude', () => {
  test('fetches and returns HTML content', async () => {
    const result = await solInclude('https://example.org/page.html', {
      fetchFn: mockFetch('<p>Hello</p>', { contentType: 'text/html' }),
      trusted: true,
    });
    expect(result.type).toBe('html');
    expect(result.content).toContain('Hello');
  });

  test('returns raw content when raw=true', async () => {
    const result = await solInclude('https://example.org/page.html', {
      fetchFn: mockFetch('<p>Hello</p>', { contentType: 'text/html' }),
      raw: true,
    });
    expect(result).toEqual({ type: 'raw', content: '<p>Hello</p>' });
  });

  test('returns raw for unknown content types', async () => {
    const result = await solInclude('https://example.org/data.json', {
      fetchFn: mockFetch('{"a":1}', { contentType: 'application/json' }),
    });
    expect(result).toEqual({ type: 'raw', content: '{"a":1}' });
  });

  test('filters HTML with selector option', async () => {
    const html = '<div><p class="keep">Wanted</p><p class="drop">Dropped</p></div>';
    const result = await solInclude('https://example.org/page.html', {
      fetchFn: mockFetch(html, { contentType: 'text/html' }),
      selector: '.keep',
      trusted: true,
    });
    expect(result.type).toBe('html');
    expect(result.content).toContain('Wanted');
    expect(result.content).not.toContain('Dropped');
  });

  test('returns empty content when selector matches nothing', async () => {
    const result = await solInclude('https://example.org/page.html', {
      fetchFn: mockFetch('<p>Hi</p>', { contentType: 'text/html' }),
      selector: '.nonexistent',
      trusted: true,
    });
    expect(result).toEqual({ type: 'html', content: '' });
  });

  test('throws on HTTP error', async () => {
    await expect(
      solInclude('https://example.org/missing', {
        fetchFn: mockFetch('', { contentType: 'text/html', status: 404 }),
      })
    ).rejects.toThrow('HTTP 404');
  });

  test('processes Markdown', async () => {
    globalThis.marked = { parse: md => `<p>${md}</p>` };
    try {
      const result = await solInclude('https://example.org/readme.md', {
        fetchFn: mockFetch('# Title', { contentType: 'text/markdown' }),
        trusted: true,
      });
      expect(result.type).toBe('html');
      expect(result.content).toContain('# Title');
    } finally {
      delete globalThis.marked;
    }
  });

  test('sanitizes HTML by default via DOMPurify+jsdom', async () => {
    const result = await solInclude('https://example.org/page.html', {
      fetchFn: mockFetch('<p>Safe</p><script>evil()</script>', { contentType: 'text/html' }),
    });
    expect(result.type).toBe('html');
    expect(result.content).toContain('Safe');
    expect(result.content).not.toContain('script');
  });
});
