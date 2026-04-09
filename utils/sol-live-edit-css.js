// Styles for <sol-live-edit> shadow DOM.
// Uses CSS custom properties so the host page's theme (podz or standalone) flows through.
export const CSS = `
:host{display:flex;flex-direction:column;overflow:hidden;font-family:inherit;position:relative}
.er{padding:.5em 1em;background:#fff0f0;border-bottom:1px solid #f5c6cb;color:#c0392b;font-size:.82em;display:none;flex-shrink:0}
.er.on{display:block}

/* ── Settings dropdown ──────────────────────────────────── */
.cf{display:none;position:absolute;top:0;right:0;z-index:20;
    min-width:180px;padding:10px 14px;
    background:var(--surface,#fff);border:1px solid var(--border,#ccc);
    border-radius:0 0 0 8px;box-shadow:0 4px 16px rgba(0,0,0,.15);
    flex-direction:column;gap:10px;font-size:.82em}
.cf.on{display:flex}
.cg{display:flex;flex-direction:column;gap:4px}
.cg b{font-weight:700;color:var(--text,#333);margin-bottom:2px;font-size:.9em}
.cg label{display:flex;align-items:center;gap:6px;cursor:pointer;color:var(--text,#222);padding:1px 0}
.cg input[type=radio]{margin:0;cursor:pointer;accent-color:var(--accent,#4a9eff)}

/* ── Modal (help + statistics) ──────────────────────────── */
.modal-backdrop{display:none;position:absolute;inset:0;z-index:30;
    background:rgba(0,0,0,.35);align-items:center;justify-content:center}
.modal-backdrop.on{display:flex}
.modal-box{background:var(--surface,#fff);border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,.25);
    max-width:90%;max-height:85%;width:600px;overflow-y:auto;position:relative;padding:1.2rem 1.5rem 1.5rem}
.modal-box.wide{width:800px}
.modal-close{position:absolute;top:8px;right:12px;border:none;background:none;
    font-size:1.3em;cursor:pointer;color:var(--text-muted,#888);line-height:1;padding:4px}
.modal-close:hover{color:var(--text,#333)}

/* help content inside modal */
.modal-box h2{margin:.2em 0 .7em;font-size:1.05em}
.modal-box h3{margin:.9em 0 .25em;font-size:.92em;color:var(--accent,#4a9eff)}
.modal-box h4{margin:.5em 0 .12em;font-size:.86em}
.modal-box p{margin:.15em 0 .4em;font-size:.84em;color:var(--text-muted,#555)}
.modal-box code{display:block;white-space:pre;overflow-x:auto;font-size:.8em;
    background:var(--code-bg,#f4f4f4);padding:.4em .7em;border-radius:4px;
    border:1px solid var(--border,#ddd);margin:.15em 0 .5em}

/* statistics inside modal */
.modal-box .sc{display:inline-block;vertical-align:top;margin:.4rem;padding:.4rem .7rem;
    border:1px solid var(--border,#ddd);border-radius:6px}
.modal-box .sc h3{margin:0 0 .25em;font-size:.86em}
.modal-box .stat-table td{padding:2px 8px;font-size:.8em}

.body{display:flex;flex:1;overflow:hidden}
.ep{flex:1;display:flex;flex-direction:column;overflow:hidden;border-right:1px solid var(--border,#ccc)}
.pp{flex:1;overflow:auto;position:relative}
.pp>.mdp{padding:1rem 1.4rem}

/* CSV table */
.csv-tbl{width:100%;border-collapse:collapse;font-size:.88em}
.csv-tbl th{padding:7px 10px;text-align:left;background:var(--text,#222);color:var(--surface,#fff);font-weight:600;position:sticky;top:0;z-index:1}
.csv-tbl td{padding:5px 10px;border-bottom:1px solid var(--border,#eee)}
.csv-tbl tr:nth-child(even) td{background:var(--hover,#f4f4f4)}
`;
