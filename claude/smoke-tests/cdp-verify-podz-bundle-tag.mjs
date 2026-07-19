// Bundle-defined-tag check: the Pod Browser entry carries a schema:url module
// /dk-pod/dk/plugins/podz/dk-podz.js purely as a TAG DECLARATION —
// ensureHandler must SKIP importing it (dk-podz is defined by the bundle).
// Open Pods ▸ Data Kitchen Pod Browser, assert it mounts + no double-define
// or module-load errors on the console.
const PORT = 9223;
const targets = await (await fetch(`http://localhost:${PORT}/json`)).json();
const page = targets.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0; const pending = new Map();
const send = (m, p = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const errors = [];
ws.onmessage = m => { const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) { const { res, rej } = pending.get(d.id); pending.delete(d.id); d.error ? rej(new Error(d.error.message)) : res(d.result); return; }
  if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') errors.push(d.params.args.map(a => a.value ?? a.description ?? '').join(' '));
  if (d.method === 'Log.entryAdded' && d.params.entry.level === 'error') errors.push(d.params.entry.text);
};
await new Promise(r => ws.onopen = r);
await send('Runtime.enable'); await send('Log.enable');
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function evalJS(expr) {
  const r = await send('Runtime.evaluate', { expression: `(async()=>{${expr}})()`, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result?.value;
}
let fails = 0;
const check = (l, ok, d = '') => { console.log(`${ok ? '✔' : '✘'} ${l}${d ? ' — ' + d : ''}`); if (!ok) fails++; };

for (let i = 0; i < 20; i++) {
  const up = await evalJS(`return !!document.querySelector('.sol-tabs-bar sol-dropdown-button');`);
  if (up) break;
  await sleep(2000);
}
const res = await evalJS(`
  const dd = [...document.querySelectorAll('sol-dropdown-button.sol-tabs-submenu')]
    .find(d => (d.getAttribute('source') || '').includes('Pods'));
  if (!dd) return { noPods: true };
  dd.shadowRoot.querySelector('button').click();
  await new Promise(r => setTimeout(r, 800));
  const rows = [...dd.shadowRoot.querySelectorAll('[role="menuitem"], a, button')];
  const podz = rows.find(el => /pod browser/i.test(el.textContent || ''));
  if (!podz) return { noPodzRow: rows.map(el => (el.textContent || '').trim().slice(0, 20)) };
  podz.click();
  await new Promise(r => setTimeout(r, 8000));
  const el = document.getElementById('panel-podz') || document.querySelector('dk-podz');
  return { mounted: !!el, visible: !!el && el.offsetParent !== null,
           defined: !!customElements.get('dk-podz') };
`);
check('Podz mounts from its reference (bundle-defined tag)', res.mounted && res.defined, JSON.stringify(res));
const dblDefine = errors.filter(e => /already been (defined|used)|dk-podz/i.test(e));
check('no double-define / module errors', dblDefine.length === 0, dblDefine.slice(0, 2).join(' | '));
console.log(fails ? `FAILED ${fails}` : 'ALL OK');
ws.close(); process.exit(fails ? 1 : 0);
