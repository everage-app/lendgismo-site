# Zapier Integration Guide

Last Updated: November 24, 2025  
Audience: Product teams, operations staff, and integration specialists

---

## Overview

Lendgismo provides **native webhook support** for Zapier integration, enabling no-code automation between your lending platform and 6,000+ apps. Connect loan applications, underwriting decisions, and payment events to your CRM, accounting software, project management tools, and notification systems.

**Key Benefits:**
- 🔄 **No-code automation** — Build workflows without writing code
- ⚡ **Real-time triggers** — Instant notifications when events occur
- 🔗 **6,000+ integrations** — Connect to Salesforce, HubSpot, Slack, Google Sheets, QuickBooks, and more
- 🛡️ **Secure webhooks** — HMAC signature verification for all payloads
- 📊 **Rich data** — Complete application, borrower, and loan details in every webhook

---

## Quick Start

### 1. Set Up Webhook URL in Lendgismo

Configure your internal webhook URL to forward events to Zapier:

```bash
# Environment Variables
INTERNAL_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/YOUR_ZAPIER_ID/
INTERNAL_WEBHOOK_SECRET=your_secure_secret_key
```

### 2. Create a Zap in Zapier

1. **Log in to Zapier** → Click "Create Zap"
2. **Trigger**: Search for "Webhooks by Zapier"
3. **Event**: Select "Catch Hook"
4. **Copy Webhook URL** from Zapier
5. **Paste URL** into `INTERNAL_WEBHOOK_URL` environment variable
6. **Test**: Submit a contact form or trigger an event in Lendgismo
7. **Configure Actions**: Add CRM updates, Slack notifications, email alerts, etc.

---

## Available Webhook Events

Lendgismo sends webhook payloads for the following events:

### Contact Form Submissions

**Event:** `contact.submission`

**Payload Example:**
```json
{
  "event": "contact.submission",
  "formName": "contact",
  "receivedAt": "2025-11-24T10:30:00Z",
  "data": {
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@example.com",
    "company": "ABC Manufacturing Inc",
    "role": "CFO",
    "phone": "555-123-4567",
    "interest": "1-3-months",
    "message": "Looking for equipment financing options"
  },
  "raw": {
    "form_name": "contact",
    "firstName": "John",
    "lastName": "Smith"
  }
}
```

### Application Status Changes

**Event:** `application.status_changed`

**Payload Example:**
```json
{
  "event": "application.status_changed",
  "applicationId": "app_20251124_001",
  "previousStatus": "under_review",
  "newStatus": "approved",
  "timestamp": "2025-11-24T14:45:00Z",
  "data": {
    "borrower": {
      "id": "usr_abc123",
      "name": "John Smith",
      "email": "john@example.com",
      "company": "ABC Manufacturing Inc"
    },
    "loan": {
      "amount": 50000,
      "term": 12,
      "product": "equipment-financing",
      "interestRate": 8.5
    },
    "decision": {
      "approvedBy": "usr_underwriter_01",
      "approvalDate": "2025-11-24T14:45:00Z",
      "conditions": ["Provide insurance certificate", "Submit final invoice"]
    }
  }
}
```

### Loan Funded

**Event:** `loan.funded`

**Payload Example:**
```json
{
  "event": "loan.funded",
  "loanId": "loan_xyz789",
  "applicationId": "app_20251124_001",
  "timestamp": "2025-11-24T16:00:00Z",
  "data": {
    "borrower": {
      "id": "usr_abc123",
      "name": "John Smith",
      "email": "john@example.com"
    },
    "fundingDetails": {
      "amount": 50000,
      "disbursementDate": "2025-11-24",
      "accountNumber": "****1234",
      "method": "ACH"
    }
  }
}
```

### Payment Received

**Event:** `payment.received`

**Payload Example:**
```json
{
  "event": "payment.received",
  "paymentId": "pmt_20251124_001",
  "loanId": "loan_xyz789",
  "timestamp": "2025-11-24T18:30:00Z",
  "data": {
    "amount": 4500.00,
    "principal": 4000.00,
    "interest": 450.00,
    "fees": 50.00,
    "paymentDate": "2025-11-24",
    "method": "ACH",
    "status": "completed",
    "remainingBalance": 46000.00
  }
}
```

### Document Uploaded

**Event:** `document.uploaded`

**Payload Example:**
```json
{
  "event": "document.uploaded",
  "documentId": "doc_20251124_001",
  "applicationId": "app_20251124_001",
  "timestamp": "2025-11-24T12:15:00Z",
  "data": {
    "fileName": "bank_statement_nov_2025.pdf",
    "fileType": "application/pdf",
    "fileSize": 245678,
    "category": "bank_statement",
    "uploadedBy": "usr_abc123",
    "uploadedAt": "2025-11-24T12:15:00Z"
  }
}
```

---

## Common Zapier Workflows

### 1. Contact Form → CRM Lead

**Trigger:** Contact form submission  
**Actions:**
- Create lead in Salesforce/HubSpot
- Send Slack notification to sales team
- Add row to Google Sheets for tracking

**Zap Template:**
```
Trigger: Webhook by Zapier (Catch Hook)
↓
Filter: Only proceed if event = "contact.submission"
↓
Action: Salesforce → Create Lead
  - First Name: {{data.firstName}}
  - Last Name: {{data.lastName}}
  - Email: {{data.email}}
  - Company: {{data.company}}
  - Lead Source: "Website - Lendgismo"
↓
Action: Slack → Send Message
  - Channel: #sales
  - Message: "New lead: {{data.firstName}} {{data.lastName}} from {{data.company}}"
```

### 2. Loan Approval → Email & CRM Update

**Trigger:** Application status changed to "approved"  
**Actions:**
- Send congratulations email via SendGrid
- Update deal stage in HubSpot
- Create task in Asana for loan officer

**Zap Template:**
```
Trigger: Webhook by Zapier (Catch Hook)
↓
Filter: Only proceed if event = "application.status_changed" AND newStatus = "approved"
↓
Action: Gmail → Send Email
  - To: {{data.borrower.email}}
  - Subject: "Congratulations! Your loan application has been approved"
  - Body: Custom HTML template
↓
Action: HubSpot → Update Deal
  - Deal ID: {{data.dealId}}
  - Stage: "Approved - Pending Funding"
↓
Action: Asana → Create Task
  - Project: "Loan Operations"
  - Task: "Prepare funding documents for {{data.borrower.name}}"
  - Assignee: Loan Officer
```

### 3. Payment Received → Accounting Sync

**Trigger:** Payment received  
**Actions:**
- Create invoice in QuickBooks
- Log transaction in Google Sheets
- Send receipt via email

**Zap Template:**
```
Trigger: Webhook by Zapier (Catch Hook)
↓
Filter: Only proceed if event = "payment.received" AND status = "completed"
↓
Action: QuickBooks → Create Invoice
  - Customer: {{data.borrower.name}}
  - Amount: {{data.amount}}
  - Description: "Loan payment - Principal: ${{data.principal}}, Interest: ${{data.interest}}"
↓
Action: Google Sheets → Add Row
  - Spreadsheet: "Payment Tracking"
  - Date: {{data.paymentDate}}
  - Loan ID: {{loanId}}
  - Amount: {{data.amount}}
↓
Action: Gmail → Send Email
  - To: {{data.borrower.email}}
  - Subject: "Payment Received - ${{data.amount}}"
  - Attachment: Receipt PDF
```

### 4. Application Submitted → Multi-Channel Notification

**Trigger:** New application submission  
**Actions:**
- Send Slack notification
- Create task in Monday.com
- Send SMS to underwriter via Twilio

**Zap Template:**
```
Trigger: Webhook by Zapier (Catch Hook)
↓
Filter: Only proceed if event = "application.submitted"
↓
Action: Slack → Send Message
  - Channel: #underwriting
  - Message: "🔔 New application from {{data.borrower.name}} - ${{data.loan.amount}} {{data.loan.product}}"
↓
Action: Monday.com → Create Item
  - Board: "Loan Pipeline"
  - Item Name: "{{data.borrower.company}} - ${{data.loan.amount}}"
  - Status: "New"
↓
Action: Twilio → Send SMS
  - To: Underwriter Phone
  - Message: "New loan app: {{data.borrower.name}} - Review at https://app.lendgismo.com/applications/{{applicationId}}"
```

---

## Security & Authentication

### Webhook Signature Verification

All webhook payloads include an `X-Signature` header with HMAC SHA-256 signature:

```javascript
// Verify webhook signature in your Zap Code step
const crypto = require('crypto');

const signature = inputData.headers['X-Signature'];
const secret = 'your_webhook_secret';
const payload = inputData.rawBody;

const expectedSignature = 'sha256=' + crypto
  .createHmac('sha256', secret)
  .update(payload, 'utf8')
  .digest('hex');

if (signature !== expectedSignature) {
  throw new Error('Invalid webhook signature');
}

// Proceed with processing
output = JSON.parse(payload);
```

### IP Whitelisting (Optional)

For enhanced security, whitelist Zapier's webhook IPs:

```
44.234.52.96/27
44.234.90.192/27
35.80.24.0/27
```

Add to your Netlify/AWS/Azure firewall rules.

---

## Testing & Debugging

### Test Webhooks Locally

Use ngrok to test webhooks during development:

```bash
# Start ngrok
ngrok http 5000

# Set webhook URL
INTERNAL_WEBHOOK_URL=https://abc123.ngrok.io/webhook

# Trigger event in Lendgismo
# Check ngrok dashboard for incoming requests
```

### Debug Webhook Payloads

1. **Zapier Dashboard** → View Zap History
2. Check "Data In" section for received payload
3. Verify field mapping matches your expectations
4. Use "Retest" feature to replay failed webhooks

### Common Issues

**Issue:** Webhook not receiving events  
**Solution:**
- Verify `INTERNAL_WEBHOOK_URL` is set correctly
- Check Netlify function logs for errors
- Ensure webhook endpoint is publicly accessible

**Issue:** Data fields are undefined  
**Solution:**
- Review webhook payload structure
- Update field mappings in Zapier action steps
- Use "Formatter" steps to transform data

**Issue:** Duplicate events  
**Solution:**
- Add de-duplication logic using `applicationId` or `paymentId`
- Use Zapier's built-in "Find or Create" actions

---

## Advanced Use Cases

### Multi-Tenant Webhook Routing

Route webhooks to different Zapier accounts based on tenant:

```javascript
// In submission-created.js
const getTenantWebhook = (tenantId) => {
  const webhooks = {
    'tenant_alpha': 'https://hooks.zapier.com/hooks/catch/123/abc',
    'tenant_beta': 'https://hooks.zapier.com/hooks/catch/456/def'
  };
  return webhooks[tenantId] || process.env.INTERNAL_WEBHOOK_URL;
};

const webhookUrl = getTenantWebhook(payload.tenantId);
```

### Conditional Webhooks

Send webhooks only for specific conditions:

```javascript
// Only send webhook for high-value loans
if (loanAmount > 100000) {
  await postToInternal({
    url: process.env.HIGH_VALUE_WEBHOOK_URL,
    payload: enrichedPayload,
    secret: process.env.INTERNAL_WEBHOOK_SECRET
  });
}
```

### Webhook Retry Logic

Lendgismo automatically retries failed webhooks:
- **Initial retry:** 5 seconds
- **Second retry:** 30 seconds
- **Third retry:** 5 minutes
- **Max retries:** 3 attempts

---

## Integration Examples

### Zapier + Salesforce

**Use Case:** Sync loan applications to Salesforce Opportunities

**Setup:**
1. Trigger: Webhook (application.submitted)
2. Action: Salesforce → Create Opportunity
   - Name: "{{data.company}} - {{data.loan.product}}"
   - Amount: {{data.loan.amount}}
   - Stage: "Qualification"
   - Close Date: {{data.expectedFundingDate}}
3. Action: Salesforce → Create Task
   - Subject: "Review application"
   - Assigned To: Underwriting Team

### Zapier + Slack

**Use Case:** Real-time notifications for underwriting team

**Setup:**
1. Trigger: Webhook (application.status_changed)
2. Filter: Only if status is "needs_review"
3. Action: Slack → Send Channel Message
   - Channel: #underwriting
   - Message: Rich formatted message with application details
   - Include: Link to application dashboard

### Zapier + Google Sheets

**Use Case:** Track all applications in centralized spreadsheet

**Setup:**
1. Trigger: Webhook (application.submitted)
2. Action: Google Sheets → Add Row
   - Date: {{receivedAt}}
   - Borrower: {{data.borrower.name}}
   - Amount: {{data.loan.amount}}
   - Status: {{data.status}}
3. Action: Google Sheets → Update Row (on status change)

---

## API Reference

### Webhook Configuration Endpoints

#### Set Webhook URL

```bash
POST /api/settings/webhooks
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "url": "https://hooks.zapier.com/hooks/catch/YOUR_ID/",
  "secret": "your_webhook_secret",
  "events": ["contact.submission", "application.status_changed", "loan.funded"],
  "enabled": true
}
```

#### Test Webhook

```bash
POST /api/webhooks/test
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "event": "contact.submission",
  "testPayload": {
    "firstName": "Test",
    "lastName": "User"
  }
}
```

---

## Compliance & Data Privacy

### GDPR Considerations

- Webhook payloads may contain PII (email, name, phone)
- Document data processing agreement with Zapier
- Implement data retention policies for webhook logs
- Provide opt-out mechanism for automated processing

### CCPA Considerations

- Disclose webhook integrations in privacy policy
- Allow users to opt-out of data sharing
- Maintain audit trail of webhook deliveries

### SOC 2 / ISO 27001

- Encrypt webhook secrets using AWS Secrets Manager or equivalent
- Rotate webhook secrets quarterly
- Monitor webhook delivery success rates
- Implement alerting for failed deliveries

---

## Monitoring & Analytics

### Webhook Delivery Metrics

Track in your Lendgismo dashboard:
- **Delivery Rate:** % of webhooks successfully delivered
- **Average Latency:** Time from event to webhook delivery
- **Error Rate:** % of failed webhook attempts
- **Retry Rate:** % of webhooks requiring retry

### Zapier Task Usage

Monitor your Zapier plan limits:
- **Tasks per month:** Each webhook trigger counts as 1 task
- **Multi-step Zaps:** Each action step counts as additional task
- **Premium apps:** Some apps require higher-tier Zapier plans

---

## Support & Resources

### Documentation
- **Zapier Webhooks Guide:** https://zapier.com/help/create/code-webhooks/trigger-zaps-from-webhooks
- **Lendgismo API Docs:** https://lendgismo.com/docs/50_api-quickstart

### Community
- **Zapier Community:** https://community.zapier.com
- **Lendgismo Support:** support@lendgismo.com

### Video Tutorials
- "Setting up Zapier with Lendgismo" (5 min)
- "Advanced webhook routing with Zapier" (10 min)
- "Troubleshooting common Zapier issues" (8 min)

---

## Changelog

**November 24, 2025**
- ✅ Added Zapier integration documentation
- ✅ Documented webhook event types
- ✅ Added common workflow examples
- ✅ Included security best practices

**Future Enhancements**
- [ ] Pre-built Zapier app in Zapier marketplace
- [ ] Webhook event filtering UI in dashboard
- [ ] Webhook delivery history viewer
- [ ] One-click Zap templates

---

**Next Steps:**
1. [Configure webhook URL](#quick-start)
2. [Create your first Zap](#common-zapier-workflows)
3. [Review security settings](#security--authentication)
4. [Monitor webhook delivery](#monitoring--analytics)
