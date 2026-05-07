// Node.js version of sol-include — same options as the web component,
// returns processed content as a string instead of rendering DOM.
//
// Usage:
//   import { solInclude } from 'solid-components/include-node';
//   const { type, content } = await solInclude('https://example.org/readme.md');
//   const { type, content } = await solInclude('page.html', { selector: 'article' });

import { JSDOM } from 'jsdom';
import { fetchIncludeContent, filterWithSelector } from '../core/include-core.js';

let _purify = null;

async function nodeSanitize(html) {
  if (!_purify) {
    const mod = await import('dompurify');
    const DOMPurify = mod.default ?? mod;
    _purify = DOMPurify(new JSDOM('').window);
  }
  return _purify.sanitize(html);
}

function nodeContainer(html) {
  return new JSDOM(html).window.document.body;
}

/**
 * Fetch and return remote content (Node.js equivalent of &lt;sol-include&gt;).
 * @param {string} source - URL to fetch
 * @param {object} [opts]
 * @param {string} [opts.selector] - CSS selector to filter content
 * @param {boolean} [opts.raw] - return raw text without processing
 * @param {boolean} [opts.trusted] - skip DOMPurify sanitization
 * @param {function} [opts.fetchFn] - custom fetch implementation
 * @returns {Promise<{type: 'html'|'raw', content: string}>}
 */
export async function solInclude(source, { selector, raw, trusted, fetchFn } = {}) {
  // When a selector is present, defer sanitization so the selector can
  // match attributes (e.g. RDFa typeof/rel) that DOMPurify would strip.
  const result = await fetchIncludeContent(source, {
    raw,
    trusted: trusted || !!selector,
    sanitize: nodeSanitize,
    fetchFn,
  });

  if (result.type === 'html' && selector) {
    const filtered = filterWithSelector(result.content, selector, nodeContainer);
    if (filtered === null) return { type: 'html', content: '' };
    const safe = trusted ? filtered : await nodeSanitize(filtered);
    return { type: 'html', content: safe };
  }

  return result;
}
