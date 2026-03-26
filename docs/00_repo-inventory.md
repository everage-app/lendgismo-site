# Repository Inventory

**Generated**: December 9, 2025  
**Repository**: Lendgismo Asset Lender Platform  
**Purpose**: Comprehensive repository scan and technology inventory

---

## Executive Summary

Lendgismo is a full-stack loan application management platform designed for asset-based lending. It features a modern React frontend, Express backend, dual-database support (SQLite/PostgreSQL), and integrations with third-party financial services.

---

## Technology Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript 5.6.3
- **Build Tool**: Vite 5.4.20
- **Routing**: Wouter 3.3.5 (lightweight client-side routing)
- **State Management**: @tanstack/react-query 5.60.5
- **UI Components**: 
  - Radix UI primitives (@radix-ui/react-*)
  - shadcn/ui pattern (components.json present)
  - Custom components in `client/src/components/`
- **Styling**:
  - Tailwind CSS 3.4.17
  - PostCSS 8.4.47
  - Autoprefixer 10.4.20
  - Tailwind plugins: @tailwindcss/typography, tailwindcss-animate
- **Forms**: react-hook-form 7.55.0 + @hookform/resolvers 3.10.0
- **Validation**: Zod 3.24.2
- **Charts/Visualization**: Recharts 2.15.2
- **Icons**: Lucide React 0.453.0, React Icons 5.4.0
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable, react-beautiful-dnd
- **Theming**: next-themes 0.4.6 (dark/light mode support)
- **Animation**: Framer Motion 11.13.1

### Backend
- **Runtime**: Node.js 20.x
- **Framework**: Express 4.21.2
- **Language**: TypeScript (ESM modules)
- **Build**: esbuild 0.25.0
- **Dev Runner**: tsx 4.20.5 (watch mode)
- **Session Management**: express-session 1.18.1
  - In-memory: memorystore 1.6.7
  - PostgreSQL: connect-pg-simple 10.0.0
- **Authentication**: 
  - Passport 0.7.0
  - passport-local 1.0.0
  - bcrypt 6.0.0
  - openid-client 6.8.1 (OIDC support)
- **Security**:
  - helmet 8.1.0
  - cors 2.8.5
  - express-rate-limit 8.1.0
  - cookie-parser 1.4.7
- **File Upload**: multer 2.0.2
- **Real-time**: ws 8.18.0 (WebSockets)

### Database & ORM
- **ORM**: Drizzle ORM 0.39.3
- **Migration Tool**: drizzle-kit 0.31.4
- **Schema Validation**: drizzle-zod 0.7.0
- **Supported Databases**:
  - **Development**: SQLite (better-sqlite3 12.4.1)
  - **Production**: PostgreSQL via @neondatabase/serverless 0.10.4
  - **Driver**: pg 8.16.3 (@types/pg 8.15.5)
- **Connection**: Dual-mode support (file:// for SQLite, postgresql:// for PostgreSQL)

### Third-Party Integrations

Based on code analysis, the following integrations are active:

| Service | Status | Purpose | Configuration |
|---------|--------|---------|---------------|
| **Zapier** | ✅ Production | Workflow automation (5,000+ apps) | `INTERNAL_WEBHOOK_URL`, `INTERNAL_WEBHOOK_SECRET` |
| **SendGrid** | ✅ Production | Email delivery (contact form) | `SENDGRID_API_KEY` |
| **Google Chat** | ✅ Production | Team notifications | `GOOGLE_CHAT_WEBHOOK_URL` |
| **Plaid** | Scaffolded | Bank account linking | `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV` |
| **Stripe** | Scaffolded | Payment processing | `STRIPE_SECRET`, `STRIPE_WEBHOOK` |
| **Twilio** | Scaffolded | SMS notifications | `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_FROM` |

> **Note**: See `docs/41_zapier-integration.md` for complete Zapier setup guide. Integration settings are stored in Netlify environment variables.

### Development Tools
- **Testing**: 
  - Playwright 1.55.1 (@playwright/test)
  - @axe-core/playwright 4.10.2 (accessibility testing)
  - start-server-and-test 2.1.2
- **Linting/Formatting**: 
  - ESLint (.eslintrc.json)
  - Prettier (.prettierrc)
- **Code Quality**: 
  - TypeScript strict mode enabled
  - Zod validation throughout
  - Error boundaries and validation middleware
- **Replit Plugins** (dev environment):
  - @replit/vite-plugin-cartographer
  - @replit/vite-plugin-dev-banner
  - @replit/vite-plugin-runtime-error-modal

### Deployment & Hosting
- **Platforms Detected**:
  - Replit (development) - `replit.md`, `app.json`, `REPL_SLUG` env var
  - Netlify (planned docs site) - will be configured
  - Heroku (via Procfile) - `Procfile` present
  - Azure/Generic (PostgreSQL support suggests cloud DB)
- **Process Manager**: Procfile with `web` dyno
- **Environment**: `.env`, `.env.example`, `.env.local`, `.env.production`

---

## Folder Structure

```
AssetLender/
├── client/                    # Frontend React application
│   ├── public/               # Static assets
│   │   └── assets/icons/     # Icon files
│   ├── src/
│   │   ├── App.tsx           # Root component
│   │   ├── main.tsx          # Entry point
│   │   ├── index.css         # Global styles
│   │   ├── app/              # Application-specific modules
│   │   │   └── lender/       # Lender portal features
│   │   ├── components/       # React components
│   │   │   ├── auth/         # Authentication components
│   │   │   ├── borrowers/    # Borrower management
│   │   │   ├── applications/ # Loan applications UI
│   │   │   ├── dashboard/    # Dashboard widgets
│   │   │   ├── layout/       # Layout components (header, sidebar, etc.)
│   │   │   ├── features/     # Feature-specific components
│   │   │   └── ...           # Many UI components (see tree)
│   │   ├── context/          # React context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility libraries
│   │   ├── pages/            # Page components (if using page-based routing)
│   │   ├── types/            # TypeScript type definitions
│   │   └── utils/            # Utility functions
│   └── index.html            # HTML entry point
├── server/                    # Backend Express application
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API route definitions
│   ├── db.ts                 # Database initialization
│   ├── storage.ts            # Data access layer
│   ├── vite.ts               # Vite dev server integration
│   ├── middleware.ts         # Express middleware
│   ├── types.ts              # TypeScript types
│   ├── health.ts             # Health check endpoint
│   ├── activity.ts           # Activity logging
│   ├── demo-helpers.ts       # Demo data generators
│   ├── integrations.ts       # Third-party integration settings
│   ├── windowed-selectors.ts # Timeframe-filtered data selectors
│   ├── errors.ts             # Error handling utilities
│   ├── lib/
│   │   ├── mailer.ts         # Email sending utilities
│   │   └── invites.ts        # Invite token generation/validation
│   └── middleware/
│       └── security.ts       # Security middleware (helmet, CORS, rate limiting)
├── shared/                    # Shared code between client/server
│   ├── schema.ts             # Drizzle ORM schema (SQLite/PostgreSQL)
│   ├── schema-postgres-backup.ts # PostgreSQL backup schema
│   ├── demo-data.ts          # Demo/seed data
│   ├── demo-bundle.ts        # Bundled demo data
│   ├── demo-types.ts         # Demo data type definitions
│   ├── marketing-types.ts    # Marketing page types
│   └── range.ts              # Date range utilities
├── docs/                      # Documentation (existing + generated)
│   ├── 00_repo-inventory.md  # This file - Repository overview
│   ├── 10_architecture.md    # System architecture
│   ├── 11_architecture-diagrams.md # Visual diagrams
│   ├── 12_rbac-matrix.md     # Role-based access control
│   ├── 20_data-model.md      # Database schema
│   ├── 22_seed-and-migrations.md # DB migrations
│   ├── 30_configuration.md   # Environment variables
│   ├── internal/             # Internal-only docs (not published)
│   ├── 40_features-overview.md # Features (12 core features)
│   ├── 40_integrations.md    # Integration overview
│   ├── 41_zapier-integration.md # Zapier/webhook guide ⭐ NEW
│   ├── 50_api-quickstart.md  # API reference
│   ├── 60_local-dev.md       # Developer setup
│   ├── account-settings-architecture.md
│   ├── notifications-page.md
│   └── README.md             # Docs index
├── openapi/                   # OpenAPI specifications (to be generated)
├── scripts/                   # Utility scripts
│   ├── assetlender-safe-cleanup.ps1
│   └── pre-acc-canonical-snapshot.ps1
├── public/                    # Public static files
├── migrations/                # Database migrations (Drizzle Kit output)
├── dist/                      # Build output
├── node_modules/              # Dependencies
├── .vscode/                   # VS Code settings
├── .github/                   # GitHub configuration
├── .env*                      # Environment files
├── package.json               # NPM dependencies and scripts
├── package-lock.json          # NPM lock file
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── postcss.config.cjs         # PostCSS configuration
├── drizzle.config.ts          # Drizzle ORM configuration
├── playwright.config.ts       # Playwright test configuration
├── Procfile                   # Heroku process definition
├── app.json                   # Replit configuration
├── components.json            # shadcn/ui configuration
└── README.md                  # Project README
```

---

## Build & Start Commands

### Development
```bash
# Install dependencies
npm install

# Start development server (watch mode, hot reload)
npm run dev

# Check TypeScript types
npm run check
```

### Production Build
```bash
# Full build (TypeScript → ESBuild server + Vite client)
npm run build

# Build server only
npm run build:server

# Build client only
npm run build:client

# Start production server
npm start

# Start with dotenv config loader
npm run start:env
```

### Database
```bash
# Push schema changes to database
npm run db:push

# Open Drizzle Studio (placeholder - not configured)
npm run db:studio
```

### Testing
```bash
# Run Playwright tests (if configured)
npx playwright test

# Run with UI mode
npx playwright test --ui
```

---

## Environment Files

The repository uses multiple environment files:

| File | Purpose | Status |
|------|---------|--------|
| `.env.example` | Template with all required variables | ✅ Present |
| `.env` | Local development (gitignored) | ✅ Present |
| `.env.local` | Local overrides (gitignored) | ✅ Present |
| `.env.production` | Production settings (gitignored) | ✅ Present |

### Required Environment Variables

Based on `.env.example` and code analysis:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | - | PostgreSQL or SQLite connection string |
| `SESSION_SECRET` | ✅ | - | Session encryption key |
| `NODE_ENV` | ❌ | `development` | Environment mode |
| `PORT` | ❌ | `5000` | Server port |
| `CORS_ORIGIN` | ❌ | `*` | CORS allowed origins |
| `RATE_LIMIT_WINDOW` | ❌ | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | ❌ | `100` | Max requests per window |
| `PGSSL_DEV_NO_VERIFY` | ❌ | - | Disable SSL verification (dev only) |
| `LOG_LEVEL` | ❌ | `info` | Logging verbosity (`debug`, `info`, `warn`, `error`) |
| `EMAIL_PROVIDER` | ❌ | `console` | Email provider (`console`, `sendgrid`, `aws-ses`) |
| `APP_BASE_URL` | ❌ | Auto-detect | Base URL for invite links |
| `INVITE_SECRET` | ❌ | `CHANGE_ME` | HMAC secret for invite tokens |
| `ALLOW_DEMO_LOGIN` | ❌ | - | Enable demo login mode |
| `AUTH_MODE` | ❌ | - | Authentication mode (`demo`, etc.) |
| `DEMO_EMAIL` | ❌ | `admin@example.com` | Demo user email |
| `DEMO_PASSWORD` | ❌ | `CHANGE_ME` | Demo user password |
| `DEMO_USER` | ❌ | JSON object | Demo user object |

**Integration Variables** (optional, stored in ephemeral memory):
- `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV`
- `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_FROM`
- `SENDGRID_KEY`
- `STRIPE_SECRET`, `STRIPE_WEBHOOK`

> ⚠️ **Security Note**: Never commit actual secrets to version control. Integration settings are currently stored in-memory and lost on restart. Production deployments should use encrypted persistent storage.

---

## Third-Party Services Detected

### Financial Services
- **Plaid**: Bank account aggregation and verification
  - Mentioned in schema (`plaidAccountId`, `plaidAccessToken`)
  - Integration settings in `server/integrations.ts`
  - Status: **Scaffolded** (not actively used)

### Payment Processing
- **Stripe**: Payment and subscription handling
  - Settings for `stripeSecret` and `stripeWebhook`
  - Status: **Scaffolded**

### Communication
- **SendGrid**: Transactional email delivery
  - Alternative to console email provider
  - Status: **Scaffolded**
  
- **Twilio**: SMS notifications
  - Settings for SID, token, and phone number
  - Status: **Scaffolded**

### Authentication
- **OpenID Connect**: OAuth/OIDC support via `openid-client`
  - Library included but not actively configured
  - Status: **Available**

### Hosting & Deployment
- **Replit**: Development environment
  - Configuration in `app.json`, `replit.md`
  - Auto-detects `REPL_SLUG` and `REPL_OWNER`
  
- **Heroku**: Deployment target
  - `Procfile` defines `web` dyno
  - PostgreSQL assumed via `DATABASE_URL`

- **Netlify**: Planned for docs site
  - Will be configured via `netlify.toml`

---

## Test Coverage

### Test Framework
- **Playwright** 1.55.1 configured (`playwright.config.ts`)
- **Accessibility testing** via @axe-core/playwright
- **Start-server-and-test** for integration tests

### Test Status
- Configuration files present
- No `tests/` or `__tests__/` directories detected
- Test commands not defined in `package.json`

**Coverage**: ⚠️ **Tests not yet implemented**

**Recommendation**: Add test scripts and create test suites for:
- API endpoints (`/api/*`)
- Authentication flows
- Loan application workflows
- UI component testing
- Accessibility compliance (WCAG 2.1 AA)

---

## Documentation Coverage Checklist

### ✅ Auto-Documented
- [x] Technology stack and dependencies
- [x] Folder structure and file organization
- [x] Build and start commands
- [x] Environment variables (from `.env.example`)
- [x] Database schema (from Drizzle ORM)
- [x] API routes (from `server/routes.ts`)
- [x] Third-party integrations (from code analysis)

### 📋 TODO - Requires Manual Input
- [ ] **API authentication flows** - Detailed OAuth/OIDC setup if implemented
- [ ] **Deployment pipelines** - CI/CD workflows, environment promotion
- [ ] **Monitoring & alerting** - Production monitoring setup (if any)
- [ ] **Backup procedures** - Database backup schedules and restoration
- [ ] **Scaling strategies** - Load balancing, horizontal scaling plans
- [ ] **Security audit results** - Penetration testing, vulnerability scans
- [ ] **Performance benchmarks** - Load testing results, optimization notes
- [ ] **User roles & permissions** - Detailed RBAC matrix beyond lender/borrower
- [ ] **Compliance requirements** - GDPR, SOC 2, financial regulations
- [ ] **Change management** - Release notes, versioning strategy
- [ ] **Support & SLAs** - Customer support procedures, uptime guarantees

### 📝 Partially Documented
- [~] **UI components** - Component catalog exists, needs theming guide
- [~] **Data model** - Schema documented, needs ERD and relationships
- [~] **Configuration** - Env vars listed, needs feature flags and tuning guide
- [~] **Testing** - Framework present, needs test strategy and coverage targets

---

## File Statistics

- **Total TypeScript files**: 100+ (estimated)
- **Total React components**: 50+ (estimated from `client/src/components/`)
- **API endpoints**: 50+ (from `server/routes.ts`)
- **Database tables**: 9 (from `shared/schema.ts`)
- **Environment variables**: 20+ (from `.env.example` and code)
- **Third-party integrations**: 5 (Plaid, Stripe, Twilio, SendGrid, OIDC)
- **Documentation files**: 2 existing (to be expanded)

---

## Next Steps for Documentation

1. ✅ **Repository Inventory** (this document)
2. 🔄 **Architecture Overview** → `10_architecture.md`
3. 🔄 **Data Model & ERD** → `20_data-model.md`, `21_erd.mmd`
4. 🔄 **API Documentation** → `50_api-quickstart.md`, `openapi/openapi.yaml`
5. 🔄 **Operations Guide** → `60_local-dev.md`, `61_testing.md`, etc.
6. 🔄 **Docusaurus Site** → `/docs-site/`
7. 🔄 **Netlify Deployment** → `netlify.toml`

---

**End of Repository Inventory**  
*For questions or updates, contact the engineering team.*
