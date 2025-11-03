# Integrations Overview

Last Updated: October 17, 2025  
Audience: Product, Engineering, and Buyers evaluating capabilities

---

## At a glance

- Turnkey integrations covering banking, payments, messaging, email, and data onboarding
- Environment-driven toggles and minimal endpoint surface
- Sandbox-first setup instructions and test flows
- Security and compliance considerations by provider

Quick links

- [Plaid (Banking)](#plaid-banking)
- [Stripe (Payments)](#stripe-payments)
- [Twilio (SMS)](#twilio-sms)
- [SendGrid (Email)](#sendgrid-email)
- [CSV Upload & Onboarding](#csv-upload--onboarding)

---

## Plaid (Banking)

Status: Implemented (scaffolded)  
Purpose: Bank account linking, balance and transaction access, identity

Environment variables

- PLAID_CLIENT_ID
- PLAID_SECRET
- PLAID_ENV: sandbox | development | production

Suggested endpoints

- POST /api/plaid/link-token — create Link token (server-side)
- POST /api/plaid/exchange-token — exchange public_token for access_token
- GET /api/plaid/accounts/:id — retrieve account metadata
- GET /api/plaid/transactions/:id — retrieve transactions

Client integration hooks

- Trigger Plaid Link in the UI (Account Connection component)
- On success, send public_token to exchange endpoint
- Persist linked account(s) and surface balances/transactions in dashboards

Testing

- Use Plaid sandbox credentials in PLAID_ENV=sandbox
- Validate link, exchange, and account/transaction retrieval flows

Security

- Store access tokens encrypted at rest; restrict access by role/tenant
- Do not log secrets; audit key access; rotate per policy

---

## Stripe (Payments)

Status: Implemented (scaffolded)  
Purpose: Payment initiation, subscriptions, repayment tracking

Environment variables

- STRIPE_SECRET
- STRIPE_WEBHOOK

Suggested endpoints

- POST /api/stripe/payment-intent — create a payment intent
- POST /api/stripe/webhook — process Stripe webhooks

Client integration hooks

- Use Stripe.js/Elements for client-side card entry
- Confirm payment intent and handle success/failure callbacks

Testing

- Use Stripe test mode; verify webhook handler receives events

Security

- Validate webhook signatures; never expose STRIPE_SECRET to clients
- Limit scope of operations to specific tenants

---

## Twilio (SMS)

Status: Implemented (scaffolded)  
Purpose: SMS notifications for invites, approvals, and status changes

Environment variables

- TWILIO_SID
- TWILIO_TOKEN
- TWILIO_FROM

Suggested endpoints

- POST /api/notifications/sms — send an SMS (role-protected)

Client integration hooks

- From UI actions (e.g., invite approve) call the SMS endpoint
- Display delivery status to lenders/admin users

Testing

- Use test credentials; confirm delivery logs and status updates

Security

- Rate-limit notification endpoints; log and audit sending events

---

## SendGrid (Email)

Status: Implemented (scaffolded)  
Purpose: Transactional email delivery for invites and notifications

Environment variables

- EMAIL_PROVIDER=sendgrid
- SENDGRID_KEY

Suggested endpoints

- POST /api/notifications/email — send transactional emails

Client integration hooks

- Trigger invite and status emails from lender workflows

Testing

- Use a non-production API key; verify delivery in SendGrid dashboard

Security

- Keep keys in secret storage; apply DKIM/SPF for production domains

---

## CSV Upload & Onboarding

Status: Implemented  
Purpose: Import banking transactions, inventory, or customer data

Core features

- CSV wizard with validation, preview, and error surfacing
- Field mapping and duplicate detection
- Batch commit with rollback on failure

Suggested endpoints

- POST /api/imports/csv — upload and stage a CSV file (multipart/form-data)
- POST /api/imports/commit — validate and commit staged records
- GET /api/imports/:id/status — track processing status

Client integration hooks

- Upload CSV via wizard, show column mapping, preview parsed rows
- Display errors inline; allow retry and partial fixes

Testing

- Use controlled sample files; verify validation messages and final counts

Security

- Limit file size/type; scan mimetype and sanitize filenames
- Enforce tenant isolation; redact sensitive fields where appropriate

---

## Where everything lives

- Configuration: see `30_configuration.md` for env var matrix
- Secrets & rotation: see `31_secrets-and-keys.md`
- Feature flags & capabilities: see `40_features-overview.md`
- API flows & examples: see `50_api-quickstart.md`

---

## Buyer summary

- Out-of-the-box integrations with enterprise-ready defaults
- Clear upgrade path from sandbox to production
- Documentation and examples to shorten time-to-value

---

## Quick demo: run locally

The app includes a simple demo page that exercises the serverless endpoints and shows JSON results. When secrets are not configured, endpoints return safe mock responses so you can demo without external dependencies.

- Open: /demo/integrations
- Calls: Plaid link/exchange, Stripe payment intent, Twilio SMS, SendGrid email, and CSV upload

Local run options:

- One process (recommended):
	- Install once: npm i -D netlify-cli
	- Start: npx netlify dev
	- Open: http://localhost:8888/demo/integrations

- Separate processes:
	- App: npm run docs:dev (serves Vite on http://localhost:5100)
	- Functions: npx netlify dev --port 5101 --functions-port 9999 (then hit /.netlify/functions/*)

Feature gating:

- Set environment variables to switch from mock to real integrations (see provider sections above and 30/31 docs).
