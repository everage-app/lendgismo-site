# Integrations Overview

Last Updated: October 17, 2025  
Audience: Product, Engineering, and Buyers evaluating capabilities

---

## At a glance

- Turnkey integrations covering banking, payments, messaging, email, alternative data, fraud detection, and identity verification
- Environment-driven toggles and minimal endpoint surface
- Sandbox-first setup instructions and test flows
- Security and compliance considerations by provider

Quick links

- [Plaid (Banking)](#plaid-banking)
- [Stripe (Payments)](#stripe-payments)
- [Twilio (SMS)](#twilio-sms)
- [SendGrid (Email)](#sendgrid-email)
- [QuickBooks (Accounting)](#quickbooks-accounting)
- [DataMerch (Alternative Data)](#datamerch-alternative-data)
- [DecisionLogic (Credit & Fraud)](#decisionlogic-credit--fraud)
- [Socure/Alloy (Identity Verification)](#socurealloy-identity-verification)
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

## QuickBooks (Accounting)

Status: Scaffolded (ready for implementation)  
Purpose: Accounting data sync for underwriting and financial analysis

Environment variables

- QUICKBOOKS_CLIENT_ID
- QUICKBOOKS_CLIENT_SECRET
- QUICKBOOKS_REDIRECT_URI
- QUICKBOOKS_ENV: sandbox | production

Suggested endpoints

- GET /api/quickbooks/auth — initiate OAuth flow
- POST /api/quickbooks/callback — handle OAuth callback
- GET /api/quickbooks/company/:id — retrieve company info
- GET /api/quickbooks/reports/:id — pull P&L, balance sheet, cash flow

Client integration hooks

- Trigger QuickBooks connection in borrower onboarding
- Display financial statements in underwriting dashboard
- Auto-refresh data for ongoing monitoring

Testing

- Use QuickBooks sandbox credentials
- Verify OAuth flow and data retrieval

Security

- Store tokens encrypted; implement token refresh logic
- Limit scope to read-only financial data

---

## DataMerch (Alternative Data)

Status: Scaffolded (ready for implementation)  
Purpose: Alternative data analytics for enhanced underwriting decisions

Environment variables

- DATAMERCH_API_KEY
- DATAMERCH_API_URL
- DATAMERCH_ENV: sandbox | production

Suggested endpoints

- POST /api/datamerch/analyze — submit business data for analysis
- GET /api/datamerch/report/:id — retrieve alternative data report
- GET /api/datamerch/score/:businessId — get alternative credit score

Client integration hooks

- Integrate in underwriting workflow
- Display alternative data insights alongside traditional credit data
- Use for thin-file or no-file borrowers

Testing

- Use test API keys and sample business data
- Validate report parsing and score calculations

Security

- Secure API keys in vault storage
- Audit all data requests; comply with data privacy regulations

---

## DecisionLogic (Credit & Fraud)

Status: Scaffolded (ready for implementation)  
Purpose: Credit decisioning and fraud detection for risk mitigation

Environment variables

- DECISIONLOGIC_API_KEY
- DECISIONLOGIC_API_URL
- DECISIONLOGIC_ENV: sandbox | production

Suggested endpoints

- POST /api/decisionlogic/verify — verify borrower identity and credit
- POST /api/decisionlogic/fraud-check — run fraud detection analysis
- GET /api/decisionlogic/report/:applicationId — retrieve full risk report

Client integration hooks

- Auto-trigger on loan application submission
- Display fraud scores and risk flags in underwriting dashboard
- Block high-risk applications with configurable thresholds

Testing

- Use sandbox mode with test identities
- Verify fraud detection accuracy and response handling

Security

- Encrypt API keys; implement rate limiting
- Log all verification attempts for audit trail
- Comply with FCRA and data protection regulations

---

## Socure/Alloy (Identity Verification)

Status: Scaffolded (ready for implementation)  
Purpose: KYC/KYB identity verification and compliance

Environment variables

- IDENTITY_PROVIDER: socure | alloy
- SOCURE_API_KEY / ALLOY_API_KEY
- SOCURE_API_URL / ALLOY_API_URL
- IDENTITY_ENV: sandbox | production

Suggested endpoints

- POST /api/identity/verify — verify individual or business identity
- GET /api/identity/status/:verificationId — check verification status
- POST /api/identity/document-upload — upload ID documents for verification

Client integration hooks

- Integrate in borrower onboarding flow
- Display verification status in real-time
- Block unverified users from progressing

Testing

- Use test documents and sandbox identities
- Verify pass/fail scenarios and edge cases

Security

- Secure API keys; encrypt PII data in transit and at rest
- Implement data retention policies
- Comply with KYC/AML regulations and SOC 2 requirements

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
