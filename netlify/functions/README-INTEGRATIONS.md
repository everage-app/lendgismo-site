# Integration Functions - Implementation Summary

**Last Updated**: December 9, 2025  
**Status**: ✅ Production Deployed

---

## Overview

This directory contains serverless functions for all third-party integrations. All functions follow a consistent pattern with CORS headers, mock mode support, and comprehensive error handling.

---

## Quick Reference — All Functions

| Function | Category | Purpose |
|----------|----------|---------|
| `contact-email.js` | Communications | Send contact form via SendGrid |
| `submission-created.js` | Webhooks | Event trigger for form submissions → Zapier/Google Chat |
| `integrations-status.js` | System | Check all integration configurations |
| `csv-upload.js` | Data | CSV file upload and processing |
| `plaid-link-token.js` | Banking | Create Plaid Link token |
| `plaid-exchange-token.js` | Banking | Exchange Plaid public token |
| `stripe-payment-intent.js` | Payments | Create Stripe payment intents |
| `stripe-webhook.js` | Payments | Handle Stripe webhooks |
| `twilio-send.js` | Communications | Send SMS via Twilio |
| `sendgrid-send.js` | Communications | Send email via SendGrid |
| `quickbooks-auth.js` | Accounting | Initiate QuickBooks OAuth |
| `quickbooks-callback.js` | Accounting | Handle OAuth callback |
| `quickbooks-company.js` | Accounting | Get company information |
| `quickbooks-reports.js` | Accounting | Get financial reports |
| `datamerch-analyze.js` | Risk | Submit business for analysis |
| `datamerch-report.js` | Risk | Retrieve analysis report |
| `datamerch-score.js` | Risk | Quick credit score check |
| `decisionlogic-verify.js` | Risk | Identity & credit verification |
| `decisionlogic-fraud-check.js` | Risk | Fraud detection analysis |
| `decisionlogic-report.js` | Risk | Comprehensive risk report |

---

## Available Integrations

### 📧 Contact Form & Email

**Purpose**: Handle contact form submissions and send emails via SendGrid

**Functions**:
- `contact-email.js` - Send contact form data to sales@lendgismo.com
- `submission-created.js` - Event-triggered function for Netlify Forms → Zapier/Google Chat webhooks

**Environment Variables**:
```bash
SENDGRID_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM=no-reply@lendgismo.com  # Optional, defaults to no-reply@lendgismo.com
```

**Webhook Environment Variables**:
```bash
INTERNAL_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/YOUR_ID/
INTERNAL_WEBHOOK_SECRET=your_hmac_secret
GOOGLE_CHAT_WEBHOOK_URL=https://chat.googleapis.com/v1/spaces/XXX/messages?key=YYY
```

**Example - Contact Email**:
```javascript
const response = await fetch('/.netlify/functions/contact-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@example.com',
    company: 'ABC Inc',
    role: 'CTO',
    phone: '555-123-4567',
    interest: '1-3-months',
    message: 'Looking for lending platform'
  })
});
```

---

### 🔗 Integrations Status

**Purpose**: Check which integrations are configured

**Functions**:
- `integrations-status.js` - Returns configuration status for all providers

**Response Example**:
```json
{
  "live": false,
  "providers": {
    "zapier": { "configured": true, "secured": true },
    "plaid": { "configured": false, "env": "sandbox" },
    "stripe": { "configured": false },
    "quickbooks": { "configured": false, "env": "sandbox" },
    "datamerch": { "configured": false, "env": "sandbox" },
    "decisionlogic": { "configured": false, "env": "sandbox" }
  }
}
```

---

### 🏦 Banking (Plaid)

**Purpose**: Bank account linking, balance, and transaction access

**Functions**:
- `plaid-link-token.js` - Create Plaid Link token for client-side widget
- `plaid-exchange-token.js` - Exchange public token for access token

**Environment Variables**:
```bash
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox  # sandbox | development | production
```

**Example Usage**:
```javascript
// Step 1: Get link token
const linkResponse = await fetch('/.netlify/functions/plaid-link-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'user_123' })
});
const { linkToken } = await linkResponse.json();

// Step 2: After Plaid Link, exchange token
const exchangeResponse = await fetch('/.netlify/functions/plaid-exchange-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ publicToken: 'public-xxx' })
});
const { accessToken } = await exchangeResponse.json();
```

---

### 💳 Payments (Stripe)

**Purpose**: Payment processing and webhook handling

**Functions**:
- `stripe-payment-intent.js` - Create payment intents
- `stripe-webhook.js` - Handle Stripe webhook events

**Environment Variables**:
```bash
STRIPE_SECRET=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK=whsec_xxxxxxxxxxxxx
```

**Example Usage**:
```javascript
// Create payment intent
const response = await fetch('/.netlify/functions/stripe-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 5000,  // $50.00 in cents
    currency: 'usd',
    metadata: { loanId: 'loan_123' }
  })
});
const { clientSecret } = await response.json();
```

---

### 📱 SMS (Twilio)

**Purpose**: Send SMS notifications

**Functions**:
- `twilio-send.js` - Send SMS messages

**Environment Variables**:
```bash
TWILIO_SID=ACxxxxxxxxxxxxx
TWILIO_TOKEN=your_auth_token
TWILIO_FROM=+15551234567
```

**Example Usage**:
```javascript
const response = await fetch('/.netlify/functions/twilio-send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: '+15559876543',
    message: 'Your loan application has been approved!'
  })
});
```

---

### 📧 Email (SendGrid)

**Purpose**: Send transactional emails

**Functions**:
- `sendgrid-send.js` - Send emails via SendGrid API

**Environment Variables**:
```bash
SENDGRID_KEY=SG.xxxxxxxxxxxxx
```

**Example Usage**:
```javascript
const response = await fetch('/.netlify/functions/sendgrid-send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Application Update',
    text: 'Your application status has changed.',
    html: '<p>Your application status has changed.</p>'
  })
});
```

---

### 🏦 QuickBooks (Accounting)

**Purpose**: OAuth-based accounting data sync for financial analysis

**Functions**:
- `quickbooks-auth.js` - Initiate OAuth 2.0 flow
- `quickbooks-callback.js` - Handle OAuth callback and token exchange
- `quickbooks-company.js` - Retrieve company information
- `quickbooks-reports.js` - Get financial reports (P&L, Balance Sheet, Cash Flow)

**Environment Variables**:
```bash
QUICKBOOKS_CLIENT_ID=your_client_id
QUICKBOOKS_CLIENT_SECRET=your_client_secret
QUICKBOOKS_REDIRECT_URI=https://yourdomain.com/.netlify/functions/quickbooks-callback
QUICKBOOKS_ENV=sandbox  # or production
```

**Example Usage**:
```javascript
// Step 1: Initiate OAuth
const authResponse = await fetch('/.netlify/functions/quickbooks-auth');
const { authUrl } = await authResponse.json();
window.location.href = authUrl;

// Step 2: After callback, get company info
const companyResponse = await fetch('/.netlify/functions/quickbooks-company', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ realmId, accessToken })
});
```

**Mock Mode**: Returns realistic company and financial data when credentials not configured

---

### 📊 DataMerch (Alternative Data)

**Purpose**: Alternative credit scoring and business analytics for thin-file borrowers

**Functions**:
- `datamerch-analyze.js` - Submit business data for comprehensive analysis
- `datamerch-report.js` - Retrieve completed analysis report
- `datamerch-score.js` - Get instant alternative credit score

**Environment Variables**:
```bash
DATAMERCH_API_KEY=your_api_key
DATAMERCH_API_URL=https://api.datamerch.com/v1
DATAMERCH_ENV=sandbox  # or production
```

**Example Usage**:
```javascript
// Quick score check
const scoreResponse = await fetch('/.netlify/functions/datamerch-score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    businessName: 'ABC Manufacturing Inc',
    taxId: '12-3456789',
    quickCheck: true
  })
});

const { score } = await scoreResponse.json();
console.log('Credit Score:', score.creditScore);
console.log('Risk Level:', score.riskLevel);
```

**Mock Mode**: Returns realistic alternative credit scores (600-750 range) and detailed risk factors

---

### 🛡️ DecisionLogic (Credit & Fraud)

**Purpose**: Identity verification, credit checks, and fraud detection

**Functions**:
- `decisionlogic-verify.js` - Verify applicant identity and credit
- `decisionlogic-fraud-check.js` - Run comprehensive fraud analysis
- `decisionlogic-report.js` - Retrieve full risk assessment report

**Environment Variables**:
```bash
DECISIONLOGIC_API_KEY=your_api_key
DECISIONLOGIC_API_URL=https://api.decisionlogic.com/v1
DECISIONLOGIC_ENV=sandbox  # or production
```

**Example Usage**:
```javascript
// Complete risk assessment workflow
async function assessApplicant(application) {
  // Step 1: Identity verification
  const verifyResponse = await fetch('/.netlify/functions/decisionlogic-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: application.firstName,
      lastName: application.lastName,
      dateOfBirth: application.dob,
      ssn: application.ssn,
      address: application.address,
      verificationLevel: 'standard'
    })
  });
  
  const verification = await verifyResponse.json();
  
  if (verification.results.identityMatch !== 'confirmed') {
    return { decision: 'reject', reason: 'Identity verification failed' };
  }
  
  // Step 2: Fraud detection
  const fraudResponse = await fetch('/.netlify/functions/decisionlogic-fraud-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      applicationId: application.id,
      applicant: { /* applicant data */ },
      loan: { /* loan data */ },
      checkLevel: 'comprehensive'
    })
  });
  
  const fraudCheck = await fraudResponse.json();
  
  return {
    decision: fraudCheck.results.fraudScore >= 100 ? 'approve' : 'manual_review',
    fraudScore: fraudCheck.results.fraudScore,
    riskLevel: fraudCheck.results.riskLevel
  };
}
```

**Mock Mode**: Returns comprehensive verification data with configurable risk levels

---

## Common Patterns

### CORS Headers

All functions include proper CORS headers:
```javascript
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

if (event.httpMethod === 'OPTIONS') {
  return { statusCode: 200, headers, body: '' };
}
```

### Mock Mode Detection

Functions automatically return mock data when credentials are not configured:
```javascript
if (!API_KEY) {
  return {
    statusCode: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: true,
      mock: true,
      message: 'Service not configured - returning mock data',
      data: { /* realistic mock data */ }
    })
  };
}
```

### Error Handling

Consistent error response format:
```javascript
try {
  // API call logic
} catch (error) {
  console.error('Function error:', error);
  return {
    statusCode: 500,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: false,
      error: error.message,
      provider: 'service-name'
    })
  };
}
```

### Response Format

All successful responses follow this structure:
```javascript
{
  success: true,
  [data]: { /* primary response data */ },
  provider: 'service-name',
  environment: 'sandbox' // or 'production'
}
```

---

## Testing

### Local Testing

```bash
# Install Netlify CLI
npm install -D netlify-cli

# Start dev server with functions
npx netlify dev

# Functions available at:
# http://localhost:8888/.netlify/functions/[function-name]
```

### Sandbox Testing

All integrations support sandbox/test modes:

1. **QuickBooks**: Use sandbox company with test credentials
2. **DataMerch**: Test API key returns predictable data
3. **DecisionLogic**: Test identities (SSN 111-11-1111 = approved, 666-66-6666 = high risk)

### Mock Mode Testing

Test without any credentials configured:
```bash
# Don't set any API keys
# Functions automatically return mock data
curl https://lendgismo.com/.netlify/functions/datamerch-score \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"businessName":"Test Co","taxId":"12-3456789","quickCheck":true}'

# Response will include: "mock": true
```

---

## Security Best Practices

### 1. Never Expose API Keys
- Store in Netlify environment variables (Site Settings > Build & Deploy > Environment)
- Never commit to version control
- Rotate keys every 90 days

### 2. PII Protection
- Never log SSN, full credit card numbers, or account numbers
- Mask sensitive data in responses: `***-**-6789`
- Encrypt PII at rest and in transit

### 3. Rate Limiting
- Implement per-tenant rate limits in application layer
- Monitor for unusual usage patterns
- Set up alerts for rate limit violations

### 4. Audit Logging
- Log all integration API calls with:
  - User/tenant ID
  - Timestamp
  - Endpoint called
  - Success/failure status
  - No PII data

### 5. Token Management
- QuickBooks tokens: Refresh 5 minutes before expiration
- Store OAuth tokens encrypted per-tenant
- Implement token rotation policies

---

## Deployment Status

**Production URL**: https://lendgismo.com  
**Deploy ID**: 690cf10c10ffe5e5ca4ad0e6  
**Functions Deployed**: 21 total

### QuickBooks Functions
✅ quickbooks-auth.js  
✅ quickbooks-callback.js  
✅ quickbooks-company.js  
✅ quickbooks-reports.js

### DataMerch Functions
✅ datamerch-analyze.js  
✅ datamerch-report.js  
✅ datamerch-score.js

### DecisionLogic Functions
✅ decisionlogic-verify.js  
✅ decisionlogic-fraud-check.js  
✅ decisionlogic-report.js

---

## Documentation

**Full Integration Guides**: [docs/40_integrations.md](../../docs/40_integrations.md)  
**API Quick Start**: [docs/50_api-quickstart.md](../../docs/50_api-quickstart.md)  
**Configuration**: [docs/30_configuration.md](../../docs/30_configuration.md)  
**Secrets Management**: [docs/31_secrets-and-keys.md](../../docs/31_secrets-and-keys.md)

---

## Support & Troubleshooting

### Common Issues

**Issue**: "API key not configured" error  
**Solution**: Set environment variables in Netlify dashboard

**Issue**: OAuth redirect fails  
**Solution**: Verify `QUICKBOOKS_REDIRECT_URI` matches exactly in QuickBooks app settings

**Issue**: CORS errors in browser  
**Solution**: Ensure OPTIONS method is handled; check CORS headers include `Authorization`

**Issue**: Mock data returned in production  
**Solution**: Verify environment variables are set in production deploy context

### Function Logs

View function execution logs:
```bash
# Via Netlify CLI
npx netlify functions:log [function-name]

# Or in Netlify dashboard:
# https://app.netlify.com/projects/lendgismo/logs/functions
```

---

## Future Integrations (Roadmap)

- [ ] Socure (Identity Verification)
- [ ] Alloy (KYC/AML)
- [ ] Experian (Business Credit Bureau)
- [ ] Dun & Bradstreet (Business Intelligence)
- [ ] Finicity (Bank Data Aggregation)

---

**Questions?** Contact the development team or open an issue.
