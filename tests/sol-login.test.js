/**
 * Tests for AuthManager from sol-login.js.
 * Pure logic tests — mock Session class, no real OIDC.
 */

import { AuthManager } from '../sol-login.js';

// Mock Session class injected via window global
class MockSession {
  constructor(opts, id) {
    this.id = id;
    this.info = { isLoggedIn: false, webId: null, issuer: null };
    this.fetch = (input, init) => globalThis.fetch(input, init);
  }
  async handleIncomingRedirect() {}
  async login() {}
}

beforeAll(() => {
  window.solidClientAuthn = { Session: MockSession };
});

function loggedInSession(tag, webId, issuer) {
  const mgr = new AuthManager();
  const session = mgr.sessionFor(tag, new URL(webId).origin);
  session.info = { isLoggedIn: true, webId, issuer };
  return mgr;
}

// ── originOf ──────────────────────────────────────────────────────────────

describe('originOf', () => {
  const mgr = new AuthManager();

  test('extracts origin from https URL', () => {
    expect(mgr.originOf('https://alice.example.com/pod/file.ttl'))
      .toBe('https://alice.example.com');
  });

  test('extracts origin from http URL with port', () => {
    expect(mgr.originOf('http://localhost:3000/path'))
      .toBe('http://localhost:3000');
  });

  test('returns empty string for invalid URL', () => {
    expect(mgr.originOf('not-a-url')).toBe('');
  });
});

// ── isNoAuth ──────────────────────────────────────────────────────────────

describe('isNoAuth', () => {
  test('returns false when noAuth not set', () => {
    const mgr = new AuthManager();
    expect(mgr.isNoAuth('https://example.com/file')).toBe(false);
  });

  test('matches single origin string', () => {
    const mgr = new AuthManager();
    mgr.noAuth = 'https://example.com';
    expect(mgr.isNoAuth('https://example.com/path')).toBe(true);
    expect(mgr.isNoAuth('https://other.com/path')).toBe(false);
  });

  test('matches origin in array', () => {
    const mgr = new AuthManager();
    mgr.noAuth = ['https://a.com', 'https://b.com'];
    expect(mgr.isNoAuth('https://a.com/x')).toBe(true);
    expect(mgr.isNoAuth('https://b.com/y')).toBe(true);
    expect(mgr.isNoAuth('https://c.com/z')).toBe(false);
  });

  test('returns false for invalid URL', () => {
    const mgr = new AuthManager();
    mgr.noAuth = 'https://example.com';
    expect(mgr.isNoAuth('garbage')).toBe(false);
  });
});

// ── _baseDomain ───────────────────────────────────────────────────────────

describe('_baseDomain', () => {
  const mgr = new AuthManager();

  test('extracts last two parts', () => {
    expect(mgr._baseDomain('pod.solidcommunity.net')).toBe('solidcommunity.net');
  });

  test('returns host as-is for two parts', () => {
    expect(mgr._baseDomain('example.com')).toBe('example.com');
  });

  test('returns host as-is for single part', () => {
    expect(mgr._baseDomain('localhost')).toBe('localhost');
  });
});

// ── _sessionCoversOrigin ──────────────────────────────────────────────────

describe('_sessionCoversOrigin', () => {
  test('returns false when session not logged in', () => {
    const mgr = new AuthManager();
    const session = { info: { isLoggedIn: false, issuer: 'https://example.com' } };
    expect(mgr._sessionCoversOrigin(session, 'https://example.com')).toBe(false);
  });

  test('matches same host via issuer', () => {
    const mgr = new AuthManager();
    const session = { info: { isLoggedIn: true, issuer: 'https://solidcommunity.net', webId: null } };
    expect(mgr._sessionCoversOrigin(session, 'https://solidcommunity.net')).toBe(true);
  });

  test('matches subdomain of issuer', () => {
    const mgr = new AuthManager();
    const session = { info: { isLoggedIn: true, issuer: 'https://solidcommunity.net', webId: null } };
    expect(mgr._sessionCoversOrigin(session, 'https://alice.solidcommunity.net')).toBe(true);
  });

  test('matches via shared base domain with webId', () => {
    const mgr = new AuthManager();
    const session = {
      info: {
        isLoggedIn: true,
        issuer: 'https://login.inrupt.com',
        webId: 'https://alice.pod.inrupt.com/profile/card#me',
      },
    };
    expect(mgr._sessionCoversOrigin(session, 'https://bob.pod.inrupt.com')).toBe(true);
  });

  test('rejects unrelated origin', () => {
    const mgr = new AuthManager();
    const session = { info: { isLoggedIn: true, issuer: 'https://solidcommunity.net', webId: null } };
    expect(mgr._sessionCoversOrigin(session, 'https://other.example.com')).toBe(false);
  });
});

// ── sessionFor / getSessionFor ────────────────────────────────────────────

describe('sessionFor', () => {
  test('creates and caches a session', () => {
    const mgr = new AuthManager();
    const s1 = mgr.sessionFor('default', 'https://example.com');
    const s2 = mgr.sessionFor('default');
    expect(s1).toBe(s2);
  });

  test('different tags get different sessions', () => {
    const mgr = new AuthManager();
    const s1 = mgr.sessionFor('a', 'https://a.com');
    const s2 = mgr.sessionFor('b', 'https://b.com');
    expect(s1).not.toBe(s2);
  });
});

describe('getSessionFor', () => {
  test('returns null for noAuth URLs', () => {
    const mgr = new AuthManager();
    mgr.noAuth = 'https://public.example.com';
    expect(mgr.getSessionFor('https://public.example.com/file', 'tag')).toBeNull();
  });

  test('returns own session if logged in', () => {
    const mgr = loggedInSession('default', 'https://alice.example.com/profile/card#me', 'https://example.com');
    const s = mgr.getSessionFor('https://alice.example.com/pod/', 'default');
    expect(s.info.isLoggedIn).toBe(true);
  });

  test('finds matching session from another tag', () => {
    const mgr = loggedInSession('other', 'https://alice.solidcommunity.net/profile/card#me', 'https://solidcommunity.net');
    mgr.sessionFor('default', 'https://solidcommunity.net');
    const s = mgr.getSessionFor('https://solidcommunity.net/file', 'default');
    expect(s.info.isLoggedIn).toBe(true);
  });
});

// ── isLoggedIn ────────────────────────────────────────────────────────────

describe('isLoggedIn', () => {
  test('returns true for noAuth URLs', () => {
    const mgr = new AuthManager();
    mgr.noAuth = 'https://public.com';
    expect(mgr.isLoggedIn('https://public.com/file', 'tag')).toBe(true);
  });

  test('returns true for null URL', () => {
    const mgr = new AuthManager();
    expect(mgr.isLoggedIn(null, 'tag')).toBe(true);
  });

  test('returns false when not logged in', () => {
    const mgr = new AuthManager();
    mgr.sessionFor('tag', 'https://example.com');
    expect(mgr.isLoggedIn('https://example.com/file', 'tag')).toBe(false);
  });

  test('returns true when logged in', () => {
    const mgr = loggedInSession('tag', 'https://alice.example.com/card#me', 'https://example.com');
    expect(mgr.isLoggedIn('https://example.com/file', 'tag')).toBe(true);
  });
});

// ── getWebId ──────────────────────────────────────────────────────────────

describe('getWebId', () => {
  test('returns null for unknown tag', () => {
    const mgr = new AuthManager();
    expect(mgr.getWebId('unknown')).toBeNull();
  });

  test('returns webId when logged in', () => {
    const mgr = loggedInSession('me', 'https://alice.example.com/card#me', 'https://example.com');
    expect(mgr.getWebId('me')).toBe('https://alice.example.com/card#me');
  });
});

// ── getFirstLoggedIn ──────────────────────────────────────────────────────

describe('getFirstLoggedIn', () => {
  test('returns null when none logged in', () => {
    const mgr = new AuthManager();
    mgr.sessionFor('a', 'https://a.com');
    expect(mgr.getFirstLoggedIn()).toBeNull();
  });

  test('returns first logged-in session', () => {
    const mgr = new AuthManager();
    mgr.sessionFor('a', 'https://a.com');
    const mgr2 = loggedInSession('b', 'https://b.com/card#me', 'https://b.com');
    expect(mgr2.getFirstLoggedIn().info.webId).toBe('https://b.com/card#me');
  });
});

// ── fetchFor ──────────────────────────────────────────────────────────────

describe('fetchFor', () => {
  test('returns plain fetch for noAuth URLs', () => {
    const mgr = new AuthManager();
    mgr.noAuth = 'https://public.com';
    expect(mgr.fetchFor('https://public.com/file')).toBe(fetch);
  });

  test('returns plain fetch when no session matches', () => {
    const mgr = new AuthManager();
    expect(mgr.fetchFor('https://unknown.com/file')).toBe(fetch);
  });

  test('returns session fetch when logged in', () => {
    const mgr = loggedInSession('tag', 'https://alice.example.com/card#me', 'https://example.com');
    const fn = mgr.fetchFor('https://example.com/data', 'tag');
    expect(fn).not.toBe(fetch);
  });
});
