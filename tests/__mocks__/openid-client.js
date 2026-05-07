// Mock openid-client for tests.

export const generators = {
  codeVerifier() { return 'mock-verifier'; },
  codeChallenge() { return 'mock-challenge'; },
  state() { return 'mock-state'; },
};

class MockClient {
  constructor(issuerUrl, opts) {
    this._issuerUrl = issuerUrl;
    this.metadata = opts || {};
  }

  authorizationUrl({ redirect_uri, state }) {
    return `${this._issuerUrl}/authorize?redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}`;
  }

  callbackParams(url) {
    const u = new URL(url);
    return Object.fromEntries(u.searchParams.entries());
  }

  async callback() {
    const issuer = this._issuerUrl.replace(/\/$/, '');
    return {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      claims() {
        return { webid: `${issuer}/profile/card#me`, sub: 'mock-sub' };
      },
    };
  }

  async refresh() {
    const issuer = this._issuerUrl.replace(/\/$/, '');
    return {
      access_token: 'mock-refreshed-token',
      refresh_token: 'mock-refresh-token-2',
      claims() {
        return { webid: `${issuer}/profile/card#me`, sub: 'mock-sub' };
      },
    };
  }
}

export class Issuer {
  constructor(meta) { this.metadata = meta; }

  static async discover(issuerUrl) {
    const normalized = issuerUrl.replace(/\/$/, '');
    const issuer = new Issuer({ issuer: normalized });
    issuer.Client = class extends MockClient {
      constructor(opts) { super(normalized, opts); }
      static async register({ redirect_uris }) {
        const c = new MockClient(normalized, {
          client_id: 'mock-client-id',
          client_secret: undefined,
        });
        c._redirectUris = redirect_uris;
        return c;
      }
    };
    return issuer;
  }
}
