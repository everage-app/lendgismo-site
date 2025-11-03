export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const { PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV, INTEGRATIONS_LIVE } = process.env;
  const live = INTEGRATIONS_LIVE === 'true';
  const configured = !!PLAID_CLIENT_ID && !!PLAID_SECRET;
  if (!live || !configured) {
    // Mock response for demos without secrets
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ link_token: 'mock-link-token', mock: true })
    };
  }
  try {
    // Lazy import to avoid bundling unused deps if not configured
    const plaid = await import('plaid');
    const { PlaidApi, Configuration, PlaidEnvironments } = plaid;
    const cfg = new Configuration({
      basePath: PlaidEnvironments[(PLAID_ENV || 'sandbox')],
      baseOptions: { headers: { 'PLAID-CLIENT-ID': PLAID_CLIENT_ID, 'PLAID-SECRET': PLAID_SECRET } }
    });
    const client = new PlaidApi(cfg);
    const res = await client.linkTokenCreate({
      client_name: 'Lendgismo',
      language: 'en',
      country_codes: ['US'],
      user: { client_user_id: 'demo-user' },
      products: ['transactions']
    });
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(res.data) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Plaid error', details: String(err) }) };
  }
}
