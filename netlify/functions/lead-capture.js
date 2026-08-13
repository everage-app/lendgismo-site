import leadStore from './lead-store.cjs';

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

async function forwardToHeroku(payload) {
  const url = process.env.HEROKU_LEAD_CAPTURE_URL || process.env.PLATFORM_LEAD_CAPTURE_URL;
  if (!url) {
    return {
      ok: false,
      skipped: true,
      reason: 'missing-heroku-lead-capture-url',
      detail: 'Set HEROKU_LEAD_CAPTURE_URL or PLATFORM_LEAD_CAPTURE_URL if the Heroku app should receive website leads directly.',
    };
  }

  const headers = { 'Content-Type': 'application/json' };
  const token = process.env.HEROKU_LEAD_CAPTURE_TOKEN || process.env.PLATFORM_LEAD_CAPTURE_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      source: 'lendgismo-netlify-site',
      receivedAt: new Date().toISOString(),
      ...payload,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, status: res.status, error: body.slice(0, 500) };
  }

  return { ok: true, status: res.status };
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {});
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'Method not allowed' });

  try {
    const payload = JSON.parse(event.body || '{}');
    const formName = payload.formName || payload.form_name || 'contact';
    const [heroku, directDb] = await Promise.allSettled([
      forwardToHeroku({ formName, ...payload }),
      leadStore.saveLead({
        formName,
        source: 'lead-capture',
        fields: payload,
        raw: payload,
      }),
    ]);

    const herokuResult = heroku.status === 'fulfilled' ? heroku.value : { ok: false, error: String(heroku.reason) };
    const directDbResult = directDb.status === 'fulfilled' ? directDb.value : { ok: false, error: String(directDb.reason) };

    return json(200, {
      ok: herokuResult.ok || directDbResult.ok || directDbResult.safe,
      heroku: herokuResult,
      directDb: directDbResult,
    });
  } catch (error) {
    return json(500, {
      ok: false,
      error: String(error && error.message || error),
    });
  }
}
