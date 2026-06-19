/**
 * @jest-environment jsdom
 *
 * Tests for <sol-weather> — the compact current-conditions card backed by
 * Open-Meteo. The two network seams (geocoding + forecast) are driven by a
 * MOCKED global.fetch that returns canned JSON matching the real Open-Meteo
 * response shapes `_render` parses:
 *
 *   forecast: { current_weather: {time, temperature, weathercode},
 *               hourly: {time[], precipitation_probability[], temperature_2m[]} }
 *   geocode:  { results: [{latitude, longitude, ...}] }
 *
 * We assert the rendered DOM (icon / place / temp / desc / rain) plus the
 * units attribute (metric/imperial/both, exercising the °C→°F conversion),
 * the weather-code → icon/label mapping, and error / empty-response handling.
 * The RDF `source=` config path is NOT exercised here (it needs live rdflib).
 */

window.__SolSuppressDefineWarn = true;

// ── fetch mock ────────────────────────────────────────────────────────────────

/** A forecast payload whose current_weather.time lines up with hourly[1]. */
function forecastPayload({ code = 0, tempC = 20, prob = 40 } = {}) {
  return {
    current_weather: { time: '2025-06-19T12:00', temperature: tempC, weathercode: code },
    hourly: {
      time: ['2025-06-19T11:00', '2025-06-19T12:00', '2025-06-19T13:00'],
      temperature_2m: [tempC - 1, tempC, tempC + 1],
      precipitation_probability: [10, prob, 30],
    },
  };
}

/**
 * Route fetch by URL: geocoding endpoint → geo payload, forecast endpoint →
 * weather payload. Records the URLs requested. Either payload may be replaced
 * to simulate empty/error responses.
 */
function mockFetch({ geo, weather, geoOk = true, weatherOk = true } = {}) {
  const urls = [];
  global.fetch = (url) => {
    urls.push(url);
    if (String(url).includes('geocoding-api')) {
      return Promise.resolve({
        ok: geoOk, status: geoOk ? 200 : 500,
        json: () => Promise.resolve(geo ?? { results: [{ latitude: 45.52, longitude: -122.68 }] }),
      });
    }
    return Promise.resolve({
      ok: weatherOk, status: weatherOk ? 200 : 500,
      json: () => Promise.resolve(weather ?? forecastPayload()),
    });
  };
  return urls;
}

async function settle() { await new Promise(r => setTimeout(r, 20)); }

beforeAll(async () => {
  await import('../../web/sol-weather.js');
});

beforeEach(() => { mockFetch(); });
afterEach(() => { document.body.innerHTML = ''; });

/** Mount a <sol-weather> and wait for the first fetch+render to settle. */
async function mount(attrs = 'lat="45.52" lon="-122.68"') {
  document.body.innerHTML = `<sol-weather id="w" ${attrs}></sol-weather>`;
  const el = document.getElementById('w');
  await settle();
  return el;
}

const part = (el, sel) => el.shadowRoot.querySelector(sel);

// ── registration ──────────────────────────────────────────────────────────────

describe('registration', () => {
  test('registers the custom element', () => {
    expect(customElements.get('sol-weather')).toBeDefined();
  });

  test('builds the card scaffold in the shadow root', async () => {
    const el = await mount();
    expect(part(el, '.card')).not.toBeNull();
    expect(part(el, '.icon')).not.toBeNull();
    expect(part(el, '.place')).not.toBeNull();
    expect(part(el, '.temp')).not.toBeNull();
    expect(part(el, '.desc')).not.toBeNull();
    expect(part(el, '.stat')).not.toBeNull();
  });
});

// ── render path (mocked forecast fetch) ───────────────────────────────────────

describe('render — forecast fetch', () => {
  test('renders icon, place, temp, desc and rain stat from the payload', async () => {
    mockFetch({ weather: forecastPayload({ code: 0, tempC: 20, prob: 40 }) });
    const el = await mount();
    expect(part(el, '.icon').textContent).toBe('☀️');          // code 0 → clear
    expect(part(el, '.desc').textContent).toBe('Clear sky');
    expect(part(el, '.temp').textContent).toBe('20.0°C / 68.0°F');
    expect(part(el, '.place').textContent).toBe('45.52, -122.68'); // coords fallback
    expect(part(el, '.stat').textContent).toBe('rain 40%');
  });

  test('maps a different weather code to its icon + label', async () => {
    mockFetch({ weather: forecastPayload({ code: 95 }) });       // thunderstorm
    const el = await mount();
    expect(part(el, '.icon').textContent).toBe('⛈️');
    expect(part(el, '.desc').textContent).toBe('Thunderstorm');
  });

  test('an unknown weather code falls back to Unknown / ❔', async () => {
    mockFetch({ weather: forecastPayload({ code: 9999 }) });
    const el = await mount();
    expect(part(el, '.icon').textContent).toBe('❔');
    expect(part(el, '.desc').textContent).toBe('Unknown');
  });

  test('uses the place attribute for the label when given', async () => {
    mockFetch({
      geo: { results: [{ latitude: 45.52, longitude: -122.68 }] },
      weather: forecastPayload(),
    });
    const el = await mount('place="Portland, OR"');
    await settle();                                              // geocode + forecast
    expect(part(el, '.place').textContent).toBe('Portland, OR');
  });

  test('geocodes a bare place name before fetching weather', async () => {
    const urls = mockFetch({
      geo: { results: [{ latitude: 1.5, longitude: 2.5 }] },
      weather: forecastPayload(),
    });
    await mount('place="Nowhere"');
    await settle();
    expect(urls.some(u => String(u).includes('geocoding-api'))).toBe(true);
    expect(urls.some(u => String(u).includes('api.open-meteo.com/v1/forecast'))).toBe(true);
  });
});

// ── units attribute (°C ⇄ °F) ─────────────────────────────────────────────────

describe('units attribute', () => {
  test('metric shows only °C', async () => {
    mockFetch({ weather: forecastPayload({ tempC: 10 }) });
    const el = await mount('lat="1" lon="2" units="metric"');
    expect(part(el, '.temp').textContent).toBe('10.0°C');
  });

  test('imperial converts °C → °F', async () => {
    mockFetch({ weather: forecastPayload({ tempC: 100 }) });
    const el = await mount('lat="1" lon="2" units="imperial"');
    expect(part(el, '.temp').textContent).toBe('212.0°F');      // 100°C → 212°F
  });

  test('both (default) shows °C / °F together', async () => {
    mockFetch({ weather: forecastPayload({ tempC: 0 }) });
    const el = await mount('lat="1" lon="2"');
    expect(part(el, '.temp').textContent).toBe('0.0°C / 32.0°F');
  });
});

// ── error / empty handling ────────────────────────────────────────────────────

describe('error & empty handling', () => {
  test('a non-ok forecast response hides the card (no stale numbers)', async () => {
    mockFetch({ weatherOk: false });
    const el = await mount('lat="1" lon="2"');
    expect(el.shadowRoot.querySelector('.card').style.display).toBe('none');
  });

  test('an empty geocode result (place not found) hides the card', async () => {
    mockFetch({ geo: { results: [] } });
    const el = await mount('place="Atlantis"');
    await settle();
    expect(el.shadowRoot.querySelector('.card').style.display).toBe('none');
  });

  test('missing lat/lon and no place hides the card', async () => {
    const el = await mount('');                                  // no coords, no place
    expect(el.shadowRoot.querySelector('.card').style.display).toBe('none');
  });

  test('a missing precipitation array yields an empty rain stat', async () => {
    mockFetch({
      weather: {
        current_weather: { time: '2025-06-19T12:00', temperature: 15, weathercode: 3 },
        hourly: { time: ['2025-06-19T12:00'] },                 // no precip array
      },
    });
    const el = await mount('lat="1" lon="2"');
    expect(part(el, '.stat').textContent).toBe('');
    expect(part(el, '.desc').textContent).toBe('Overcast');     // code 3 still renders
  });
});
