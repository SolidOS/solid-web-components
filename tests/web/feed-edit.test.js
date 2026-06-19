/**
 * Tests for web/utils/feed-edit.js — sol-feed's pure SPARQL-update builders
 * and the network senders (patchDoc / purgeFeed / recategorizeFeed) with an
 * injected fetch. No DOM is needed; these are pure string builders + fetch.
 */

import {
  NS, BIN_FRAG, binUriFor, lit,
  renameTopicEdit, recategorizeEdit, addFeedEdit, deleteToBinEdit,
  restoreEdit, reorderEdit, setPositionsEdit,
  mintFeedUri, mintTopicUri, addTopicEdit,
  patchBody, patchDoc, purgeBody, purgeFeed, recategorizeBody, recategorizeFeed,
} from '../../web/utils/feed-edit.js';

const FILE = 'https://pod.example/feeds.ttl';

// ── small helpers ────────────────────────────────────────────────────────────

describe('lit / binUriFor', () => {
  test('lit() produces a quoted Turtle string literal and escapes', () => {
    expect(lit('News')).toBe('"News"');
    expect(lit('a "quote"')).toBe('"a \\"quote\\""');
    expect(lit(42)).toBe('"42"');
  });

  test('binUriFor appends the reserved #Deleted fragment', () => {
    expect(BIN_FRAG).toBe('Deleted');
    expect(binUriFor(FILE)).toBe(`${FILE}#Deleted`);
  });

  test('NS carries the expected vocab base IRIs', () => {
    expect(NS.dcat).toBe('http://www.w3.org/ns/dcat#');
    expect(NS.skos).toBe('http://www.w3.org/2004/02/skos/core#');
  });
});

// ── pure builders → { deletes, inserts } ─────────────────────────────────────

describe('renameTopicEdit', () => {
  test('swaps the prefLabel literal', () => {
    const t = `${FILE}#News`;
    expect(renameTopicEdit(t, 'News', 'Headlines')).toEqual({
      deletes: [`<${t}> skos:prefLabel "News" .`],
      inserts: [`<${t}> skos:prefLabel "Headlines" .`],
    });
  });
});

describe('recategorizeEdit', () => {
  test('moves a feed from one theme to another', () => {
    const feed = `${FILE}#feed-x`;
    expect(recategorizeEdit(feed, `${FILE}#A`, `${FILE}#B`)).toEqual({
      deletes: [`<${feed}> dcat:theme <${FILE}#A> .`],
      inserts: [`<${feed}> dcat:theme <${FILE}#B> .`],
    });
  });

  test('is a no-op when from === to', () => {
    expect(recategorizeEdit('x', 'same', 'same')).toEqual({ deletes: [], inserts: [] });
  });
});

describe('addFeedEdit', () => {
  test('inserts the dataset triple (no catalog membership when none given)', () => {
    const feed = `${FILE}#feed-nyt`;
    const e = addFeedEdit(feed, { title: 'NY Times', url: 'https://nyt.example/rss', topicUri: `${FILE}#News` });
    expect(e.deletes).toEqual([]);
    expect(e.inserts).toHaveLength(1);
    expect(e.inserts[0]).toBe(
      `<${feed}> a dcat:Dataset, rss:channel ; ` +
      `dct:title "NY Times" ; dcat:accessURL <https://nyt.example/rss> ; dcat:theme <${FILE}#News> .`,
    );
  });

  test('adds catalog membership when catalogUri is supplied', () => {
    const feed = `${FILE}#feed-nyt`;
    const cat = `${FILE}#catalog`;
    const e = addFeedEdit(feed, { title: 'X', url: 'https://x.example/rss', topicUri: `${FILE}#T`, catalogUri: cat });
    expect(e.inserts).toHaveLength(2);
    expect(e.inserts[1]).toBe(`<${cat}> dcat:dataset <${feed}> .`);
  });
});

describe('deleteToBinEdit', () => {
  const feed = `${FILE}#feed-x`;
  const bin = binUriFor(FILE);

  test('re-themes to the bin and mints the bin concept by default', () => {
    const e = deleteToBinEdit(feed, `${FILE}#News`, bin);
    expect(e.deletes).toEqual([`<${feed}> dcat:theme <${FILE}#News> .`]);
    expect(e.inserts[0]).toBe(`<${feed}> dcat:theme <${bin}> .`);
    expect(e.inserts[1]).toBe(`<${bin}> a skos:Concept ; skos:prefLabel "Deleted" .`);
  });

  test('ensureBin:false omits minting the bin concept', () => {
    const e = deleteToBinEdit(feed, `${FILE}#News`, bin, { ensureBin: false });
    expect(e.inserts).toEqual([`<${feed}> dcat:theme <${bin}> .`]);
  });
});

describe('restoreEdit', () => {
  test('is a recategorize out of the bin to a chosen topic', () => {
    const feed = `${FILE}#feed-x`;
    const bin = binUriFor(FILE);
    expect(restoreEdit(feed, bin, `${FILE}#News`)).toEqual({
      deletes: [`<${feed}> dcat:theme <${bin}> .`],
      inserts: [`<${feed}> dcat:theme <${FILE}#News> .`],
    });
  });
});

describe('reorderEdit', () => {
  test('with no old position only inserts', () => {
    expect(reorderEdit('x', null, 3)).toEqual({
      deletes: [],
      inserts: ['<x> schema:position 3 .'],
    });
  });

  test('with an old position deletes it first', () => {
    expect(reorderEdit('x', 1, 4)).toEqual({
      deletes: ['<x> schema:position 1 .'],
      inserts: ['<x> schema:position 4 .'],
    });
  });
});

describe('setPositionsEdit', () => {
  test('renumbers 0..n-1, skipping items already at their index', () => {
    const order = ['a', 'b', 'c'];
    const oldPos = { a: 0, b: 5, c: 2 };
    const e = setPositionsEdit(order, oldPos);
    // a already at 0 → untouched; b 5→1; c 2→2 → untouched.
    expect(e.deletes).toEqual(['<b> schema:position 5 .']);
    expect(e.inserts).toEqual(['<b> schema:position 1 .']);
  });

  test('items with no prior position only get an insert', () => {
    const e = setPositionsEdit(['a', 'b'], {});
    expect(e.deletes).toEqual([]);
    expect(e.inserts).toEqual(['<a> schema:position 0 .', '<b> schema:position 1 .']);
  });
});

// ── slug / mint ──────────────────────────────────────────────────────────────

describe('mintFeedUri', () => {
  test('slugifies the title under a feed- prefix', () => {
    expect(mintFeedUri(FILE, 'NY Times!!', [])).toBe(`${FILE}#feed-ny-times`);
  });

  test('disambiguates against existing URIs', () => {
    const taken = [`${FILE}#feed-news`];
    expect(mintFeedUri(FILE, 'News', taken)).toBe(`${FILE}#feed-news-2`);
  });
});

describe('mintTopicUri', () => {
  test('makes a fragment-safe IRI from a label', () => {
    expect(mintTopicUri(FILE, 'World News')).toBe(`${FILE}#World_News`);
  });

  test('falls back to Topic for an unusable label and disambiguates', () => {
    expect(mintTopicUri(FILE, '!!!')).toBe(`${FILE}#Topic`);
    expect(mintTopicUri(FILE, 'News', [`${FILE}#News`])).toBe(`${FILE}#News_2`);
  });
});

describe('addTopicEdit', () => {
  test('mints a skos:Concept that is a top concept of the scheme', () => {
    const t = `${FILE}#Sports`;
    const scheme = `${FILE}#Feeds`;
    expect(addTopicEdit(t, 'Sports', scheme)).toEqual({
      deletes: [],
      inserts: [`<${t}> a skos:Concept ; skos:prefLabel "Sports" ; skos:topConceptOf <${scheme}> .`],
    });
  });

  test('omits the topConceptOf tail when no scheme is given', () => {
    const t = `${FILE}#Sports`;
    expect(addTopicEdit(t, 'Sports').inserts[0])
      .toBe(`<${t}> a skos:Concept ; skos:prefLabel "Sports" .`);
  });
});

// ── serialise (patchBody / purgeBody / recategorizeBody) ─────────────────────

describe('patchBody', () => {
  test('emits PREFIX lines plus DELETE DATA and INSERT DATA blocks', () => {
    const body = patchBody({
      deletes: ['<a> dcat:theme <b> .'],
      inserts: ['<a> dcat:theme <c> .'],
    });
    expect(body).toContain('PREFIX dcat: <http://www.w3.org/ns/dcat#>');
    expect(body).toContain('DELETE DATA {\n  <a> dcat:theme <b> .\n}');
    expect(body).toContain('INSERT DATA {\n  <a> dcat:theme <c> .\n}');
    // the two blocks are joined by " ;"
    expect(body).toContain('} ;\nINSERT DATA {');
  });

  test('omits the DELETE DATA block entirely when there is nothing to delete', () => {
    const body = patchBody({ inserts: ['<a> dcat:theme <c> .'] });
    expect(body).not.toContain('DELETE DATA');
    expect(body).toContain('INSERT DATA {');
  });
});

describe('purgeBody', () => {
  test('DELETE … WHERE over every predicate, plus catalog membership', () => {
    const feed = `${FILE}#feed-x`;
    const cat = `${FILE}#catalog`;
    const body = purgeBody(feed, cat);
    expect(body).toContain(`DELETE {\n  <${feed}> ?p ?o .`);
    expect(body).toContain(`<${cat}> dcat:dataset <${feed}> .`);
    expect(body).toContain(`WHERE {\n  <${feed}> ?p ?o .\n}`);
  });

  test('skips the catalog line when no catalogUri', () => {
    const feed = `${FILE}#feed-x`;
    expect(purgeBody(feed)).not.toContain('dcat:dataset');
  });
});

describe('recategorizeBody', () => {
  test('drops any existing theme then inserts the new one', () => {
    const feed = `${FILE}#feed-x`;
    const body = recategorizeBody(feed, `${FILE}#News`);
    expect(body).toContain(`DELETE { <${feed}> dcat:theme ?t . } WHERE { <${feed}> dcat:theme ?t . }`);
    expect(body).toContain(`INSERT DATA { <${feed}> dcat:theme <${FILE}#News> . }`);
  });
});

// ── senders (injected fetch) ─────────────────────────────────────────────────

/** A fetch stub that records its calls and returns a configurable response. */
function fetchStub({ ok = true, status = 200 } = {}) {
  const calls = [];
  const fn = (url, init) => { calls.push({ url, init }); return Promise.resolve({ ok, status }); };
  fn.calls = calls;
  return fn;
}

describe('patchDoc', () => {
  test('PATCHes a sparql-update body to the file', async () => {
    const f = fetchStub();
    await patchDoc(FILE, { inserts: ['<a> dcat:theme <c> .'] }, { fetchImpl: f });
    expect(f.calls).toHaveLength(1);
    expect(f.calls[0].url).toBe(FILE);
    expect(f.calls[0].init.method).toBe('PATCH');
    expect(f.calls[0].init.headers['Content-Type']).toBe('application/sparql-update');
    expect(f.calls[0].init.body).toContain('INSERT DATA {');
  });

  test('is a no-op for an empty edit (no fetch)', async () => {
    const f = fetchStub();
    await patchDoc(FILE, { deletes: [], inserts: [] }, { fetchImpl: f });
    await patchDoc(FILE, null, { fetchImpl: f });
    expect(f.calls).toHaveLength(0);
  });

  test('rejects with a helpful message on a non-ok response', async () => {
    const f = fetchStub({ ok: false, status: 403 });
    await expect(patchDoc(FILE, { inserts: ['<a> <b> <c> .'] }, { fetchImpl: f }))
      .rejects.toThrow(/HTTP 403/);
  });
});

describe('purgeFeed', () => {
  test('PATCHes a purge body and throws on failure', async () => {
    const ok = fetchStub();
    await purgeFeed(FILE, `${FILE}#feed-x`, { fetchImpl: ok });
    expect(ok.calls[0].init.body).toContain('DELETE {');

    const bad = fetchStub({ ok: false, status: 500 });
    await expect(purgeFeed(FILE, `${FILE}#feed-x`, { fetchImpl: bad }))
      .rejects.toThrow(/Permanent delete failed/);
  });
});

describe('recategorizeFeed', () => {
  test('PATCHes a recategorize body and throws on failure', async () => {
    const ok = fetchStub();
    await recategorizeFeed(FILE, `${FILE}#feed-x`, `${FILE}#News`, { fetchImpl: ok });
    expect(ok.calls[0].init.body).toContain('INSERT DATA { ');

    const bad = fetchStub({ ok: false, status: 401 });
    await expect(recategorizeFeed(FILE, `${FILE}#feed-x`, `${FILE}#News`, { fetchImpl: bad }))
      .rejects.toThrow(/Save failed/);
  });
});
