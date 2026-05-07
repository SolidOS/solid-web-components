export function assertSafeQuery(query) {
  const m = query.match(/\b(INSERT|DELETE|DROP|CREATE|CLEAR|LOAD|COPY|MOVE|ADD)\b/i);
  if (m) throw new Error(`Blocked SPARQL operation: ${m[0].toUpperCase()}`);
}

export function sanitizeVarValue(value) {
  if (/[{}]/.test(value)) throw new Error(`Variable value contains disallowed characters: { }`);
  if (/\b(INSERT|DELETE|DROP|CREATE|CLEAR|LOAD|COPY|MOVE|ADD)\b/i.test(value))
    throw new Error(`Variable value contains blocked keyword`);
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'");
}

export function substituteVariables(query, vars = {}) {
  let q = query;
  for (const [key, value] of Object.entries(vars)) {
    const safe = sanitizeVarValue(value);
    q = q.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), safe);
  }
  return q;
}
