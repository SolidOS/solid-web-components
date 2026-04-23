/**
 * @jest-environment jsdom
 */

/**
 * Tests for sol-pod-ops — tab selection logic, item inference,
 * navigation URL computation, and pod-ops file-type helpers.
 */

import {
  extOf, contentTypeFor, isEditable, isViewable, isRdf,
  isImage, isVideo, isAudio, isPDF, isLiveFormat, liveFormatFor,
  fileIcon, CT_TO_EXT, MIME_TYPES,
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
