let _marked = null;

export async function getMarked() {
  if (_marked) return _marked;
  const g = typeof globalThis !== 'undefined' ? globalThis : {};
  if (g.marked?.parse) { _marked = g.marked; return _marked; }
  try {
    const mod = await import('marked');
    _marked = mod.marked ?? mod.default ?? mod;
    return _marked;
  } catch {}
  return null;
}

export function detectIncludeFormat(contentType, url) {
  const ct = (contentType || '').split(';')[0].trim();
  const ext = url.split('?')[0].split('#')[0].split('.').pop().toLowerCase();
  const isMarkdown = ct.includes('markdown') || ct.includes('text/x-markdown')
                  || ['md', 'markdown'].includes(ext);
  const isHtml = ct.includes('html') || ext === 'html' || ext === 'htm';
  return { isMarkdown, isHtml };
}

/**
 * Fetch a URL and return processed content.
 * @param {string} source - URL to fetch
 * @param {object} [opts]
 * @param {boolean} [opts.raw] - return raw text without processing
 * @param {boolean} [opts.trusted] - skip sanitization
 * @param {function} [opts.sanitize] - async (html) => sanitized html
 * @param {function} [opts.fetchFn] - fetch implementation
 * @param {AbortSignal} [opts.signal] - cancel the underlying fetch
 * @returns {Promise<{type: 'html'|'raw', content: string}>}
 */
export async function fetchIncludeContent(source, { raw = false, trusted = false, sanitize, fetchFn = globalThis.fetch, signal } = {}) {
  const resp = await fetchFn(source, signal ? { signal } : undefined);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const ct = (resp.headers.get('content-type') || '').split(';')[0].trim();
  const text = await resp.text();
  const { isMarkdown, isHtml } = detectIncludeFormat(ct, source);

  if (raw) return { type: 'raw', content: text };

  if (isMarkdown) {
    const markedLib = await getMarked();
    if (!markedLib) throw new Error('marked library not available — add to importmap');
    let html = typeof markedLib.parse === 'function' ? markedLib.parse(text) : markedLib(text);
    if (!trusted && sanitize) html = await sanitize(html);
    return { type: 'html', content: html };
  }

  if (isHtml) {
    const html = (!trusted && sanitize) ? await sanitize(text) : text;
    return { type: 'html', content: html };
  }

  return { type: 'raw', content: text };
}

/**
 * Filter HTML with a CSS selector.
 * @param {string} html - HTML string
 * @param {string} selector - CSS selector
 * @param {function} createContainer - (html) => DOM element with parsed content
 * @returns {string|null} filtered HTML or null if no matches
 */
export function filterWithSelector(html, selector, createContainer) {
  if (!selector) return html;
  const container = createContainer(html);
  const els = Array.from(container.querySelectorAll(selector));
  if (!els.length) return null;
  return els.map(el => el.outerHTML).join('\n');
}
