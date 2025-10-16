# System Architecture

**Last Updated**: October 16, 2025  
**Version**: 1.0.0  
**Status**: Production

---

## Executive Summary

Lendgismo is a modern, full-stack loan application management platform built on a **TypeScript monorepo** architecture. The system employs a classic **client-server model** with React frontend, Express backend, and dual-database support (SQLite/PostgreSQL).

### Key Architectural Principles

1. **Separation of Concerns**: Clear boundaries between frontend, backend, and data layers
2. **Type Safety**: End-to-end TypeScript with shared schemas via Zod
3. **Security First**: Defense-in-depth with Helmet, CORS, rate limiting, and session management
4. **Scalability**: Stateless API design enabling horizontal scaling
5. **Developer Experience**: Hot reload, type checking, comprehensive error handling

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React 18 + TypeScript + Vite                        │   │
│  │  • Wouter Routing                                    │   │
│  │  • React Query (State)                               │   │
│  │  • Radix UI + Tailwind CSS                          │   │
│  │  • Recharts (Visualization)                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                        API Gateway                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express 4.x Middleware Stack                        │   │
│  │  • Helmet (Security Headers)                         │   │
│  │  • CORS (Cross-Origin)                               │   │
│  │  • Rate Limiting                                     │   │
│  │  • Cookie Parser                                     │   │
│  │  • Passport.js (Auth)                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Business Logic (server/routes.ts)                   │   │
│  │  • Loan Application Workflow                         │   │
│  │  • Document Processing                               │   │
│  │  • Bank Account Integration                          │   │
│  │  • Invite Management                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  ┌────────────────────┐    ┌──────────────────────────┐     │
│  │  Drizzle ORM       │    │  In-Memory Caches        │     │
│  │  • Type-safe       │    │  • Session Store         │     │
│  │  • Migrations      │    │  • Activity Logs         │     │
│  │  • Dual DB         │    │  • Demo Data             │     │
│  └────────────────────┘    └──────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                     Persistence Layer                        │
│  ┌────────────────────┐    ┌──────────────────────────┐     │
│  │  SQLite (Dev)      │    │  PostgreSQL (Prod)       │     │
│  │  • File-based      │    │  • Managed (Neon/RDS)    │     │
│  │  • Zero config     │    │  • Connection pooling    │     │
│  └────────────────────┘    └──────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Request Flow

### 1. User Authentication Flow

```
User Browser
    │
    │ 1. POST /api/auth/login
    ├──────────────────────────────────────────────┐
    │                                              │
    ▼                                              ▼
Express Server                              Middleware Stack
    │                                              │
    │ 2. Validate credentials                     │
    ├──────────────────────────────────────────────┤
    │                                              │
    ▼                                              ▼
Database (users table)                      Session Store
    │                                              │
    │ 3. Fetch user by email                      │
    ├──────────────────────────────────────────────┤
    │                                              │
    ▼                                              ▼
bcrypt.compare()                            Create Session
    │                                              │
    │ 4. Verify password hash                     │
    ├──────────────────────────────────────────────┤
    │                                              │
    ▼                                              ▼
Generate Session Cookie                     Set HTTP-only cookie
    │                                              │
    │ 5. Return user object + Set-Cookie          │
    ├──────────────────────────────────────────────┘
    │
    ▼
200 OK { success: true, user: {...} }
```

### 2. Loan Application Submission Flow

```
Borrower Dashboard
    │
    │ 1. Fill form + upload documents
    ▼
POST /api/loan-applications
    │
    ├─→ Auth Middleware (verify session)
    │
    ├─→ Zod Validation (insertLoanApplicationSchema)
    │
    ├─→ Business Logic
    │   │
    │   ├─→ storage.createLoanApplication()
    │   │   │
    │   │   ├─→ Drizzle ORM INSERT
    │   │   │
    │   │   └─→ Database (loan_applications table)
    │   │
    │   ├─→ logActivity('loan.application.submitted')
    │   │
    │   └─→ [Optional] Trigger AI risk scoring
    │
    └─→ 201 Created { success: true, data: application }
```

### 3. Lender Review Flow

```
Lender Dashboard
    │
    │ 1. View pending applications
    ▼
GET /api/loan-applications?status=pending
    │
    ├─→ requireLenderAuth (check role = lender)
    │
    ├─→ storage.getAllLoanApplications()
    │
    └─→ 200 OK { data: [...applications] }
    │
    │ 2. Review application details
    ▼
GET /api/loan-applications/:id
    │
    ├─→ storage.getLoanApplication(id)
    │
    └─→ 200 OK { data: application }
    │
    │ 3. Approve/reject
    ▼
PATCH /api/loan-applications/:id/status
    │
    ├─→ requireLenderAuth
    │
    ├─→ storage.updateLoanApplicationStatus(id, 'approved', reviewerId, notes)
    │
    ├─→ [Optional] convertToBorrower flag
    │   │
    │   └─→ storage.convertApplicationToBorrower(id)
    │       │
    │       └─→ Update users table (borrower record)
    │
    └─→ 200 OK { data: { application, borrower } }
```

---

## Component Architecture

### Frontend (Client)

```
client/src/
├── App.tsx                    # Root component with routing
├── main.tsx                   # Entry point, React 18 createRoot
├── index.css                  # Global styles, Tailwind directives
│
├── components/                # UI Components
│   ├── layout/               # Layout components
│   │   ├── Header.tsx        # Top navigation
│   │   ├── Sidebar.tsx       # Side navigation
│   │   └── Footer.tsx        # Footer
│   │
│   ├── dashboard/            # Dashboard widgets
│   │   ├── DashboardStatCard.tsx
│   │   ├── RecentTransactions.tsx
│   │   └── PortfolioOverview.tsx
│   │
│   ├── applications/         # Loan application components
│   │   ├── ApplicationsTable.tsx
│   │   ├── ApplicationsFilters.tsx
│   │   ├── LoanApplicationForm.tsx
│   │   └── ApplicationStatus.tsx
│   │
│   ├── borrowers/            # Borrower management
│   │   ├── BorrowersTable.tsx
│   │   ├── BorrowersFilters.tsx
│   │   └── BorrowerDashboard.tsx
│   │
│   ├── auth/                 # Authentication
│   │   ├── LoginForm.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   └── ui/                   # Reusable UI primitives (shadcn/ui)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ...
│
├── hooks/                     # Custom React hooks
│   ├── useAuth.ts            # Authentication state
│   ├── useApplications.ts    # Loan applications data
│   ├── useBorrowers.ts       # Borrowers data
│   └── useTheme.ts           # Dark/light mode
│
├── lib/                       # Utilities
│   ├── api.ts                # API client (fetch wrapper)
│   ├── utils.ts              # Helper functions
│   └── cn.ts                 # Class name merger (clsx + tailwind-merge)
│
├── types/                     # TypeScript type definitions
│   ├── api.ts                # API response types
│   └── models.ts             # Domain models
│
└── contexts/                  # React Context providers
    ├── AuthContext.tsx       # User authentication
    └── ThemeContext.tsx      # Theme management
```

### Backend (Server)

```
server/
├── index.ts                   # Server entry point
│   ├─→ Express app setup
│   ├─→ Middleware registration
│   ├─→ Route registration
│   └─→ HTTP server creation
│
├── routes.ts                  # API route definitions
│   ├─→ /api/auth/*           # Authentication endpoints
│   ├─→ /api/users/*          # User management
│   ├─→ /api/loan-applications/* # Loan workflows
│   ├─→ /api/documents/*      # Document handling
│   ├─→ /api/bank-accounts/*  # Bank integration
│   ├─→ /api/invites/*        # Invite system
│   ├─→ /api/branding/*       # Branding customization
│   └─→ /api/health           # Health checks
│
├── db.ts                      # Database initialization
│   ├─→ Drizzle ORM setup
│   ├─→ Connection pooling
│   └─→ Migration runner
│
├── storage.ts                 # Data access layer
│   ├─→ CRUD operations
│   ├─→ Transaction handling
│   └─→ Query optimization
│
├── middleware.ts              # Express middleware
│   ├─→ Security headers (Helmet)
│   ├─→ CORS configuration
│   ├─→ Rate limiting
│   └─→ Error handling
│
├── middleware/
│   └── security.ts            # Security-specific middleware
│
├── lib/
│   ├── mailer.ts              # Email utilities
│   └── invites.ts             # Invite token generation
│
├── types.ts                   # TypeScript types
├── activity.ts                # Activity logging
├── health.ts                  # Health check logic
├── demo-helpers.ts            # Demo data generators
├── integrations.ts            # Third-party settings
└── vite.ts                    # Vite dev server integration
```

### Shared (Cross-cutting)

```
shared/
├── schema.ts                  # Drizzle ORM schema
│   ├─→ Table definitions
│   ├─→ Zod validation schemas
│   └─→ TypeScript types
│
├── demo-data.ts               # Demo/seed data
├── demo-bundle.ts             # Bundled demo datasets
├── demo-types.ts              # Demo data types
└── range.ts                   # Date range utilities
```

---

## Data Flow Patterns

### 1. Optimistic UI Updates (React Query)

```typescript
// Example: Approving a loan application
const approveMutation = useMutation({
  mutationFn: (id: string) => 
    fetch(`/api/loan-applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'approved' })
    }),
  
  // Optimistic update
  onMutate: async (id) => {
    await queryClient.cancelQueries(['applications'])
    const previous = queryClient.getQueryData(['applications'])
    
    queryClient.setQueryData(['applications'], (old: any) => 
      old.map((app: any) => 
        app.id === id ? { ...app, status: 'approved' } : app
      )
    )
    
    return { previous }
  },
  
  // Rollback on error
  onError: (err, id, context) => {
    queryClient.setQueryData(['applications'], context.previous)
  },
  
  // Refetch on success
  onSuccess: () => {
    queryClient.invalidateQueries(['applications'])
  }
})
```

### 2. Real-time Updates (Future: WebSockets)

**Current**: Polling via React Query  
**Planned**: WebSocket connection for live updates

```typescript
// Future WebSocket architecture
const ws = new WebSocket('ws://localhost:5000')

ws.on('loan.application.updated', (data) => {
  queryClient.setQueryData(['applications', data.id], data)
})

ws.on('document.uploaded', (data) => {
  queryClient.invalidateQueries(['documents', data.applicationId])
})
```

---

## Security Architecture

### Defense in Depth

```
Layer 1: Network Security
    ├─→ HTTPS/TLS (Production)
    ├─→ CORS restrictions
    └─→ Rate limiting (100 req/15min)

Layer 2: Application Security
    ├─→ Helmet.js security headers
    ├─→ Input validation (Zod schemas)
    ├─→ Output encoding (React XSS protection)
    └─→ CSRF protection (SameSite cookies)

Layer 3: Authentication & Authorization
    ├─→ Bcrypt password hashing (10 rounds)
    ├─→ HTTP-only session cookies
    ├─→ Role-based access control (lender/borrower)
    └─→ API key authentication (optional)

Layer 4: Data Security
    ├─→ Sensitive data encryption (planned)
    ├─→ SQL injection prevention (ORM)
    ├─→ File upload restrictions (type, size)
    └─→ Secrets management (env vars)

Layer 5: Monitoring & Auditing
    ├─→ Activity logging
    ├─→ Error tracking
    └─→ Health checks
```

### Session Management

```typescript
// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  store: new PgStore({ pool })  // PostgreSQL session store
}))
```

---

## Tenancy Model

### Current: Single-Tenant

- One deployment per organization
- Shared database with role-based access
- Branding customization via `branding_settings` table

### Future: Multi-Tenant (Planned)

```sql
-- Add tenantId to all tables
ALTER TABLE users ADD COLUMN tenant_id TEXT REFERENCES tenants(id);
ALTER TABLE loan_applications ADD COLUMN tenant_id TEXT;

-- Row-level security (PostgreSQL)
CREATE POLICY tenant_isolation ON users
  USING (tenant_id = current_setting('app.tenant_id'));
```

**Multi-tenancy Strategy**:
1. **Shared Database, Shared Schema**: All tenants in one database (current path)
2. **Shared Database, Separate Schemas**: Each tenant gets a PostgreSQL schema (future option)
3. **Separate Databases**: Full data isolation (enterprise option)

---

## Scalability Considerations

### Horizontal Scaling

**Stateless API Design**:
- Session stored in PostgreSQL (not in-memory)
- No server-side state between requests
- Load balancer can distribute to any instance

```
                Load Balancer (Nginx/AWS ALB)
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
    Instance 1      Instance 2      Instance 3
        │               │               │
        └───────────────┴───────────────┘
                        │
                Shared PostgreSQL
                        +
                Shared Redis (Future)
```

### Database Optimization

1. **Read Replicas**: For analytics/reporting queries
2. **Connection Pooling**: Max 20 connections per instance
3. **Query Optimization**: Indexes on frequently queried columns
4. **Caching**: Redis for session store and frequently accessed data

### File Storage Scaling

**Current**: Local filesystem (`public/uploads/`)  
**Production**: Migrate to object storage (S3, Azure Blob, GCS)

```typescript
// Future: S3 integration
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const uploadToS3 = async (file: Buffer, key: string) => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: file,
    ContentType: file.mimetype
  })
  
  await s3Client.send(command)
  return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`
}
```

---

## Deployment Architecture

### Development (Local/Replit)

```
Developer Machine
    ├─→ SQLite database (test.db)
    ├─→ tsx watch (hot reload)
    ├─→ Vite dev server (HMR)
    └─→ http://localhost:5000
```

### Staging (Replit/Netlify)

```
Replit Environment
    ├─→ PostgreSQL (Neon)
    ├─→ Node.js 20.x
    ├─→ Environment variables (.env)
    └─→ https://<repl-name>.<username>.repl.co
```

### Production (Heroku/Azure/AWS)

```
Cloud Platform
    ├─→ Load Balancer (ALB/Azure App Gateway)
    ├─→ Application Servers (2+ instances)
    │   ├─→ Node.js 20.x
    │   ├─→ PM2 process manager
    │   └─→ Auto-scaling (CPU-based)
    │
    ├─→ PostgreSQL (Managed)
    │   ├─→ AWS RDS / Azure Database
    │   ├─→ Automated backups
    │   └─→ Read replicas
    │
    ├─→ Redis (Session Store)
    │   └─→ ElastiCache / Azure Cache
    │
    ├─→ S3/Blob Storage (Files)
    │   └─→ CDN (CloudFront/Azure CDN)
    │
    └─→ Monitoring (CloudWatch/App Insights)
```

---

## Error Handling Strategy

### Client-Side

```typescript
// React Error Boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}

// React Query error handling
const { data, error, isError } = useQuery(['applications'], {
  onError: (error) => {
    toast.error(error.message)
  },
  retry: 3,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
})
```

### Server-Side

```typescript
// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  
  // Zod validation errors
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.errors
    })
  }
  
  // Database errors
  if (err.code === '23505') {  // Unique violation
    return res.status(409).json({
      success: false,
      error: 'Resource already exists'
    })
  }
  
  // Generic error
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error'
      : err.message
  })
})
```

---

## Monitoring & Observability

### Logging

```typescript
// Structured logging (future: Winston/Pino)
const log = {
  level: process.env.LOG_LEVEL || 'info',
  
  debug: (msg, meta) => LOG_LEVEL === 'debug' && console.log('[DEBUG]', msg, meta),
  info: (msg, meta) => console.log('[INFO]', msg, meta),
  warn: (msg, meta) => console.warn('[WARN]', msg, meta),
  error: (msg, meta) => console.error('[ERROR]', msg, meta)
}
```

### Metrics (Future: Prometheus)

```typescript
// Track key metrics
const metrics = {
  requestDuration: histogram('http_request_duration_seconds'),
  activeUsers: gauge('active_users_total'),
  loanApplications: counter('loan_applications_total'),
  errorRate: counter('errors_total')
}
```

### Health Checks

```typescript
// /api/health endpoint
export async function healthCheck(req, res) {
  const start = Date.now()
  
  // Check database
  const dbStatus = await db.select().from(users).limit(1)
    .then(() => 'connected')
    .catch(() => 'disconnected')
  
  const responseTime = Date.now() - start
  
  res.json({
    status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    databaseStatus: dbStatus,
    responseTime
  })
}
```

---

## Technology Decisions

### Why React?
- Component reusability
- Large ecosystem (Radix UI, React Query, etc.)
- TypeScript support
- Virtual DOM performance

### Why Express?
- Mature, battle-tested
- Extensive middleware ecosystem
- Simple, unopinionated
- Easy to scale

### Why Drizzle ORM?
- Type-safe queries
- Lightweight (no decorators)
- SQL-first approach
- Excellent TypeScript inference
- Dual database support

### Why SQLite for Dev?
- Zero configuration
- Fast for development
- Easy to reset/seed
- File-based (git-friendly)

### Why PostgreSQL for Prod?
- ACID compliance
- Horizontal scaling (read replicas)
- JSONB support
- Full-text search
- Row-level security

---

## Future Architecture Enhancements

### 1. Microservices (If Needed)

```
API Gateway (Express)
    │
    ├─→ Auth Service (Node.js)
    ├─→ Loan Service (Node.js)
    ├─→ Document Service (Python + ML)
    ├─→ Notification Service (Node.js + Queue)
    └─→ Analytics Service (Python + Pandas)
```

### 2. Event-Driven Architecture

```
Application Event Bus (Redis Pub/Sub or RabbitMQ)
    │
    ├─→ loan.application.submitted
    ├─→ loan.application.approved
    ├─→ document.uploaded
    └─→ payment.received

Subscribers:
    ├─→ Email Service (send notifications)
    ├─→ Analytics Service (track metrics)
    └─→ Audit Service (compliance logging)
```

### 3. GraphQL API (Alternative to REST)

```typescript
// Future GraphQL schema
type Query {
  loanApplications(status: Status): [LoanApplication!]!
  borrowers(limit: Int): [Borrower!]!
}

type Mutation {
  submitApplication(input: ApplicationInput!): LoanApplication!
  approveApplication(id: ID!): LoanApplication!
}

type Subscription {
  applicationUpdated(id: ID!): LoanApplication!
}
```

---

## References

- [React Documentation](https://react.dev)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Drizzle ORM Guide](https://orm.drizzle.team)
- [Node.js Security Checklist](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)

---

**End of Architecture Documentation**  
*Next*: See `11_architecture-diagrams.md` for visual diagrams, `12_rbac-matrix.md` for permissions
