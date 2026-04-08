// Styles for <sol-live-edit> shadow DOM.
// Uses CSS custom properties so the host page's theme (podz or standalone) flows through.
export const CSS = `
:host{display:flex;flex-direction:column;overflow:hidden;font-family:inherit}
.er{padding:.5em 1em;background:#fff0f0;border-bottom:1px solid #f5c6cb;color:#c0392b;font-size:.82em;display:none;flex-shrink:0}
.er.on{display:block}
.cf{display:flex;flex-wrap:wrap;gap:0 16px;padding:5px 12px;border-bottom:1px solid var(--border,#ccc);background:var(--surface,#f8f8f8);flex-shrink:0;align-items:center}
.cg{display:flex;align-items:center;gap:8px;font-size:.82em}
.cg b{font-weight:700;color:var(--text,#333);margin-right:2px}
.cg label{display:flex;align-items:center;gap:4px;cursor:pointer;color:var(--text,#222)}
.cg input[type=radio]{margin:0;cursor:pointer;accent-color:var(--accent,#4a9eff)}
.body{display:flex;flex:1;overflow:hidden}
.ep{flex:1;display:flex;flex-direction:column;overflow:hidden;border-right:1px solid var(--border,#ccc)}
.pp{flex:1;overflow:auto;position:relative}
.pp>.mdp{padding:1rem 1.4rem}
.hl{position:absolute;inset:0;z-index:10;overflow-y:auto;background:var(--surface,#fff);padding:1.2rem 1.5rem;display:none}
.hl.on{display:block}
.hl h2{margin:.3em 0 .8em;font-size:1.1em}
.hl h3{margin:1em 0 .3em;font-size:.95em;color:var(--accent,#4a9eff)}
.hl h4{margin:.6em 0 .15em;font-size:.88em}
.hl p{margin:.2em 0 .5em;font-size:.85em;color:var(--text-muted,#555)}
.hl code{display:block;white-space:pre;overflow-x:auto;font-size:.82em;background:var(--code-bg,#f4f4f4);padding:.5em .8em;border-radius:4px;border:1px solid var(--border,#ddd);margin:.2em 0 .6em}
.st{padding:.8rem 1rem}
.st .sc{display:inline-block;vertical-align:top;margin:.5rem;padding:.5rem .8rem;border:1px solid var(--border,#ddd);border-radius:6px}
.st .sc h3{margin:0 0 .3em;font-size:.88em}
.st .stat-table td{padding:2px 8px;font-size:.82em}
/* CSV table */
.csv-tbl{width:100%;border-collapse:collapse;font-size:.88em}
.csv-tbl th{padding:7px 10px;text-align:left;background:var(--text,#222);color:var(--surface,#fff);font-weight:600;position:sticky;top:0;z-index:1}
.csv-tbl td{padding:5px 10px;border-bottom:1px solid var(--border,#eee)}
.csv-tbl tr:nth-child(even) td{background:var(--hover,#f4f4f4)}
`;
