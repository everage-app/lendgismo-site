export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const body = event.body ? JSON.parse(event.body) : {};
  const public_token = body.public_token;
  if (!public_token) return { statusCode: 400, body: 'Missing public_token' };
  const { PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV, INTEGRATIONS_LIVE } = process.env;
  const live = INTEGRATIONS_LIVE === 'true';
  const configured = !!PLAID_CLIENT_ID && !!PLAID_SECRET;
  if (!live || !configured) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: 'mock-item', access_token: 'mock-access-token', mock: true })
    };
  }
  try {
    const plaid = await import('plaid');
    const { PlaidApi, Configuration, PlaidEnvironments } = plaid;
    const cfg = new Configuration({
      basePath: PlaidEnvironments[(PLAID_ENV || 'sandbox')],
      baseOptions: { headers: { 'PLAID-CLIENT-ID': PLAID_CLIENT_ID, 'PLAID-SECRET': PLAID_SECRET } }
    });
    const client = new PlaidApi(cfg);
  const res = await client.itemPublicTokenExchange({ public_token });
  // Do not return access_token to the browser
  const { item_id } = res.data || {};
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item_id, status: 'exchanged' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Plaid exchange error', details: String(err) }) };
  }
}
