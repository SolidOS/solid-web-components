/**
 * @jest-environment jsdom
 *
 * Real-module tests (no pod-ops mock) for:
 *   - PodRegistry.removeAll — removal support so a host that persists the
 *     snapshot on change persists removals too
 *   - staleProviderRoots — the "OIDC issuer recorded as a pod" pollutant
 *     detector used by sol-pod._adoptLoginStorages after login
 */

import { getRegistry, _resetRegistries } from '../../core/pod-registry.js';
import { staleProviderRoots } from '../../core/pod-ops.js';

afterEach(() => _resetRegistries());

describe('PodRegistry — removeAll', () => {
  test('drops entries, notifies non-silently, and normalizes', () => {
    const reg = getRegistry('rm-test');
    const events = [];
    reg.subscribe((pods, silent) => events.push({ pods, silent }));
    reg.addAll(['https://idp.example/', 'https://alice.idp.example/']);
    expect(reg.removeAll(['https://idp.example'])).toBe(true);   // no trailing slash → normalized
    expect(reg.list()).toEqual(['https://alice.idp.example/']);
    expect(events.at(-1).silent).toBe(false);                    // persist-worthy
    const before = events.length;
    expect(reg.removeAll(['https://gone.example/'])).toBe(false); // no-op
    expect(events.length).toBe(before);                           // → no notify
  });

  test('remove() is the single-URL form', () => {
    const reg = getRegistry('rm-one');
    reg.addAll(['https://a.example/']);
    expect(reg.remove('https://a.example/')).toBe(true);
    expect(reg.list()).toEqual([]);
  });
});

describe('staleProviderRoots', () => {
  test('flags the issuer origin-root next to the real storage', () => {
    expect(staleProviderRoots(
      ['https://jeff.solidcommunity.net/'],
      ['http://localhost:8000/dk-pod/', 'https://solidcommunity.net/', 'https://jeff.solidcommunity.net/'],
    )).toEqual(['https://solidcommunity.net/']);
  });

  test('a pod that legitimately lives at an origin root is NOT stale', () => {
    expect(staleProviderRoots(
      ['https://solidcommunity.net/'],
      ['https://solidcommunity.net/'],
    )).toEqual([]);
  });

  test('localhost roots and unrelated domains are never stale', () => {
    expect(staleProviderRoots(
      ['https://jeff.solidcommunity.net/'],
      ['http://localhost:8000/', 'https://other.example/', 'https://solidweb.me/'],
    )).toEqual([]);
  });

  test('non-root entries on the provider domain are kept', () => {
    expect(staleProviderRoots(
      ['https://jeff.solidcommunity.net/'],
      ['https://solidcommunity.net/some-pod/'],
    )).toEqual([]);
  });
});
