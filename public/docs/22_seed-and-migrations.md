# Database Seeds & Migrations

**Last Updated**: October 16, 2025  
**ORM**: Drizzle ORM 0.39.3  
**Migration Tool**: Drizzle Kit 0.31.4

---

## Overview

This document covers database migration workflows, seed data generation, and safe operational practices for both development (SQLite) and production (PostgreSQL) environments.

---

## Migration Workflow

### Development Cycle

```bash
# 1. Edit schema
vim shared/schema.ts

# 2. Generate migration (auto-detect dialect from DATABASE_URL)
npx drizzle-kit generate

# 3. Review generated SQL
cat migrations/0001_migration_name.sql

# 4. Push to database (dev mode - direct schema push)
npm run db:push

# 5. Verify changes
npx drizzle-kit studio  # Visual browser (when configured)
# OR
sqlite3 test.db ".schema users"  # For SQLite
psql $DATABASE_URL -c "\d users"  # For PostgreSQL
```

### Production Deployment

```bash
# 1. Test migration on staging database first
DATABASE_URL="postgresql://staging..." npm run db:push

# 2. Backup production database
pg_dump -h $PROD_HOST -U $PROD_USER -d $PROD_DB -F c -f backup_pre_migration.dump

# 3. Apply migration (use migration files, not push)
npx drizzle-kit migrate

# 4. Verify schema integrity
npm run check  # TypeScript type checking
# Run integration tests

# 5. Monitor application logs for errors
# 6. Keep backup for 30 days (rollback window)
```

---

## Drizzle Kit Commands

### Generate Migrations

```bash
# Auto-detect dialect from DATABASE_URL
npx drizzle-kit generate

# Force specific dialect
npx drizzle-kit generate:sqlite
npx drizzle-kit generate:pg

# Custom migration name
npx drizzle-kit generate --name add_notifications_table
```

### Push Schema (Dev Mode)

```bash
# Direct schema push (skips migration files)
npm run db:push

# Equivalent to:
npx drizzle-kit push
```

⚠️ **Warning**: `db:push` directly alters the database schema. Use only in development or with extreme caution.

### Apply Migrations (Prod Mode)

```bash
# Apply all pending migrations
npx drizzle-kit migrate

# Dry run (show SQL without executing)
npx drizzle-kit migrate --dry-run
```

### Studio (Visual Database Browser)

```bash
# Launch Drizzle Studio (when configured)
npx drizzle-kit studio

# Access at http://localhost:4983
```

Currently shows:
> "db studio not configured; skipping"

**TODO**: Configure in `drizzle.config.ts` or via env vars.

---

## Migration File Structure

### Location
```
AssetLender/
└── migrations/
    ├── meta/
    │   └── _journal.json      # Migration history
    ├── 0000_initial.sql       # Initial schema
    ├── 0001_add_invites.sql   # Add invites table
    └── 0002_add_settings.sql  # Add settings tables
```

### Example Migration File

```sql
-- migrations/0001_add_invites.sql
CREATE TABLE IF NOT EXISTS "application_invites" (
  "id" text PRIMARY KEY NOT NULL,
  "application_id" text NOT NULL,
  "borrower_id" text NOT NULL,
  "token" text NOT NULL,
  "email" text NOT NULL,
  "invited_by" text NOT NULL,
  "used_at" text,
  "expires_at" text NOT NULL,
  "created_at" text NOT NULL,
  FOREIGN KEY ("application_id") REFERENCES "loan_applications"("id") ON DELETE CASCADE,
  FOREIGN KEY ("borrower_id") REFERENCES "users"("id") ON DELETE CASCADE,
  FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_invites_token" ON "application_invites"("token");
CREATE INDEX IF NOT EXISTS "idx_invites_expires_at" ON "application_invites"("expires_at");
```

---

## Rollback Strategy

### Manual Rollback (Migration Files)

```bash
# 1. Identify migration to rollback
cat migrations/meta/_journal.json

# 2. Write rollback SQL (reverse of migration)
cat migrations/0001_add_invites_rollback.sql
# DROP TABLE IF EXISTS application_invites;

# 3. Apply rollback
psql $DATABASE_URL -f migrations/0001_add_invites_rollback.sql

# 4. Update journal (manual edit)
# Remove entry from migrations/meta/_journal.json
```

⚠️ **Drizzle Kit does not have automatic rollback**. Always:
- Keep database backups
- Write down migrations manually
- Test rollback on staging first

### Restore from Backup

```bash
# PostgreSQL
pg_restore -h $PROD_HOST -U $PROD_USER -d $PROD_DB --clean backup.dump

# SQLite
cp backups/test_20251015.db test.db
```

---

## Seed Data

### Demo Data Generators

**Location**: `server/demo-helpers.ts`, `shared/demo-data.ts`

**Purpose**:
- Provide realistic demo data for UI development
- Populate development databases
- Support demo mode (no DATABASE_URL required)

### Seed Data Structure

Demo data includes:
- **KPIs**: Dashboard metrics (total applications, approval rate, etc.)
- **Borrowers**: Sample borrower profiles
- **Applications**: Loan applications with various statuses
- **Transactions**: Bank transaction history
- **Payments**: Loan payment schedules
- **Collateral**: Asset valuations
- **Fraud/Risk**: Risk scores and fraud flags
- **Financials**: Income statements, balance sheets

### Manual Seeding (API-based)

```bash
# Start server in demo mode (no DATABASE_URL)
npm run dev

# Use API endpoints to create seed data
# Example: Create demo users
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Demo",
    "lastName": "Borrower",
    "email": "demo@example.com",
    "companyName": "Demo Corp",
    "role": "borrower"
  }'

# Create loan application
curl -X POST http://localhost:5000/api/loan-applications \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Demo Corp",
    "loanAmount": 50000,
    "loanPurpose": "Equipment purchase",
    "collateralType": "Equipment",
    "collateralValue": 75000
  }'
```

### Automated Seeding (Future Enhancement)

**Recommended**: Create `scripts/seed.ts`

```typescript
// scripts/seed.ts (example structure)
import { db } from '../server/db';
import { users, loanApplications } from '../shared/schema';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Seeding database...');
  
  // Create demo lender
  const lender = await db.insert(users).values({
    email: 'lender@demo.com',
    password: await bcrypt.hash('demo123', 10),
    firstName: 'Demo',
    lastName: 'Lender',
    role: 'lender',
    companyName: 'Capital Lending Group'
  }).returning();
  
  // Create demo borrowers
  // ...
  
  // Create sample applications
  // ...
  
  console.log('✅ Seed complete!');
}

seed().catch(console.error);
```

**Add to package.json**:
```json
{
  "scripts": {
    "db:seed": "tsx scripts/seed.ts"
  }
}
```

---

## Database-Specific Considerations

### SQLite (Development)

**Connection**:
```bash
DATABASE_URL="file:./test.db"
```

**Pros**:
- Zero setup, file-based
- Perfect for local development
- Fast for small datasets

**Cons**:
- No concurrent writes (file-level locking)
- Limited to ~1-2 million rows
- No native UUID type (uses TEXT)

**Migration Notes**:
- SQLite doesn't support `ALTER TABLE DROP COLUMN`
- Use table recreation strategy:
  ```sql
  -- Create new table
  CREATE TABLE users_new (...);
  -- Copy data
  INSERT INTO users_new SELECT ... FROM users;
  -- Drop old table
  DROP TABLE users;
  -- Rename
  ALTER TABLE users_new RENAME TO users;
  ```

### PostgreSQL (Production)

**Connection**:
```bash
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"
```

**Pros**:
- High concurrency (MVCC)
- Advanced features (JSONB, full-text search, RLS)
- Horizontal scaling (read replicas)

**Cons**:
- Requires server setup
- More complex backups
- Higher resource usage

**Migration Notes**:
- Use transactions for atomic migrations:
  ```sql
  BEGIN;
  ALTER TABLE users ADD COLUMN new_field TEXT;
  COMMIT;
  ```
- Rollback on error:
  ```sql
  ROLLBACK;
  ```

---

## Schema Evolution Best Practices

### 1. Additive Changes (Safe)

✅ **Add columns** (with defaults or nullable):
```sql
ALTER TABLE users ADD COLUMN phone TEXT;
```

✅ **Add indexes**:
```sql
CREATE INDEX idx_users_phone ON users(phone);
```

✅ **Add tables**:
```sql
CREATE TABLE notifications (...);
```

### 2. Backward-Incompatible Changes (Risky)

⚠️ **Drop columns** (data loss):
```sql
-- Create backup first!
ALTER TABLE users DROP COLUMN old_field;
```

⚠️ **Rename columns** (breaks old code):
```sql
-- Preferred: Add new column, migrate data, drop old
ALTER TABLE users ADD COLUMN new_name TEXT;
UPDATE users SET new_name = old_name;
-- Deploy code using new_name
ALTER TABLE users DROP COLUMN old_name;
```

⚠️ **Change column types** (potential data corruption):
```sql
-- Safe: TEXT → TEXT (larger)
-- Unsafe: TEXT → INTEGER (validation required)
ALTER TABLE users ALTER COLUMN age TYPE INTEGER USING age::INTEGER;
```

### 3. Zero-Downtime Migrations

**Expand-Contract Pattern**:

1. **Expand**: Add new schema (columns, tables)
2. **Migrate**: Dual-write to old and new schema
3. **Verify**: Test new schema in production
4. **Contract**: Remove old schema

**Example**:
```sql
-- Phase 1: Expand
ALTER TABLE users ADD COLUMN full_name TEXT;

-- Phase 2: Migrate (application code)
-- Write to both firstName + lastName AND full_name

-- Phase 3: Verify
-- Confirm all rows have full_name populated

-- Phase 4: Contract (weeks later)
ALTER TABLE users DROP COLUMN firstName;
ALTER TABLE users DROP COLUMN lastName;
```

---

## Data Validation

### Pre-Migration Checks

```sql
-- Check for NULL values before adding NOT NULL constraint
SELECT COUNT(*) FROM users WHERE email IS NULL;

-- Check data types before conversion
SELECT id, age FROM users WHERE age !~ '^[0-9]+$';

-- Check foreign key integrity
SELECT COUNT(*) FROM loan_applications la
  LEFT JOIN users u ON la.borrowerId = u.id
  WHERE u.id IS NULL;
```

### Post-Migration Checks

```sql
-- Verify schema structure
\d+ users  -- PostgreSQL
.schema users  -- SQLite

-- Verify row counts
SELECT COUNT(*) FROM users;

-- Verify constraints
SELECT * FROM information_schema.table_constraints
  WHERE table_name = 'users';
```

---

## Backup & Recovery

### Automated Backups

**PostgreSQL (via cron)**:
```bash
# Daily backup at 2 AM UTC
0 2 * * * /usr/bin/pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
  -F c -b -v -f /backups/daily/$(date +\%Y\%m\%d).dump

# Weekly backup (retain 4 weeks)
0 2 * * 0 /usr/bin/pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
  -F c -b -v -f /backups/weekly/$(date +\%Y\%m\%d).dump \
  && find /backups/weekly -mtime +28 -delete
```

**SQLite**:
```bash
# Hourly backup (development)
0 * * * * cp /app/test.db /backups/hourly/$(date +\%Y\%m\%d_\%H).db \
  && find /backups/hourly -mtime +1 -delete
```

### Restore Procedures

**PostgreSQL**:
```bash
# 1. Stop application (prevent writes)
systemctl stop assetlender

# 2. Restore database
pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME --clean backup.dump

# 3. Verify data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# 4. Restart application
systemctl start assetlender
```

**SQLite**:
```bash
# 1. Stop application
pkill -f "node.*server/index.ts"

# 2. Restore file
cp backups/test_20251015.db test.db

# 3. Verify
sqlite3 test.db "SELECT COUNT(*) FROM users;"

# 4. Restart
npm run dev
```

---

## Multi-Environment Strategy

### Environment-Specific Databases

| Environment | Database | Purpose |
|-------------|----------|---------|
| **Local Dev** | SQLite (`test.db`) | Individual developer work |
| **Replit Dev** | SQLite or Neon PostgreSQL | Shared dev environment |
| **Staging** | PostgreSQL (AWS RDS/Azure) | Pre-production testing |
| **Production** | PostgreSQL (managed service) | Live user data |

### Migration Promotion

```bash
# 1. Develop locally (SQLite)
DATABASE_URL="file:./test.db" npm run db:push

# 2. Test on staging (PostgreSQL)
DATABASE_URL="postgresql://staging..." npm run db:push

# 3. Generate migration for production
npx drizzle-kit generate --name add_feature_x

# 4. Commit migration files
git add migrations/
git commit -m "migration: add feature X tables"

# 5. Deploy to production (via CI/CD)
# CI/CD pipeline runs: npx drizzle-kit migrate
```

---

## Troubleshooting

### Common Migration Errors

**Error**: `relation "users" already exists`
```bash
# Fix: Drop and recreate (dev only!)
DATABASE_URL="file:./test.db" npm run db:push -- --force
```

**Error**: `column "email" does not exist`
```sql
-- Fix: Verify schema matches migration
\d users  -- Check actual schema
cat migrations/latest.sql  -- Check migration SQL
```

**Error**: `foreign key constraint violation`
```sql
-- Fix: Delete orphaned records first
DELETE FROM loan_applications
  WHERE borrowerId NOT IN (SELECT id FROM users);

-- Then retry migration
```

**Error**: `migration checksum mismatch`
```bash
# Fix: Regenerate migrations from current schema
rm -rf migrations/
npx drizzle-kit generate
npx drizzle-kit migrate
```

### Lock Conflicts (SQLite)

```bash
# Error: database is locked
# Cause: Multiple processes accessing SQLite file

# Solution 1: Stop all processes
pkill -f "node.*server"

# Solution 2: Use WAL mode (Write-Ahead Logging)
sqlite3 test.db "PRAGMA journal_mode=WAL;"
```

### Connection Pooling (PostgreSQL)

```typescript
// server/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,  // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Use pool.query() instead of direct connections
```

---

## Monitoring & Alerts

### Migration Logging

```bash
# Log migration output
npx drizzle-kit migrate 2>&1 | tee logs/migration_$(date +%Y%m%d).log

# Monitor for errors
grep -i error logs/migration_*.log
```

### Schema Drift Detection

```bash
# Generate migration in CI (should be empty if in sync)
npx drizzle-kit generate --name ci_check

# If non-empty, fail the build
if [ -n "$(ls migrations/*.sql 2>/dev/null)" ]; then
  echo "Error: Schema drift detected!"
  exit 1
fi
```

---

## Best Practices Summary

✅ **DO**:
- Always backup before migrations
- Test migrations on staging first
- Use transactions for multi-step changes
- Version migrations in Git
- Document breaking changes
- Monitor application logs after migrations

❌ **DON'T**:
- Run migrations directly on production (use CI/CD)
- Edit applied migration files
- Drop tables without backups
- Use `db:push` in production
- Ignore migration errors

---

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs)
- [Drizzle Kit Migration Guide](https://orm.drizzle.team/kit-docs/overview)
- [PostgreSQL Backup Best Practices](https://www.postgresql.org/docs/current/backup.html)
- [SQLite CLI Reference](https://sqlite.org/cli.html)

---

**End of Seeds & Migrations Guide**  
*Next*: See `30_configuration.md` for environment setup, `60_local-dev.md` for development workflows
