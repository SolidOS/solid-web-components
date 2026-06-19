/**
 * @jest-environment jsdom
 *
 * Tests for <sol-gallery> — the source-blind image grid + lightbox.
 *
 * The gallery is fed pages of `schema:ImageObject` records as rdflib stores and
 * renders a thumbnail grid, emitting `load-more` / `item-opened`. We build those
 * stores with the shared `addImageItem` writer (over the mocked rdflib), so the
 * gallery reads exactly the bytes a real provider would write — no network and
 * no Turtle-parser sugar the mock can't handle. IntersectionObserver isn't in
 * jsdom, so the sentinel falls back to a "Load more" button (the
 * no-IntersectionObserver path the component declares); we drive that button to
 * exercise paging deterministically.
 */

window.__SolSuppressDefineWarn = true;

let SolGallery, addImageItem, rdfGraph;

beforeAll(async () => {
  // jsdom has no IntersectionObserver — force the button fallback in _armSentinel.
  delete window.IntersectionObserver;
  ({ SolGallery } = await import('../../web/sol-gallery.js'));
  ({ addImageItem } = await import('../../web/utils/contract.js'));
  const { rdf } = await import('../../core/rdf.js');
  rdfGraph = () => rdf.graph();
});

afterEach(() => { document.body.innerHTML = ''; });

/** A store carrying the given image records, written exactly as a provider would. */
function pageStore(items) {
  const store = rdfGraph();
  for (const it of items) addImageItem(store, it);
  return store;
}

function mountGallery() {
  document.body.innerHTML = '<sol-gallery id="g"></sol-gallery>';
  return document.getElementById('g');
}

const grid = (g) => g.shadowRoot.querySelector('.gallery-grid');
const thumbs = (g) => Array.from(g.shadowRoot.querySelectorAll('.gallery-thumb'));
const status = (g) => g.shadowRoot.querySelector('.gallery-status');
const lightbox = (g) => g.shadowRoot.querySelector('.gallery-lightbox');

const IMG_A = {
  iri: 'https://commons.example/File:A', thumb: 'https://img.example/a-thumb.jpg',
  full: 'https://img.example/a-full.jpg', width: 120, height: 90,
  caption: 'Sunrise', author: 'Ada', license: 'CC0',
  detailUrl: 'https://commons.example/File:A', position: 1,
};
const IMG_B = {
  iri: 'https://commons.example/File:B', thumb: 'https://img.example/b-thumb.jpg',
  full: 'https://img.example/b-full.jpg', caption: 'Moonset', position: 2,
};

// ── registration ──────────────────────────────────────────────────────────────

describe('registration', () => {
  test('defines the <sol-gallery> custom element', () => {
    expect(customElements.get('sol-gallery')).toBe(SolGallery);
  });

  test('builds its shadow DOM scaffold on connect (grid, status, lightbox)', () => {
    const g = mountGallery();
    expect(grid(g)).not.toBeNull();
    expect(status(g)).not.toBeNull();
    expect(status(g).getAttribute('aria-live')).toBe('polite');
    expect(lightbox(g)).not.toBeNull();
    expect(lightbox(g).hidden).toBe(true);
    // Starts with the empty placeholder, not images.
    expect(grid(g).querySelector('.gallery-empty')).not.toBeNull();
    expect(thumbs(g)).toHaveLength(0);
  });
});

// ── display contract: clear / add / end ───────────────────────────────────────

describe('display contract', () => {
  test('clear() shows a loading status and drops the placeholder', () => {
    const g = mountGallery();
    g.clear();
    expect(status(g).textContent).toBe('Loading images…');
    expect(grid(g).querySelector('.gallery-empty')).toBeNull();
    expect(thumbs(g)).toHaveLength(0);
  });

  test('add() renders one thumbnail button per record, in position order', () => {
    const g = mountGallery();
    g.clear();
    g.add(pageStore([IMG_A, IMG_B]));

    const ts = thumbs(g);
    expect(ts).toHaveLength(2);
    // position 1 (Sunrise) precedes position 2 (Moonset).
    expect(ts[0].getAttribute('aria-label')).toBe('Sunrise');
    expect(ts[1].getAttribute('aria-label')).toBe('Moonset');
    expect(ts.map(b => b.dataset.index)).toEqual(['0', '1']);
    expect(status(g).textContent).toBe('2 images');
  });

  test('each thumb carries the lazy <img> with thumb src, alt and dimensions', () => {
    const g = mountGallery();
    g.clear();
    g.add(pageStore([IMG_A]));

    const img = thumbs(g)[0].querySelector('img');
    expect(img.getAttribute('src')).toBe('https://img.example/a-thumb.jpg');
    expect(img.getAttribute('alt')).toBe('Sunrise');
    expect(img.loading).toBe('lazy');        // set as a property by _thumb
    expect(img.width).toBe(120);
    expect(img.height).toBe(90);
  });

  test('add() appends a second page after the first (paging accumulates)', () => {
    const g = mountGallery();
    g.clear();
    g.add(pageStore([IMG_A]));
    expect(thumbs(g)).toHaveLength(1);
    g.add(pageStore([IMG_B]));
    expect(thumbs(g)).toHaveLength(2);
    expect(status(g).textContent).toBe('2 images');
    // Indices keep climbing across pages.
    expect(thumbs(g)[1].dataset.index).toBe('1');
  });

  test('end() with items shows the count; with none shows the empty notice', () => {
    const withItems = mountGallery();
    withItems.clear();
    withItems.add(pageStore([IMG_A]));
    withItems.end();
    expect(status(withItems).textContent).toBe('1 image'); // singular
    expect(grid(withItems).querySelector('.gallery-empty')).toBeNull();

    const empty = mountGallery();
    empty.clear();
    empty.add(pageStore([]));   // a page that turned out empty
    empty.end();
    expect(grid(empty).querySelector('.gallery-empty')).not.toBeNull();
    expect(grid(empty).querySelector('.gallery-empty').textContent)
      .toMatch(/no images/i);
  });
});

// ── lazy paging: load-more ────────────────────────────────────────────────────

describe('lazy paging', () => {
  test('a page arming the sentinel offers a "Load more" button (no IO)', () => {
    const g = mountGallery();
    g.clear();
    g.add(pageStore([IMG_A]));
    expect(g.shadowRoot.querySelector('.gallery-more')).not.toBeNull();
  });

  test('clicking "Load more" emits a single load-more event', () => {
    const g = mountGallery();
    const seen = [];
    g.addEventListener('load-more', () => seen.push(1));
    g.clear();
    g.add(pageStore([IMG_A]));

    const more = g.shadowRoot.querySelector('.gallery-more');
    more.click();
    more.click();   // re-click before a page lands → no second event (_awaitingPage)
    expect(seen).toHaveLength(1);
  });

  test('the next add() re-arms paging so another load-more can fire', () => {
    const g = mountGallery();
    const seen = [];
    g.addEventListener('load-more', () => seen.push(1));
    g.clear();
    g.add(pageStore([IMG_A]));
    g.shadowRoot.querySelector('.gallery-more').click();
    expect(seen).toHaveLength(1);

    g.add(pageStore([IMG_B]));            // host answered; _awaitingPage cleared
    g.shadowRoot.querySelector('.gallery-more').click();
    expect(seen).toHaveLength(2);
  });

  test('end() removes the load-more button (no further pages)', () => {
    const g = mountGallery();
    g.clear();
    g.add(pageStore([IMG_A]));
    expect(g.shadowRoot.querySelector('.gallery-more')).not.toBeNull();
    g.end();
    expect(g.shadowRoot.querySelector('.gallery-more')).toBeNull();
  });
});

// ── lightbox + item-opened ────────────────────────────────────────────────────

describe('lightbox', () => {
  test('clicking a thumb opens the lightbox at that image and emits item-opened', () => {
    const g = mountGallery();
    const opened = [];
    g.addEventListener('item-opened', (e) => opened.push(e.detail.iri));
    g.clear();
    g.add(pageStore([IMG_A, IMG_B]));

    thumbs(g)[1].click();   // open Moonset (index 1)
    const lb = lightbox(g);
    expect(lb.hidden).toBe(false);
    expect(lb.querySelector('img').getAttribute('src'))
      .toBe('https://img.example/b-full.jpg');   // full-res, not thumb
    expect(opened).toEqual(['https://commons.example/File:B']);
  });

  test('the caption joins caption · author · license and links to the detail page', () => {
    const g = mountGallery();
    g.clear();
    g.add(pageStore([IMG_A]));
    g.openLightbox(0);

    const cap = lightbox(g).querySelector('.gallery-lb-caption');
    expect(cap.textContent).toContain('Sunrise · Ada · CC0');
    const link = cap.querySelector('a');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('https://commons.example/File:A');
    expect(link.getAttribute('rel')).toBe('noopener');
  });

  test('prev/next nav is hidden for a single image, shown for many', () => {
    const single = mountGallery();
    single.clear();
    single.add(pageStore([IMG_A]));
    single.openLightbox(0);
    expect(lightbox(single).querySelector('.gallery-lb-prev').style.display).toBe('none');

    const many = mountGallery();
    many.clear();
    many.add(pageStore([IMG_A, IMG_B]));
    many.openLightbox(0);
    expect(lightbox(many).querySelector('.gallery-lb-next').style.display).toBe('');
  });

  test('stepLightbox wraps around the items modulo their count', () => {
    const g = mountGallery();
    g.clear();
    g.add(pageStore([IMG_A, IMG_B]));
    g.openLightbox(0);
    g.stepLightbox(-1);   // wrap backward from 0 → last
    expect(lightbox(g).querySelector('img').getAttribute('src'))
      .toBe('https://img.example/b-full.jpg');
    g.stepLightbox(1);    // forward → back to first
    expect(lightbox(g).querySelector('img').getAttribute('src'))
      .toBe('https://img.example/a-full.jpg');
  });

  test('Escape closes the lightbox and clears the image src', () => {
    const g = mountGallery();
    g.clear();
    g.add(pageStore([IMG_A]));
    g.openLightbox(0);
    expect(lightbox(g).hidden).toBe(false);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(lightbox(g).hidden).toBe(true);
    expect(lightbox(g).querySelector('img').hasAttribute('src')).toBe(false);
  });

  test('clicking the backdrop (not a child) closes; clicking the image does not', () => {
    const g = mountGallery();
    g.clear();
    g.add(pageStore([IMG_A]));
    g.openLightbox(0);
    const lb = lightbox(g);

    // Click on the image — should NOT close (event target is the <img>).
    lb.querySelector('img').click();
    expect(lb.hidden).toBe(false);

    // Click on the backdrop itself — closes.
    lb.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(lb.hidden).toBe(true);
  });
});

// ── status ────────────────────────────────────────────────────────────────────

describe('setStatus', () => {
  test('toggles the data-error flag', () => {
    const g = mountGallery();
    g.setStatus('Boom', true);
    expect(status(g).textContent).toBe('Boom');
    expect(status(g).hasAttribute('data-error')).toBe(true);
    g.setStatus('ok');
    expect(status(g).hasAttribute('data-error')).toBe(false);
  });
});
