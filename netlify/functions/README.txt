Netlify Functions live here. Endpoints will be available under /.netlify/functions/<name> in production, and via /api/<name> if you create matching redirects in netlify.toml.

This folder contains safe, environment-gated stubs for:
- plaid-link-token
- plaid-exchange-token
- stripe-payment-intent
- stripe-webhook
- twilio-send
- sendgrid-send
- csv-upload
