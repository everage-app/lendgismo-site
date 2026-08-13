import leadStore from './lead-store.cjs';

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

function getBearerToken(value = '') {
  const match = String(value).match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

function authorized(event) {
  const expected = process.env.LEAD_INTERNAL_TOKEN || process.env.INTERNAL_WEBHOOK_SECRET;
  if (!expected) return { ok: false, reason: 'missing-internal-token' };

  const provided =
    getBearerToken(event.headers?.authorization || event.headers?.Authorization) ||
    event.headers?.['x-internal-secret'] ||
    event.headers?.['X-Internal-Secret'] ||
    '';

  return { ok: provided === expected, reason: provided ? 'invalid-token' : 'missing-token' };
}

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return json(405, { ok: false, error: 'Method not allowed' });
  }

  const auth = authorized(event);
  if (!auth.ok) {
    const statusCode = auth.reason === 'missing-internal-token' ? 503 : 401;
    return json(statusCode, { ok: false, error: auth.reason });
  }

  try {
    const limit = new URLSearchParams(event.rawQuery || '').get('limit');
    const [health, leads] = await Promise.all([
      leadStore.getLeadStoreHealth(),
      leadStore.listRecentLeads({ limit }),
    ]);

    return json(200, {
      ok: health.ok && leads.ok,
      generatedAt: new Date().toISOString(),
      health,
      leads: leads.rows,
    });
  } catch (error) {
    return json(500, {
      ok: false,
      generatedAt: new Date().toISOString(),
      error: String(error && error.message || error),
    });
  }
}
