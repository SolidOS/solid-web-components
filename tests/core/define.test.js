/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { define } from '../../core/define.js';

beforeEach(() => {
  delete window.__SolSuppressDefineWarn;
});

describe('define', () => {
  test('registers a new element', () => {
    class TestEl1 extends HTMLElement {}
    define('test-define-1', TestEl1);
    expect(customElements.get('test-define-1')).toBe(TestEl1);
  });

  test('does not throw when same class registered twice', () => {
    class TestEl2 extends HTMLElement {}
    define('test-define-2', TestEl2);
    expect(() => define('test-define-2', TestEl2)).not.toThrow();
  });

  test('keeps original when a different class tries the same tag', () => {
    class TestEl3a extends HTMLElement {}
    class TestEl3b extends HTMLElement {}
    define('test-define-3', TestEl3a);
    define('test-define-3', TestEl3b);
    expect(customElements.get('test-define-3')).toBe(TestEl3a);
  });

  test('warns when a different class tries the same tag', () => {
    class TestEl4a extends HTMLElement {}
    class TestEl4b extends HTMLElement {}
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    define('test-define-4', TestEl4a);
    define('test-define-4', TestEl4b);
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('<test-define-4> already registered')
    );
    spy.mockRestore();
  });

  test('does not warn when same class registered twice', () => {
    class TestEl5 extends HTMLElement {}
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    define('test-define-5', TestEl5);
    define('test-define-5', TestEl5);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  test('suppresses warning when __SolSuppressDefineWarn is set', () => {
    class TestEl6a extends HTMLElement {}
    class TestEl6b extends HTMLElement {}
    window.__SolSuppressDefineWarn = true;
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    define('test-define-6', TestEl6a);
    define('test-define-6', TestEl6b);
    expect(spy).not.toHaveBeenCalled();
    expect(customElements.get('test-define-6')).toBe(TestEl6a);
    spy.mockRestore();
  });

  test('no-op when customElements is undefined', () => {
    const saved = globalThis.customElements;
    delete globalThis.customElements;
    class TestEl7 extends HTMLElement {}
    expect(() => define('test-define-7', TestEl7)).not.toThrow();
    globalThis.customElements = saved;
  });

  test('multiple tags register independently', () => {
    class TestEl8a extends HTMLElement {}
    class TestEl8b extends HTMLElement {}
    define('test-define-8a', TestEl8a);
    define('test-define-8b', TestEl8b);
    expect(customElements.get('test-define-8a')).toBe(TestEl8a);
    expect(customElements.get('test-define-8b')).toBe(TestEl8b);
  });
});
