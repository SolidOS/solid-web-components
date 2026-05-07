import { jest } from '@jest/globals';
import { JSDOM } from 'jsdom';
import {
  detectIncludeFormat,
  fetchIncludeContent,
  filterWithSelector,
  getMarked,
} from '../../core/include-core.js';

// ── detectIncludeFormat ──────────────────────────────────────────────────────

describe('detectIncludeFormat', () => {
  test('detects HTML by content type', () => {
    expect(detectIncludeFormat('text/html', 'file.txt')).toEqual({ isMarkdown: false, isHtml: true });
  });

  test('detects HTML by extension', () => {
    expect(detectIncludeFormat('text/plain', 'page.html')).toEqual({ isMarkdown: false, isHtml: true });
    expect(detectIncludeFormat('text/plain', 'page.htm')).toEqual({ isMarkdown: false, isHtml: true });
  });

  test('detects Markdown by content type', () => {
    expect(detectIncludeFormat('text/markdown', 'file.txt')).toEqual({ isMarkdown: true, isHtml: false });
    expect(detectIncludeFormat('text/x-markdown', 'file.txt')).toEqual({ isMarkdown: true, isHtml: false });
  });

  test('detects Markdown by extension', () => {
    expect(detectIncludeFormat('text/plain', 'readme.md')).toEqual({ isMarkdown: true, isHtml: false });
    expect(detectIncludeFormat('text/plain', 'doc.markdown')).toEqual({ isMarkdown: true, isHtml: false });
  });

  test('returns false for both on unknown types', () => {
    expect(detectIncludeFormat('application/json', 'data.json')).toEqual({ isMarkdown: false, isHtml: false });
  });

  test('strips content-type parameters', () => {
    expect(detectIncludeFormat('text/html; charset=utf-8', 'x')).toEqual({ isMarkdown: false, isHtml: true });
  });

  test('strips query string and fragment from URL', () => {
    expect(detectIncludeFormat('text/plain', 'page.html?v=1#top')).toEqual({ isMarkdown: false, isHtml: true });
    expect(detectIncludeFormat('text/plain', 'readme.md?x=1')).toEqual({ isMarkdown: true, isHtml: false });
  });
});

// ── fetchIncludeContent ──────────────────────────────────────────────────────

function mockFetch(body, { contentType = 'text/html', status = 200 } = {}) {
  return (url) => Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    headers: new Map([['content-type', contentType]]),
    text: () => Promise.resolve(body),
  });
}

describe('fetchIncludeContent', () => {
  test('fetches and returns HTML content', async () => {
    const result = await fetchIncludeContent('https://example.org/page.html', {
      fetchFn: mockFetch('<p>Hello</p>', { contentType: 'text/html' }),
      trusted: true,
    });
    expect(result).toEqual({ type: 'html', content: '<p>Hello</p>' });
  });

  test('returns raw content when raw=true', async () => {
    const result = await fetchIncludeContent('https://example.org/page.html', {
      fetchFn: mockFetch('<p>Hello</p>', { contentType: 'text/html' }),
      raw: true,
    });
    expect(result).toEqual({ type: 'raw', content: '<p>Hello</p>' });
  });

  test('returns raw for unknown content types', async () => {
    const result = await fetchIncludeContent('https://example.org/data.json', {
      fetchFn: mockFetch('{"a":1}', { contentType: 'application/json' }),
    });
    expect(result).toEqual({ type: 'raw', content: '{"a":1}' });
  });

  test('calls sanitize for HTML when not trusted', async () => {
    const sanitize = jest.fn(html => `CLEAN:${html}`);
    const result = await fetchIncludeContent('https://example.org/page.html', {
      fetchFn: mockFetch('<script>bad</script>', { contentType: 'text/html' }),
      sanitize,
    });
    expect(sanitize).toHaveBeenCalledWith('<script>bad</script>');
    expect(result.content).toBe('CLEAN:<script>bad</script>');
  });

  test('skips sanitize when trusted', async () => {
    const sanitize = jest.fn();
    await fetchIncludeContent('https://example.org/page.html', {
      fetchFn: mockFetch('<p>OK</p>', { contentType: 'text/html' }),
      trusted: true,
      sanitize,
    });
    expect(sanitize).not.toHaveBeenCalled();
  });

  test('throws on HTTP error', async () => {
    await expect(
      fetchIncludeContent('https://example.org/missing', {
        fetchFn: mockFetch('', { status: 404 }),
      })
    ).rejects.toThrow('HTTP 404');
  });

  test('processes Markdown via marked', async () => {
    globalThis.marked = { parse: md => `<p>${md}</p>` };
    try {
      const result = await fetchIncludeContent('https://example.org/readme.md', {
        fetchFn: mockFetch('# Hello', { contentType: 'text/markdown' }),
        trusted: true,
      });
      expect(result).toEqual({ type: 'html', content: '<p># Hello</p>' });
    } finally {
      delete globalThis.marked;
    }
  });

  test('sanitizes converted Markdown when not trusted', async () => {
    globalThis.marked = { parse: md => `<p>${md}</p>` };
    const sanitize = jest.fn(html => `SAFE:${html}`);
    try {
      const result = await fetchIncludeContent('https://example.org/doc.md', {
        fetchFn: mockFetch('text', { contentType: 'text/markdown' }),
        sanitize,
      });
      expect(sanitize).toHaveBeenCalled();
      expect(result.type).toBe('html');
      expect(result.content).toMatch(/^SAFE:/);
    } finally {
      delete globalThis.marked;
    }
  });
});

// ── filterWithSelector ───────────────────────────────────────────────────────

describe('filterWithSelector', () => {
  function domContainer(html) {
    return new JSDOM(html).window.document.body;
  }

  test('returns html unchanged when no selector', () => {
    expect(filterWithSelector('<p>hi</p>', '', domContainer)).toBe('<p>hi</p>');
  });

  test('filters to matching elements', () => {
    const html = '<div><p class="a">One</p><p class="b">Two</p></div>';
    const result = filterWithSelector(html, '.a', domContainer);
    expect(result).toContain('One');
    expect(result).not.toContain('Two');
  });

  test('returns null when no elements match', () => {
    const result = filterWithSelector('<p>hi</p>', '.missing', domContainer);
    expect(result).toBeNull();
  });

  test('returns multiple matching elements', () => {
    const html = '<ul><li class="x">A</li><li>B</li><li class="x">C</li></ul>';
    const result = filterWithSelector(html, '.x', domContainer);
    expect(result).toContain('A');
    expect(result).toContain('C');
    expect(result).not.toContain('>B<');
  });
});
