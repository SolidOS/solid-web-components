// Focused check for the redesigned threePanel feed-management editor:
// full-panel open/close, no checkboxes / no click-to-toggle chips, the
// "Add a feed" drop panel (paste/type a URL → Name+Topic confirm), and
// the topic-card grid. Run from project root:
//   node claude/smoke-tests/feed-editor-check.mjs
import { JSDOM } from 'jsdom';

const RSS = `<?xml version="1.0"?><rss version="2.0"><channel><title>Demo</title>
  <item><title>Story</title><link>http://example.org/a</link>
  <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate></item></channel></rss>`;

const TTL = `
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix dct:  <http://purl.org/dc/terms/> .
@prefix dcat: <http://www.w3.org/ns/dcat#> .
@prefix rss:  <http://purl.org/rss/1.0/> .
<#Feeds> a skos:ConceptScheme ; skos:prefLabel "Feeds" .
<#News>  a skos:Concept ; skos:prefLabel "News" ; skos:topConceptOf <#Feeds> .
<#Tech>  a skos:Concept ; skos:prefLabel "Tech" ; skos:topConceptOf <#Feeds> .
<#Empty> a skos:Concept ; skos:prefLabel "Empty" ; skos:topConceptOf <#Feeds> .
<http://feed/a.xml> a dcat:Dataset, rss:channel ; dct:title "Feed A" ; dcat:theme <#News> .
<http://feed/b.xml> a dcat:Dataset, rss:channel ; dct:title "Feed B" ; dcat:theme <#Tech> .
<#catalog> a dcat:Catalog ; dcat:dataset <http://feed/a.xml>, <http://feed/b.xml> .
`;

const dom = new JSDOM('<!doctype html><body></body>', {
  url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
});
const { window } = dom;
for (const k of ['window', 'document', 'HTMLElement', 'customElements',
                 'DOMParser', 'CSSStyleSheet', 'Node', 'FormData', 'URL'])
  try { globalThis[k] = window[k]; } catch {}
for (const k of ['localStorage', 'location'])
  Object.defineProperty(globalThis, k, { value: window[k], configurable: true, writable: true });

const patches = [];   // bodies of any PATCH (sparql-update) the editor sends
globalThis.fetch = window.fetch = async (url, opts = {}) => {
  if ((opts.method || 'GET').toUpperCase() === 'PATCH') {
    patches.push(String(opts.body || ''));
    return { ok: true, status: 200, headers: { get: () => 'text/turtle' }, text: async () => '' };
  }
  const u = String(url);
  const isTtl = u.includes('.ttl');
  return { ok: true, status: 200,
    headers: { get: () => (isTtl ? 'text/turtle' : 'application/rss+xml') },
    text: async () => (isTtl ? TTL : RSS) };
};
window.open = () => ({ closed: false, focus() {}, location: {} });

const fail = m => { console.error('FAIL:', m); process.exit(1); };
const ok = m => console.log('ok -', m);
const settle = () => new Promise(r => setTimeout(r, 80));
const click = el => el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));

await import('../../web/sol-feed.js');

const host = window.document.createElement('div');
host.innerHTML = '<sol-feed view="threePanel" editable source="feeds.ttl#Feeds"></sol-feed>';
window.document.body.appendChild(host);
await settle();
const el = host.firstElementChild;
const sr = el.shadowRoot;

// 1. No checkboxes; chips are buttons with no click handler toggling.
if (sr.querySelectorAll('.feed-picker input[type=checkbox]').length)
  fail('expected no checkboxes in the picker');
ok('no checkboxes');

const chips = sr.querySelectorAll('.feed-chip');
if (!chips.length) fail('expected feed chips');
// A feed shown on the bar is removed (hidden) from its topic, not highlighted.
const barBtn = sr.querySelector('.feed-source-btn');
if (!barBtn) fail('expected a feed on the bar');
const shownUrl = barBtn.dataset.feedUrl;
const shownChip = sr.querySelector(`.feed-chip[data-feed-url="${shownUrl}"]`);
if (!shownChip) fail('expected a chip element for the shown feed');
if (!shownChip.hidden) fail('a feed on the bar should be hidden from its topic');
if ([...chips].some(c => c.classList.contains('active')))
  fail('no chip should use the old .active (green lozenge) state');
ok('feed on the bar is hidden from its topic (no green lozenge)');
const visibleChip = [...chips].find(c => !c.hidden);
if (!visibleChip) fail('expected at least one visible (unselected) chip');
const wasHidden = visibleChip.hidden;
click(visibleChip); await settle();
if (visibleChip.hidden !== wasHidden) fail('chip click should NOT toggle (drag-only)');
ok('unselected feeds stay visible; chips are drag-only');

// 2. Panel grid present with topic cards.
if (!sr.querySelector('.feed-panel-grid')) fail('expected .feed-panel-grid');
if (sr.querySelectorAll('.feed-panel-grid .feed-topic').length < 2)
  fail('expected topic cards inside the grid');
ok('panel grid present');

// 3. Full-panel open/close via gear + ✕.
const root = sr.querySelector('.sol-feed');
const gear = sr.querySelector('.feed-picker-toggle');
const picker = sr.querySelector('.feed-picker');
if (root.classList.contains('editor-open')) fail('editor should start closed');
if (!picker.hidden) fail('picker should start hidden');
click(gear); await settle();
if (!root.classList.contains('editor-open') || picker.hidden)
  fail('gear should open the full-panel editor');
ok('gear opens full-panel editor (articles hidden via .editor-open)');
const close = sr.querySelector('.feed-editor-close');
if (!close) fail('expected ✕ close button');
click(close); await settle();
if (root.classList.contains('editor-open') || !picker.hidden)
  fail('✕ should close the editor');
ok('✕ closes the editor and restores articles');

// 4. "Add a feed" drop panel + "Add topic" form, flush in the panel grid.
const legends = [...sr.querySelectorAll('.feed-add-form legend')].map(l => l.textContent);
if (!legends.includes('Add a feed')) fail('expected "Add a feed" panel');
if (!legends.includes('Add topic')) fail('"Add topic" form should remain');
if (sr.querySelectorAll('.feed-panel-grid .feed-add-form').length < 2)
  fail('add panels should sit inside the panel grid');
if (!sr.querySelector('.feed-panel-grid .feed-trash'))
  fail('trash should sit inside the panel grid');
ok('add panels: "Add a feed" + "Add topic" + trash, all in the grid');

// 5. Type a URL + Enter → confirm reveals with a guessed name + topic select.
click(gear); await settle();                       // reopen editor
const input = sr.querySelector('.feed-drop-input');
const confirmEl = sr.querySelector('.feed-drop-confirm');
if (!confirmEl.hidden === false) { /* should be hidden initially */ }
if (!confirmEl.hidden) fail('confirm should be hidden before a URL is captured');
input.value = 'https://www.example.org/rss.xml';
input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
await settle();
if (confirmEl.hidden) fail('Enter on a URL should reveal the Name+Topic confirm');
const nameVal = sr.querySelector('.feed-drop-confirm input[name="label"]').value;
if (nameVal !== 'example.org') fail(`expected guessed name "example.org", got "${nameVal}"`);
const opts = sr.querySelectorAll('.feed-drop-confirm select[name="topic"] option').length;
if (opts < 2) fail('topic select should be populated');
ok(`URL captured → confirm shown (name="${nameVal}", ${opts} topic options)`);

// 6. Topic legends carry a click-to-rename name + a ✕ that deletes only an
//    EMPTY topic (the ✕ is disabled while the topic still holds feeds).
const legendOf = (name) => [...sr.querySelectorAll('.feed-topic > legend')]
  .find(l => l.querySelector('.feed-topic-name')?.textContent === name);
if (!legendOf('News') || !legendOf('Empty'))
  fail('expected editable topic legends with click-to-rename names');
const newsDel = legendOf('News').querySelector('.feed-topic-del');
const emptyDel = legendOf('Empty').querySelector('.feed-topic-del');
if (!newsDel || !emptyDel) fail('expected a ✕ delete control on each topic');
if (!newsDel.disabled) fail('✕ should be disabled on a topic that still has feeds');
if (emptyDel.disabled) fail('✕ should be enabled on an empty topic');
ok('topic ✕: disabled when the topic has feeds, enabled when empty');

// rename: click the name → inline input → Enter PATCHes renameTopicEdit
patches.length = 0;
click(legendOf('News').querySelector('.feed-topic-name')); await settle();
const renameInput = sr.querySelector('.feed-topic-rename');
if (!renameInput) fail('clicking a topic name should reveal an inline rename input');
renameInput.value = 'World News';
renameInput.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
await settle();
if (!patches.some(b => b.includes('DELETE DATA') && b.includes('skos:prefLabel "News"') && b.includes('skos:prefLabel "World News"')))
  fail('renaming a topic should PATCH renameTopicEdit (swap skos:prefLabel)');
ok('topic rename PATCHes renameTopicEdit');

// delete empty topic: ✕ → inline confirm → Delete PATCHes removeTopicBody.
// (re-query after the rename reload rebuilt the shadow DOM)
patches.length = 0;
click(legendOf('Empty').querySelector('.feed-topic-del')); await settle();
const topicConfirm = legendOf('Empty')?.querySelector('.feed-del-confirm')
  || [...sr.querySelectorAll('.feed-topic > legend .feed-del-confirm')][0];
if (!topicConfirm) fail('clicking an empty topic ✕ should show a Delete/Cancel confirm');
click(topicConfirm.querySelector('.feed-del-yes')); await settle();
if (!patches.some(b => /DELETE\s*\{\s*<[^>]+#Empty>\s+\?p\s+\?o\s+\./.test(b)))
  fail('confirming a topic delete should PATCH removeTopicBody (DELETE … WHERE)');
ok('empty topic delete PATCHes removeTopicBody (DELETE … WHERE)');

console.log('\nALL EDITOR CHECKS PASSED');
process.exit(0);
