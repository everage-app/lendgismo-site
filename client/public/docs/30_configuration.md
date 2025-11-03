# Configuration Reference

**Last Updated**: October 16, 2025  
**Configuration Method**: Environment Variables (.env)

## At a glance
- Envs: `.env.local` (dev), `.env.staging`, `.env.production`
- Required: `DATABASE_URL`, `SESSION_SECRET`
- Security: Prefer a secrets manager in production

## Quick links
- [Environment Variables](#environment-variables)
- [Environment-Specific Configuration](#environment-specific-configuration)
- [Secrets Management](#secrets-management)
- [Validation](#validation)
- [Runtime Configuration](#runtime-configuration)
- [Configuration Best Practices](#configuration-best-practices)
- [Troubleshooting](#troubleshooting)
- [Configuration Checklist](#configuration-checklist)

---

## Environment Variables

### Core Application Settings

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `NODE_ENV` | string | ❌ | `development` | Environment mode: `development`, `staging`, `production` |
| `PORT` | number | ❌ | `5000` | HTTP server port |
| `DATABASE_URL` | string | ✅ | - | Database connection string (PostgreSQL or SQLite) |
| `SESSION_SECRET` | string | ✅ | - | Session encryption key (min 32 characters) |

### Database Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `DATABASE_URL` | string | ✅ | - | Full connection string |
| `PGSSL_DEV_NO_VERIFY` | boolean | ❌ | `false` | Disable SSL verification (dev only, NEVER in production) |

**Examples**:
```bash
# SQLite (development)
DATABASE_URL="file:./test.db"

# PostgreSQL (production)
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"

# Neon (serverless PostgreSQL)
DATABASE_URL="postgresql://user:pass@ep-example.aws.neon.tech/dbname?sslmode=require"
```

### Security Settings

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `SESSION_SECRET` | string | ✅ | - | Secret for session encryption (use strong random string) |
| `CORS_ORIGIN` | string | ❌ | `*` | Allowed CORS origins (comma-separated) |
| `RATE_LIMIT_WINDOW` | number | ❌ | `900000` | Rate limit window in ms (default: 15 minutes) |
| `RATE_LIMIT_MAX` | number | ❌ | `100` | Max requests per window |

**Examples**:
```bash
SESSION_SECRET="$(openssl rand -base64 32)"
CORS_ORIGIN="https://app.lendgismo.com,https://www.lendgismo.com"
RATE_LIMIT_WINDOW=900000  # 15 minutes
RATE_LIMIT_MAX=100
```

### Logging

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `LOG_LEVEL` | string | ❌ | `info` | Logging verbosity: `debug`, `info`, `warn`, `error` |

**Examples**:
```bash
# Development: verbose logging
LOG_LEVEL=debug

# Production: errors and warnings only
LOG_LEVEL=warn
```

### Email Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `EMAIL_PROVIDER` | string | ❌ | `console` | Email provider: `console`, `sendgrid`, `aws-ses` |
| `SENDGRID_KEY` | string | ❌ | - | SendGrid API key (if provider=sendgrid) |
| `APP_BASE_URL` | string | ❌ | auto-detect | Base URL for email links |

**Examples**:
```bash
# Development: log emails to console
EMAIL_PROVIDER=console

# Production: SendGrid
EMAIL_PROVIDER=sendgrid
SENDGRID_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx
APP_BASE_URL=https://app.lendgismo.com
```

### Invite System

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `INVITE_SECRET` | string | ❌ | `dev-invite-secret` | HMAC secret for invite tokens |
| `APP_BASE_URL` | string | ❌ | auto-detect | Base URL for invite links |

**Examples**:
```bash
INVITE_SECRET="$(openssl rand -hex 32)"
APP_BASE_URL=https://app.lendgismo.com
```

### Demo Mode

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `ALLOW_DEMO_LOGIN` | boolean | ❌ | `false` | Enable demo login credentials |
| `AUTH_MODE` | string | ❌ | - | Set to `demo` for demo mode |
| `DEMO_EMAIL` | string | ❌ | `admin@example.com` | Demo user email |
| `DEMO_PASSWORD` | string | ❌ | `admin123` | Demo user password |
| `DEMO_USER` | JSON | ❌ | - | Full demo user object (JSON string) |

**Examples**:
```bash
# Enable demo mode
ALLOW_DEMO_LOGIN=1
AUTH_MODE=demo
DEMO_EMAIL=admin@example.com
DEMO_PASSWORD=admin123
DEMO_USER='{"id":"demo-admin","role":"lender","email":"admin@example.com","demo":true}'
```

### Third-Party Integrations (Optional)

Stored in ephemeral memory via `/api/integrations` endpoints. Can also be configured via env vars:

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `PLAID_CLIENT_ID` | string | ❌ | - | Plaid client ID |
| `PLAID_SECRET` | string | ❌ | - | Plaid secret key |
| `PLAID_ENV` | string | ❌ | `sandbox` | Plaid environment: `sandbox`, `development`, `production` |
| `TWILIO_SID` | string | ❌ | - | Twilio account SID |
| `TWILIO_TOKEN` | string | ❌ | - | Twilio auth token |
| `TWILIO_FROM` | string | ❌ | - | Twilio phone number |
| `STRIPE_SECRET` | string | ❌ | - | Stripe secret key |
| `STRIPE_WEBHOOK` | string | ❌ | - | Stripe webhook secret |

---

## Environment-Specific Configuration

### Development (.env.local)

```bash
# Development configuration
NODE_ENV=development
PORT=5000
DATABASE_URL=file:./test.db
SESSION_SECRET=dev-session-secret-change-in-production
LOG_LEVEL=debug
EMAIL_PROVIDER=console
ALLOW_DEMO_LOGIN=1
AUTH_MODE=demo
```

### Staging (.env.staging)

```bash
# Staging configuration
NODE_ENV=staging
PORT=5000
DATABASE_URL=postgresql://user:pass@staging-db.example.com:5432/lendgismo_staging
SESSION_SECRET=${STAGING_SESSION_SECRET}
CORS_ORIGIN=https://staging.lendgismo.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=200
LOG_LEVEL=info
EMAIL_PROVIDER=sendgrid
SENDGRID_KEY=${SENDGRID_API_KEY}
APP_BASE_URL=https://staging.lendgismo.com
INVITE_SECRET=${STAGING_INVITE_SECRET}
```

### Production (.env.production)

```bash
# Production configuration
NODE_ENV=production
PORT=5000
DATABASE_URL=${DATABASE_URL}
SESSION_SECRET=${SESSION_SECRET}
CORS_ORIGIN=https://app.lendgismo.com,https://www.lendgismo.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=warn
EMAIL_PROVIDER=sendgrid
SENDGRID_KEY=${SENDGRID_API_KEY}
APP_BASE_URL=https://app.lendgismo.com
INVITE_SECRET=${INVITE_SECRET}

# Third-party integrations (stored in secrets manager)
PLAID_CLIENT_ID=${PLAID_CLIENT_ID}
PLAID_SECRET=${PLAID_SECRET}
PLAID_ENV=production
```

---

## Secrets Management

### Development

Store in `.env.local` (gitignored):
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### Production

**DO NOT** store secrets in `.env` files in production. Use a secrets manager:

#### AWS Secrets Manager

```bash
# Store secret
aws secretsmanager create-secret \
  --name lendgismo/production/database-url \
  --secret-string "postgresql://..."

# Retrieve in application
DATABASE_URL=$(aws secretsmanager get-secret-value \
  --secret-id lendgismo/production/database-url \
  --query SecretString --output text)
```

#### Azure Key Vault

```bash
# Store secret
az keyvault secret set \
  --vault-name lendgismo-vault \
  --name database-url \
  --value "postgresql://..."

# Retrieve in application
DATABASE_URL=$(az keyvault secret show \
  --vault-name lendgismo-vault \
  --name database-url \
  --query value --output tsv)
```

#### HashiCorp Vault

```bash
# Store secret
vault kv put secret/lendgismo/production \
  database_url="postgresql://..." \
  session_secret="..."

# Retrieve in application
export DATABASE_URL=$(vault kv get -field=database_url secret/lendgismo/production)
```

---

## Validation

### Required Variables Check

```typescript
// server/index.ts
const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET']

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`)
    process.exit(1)
  }
})
```

### Type Validation

```typescript
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_WINDOW: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
})

const env = envSchema.parse(process.env)
```

---

## Runtime Configuration

### Feature Flags

Implemented via environment variables or database settings:

```typescript
export const featureFlags = {
  // Enable AI risk scoring
  AI_SCORING_ENABLED: process.env.ENABLE_AI_SCORING === '1',
  
  // Enable Plaid integration
  PLAID_ENABLED: !!process.env.PLAID_CLIENT_ID,
  
  // Enable email notifications
  EMAIL_NOTIFICATIONS_ENABLED: process.env.EMAIL_PROVIDER !== 'console',
  
  // Enable demo mode
  DEMO_MODE: process.env.AUTH_MODE === 'demo' || process.env.ALLOW_DEMO_LOGIN === '1',
  
  // Enable WebSocket real-time updates
  WEBSOCKET_ENABLED: process.env.ENABLE_WEBSOCKET === '1',
}
```

### Application Settings

Stored in database (`branding_settings` and `account_settings` tables):

- Company name
- Logo URL
- Color scheme
- Font family
- Email notifications
- SMS notifications
- Auto-approve threshold
- API keys
- Webhook URLs

---

## Configuration Best Practices

### 1. Twelve-Factor App

Follow [12-factor principles](https://12factor.net/config):
- ✅ Store config in environment
- ✅ Strict separation of config from code
- ✅ Never commit secrets to version control

### 2. Secrets Rotation

Rotate secrets regularly:
- `SESSION_SECRET`: Every 90 days
- `INVITE_SECRET`: Every 180 days
- API keys: Per vendor recommendations
- Database credentials: Every 180 days

### 3. Principle of Least Privilege

Grant only necessary permissions:
- Database user should have minimal permissions
- API keys should have scoped access
- Service accounts should be role-specific

### 4. Environment Parity

Keep dev, staging, and production as similar as possible:
- Same database engine (PostgreSQL)
- Same Node.js version
- Same dependency versions
- Different data, same schema

### 5. Monitoring

Monitor configuration changes:
- Log all config updates
- Alert on sensitive variable changes
- Track who changed what and when

---

## Troubleshooting

### Missing Environment Variables

**Error**: `Missing required environment variable: DATABASE_URL`

**Solution**:
```bash
# Check if .env file exists
ls -la .env

# Load from example
cp .env.example .env

# Edit and add DATABASE_URL
vim .env
```

### Database Connection Errors

**Error**: `connection to server failed: FATAL: password authentication failed`

**Solutions**:
```bash
# Verify credentials
psql $DATABASE_URL

# Check SSL mode
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# For local dev, disable SSL verification (DEV ONLY)
PGSSL_DEV_NO_VERIFY=1
```

### Session Issues

**Error**: `TypeError: Cannot read property 'user' of undefined`

**Solution**:
```bash
# Ensure SESSION_SECRET is set
echo $SESSION_SECRET

# Generate a strong secret
SESSION_SECRET=$(openssl rand -base64 32)
```

### CORS Errors

**Error**: `Access to fetch blocked by CORS policy`

**Solution**:
```bash
# Update CORS_ORIGIN to include your frontend URL
CORS_ORIGIN=https://app.lendgismo.com

# For local development with Vite
CORS_ORIGIN=http://localhost:5173,http://localhost:5000
```

---

## Configuration Checklist

Before deploying to production:

- [ ] All required environment variables set
- [ ] Secrets stored in secrets manager (not .env files)
- [ ] `SESSION_SECRET` is strong random string (32+ characters)
- [ ] `NODE_ENV=production`
- [ ] `LOG_LEVEL=warn` or `error`
- [ ] `CORS_ORIGIN` set to specific domains (not `*`)
- [ ] Rate limiting configured appropriately
- [ ] Database connection uses SSL (`?sslmode=require`)
- [ ] Email provider configured (not `console`)
- [ ] `APP_BASE_URL` points to production domain
- [ ] Demo mode disabled (`ALLOW_DEMO_LOGIN` not set)
- [ ] Third-party API keys rotated from staging
- [ ] Backup of current configuration stored securely

---

**End of Configuration Reference**  
*Next*: See `31_secrets-and-keys.md` for secrets management, `32_feature-flags.md` for feature toggles
