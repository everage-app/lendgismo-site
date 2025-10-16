# Architecture Diagrams

**Last Updated**: October 16, 2025  
**Diagram Format**: Mermaid.js  

---

## System Context (C4 Model - Level 1)

```mermaid
C4Context
    title System Context Diagram - Lendgismo Platform

    Person(borrower, "Borrower", "Individual or business seeking loan")
    Person(lender, "Lender", "Loan officer reviewing applications")
    
    System(lendgismo, "Lendgismo Platform", "Loan application management system")
    
    System_Ext(plaid, "Plaid API", "Bank account aggregation")
    System_Ext(sendgrid, "SendGrid", "Email delivery")
    System_Ext(twilio, "Twilio", "SMS notifications")
    System_Ext(stripe, "Stripe", "Payment processing")
    
    Rel(borrower, lendgismo, "Submits applications, uploads documents")
    Rel(lender, lendgismo, "Reviews applications, manages borrowers")
    
    Rel(lendgismo, plaid, "Fetches bank data", "HTTPS")
    Rel(lendgismo, sendgrid, "Sends emails", "HTTPS")
    Rel(lendgismo, twilio, "Sends SMS", "HTTPS")
    Rel(lendgismo, stripe, "Processes payments", "HTTPS")
```

---

## Container Diagram (C4 Model - Level 2)

```mermaid
C4Container
    title Container Diagram - Lendgismo Platform

    Person(user, "User", "Borrower or Lender")

    Container_Boundary(c1, "Lendgismo Platform") {
        Container(spa, "Single Page App", "React, TypeScript", "Provides loan management UI via web browser")
        Container(api, "API Server", "Express, Node.js", "Handles business logic, authentication, data access")
        Container(db, "Database", "PostgreSQL/SQLite", "Stores users, applications, documents")
        Container(filestore, "File Storage", "Local FS / S3", "Stores uploaded documents")
        Container(cache, "Session Store", "PostgreSQL / Redis", "Manages user sessions")
    }

    System_Ext(email, "Email System", "SendGrid/SMTP")
    System_Ext(sms, "SMS System", "Twilio")
    System_Ext(banking, "Banking APIs", "Plaid")

    Rel(user, spa, "Uses", "HTTPS")
    Rel(spa, api, "Makes API calls to", "JSON/HTTPS")
    Rel(api, db, "Reads from and writes to", "SQL/TCP")
    Rel(api, filestore, "Stores/retrieves files", "S3 API / FS")
    Rel(api, cache, "Reads/writes sessions", "TCP")
    Rel(api, email, "Sends email via", "HTTPS")
    Rel(api, sms, "Sends SMS via", "HTTPS")
    Rel(api, banking, "Fetches bank data via", "HTTPS")
```

---

## Component Diagram - API Server

```mermaid
graph TB
    subgraph "Express API Server"
        Router[Router Layer<br/>routes.ts]
        Auth[Authentication<br/>Passport.js]
        Middleware[Middleware Stack<br/>Helmet, CORS, Rate Limit]
        Storage[Data Access Layer<br/>storage.ts]
        Mailer[Email Service<br/>mailer.ts]
        Invites[Invite Service<br/>invites.ts]
        Activity[Activity Logger<br/>activity.ts]
        Demo[Demo Helpers<br/>demo-helpers.ts]
    end
    
    subgraph "Database Layer"
        ORM[Drizzle ORM<br/>db.ts]
        Schema[Schema Definition<br/>schema.ts]
    end
    
    Client[Client Browser] --> Middleware
    Middleware --> Router
    Router --> Auth
    Router --> Storage
    Router --> Mailer
    Router --> Invites
    Router --> Activity
    Router --> Demo
    
    Storage --> ORM
    ORM --> Schema
    Schema --> DB[(PostgreSQL/SQLite)]
    
    Mailer --> Email[Email Provider]
    Activity --> Logs[(In-Memory Logs)]
    Demo --> DemoData[(Demo Dataset)]
```

---

## Sequence Diagram - User Login

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant API as Express API
    participant Auth as Passport Auth
    participant DB as Database
    participant Session as Session Store

    User->>Browser: Enter credentials
    Browser->>API: POST /api/auth/login<br/>{email, password}
    
    API->>Auth: Authenticate
    Auth->>DB: SELECT * FROM users<br/>WHERE email = ?
    DB-->>Auth: User record
    
    Auth->>Auth: bcrypt.compare(password, hash)
    
    alt Valid Credentials
        Auth-->>API: User object
        API->>Session: Create session
        Session-->>API: Session ID
        API->>Browser: 200 OK<br/>Set-Cookie: session_id<br/>{success: true, user}
        Browser->>User: Redirect to dashboard
    else Invalid Credentials
        Auth-->>API: Authentication failed
        API->>Browser: 401 Unauthorized<br/>{success: false, error}
        Browser->>User: Show error message
    end
```

---

## Sequence Diagram - Loan Application Workflow

```mermaid
sequenceDiagram
    actor Borrower
    participant UI as React UI
    participant API as Express API
    participant Storage as Storage Layer
    participant DB as Database
    participant Logger as Activity Logger

    Note over Borrower,Logger: Loan Application Submission

    Borrower->>UI: Fill application form
    Borrower->>UI: Upload documents
    UI->>UI: Validate form (Zod)
    
    UI->>API: POST /api/loan-applications<br/>{businessName, loanAmount, ...}
    API->>API: Check session cookie
    API->>API: Validate schema (Zod)
    
    API->>Storage: createLoanApplication(borrowerId, data)
    Storage->>DB: INSERT INTO loan_applications
    DB-->>Storage: Application record
    Storage-->>API: Created application
    
    API->>Logger: logActivity('loan.submitted')
    Logger-->>API: Logged
    
    API-->>UI: 201 Created<br/>{success: true, data: application}
    UI->>Borrower: Show success message

    Note over Borrower,Logger: Lender Review Process

    actor Lender
    Lender->>UI: View pending applications
    UI->>API: GET /api/loan-applications?status=pending
    API->>Storage: getAllLoanApplications()
    Storage->>DB: SELECT * FROM loan_applications<br/>WHERE status = 'pending'
    DB-->>Storage: Application list
    Storage-->>API: Applications array
    API-->>UI: 200 OK<br/>{data: [applications]}
    UI->>Lender: Display table

    Lender->>UI: Review application details
    UI->>API: GET /api/loan-applications/:id
    API->>Storage: getLoanApplication(id)
    Storage->>DB: SELECT * FROM loan_applications<br/>WHERE id = ?
    DB-->>Storage: Application details
    Storage-->>API: Application object
    API-->>UI: 200 OK<br/>{data: application}
    UI->>Lender: Show details modal

    Lender->>UI: Approve application
    UI->>API: PATCH /api/loan-applications/:id/status<br/>{status: 'approved', notes}
    API->>Storage: updateApplicationStatus(id, 'approved', lenderId, notes)
    Storage->>DB: UPDATE loan_applications<br/>SET status = 'approved'
    DB-->>Storage: Updated record
    Storage-->>API: Updated application
    
    API->>Logger: logActivity('loan.approved')
    Logger-->>API: Logged
    
    API-->>UI: 200 OK<br/>{data: application}
    UI->>Lender: Show success notification
```

---

## Deployment Diagram - Local Development

```mermaid
graph TB
    subgraph "Developer Machine"
        subgraph "Terminal 1"
            TSX[tsx watch<br/>server/index.ts]
        end
        
        subgraph "Terminal 2"
            Vite[Vite Dev Server<br/>HMR enabled]
        end
        
        subgraph "Database"
            SQLite[(SQLite<br/>test.db)]
        end
        
        Browser[Browser<br/>localhost:5000]
    end
    
    Browser -->|HTTP| TSX
    TSX -->|Proxy /assets| Vite
    TSX -->|SQL| SQLite
    Vite -->|Watch| SRC[client/src/**]
    TSX -->|Watch| SERVER[server/**]
```

---

## Deployment Diagram - Production (Heroku/Azure)

```mermaid
graph TB
    subgraph "Internet"
        Users[Users]
        DNS[DNS<br/>lendgismo.com]
    end
    
    subgraph "Cloud Platform"
        LB[Load Balancer<br/>HTTPS Termination]
        
        subgraph "Application Tier"
            App1[Node.js Instance 1<br/>PM2]
            App2[Node.js Instance 2<br/>PM2]
            App3[Node.js Instance 3<br/>PM2]
        end
        
        subgraph "Data Tier"
            PG[(PostgreSQL<br/>Managed Service<br/>RDS/Azure DB)]
            Redis[(Redis<br/>Session Store<br/>ElastiCache)]
        end
        
        subgraph "Storage Tier"
            S3[S3/Blob Storage<br/>Document Files]
            CDN[CloudFront/CDN<br/>Static Assets]
        end
        
        subgraph "Monitoring"
            Logs[CloudWatch/App Insights]
            Alerts[PagerDuty/OpsGenie]
        end
    end
    
    subgraph "External Services"
        Plaid[Plaid API]
        SendGrid[SendGrid]
        Twilio[Twilio]
    end
    
    Users --> DNS
    DNS --> LB
    LB --> App1
    LB --> App2
    LB --> App3
    
    App1 --> PG
    App2 --> PG
    App3 --> PG
    
    App1 --> Redis
    App2 --> Redis
    App3 --> Redis
    
    App1 --> S3
    App2 --> S3
    App3 --> S3
    
    S3 --> CDN
    CDN --> Users
    
    App1 -.->|Metrics| Logs
    App2 -.->|Metrics| Logs
    App3 -.->|Metrics| Logs
    Logs -.->|Alerts| Alerts
    
    App1 --> Plaid
    App1 --> SendGrid
    App1 --> Twilio
```

---

## Data Flow Diagram - Document Upload

```mermaid
graph LR
    A[User Selects File] --> B{File Valid?<br/>Type, Size}
    B -->|No| C[Show Error]
    B -->|Yes| D[Upload to /api/upload]
    
    D --> E[Multer Middleware<br/>Save to disk]
    E --> F[Generate file URL]
    F --> G[Return URL to client]
    
    G --> H[Create document metadata<br/>POST /api/documents]
    H --> I[Store in DB<br/>documents table]
    
    I --> J{AI Processing?}
    J -->|Yes| K[Queue for AI<br/>Document classification]
    J -->|No| L[Mark as uploaded]
    
    K --> M[AI Score 0-100]
    M --> N[Update document.aiScore]
    N --> L
    
    L --> O[Display in UI]
```

---

## State Machine - Loan Application Status

```mermaid
stateDiagram-v2
    [*] --> Pending: Application submitted
    
    Pending --> UnderReview: Lender reviews
    Pending --> Rejected: Insufficient info
    
    UnderReview --> Approved: Meets criteria
    UnderReview --> Rejected: Fails criteria
    UnderReview --> Pending: More info needed
    
    Approved --> Funded: Loan disbursed
    Approved --> Rejected: Compliance issue
    
    Rejected --> [*]
    Funded --> [*]
    
    note right of Approved
        Can convert to borrower
        record at this stage
    end note
    
    note left of Funded
        Final state
        Creates payment schedule
    end note
```

---

## Network Architecture - Security Layers

```mermaid
graph TB
    subgraph "Public Internet"
        Internet[Users]
    end
    
    subgraph "Edge Layer"
        WAF[Web Application Firewall<br/>DDoS Protection]
        CDN[CDN<br/>Static Assets]
    end
    
    subgraph "Application Layer"
        ALB[Application Load Balancer<br/>SSL/TLS Termination]
        
        subgraph "DMZ"
            API1[API Server 1<br/>Express]
            API2[API Server 2<br/>Express]
        end
    end
    
    subgraph "Data Layer - Private Subnet"
        DB[(PostgreSQL<br/>Private IP)]
        Cache[(Redis<br/>Private IP)]
    end
    
    subgraph "Security Groups"
        SG1[SG: Load Balancer<br/>Inbound: 443 from 0.0.0.0/0]
        SG2[SG: API Servers<br/>Inbound: 443 from LB only]
        SG3[SG: Database<br/>Inbound: 5432 from API only]
    end
    
    Internet --> WAF
    WAF --> CDN
    WAF --> ALB
    
    ALB --> API1
    ALB --> API2
    
    API1 --> DB
    API1 --> Cache
    API2 --> DB
    API2 --> Cache
```

---

## CI/CD Pipeline

```mermaid
graph LR
    A[Developer<br/>Commits Code] --> B[Git Push]
    B --> C{Branch?}
    
    C -->|main| D[GitHub Actions<br/>Main Workflow]
    C -->|feature| E[GitHub Actions<br/>PR Workflow]
    
    E --> F[Run Tests]
    F --> G[TypeScript Check]
    G --> H[Lint Code]
    H --> I{Pass?}
    I -->|No| J[Notify Developer]
    I -->|Yes| K[Merge to Main]
    
    D --> L[Build Server<br/>esbuild]
    L --> M[Build Client<br/>Vite]
    M --> N[Run E2E Tests<br/>Playwright]
    N --> O{Pass?}
    
    O -->|No| P[Rollback]
    O -->|Yes| Q[Deploy to Staging]
    
    Q --> R[Smoke Tests]
    R --> S{Pass?}
    
    S -->|No| P
    S -->|Yes| T{Manual Approval}
    
    T --> U[Deploy to Production]
    U --> V[Health Check]
    V --> W{Healthy?}
    
    W -->|No| P
    W -->|Yes| X[Success]
```

---

## Caching Strategy

```mermaid
graph TB
    Client[Client Browser]
    
    subgraph "API Server"
        Router[Router]
        Cache{Cache<br/>Exists?}
        DB[(Database)]
        Redis[(Redis Cache)]
    end
    
    Client -->|Request| Router
    Router --> Cache
    
    Cache -->|Yes| Hit[Return Cached Data]
    Cache -->|No| DB
    
    DB --> Store[Store in Cache<br/>TTL: 5 minutes]
    Store --> Redis
    
    DB --> Return[Return Fresh Data]
    Hit --> Client
    Return --> Client
    
    style Hit fill:#90EE90
    style Return fill:#FFD700
```

---

## Rendering Instructions

All diagrams use **Mermaid.js** syntax and can be rendered in:

1. **GitHub/GitLab**: Native Mermaid support in Markdown
2. **VS Code**: Install "Markdown Preview Mermaid Support" extension
3. **Docusaurus**: Built-in Mermaid plugin
4. **Static Export**: Use Mermaid CLI
   ```bash
   npx @mermaid-js/mermaid-cli -i diagram.mmd -o diagram.svg
   ```

---

**End of Architecture Diagrams**  
*See also*: `10_architecture.md` for detailed descriptions, `12_rbac-matrix.md` for access control
