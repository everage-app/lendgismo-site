export async function handler() {
  const env = process.env;
  const live = env.INTEGRATIONS_LIVE === 'true';
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      live,
      providers: {
        plaid: { configured: !!(env.PLAID_CLIENT_ID && env.PLAID_SECRET), env: env.PLAID_ENV || 'sandbox' },
        stripe: { configured: !!env.STRIPE_SECRET, webhook: !!env.STRIPE_WEBHOOK },
        twilio: { configured: !!(env.TWILIO_SID && env.TWILIO_TOKEN && env.TWILIO_FROM) },
        sendgrid: { configured: !!env.SENDGRID_KEY },
      },
    }),
  };
}
