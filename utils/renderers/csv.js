function detectDelimiter(line) {
  for (const d of [',', ';', '\t', '|']) if (line.includes(d)) return d;
  return ',';
}

function parseCSVLine(line, delim) {
  const cells = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === delim && !inQ) {
      cells.push(cur.trim()); cur = '';
    } else cur += c;
  }
  cells.push(cur.trim());
  return cells;
}

export function parseCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (!lines.length) throw new Error('No CSV data');
  const delim = detectDelimiter(lines[0]);
  return lines.map(l => parseCSVLine(l, delim));
}

export function renderCSV(content, outputEl) {
  const rows = parseCSV(content);

  const wrap = document.createElement('div');
  wrap.style.cssText = 'overflow:auto;width:100%;height:100%';
  const table = document.createElement('table');
  table.className = 'csv-tbl';
  table.setAttribute('role', 'table');

  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  rows.forEach((row, ri) => {
    const tr = document.createElement('tr');
    row.forEach(cell => {
      const el = document.createElement(ri === 0 ? 'th' : 'td');
      el.textContent = cell;
      tr.appendChild(el);
    });
    (ri === 0 ? thead : tbody).appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  wrap.appendChild(table);
  outputEl.innerHTML = '';
  outputEl.appendChild(wrap);
  return rows;
}

export function calcStats(rows) {
  if (rows.length < 2) return null;
  const headers = rows[0];
  const data = rows.slice(1);
  const stats = {};

  headers.forEach((h, ci) => {
    const col = data.map(r => r[ci] || '').filter(Boolean);
    if (!col.length) { stats[h] = { type: 'empty' }; return; }
    const nums = col.map(Number).filter(v => !isNaN(v) && v !== Infinity);
    if (nums.length === col.length) {
      const sorted = [...nums].sort((a, b) => a - b);
      const sum = sorted.reduce((a, b) => a + b, 0);
      const mid = Math.floor(sorted.length / 2);
      stats[h] = {
        type: 'numeric', count: sorted.length,
        min: sorted[0], max: sorted[sorted.length - 1],
        mean: (sum / sorted.length).toFixed(2),
        median: sorted.length % 2 ? sorted[mid].toFixed(2) : ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2),
        sum: sum.toFixed(2),
      };
    } else {
      const freq = {};
      col.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
      const mostCommon = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
      stats[h] = { type: 'text', count: col.length, unique: new Set(col).size, mostCommon };
    }
  });
  return stats;
}

export function renderStats(stats, containerEl) {
  if (!stats) { containerEl.innerHTML = '<p>Not enough data.</p>'; return; }
  let html = '';
  for (const [h, s] of Object.entries(stats)) {
    html += `<div class="stat-col"><h3>${h}</h3>`;
    if (s.type === 'empty') {
      html += '<p>No data</p>';
    } else if (s.type === 'numeric') {
      html += `<table class="stat-table">
        <tr><td>Count</td><td>${s.count}</td></tr>
        <tr><td>Min</td><td>${s.min}</td></tr>
        <tr><td>Max</td><td>${s.max}</td></tr>
        <tr><td>Sum</td><td>${s.sum}</td></tr>
        <tr><td>Mean</td><td>${s.mean}</td></tr>
        <tr><td>Median</td><td>${s.median}</td></tr>
      </table>`;
    } else {
      html += `<table class="stat-table">
        <tr><td>Count</td><td>${s.count}</td></tr>
        <tr><td>Unique</td><td>${s.unique}</td></tr>
        <tr><td>Most common</td><td>"${s.mostCommon}"</td></tr>
      </table>`;
    }
    html += '</div>';
  }
  containerEl.innerHTML = html;
}
