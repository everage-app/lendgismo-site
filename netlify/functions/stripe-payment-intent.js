export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const body = event.body ? JSON.parse(event.body) : {};
  const { amount, currency = 'usd' } = body;
  if (!amount || typeof amount !== 'number') return { statusCode: 400, body: 'Missing amount (number, in cents)' };
  const { STRIPE_SECRET, INTEGRATIONS_LIVE } = process.env;
  const live = INTEGRATIONS_LIVE === 'true';
  if (!live || !STRIPE_SECRET) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_secret: 'mock_client_secret', mock: true }) };
  }
  try {
    const stripePkg = await import('stripe');
    const stripe = new stripePkg.default(STRIPE_SECRET, { apiVersion: '2024-09-30.acacia' });
    const intent = await stripe.paymentIntents.create({ amount, currency, automatic_payment_methods: { enabled: true } });
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_secret: intent.client_secret }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Stripe error', details: String(err) }) };
  }
}
