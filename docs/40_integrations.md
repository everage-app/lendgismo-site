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

Status: **Implemented**  
Purpose: Accounting data sync for underwriting and financial analysis

### Environment Variables

```bash
QUICKBOOKS_CLIENT_ID=your_client_id
QUICKBOOKS_CLIENT_SECRET=your_client_secret
QUICKBOOKS_REDIRECT_URI=https://yourdomain.com/.netlify/functions/quickbooks-callback
QUICKBOOKS_ENV=sandbox # or production
```

### Available Endpoints

#### 1. Initiate OAuth Flow
```
GET /.netlify/functions/quickbooks-auth
```

**Example Request:**
```javascript
// Client-side initiation
const response = await fetch('/.netlify/functions/quickbooks-auth');
const data = await response.json();

if (data.success) {
  // Redirect user to QuickBooks authorization page
  window.location.href = data.authUrl;
}
```

**Response:**
```json
{
  "success": true,
  "authUrl": "https://appcenter.intuit.com/connect/oauth2?client_id=...",
  "state": "random-state-token-abc123",
  "provider": "quickbooks"
}
```

#### 2. Handle OAuth Callback
```
GET /.netlify/functions/quickbooks-callback?code=xxx&state=xxx&realmId=xxx
```

**Response:**
```json
{
  "success": true,
  "realmId": "1234567890",
  "accessToken": "eyJhbGciOiJSUzI1...",
  "refreshToken": "L011546037287...",
  "expiresIn": 3600,
  "tokenType": "Bearer",
  "provider": "quickbooks",
  "environment": "sandbox"
}
```

#### 3. Get Company Information
```
POST /.netlify/functions/quickbooks-company
```

**Request Body:**
```json
{
  "realmId": "1234567890",
  "accessToken": "eyJhbGciOiJSUzI1..."
}
```

**Response:**
```json
{
  "success": true,
  "company": {
    "CompanyName": "Sandbox Company_US_1",
    "LegalName": "Sandbox Company US 1",
    "CompanyAddr": {
      "Line1": "123 Main Street",
      "City": "Mountain View",
      "CountrySubDivisionCode": "CA",
      "PostalCode": "94043",
      "Country": "USA"
    },
    "Email": "contact@company.com",
    "WebAddr": "www.company.com",
    "FiscalYearStartMonth": "January"
  },
  "provider": "quickbooks",
  "environment": "sandbox"
}
```

#### 4. Get Financial Reports
```
POST /.netlify/functions/quickbooks-reports
```

**Request Body:**
```json
{
  "realmId": "1234567890",
  "accessToken": "eyJhbGciOiJSUzI1...",
  "reportType": "ProfitAndLoss",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Available Report Types:**
- `ProfitAndLoss` - Income statement
- `BalanceSheet` - Balance sheet
- `CashFlow` - Cash flow statement
- `ProfitAndLossDetail` - Detailed P&L

**Response:**
```json
{
  "success": true,
  "report": {
    "Header": {
      "ReportName": "Profit and Loss",
      "DateMacro": "This Fiscal Year",
      "ReportBasis": "Accrual",
      "Currency": "USD"
    },
    "Rows": {
      "Row": [
        {
          "type": "Section",
          "Summary": {
            "ColData": [
              {"value": "Total Income"},
              {"value": "125000.00"}
            ]
          }
        }
      ]
    }
  },
  "provider": "quickbooks",
  "environment": "sandbox"
}
```

### Client Integration Example

```javascript
// 1. Initiate QuickBooks connection
async function connectQuickBooks() {
  const response = await fetch('/.netlify/functions/quickbooks-auth');
  const data = await response.json();
  
  if (data.success) {
    // Store state for validation
    sessionStorage.setItem('qb_state', data.state);
    // Redirect to QuickBooks
    window.location.href = data.authUrl;
  }
}

// 2. Handle callback (after redirect)
async function handleQuickBooksCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const realmId = params.get('realmId');
  
  // Validate state
  const savedState = sessionStorage.getItem('qb_state');
  if (state !== savedState) {
    throw new Error('Invalid state token');
  }
  
  // Exchange code for tokens (handled automatically by callback endpoint)
  const response = await fetch(`/.netlify/functions/quickbooks-callback?code=${code}&state=${state}&realmId=${realmId}`);
  const data = await response.json();
  
  if (data.success) {
    // Store tokens securely (backend only)
    await saveQuickBooksConnection({
      realmId: data.realmId,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: Date.now() + (data.expiresIn * 1000)
    });
  }
}

// 3. Fetch company data
async function getCompanyInfo(realmId, accessToken) {
  const response = await fetch('/.netlify/functions/quickbooks-company', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ realmId, accessToken })
  });
  
  const data = await response.json();
  return data.company;
}

// 4. Get financial reports
async function getProfitAndLoss(realmId, accessToken, startDate, endDate) {
  const response = await fetch('/.netlify/functions/quickbooks-reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      realmId,
      accessToken,
      reportType: 'ProfitAndLoss',
      startDate,
      endDate
    })
  });
  
  const data = await response.json();
  return data.report;
}
```

### Testing

**Sandbox Setup:**
1. Create QuickBooks developer account at https://developer.intuit.com
2. Create a sandbox app and get client ID/secret
3. Set `QUICKBOOKS_ENV=sandbox`
4. Test with sandbox company data

**Test Flow:**
```bash
# 1. Initiate OAuth
curl https://yourdomain.com/.netlify/functions/quickbooks-auth

# 2. Complete OAuth in browser (redirects to callback automatically)

# 3. Test company info (use tokens from callback)
curl -X POST https://yourdomain.com/.netlify/functions/quickbooks-company \
  -H "Content-Type: application/json" \
  -d '{"realmId":"1234567890","accessToken":"your_token"}'

# 4. Test financial report
curl -X POST https://yourdomain.com/.netlify/functions/quickbooks-reports \
  -H "Content-Type: application/json" \
  -d '{"realmId":"1234567890","accessToken":"your_token","reportType":"ProfitAndLoss","startDate":"2024-01-01","endDate":"2024-12-31"}'
```

### Security Best Practices

- **Token Storage**: Encrypt access/refresh tokens at rest; never expose to client
- **Token Refresh**: Implement automatic refresh before expiration (3600s)
- **Scope Limitation**: Request only `com.intuit.quickbooks.accounting` scope
- **HTTPS Only**: Ensure redirect URI uses HTTPS in production
- **State Validation**: Verify OAuth state parameter to prevent CSRF
- **Tenant Isolation**: Associate tokens with specific tenant/user IDs
- **Audit Logging**: Log all API calls and data access events
- **Error Handling**: Never expose API keys or detailed error messages to client

---

## DataMerch (Alternative Data)

Status: **Implemented**  
Purpose: Alternative data analytics for enhanced underwriting decisions

### Environment Variables

```bash
DATAMERCH_API_KEY=your_api_key
DATAMERCH_API_URL=https://api.datamerch.com/v1
DATAMERCH_ENV=sandbox # or production
```

### Available Endpoints

#### 1. Submit Business for Analysis
```
POST /.netlify/functions/datamerch-analyze
```

**Request Body:**
```json
{
  "businessName": "ABC Manufacturing Inc",
  "taxId": "12-3456789",
  "address": {
    "street": "123 Business Blvd",
    "city": "Chicago",
    "state": "IL",
    "zip": "60601"
  },
  "revenue": 2500000,
  "employees": 45,
  "industry": "Manufacturing",
  "yearsInBusiness": 8,
  "creditScore": 680
}
```

**Response:**
```json
{
  "success": true,
  "analysisId": "anlyz_abc123xyz789",
  "status": "processing",
  "estimatedCompletionTime": "2-5 minutes",
  "provider": "datamerch"
}
```

#### 2. Retrieve Analysis Report
```
POST /.netlify/functions/datamerch-report
```

**Request Body:**
```json
{
  "analysisId": "anlyz_abc123xyz789"
}
```

**Response:**
```json
{
  "success": true,
  "analysisId": "anlyz_abc123xyz789",
  "status": "completed",
  "completedAt": "2024-01-15T10:30:00Z",
  "report": {
    "businessRiskScore": 725,
    "creditScore": 680,
    "riskLevel": "medium",
    "recommendedCreditLimit": 50000,
    "paymentBehavior": {
      "avgDaysToPayment": 28,
      "latePaymentRate": 0.05,
      "totalTransactions": 247
    },
    "publicRecords": {
      "bankruptcies": 0,
      "liens": 0,
      "judgments": 0,
      "uccFilings": 2
    },
    "insights": [
      "Strong payment history with minimal late payments",
      "Active UCC filings indicate existing credit relationships",
      "Revenue trends show consistent growth over 24 months",
      "Industry benchmark: Above average for sector"
    ],
    "dataPoints": {
      "bankruptcyChecked": true,
      "liensChecked": true,
      "paydexScore": 78,
      "delinquencyRate": "Low"
    }
  },
  "provider": "datamerch"
}
```

#### 3. Get Real-Time Credit Score
```
POST /.netlify/functions/datamerch-score
```

**Request Body:**
```json
{
  "businessName": "ABC Manufacturing Inc",
  "taxId": "12-3456789",
  "quickCheck": true
}
```

**Response:**
```json
{
  "success": true,
  "score": {
    "businessName": "ABC Manufacturing Inc",
    "taxId": "**-***6789",
    "creditScore": 715,
    "riskScore": 690,
    "riskLevel": "medium-low",
    "scoreDate": "2024-01-15T10:35:00Z",
    "confidence": "high",
    "factors": [
      {"name": "Payment History", "impact": "positive", "weight": 35},
      {"name": "Credit Utilization", "impact": "neutral", "weight": 25},
      {"name": "Business Age", "impact": "positive", "weight": 20},
      {"name": "Public Records", "impact": "positive", "weight": 15},
      {"name": "Industry Risk", "impact": "neutral", "weight": 5}
    ],
    "quickCheck": true
  },
  "provider": "datamerch"
}
```

### Client Integration Example

```javascript
// 1. Submit business for comprehensive analysis
async function analyzeBusinessCredit(businessData) {
  const response = await fetch('/.netlify/functions/datamerch-analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(businessData)
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store analysis ID for later retrieval
    return data.analysisId;
  }
  throw new Error(data.error);
}

// 2. Poll for analysis completion
async function waitForAnalysis(analysisId, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch('/.netlify/functions/datamerch-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisId })
    });
    
    const data = await response.json();
    
    if (data.status === 'completed') {
      return data.report;
    }
    
    if (data.status === 'failed') {
      throw new Error('Analysis failed');
    }
    
    // Wait 30 seconds before next check
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
  
  throw new Error('Analysis timeout');
}

// 3. Get instant credit score (for quick checks)
async function getQuickScore(businessName, taxId) {
  const response = await fetch('/.netlify/functions/datamerch-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessName,
      taxId,
      quickCheck: true
    })
  });
  
  const data = await response.json();
  return data.score;
}

// Complete workflow example
async function underwriteWithDataMerch(application) {
  try {
    // Step 1: Quick score check
    const quickScore = await getQuickScore(
      application.businessName,
      application.taxId
    );
    
    console.log('Quick Score:', quickScore.creditScore);
    
    // Step 2: If score is borderline, run full analysis
    if (quickScore.creditScore >= 600 && quickScore.creditScore <= 700) {
      const analysisId = await analyzeBusinessCredit({
        businessName: application.businessName,
        taxId: application.taxId,
        address: application.address,
        revenue: application.annualRevenue,
        employees: application.employeeCount,
        industry: application.industry,
        yearsInBusiness: application.yearsInBusiness,
        creditScore: quickScore.creditScore
      });
      
      // Wait for comprehensive report
      const fullReport = await waitForAnalysis(analysisId);
      
      return {
        decision: determineDecision(fullReport),
        score: fullReport.businessRiskScore,
        report: fullReport,
        insights: fullReport.insights
      };
    }
    
    // Quick decision for clear cases
    return {
      decision: quickScore.creditScore >= 700 ? 'approve' : 'decline',
      score: quickScore.creditScore,
      quickCheck: true
    };
    
  } catch (error) {
    console.error('DataMerch underwriting error:', error);
    throw error;
  }
}
```

### Testing

**Sandbox Setup:**
1. Register at https://datamerch.com/developers
2. Get sandbox API key
3. Set `DATAMERCH_ENV=sandbox`

**Test Cases:**
```bash
# 1. Test business analysis
curl -X POST https://yourdomain.com/.netlify/functions/datamerch-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Business LLC",
    "taxId": "12-3456789",
    "revenue": 1000000,
    "employees": 25,
    "industry": "Retail",
    "yearsInBusiness": 5
  }'

# 2. Check analysis status
curl -X POST https://yourdomain.com/.netlify/functions/datamerch-report \
  -H "Content-Type: application/json" \
  -d '{"analysisId": "anlyz_test123"}'

# 3. Quick score check
curl -X POST https://yourdomain.com/.netlify/functions/datamerch-score \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Business LLC",
    "taxId": "12-3456789",
    "quickCheck": true
  }'
```

### Use Cases

1. **Thin-File Borrowers**: Use alternative data when traditional credit files are insufficient
2. **B2B Lending**: Assess payment behavior across vendor relationships
3. **Quick Pre-Qualification**: Fast score checks before full application
4. **Monitoring**: Regular credit checks for existing portfolio
5. **Fraud Detection**: Cross-reference UCC filings and public records

### Security Best Practices

- **API Key Protection**: Store in secure vault; never expose to client-side code
- **Data Minimization**: Only submit required fields for analysis
- **PII Handling**: Mask SSN/TaxID in responses; log only last 4 digits
- **Rate Limiting**: Implement per-tenant limits to prevent abuse
- **Audit Trail**: Log all analysis requests with user/tenant context
- **Data Retention**: Define clear policies for storing alternative credit data
- **Compliance**: Ensure FCRA compliance for credit decisions
- **Access Control**: Restrict report access to authorized underwriters only

---

## DecisionLogic (Credit & Fraud)

Status: **Implemented**  
Purpose: Credit decisioning and fraud detection for risk mitigation

### Environment Variables

```bash
DECISIONLOGIC_API_KEY=your_api_key
DECISIONLOGIC_API_URL=https://api.decisionlogic.com/v1
DECISIONLOGIC_ENV=sandbox # or production
```

### Available Endpoints

#### 1. Identity & Credit Verification
```
POST /.netlify/functions/decisionlogic-verify
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "dateOfBirth": "1985-06-15",
  "ssn": "123-45-6789",
  "address": {
    "street": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "zip": "78701"
  },
  "phone": "512-555-0100",
  "email": "john.smith@example.com",
  "verificationLevel": "standard"
}
```

**Verification Levels:**
- `basic` - Name, DOB, address matching
- `standard` - Basic + SSN + credit bureau check (recommended)
- `enhanced` - Standard + watchlist + sanctions + adverse media

**Response:**
```json
{
  "success": true,
  "verificationId": "vrfy_abc123xyz789",
  "status": "verified",
  "results": {
    "identityMatch": "confirmed",
    "identityScore": 92,
    "addressVerified": true,
    "phoneVerified": true,
    "emailVerified": true,
    "ssnVerified": true,
    "creditBureauMatch": true,
    "watchlistCheck": "clear",
    "sanctions": "clear",
    "pep": false,
    "adverseMedia": "none",
    "riskLevel": "low",
    "verificationLevel": "standard",
    "completedAt": "2024-01-15T10:45:00Z"
  },
  "warnings": [],
  "provider": "decisionlogic"
}
```

#### 2. Fraud Detection Analysis
```
POST /.netlify/functions/decisionlogic-fraud-check
```

**Request Body:**
```json
{
  "applicationId": "app_20240115_001",
  "applicant": {
    "firstName": "John",
    "lastName": "Smith",
    "dateOfBirth": "1985-06-15",
    "ssn": "123-45-6789",
    "address": {
      "street": "123 Main St",
      "city": "Austin",
      "state": "TX",
      "zip": "78701"
    },
    "phone": "512-555-0100",
    "email": "john.smith@example.com"
  },
  "loan": {
    "amount": 50000,
    "purpose": "business_expansion",
    "term": 36
  },
  "device": {
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "fingerprint": "fp_abc123"
  },
  "checkLevel": "comprehensive"
}
```

**Check Levels:**
- `basic` - Identity theft and synthetic ID checks
- `standard` - Basic + velocity checks + email/phone risk
- `comprehensive` - Standard + device fingerprint + behavioral analysis

**Response:**
```json
{
  "success": true,
  "fraudCheckId": "fchk_def456uvw789",
  "applicationId": "app_20240115_001",
  "status": "completed",
  "results": {
    "fraudScore": 125,
    "riskLevel": "low",
    "decision": "approve",
    "confidence": 0.94,
    "checks": {
      "identityTheft": "clear",
      "syntheticIdentity": "clear",
      "firstPartyFraud": "clear",
      "deviceFingerprint": "verified",
      "velocityChecks": "pass",
      "emailRisk": "low",
      "phoneRisk": "low",
      "addressRisk": "low",
      "behavioralAnalysis": "normal"
    },
    "flags": [],
    "indicators": [
      {
        "type": "positive",
        "name": "Consistent identity data",
        "severity": "info"
      },
      {
        "type": "positive",
        "name": "No velocity alerts",
        "severity": "info"
      }
    ],
    "checkLevel": "comprehensive",
    "completedAt": "2024-01-15T10:50:00Z"
  },
  "recommendations": [
    "Applicant presents low fraud risk",
    "Standard underwriting process recommended",
    "No additional verification required"
  ],
  "provider": "decisionlogic"
}
```

**Fraud Score Scale:**
- 0-49: Very High Risk (reject)
- 50-99: High Risk (manual review required)
- 100-149: Low Risk (standard processing)
- 150+: Very Low Risk (fast-track approval)

#### 3. Comprehensive Risk Report
```
POST /.netlify/functions/decisionlogic-report
```

**Request Body:**
```json
{
  "reportId": "rpt_ghi789rst012",
  "applicationId": "app_20240115_001"
}
```

**Response:**
```json
{
  "success": true,
  "reportId": "rpt_ghi789rst012",
  "applicationId": "app_20240115_001",
  "status": "completed",
  "generatedAt": "2024-01-15T10:55:00Z",
  "report": {
    "summary": {
      "overallRisk": "low",
      "decision": "approve",
      "confidence": 0.92,
      "creditScore": 720,
      "fraudScore": 135,
      "identityScore": 92
    },
    "identity": {
      "status": "verified",
      "nameMatch": "exact",
      "addressMatch": "confirmed",
      "ssnMatch": "valid",
      "dobMatch": "exact",
      "phoneMatch": "active",
      "emailMatch": "valid"
    },
    "credit": {
      "score": 720,
      "tradelines": 12,
      "openAccounts": 8,
      "totalBalance": 45000,
      "utilization": 0.28,
      "oldestAccount": "12 years",
      "recentInquiries": 2,
      "delinquencies": 0,
      "collections": 0,
      "bankruptcies": 0
    },
    "fraud": {
      "fraudScore": 135,
      "syntheticIdentity": "clear",
      "identityTheft": "clear",
      "firstPartyFraud": "clear",
      "velocityRisk": "low",
      "deviceRisk": "low",
      "emailRisk": "low",
      "phoneRisk": "low"
    },
    "compliance": {
      "ofac": "clear",
      "sanctions": "clear",
      "pep": false,
      "adverseMedia": "none",
      "watchlist": "clear"
    },
    "recommendations": [
      "Applicant presents low overall risk",
      "Identity verification successful",
      "No fraud indicators detected",
      "Credit profile is acceptable",
      "Recommend approval with standard terms"
    ],
    "riskFactors": [
      {
        "category": "credit",
        "factor": "Credit utilization above 25%",
        "severity": "low",
        "impact": "negative"
      }
    ]
  },
  "provider": "decisionlogic"
}
```

### Client Integration Example

```javascript
// Complete risk assessment workflow
async function assessApplicantRisk(application) {
  try {
    // Step 1: Identity verification
    const verification = await verifyIdentity(application);
    
    if (verification.results.identityMatch !== 'confirmed') {
      return {
        decision: 'reject',
        reason: 'Identity verification failed',
        details: verification
      };
    }
    
    // Step 2: Fraud detection
    const fraudCheck = await checkForFraud(application);
    
    if (fraudCheck.results.fraudScore < 50) {
      return {
        decision: 'reject',
        reason: 'High fraud risk detected',
        details: fraudCheck
      };
    }
    
    // Step 3: Get comprehensive report
    const report = await getFullReport(
      fraudCheck.fraudCheckId,
      application.id
    );
    
    // Step 4: Make final decision
    return makeDecision(report);
    
  } catch (error) {
    console.error('Risk assessment error:', error);
    throw error;
  }
}

async function verifyIdentity(application) {
  const response = await fetch('/.netlify/functions/decisionlogic-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: application.firstName,
      lastName: application.lastName,
      dateOfBirth: application.dob,
      ssn: application.ssn,
      address: application.address,
      phone: application.phone,
      email: application.email,
      verificationLevel: 'standard'
    })
  });
  
  return await response.json();
}

async function checkForFraud(application) {
  const response = await fetch('/.netlify/functions/decisionlogic-fraud-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      applicationId: application.id,
      applicant: {
        firstName: application.firstName,
        lastName: application.lastName,
        dateOfBirth: application.dob,
        ssn: application.ssn,
        address: application.address,
        phone: application.phone,
        email: application.email
      },
      loan: {
        amount: application.loanAmount,
        purpose: application.loanPurpose,
        term: application.loanTerm
      },
      device: {
        ipAddress: application.deviceInfo.ip,
        userAgent: application.deviceInfo.userAgent,
        fingerprint: application.deviceInfo.fingerprint
      },
      checkLevel: 'comprehensive'
    })
  });
  
  return await response.json();
}

async function getFullReport(fraudCheckId, applicationId) {
  const response = await fetch('/.netlify/functions/decisionlogic-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fraudCheckId,
      applicationId
    })
  });
  
  return await response.json();
}

function makeDecision(report) {
  const { summary, recommendations, riskFactors } = report.report;
  
  // Auto-approve for low risk with good credit
  if (summary.overallRisk === 'low' && summary.creditScore >= 680) {
    return {
      decision: 'approve',
      terms: 'standard',
      confidence: summary.confidence,
      summary: summary,
      recommendations: recommendations
    };
  }
  
  // Manual review for medium risk
  if (summary.overallRisk === 'medium') {
    return {
      decision: 'manual_review',
      reason: 'Medium risk requires underwriter review',
      summary: summary,
      riskFactors: riskFactors,
      recommendations: recommendations
    };
  }
  
  // Decline for high risk
  return {
    decision: 'decline',
    reason: 'Risk threshold exceeded',
    summary: summary,
    riskFactors: riskFactors
  };
}
```

### Testing

**Sandbox Setup:**
1. Register at https://decisionlogic.com/developers
2. Get sandbox API key
3. Use test identities provided in sandbox docs

**Test Identities:**
```bash
# Low Risk Identity
curl -X POST https://yourdomain.com/.netlify/functions/decisionlogic-verify \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Approved",
    "dateOfBirth": "1980-01-01",
    "ssn": "111-11-1111",
    "address": {
      "street": "123 Test St",
      "city": "Testville",
      "state": "CA",
      "zip": "90001"
    },
    "phone": "555-555-0001",
    "email": "approved@test.com",
    "verificationLevel": "standard"
  }'

# High Risk Identity (Fraud Flags)
curl -X POST https://yourdomain.com/.netlify/functions/decisionlogic-fraud-check \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "test_app_001",
    "applicant": {
      "firstName": "Test",
      "lastName": "Fraudulent",
      "dateOfBirth": "1990-01-01",
      "ssn": "666-66-6666",
      "address": {"street": "456 Fake Ave", "city": "Scamcity", "state": "NY", "zip": "10001"},
      "phone": "555-555-9999",
      "email": "fraud@test.com"
    },
    "loan": {"amount": 100000, "purpose": "other", "term": 12},
    "checkLevel": "comprehensive"
  }'
```

### Decision Matrix

| Fraud Score | Credit Score | Identity Match | Decision |
|-------------|--------------|----------------|----------|
| 150+ | 680+ | Confirmed | Auto-Approve |
| 100-149 | 640-679 | Confirmed | Approve with Conditions |
| 100-149 | <640 | Confirmed | Manual Review |
| 50-99 | Any | Confirmed | Manual Review Required |
| 50-99 | Any | Partial | Decline |
| <50 | Any | Any | Auto-Decline |
| Any | Any | Failed | Auto-Decline |

### Security Best Practices

- **PII Protection**: Encrypt SSN at rest; transmit only over HTTPS; never log full SSN
- **API Key Security**: Rotate keys quarterly; use separate keys per environment
- **Access Control**: Limit fraud check access to authorized underwriters only
- **Audit Logging**: Log all verification and fraud checks with timestamp, user, result
- **Data Retention**: Define clear policies (e.g., 7 years for FCRA compliance)
- **Rate Limiting**: Prevent abuse with per-tenant/per-user limits
- **FCRA Compliance**: Include required adverse action notices for credit-based decisions
- **Red Flags Rule**: Implement identity theft detection program
- **Consent Management**: Obtain explicit consent before credit/identity checks
- **Webhook Security**: Validate signatures on result callbacks

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
