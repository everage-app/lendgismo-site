# Secrets and API Keys

**Last Updated**: October 16, 2025  
**Security Level**: 🔴 CONFIDENTIAL

---

## Overview

This document catalogs all secrets, API keys, and credentials used in Lendgismo, their purpose, rotation schedule, and storage locations.

**⚠️ CRITICAL**: Never commit secrets to version control. Always use environment variables or secrets managers.

---

## Secret Inventory

### Application Secrets

| Secret | Type | Required | Rotation Schedule | Storage Location |
|--------|------|----------|-------------------|------------------|
| `SESSION_SECRET` | Encryption Key | ✅ Yes | 90 days | Secrets Manager |
| `INVITE_SECRET` | HMAC Key | ✅ Yes | 180 days | Secrets Manager |
| `DATABASE_URL` | Connection String | ✅ Yes | On compromise | Secrets Manager |
| `ENCRYPTION_KEY` | AES-256 Key | ❌ Future | 180 days | Secrets Manager |

### Email Provider

| Secret | Type | Required | Rotation Schedule | Storage Location |
|--------|------|----------|-------------------|------------------|
| `SENDGRID_KEY` | API Key | ✅ (if using SendGrid) | 90 days | Secrets Manager |

### Banking Integration (Plaid)

| Secret | Type | Required | Rotation Schedule | Storage Location |
|--------|------|----------|-------------------|------------------|
| `PLAID_CLIENT_ID` | Client ID | ✅ (if using Plaid) | On compromise | Secrets Manager |
| `PLAID_SECRET` | Secret Key | ✅ (if using Plaid) | 180 days | Secrets Manager |

### Payment Processing (Stripe)

| Secret | Type | Required | Rotation Schedule | Storage Location |
|--------|------|----------|-------------------|------------------|
| `STRIPE_SECRET` | Secret Key | ❌ Future | 180 days | Secrets Manager |
| `STRIPE_WEBHOOK` | Webhook Secret | ❌ Future | On compromise | Secrets Manager |

### SMS Provider (Twilio)

| Secret | Type | Required | Rotation Schedule | Storage Location |
|--------|------|----------|-------------------|------------------|
| `TWILIO_SID` | Account SID | ❌ Optional | On compromise | Secrets Manager |
| `TWILIO_TOKEN` | Auth Token | ❌ Optional | 90 days | Secrets Manager |

### Accounting Integration (QuickBooks)

| Secret | Type | Required | Rotation Schedule | Storage Location |
|--------|------|----------|-------------------|------------------|
| `QUICKBOOKS_CLIENT_ID` | OAuth Client ID | ✅ (if using QuickBooks) | On compromise | Secrets Manager |
| `QUICKBOOKS_CLIENT_SECRET` | OAuth Secret | ✅ (if using QuickBooks) | 180 days | Secrets Manager |
| `QUICKBOOKS_REDIRECT_URI` | OAuth Callback URL | ✅ (if using QuickBooks) | On domain change | Config/Secrets Manager |

**Security Notes**:
- OAuth tokens stored encrypted per-tenant
- Access tokens expire after 3600 seconds (1 hour)
- Refresh tokens valid for 100 days
- Implement automatic token refresh 5 minutes before expiration

### Alternative Data (DataMerch)

| Secret | Type | Required | Rotation Schedule | Storage Location |
|--------|------|----------|-------------------|------------------|
| `DATAMERCH_API_KEY` | API Key | ✅ (if using DataMerch) | 90 days | Secrets Manager |
| `DATAMERCH_API_URL` | API Endpoint | ✅ (if using DataMerch) | On migration | Config/Secrets Manager |

**Security Notes**:
- API key grants access to alternative credit data
- Rotate immediately if compromised
- Rate limits: 1000 requests/day (standard tier)
- Monitor for unusual usage patterns

### Credit & Fraud (DecisionLogic)

| Secret | Type | Required | Rotation Schedule | Storage Location |
|--------|------|----------|-------------------|------------------|
| `DECISIONLOGIC_API_KEY` | API Key | ✅ (if using DecisionLogic) | 90 days | Secrets Manager |
| `DECISIONLOGIC_API_URL` | API Endpoint | ✅ (if using DecisionLogic) | On migration | Config/Secrets Manager |

**Security Notes**:
- API key provides access to PII and credit data
- Must comply with FCRA and GLBA requirements
- Rotate immediately if compromised
- Audit all API calls with user context
- Never log PII or SSN data

### Identity Verification (Socure/Alloy)

| Secret | Type | Required | Rotation Schedule | Storage Location |
|--------|------|----------|-------------------|------------------|
| `IDENTITY_PROVIDER` | Provider Selection | ✅ (if using KYC) | On provider change | Config |
| `SOCURE_API_KEY` | API Key | ✅ (if provider=socure) | 90 days | Secrets Manager |
| `ALLOY_API_KEY` | API Key | ✅ (if provider=alloy) | 90 days | Secrets Manager |

**Security Notes**:
- Handles sensitive PII for identity verification
- Must comply with KYC/AML regulations
- Rotate on suspected compromise
- Log all verification attempts for compliance audit

### Database Credentials

| Secret | Type | Required | Rotation Schedule | Storage Location |
|--------|------|----------|-------------------|------------------|
| Postgres Username | Username | ✅ (if using Postgres) | 180 days | Secrets Manager |
| Postgres Password | Password | ✅ (if using Postgres) | 180 days | Secrets Manager |

---

## Secret Generation

### SESSION_SECRET

**Purpose**: Encrypt session cookies and JWT tokens

**Requirements**:
- Minimum 32 characters
- Cryptographically random
- URL-safe characters

**Generation**:
```bash
# OpenSSL (recommended)
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### INVITE_SECRET

**Purpose**: HMAC signing for invite tokens

**Requirements**:
- Minimum 32 bytes
- Hex-encoded
- High entropy

**Generation**:
```bash
# OpenSSL
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Passwords

**Requirements**:
- Minimum 16 characters
- Mix of uppercase, lowercase, numbers, symbols
- No dictionary words

**Generation**:
```bash
# OpenSSL
openssl rand -base64 24

# pwgen (if installed)
pwgen -s 24 1

# Manual with password manager (recommended)
# Use 1Password, LastPass, or Bitwarden to generate
```

---

## Storage Methods

### Development (.env.local)

**For local development only**:

```bash
# .env.local (GITIGNORED)
SESSION_SECRET=dev-session-secret-DO-NOT-USE-IN-PRODUCTION
INVITE_SECRET=dev-invite-secret-DO-NOT-USE-IN-PRODUCTION
DATABASE_URL=file:./test.db
SENDGRID_KEY=SG.DEV_KEY_HERE
```

**⚠️ NEVER commit this file to version control**

Add to `.gitignore`:
```
.env.local
.env.*.local
*.env
```

### Staging/Production

#### AWS Secrets Manager

```bash
# Install AWS CLI
brew install awscli  # macOS
apt-get install awscli  # Ubuntu

# Configure credentials
aws configure

# Create secret
aws secretsmanager create-secret \
  --name lendgismo/production/session-secret \
  --description "Session encryption key for production" \
  --secret-string "$(openssl rand -base64 32)"

# Retrieve secret
aws secretsmanager get-secret-value \
  --secret-id lendgismo/production/session-secret \
  --query SecretString \
  --output text
```

#### Azure Key Vault

```bash
# Install Azure CLI
brew install azure-cli  # macOS

# Login
az login

# Create key vault
az keyvault create \
  --name lendgismo-vault \
  --resource-group lendgismo-rg \
  --location eastus

# Store secret
az keyvault secret set \
  --vault-name lendgismo-vault \
  --name session-secret \
  --value "$(openssl rand -base64 32)"

# Retrieve secret
az keyvault secret show \
  --vault-name lendgismo-vault \
  --name session-secret \
  --query value \
  --output tsv
```

#### HashiCorp Vault

```bash
# Install Vault
brew install vault  # macOS

# Start Vault server (dev mode)
vault server -dev

# Set Vault address
export VAULT_ADDR='http://127.0.0.1:8200'

# Enable KV secrets engine
vault secrets enable -path=secret kv-v2

# Store secret
vault kv put secret/lendgismo/production \
  session_secret="$(openssl rand -base64 32)" \
  invite_secret="$(openssl rand -hex 32)"

# Retrieve secret
vault kv get -field=session_secret secret/lendgismo/production
```

#### Environment Variables (Heroku, Replit, etc.)

```bash
# Heroku
heroku config:set SESSION_SECRET="$(openssl rand -base64 32)"
heroku config:set INVITE_SECRET="$(openssl rand -hex 32)"

# Replit
# Go to Secrets tab in Replit UI
# Add SESSION_SECRET = <generated value>
# Add INVITE_SECRET = <generated value>

# Netlify
netlify env:set SESSION_SECRET "$(openssl rand -base64 32)"
```

---

## Access Control

### Who Should Have Access?

| Role | Access Level | Secrets Accessible |
|------|--------------|-------------------|
| **DevOps Engineer** | Full | All secrets |
| **Backend Developer** | Read-only | Application secrets, database credentials |
| **Frontend Developer** | None | None (uses API endpoints) |
| **Security Team** | Audit | All (read-only, audit trail) |
| **Support Team** | None | None |

### Access Patterns

```bash
# AWS IAM Policy (read-only for developers)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:lendgismo/*"
    }
  ]
}

# AWS IAM Policy (full access for DevOps)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "secretsmanager:*",
      "Resource": "arn:aws:secretsmanager:*:*:secret:lendgismo/*"
    }
  ]
}
```

---

## Rotation Procedures

### SESSION_SECRET Rotation

**Frequency**: Every 90 days or on compromise

**Steps**:
1. Generate new secret: `NEW_SECRET=$(openssl rand -base64 32)`
2. Store in secrets manager under temporary key
3. Update application config to accept both old and new secrets
4. Deploy application
5. Wait 24 hours for all sessions to migrate
6. Update config to use only new secret
7. Deploy again
8. Delete old secret

**Code Example**:
```typescript
// Support dual secrets during rotation
const sessionSecrets = [
  process.env.SESSION_SECRET,      // Current
  process.env.SESSION_SECRET_OLD,  // Previous (for migration)
].filter(Boolean)

app.use(session({
  secret: sessionSecrets,
  // ... other options
}))
```

### API Key Rotation (Plaid, SendGrid, etc.)

**Frequency**: Per vendor recommendations (typically 180 days)

**Steps**:
1. Generate new API key in vendor dashboard
2. Store new key in secrets manager
3. Update application config
4. Deploy application
5. Verify functionality
6. Revoke old API key in vendor dashboard

### Database Password Rotation

**Frequency**: Every 180 days or on compromise

**Steps**:
1. Create new database user with same permissions
2. Store new credentials in secrets manager
3. Update application config to use new credentials
4. Deploy application
5. Verify database connectivity
6. Drop old database user

**Code Example**:
```sql
-- Create new user
CREATE USER lendgismo_new WITH PASSWORD 'new_secure_password';
GRANT ALL PRIVILEGES ON DATABASE lendgismo TO lendgismo_new;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lendgismo_new;

-- After verifying new user works
DROP USER lendgismo_old;
```

---

## Compromise Response

### Immediate Actions

1. **Rotate compromised secret immediately**
2. **Invalidate all active sessions** (if SESSION_SECRET)
3. **Audit access logs** for unauthorized access
4. **Notify security team and affected users**
5. **Update incident response log**

### SESSION_SECRET Compromise

```bash
# 1. Generate new secret
NEW_SESSION_SECRET=$(openssl rand -base64 32)

# 2. Update in secrets manager
aws secretsmanager update-secret \
  --secret-id lendgismo/production/session-secret \
  --secret-string "$NEW_SESSION_SECRET"

# 3. Redeploy application (forces all users to re-login)
git tag "hotfix/session-secret-rotation-$(date +%Y%m%d)"
git push --tags
# Trigger deployment

# 4. Monitor logs for anomalies
tail -f /var/log/app/error.log | grep -i "session"
```

### API Key Compromise

```bash
# 1. Immediately revoke compromised key in vendor dashboard
# (Example: Plaid)
# Login to Plaid Dashboard → API → Keys → Revoke

# 2. Generate new key
# Plaid Dashboard → API → Keys → Create New Key

# 3. Update secrets manager
aws secretsmanager update-secret \
  --secret-id lendgismo/production/plaid-secret \
  --secret-string "NEW_SECRET_HERE"

# 4. Redeploy
# 5. Test integration
curl -X POST https://app.lendgismo.com/api/plaid/link-token
```

---

## Audit Trail

### Logging Secret Access

```typescript
// server/middleware/audit.ts
export function auditSecretAccess(secretName: string, accessor: string) {
  console.log({
    timestamp: new Date().toISOString(),
    event: 'SECRET_ACCESS',
    secretName,
    accessor,
    environment: process.env.NODE_ENV,
  })
}

// Usage
auditSecretAccess('SESSION_SECRET', 'system-startup')
auditSecretAccess('PLAID_SECRET', 'plaid-integration-init')
```

### AWS CloudTrail

Enable CloudTrail for Secrets Manager:

```bash
# Create trail
aws cloudtrail create-trail \
  --name lendgismo-secrets-trail \
  --s3-bucket-name lendgismo-cloudtrail-logs

# Start logging
aws cloudtrail start-logging --name lendgismo-secrets-trail

# View secret access events
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=ResourceName,AttributeValue=lendgismo/production/session-secret \
  --max-results 50
```

---

## Secret Validation

### Startup Validation

```typescript
// server/index.ts
import { z } from 'zod'

const secretsSchema = z.object({
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  INVITE_SECRET: z.string().min(32, 'INVITE_SECRET must be at least 32 characters'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  SENDGRID_KEY: z.string().regex(/^SG\./, 'SENDGRID_KEY must start with "SG."').optional(),
  PLAID_SECRET: z.string().min(20).optional(),
})

try {
  secretsSchema.parse(process.env)
  console.log('✅ All secrets validated successfully')
} catch (error) {
  console.error('❌ Secret validation failed:', error)
  process.exit(1)
}
```

### Runtime Validation

```typescript
// Validate API key format before use
export function validatePlaidSecret(secret: string): boolean {
  // Plaid secrets are 40+ characters, alphanumeric + hyphens
  return /^[a-f0-9-]{40,}$/.test(secret)
}

export function validateSendGridKey(key: string): boolean {
  // SendGrid keys start with "SG." followed by base64
  return /^SG\.[A-Za-z0-9_-]+$/.test(key)
}
```

---

## Best Practices

### ✅ DO

- ✅ Use cryptographically random secrets
- ✅ Store secrets in secrets manager (AWS, Azure, Vault)
- ✅ Rotate secrets regularly (90-180 days)
- ✅ Use different secrets for dev, staging, production
- ✅ Implement secret validation at startup
- ✅ Audit all secret access
- ✅ Use environment variables (never hardcode)
- ✅ Encrypt secrets at rest and in transit
- ✅ Limit access to secrets (principle of least privilege)
- ✅ Have a rotation plan and test it regularly

### ❌ DON'T

- ❌ Commit secrets to version control (`.git`, `.env`)
- ❌ Log secrets to console or files
- ❌ Send secrets via email or Slack
- ❌ Reuse secrets across environments
- ❌ Use weak or predictable secrets
- ❌ Store secrets in frontend code or browser storage
- ❌ Share secrets in screenshot or screen recordings
- ❌ Use production secrets in development

---

## Quick Reference

### Generate All Secrets (One Command)

```bash
cat > .env.production << EOF
SESSION_SECRET=$(openssl rand -base64 32)
INVITE_SECRET=$(openssl rand -hex 32)
DATABASE_PASSWORD=$(openssl rand -base64 24)
EOF

echo "✅ Secrets generated in .env.production"
echo "⚠️  DO NOT COMMIT THIS FILE"
```

### Verify Secrets Are Not Committed

```bash
# Check git history for secrets
git log -p | grep -E "(SESSION_SECRET|INVITE_SECRET|SENDGRID_KEY|PLAID_SECRET)" && \
  echo "⚠️  SECRETS FOUND IN GIT HISTORY" || \
  echo "✅ No secrets found in git history"

# Scan current files
rg -i "(session_secret|invite_secret|sendgrid_key|plaid_secret).*=.*[a-zA-Z0-9]{20,}" --type-not log
```

### Rotate All Secrets (Emergency)

```bash
#!/bin/bash
# rotate-all-secrets.sh

# Generate new secrets
NEW_SESSION_SECRET=$(openssl rand -base64 32)
NEW_INVITE_SECRET=$(openssl rand -hex 32)

# Update in AWS Secrets Manager
aws secretsmanager update-secret --secret-id lendgismo/production/session-secret --secret-string "$NEW_SESSION_SECRET"
aws secretsmanager update-secret --secret-id lendgismo/production/invite-secret --secret-string "$NEW_INVITE_SECRET"

echo "✅ All secrets rotated. Deploy application now."
```

---

**End of Secrets and API Keys Documentation**  
*Next*: See `32_feature-flags.md` for feature toggles, `40_features-overview.md` for application features
