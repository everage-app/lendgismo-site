# Integration Functions - Implementation Summary

**Last Updated**: January 2025  
**Status**: ✅ Production Deployed

---

## Overview

This directory contains serverless functions for all third-party integrations. All functions follow a consistent pattern with CORS headers, mock mode support, and comprehensive error handling.

---

## Available Integrations

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
