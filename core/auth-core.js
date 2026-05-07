export function originOf(url) {
  return url.match(/^https?:\/\/[^/]+/)?.[0] || '';
}

export function baseDomain(host) {
  const p = host.split('.');
  return p.length >= 2 ? p.slice(-2).join('.') : host;
}

export function sessionCoversOrigin(session, origin) {
  if (!session.info?.isLoggedIn) return false;
  try {
    const rHost = new URL(origin).host;
    const rBase = baseDomain(rHost);
    for (const ref of [session.info.issuer, session.info.webId]) {
      if (!ref) continue;
      const h = new URL(ref).host;
      if (rHost === h || rHost.endsWith('.' + h) || baseDomain(h) === rBase) return true;
    }
  } catch {}
  return false;
}

export function isNoAuth(url, noAuthConfig) {
  try {
    const origin = new URL(url).origin;
    if (!noAuthConfig) return false;
    return Array.isArray(noAuthConfig) ? noAuthConfig.includes(origin) : origin === noAuthConfig;
  } catch { return false; }
}

export function getSessionFor(sessions, url, tag, noAuthConfig) {
  if (!url || isNoAuth(url, noAuthConfig)) return null;
  const own = sessions.get(tag);
  if (own?.info?.isLoggedIn) return own;
  const origin = originOf(url);
  for (const [, s] of sessions) {
    if (sessionCoversOrigin(s, origin)) return s;
  }
  return own || null;
}

export function makeFetchFor(sessions, url, tag, noAuthConfig, defaultFetch) {
  if (isNoAuth(url, noAuthConfig)) return defaultFetch;
  const session = tag
    ? getSessionFor(sessions, url, tag, noAuthConfig)
    : (() => {
        const origin = originOf(url);
        for (const [, s] of sessions) {
          if (sessionCoversOrigin(s, origin)) return s;
        }
        return null;
      })();
  if (!session?.fetch) return defaultFetch;
  return (input, init) => session.fetch(input, init);
}

export function isLoggedInFor(sessions, url, tag, noAuthConfig) {
  if (!url || isNoAuth(url, noAuthConfig)) return true;
  const s = getSessionFor(sessions, url, tag, noAuthConfig);
  return s?.info?.isLoggedIn ?? false;
}

export function getWebId(sessions, tag = 'default') {
  return sessions.get(tag)?.info?.webId || null;
}

export function getFirstLoggedIn(sessions) {
  for (const s of sessions.values()) {
    if (s.info?.isLoggedIn) return s;
  }
  return null;
}
