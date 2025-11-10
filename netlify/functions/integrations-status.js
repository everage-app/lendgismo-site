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
        quickbooks: {
          configured: !!(env.QUICKBOOKS_CLIENT_ID && env.QUICKBOOKS_CLIENT_SECRET && env.QUICKBOOKS_REDIRECT_URI),
          env: env.QUICKBOOKS_ENV || 'sandbox'
        },
        datamerch: {
          configured: !!env.DATAMERCH_API_KEY,
          url: env.DATAMERCH_API_URL || 'https://api.datamerch.com/v1',
          env: env.DATAMERCH_ENV || 'sandbox'
        },
        decisionlogic: {
          configured: !!env.DECISIONLOGIC_API_KEY,
          url: env.DECISIONLOGIC_API_URL || 'https://api.decisionlogic.com/v1',
          env: env.DECISIONLOGIC_ENV || 'sandbox'
        },
      },
    }),
  };
}
