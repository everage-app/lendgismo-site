export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  const { STRIPE_SECRET, STRIPE_WEBHOOK, INTEGRATIONS_LIVE } = process.env;
  const live = INTEGRATIONS_LIVE === 'true';
  // With no secrets or not live, just accept and log
  if (!live || !STRIPE_SECRET || !STRIPE_WEBHOOK) {
    return { statusCode: 200, body: JSON.stringify({ received: true, mock: true }) };
  }
  try {
    const stripePkg = await import('stripe');
    const stripe = new stripePkg.default(STRIPE_SECRET, { apiVersion: '2024-09-30.acacia' });
    const eventObj = stripe.webhooks.constructEvent(event.body, sig, STRIPE_WEBHOOK);
    // Basic type switch
    switch (eventObj.type) {
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
      default:
        break;
    }
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid webhook', details: String(err) }) };
  }
}
