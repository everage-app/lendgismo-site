# Role-Based Access Control (RBAC) Matrix

**Last Updated**: October 16, 2025  
**System**: Lendgismo Asset Lender Platform  
**Authorization Model**: Role-Based Access Control (RBAC)

---

## Overview

Lendgismo implements a **two-role system** with clear separation of responsibilities:

1. **Lender** - Platform administrators and loan officers
2. **Borrower** - Loan applicants and recipients

Future enhancements may include additional roles such as:
- **Admin** - System administrators
- **Analyst** - Read-only access for reporting
- **Auditor** - Compliance and audit access

---

## Role Definitions

### Lender Role

**Purpose**: Manage loan applications, review borrowers, configure platform settings

**Typical Users**:
- Loan officers
- Underwriters
- Platform administrators
- Customer success managers

**Capabilities**:
- Full access to all loan applications
- Approve/reject applications
- Create and manage borrowers
- Invite borrowers via email/SMS
- Upload documents on behalf of borrowers
- Configure platform branding
- Manage integration settings
- Access activity logs

### Borrower Role

**Purpose**: Submit loan applications, upload documents, track application status

**Typical Users**:
- Individual borrowers
- Small business owners
- Corporate treasury managers

**Capabilities**:
- View own loan applications
- Submit new loan applications
- Upload supporting documents
- Connect bank accounts (Plaid)
- View own profile and settings
- Receive notifications

---

## Permission Matrix

### Legend
- ✅ **Full Access** - Create, Read, Update, Delete
- 👁️ **Read Only** - View only, no modifications
- 🔒 **Own Records** - Access limited to own data
- ❌ **No Access** - Cannot view or modify

---

## API Endpoints Permissions

| Endpoint | Method | Lender | Borrower | Notes |
|----------|--------|--------|----------|-------|
| **Authentication** |
| `/api/auth/login` | POST | ✅ | ✅ | Public endpoint |
| `/api/auth/logout` | POST | ✅ | ✅ | Authenticated users |
| `/api/auth/me` | GET | ✅ | ✅ | Returns session user |
| `/api/auth/mfa/start` | POST | ✅ | ✅ | Demo mode only |
| `/api/auth/mfa/verify` | POST | ✅ | ✅ | Demo mode only |
| **Users** |
| `/api/users` | POST | ✅ | ❌ | Lenders create borrowers |
| `/api/borrowers` | GET | ✅ | 🔒 | Lenders see all, borrowers see self |
| **Loan Applications** |
| `/api/loan-applications` | GET | ✅ | 🔒 | Lenders see all, borrowers see own |
| `/api/loan-applications` | POST | ✅ | ✅ | Both can create |
| `/api/loan-applications/:id` | GET | ✅ | 🔒 | Owner or lender |
| `/api/loan-applications/:id/status` | PATCH | ✅ | ❌ | Lenders only |
| `/api/loan-applications/borrower/:id` | GET | ✅ | 🔒 | Owner or lender |
| **Documents** |
| `/api/documents` | POST | ✅ | ✅ | Create document metadata |
| `/api/documents/application/:id` | GET | ✅ | 🔒 | Owner or lender |
| `/api/upload` | POST | ✅ | ❌ | File upload (lenders only) |
| **Bank Accounts** |
| `/api/bank-accounts` | POST | ✅ | ✅ | Connect bank account |
| `/api/bank-accounts/user/:id` | GET | ✅ | 🔒 | Owner or lender |
| `/api/bank-accounts/:id` | DELETE | ✅ | 🔒 | Owner or lender |
| **Invites** |
| `/api/invites` | POST | ✅ | ❌ | Deprecated, use /generate |
| `/api/invites/generate` | POST | ✅ | ❌ | Lenders only |
| `/api/invites/send` | POST | ✅ | ❌ | Lenders only |
| `/api/invites/validate/:token` | GET | ✅ | ✅ | Public (token-based) |
| `/api/invites/mark-used/:token` | POST | ✅ | ✅ | Public (token-based) |
| **Branding** |
| `/api/branding` | GET | ✅ | ✅ | Public |
| `/api/settings/branding` | GET | ✅ | ✅ | Public |
| `/api/settings/branding` | POST | ✅ | ❌ | Lenders only |
| **Account Settings** |
| `/api/account-settings` | GET | ✅ | ✅ | Own settings only |
| `/api/account-settings` | PUT | ✅ | ✅ | Own settings only |
| `/api/account-settings/generate-api-key` | POST | ✅ | ✅ | Own API key |
| **Dashboard Config** |
| `/api/me/dashboard-config` | GET | ✅ | ❌ | Lenders only |
| `/api/me/dashboard-config` | PUT | ✅ | ❌ | Lenders only |
| **Integrations** |
| `/api/integrations` | GET | ✅ | ❌ | Lenders only |
| `/api/integrations/save` | POST | ✅ | ❌ | Lenders only |
| `/api/integrations/ping` | POST | ✅ | ❌ | Lenders only |
| **Demo Data** |
| `/api/demo/kpis` | GET | ✅ | ❌ | Demo mode only |
| `/api/demo/borrowers` | GET | ✅ | ❌ | Demo mode only |
| `/api/demo/applications` | GET | ✅ | ✅ | Demo mode |
| `/api/demo/*` | GET | ✅ | 🔒 | Demo endpoints |
| **Windowed Data** |
| `/api/windowed/:range?` | GET | ✅ | ❌ | Lenders only |
| **Notifications** |
| `/api/notifications` | GET | ✅ | ✅ | Own notifications (localStorage) |
| `/api/notifications` | PATCH | ✅ | ✅ | Own notifications |
| **Health & Monitoring** |
| `/health` | GET | ✅ | ✅ | Public |
| `/api/health` | GET | ✅ | ✅ | Public |
| `/api/activity` | GET | ✅ | ❌ | Lenders only |

---

## UI Route Permissions

| Route | Lender | Borrower | Description |
|-------|--------|----------|-------------|
| `/` | ✅ | ✅ | Landing page (public) |
| `/login` | ✅ | ✅ | Login page (public) |
| `/dashboard` | ✅ | 🔒 | Role-specific dashboard |
| `/applications` | ✅ | 🔒 | Lenders: all apps, Borrowers: own apps |
| `/applications/:id` | ✅ | 🔒 | Application details (owner or lender) |
| `/applications/new` | ❌ | ✅ | Submit new application (borrowers) |
| `/borrowers` | ✅ | ❌ | Borrower management (lenders only) |
| `/borrowers/:id` | ✅ | 🔒 | Borrower details (owner or lender) |
| `/settings` | ✅ | ✅ | Account settings (own) |
| `/settings/branding` | ✅ | ❌ | Platform branding (lenders only) |
| `/settings/integrations` | ✅ | ❌ | Third-party integrations (lenders only) |
| `/invite/:token` | ✅ | ✅ | Onboarding flow (token-based) |
| `/account` | ✅ | ✅ | Account management (own) |

---

## Feature Permissions

### Loan Application Workflow

| Action | Lender | Borrower | Implementation |
|--------|--------|----------|----------------|
| Submit application | ✅ | ✅ | Both can create |
| View own applications | ✅ | ✅ | Filter by `borrowerId` |
| View all applications | ✅ | ❌ | No filter |
| Update status | ✅ | ❌ | `requireLenderAuth` middleware |
| Add notes | ✅ | ❌ | Lender-only field |
| Convert to borrower | ✅ | ❌ | Approval workflow |
| Delete application | ❌ | ❌ | Soft delete only (future) |

### Document Management

| Action | Lender | Borrower | Implementation |
|--------|--------|----------|----------------|
| Upload documents | ✅ | ✅ | Both via form |
| View own documents | ✅ | ✅ | Filter by `applicationId` ownership |
| View all documents | ✅ | ❌ | Lender access to all |
| Update document status | ✅ | ❌ | Processing workflow |
| Delete documents | ✅ | 🔒 | Owner or lender |
| Upload files (binary) | ✅ | ❌ | `/api/upload` restricted |

### Bank Accounts

| Action | Lender | Borrower | Implementation |
|--------|--------|----------|----------------|
| Connect bank account | ✅ | ✅ | Both can use Plaid |
| View own accounts | ✅ | ✅ | Filter by `userId` |
| View all accounts | ✅ | ❌ | Lender oversight |
| Disconnect account | ✅ | 🔒 | Owner or lender |
| Update balance | 🔄 | 🔄 | Automatic via Plaid sync |

### Invites & Onboarding

| Action | Lender | Borrower | Implementation |
|--------|--------|----------|----------------|
| Generate invite link | ✅ | ❌ | `POST /api/invites/generate` |
| Send invite email | ✅ | ❌ | Lender initiates |
| Accept invite | ✅ | ✅ | Token validation |
| Validate invite token | ✅ | ✅ | Public endpoint |
| Mark invite as used | 🔄 | 🔄 | Automatic on acceptance |

### Platform Configuration

| Action | Lender | Borrower | Implementation |
|--------|--------|----------|----------------|
| Update branding | ✅ | ❌ | `requireLenderAuth` |
| Configure integrations | ✅ | ❌ | Ephemeral storage |
| View activity logs | ✅ | ❌ | In-memory logs |
| Manage API keys | ✅ | ✅ | Own API key only |
| Customize dashboard | ✅ | ❌ | Widget layout |

---

## Data Access Rules

### Row-Level Security

**Current Implementation**: Application-level filtering

```typescript
// Example: Borrowers see only own applications
const getBorrowerApplications = async (borrowerId: string) => {
  return db.select()
    .from(loanApplications)
    .where(eq(loanApplications.borrowerId, borrowerId))
}

// Lenders see all applications
const getAllApplications = async () => {
  return db.select().from(loanApplications)
}
```

**Future**: PostgreSQL Row-Level Security (RLS)

```sql
-- Enable RLS on loan_applications table
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

-- Borrowers can only see their own applications
CREATE POLICY borrower_own_applications ON loan_applications
  FOR SELECT
  USING (borrowerId = current_setting('app.user_id')::text);

-- Lenders can see all applications
CREATE POLICY lender_all_applications ON loan_applications
  FOR ALL
  USING (current_setting('app.user_role') = 'lender');
```

### Column-Level Security

| Table | Column | Lender | Borrower | Notes |
|-------|--------|--------|----------|-------|
| `users` | `password` | ❌ | ❌ | Never returned in API |
| `users` | `email` | ✅ | 🔒 | Own email only |
| `loan_applications` | `notes` | ✅ | ❌ | Internal lender notes |
| `loan_applications` | `aiScore` | ✅ | ❌ | Risk assessment |
| `loan_applications` | `reviewedBy` | ✅ | ❌ | Lender identity |
| `bank_accounts` | `plaidAccessToken` | ❌ | ❌ | Encrypted, never exposed |
| `account_settings` | `apiKey` | 🔒 | 🔒 | Own API key only |
| `application_invites` | `token` | ✅ | ✅ | Public for validation |

---

## Middleware Implementation

### Authentication Middleware

```typescript
// Current implementation in server/routes.ts
const requireAuth = (req, res, next) => {
  const userCookie = req.cookies.user
  if (!userCookie) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }
  
  try {
    req.user = JSON.parse(userCookie)
    next()
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid session' })
  }
}
```

### Lender-Only Middleware

```typescript
const requireLenderAuth: AuthMiddleware = (req, res, next) => {
  try {
    const userCookie = req.cookies.user
    if (!userCookie) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const user = JSON.parse(userCookie)
    
    if (user.role !== 'lender') {
      return res.status(403).json({ 
        success: false, 
        error: 'Forbidden - admin access required' 
      })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid session' })
  }
}
```

### Demo Mode Protection

```typescript
// Blocks write operations for demo users
app.use((req, res, next) => {
  const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']
  
  if (WRITE_METHODS.includes(req.method)) {
    const userCookie = req.cookies?.user
    if (userCookie) {
      const user = JSON.parse(userCookie)
      
      if (user.demo === true) {
        return res.status(403).json({
          success: false,
          error: 'Demo mode is read-only. Write operations are not allowed.'
        })
      }
    }
  }
  
  next()
})
```

---

## Future Enhancements

### 1. Granular Permissions

Replace binary roles with permission-based system:

```typescript
type Permission = 
  | 'applications:read'
  | 'applications:write'
  | 'applications:approve'
  | 'borrowers:read'
  | 'borrowers:write'
  | 'settings:read'
  | 'settings:write'
  | 'integrations:manage'

interface Role {
  name: string
  permissions: Permission[]
}

const roles: Record<string, Role> = {
  lender: {
    name: 'Lender',
    permissions: [
      'applications:read',
      'applications:write',
      'applications:approve',
      'borrowers:read',
      'borrowers:write',
      'settings:read',
      'settings:write',
      'integrations:manage'
    ]
  },
  borrower: {
    name: 'Borrower',
    permissions: [
      'applications:read',  // Own only
      'applications:write', // Own only
      'settings:read',      // Own only
      'settings:write'      // Own only
    ]
  },
  analyst: {
    name: 'Analyst',
    permissions: [
      'applications:read',  // All
      'borrowers:read',     // All
      'settings:read'       // Platform
    ]
  }
}
```

### 2. Multi-Tenancy

Add `tenantId` to isolate data:

```sql
-- Add tenant column
ALTER TABLE users ADD COLUMN tenant_id TEXT REFERENCES tenants(id);
ALTER TABLE loan_applications ADD COLUMN tenant_id TEXT;

-- RLS policy for tenant isolation
CREATE POLICY tenant_isolation ON loan_applications
  USING (tenant_id = current_setting('app.tenant_id'));
```

### 3. Audit Trail

Log all permission checks:

```typescript
const checkPermission = (user: User, permission: Permission) => {
  const hasPermission = user.permissions.includes(permission)
  
  logActivity('permission.check', {
    userId: user.id,
    permission,
    granted: hasPermission,
    timestamp: new Date()
  })
  
  return hasPermission
}
```

### 4. Time-Based Access

Temporary elevated permissions:

```typescript
interface TemporaryGrant {
  userId: string
  permission: Permission
  expiresAt: Date
}

const checkTemporaryGrant = async (userId: string, permission: Permission) => {
  const grant = await db.select()
    .from(temporaryGrants)
    .where(and(
      eq(temporaryGrants.userId, userId),
      eq(temporaryGrants.permission, permission),
      gt(temporaryGrants.expiresAt, new Date())
    ))
    .limit(1)
  
  return grant.length > 0
}
```

---

## Testing RBAC

### Manual Testing

```bash
# Test as lender
curl -X GET http://localhost:5000/api/loan-applications \
  -H "Cookie: user=$(echo '{"id":"lender-1","role":"lender"}' | base64)"

# Test as borrower (should fail for lender-only endpoint)
curl -X GET http://localhost:5000/api/integrations \
  -H "Cookie: user=$(echo '{"id":"borrower-1","role":"borrower"}' | base64)"
# Expected: 403 Forbidden
```

### Automated Tests (Future)

```typescript
describe('RBAC Tests', () => {
  test('Lender can access all applications', async () => {
    const response = await request(app)
      .get('/api/loan-applications')
      .set('Cookie', lenderCookie)
    
    expect(response.status).toBe(200)
    expect(response.body.data.length).toBeGreaterThan(0)
  })
  
  test('Borrower can only access own applications', async () => {
    const response = await request(app)
      .get('/api/loan-applications')
      .set('Cookie', borrowerCookie)
    
    expect(response.status).toBe(200)
    expect(response.body.data.every(
      app => app.borrowerId === borrowerId
    )).toBe(true)
  })
  
  test('Borrower cannot update branding', async () => {
    const response = await request(app)
      .post('/api/settings/branding')
      .set('Cookie', borrowerCookie)
      .send({ companyName: 'Hacked' })
    
    expect(response.status).toBe(403)
  })
})
```

---

## Security Best Practices

1. **Principle of Least Privilege**: Users have only the permissions they need
2. **Defense in Depth**: Multiple layers (middleware, business logic, database)
3. **Explicit Deny**: Deny by default, allow explicitly
4. **Separation of Duties**: Different roles for different responsibilities
5. **Audit All Access**: Log all permission checks and access attempts
6. **Regular Review**: Audit roles and permissions quarterly

---

**End of RBAC Matrix**  
*Next*: See `30_configuration.md` for environment setup, `63_security.md` for security practices
