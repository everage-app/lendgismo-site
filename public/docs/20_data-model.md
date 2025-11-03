# Data Model

**Last Updated**: October 16, 2025  
**ORM**: Drizzle ORM 0.39.3  
**Schema File**: `shared/schema.ts`  
**Databases Supported**: SQLite (dev), PostgreSQL (production)

---

## Overview

The Lendgismo data model supports a **dual-role system** (lenders and borrowers) for managing loan applications, documents, bank accounts, and platform customization. The schema is designed for both development (SQLite) and production (PostgreSQL) environments using Drizzle ORM.

### Core Entities

1. **Users** - Both borrowers and lenders
2. **Loan Applications** - Loan requests with status workflow
3. **Documents** - Application supporting documents
4. **Bank Accounts** - Plaid-connected bank accounts
5. **Application Invites** - Secure tokens for borrower onboarding
6. **Account Settings** - User-specific preferences and API keys
7. **Branding Settings** - Multi-tenant branding customization
8. **User Dashboard Config** - Customizable dashboard layouts

---

## Entity Details

### 1. Users Table

**Purpose**: Stores both borrower and lender user accounts with role-based differentiation.

**Table**: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY, UUID | Unique user identifier |
| `email` | TEXT | NOT NULL, UNIQUE | User email address (login credential) |
| `password` | TEXT | NOT NULL | Bcrypt hashed password |
| `firstName` | TEXT | NOT NULL | User's first name |
| `lastName` | TEXT | NOT NULL | User's last name |
| `role` | TEXT | NOT NULL | Role: `borrower` or `lender` |
| `companyName` | TEXT | NULLABLE | Company/organization name |
| `phone` | TEXT | NULLABLE | Contact phone number |
| `createdAt` | TEXT | DEFAULT NOW | Account creation timestamp (ISO 8601) |
| `updatedAt` | TEXT | DEFAULT NOW | Last update timestamp (ISO 8601) |

**Indexes**:
- Unique index on `email`
- Consider adding index on `role` for filtering

**Validation**:
- Email must be valid format
- Password must be bcrypt hashed (10 rounds minimum)
- Role must be one of: `borrower`, `lender`

**Notes**:
- Demo users may have a `demo: true` property in session (not persisted)
- Borrowers can be created via `/api/users` endpoint by lenders
- Auto-generated passwords for borrowers (see security docs)

---

### 2. Loan Applications Table

**Purpose**: Tracks loan requests from borrowers through approval workflow.

**Table**: `loan_applications`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY, UUID | Unique application ID |
| `borrowerId` | TEXT | NOT NULL, FK → users.id | Borrower who submitted application |
| `businessName` | TEXT | NOT NULL | Business name requesting loan |
| `loanAmount` | REAL | NOT NULL | Requested loan amount (USD) |
| `loanPurpose` | TEXT | NOT NULL | Purpose of loan (free text) |
| `collateralType` | TEXT | NOT NULL | Type of collateral offered |
| `collateralValue` | REAL | NOT NULL | Estimated collateral value (USD) |
| `annualRevenue` | REAL | NULLABLE | Business annual revenue |
| `timeInBusiness` | INTEGER | NULLABLE | Years in business |
| `status` | TEXT | NOT NULL, DEFAULT `pending` | Application status (see workflow) |
| `submittedAt` | TEXT | DEFAULT NOW | Submission timestamp |
| `reviewedAt` | TEXT | NULLABLE | Review completion timestamp |
| `reviewedBy` | TEXT | NULLABLE, FK → users.id | Lender who reviewed |
| `aiScore` | INTEGER | NULLABLE | AI risk score (0-100) |
| `notes` | TEXT | NULLABLE | Internal notes from lender |
| `createdAt` | TEXT | DEFAULT NOW | Record creation timestamp |
| `updatedAt` | TEXT | DEFAULT NOW | Last update timestamp |

**Status Workflow**:
```
pending → under_review → approved → funded
                      ↘ rejected
```

**Business Rules**:
- Only lenders can update status
- `reviewedBy` and `reviewedAt` are set when status changes from `pending`
- `approved` applications can be converted to borrower records via `/api/loan-applications/:id/status` with `convertToBorrower: true`
- AI score is optional and set by automated risk assessment

**Indexes**:
- Foreign key index on `borrowerId`
- Index on `status` for filtering
- Index on `submittedAt` for chronological ordering

---

### 3. Documents Table

**Purpose**: Stores metadata and status for loan application supporting documents.

**Table**: `documents`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY, UUID | Unique document ID |
| `applicationId` | TEXT | NOT NULL, FK → loan_applications.id | Associated loan application |
| `fileName` | TEXT | NOT NULL | Original file name |
| `fileType` | TEXT | NOT NULL | MIME type (e.g., `application/pdf`) |
| `fileSize` | INTEGER | NOT NULL | File size in bytes |
| `documentType` | TEXT | NOT NULL | Category: `business_license`, `financial_statements`, etc. |
| `status` | TEXT | NOT NULL, DEFAULT `uploaded` | Processing status |
| `aiScore` | INTEGER | NULLABLE | AI validation score (0-100) |
| `fileUrl` | TEXT | NULLABLE | Storage URL or path |
| `uploadedAt` | TEXT | DEFAULT NOW | Upload timestamp |
| `processedAt` | TEXT | NULLABLE | AI/manual processing completion time |

**Document Types** (common values):
- `business_license`
- `financial_statements`
- `tax_returns`
- `bank_statements`
- `proof_of_income`
- `collateral_appraisal`

**Status Workflow**:
```
uploaded → processing → approved
                     ↘ rejected
```

**Storage Strategy**:
- Current implementation uses local filesystem (`public/uploads/`)
- Production should use S3, Azure Blob, or similar
- `fileUrl` should be presigned URLs for security

---

### 4. Bank Accounts Table

**Purpose**: Stores Plaid-connected bank account information for borrowers.

**Table**: `bank_accounts`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY, UUID | Unique bank account ID |
| `userId` | TEXT | NOT NULL, FK → users.id | Account owner |
| `institutionName` | TEXT | NOT NULL | Bank name (e.g., "Chase") |
| `accountName` | TEXT | NOT NULL | Account nickname |
| `accountType` | TEXT | NOT NULL | Type: `checking`, `savings`, etc. |
| `balance` | REAL | NULLABLE | Current balance (USD) |
| `plaidAccountId` | TEXT | NULLABLE | Plaid account identifier |
| `plaidAccessToken` | TEXT | NULLABLE | Plaid access token (encrypted) |
| `isConnected` | INTEGER (BOOLEAN) | DEFAULT TRUE | Connection status |
| `lastSyncedAt` | TEXT | DEFAULT NOW | Last data sync timestamp |
| `createdAt` | TEXT | DEFAULT NOW | Record creation timestamp |

**Security Notes**:
- `plaidAccessToken` should be encrypted at rest
- Consider using a separate secrets vault (AWS Secrets Manager, HashiCorp Vault)
- Tokens should be rotated periodically

**Plaid Integration**:
- Link initiated via Plaid Link UI component
- Access tokens exchanged via Plaid API
- Balance updates via Plaid Transactions API

**Indexes**:
- Foreign key index on `userId`
- Index on `isConnected` for filtering active accounts

---

### 5. Application Invites Table

**Purpose**: Secure, time-limited tokens for borrower onboarding and application access.

**Table**: `application_invites`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY, UUID | Unique invite ID |
| `applicationId` | TEXT | NOT NULL, FK → loan_applications.id | Associated application |
| `borrowerId` | TEXT | NOT NULL, FK → users.id | Invited borrower |
| `token` | TEXT | NOT NULL, UNIQUE | Opaque invite token (crypto-random) |
| `email` | TEXT | NOT NULL | Recipient email address |
| `invitedBy` | TEXT | NOT NULL, FK → users.id | Lender who created invite |
| `usedAt` | TEXT | NULLABLE | Timestamp when invite was accepted |
| `expiresAt` | TEXT | NOT NULL | Expiration timestamp (ISO 8601) |
| `createdAt` | TEXT | DEFAULT NOW | Invite creation timestamp |

**Token Generation**:
- Opaque tokens: `crypto.randomBytes(32).toString('hex')`
- HMAC-signed tokens: Used for borrower-only invites (no application context)
- Default expiry: 168 hours (7 days)

**Workflow**:
1. Lender generates invite via `/api/invites/generate`
2. System sends email with URL: `/invite/:token`
3. Borrower clicks link and completes onboarding
4. Invite marked as used via `/api/invites/mark-used/:token`

**Business Rules**:
- Expired invites cannot be used (checked server-side)
- Creating a new invite for the same application/borrower expires old ones
- One-time use only (once `usedAt` is set, invalid)

**Indexes**:
- Unique index on `token`
- Index on `expiresAt` for cleanup queries
- Composite index on `applicationId`, `borrowerId`

---

### 6. Account Settings Table

**Purpose**: User-specific preferences, API keys, and notification settings.

**Table**: `account_settings`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY, UUID | Unique settings ID |
| `userId` | TEXT | NOT NULL, UNIQUE, FK → users.id | Settings owner (1:1 relationship) |
| `companyName` | TEXT | NULLABLE | Override company name |
| `logo` | TEXT | NULLABLE | Custom logo URL |
| `emailNotifications` | INTEGER (BOOLEAN) | DEFAULT TRUE | Enable email notifications |
| `smsNotifications` | INTEGER (BOOLEAN) | DEFAULT FALSE | Enable SMS notifications |
| `twoFactorEnabled` | INTEGER (BOOLEAN) | DEFAULT FALSE | Enable 2FA (future) |
| `defaultCurrency` | TEXT | DEFAULT `USD` | Preferred currency code |
| `timezone` | TEXT | DEFAULT `America/New_York` | User timezone (IANA format) |
| `language` | TEXT | DEFAULT `en` | UI language code (ISO 639-1) |
| `autoApproveThreshold` | REAL | NULLABLE | Auto-approve loans under threshold |
| `notificationPreferences` | TEXT | NULLABLE | JSON string of preferences |
| `apiKey` | TEXT | NULLABLE | User API key (generated on demand) |
| `webhookUrl` | TEXT | NULLABLE | Webhook endpoint for events |
| `createdAt` | TEXT | DEFAULT NOW | Settings creation timestamp |
| `updatedAt` | TEXT | DEFAULT NOW | Last update timestamp |

**API Key Management**:
- Generated via `/api/account-settings/generate-api-key`
- Uses `crypto.randomBytes(32).toString('hex')`
- Should be hashed/encrypted in production
- Used for API authentication in addition to session auth

**Notification Preferences**:
- Stored as JSON string
- Example structure:
```json
{
  "email": {
    "newApplication": true,
    "statusChange": true,
    "documentUploaded": false
  },
  "sms": {
    "urgentOnly": true
  }
}
```

**Indexes**:
- Unique index on `userId` (1:1 relationship)
- Index on `apiKey` for API authentication lookups

---

### 7. Branding Settings Table

**Purpose**: Multi-tenant white-label branding customization.

**Table**: `branding_settings`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY, UUID | Unique branding ID |
| `companyName` | TEXT | NOT NULL | Platform company name |
| `logoUrl` | TEXT | NULLABLE | Logo image URL |
| `primaryColor` | TEXT | DEFAULT `#2563eb` | Primary brand color (hex) |
| `secondaryColor` | TEXT | DEFAULT `#64748b` | Secondary brand color (hex) |
| `accentColor` | TEXT | DEFAULT `#7c3aed` | Accent/action color (hex) |
| `fontFamily` | TEXT | DEFAULT `Inter` | Typography font family |
| `loginBackgroundUrl` | TEXT | NULLABLE | Login page background image |
| `isActive` | INTEGER (BOOLEAN) | DEFAULT TRUE | Active branding set |
| `createdAt` | TEXT | DEFAULT NOW | Creation timestamp |
| `updatedAt` | TEXT | DEFAULT NOW | Last update timestamp |

**Multi-Tenancy**:
- Current implementation: Single active branding (global)
- Future: Add `tenantId` column for multi-tenant support
- Frontend fetches via `/api/branding` on app load

**Color Palette**:
- All colors in hex format: `#RRGGBB`
- Used by Tailwind CSS dynamic theming
- Applied to buttons, links, headers, charts

**Logo Guidelines**:
- Recommended size: 180x40px (transparent PNG)
- Max file size: 2MB
- Upload via `/api/upload` endpoint
- Stored in `public/uploads/`

---

### 8. User Dashboard Config Table

**Purpose**: Stores customizable dashboard layouts per user (future feature).

**Table**: `user_dashboard_config`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY, UUID | Unique config ID |
| `userId` | TEXT | NOT NULL, FK → users.id | Dashboard owner |
| `layoutJson` | TEXT | NOT NULL | JSON-serialized layout configuration |
| `createdAt` | TEXT | DEFAULT NOW | Creation timestamp |
| `updatedAt` | TEXT | DEFAULT NOW | Last update timestamp |

**Layout JSON Structure**:
```json
{
  "widgets": [
    {
      "id": "kpi-cards",
      "type": "kpi-grid",
      "position": { "x": 0, "y": 0, "w": 12, "h": 2 },
      "visible": true
    },
    {
      "id": "recent-apps",
      "type": "table",
      "position": { "x": 0, "y": 2, "w": 8, "h": 4 },
      "visible": true
    }
  ],
  "theme": "light",
  "density": "comfortable"
}
```

**API Endpoints**:
- `GET /api/me/dashboard-config` - Fetch config
- `PUT /api/me/dashboard-config` - Save config

**Future Enhancements**:
- Drag-and-drop layout customization
- Widget library with filters
- Shareable dashboard templates

---

## Relationships

### Entity Relationship Diagram

See `21_erd.mmd` for a visual Mermaid diagram.

**Key Relationships**:

1. **Users → Loan Applications** (1:N)
   - One borrower can have many loan applications
   - Foreign key: `loan_applications.borrowerId → users.id`

2. **Users → Loan Applications (Reviewer)** (1:N, optional)
   - One lender can review many applications
   - Foreign key: `loan_applications.reviewedBy → users.id`

3. **Loan Applications → Documents** (1:N)
   - One application can have many supporting documents
   - Foreign key: `documents.applicationId → loan_applications.id`

4. **Users → Bank Accounts** (1:N)
   - One user can connect multiple bank accounts
   - Foreign key: `bank_accounts.userId → users.id`

5. **Loan Applications → Application Invites** (1:N)
   - One application can have multiple invites (e.g., regenerated if expired)
   - Foreign key: `application_invites.applicationId → loan_applications.id`

6. **Users → Application Invites (Invitee)** (1:N)
   - One borrower can be invited to multiple applications
   - Foreign key: `application_invites.borrowerId → users.id`

7. **Users → Application Invites (Inviter)** (1:N)
   - One lender can create many invites
   - Foreign key: `application_invites.invitedBy → users.id`

8. **Users → Account Settings** (1:1)
   - One user has one set of account settings
   - Foreign key: `account_settings.userId → users.id` (UNIQUE)

9. **Users → Dashboard Config** (1:N, typically 1:1)
   - One user can have multiple saved layouts (future versioning)
   - Foreign key: `user_dashboard_config.userId → users.id`

10. **Branding Settings** (Global)
    - No foreign key relationships (standalone, tenant-level in future)

---

## Indexes & Performance

### Recommended Indexes

```sql
-- Users table
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Loan Applications table
CREATE INDEX idx_loan_apps_borrower ON loan_applications(borrowerId);
CREATE INDEX idx_loan_apps_status ON loan_applications(status);
CREATE INDEX idx_loan_apps_submitted_at ON loan_applications(submittedAt DESC);
CREATE INDEX idx_loan_apps_reviewer ON loan_applications(reviewedBy);

-- Documents table
CREATE INDEX idx_documents_application ON documents(applicationId);
CREATE INDEX idx_documents_status ON documents(status);

-- Bank Accounts table
CREATE INDEX idx_bank_accounts_user ON bank_accounts(userId);
CREATE INDEX idx_bank_accounts_connected ON bank_accounts(isConnected);

-- Application Invites table
CREATE UNIQUE INDEX idx_invites_token ON application_invites(token);
CREATE INDEX idx_invites_expires_at ON application_invites(expiresAt);
CREATE INDEX idx_invites_app_borrower ON application_invites(applicationId, borrowerId);

-- Account Settings table
CREATE UNIQUE INDEX idx_account_settings_user ON account_settings(userId);
CREATE INDEX idx_account_settings_api_key ON account_settings(apiKey);
```

### Query Optimization Notes

- **Full-text search**: Consider adding full-text indexes on `loan_applications.loanPurpose`, `documents.fileName` for PostgreSQL
- **Composite indexes**: For common filter combinations (e.g., `status + submittedAt`)
- **Partial indexes**: For frequently queried subsets (e.g., `WHERE status = 'pending'`)

---

## Data Migration Strategy

### Drizzle Kit Workflow

```bash
# 1. Make schema changes in shared/schema.ts

# 2. Generate migration files
npx drizzle-kit generate:sqlite  # for SQLite
npx drizzle-kit generate:pg      # for PostgreSQL

# 3. Review generated SQL in migrations/ folder

# 4. Apply migrations
npm run db:push  # pushes schema directly (dev)
# OR
npx drizzle-kit migrate  # applies migration files (prod)
```

### Migration Safety

- **Always backup** production database before migrations
- **Test migrations** on staging environment first
- **Rollback plan**: Keep previous schema and data dumps
- **Zero-downtime**: Use Drizzle's schema versioning for gradual rollouts

### Seed Data

- Demo data generator: `server/demo-helpers.ts`
- Shared demo data: `shared/demo-data.ts`, `shared/demo-bundle.ts`
- Seed command: Not currently automated (manual via `/api` endpoints in demo mode)

**Future Enhancement**: Add `npm run db:seed` command

---

## Data Retention & Archival

**Current Policy**: No automatic deletion

**Recommendations**:
1. **Soft deletes**: Add `deletedAt` column to major tables
2. **Archive old applications**: Move `status = 'rejected'` after 2 years to archive table
3. **GDPR compliance**: Implement "right to be forgotten" endpoint
4. **Audit logs**: Track all data changes with timestamps and user IDs

---

## Security Considerations

### Sensitive Data

| Field | Table | Protection Required |
|-------|-------|---------------------|
| `password` | users | ✅ Bcrypt hashing (10+ rounds) |
| `plaidAccessToken` | bank_accounts | ⚠️ Encrypt at rest (TODO) |
| `apiKey` | account_settings | ⚠️ Hash before storage (TODO) |
| `email` | users, invites | Consider PII encryption in regulated industries |
| `ssn` / `taxId` | (future) | Must be encrypted, limited access |

### Row-Level Security

**Current**: Application-level (middleware checks `req.user.id`)

**Future**: PostgreSQL RLS policies for multi-tenancy:
```sql
-- Example RLS policy
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY borrower_own_applications ON loan_applications
  FOR ALL USING (borrowerId = current_setting('app.user_id')::text);

CREATE POLICY lender_all_applications ON loan_applications
  FOR ALL USING (current_setting('app.user_role') = 'lender');
```

### Data Validation

- **Schema-level**: Drizzle ORM constraints (NOT NULL, UNIQUE, FK)
- **Application-level**: Zod schemas (`insertUserSchema`, etc.)
- **API-level**: Express middleware + validation in route handlers

---

## Backup & Recovery

**PostgreSQL Best Practices**:
```bash
# Backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -F c -b -v -f backup_$(date +%Y%m%d_%H%M%S).dump

# Restore
pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME -v backup.dump
```

**SQLite**:
```bash
# Backup (simple copy)
cp test.db backups/test_$(date +%Y%m%d).db

# OR use SQLite backup API
sqlite3 test.db ".backup backups/test_backup.db"
```

**Recommended Schedule**:
- **Daily**: Automated backups at 2 AM UTC
- **Weekly**: Full database export to S3/Azure Blob
- **Before migrations**: Manual snapshot

---

## Database Dialect Differences

### SQLite vs PostgreSQL

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| **Primary Key** | `TEXT PRIMARY KEY` | `UUID` or `SERIAL` |
| **Boolean** | `INTEGER` (0/1) | `BOOLEAN` |
| **Timestamps** | `TEXT` (ISO 8601) | `TIMESTAMP WITH TIME ZONE` |
| **JSON** | `TEXT` | `JSONB` (queryable) |
| **Full-text Search** | FTS5 extension | Built-in `tsvector` |
| **Concurrency** | File-level locking | Row-level locking |

**Schema Compatibility**:
- Drizzle ORM abstracts most differences
- Use `sqliteTable()` for development schema
- Use `pgTable()` for production (if needed)
- Current schema uses SQLite table definitions compatible with both

---

## Future Enhancements

### Planned Features
1. **Multi-tenancy**: Add `tenantId` to all tables for SaaS isolation
2. **Audit Trail**: `audit_logs` table for compliance tracking
3. **Notifications**: `notifications` table (currently localStorage-only)
4. **Messages**: `messages` table for borrower-lender communication
5. **Payments**: `payments` table for loan repayments and transactions
6. **Collateral**: `collateral_items` table with appraisal tracking
7. **Credit Reports**: `credit_reports` table for credit checks
8. **Tasks**: `tasks` table for workflow management

### Schema Evolution
- Use Drizzle migrations for versioning
- Maintain backward compatibility for 2 versions
- Document breaking changes in migration comments

---

**End of Data Model Documentation**  
*See also*: `21_erd.mmd` for visual diagram, `22_seed-and-migrations.md` for operational details
