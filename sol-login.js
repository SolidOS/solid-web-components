/**
 * <sol-login> — Solid OIDC login web component.
 * Attributes: issuers (comma-separated list of known issuer origins)
 * Properties: fetchFor(url) — authenticated fetch, webId, isLoggedIn, session
 * Events: sol-login({webId, issuer}), sol-logout
 *
 * Usage:
 *   <sol-login></sol-login>
 *   <sol-login issuers="https://solidcommunity.net,https://login.inrupt.com"></sol-login>
 *
 * Expects @inrupt/solid-client-authn-browser loaded as UMD at window.solidClientAuthn
 */

import { CSS } from './utils/sol-login-css.js';

document.addEventListener('DOMContentLoaded', async () => {
  const login = document.querySelector('sol-login');
  if (login && !login._manualInit) await login.initialize();
});


function getSessionClass() {
  const locations = [
    window.solidClientAuthn?.Session,
    window.solidClientAuthentication?.Session,
    window.SolidClientAuthn?.Session,
    window['@inrupt/solid-client-authn-browser']?.Session
  ];
  
  for (const SessionClass of locations) {
    if (SessionClass) return SessionClass;
  }
  
  throw new Error('sol-login: solid-client-authn-browser must be loaded as UMD bundle. Expected at window.solidClientAuthn.Session or window.solidClientAuthentication.Session');
}

class AuthManager {
  constructor() {
    this.sessions = new Map();
    this._noAuth = null;
    try {
      this._sideOrigins = JSON.parse(localStorage.getItem('solLoginOrigins') || '{}');
    } catch (e) { this._sideOrigins = {}; }
  }

  set noAuth(v) {
    this._noAuth = v;
  }

  isNoAuth(url) {
    try {
      const origin = new URL(url).origin;
      const na = this._noAuth ?? window.SolidAppContext?.noAuth;
      if (!na) return false;
      return Array.isArray(na) ? na.includes(origin) : origin === na;
    } catch (e) { return false; }
  }

  originOf(url) { return url.match(/^https?:\/\/[^\/]+/)?.[0] || ''; }

  _sessionId(tag, origin) {
    return `sol_${tag}_${origin.replace(/[^a-z0-9]/gi, '_')}`;
  }

  _makeSession(sessionId) {
    const SessionClass = getSessionClass();
    return new SessionClass({}, sessionId);
  }

  sessionFor(tag, origin) {
    if (this.sessions.has(tag)) return this.sessions.get(tag);
    const org = origin || this._sideOrigins[tag];
    const sessionId = org ? this._sessionId(tag, org) : `sol_${tag}_unset`;
    const session = this._makeSession(sessionId);
    this.sessions.set(tag, session);
    return session;
  }

  setSideOrigin(tag, url) {
    if (this.isNoAuth(url)) return;
    const origin = this.originOf(url);
    if (this._sideOrigins[tag] === origin) return;
    const existing = this.sessions.get(tag);
    if (existing && this._sessionCoversOrigin(existing, origin)) {
      this._sideOrigins[tag] = origin;
      this._persistOrigins();
      return;
    }
    this._sideOrigins[tag] = origin;
    this._persistOrigins();
    const sessionId = this._sessionId(tag, origin);
    this.sessions.set(tag, this._makeSession(sessionId));
  }

  _persistOrigins() {
    try { localStorage.setItem('solLoginOrigins', JSON.stringify(this._sideOrigins)); } catch (e) {}
  }

  _baseDomain(host) {
    const p = host.split('.');
    return p.length >= 2 ? p.slice(-2).join('.') : host;
  }

  _sessionCoversOrigin(session, origin) {
    if (!session.info?.isLoggedIn) return false;
    try {
      const rHost = new URL(origin).host;
      const rBase = this._baseDomain(rHost);
      for (const ref of [session.info.issuer, session.info.webId]) {
        if (!ref) continue;
        const h = new URL(ref).host;
        if (rHost === h || rHost.endsWith('.' + h) || this._baseDomain(h) === rBase) return true;
      }
    } catch (e) {}
    return false;
  }

  getSessionFor(url, tag) {
    if (!url || this.isNoAuth(url)) return null;
    const own = this.sessions.get(tag);
    if (own?.info?.isLoggedIn) return own;
    const origin = this.originOf(url);
    for (const [, s] of this.sessions) {
      if (this._sessionCoversOrigin(s, origin)) return s;
    }
    return own;
  }

  fetchFor(url, tag) {
    if (this.isNoAuth(url)) return fetch;
    const session = tag
      ? this.getSessionFor(url, tag)
      : (() => {
          const origin = this.originOf(url);
          for (const [, s] of this.sessions) {
            if (this._sessionCoversOrigin(s, origin)) return s;
          }
          return null;
        })();
    if (!session) return fetch;
    return (input, init) => session.fetch(input, init);
  }

  isLoggedIn(url, tag) {
    if (!url || this.isNoAuth(url)) return true;
    const s = this.getSessionFor(url, tag);
    return s?.info?.isLoggedIn ?? false;
  }

  getWebId(tag) {
    return this.sessions.get(tag)?.info?.webId || null;
  }

  getFirstLoggedIn() {
    for (const s of this.sessions.values()) {
      if (s.info?.isLoggedIn) return s;
    }
    return null;
  }

  async handleIncomingRedirect() {
    const pendingTag = localStorage.getItem('solLoginPendingTag');

    const cleanUrl = (() => {
      const u = new URL(window.location.href);
      ['code', 'state', 'iss', 'session_state'].forEach(p => u.searchParams.delete(p));
      return u.toString();
    })();

    const tags = pendingTag
      ? [pendingTag, ...[...this.sessions.keys()].filter(t => t !== pendingTag)]
      : [...this.sessions.keys()];

    for (const tag of tags) {
      const session = this.sessions.get(tag);
      if (!session) continue;
      await session.handleIncomingRedirect(tag === pendingTag ? window.location.href : cleanUrl);
    }

    localStorage.removeItem('solLoginPendingTag');
  }

  async ensureAuthenticated(url, tag = 'default') {
    if (this.isNoAuth(url)) return true;
    const origin = this.originOf(url);
    this.setSideOrigin(tag, url);
    const session = this.sessionFor(tag, origin);
    if (session.info.isLoggedIn) return true;

    try { localStorage.setItem('solLoginPendingTag', tag); } catch (e) {}
    const redirectUrl = window.location.origin + window.location.pathname;
    await session.login({ oidcIssuer: origin, redirectUrl, clientName: 'Solid App' });
    return false;
  }
}

class SolLogin extends HTMLElement {
  static get observedAttributes() { return ['issuers']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._auth = new AuthManager();
    this._issuers = [];
    this._initialized = false;
  }

  get auth() { return this._auth; }

  get webId() {
    const s = this._auth.getFirstLoggedIn();
    return s?.info?.webId || null;
  }

  get isLoggedIn() {
    return !!this._auth.getFirstLoggedIn();
  }

  fetchFor(url, tag) {
    return this._auth.fetchFor(url, tag);
  }

  set issuers(arr) {
    this._issuers = arr || [];
    if (this.isConnected) this._renderIssuers();
  }

  get issuers() { return this._issuers; }

  addIssuer(origin) {
    try {
      const o = new URL(origin).origin;
      if (!this._issuers.includes(o)) {
        this._issuers.push(o);
        if (this.isConnected) this._renderIssuers();
      }
    } catch (e) {}
  }

  connectedCallback() {
    if (!this._initialized) {
      this._initialized = true;
      this._render();
      const attr = this.getAttribute('issuers');
      if (attr) this._issuers = attr.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  attributeChangedCallback(name, oldV, newV) {
    if (name === 'issuers' && oldV !== newV && this._initialized) {
      this._issuers = (newV || '').split(',').map(s => s.trim()).filter(Boolean);
      this._renderIssuers();
    }
  }

  async login(issuerUrl, tag = 'default') {
    await this._auth.ensureAuthenticated(issuerUrl, tag);
  }
async initialize(tags = ['default']) {
  for (const tag of tags) {
    this._auth.sessionFor(tag);
  }
  await this._auth.handleIncomingRedirect();
  this._updateUI();
  this._integrateWithRdflib();

  const firstSession = this._auth.getFirstLoggedIn();
  if (firstSession) {
    this.dispatchEvent(new CustomEvent('sol-login', {
      bubbles: true, composed: true,
      detail: { 
        webId: firstSession.info.webId,
        issuer: firstSession.info.issuer
      }
    }));
  }
}

async logout() {
  for (const [, session] of this._auth.sessions) {
    if (session.info?.isLoggedIn) {
      await session.logout();
    }
  }
  this._updateUI();
  this._integrateWithRdflib();
  this.dispatchEvent(new CustomEvent('sol-logout', { bubbles: true, composed: true }));
}

_integrateWithRdflib() {
  const win = typeof window !== 'undefined' ? window : {};
  
  if (win.$rdf?.Fetcher) {
    const fetcher = win.$rdf.Fetcher.prototype;
    if (!fetcher._originalFetch) {
      fetcher._originalFetch = fetcher.fetch || fetcher._fetch || fetch;
    }
    
    const authFetchWrapper = (uri, options = {}) => {
      const authFetch = this._auth.fetchFor(uri);
      return authFetch(uri, options);
    };
    
    if (fetcher.fetch) fetcher.fetch = authFetchWrapper;
    if (fetcher._fetch) fetcher._fetch = authFetchWrapper;
  }
  
  if (win.SolidLogic?.store?.fetcher) {
    const fetcher = win.SolidLogic.store.fetcher;
    if (!fetcher._originalFetch) {
      fetcher._originalFetch = fetcher.fetch || fetcher._fetch || fetch;
    }
    
    const authFetchWrapper = (uri, options = {}) => {
      const authFetch = this._auth.fetchFor(uri);
      return authFetch(uri, options);
    };
    
    if (fetcher.fetch) fetcher.fetch = authFetchWrapper;
    if (fetcher._fetch) fetcher._fetch = authFetchWrapper;
  }
}

  _render() {
    const s = this.shadowRoot;
    s.innerHTML = `<style>${CSS}</style>
      <span class="auth-status"></span>
      <button class="auth-btn login">Log in</button>
      <div class="dropdown">
        <div class="issuer-list"></div>
        <div class="custom-row">
          <input class="issuer-input" type="text" placeholder="https://your-issuer.org">
          <button class="auth-btn login">Log in</button>
        </div>
      </div>`;

    const mainBtn = s.querySelector('.auth-btn');
    mainBtn.addEventListener('click', () => this._handleClick());

    const goBtn = s.querySelector('.custom-row .auth-btn');
    goBtn.addEventListener('click', () => this._loginCustom());

    const input = s.querySelector('.issuer-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._loginCustom();
    });
  }

  _handleClick() {
    if (this.isLoggedIn) {
      this.logout();
    } else {
      this._toggleDropdown();
    }
  }

  _toggleDropdown() {
    const dd = this.shadowRoot.querySelector('.dropdown');
    if (dd.classList.contains('open')) {
      this._closeDropdown();
      return;
    }
    this._renderIssuers();

    const btn = this.shadowRoot.querySelector('.auth-btn');
    const rect = btn.getBoundingClientRect();
    dd.style.top = (rect.bottom + 4) + 'px';
    dd.classList.add('open');
    requestAnimationFrame(() => {
      const dw = dd.offsetWidth;
      const clampedLeft = Math.max(4, Math.min(rect.right - dw, window.innerWidth - dw - 4));
      dd.style.left = clampedLeft + 'px';
    });

    const input = this.shadowRoot.querySelector('.issuer-input');
    input.value = this._issuers[0] || '';
    input.focus();

    const close = (e) => {
      if (!dd.contains(e.composedPath()[0]) && e.composedPath()[0] !== btn) {
        this._closeDropdown();
        document.removeEventListener('click', close, true);
      }
    };
    setTimeout(() => document.addEventListener('click', close, true), 0);
  }

  _closeDropdown() {
    const dd = this.shadowRoot.querySelector('.dropdown');
    if (dd) dd.classList.remove('open');
  }

  _renderIssuers() {
    const list = this.shadowRoot.querySelector('.issuer-list');
    if (!list) return;
    list.innerHTML = '';
    this._issuers.forEach(issuer => {
      const btn = document.createElement('button');
      btn.className = 'issuer-item';
      btn.textContent = issuer.replace(/^https?:\/\//, '');
      btn.title = issuer;
      btn.onclick = () => {
        this._closeDropdown();
        const url = issuer.endsWith('/') ? issuer : issuer + '/';
        this.login(url);
      };
      list.appendChild(btn);
    });
  }

  async _loginCustom() {
    const input = this.shadowRoot.querySelector('.issuer-input');
    const val = input.value.trim();
    if (!val) return;
    const issuer = val.endsWith('/') ? val : val + '/';
    this._closeDropdown();
    await this.login(issuer);
  }

_updateUI() {
  const status = this.shadowRoot.querySelector('.auth-status');
  const btn = this.shadowRoot.querySelector('.auth-btn');
  if (!status || !btn) return;

  const session = this._auth.getFirstLoggedIn();
  if (session) {
    const webId = session.info.webId || '';
    const displayName = webId.replace(/^https?:\/\//, '').replace(/\/profile.*$/, '');
    status.textContent = displayName;
    status.className = 'auth-status logged-in';
    btn.textContent = 'Log out';
    btn.className = 'auth-btn logout';
    btn.title = webId;
  } else {
    status.textContent = '';
    status.className = 'auth-status';
    btn.textContent = 'Log in';
    btn.className = 'auth-btn login';
    btn.title = '';
  }
}
}

customElements.define('sol-login', SolLogin);
export { SolLogin, AuthManager };
export default SolLogin;
