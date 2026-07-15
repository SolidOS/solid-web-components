/**
 * @jest-environment jsdom
 *
 * core/manifest.js — the ci-free reader of dist/sol-components.manifest.json.
 * Meta contract must match what component-interop exposes as
 * manifest.meta[tag]: verbatim label/icon/title/description/params,
 * absolutized shape/help, data normalized to an array of absolute URLs.
 */
import {
  getManifest, getComponentMeta, packageRoot, _resetManifestCache,
} from '../../core/manifest.js';

const RAW = {
  components: {
    'sol-weather': {
      label: 'Weather', icon: '🌤',
      description: 'Weather widget.',
      shape: '../shapes/weather-settings.shacl',
      data: '../data/weather-settings.ttl',
    },
    'sol-time': { label: 'Clock', data: ['../data/time-settings.ttl'] },
    'sol-menu': 'web/sol-menu.js',       // string form — module only, no meta
  },
};

function mockFetch(status = 200, body = RAW) {
  const fn = async (url) => {
    fn.calls.push(url);
    return { ok: status === 200, status, json: async () => body };
  };
  fn.calls = [];
  return fn;
}

beforeEach(() => {
  _resetManifestCache();
  document.head.innerHTML = '';
});

test('meta matches the ci contract: verbatim fields + absolutized URLs', async () => {
  const fetcher = mockFetch();
  const { url, meta } = await getManifest({ base: 'http://localhost/pkg/', fetcher });
  expect(url).toBe('http://localhost/pkg/dist/sol-components.manifest.json');
  expect(fetcher.calls).toEqual([url]);

  const w = meta['sol-weather'];
  expect(w.label).toBe('Weather');
  expect(w.icon).toBe('🌤');
  expect(w.shape).toBe('http://localhost/pkg/shapes/weather-settings.shacl');
  expect(w.data).toEqual(['http://localhost/pkg/data/weather-settings.ttl']);

  expect(meta['sol-time'].data).toEqual(['http://localhost/pkg/data/time-settings.ttl']);
  expect(meta['sol-menu']).toBeUndefined();          // string-form entry: no meta
});

test('getComponentMeta returns one entry, null for unknown, null on fetch failure', async () => {
  expect(await getComponentMeta('sol-weather', { base: 'http://x/p/', fetcher: mockFetch() }))
    .toMatchObject({ label: 'Weather' });
  expect(await getComponentMeta('no-such', {})).toBeNull();   // cached manifest, unknown tag
  _resetManifestCache();
  expect(await getComponentMeta('sol-weather', { base: 'http://x/p/', fetcher: mockFetch(404) }))
    .toBeNull();
});

test('manifest is fetched once per page (cached)', async () => {
  const fetcher = mockFetch();
  await getManifest({ base: 'http://x/p/', fetcher });
  await getManifest({ base: 'http://x/p/', fetcher });
  expect(fetcher.calls).toHaveLength(1);
});

test('a failed fetch is not cached — the next call retries', async () => {
  const bad = mockFetch(500);
  await expect(getManifest({ base: 'http://x/p/', fetcher: bad })).rejects.toThrow('500');
  await new Promise((r) => setTimeout(r, 0));        // let the cache-reset land
  const good = mockFetch();
  const { meta } = await getManifest({ base: 'http://x/p/', fetcher: good });
  expect(meta['sol-weather'].label).toBe('Weather');
});

test('package root comes from an import map when one maps the package', () => {
  const tag = document.createElement('script');
  tag.type = 'importmap';
  tag.textContent = JSON.stringify({
    imports: { 'sol-components/core/': 'http://cdn.example/sol-components/core/' },
  });
  document.head.appendChild(tag);
  expect(packageRoot().href).toBe('http://cdn.example/sol-components/');
});

test('the sol-components/ (web) prefix also locates the root', () => {
  const tag = document.createElement('script');
  tag.type = 'importmap';
  tag.textContent = JSON.stringify({
    imports: { 'sol-components/': 'http://cdn.example/sol-components/web/' },
  });
  document.head.appendChild(tag);
  expect(packageRoot().href).toBe('http://cdn.example/sol-components/');
});

test('explicit base wins over the import map', () => {
  const tag = document.createElement('script');
  tag.type = 'importmap';
  tag.textContent = JSON.stringify({ imports: { 'sol-components/': 'http://cdn.example/x/web/' } });
  document.head.appendChild(tag);
  expect(packageRoot('http://mine.example/pkg/').href).toBe('http://mine.example/pkg/');
});
