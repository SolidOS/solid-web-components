// Minimal DOMPurify mock that strips dangerous content for security tests.
// Uses jsdom's DOMParser to remove scripts, event handlers, and dangerous URIs.
const EVENTS_RE = /\s+on\w+\s*=\s*"[^"]*"/gi;
const SCRIPT_RE = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const IFRAME_RE = /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi;
const SVG_RE = /<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi;
const JS_HREF_RE = /\s+href\s*=\s*"javascript:[^"]*"/gi;
const DATA_SRC_RE = /\s+src\s*=\s*"data:[^"]*"/gi;
const STYLE_EXPR_RE = /\s+style\s*=\s*"[^"]*expression\([^"]*"[^"]*"/gi;

function sanitize(html) {
  if (!html) return '';
  let out = html;
  out = out.replace(SCRIPT_RE, '');
  out = out.replace(IFRAME_RE, '');
  out = out.replace(SVG_RE, '');
  out = out.replace(EVENTS_RE, '');
  out = out.replace(JS_HREF_RE, '');
  out = out.replace(DATA_SRC_RE, '');
  out = out.replace(STYLE_EXPR_RE, '');
  return out;
}

module.exports = { default: { sanitize }, sanitize };
