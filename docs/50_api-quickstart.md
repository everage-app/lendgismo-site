# API Quick Start Guide

**Last Updated**: October 16, 2025  
**API Version**: v1.0.0  
**Base URL**: `https://app.lendgismo.com` (production) or `http://localhost:5000` (local)

## At a glance
- Auth: Session cookie after POST /api/login (see examples)
- Formats: JSON requests/responses; multipart for uploads
- Third-party: Plaid (banking), Stripe (payments), Twilio (SMS), SendGrid (email)
- Rate limits: 100 req/15m; pagination via limit/offset
- Roles: Lender vs Borrower access on certain endpoints

## Quick links
- [Authentication](#authentication)
- [Loan Applications](#loan-applications)
- [Documents](#documents)
- [Borrowers](#borrowers-lenders-only)
- [Invites](#invites-lenders-only)
- [Dashboard](#dashboard)
- [Errors](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Pagination](#pagination)
- [Postman Collection](#postman-collection)
- [Full API Reference](#full-api-reference)
- [Integrations Overview](/docs/40_integrations)

---

## Getting Started

### Prerequisites

1. **Account**: You need a Lendgismo account (lender or borrower)
2. **Authentication**: Session-based authentication (login required)
3. **Tools**: cURL, Postman, or any HTTP client

### Quick Start

1. **Login** to get a session cookie
2. **Make API requests** with the session cookie
3. **Handle responses** (JSON format)

---

## Authentication

### Login

**Endpoint**: `POST /api/login`

**Request**:
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }' \
  -c cookies.txt  # Save session cookie
```

**Response** (200 OK):
```json
{
  "id": "user_123",
  "email": "admin@example.com",
  "role": "lender",
  "name": "Admin User"
}
```

**Response** (401 Unauthorized):
```json
{
  "message": "Invalid credentials"
}
```

### Get Current User

**Endpoint**: `GET /api/user`

**Request**:
```bash
curl http://localhost:5000/api/user \
  -b cookies.txt  # Use saved session cookie
```

**Response**:
```json
{
  "id": "user_123",
  "email": "admin@example.com",
  "role": "lender",
  "name": "Admin User"
}
```

### Logout

**Endpoint**: `POST /api/logout`

**Request**:
```bash
curl -X POST http://localhost:5000/api/logout \
  -b cookies.txt
```

**Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

---

## Loan Applications

### List Applications

**Endpoint**: `GET /api/loan-applications`

**Query Parameters**:
- `status` (optional): Filter by status (`draft`, `pending`, `approved`, etc.)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Request**:
```bash
# Get all applications
curl http://localhost:5000/api/loan-applications \
  -b cookies.txt

# Filter by status
curl "http://localhost:5000/api/loan-applications?status=pending" \
  -b cookies.txt

# Pagination
curl "http://localhost:5000/api/loan-applications?limit=10&offset=20" \
  -b cookies.txt
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "app_123",
      "applicantName": "John Doe",
      "businessName": "Doe Enterprises",
      "loanAmount": 50000,
      "loanPurpose": "Equipment purchase",
      "status": "pending",
      "submittedAt": "2025-01-15T10:30:00Z",
      "createdAt": "2025-01-10T14:20:00Z",
      "userId": "user_456"
    }
  ],
  "total": 42
}
```

### Create Application

**Endpoint**: `POST /api/loan-applications`

**Request**:
```bash
curl -X POST http://localhost:5000/api/loan-applications \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "applicantName": "Jane Smith",
    "businessName": "Smith LLC",
    "loanAmount": 100000,
    "loanPurpose": "Business expansion",
    "email": "jane@smith.com",
    "phone": "555-1234",
    "status": "draft"
  }'
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "app_789",
    "applicantName": "Jane Smith",
    "businessName": "Smith LLC",
    "loanAmount": 100000,
    "status": "draft",
    "createdAt": "2025-01-16T09:15:00Z",
    "userId": "user_456"
  }
}
```

### Get Application Details

**Endpoint**: `GET /api/loan-applications/:id`

**Request**:
```bash
curl http://localhost:5000/api/loan-applications/app_123 \
  -b cookies.txt
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "app_123",
    "applicantName": "John Doe",
    "businessName": "Doe Enterprises",
    "loanAmount": 50000,
    "loanPurpose": "Equipment purchase",
    "status": "pending",
    "submittedAt": "2025-01-15T10:30:00Z",
    "createdAt": "2025-01-10T14:20:00Z",
    "updatedAt": "2025-01-15T10:30:00Z",
    "userId": "user_456",
    "documents": [
      {
        "id": "doc_001",
        "filename": "tax_return_2024.pdf",
        "fileType": "application/pdf",
        "fileSize": 524288,
        "category": "tax_returns",
        "uploadedAt": "2025-01-12T11:00:00Z"
      }
    ]
  }
}
```

### Update Application

**Endpoint**: `PATCH /api/loan-applications/:id`

**Request**:
```bash
curl -X PATCH http://localhost:5000/api/loan-applications/app_123 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "loanAmount": 75000,
    "loanPurpose": "Equipment purchase and working capital"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "app_123",
    "loanAmount": 75000,
    "loanPurpose": "Equipment purchase and working capital",
    "updatedAt": "2025-01-16T10:45:00Z"
  }
}
```

### Change Application Status

**Endpoint**: `PATCH /api/loan-applications/:id/status`

**Request** (Lenders only):
```bash
# Approve application
curl -X PATCH http://localhost:5000/api/loan-applications/app_123/status \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "status": "approved",
    "note": "Application meets all criteria"
  }'

# Reject application
curl -X PATCH http://localhost:5000/api/loan-applications/app_123/status \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "status": "rejected",
    "note": "Insufficient credit history"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "app_123",
    "status": "approved",
    "statusChangedAt": "2025-01-16T11:00:00Z",
    "statusNote": "Application meets all criteria"
  }
}
```

### Delete Application

**Endpoint**: `DELETE /api/loan-applications/:id`

**Request**:
```bash
curl -X DELETE http://localhost:5000/api/loan-applications/app_123 \
  -b cookies.txt
```

**Response**:
```json
{
  "success": true,
  "message": "Application deleted successfully"
}
```

---

## Documents

### Upload Document

**Endpoint**: `POST /api/documents`

**Request** (multipart/form-data):
```bash
curl -X POST http://localhost:5000/api/documents \
  -b cookies.txt \
  -F "file=@/path/to/tax_return.pdf" \
  -F "applicationId=app_123" \
  -F "category=tax_returns"
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "doc_002",
    "filename": "tax_return.pdf",
    "fileType": "application/pdf",
    "fileSize": 1048576,
    "category": "tax_returns",
    "applicationId": "app_123",
    "uploadedAt": "2025-01-16T12:00:00Z"
  }
}
```

### Download Document

**Endpoint**: `GET /api/documents/:id`

**Request**:
```bash
curl http://localhost:5000/api/documents/doc_002 \
  -b cookies.txt \
  -o downloaded_file.pdf
```

**Response**: Binary file data (PDF, image, etc.)

### List Documents for Application

**Endpoint**: `GET /api/loan-applications/:id/documents`

**Request**:
```bash
curl http://localhost:5000/api/loan-applications/app_123/documents \
  -b cookies.txt
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "doc_001",
      "filename": "tax_return_2024.pdf",
      "category": "tax_returns",
      "uploadedAt": "2025-01-12T11:00:00Z"
    },
    {
      "id": "doc_002",
      "filename": "bank_statement.pdf",
      "category": "bank_statements",
      "uploadedAt": "2025-01-13T09:30:00Z"
    }
  ]
}
```

### Delete Document

**Endpoint**: `DELETE /api/documents/:id`

**Request**:
```bash
curl -X DELETE http://localhost:5000/api/documents/doc_002 \
  -b cookies.txt
```

**Response**:
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

## Borrowers (Lenders Only)

### List Borrowers

**Endpoint**: `GET /api/borrowers`

**Request**:
```bash
curl http://localhost:5000/api/borrowers \
  -b cookies.txt
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "user_456",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "555-1234",
      "createdAt": "2024-12-01T10:00:00Z",
      "applicationCount": 3
    }
  ]
}
```

### Get Borrower Details

**Endpoint**: `GET /api/borrowers/:id`

**Request**:
```bash
curl http://localhost:5000/api/borrowers/user_456 \
  -b cookies.txt
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user_456",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-1234",
    "createdAt": "2024-12-01T10:00:00Z",
    "applications": [
      {
        "id": "app_123",
        "loanAmount": 50000,
        "status": "approved",
        "submittedAt": "2025-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## Invites (Lenders Only)

### Generate Invite

**Endpoint**: `POST /api/invites/generate`

**Request**:
```bash
curl -X POST http://localhost:5000/api/invites/generate \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "kind": "borrower",
    "inviteEmail": "newborrower@example.com"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "invite_789",
    "kind": "borrower",
    "inviteEmail": "newborrower@example.com",
  "inviteToken": "{invite_token}",
  "inviteLink": "http://localhost:5000/invite/accept?token={invite_token}",
    "expiresAt": "2025-02-15T10:00:00Z",
    "createdAt": "2025-01-16T10:00:00Z"
  }
}
```

### Accept Invite

**Endpoint**: `POST /api/invites/accept`

**Request**:
```bash
curl -X POST http://localhost:5000/api/invites/accept \
  -H "Content-Type: application/json" \
  -d '{
  "token": "{invite_token}",
    "password": "securepassword123",
    "name": "New Borrower"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user_999",
    "email": "newborrower@example.com",
    "name": "New Borrower",
    "role": "borrower",
    "createdAt": "2025-01-16T11:00:00Z"
  }
}
```

---

## Dashboard

### Get Dashboard Stats

**Endpoint**: `GET /api/dashboard/stats`

**Request**:
```bash
curl http://localhost:5000/api/dashboard/stats \
  -b cookies.txt
```

**Response** (Lender):
```json
{
  "success": true,
  "data": {
    "totalApplications": 142,
    "pendingApplications": 12,
    "approvedApplications": 98,
    "rejectedApplications": 15,
    "totalBorrowers": 87,
    "totalFunded": 4500000,
    "thisMonthApplications": 23,
    "thisWeekApplications": 5
  }
}
```

**Response** (Borrower):
```json
{
  "success": true,
  "data": {
    "myApplications": 3,
    "pendingApplications": 1,
    "approvedApplications": 2,
    "totalRequested": 150000
  }
}
```

---

## Error Handling

All errors follow a consistent format:

### Error Response Format

```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

### Common HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| `200` | OK | Request successful |
| `201` | Created | Resource created |
| `400` | Bad Request | Invalid input data |
| `401` | Unauthorized | Not logged in |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate resource |
| `422` | Unprocessable Entity | Validation error |
| `500` | Internal Server Error | Server error |

### Error Examples

**400 Bad Request**:
```json
{
  "success": false,
  "error": "Validation failed",
  "issues": [
    {
      "field": "loanAmount",
      "message": "Loan amount must be a positive number"
    }
  ]
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "error": "You do not have permission to access this resource"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "error": "Application not found"
}
```

---

## Rate Limiting

**Limits**: 100 requests per 15 minutes (default)

**Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1642345600
```

**Rate Limit Exceeded** (429):
```json
{
  "success": false,
  "error": "Too many requests. Please try again later.",
  "retryAfter": 900
}
```

---

## Pagination

For list endpoints (`/api/loan-applications`, `/api/borrowers`, etc.):

**Query Parameters**:
- `limit`: Number of results per page (default: 50, max: 100)
- `offset`: Number of results to skip (default: 0)

**Example**:
```bash
# Page 1 (results 1-10)
curl "http://localhost:5000/api/loan-applications?limit=10&offset=0" -b cookies.txt

# Page 2 (results 11-20)
curl "http://localhost:5000/api/loan-applications?limit=10&offset=10" -b cookies.txt

# Page 3 (results 21-30)
curl "http://localhost:5000/api/loan-applications?limit=10&offset=20" -b cookies.txt
```

**Response**:
```json
{
  "success": true,
  "data": [...],
  "total": 142,
  "limit": 10,
  "offset": 0,
  "hasMore": true
}
```

---

## Postman Collection

Import this collection into Postman for easy testing:

```json
{
  "info": {
    "name": "Lendgismo API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/login",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"admin@example.com\",\"password\":\"admin123\"}"
        }
      }
    },
    {
      "name": "Get Applications",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/loan-applications"
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000"
    }
  ]
}
```

---

## Full API Reference

---

## Third-Party Integrations

See the full guide with detailed examples: [Integrations Overview](/docs/40_integrations).

### Banking & Payments

**Plaid** (Banking)
- POST /.netlify/functions/plaid-link-token — create Link token
- POST /.netlify/functions/plaid-exchange-token — exchange public_token
- GET /api/plaid/accounts/:id — account metadata
- GET /api/plaid/transactions/:id — transactions

**Stripe** (Payments)
- POST /.netlify/functions/stripe-payment-intent — create payment intent
- POST /.netlify/functions/stripe-webhook — webhook handler

### Communications

**Twilio** (SMS)
- POST /.netlify/functions/twilio-send — send SMS notification

**SendGrid** (Email)
- POST /.netlify/functions/sendgrid-send — send transactional email

### Financial Data & Accounting

**QuickBooks** (Accounting)
- GET /.netlify/functions/quickbooks-auth — initiate OAuth flow
- GET /.netlify/functions/quickbooks-callback — handle OAuth callback
- POST /.netlify/functions/quickbooks-company — get company information
- POST /.netlify/functions/quickbooks-reports — retrieve financial reports (P&L, Balance Sheet, Cash Flow)

**Example - QuickBooks Integration**:
```bash
# Step 1: Initiate OAuth
curl https://lendgismo.com/.netlify/functions/quickbooks-auth

# Response includes authUrl - redirect user to this URL
# After OAuth, QuickBooks redirects to callback automatically

# Step 2: Get company info (after OAuth complete)
curl -X POST https://lendgismo.com/.netlify/functions/quickbooks-company \
  -H "Content-Type: application/json" \
  -d '{
    "realmId": "1234567890",
    "accessToken": "your_access_token"
  }'

# Step 3: Get P&L report
curl -X POST https://lendgismo.com/.netlify/functions/quickbooks-reports \
  -H "Content-Type: application/json" \
  -d '{
    "realmId": "1234567890",
    "accessToken": "your_access_token",
    "reportType": "ProfitAndLoss",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }'
```

### Alternative Credit & Risk Assessment

**DataMerch** (Alternative Data)
- POST /.netlify/functions/datamerch-analyze — submit business for alternative credit analysis
- POST /.netlify/functions/datamerch-report — retrieve completed analysis report
- POST /.netlify/functions/datamerch-score — get real-time alternative credit score

**Example - DataMerch Analysis**:
```bash
# Step 1: Submit business for analysis
curl -X POST https://lendgismo.com/.netlify/functions/datamerch-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "ABC Manufacturing Inc",
    "taxId": "12-3456789",
    "revenue": 2500000,
    "employees": 45,
    "industry": "Manufacturing",
    "yearsInBusiness": 8
  }'

# Response: {"success": true, "analysisId": "anlyz_abc123", "status": "processing"}

# Step 2: Wait 2-5 minutes, then retrieve report
curl -X POST https://lendgismo.com/.netlify/functions/datamerch-report \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "anlyz_abc123"
  }'

# Alternative: Quick score check (instant)
curl -X POST https://lendgismo.com/.netlify/functions/datamerch-score \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "ABC Manufacturing Inc",
    "taxId": "12-3456789",
    "quickCheck": true
  }'
```

**DecisionLogic** (Credit & Fraud)
- POST /.netlify/functions/decisionlogic-verify — verify identity and credit
- POST /.netlify/functions/decisionlogic-fraud-check — run fraud detection analysis
- POST /.netlify/functions/decisionlogic-report — retrieve comprehensive risk report

**Example - DecisionLogic Verification**:
```bash
# Step 1: Verify applicant identity
curl -X POST https://lendgismo.com/.netlify/functions/decisionlogic-verify \
  -H "Content-Type: application/json" \
  -d '{
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
  }'

# Step 2: Run fraud detection
curl -X POST https://lendgismo.com/.netlify/functions/decisionlogic-fraud-check \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "app_123",
    "applicant": {
      "firstName": "John",
      "lastName": "Smith",
      "dateOfBirth": "1985-06-15",
      "ssn": "123-45-6789",
      "address": {"street": "123 Main St", "city": "Austin", "state": "TX", "zip": "78701"},
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
  }'

# Step 3: Get full report
curl -X POST https://lendgismo.com/.netlify/functions/decisionlogic-report \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "app_123"
  }'
```

### Mock Mode

All integration functions support **mock mode** when API credentials are not configured. This allows you to:
- Test integration workflows without vendor accounts
- Demo features to stakeholders
- Develop UI components with realistic data

**Example Mock Response**:
```json
{
  "success": true,
  "mock": true,
  "message": "QuickBooks not configured - returning mock data",
  "company": {
    "CompanyName": "Mock Company Inc",
    "LegalName": "Mock Company Incorporated",
    "CompanyAddr": {...}
  },
  "provider": "quickbooks"
}
```


For complete API documentation with all endpoints, request/response schemas, and examples:

**OpenAPI Spec**: See `/openapi/openapi.yaml`

**Interactive API Explorer**: 
- Local: `http://localhost:5000/api-docs` (when Swagger UI is configured)
- Production: `https://app.lendgismo.com/api-docs`

---

**End of API Quick Start Guide**  
*Next*: See `openapi/openapi.yaml` for full OpenAPI specification
