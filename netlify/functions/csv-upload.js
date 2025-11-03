function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const cols = line.split(',');
    const obj = {};
    headers.forEach((h, i) => obj[h] = (cols[i] ?? '').trim());
    return obj;
  });
  return { headers, rows };
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  // Two supported formats to keep dependencies light:
  // 1) Content-Type: text/csv (raw body)
  // 2) application/json with { csv: "a,b\n1,2" }
  const ct = event.headers['content-type'] || event.headers['Content-Type'] || '';
  let csvText = '';
  try {
    if (ct.includes('text/csv')) {
      csvText = event.body || '';
      if (event.isBase64Encoded) csvText = Buffer.from(csvText, 'base64').toString('utf8');
    } else {
      const body = event.body ? JSON.parse(event.body) : {};
      csvText = body.csv || '';
    }
  } catch {
    return { statusCode: 400, body: 'Invalid body' };
  }
  if (!csvText) return { statusCode: 400, body: 'Missing CSV content' };
  const { headers, rows } = parseCsv(csvText);
  const sample = rows.slice(0, 5);
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ headers, rowsParsed: rows.length, sample }) };
}
