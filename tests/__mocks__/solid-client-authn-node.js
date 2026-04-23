// Mock @inrupt/solid-client-authn-node for tests.

export class Session {
  constructor() {
    this.info = { isLoggedIn: false, webId: null, issuer: null };
    this.fetch = (input, init) => globalThis.fetch(input, init);
    this._pendingIssuer = null;
  }
  async login({ oidcIssuer, clientId, clientSecret, redirectUrl, handleRedirect }) {
    if (clientId === 'fail') throw new Error('auth failed');
    if (redirectUrl && handleRedirect) {
      this._pendingIssuer = oidcIssuer;
      handleRedirect(`${oidcIssuer}authorize?redirect_uri=${encodeURIComponent(redirectUrl)}`);
      return;
    }
    this.info.isLoggedIn = true;
    this.info.issuer = oidcIssuer;
    this.info.webId = `${oidcIssuer}profile/card#me`;
  }
  async handleIncomingRedirect(_url) {
    if (this._pendingIssuer) {
      this.info.isLoggedIn = true;
      this.info.issuer = this._pendingIssuer;
      this.info.webId = `${this._pendingIssuer}profile/card#me`;
      this._pendingIssuer = null;
    }
  }
  async logout() {
    this.info.isLoggedIn = false;
    this.info.webId = null;
  }
}
