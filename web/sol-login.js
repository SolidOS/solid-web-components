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

import { CSS, sheet as LOGIN_SHEET } from './styles/sol-login-css.js';
import { adopt } from '@solid-components/core/adopt.js';
import { define } from '@solid-components/core/define.js';
import { rdf } from '@solid-components/core/rdf.js';
import {
  originOf,
  baseDomain,
  sessionCoversOrigin,
  isNoAuth as _isNoAuth,
  getSessionFor as _getSessionFor,
  makeFetchFor,
  isLoggedInFor,
  getWebId as _getWebId,
  getFirstLoggedIn as _getFirstLoggedIn,
} from '@solid-components/core/auth-core.js';

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

  _noAuthConfig() {
    return this._noAuth ?? window.SolidAppContext?.noAuth;
  }

  isNoAuth(url) {
    return _isNoAuth(url, this._noAuthConfig());
  }

  originOf(url) { return originOf(url); }

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

  _sessionCoversOrigin(session, origin) {
    return sessionCoversOrigin(session, origin);
  }

  getSessionFor(url, tag) {
    return _getSessionFor(this.sessions, url, tag, this._noAuthConfig());
  }

  fetchFor(url, tag) {
    return makeFetchFor(this.sessions, url, tag, this._noAuthConfig(), fetch);
  }

  isLoggedIn(url, tag) {
    return isLoggedInFor(this.sessions, url, tag, this._noAuthConfig());
  }

  getWebId(tag) {
    return _getWebId(this.sessions, tag);
  }

  getFirstLoggedIn() {
    return _getFirstLoggedIn(this.sessions);
  }

  async handleIncomingRedirect() {
    const pendingTag = localStorage.getItem('solLoginPendingTag');
    localStorage.removeItem('solLoginPendingTag');

    // Ensure the session that initiated login exists so it can process the redirect.
    if (pendingTag) {
      this.sessionFor(pendingTag);
    }

    for (const [, session] of this.sessions) {
      await session.handleIncomingRedirect(window.location.href);
    }
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

/**
 * Solid OIDC login web component.
 *
 * Shows a log-in/log-out button with issuer dropdown. Manages OIDC sessions
 * via @inrupt/solid-client-authn-browser and provides authenticated fetch.
 *
 * @class SolLogin
 * @extends HTMLElement
 * @attr {string} issuers - comma-separated list of known OIDC issuer origins
 * @property {Function} fetchFor - fetchFor(url) returns authenticated fetch
 * @property {string} webId - logged-in user's WebID
 * @property {boolean} isLoggedIn - whether a session is active
 * @fires sol-login - detail: { webId, issuer }
 * @fires sol-logout
 */
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

  const authFetchWrapper = (uri, options = {}) => {
    const authFetch = this._auth.fetchFor(uri);
    return authFetch(uri, options);
  };

  const patchFetcherCtor = (FetcherCtor) => {
    if (!FetcherCtor?.prototype) return;
    const proto = FetcherCtor.prototype;
    if (!proto._originalFetch) {
      proto._originalFetch = proto.fetch || proto._fetch || fetch;
    }
    if (proto.fetch)  proto.fetch  = authFetchWrapper;
    if (proto._fetch) proto._fetch = authFetchWrapper;
  };

  const patchFetcherInstance = (fetcher) => {
    if (!fetcher) return;
    if (!fetcher._originalFetch) {
      fetcher._originalFetch = fetcher.fetch || fetcher._fetch || fetch;
    }
    if (fetcher.fetch)  fetcher.fetch  = authFetchWrapper;
    if (fetcher._fetch) fetcher._fetch = authFetchWrapper;
  };

  // 1. Patch Fetcher constructors (host-page global + our singleton) so any
  //    future `new Fetcher(...)` call gets auth.
  patchFetcherCtor(win.$rdf?.Fetcher);
  if (rdf.isReady()) patchFetcherCtor(rdf.Fetcher);

  // 2. Adopt an external shared store if one is already on the page. This
  //    makes our components and solid-logic / solid-ui / mashlib share one
  //    rdflib graph (same cache, same subscriptions), so data loaded by
  //    either side is visible to the other.
  //    Probes solid-logic (`window.SolidLogic.store`), solid-ui / mashlib
  //    (`window.UI.store`), and the older `window.panes.store` surface.
  const externalStore =
       win.SolidLogic?.store
    || win.UI?.store
    || win.panes?.store
    || null;
  if (externalStore && rdf.isReady()) rdf.useStore(externalStore);

  // 2b. If nothing was on the page, publish our singleton upward so
  //     mashlib/solid-ui/solid-logic loaded *after* us share our graph.
  if (!externalStore && rdf.isReady() && !win.SolidLogic) {
    win.SolidLogic = { store: rdf.store, fetcher: rdf.storeFetcher };
  }

  // 3. Patch any already-instantiated Fetcher instances hanging off the
  //    shared store(s), so existing rdflib code paths also get auth.
  patchFetcherInstance(win.SolidLogic?.store?.fetcher);
  patchFetcherInstance(win.UI?.store?.fetcher);
  patchFetcherInstance(win.panes?.store?.fetcher);
  if (rdf.isReady()) patchFetcherInstance(rdf._fetcher);
}

  _render() {
    const s = this.shadowRoot;
    s.innerHTML = `
      <span class="auth-status"></span>
      <button class="sol-btn sol-btn-sm sol-btn-primary auth-btn">Log in</button>
      <div class="dropdown">
        <div class="issuer-list"></div>
        <div class="custom-row">
          <input class="sol-input issuer-input" type="text" placeholder="https://your-issuer.org">
          <button class="sol-btn sol-btn-sm sol-btn-primary">Log in</button>
        </div>
      </div>`;
    s.adoptedStyleSheets = [];
    adopt(s, { sheet: LOGIN_SHEET, css: CSS });

    const mainBtn = s.querySelector('.auth-btn');
    mainBtn.addEventListener('click', () => this._handleClick());

    const goBtn = s.querySelector('.custom-row .sol-btn');
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
    btn.className = 'sol-btn sol-btn-sm sol-btn-danger auth-btn';
    btn.title = webId;
  } else {
    status.textContent = '';
    status.className = 'auth-status';
    btn.textContent = 'Log in';
    btn.className = 'sol-btn sol-btn-sm sol-btn-primary auth-btn';
    btn.title = '';
  }
}
}

define('sol-login', SolLogin);
export { SolLogin, AuthManager };
export default SolLogin;
