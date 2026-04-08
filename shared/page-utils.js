// Shared utilities for standalone live-editor pages.
// Theme is managed by the <sol-live-edit> settings panel; initTheme() applies
// the saved preference on page load to avoid a flash before the component mounts.

export function initTheme() {
  try {
    const cfg = JSON.parse(localStorage.getItem('sle-cfg') || '{}');
    const theme = cfg.theme || localStorage.getItem('sle-theme') || 'system';
    if (theme !== 'system') {
      document.documentElement.setAttribute('data-theme', theme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (_) {}
}

export function setupLoadSave(editorId, accept, defaultFilename, mimeType) {
  document.getElementById('loadBtn')?.addEventListener('click', () => {
    const inp = Object.assign(document.createElement('input'), {type:'file', accept});
    inp.onchange = async () => {
      const text = await inp.files[0].text();
      document.getElementById(editorId).content = text;
    };
    inp.click();
  });

  document.getElementById('saveBtn')?.addEventListener('click', () => {
    const text = document.getElementById(editorId).content;
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([text], {type: mimeType})),
      download: defaultFilename,
    });
    a.click(); URL.revokeObjectURL(a.href);
  });
}
