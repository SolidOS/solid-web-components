/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { getAuthFetch } from '../../core/auth-fetch.js';

describe('getAuthFetch', () => {
  let origFetch;

  beforeEach(() => {
    document.body.innerHTML = '';
    origFetch = globalThis.fetch;
    globalThis.fetch = jest.fn();
  });

  afterEach(() => {
    globalThis.fetch = origFetch;
  });

  test('returns global fetch when no sol-login is on the page', () => {
    const f = getAuthFetch('https://example.org/data.ttl');
    expect(typeof f).toBe('function');
  });

  test('returns the sol-login fetchFor when one is logged in', () => {
    const marker = jest.fn();
    const fakeLogin = document.createElement('sol-login');
    fakeLogin.fetchFor = (url, tag) => marker;
    document.body.appendChild(fakeLogin);

    const f = getAuthFetch('https://pod.example.org/data.ttl');
    expect(f).toBe(marker);
  });

  test('passes the URL and tag through to fetchFor', () => {
    const captured = [];
    const fakeLogin = document.createElement('sol-login');
    fakeLogin.fetchFor = (url, tag) => {
      captured.push({ url, tag });
      return jest.fn();
    };
    document.body.appendChild(fakeLogin);

    getAuthFetch('https://pod.example.org/foo', { tag: 'admin' });
    expect(captured[0]).toEqual({ url: 'https://pod.example.org/foo', tag: 'admin' });
  });

  test('defaults the tag to "default"', () => {
    const captured = [];
    const fakeLogin = document.createElement('sol-login');
    fakeLogin.fetchFor = (url, tag) => { captured.push(tag); return jest.fn(); };
    document.body.appendChild(fakeLogin);

    getAuthFetch('https://pod.example.org/foo');
    expect(captured[0]).toBe('default');
  });

  test('opts.element overrides the page-wide lookup', () => {
    const pageFetch = jest.fn();
    const overrideFetch = jest.fn();
    const pageLogin = document.createElement('sol-login');
    pageLogin.fetchFor = () => pageFetch;
    document.body.appendChild(pageLogin);

    const overrideLogin = document.createElement('sol-login');
    overrideLogin.fetchFor = () => overrideFetch;

    const f = getAuthFetch('https://pod.example.org/foo', { element: overrideLogin });
    expect(f).toBe(overrideFetch);
    expect(f).not.toBe(pageFetch);
  });

  test('falls back to global fetch when fetchFor throws', () => {
    const fakeLogin = document.createElement('sol-login');
    fakeLogin.fetchFor = () => { throw new Error('boom'); };
    document.body.appendChild(fakeLogin);

    const f = getAuthFetch('https://pod.example.org/foo');
    expect(typeof f).toBe('function');
  });

  test('falls back to global fetch when fetchFor returns a non-function', () => {
    const fakeLogin = document.createElement('sol-login');
    fakeLogin.fetchFor = () => null;
    document.body.appendChild(fakeLogin);

    const f = getAuthFetch('https://pod.example.org/foo');
    expect(typeof f).toBe('function');
  });

  test('returns undefined when no sol-login and global fetch is missing', () => {
    const orig = globalThis.fetch;
    delete globalThis.fetch;
    try {
      const f = getAuthFetch('https://example.org/data.ttl');
      expect(f).toBeUndefined();
    } finally {
      globalThis.fetch = orig;
    }
  });
});
