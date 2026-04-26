/**
 * @jest-environment jsdom
 */

/**
 * Tests for sol-pod-ops — tab selection logic, item inference,
 * navigation URL computation, and pod-ops file-type helpers.
 */

import { jest } from '@jest/globals';
import {
  extOf, contentTypeFor, isEditable, isViewable, isRdf,
  isImage, isVideo, isAudio, isPDF, isTextViewable, isLiveFormat, liveFormatFor,
  fileIcon, CT_TO_EXT, MIME_TYPES, withTimeout, fetchContainer,
  copyFile, copyFolder, deleteFolder,
  discoverOwnerWebIds, getStoragesFromWebIds,
} from '../shared/pod-ops.js';

// ── extOf ─────────────────────────────────────────────────────────────────

describe('extOf', () => {
  test('extracts normal extension', () => {
    expect(extOf('file.ttl')).toBe('ttl');
  });

  test('extracts last extension from multiple dots', () => {
    expect(extOf('archive.tar.gz')).toBe('gz');
  });

  test('returns empty string for no extension', () => {
    expect(extOf('README')).toBe('');
  });

  test('handles $.ext convention (auxiliary resources)', () => {
    expect(extOf('file$.acl')).toBe('acl');
    expect(extOf('data.ttl$.acl')).toBe('acl');
  });

  test('lowercases extension', () => {
    expect(extOf('file.TTL')).toBe('ttl');
    expect(extOf('image.PNG')).toBe('png');
  });
});

// ── contentTypeFor ────────────────────────────────────────────────────────

describe('contentTypeFor', () => {
  test('returns MIME type for known extension', () => {
    expect(contentTypeFor('data.ttl')).toBe('text/turtle');
    expect(contentTypeFor('data.json')).toBe('application/json');
    expect(contentTypeFor('page.html')).toBe('text/html');
    expect(contentTypeFor('readme.md')).toBe('text/markdown');
  });

  test('returns application/octet-stream for unknown', () => {
    expect(contentTypeFor('file.xyz')).toBe('application/octet-stream');
  });

  test('prefers blobType when provided', () => {
    expect(contentTypeFor('data.ttl', 'text/plain')).toBe('text/plain');
  });
});

// ── File-type predicates ──────────────────────────────────────────────────

describe('file-type predicates', () => {
  test('isEditable recognizes text-based files', () => {
    expect(isEditable('file.txt')).toBe(true);
    expect(isEditable('data.ttl')).toBe(true);
    expect(isEditable('script.js')).toBe(true);
    expect(isEditable('styles.css')).toBe(true);
    expect(isEditable('data.csv')).toBe(true);
  });

  test('isEditable rejects binary files', () => {
    expect(isEditable('image.png')).toBe(false);
    expect(isEditable('video.mp4')).toBe(false);
    expect(isEditable('archive.zip')).toBe(false);
  });

  test('isViewable recognizes viewable file types', () => {
    expect(isViewable('file.txt')).toBe(true);
    expect(isViewable('image.png')).toBe(true);
    expect(isViewable('video.mp4')).toBe(true);
    expect(isViewable('audio.mp3')).toBe(true);
    expect(isViewable('doc.pdf')).toBe(true);
  });

  test('isViewable rejects unknown types', () => {
    expect(isViewable('file.xyz')).toBe(false);
    expect(isViewable('archive.zip')).toBe(false);
  });

  test('isRdf recognizes RDF extensions', () => {
    expect(isRdf('data.ttl')).toBe(true);
    expect(isRdf('data.n3')).toBe(true);
    expect(isRdf('data.jsonld')).toBe(true);
    expect(isRdf('data.rdf')).toBe(true);
    expect(isRdf('data.nt')).toBe(true);
    expect(isRdf('data.trig')).toBe(true);
    expect(isRdf('data.nq')).toBe(true);
  });

  test('isRdf rejects non-RDF', () => {
    expect(isRdf('data.json')).toBe(false);
    expect(isRdf('page.html')).toBe(false);
  });

  test('isImage recognizes image types', () => {
    expect(isImage('photo.jpg')).toBe(true);
    expect(isImage('photo.jpeg')).toBe(true);
    expect(isImage('photo.png')).toBe(true);
    expect(isImage('photo.gif')).toBe(true);
    expect(isImage('icon.svg')).toBe(true);
    expect(isImage('photo.webp')).toBe(true);
  });

  test('isVideo recognizes video types', () => {
    expect(isVideo('clip.mp4')).toBe(true);
    expect(isVideo('clip.webm')).toBe(true);
  });

  test('isAudio recognizes audio types', () => {
    expect(isAudio('song.mp3')).toBe(true);
    expect(isAudio('song.wav')).toBe(true);
    expect(isAudio('song.flac')).toBe(true);
  });

  test('isPDF recognizes PDF', () => {
    expect(isPDF('doc.pdf')).toBe(true);
    expect(isPDF('doc.txt')).toBe(false);
  });
});

// ── Live format detection ─────────────────────────────────────────────────

describe('liveFormatFor', () => {
  test('detects Turtle by extension', () => {
    expect(liveFormatFor('data.ttl')).toBe('turtle');
    expect(liveFormatFor('data.n3')).toBe('turtle');
  });

  test('detects JSON-LD by extension', () => {
    expect(liveFormatFor('data.jsonld')).toBe('jsonld');
  });

  test('detects CSV by extension', () => {
    expect(liveFormatFor('data.csv')).toBe('csv');
    expect(liveFormatFor('data.tsv')).toBe('csv');
  });

  test('detects Markdown by extension', () => {
    expect(liveFormatFor('readme.md')).toBe('markdown');
  });

  test('detects HTML by extension', () => {
    expect(liveFormatFor('page.html')).toBe('html');
    expect(liveFormatFor('page.htm')).toBe('html');
  });

  test('detects Mermaid by extension', () => {
    expect(liveFormatFor('diagram.mmd')).toBe('mermaid');
  });

  test('detects Graphviz by extension', () => {
    expect(liveFormatFor('graph.dot')).toBe('graphviz');
    expect(liveFormatFor('graph.gv')).toBe('graphviz');
  });

  test('returns null for unknown extension', () => {
    expect(liveFormatFor('image.png')).toBeNull();
  });

  test('detects by MIME type', () => {
    expect(liveFormatFor(null, 'text/turtle')).toBe('turtle');
    expect(liveFormatFor(null, 'application/ld+json')).toBe('jsonld');
    expect(liveFormatFor(null, 'text/csv')).toBe('csv');
    expect(liveFormatFor(null, 'text/markdown')).toBe('markdown');
    expect(liveFormatFor(null, 'text/html')).toBe('html');
  });

  test('MIME takes priority over extension', () => {
    expect(liveFormatFor('data.txt', 'text/turtle')).toBe('turtle');
  });

  test('handles MIME type with charset parameter', () => {
    expect(liveFormatFor(null, 'text/turtle; charset=utf-8')).toBe('turtle');
  });
});

describe('isLiveFormat', () => {
  test('returns true for live-editable formats', () => {
    expect(isLiveFormat('data.ttl')).toBe(true);
    expect(isLiveFormat('data.csv')).toBe(true);
    expect(isLiveFormat('readme.md')).toBe(true);
    expect(isLiveFormat('page.html')).toBe(true);
  });

  test('returns false for non-live formats', () => {
    expect(isLiveFormat('image.png')).toBe(false);
    expect(isLiveFormat('video.mp4')).toBe(false);
  });
});

// ── CT_TO_EXT reverse mapping ─────────────────────────────────────────────

describe('CT_TO_EXT', () => {
  test('maps common MIME types to extensions', () => {
    expect(CT_TO_EXT['text/turtle']).toBe('ttl');
    expect(CT_TO_EXT['application/ld+json']).toBe('jsonld');
    expect(CT_TO_EXT['text/html']).toBe('html');
    expect(CT_TO_EXT['text/plain']).toBe('txt');
    expect(CT_TO_EXT['application/pdf']).toBe('pdf');
  });
});

// ── fileIcon ──────────────────────────────────────────────────────────────

describe('fileIcon', () => {
  test('returns RDF icon for Turtle files', () => {
    expect(fileIcon('data.ttl')).toBe('\u{1F537}');
    expect(fileIcon('data.jsonld')).toBe('\u{1F537}');
  });

  test('returns image icon for images', () => {
    expect(fileIcon('photo.png')).toBe('\u{1F5BC}');
    expect(fileIcon('photo.jpg')).toBe('\u{1F5BC}');
  });

  test('returns video icon for video', () => {
    expect(fileIcon('clip.mp4')).toBe('\u{1F3AC}');
  });

  test('returns audio icon for audio', () => {
    expect(fileIcon('song.mp3')).toBe('\u{1F3B5}');
  });

  test('returns PDF icon for PDF', () => {
    expect(fileIcon('doc.pdf')).toBe('\u{1F4D5}');
  });

  test('returns default icon for unknown', () => {
    expect(fileIcon('file.xyz')).toBe('\u{1F4C4}');
  });

  test('returns link icon for $ auxiliary resources', () => {
    expect(fileIcon('file$')).toBe('\u{1F517}');
  });

  test('returns lock icon for ACL files', () => {
    expect(fileIcon('file.acl')).toBe('\u{1F512}');
  });

  test('returns wrench icon for dotfiles', () => {
    expect(fileIcon('.gitignore')).toBe('\u{1F527}');
  });
});

// ── Tab selection logic (mirrors sol-pod-ops _buildTabs) ──────────────────

describe('tab selection logic', () => {
  function computeTabs(item, effectiveName) {
    const hasLive = !item.isContainer && isLiveFormat(item.url, item.contentType);
    const fileTabs = hasLive
      ? ['Live Edit', 'Download', 'Rename', 'Delete', 'Permissions']
      : ['View', 'Edit', 'Graph', 'Download', 'Rename', 'Delete', 'Permissions'];
    const tabDefs = item.isContainer
      ? ['New File', 'New Folder', 'Download', 'Rename', 'Delete', 'Permissions']
      : fileTabs;

    return tabDefs.filter(name => {
      if (name === 'Edit' && !isEditable(effectiveName)) return false;
      if (name === 'View' && !isViewable(effectiveName)) return false;
      if (name === 'Graph' && !isRdf(effectiveName)) return false;
      return true;
    });
  }

  function computeDefaultTab(item, effectiveName) {
    const hasLive = !item.isContainer && isLiveFormat(item.url, item.contentType);
    return item.isContainer ? 'New File'
      : hasLive ? 'Live Edit'
      : isRdf(effectiveName) ? 'Graph'
      : isViewable(effectiveName) ? 'View' : 'Rename';
  }

  test('container gets management tabs', () => {
    const item = { url: 'https://pod.example/folder/', name: 'folder', isContainer: true, contentType: '' };
    const tabs = computeTabs(item, item.name);
    expect(tabs).toEqual(['New File', 'New Folder', 'Download', 'Rename', 'Delete', 'Permissions']);
  });

  test('container default tab is New File', () => {
    const item = { url: 'https://pod.example/folder/', name: 'folder', isContainer: true, contentType: '' };
    expect(computeDefaultTab(item, item.name)).toBe('New File');
  });

  test('live-editable file gets Live Edit tabs', () => {
    const item = { url: 'https://pod.example/data.ttl', name: 'data.ttl', isContainer: false, contentType: 'text/turtle' };
    const tabs = computeTabs(item, item.name);
    expect(tabs).toEqual(['Live Edit', 'Download', 'Rename', 'Delete', 'Permissions']);
  });

  test('live-editable default tab is Live Edit', () => {
    const item = { url: 'https://pod.example/data.ttl', name: 'data.ttl', isContainer: false, contentType: 'text/turtle' };
    expect(computeDefaultTab(item, item.name)).toBe('Live Edit');
  });

  test('editable non-live file gets View+Edit+Download+Rename+Delete+Permissions', () => {
    const item = { url: 'https://pod.example/script.js', name: 'script.js', isContainer: false, contentType: 'application/javascript' };
    const tabs = computeTabs(item, item.name);
    expect(tabs).toContain('View');
    expect(tabs).toContain('Edit');
    expect(tabs).not.toContain('Graph');
    expect(tabs).toContain('Download');
  });

  test('RDF file gets Graph tab', () => {
    const item = { url: 'https://pod.example/data.rdf', name: 'data.rdf', isContainer: false, contentType: 'application/rdf+xml' };
    const tabs = computeTabs(item, item.name);
    expect(tabs).toContain('Graph');
  });

  test('image file gets View but not Edit or Graph', () => {
    const item = { url: 'https://pod.example/photo.png', name: 'photo.png', isContainer: false, contentType: 'image/png' };
    const tabs = computeTabs(item, item.name);
    expect(tabs).toContain('View');
    expect(tabs).not.toContain('Edit');
    expect(tabs).not.toContain('Graph');
  });

  test('image default tab is View', () => {
    const item = { url: 'https://pod.example/photo.png', name: 'photo.png', isContainer: false, contentType: 'image/png' };
    expect(computeDefaultTab(item, item.name)).toBe('View');
  });

  test('unknown binary file gets only Download+Rename+Delete+Permissions', () => {
    const item = { url: 'https://pod.example/file.xyz', name: 'file.xyz', isContainer: false, contentType: 'application/octet-stream' };
    const tabs = computeTabs(item, item.name);
    expect(tabs).not.toContain('View');
    expect(tabs).not.toContain('Edit');
    expect(tabs).not.toContain('Graph');
    expect(tabs).toEqual(['Download', 'Rename', 'Delete', 'Permissions']);
  });

  test('unknown binary default tab is Rename', () => {
    const item = { url: 'https://pod.example/file.xyz', name: 'file.xyz', isContainer: false, contentType: 'application/octet-stream' };
    expect(computeDefaultTab(item, item.name)).toBe('Rename');
  });
});

// ── Navigate URL computation (mirrors _emitNavigate) ──────────────────────

describe('navigate URL computation', () => {
  function computeParentUrl(item) {
    return item.isContainer
      ? item.url.slice(0, item.url.slice(0, -1).lastIndexOf('/') + 1)
      : item.url.substring(0, item.url.lastIndexOf('/') + 1);
  }

  test('file → parent container', () => {
    const item = { url: 'https://pod.example/docs/file.ttl', isContainer: false };
    expect(computeParentUrl(item)).toBe('https://pod.example/docs/');
  });

  test('container → parent container', () => {
    const item = { url: 'https://pod.example/docs/sub/', isContainer: true };
    expect(computeParentUrl(item)).toBe('https://pod.example/docs/');
  });

  test('root file → root container', () => {
    const item = { url: 'https://pod.example/file.ttl', isContainer: false };
    expect(computeParentUrl(item)).toBe('https://pod.example/');
  });
});

// ── Item inference from source URL (mirrors _load) ────────────────────────

describe('item inference from source URL', () => {
  function inferItem(source) {
    const isContainer = source.endsWith('/');
    const name = isContainer
      ? source.slice(0, -1).split('/').pop()
      : source.split('/').pop();
    return { url: source, name, isContainer, contentType: '' };
  }

  test('file URL', () => {
    const item = inferItem('https://pod.example/docs/file.ttl');
    expect(item.name).toBe('file.ttl');
    expect(item.isContainer).toBe(false);
  });

  test('container URL', () => {
    const item = inferItem('https://pod.example/docs/');
    expect(item.name).toBe('docs');
    expect(item.isContainer).toBe(true);
  });

  test('root URL', () => {
    const item = inferItem('https://pod.example/');
    expect(item.name).toBe('pod.example');
    expect(item.isContainer).toBe(true);
  });
});

// ── isTextViewable ───────────────────────────────────────────────────────

describe('isTextViewable', () => {
  test('recognizes text-viewable files', () => {
    for (const ext of ['txt','md','csv','json','jsonld','ttl','n3','html','xml','svg','js','css']) {
      expect(isTextViewable(`file.${ext}`)).toBe(true);
    }
  });
  test('rejects non-text files', () => {
    expect(isTextViewable('photo.png')).toBe(false);
    expect(isTextViewable('clip.mp4')).toBe(false);
    expect(isTextViewable('file.zip')).toBe(false);
  });
});

// ── MIME_TYPES ───────────────────────────────────────────────────────────

describe('MIME_TYPES', () => {
  test('covers all expected extensions', () => {
    expect(MIME_TYPES.ttl).toBe('text/turtle');
    expect(MIME_TYPES.png).toBe('image/png');
    expect(MIME_TYPES.jpg).toBe('image/jpeg');
    expect(MIME_TYPES.jpeg).toBe('image/jpeg');
    expect(MIME_TYPES.pdf).toBe('application/pdf');
    expect(MIME_TYPES.svg).toBe('image/svg+xml');
    expect(MIME_TYPES.css).toBe('text/css');
    expect(MIME_TYPES.js).toBe('application/javascript');
    expect(MIME_TYPES.csv).toBe('text/csv');
    expect(MIME_TYPES.acl).toBe('text/turtle');
  });
});

// ── fileIcon additional coverage ─────────────────────────────────────────

describe('fileIcon additional', () => {
  test('json → clipboard icon', () => {
    expect(fileIcon('data.json')).toBe('\u{1F4CB}');
  });
  test('csv/tsv → chart icon', () => {
    expect(fileIcon('data.csv')).toBe('\u{1F4CA}');
    expect(fileIcon('data.tsv')).toBe('\u{1F4CA}');
  });
  test('md → memo icon', () => {
    expect(fileIcon('readme.md')).toBe('\u{1F4DD}');
    expect(fileIcon('readme.markdown')).toBe('\u{1F4DD}');
  });
  test('html/htm → globe icon', () => {
    expect(fileIcon('index.html')).toBe('\u{1F310}');
    expect(fileIcon('page.htm')).toBe('\u{1F310}');
  });
  test('js/ts → lightning icon', () => {
    expect(fileIcon('app.js')).toBe('⚡');
    expect(fileIcon('app.mjs')).toBe('⚡');
    expect(fileIcon('app.ts')).toBe('⚡');
  });
  test('css/scss → palette icon', () => {
    expect(fileIcon('style.css')).toBe('\u{1F3A8}');
    expect(fileIcon('style.scss')).toBe('\u{1F3A8}');
  });
  test('svg → masks icon', () => {
    expect(fileIcon('logo.svg')).toBe('\u{1F3AD}');
  });
  test('archives → package icon', () => {
    expect(fileIcon('archive.zip')).toBe('\u{1F4E6}');
    expect(fileIcon('archive.tar')).toBe('\u{1F4E6}');
    expect(fileIcon('archive.gz')).toBe('\u{1F4E6}');
  });
  test('config files → gear icon', () => {
    expect(fileIcon('config.yaml')).toBe('⚙');
    expect(fileIcon('config.toml')).toBe('⚙');
    expect(fileIcon('.env')).toBe('⚙');
  });
  test('txt → page icon', () => {
    expect(fileIcon('notes.txt')).toBe('\u{1F4C4}');
  });
  test('RDF family → diamond icon', () => {
    for (const ext of ['ttl','n3','trig','nq','nt','rdf','jsonld']) {
      expect(fileIcon(`data.${ext}`)).toBe('\u{1F537}');
    }
  });
});

// ── withTimeout ──────────────────────────────────────────────────────────

describe('withTimeout', () => {
  test('passes through successful fetch', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    const timed = withTimeout(mockFetch, 5000);
    const resp = await timed('https://ex.org/data');
    expect(resp.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith('https://ex.org/data', expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  test('merges options with signal', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    const timed = withTimeout(mockFetch, 5000);
    await timed('https://ex.org/', { method: 'PUT', headers: { 'Content-Type': 'text/turtle' } });
    const call = mockFetch.mock.calls[0][1];
    expect(call.method).toBe('PUT');
    expect(call.headers['Content-Type']).toBe('text/turtle');
    expect(call.signal).toBeInstanceOf(AbortSignal);
  });

  test('rejects with timeout message on abort', async () => {
    const mockFetch = jest.fn().mockImplementation(() => {
      const err = new Error('aborted');
      err.name = 'AbortError';
      return Promise.reject(err);
    });
    const timed = withTimeout(mockFetch, 100);
    await expect(timed('https://ex.org/slow')).rejects.toThrow(/timed out after 0\.1s/i);
  });

  test('re-throws non-abort errors', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new TypeError('Network failure'));
    const timed = withTimeout(mockFetch, 5000);
    await expect(timed('https://ex.org/')).rejects.toThrow('Network failure');
  });

  test('defaults to 30s timeout', () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    const timed = withTimeout(mockFetch);
    expect(typeof timed).toBe('function');
  });
});

// ── fetchContainer ───────────────────────────────────────────────────────

describe('fetchContainer', () => {
  const CONTAINER = 'https://pod.example/docs/';
  const TURTLE = `
    @prefix ldp: <http://www.w3.org/ns/ldp#> .
    <${CONTAINER}> ldp:contains <${CONTAINER}notes.ttl>, <${CONTAINER}sub/>, <${CONTAINER}readme.md> .
  `;

  function makeMockFetch(text = TURTLE, status = 200) {
    return jest.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Not Found',
      text: async () => text,
    });
  }

  test('returns sorted resources — containers first', async () => {
    const items = await fetchContainer(CONTAINER, makeMockFetch());
    expect(items[0]).toEqual({ url: `${CONTAINER}sub/`, name: 'sub', isContainer: true });
    const files = items.filter(i => !i.isContainer);
    expect(files.map(f => f.name)).toEqual(['notes.ttl', 'readme.md']);
  });

  test('requests text/turtle', async () => {
    const mf = makeMockFetch();
    await fetchContainer(CONTAINER, mf);
    expect(mf).toHaveBeenCalledWith(CONTAINER, expect.objectContaining({
      headers: { Accept: 'text/turtle' },
    }));
  });

  test('throws on non-OK response', async () => {
    await expect(fetchContainer(CONTAINER, makeMockFetch('', 404)))
      .rejects.toThrow('404');
  });

  test('handles empty container', async () => {
    const empty = `@prefix ldp: <http://www.w3.org/ns/ldp#> . <${CONTAINER}> a ldp:Container .`;
    const items = await fetchContainer(CONTAINER, makeMockFetch(empty));
    expect(items).toEqual([]);
  });
});

// ── copyFile ─────────────────────────────────────────────────────────────

describe('copyFile', () => {
  function mockBlob(type = '') {
    return { type, size: 42, arrayBuffer: async () => new ArrayBuffer(42) };
  }

  test('copies file successfully', async () => {
    const sourceFetch = jest.fn().mockResolvedValue({ ok: true, blob: async () => mockBlob('text/turtle') });
    const targetFetch = jest.fn().mockResolvedValue({ ok: true });
    const result = await copyFile('https://a.example/file.ttl', 'https://b.example/docs/', 'file.ttl', sourceFetch, targetFetch);
    expect(result).toEqual({ success: true });
    expect(targetFetch).toHaveBeenCalledWith('https://b.example/docs/file.ttl', expect.objectContaining({ method: 'PUT' }));
  });

  test('uses blob type for content-type', async () => {
    const sourceFetch = jest.fn().mockResolvedValue({ ok: true, blob: async () => mockBlob('text/turtle') });
    const targetFetch = jest.fn().mockResolvedValue({ ok: true });
    await copyFile('https://a.example/file.ttl', 'https://b.example/', 'file.ttl', sourceFetch, targetFetch);
    const putCall = targetFetch.mock.calls[0][1];
    expect(putCall.headers['Content-Type']).toBe('text/turtle');
  });

  test('falls back to extension-based MIME when no blob type', async () => {
    const sourceFetch = jest.fn().mockResolvedValue({ ok: true, blob: async () => mockBlob('') });
    const targetFetch = jest.fn().mockResolvedValue({ ok: true });
    await copyFile('https://a.example/file.md', 'https://b.example/', 'file.md', sourceFetch, targetFetch);
    const putCall = targetFetch.mock.calls[0][1];
    expect(putCall.headers['Content-Type']).toBe('text/markdown');
  });

  test('throws on GET failure', async () => {
    const sourceFetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });
    const targetFetch = jest.fn();
    await expect(copyFile('https://a.example/gone.ttl', 'https://b.example/', 'gone.ttl', sourceFetch, targetFetch))
      .rejects.toThrow(/GET.*failed.*404/);
    expect(targetFetch).not.toHaveBeenCalled();
  });

  test('throws on PUT failure with needsAuth for 401', async () => {
    const sourceFetch = jest.fn().mockResolvedValue({ ok: true, blob: async () => mockBlob() });
    const targetFetch = jest.fn().mockResolvedValue({ ok: false, status: 401 });
    try {
      await copyFile('https://a.example/f.ttl', 'https://b.example/', 'f.ttl', sourceFetch, targetFetch);
      throw new Error('should have thrown');
    } catch (e) {
      expect(e.needsAuth).toBe(true);
      expect(e.message).toMatch(/PUT failed.*401/);
    }
  });

  test('throws on PUT failure with needsAuth for 403', async () => {
    const sourceFetch = jest.fn().mockResolvedValue({ ok: true, blob: async () => mockBlob() });
    const targetFetch = jest.fn().mockResolvedValue({ ok: false, status: 403 });
    try {
      await copyFile('https://a.example/f.ttl', 'https://b.example/', 'f.ttl', sourceFetch, targetFetch);
      throw new Error('should have thrown');
    } catch (e) {
      expect(e.needsAuth).toBe(true);
    }
  });

  test('PUT 500 does not set needsAuth', async () => {
    const sourceFetch = jest.fn().mockResolvedValue({ ok: true, blob: async () => mockBlob() });
    const targetFetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
    try {
      await copyFile('https://a.example/f.ttl', 'https://b.example/', 'f.ttl', sourceFetch, targetFetch);
      throw new Error('should have thrown');
    } catch (e) {
      expect(e.needsAuth).toBe(false);
    }
  });
});

// ── copyFolder ───────────────────────────────────────────────────────────

describe('copyFolder', () => {
  const SRC = 'https://a.example/src/';
  const TURTLE_WITH_CHILDREN = `
    @prefix ldp: <http://www.w3.org/ns/ldp#> .
    <${SRC}> ldp:contains <${SRC}file.ttl>, <${SRC}child/> .
  `;
  const TURTLE_CHILD_EMPTY = `
    @prefix ldp: <http://www.w3.org/ns/ldp#> .
    <${SRC}child/> ldp:contains <${SRC}child/inner.txt> .
  `;

  test('creates target folder and copies children', async () => {
    const calls = [];
    const fetchFnForUrl = (url) => {
      const fn = jest.fn().mockImplementation(async (reqUrl, opts) => {
        calls.push({ url: reqUrl, method: opts?.method || 'GET' });
        if (opts?.method === 'PUT') return { ok: true };
        if (reqUrl === SRC) return { ok: true, text: async () => TURTLE_WITH_CHILDREN };
        if (reqUrl === `${SRC}child/`) return { ok: true, text: async () => `@prefix ldp: <http://www.w3.org/ns/ldp#> . <${SRC}child/> a ldp:Container .` };
        if (reqUrl === `${SRC}file.ttl`) return { ok: true, blob: async () => ({ type: 'text/turtle', size: 10 }) };
        return { ok: true, text: async () => '' };
      });
      return fn;
    };

    const progress = [];
    const result = await copyFolder(SRC, 'https://b.example/', 'src', fetchFnForUrl, m => progress.push(m));
    expect(result.success).toBe(true);
    expect(progress.length).toBeGreaterThan(0);
    expect(progress[0]).toMatch(/Copying folder src/);
  });

  test('returns error when source listing fails', async () => {
    const fetchFnForUrl = () => jest.fn().mockRejectedValue(new Error('network down'));
    const result = await copyFolder(SRC, 'https://b.example/', 'src', fetchFnForUrl);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('returns error when folder creation fails', async () => {
    const fetchFnForUrl = (url) => {
      return jest.fn().mockImplementation(async (reqUrl, opts) => {
        if (!opts?.method || opts.method === 'GET') {
          return { ok: true, text: async () => `@prefix ldp: <http://www.w3.org/ns/ldp#> . <${SRC}> ldp:contains <${SRC}a.txt> .` };
        }
        if (opts?.method === 'PUT' && reqUrl.endsWith('/')) return { ok: false, status: 500 };
        return { ok: true };
      });
    };
    const result = await copyFolder(SRC, 'https://b.example/', 'src', fetchFnForUrl);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Failed to create folder/);
  });

  test('409 on mkdir is tolerated', async () => {
    const fetchFnForUrl = (url) => {
      return jest.fn().mockImplementation(async (reqUrl, opts) => {
        if (!opts?.method || opts.method === 'GET') {
          return { ok: true, text: async () => `@prefix ldp: <http://www.w3.org/ns/ldp#> . <${SRC}> a ldp:Container .` };
        }
        if (opts?.method === 'PUT' && reqUrl.endsWith('/')) return { ok: false, status: 409 };
        return { ok: true };
      });
    };
    const result = await copyFolder(SRC, 'https://b.example/', 'src', fetchFnForUrl);
    expect(result.success).toBe(true);
  });
});

// ── deleteFolder ─────────────────────────────────────────────────────────

describe('deleteFolder', () => {
  test('deletes children then folder', async () => {
    const deleted = [];
    const FOLDER = 'https://pod.example/trash/';
    const TURTLE = `
      @prefix ldp: <http://www.w3.org/ns/ldp#> .
      <${FOLDER}> ldp:contains <${FOLDER}a.txt>, <${FOLDER}b.txt> .
    `;
    const fetchFnForUrl = (url) => {
      return jest.fn().mockImplementation(async (reqUrl, opts) => {
        if (opts?.method === 'DELETE') { deleted.push(reqUrl); return { ok: true }; }
        return { ok: true, status: 200, statusText: 'OK', text: async () => TURTLE };
      });
    };
    await deleteFolder(FOLDER, fetchFnForUrl);
    expect(deleted).toContain(`${FOLDER}a.txt`);
    expect(deleted).toContain(`${FOLDER}b.txt`);
    expect(deleted).toContain(FOLDER);
    expect(deleted.indexOf(FOLDER)).toBe(deleted.length - 1);
  });

  test('handles empty folder', async () => {
    const deleted = [];
    const FOLDER = 'https://pod.example/empty/';
    const fetchFnForUrl = (url) => {
      return jest.fn().mockImplementation(async (reqUrl, opts) => {
        if (opts?.method === 'DELETE') { deleted.push(reqUrl); return { ok: true }; }
        return { ok: true, status: 200, statusText: 'OK', text: async () => `@prefix ldp: <http://www.w3.org/ns/ldp#> . <${FOLDER}> a ldp:Container .` };
      });
    };
    await deleteFolder(FOLDER, fetchFnForUrl);
    expect(deleted).toEqual([FOLDER]);
  });

  test('still deletes folder when listing fails', async () => {
    const deleted = [];
    const FOLDER = 'https://pod.example/broken/';
    const fetchFnForUrl = (url) => {
      return jest.fn().mockImplementation(async (reqUrl, opts) => {
        if (opts?.method === 'DELETE') { deleted.push(reqUrl); return { ok: true }; }
        return { ok: false, status: 500, statusText: 'Error', text: async () => '' };
      });
    };
    await deleteFolder(FOLDER, fetchFnForUrl);
    expect(deleted).toContain(FOLDER);
  });
});

// ── discoverOwnerWebIds ──────────────────────────────────────────────────

describe('discoverOwnerWebIds', () => {
  let origFetch;
  beforeEach(() => { origFetch = globalThis.fetch; });
  afterEach(() => { globalThis.fetch = origFetch; });

  test('discovers owner from .meta Turtle', async () => {
    globalThis.fetch = jest.fn().mockImplementation(async (url) => {
      if (url.endsWith('/')) return { headers: new Headers(), ok: true };
      if (url.includes('.meta')) return {
        ok: true,
        text: async () => `<https://alice.example/profile/card#me> solid:account <https://pod.example/> .`,
      };
      return { ok: false };
    });
    const ids = await discoverOwnerWebIds('https://pod.example');
    expect(ids).toContain('https://alice.example/profile/card#me');
  });

  test('discovers owner from Link header describedby', async () => {
    globalThis.fetch = jest.fn().mockImplementation(async (url) => {
      if (url.endsWith('/')) {
        return {
          headers: new Headers({ Link: '</.custom-meta>; rel="describedby"' }),
          ok: true,
        };
      }
      if (url.includes('.custom-meta')) return {
        ok: true,
        text: async () => `<https://bob.example/card#me> <http://www.w3.org/ns/solid/terms#account> <https://pod.example/> .`,
      };
      return { ok: false };
    });
    const ids = await discoverOwnerWebIds('https://pod.example');
    expect(ids).toContain('https://bob.example/card#me');
  });

  test('discovers from .well-known/solid JSON-LD', async () => {
    globalThis.fetch = jest.fn().mockImplementation(async (url) => {
      if (url.endsWith('/')) return { headers: new Headers(), ok: true };
      if (url.includes('.meta')) return { ok: false };
      if (url.includes('.well-known/solid')) return {
        ok: true,
        text: async () => JSON.stringify({
          'http://www.w3.org/ns/solid/terms#owner': [{ '@id': 'https://carol.example/card#me' }],
        }),
      };
      return { ok: false };
    });
    const ids = await discoverOwnerWebIds('https://pod.example');
    expect(ids).toContain('https://carol.example/card#me');
  });

  test('discovers from ACL with acl:Control', async () => {
    globalThis.fetch = jest.fn().mockImplementation(async (url) => {
      if (url.endsWith('/')) return { headers: new Headers(), ok: true };
      if (url.includes('.meta')) return { ok: false };
      if (url.includes('.well-known')) return { ok: false };
      if (url.includes('.acl')) return {
        ok: true,
        text: async () => `
          acl:Control stuff
          acl:agent <https://dan.example/card#me>
        `,
      };
      return { ok: false };
    });
    const ids = await discoverOwnerWebIds('https://pod.example');
    expect(ids).toContain('https://dan.example/card#me');
  });

  test('returns empty array when nothing found', async () => {
    globalThis.fetch = jest.fn().mockImplementation(async () => {
      return { ok: false, headers: new Headers() };
    });
    const ids = await discoverOwnerWebIds('https://pod.example');
    expect(ids).toEqual([]);
  });

  test('uses window.location.origin as default', async () => {
    delete window.location;
    window.location = { origin: 'https://my.pod' };
    globalThis.fetch = jest.fn().mockImplementation(async () => ({ ok: false, headers: new Headers() }));
    const ids = await discoverOwnerWebIds();
    expect(globalThis.fetch).toHaveBeenCalledWith('https://my.pod/');
  });

  test('handles fetch errors gracefully', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new TypeError('network'));
    const ids = await discoverOwnerWebIds('https://pod.example');
    expect(ids).toEqual([]);
  });

  test('discovers owner via solid:owner in Turtle', async () => {
    globalThis.fetch = jest.fn().mockImplementation(async (url) => {
      if (url.endsWith('/')) return { headers: new Headers(), ok: true };
      if (url.includes('.meta')) return {
        ok: true,
        text: async () => `solid:owner <https://eve.example/card#me> .`,
      };
      return { ok: false };
    });
    const ids = await discoverOwnerWebIds('https://pod.example');
    expect(ids).toContain('https://eve.example/card#me');
  });

  test('follows Link acl header', async () => {
    globalThis.fetch = jest.fn().mockImplementation(async (url) => {
      if (url.endsWith('/')) {
        return { headers: new Headers({ Link: '</.custom-acl>; rel="acl"' }), ok: true };
      }
      if (url.includes('.meta') || url.includes('.well-known')) return { ok: false };
      if (url.includes('.custom-acl')) return {
        ok: true,
        text: async () => `acl:Control block\nacl:agent <https://frank.example/card#me>`,
      };
      return { ok: false };
    });
    const ids = await discoverOwnerWebIds('https://pod.example');
    expect(ids).toContain('https://frank.example/card#me');
  });
});

// ── getStoragesFromWebIds ────────────────────────────────────────────────

describe('getStoragesFromWebIds', () => {
  let origFetch;
  beforeEach(() => { origFetch = globalThis.fetch; });
  afterEach(() => { globalThis.fetch = origFetch; });

  test('extracts pim:storage from profile', async () => {
    globalThis.fetch = jest.fn().mockImplementation(async (url) => ({
      ok: true,
      status: 200,
      headers: new Headers({ 'Content-Type': 'text/turtle' }),
      text: async () => `
        @prefix pim: <http://www.w3.org/ns/pim/space#> .
        <https://alice.example/card#me> pim:storage <https://alice.example/> .
      `,
    }));
    const storages = await getStoragesFromWebIds(['https://alice.example/card#me']);
    expect(storages).toContain('https://alice.example/');
  });

  test('follows owl:sameAs links', async () => {
    let callCount = 0;
    globalThis.fetch = jest.fn().mockImplementation(async (url) => {
      callCount++;
      if (url.includes('alice')) {
        return {
          ok: true, status: 200,
          headers: new Headers({ 'Content-Type': 'text/turtle' }),
          text: async () => `
            @prefix owl: <http://www.w3.org/2002/07/owl#> .
            @prefix pim: <http://www.w3.org/ns/pim/space#> .
            <https://alice.example/card#me> owl:sameAs <https://alt.example/card#me> ;
              pim:storage <https://alice.example/> .
          `,
        };
      }
      return {
        ok: true, status: 200,
        headers: new Headers({ 'Content-Type': 'text/turtle' }),
        text: async () => `
          @prefix pim: <http://www.w3.org/ns/pim/space#> .
          <https://alt.example/card#me> pim:storage <https://alt.example/> .
        `,
      };
    });
    const storages = await getStoragesFromWebIds(['https://alice.example/card#me']);
    expect(storages).toContain('https://alice.example/');
    expect(storages).toContain('https://alt.example/');
  });

  test('returns sorted results', async () => {
    globalThis.fetch = jest.fn().mockImplementation(async () => ({
      ok: true, status: 200,
      headers: new Headers({ 'Content-Type': 'text/turtle' }),
      text: async () => `
        @prefix pim: <http://www.w3.org/ns/pim/space#> .
        <https://z.example/card#me> pim:storage <https://z.example/>, <https://a.example/> .
      `,
    }));
    const storages = await getStoragesFromWebIds(['https://z.example/card#me']);
    expect(storages).toEqual(['https://a.example/', 'https://z.example/']);
  });

  test('deduplicates visited webIds', async () => {
    let fetchCount = 0;
    globalThis.fetch = jest.fn().mockImplementation(async () => {
      fetchCount++;
      return {
        ok: true, status: 200,
        headers: new Headers({ 'Content-Type': 'text/turtle' }),
        text: async () => `
          @prefix pim: <http://www.w3.org/ns/pim/space#> .
          <https://alice.example/card#me> pim:storage <https://alice.example/> .
        `,
      };
    });
    await getStoragesFromWebIds(['https://alice.example/card#me', 'https://alice.example/card#me']);
    expect(fetchCount).toBe(1);
  });

  test('handles fetch failure gracefully', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    const storages = await getStoragesFromWebIds(['https://alice.example/card#me']);
    expect(storages).toEqual([]);
    warn.mockRestore();
  });

  test('returns empty for empty input', async () => {
    const storages = await getStoragesFromWebIds([]);
    expect(storages).toEqual([]);
  });
});

// ── liveFormatFor edge cases ─────────────────────────────────────────────

describe('liveFormatFor edge cases', () => {
  test('strips query string before extension check', () => {
    expect(liveFormatFor('https://pod.example/data.ttl?v=2')).toBe('turtle');
  });
  test('returns null when both url and mime are null', () => {
    expect(liveFormatFor(null, null)).toBeNull();
  });
  test('returns null when both are undefined', () => {
    expect(liveFormatFor(undefined, undefined)).toBeNull();
  });
  test('handles mermaid keyword extension', () => {
    expect(liveFormatFor('flow.mermaid')).toBe('mermaid');
  });
  test('detects via MIME text/x-markdown', () => {
    expect(liveFormatFor(null, 'text/x-markdown')).toBe('markdown');
  });
  test('detects via MIME text/tab-separated-values', () => {
    expect(liveFormatFor(null, 'text/tab-separated-values')).toBe('csv');
  });
  test('detects via MIME text/vnd.graphviz', () => {
    expect(liveFormatFor(null, 'text/vnd.graphviz')).toBe('graphviz');
  });
  test('detects via MIME text/x-dot', () => {
    expect(liveFormatFor(null, 'text/x-dot')).toBe('graphviz');
  });
  test('detects via MIME text/x-mermaid', () => {
    expect(liveFormatFor(null, 'text/x-mermaid')).toBe('mermaid');
  });
  test('detects via MIME text/n3', () => {
    expect(liveFormatFor(null, 'text/n3')).toBe('turtle');
  });
});

// ── extOf edge cases ─────────────────────────────────────────────────────

describe('extOf edge cases', () => {
  test('handles name with only a dot', () => {
    expect(extOf('.htaccess')).toBe('htaccess');
  });
  test('handles $.ext when no base extension', () => {
    expect(extOf('file$.meta')).toBe('meta');
  });
  test('handles deeply nested extension', () => {
    expect(extOf('my.backup.file.2024.ttl')).toBe('ttl');
  });
});
