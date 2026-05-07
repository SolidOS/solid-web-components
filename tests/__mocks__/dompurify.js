// Minimal DOMPurify mock that strips dangerous content for security tests.
// Supports both direct usage (browser) and factory pattern (node: DOMPurify(window)).
const EVENTS_RE = /\s+on\w+\s*=\s*"[^"]*"/gi;
const SCRIPT_RE = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const IFRAME_RE = /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi;
const SVG_RE = /<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi;
const JS_HREF_RE = /\s+href\s*=\s*"javascript:[^"]*"/gi;
const DATA_SRC_RE = /\s+src\s*=\s*"data:[^"]*"/gi;
const STYLE_EXPR_RE = /\s+style\s*=\s*"[^"]*expression\([^"]*"[^"]*"/gi;

export function sanitize(html) {
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

function DOMPurify() {
  return { sanitize };
}
DOMPurify.sanitize = sanitize;

export default DOMPurify;
