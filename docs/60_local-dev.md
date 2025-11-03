# Local Development Guide

**Last Updated**: October 16, 2025  
**Target Audience**: Developers

## At a glance
- Node 20.x; npm 10.x; VS Code recommended
- Frontend: Vite dev at http://localhost:5100
- Backend: Express at http://localhost:5000 (planned)
- Database: SQLite for dev; Postgres for prod

## Quick links
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Workflow](#development-workflow)
- [Database Tools](#database-tools)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Development Tips](#development-tips)
- [Quick Commands Reference](#quick-commands-reference)

---

## Prerequisites

### Required Software

| Tool | Version | Purpose | Installation |
|------|---------|---------|--------------|
| **Node.js** | 20.x or later | Runtime environment | [nodejs.org](https://nodejs.org) |
| **npm** | 10.x or later | Package manager | Bundled with Node.js |
| **Git** | 2.x or later | Version control | [git-scm.com](https://git-scm.com) |

### Optional Tools

| Tool | Purpose | Installation |
|------|---------|--------------|
| **PostgreSQL** | Production database (local testing) | [postgresql.org](https://www.postgresql.org) |
| **Docker** | Containerized database | [docker.com](https://www.docker.com) |
| **Visual Studio Code** | Recommended IDE | [code.visualstudio.com](https://code.visualstudio.com) |

---

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/lendgismo.git
cd lendgismo
```

### 2. Install Dependencies

```bash
npm install
```

**Expected output**:
```
added 342 packages in 15s
```

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local
# Windows
notepad .env.local

# macOS/Linux
nano .env.local
```

**Minimal `.env.local`**:
```bash
# Database (SQLite for local development)
DATABASE_URL=file:./test.db

# Session secret (generate with: openssl rand -base64 32)
SESSION_SECRET=dev-session-secret-change-in-production

# Log level
LOG_LEVEL=debug

# Email provider (console for development)
EMAIL_PROVIDER=console

# Demo mode
ALLOW_DEMO_LOGIN=1
AUTH_MODE=demo
```

### 4. Initialize Database

```bash
# Generate database schema
npm run db:push

# Seed demo data (optional)
npm run db:seed
```

**Expected output**:
```
✅ Database schema pushed successfully
✅ Demo data seeded (3 users, 12 applications)
```

### 5. Start Development Server

```bash
npm run dev
```

**Expected output (Frontend docs UI)**:
```
VITE v5.x  ready in Xs
➜  Local:   http://localhost:5100/
➜  Network: http://<your-ip>:5100/
```

### 6. Open Browser

Navigate to:
- Frontend (Docs UI): `http://localhost:5100` (Vite dev server)
- Backend API (if running separately): `http://localhost:5000`

**Demo Credentials**:
- Email: `admin@example.com`
- Password: `admin123`

---

## Project Structure

```
lendgismo/
├── client/                 # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities (API client, auth, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   └── App.tsx         # Main application component
│   ├── public/             # Static assets
│   └── index.html          # HTML entry point
├── server/                 # Backend (Express + TypeScript)
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route handlers
│   ├── db.ts               # Database connection
│   ├── middleware.ts       # Express middleware
│   ├── storage.ts          # File upload handling
│   ├── lib/                # Server utilities
│   └── middleware/         # Custom middleware
├── shared/                 # Shared code (client + server)
│   ├── schema.ts           # Database schema (Drizzle ORM)
│   ├── demo-data.ts        # Demo data generators
│   └── types.ts            # TypeScript types
├── docs/                   # Documentation
├── openapi/                # OpenAPI specification
├── .env.local              # Local environment variables (gitignored)
├── .env.example            # Example environment file
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── drizzle.config.ts       # Drizzle ORM configuration
```

---

## Development Workflow

### Running the Application

#### Option 1: Concurrent Dev Servers (Recommended)

```bash
# Start both frontend and backend in watch mode
npm run dev
```

This starts:
- **Frontend**: Vite dev server on `http://localhost:5173`
- **Backend**: tsx watch server on `http://localhost:5000`

#### Option 2: Separate Terminals

**Terminal 1** (Backend):
```bash
npm run server:dev
```

**Terminal 2** (Frontend):
```bash
npm run client:dev
```

### Database Management

#### Push Schema Changes

```bash
# Apply schema changes to database
npm run db:push
```

#### Generate Migration

```bash
# Generate SQL migration file
npm run db:generate
```

#### Apply Migration

```bash
# Run pending migrations
npm run db:migrate
```

#### Seed Demo Data

```bash
# Populate database with demo data
npm run db:seed
```

#### Reset Database

```bash
# Drop all tables and re-create schema
npm run db:reset
```

### Type Checking

```bash
# Check TypeScript types without compiling
npm run typecheck

# Watch mode
npm run typecheck:watch
```

### Linting & Formatting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format code with Prettier
npm run format
```

### Building for Production

```bash
# Build both frontend and backend
npm run build

# Build frontend only
npm run build:client

# Build backend only
npm run build:server
```

**Output**:
- Frontend: `dist/public/` (static assets)
- Backend: `dist/index.js` (bundled server)

---

## Common Tasks

### Add a New API Endpoint

1. **Define route** in `server/routes.ts`:

```typescript
// server/routes.ts
app.post('/api/my-endpoint', requireAuth, async (req, res) => {
  try {
    const { data } = req.body
    // Handle request
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

2. **Add client function** in `client/src/lib/api.ts`:

```typescript
// client/src/lib/api.ts
export async function callMyEndpoint(data: any) {
  const response = await fetch('/api/my-endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
    credentials: 'include',
  })
  return response.json()
}
```

3. **Test**:

```bash
curl -X POST http://localhost:5000/api/my-endpoint \
  -H "Content-Type: application/json" \
  -d '{"data":"test"}' \
  -b cookies.txt
```

### Add a New Database Table

1. **Update schema** in `shared/schema.ts`:

```typescript
// shared/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const myTable = sqliteTable('my_table', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})
```

2. **Push schema** to database:

```bash
npm run db:push
```

3. **Query table**:

```typescript
// server/routes.ts
import { db } from './db'
import { myTable } from '@/shared/schema'

const rows = await db.select().from(myTable).all()
```

### Add a New React Component

1. **Create component** in `client/src/components/`:

```typescript
// client/src/components/MyComponent.tsx
import React from 'react'

interface MyComponentProps {
  title: string
}

export function MyComponent({ title }: MyComponentProps) {
  return (
    <div>
      <h1>{title}</h1>
    </div>
  )
}
```

2. **Use component**:

```typescript
// client/src/pages/MyPage.tsx
import { MyComponent } from '@/components/MyComponent'

export function MyPage() {
  return <MyComponent title="Hello World" />
}
```

### Add a New Route (Wouter)

1. Define route in `client/src/App.tsx` (Wouter):

```typescript
// client/src/App.tsx
import { Switch, Route, Link } from 'wouter'
import { MyPage } from './pages/MyPage'

function App() {
  return (
    <Switch>
      {/* ... existing routes ... */}
      <Route path="/my-page" component={MyPage} />
    </Switch>
  )
}

// Navigate
<Link href="/my-page">Go to My Page</Link>
```

---

## Debugging

### Backend Debugging (Node.js)

#### VS Code Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "server:dev"],
      "skipFiles": ["<node_internals>/**"],
      "envFile": "${workspaceFolder}/.env.local"
    }
  ]
}
```

**Usage**:
1. Set breakpoints in `server/` files
2. Press `F5` to start debugging
3. Debug panel shows variables, call stack, etc.

#### Console Debugging

```typescript
// server/routes.ts
console.log('Debug info:', { userId, applicationId })
console.error('Error:', error)
console.trace('Stack trace')
```

### Frontend Debugging (React)

#### Browser DevTools

1. Open Chrome DevTools (`F12`)
2. **Sources** tab → Set breakpoints in TypeScript files
3. **Console** tab → View `console.log()` output
4. **React DevTools** → Inspect component tree

#### React Query DevTools (optional)

If you install `@tanstack/react-query-devtools`, you can enable the pane in development:

```typescript
// client/src/App.tsx
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
// <ReactQueryDevtools initialIsOpen={false} />
```
Usage: Click the floating icon to open (only when the package is installed)

---

## Database Tools

### SQLite Browser

**Download**: [sqlitebrowser.org](https://sqlitebrowser.org)

**Open database**:
1. Launch DB Browser for SQLite
2. File → Open Database → Select `test.db`
3. Browse data, execute SQL queries, view schema

### PostgreSQL (Production-like Local Setup)

#### Using Docker

```bash
# Start PostgreSQL container
docker run --name lendgismo-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=lendgismo \
  -p 5432:5432 \
  -d postgres:16

# Update .env.local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lendgismo

# Push schema
npm run db:push
```

#### Using Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb lendgismo

# Update .env.local
DATABASE_URL=postgresql://postgres@localhost:5432/lendgismo

# Push schema
npm run db:push
```

---

## Testing

### Manual API Testing

#### cURL

```bash
# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  -c cookies.txt

# Get applications
curl http://localhost:5000/api/loan-applications -b cookies.txt
```

#### Postman

1. Import collection from `docs/50_api-quickstart.md`
2. Set `{{baseUrl}}` to `http://localhost:5000`
3. Send requests

#### HTTP Client (VS Code Extension)

Install **REST Client** extension, then create `test.http`:

```http
### Login
POST http://localhost:5000/api/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}

### Get Applications
GET http://localhost:5000/api/loan-applications
```

Click **Send Request** above each request.

---

## Troubleshooting

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Or use a different port
PORT=5001 npm run dev
```

### Database Connection Error

**Error**: `SqliteError: unable to open database file`

**Solution**:
```bash
# Ensure DATABASE_URL is correct
echo $DATABASE_URL  # Should be file:./test.db

# Create database directory if needed
mkdir -p $(dirname test.db)

# Initialize database
npm run db:push
```

### Module Not Found

**Error**: `Error: Cannot find module '@/components/MyComponent'`

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart TypeScript server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### CORS Errors (if using a separate backend)

**Error**: `Access to fetch blocked by CORS policy`

**Solution**:
If you run a separate backend on 5000, you can set a Vite dev proxy (example):

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
```

Or update `CORS_ORIGIN` in `.env.local`:
```bash
CORS_ORIGIN=http://localhost:5173
```

### Session Not Persisting

**Error**: Logged in but API returns 401 Unauthorized

**Solutions**:
1. **Check SESSION_SECRET**: Must be set in `.env.local`
2. **Check cookie settings**: `credentials: 'include'` in fetch requests
3. **Clear cookies**: Delete `cookies.txt` and re-login
4. **Check browser**: Ensure cookies enabled (not in incognito mode)

---

## Development Tips

### Hot Reload

- **Frontend**: Vite hot-reloads automatically on file save
- **Backend**: tsx watch restarts server on file save

### Environment Variables

Prefix with `VITE_` to expose to frontend:

```bash
# .env.local
VITE_APP_NAME=Lendgismo  # Accessible in frontend
API_SECRET=xyz123       # Backend only
```

```typescript
// client/src/App.tsx
console.log(import.meta.env.VITE_APP_NAME)  // "Lendgismo"
```

### TypeScript Path Aliases

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./client/src/*"],
      "@/server/*": ["./server/*"],
      "@/shared/*": ["./shared/*"]
    }
  }
}
```

**Usage**:
```typescript
// Instead of: import { Button } from '../../../components/ui/Button'
import { Button } from '@/components/ui/Button'
```

### VS Code Extensions (Recommended)

- **ESLint** - Linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **REST Client** - API testing
- **SQLite Viewer** - View SQLite databases

---

## Quick Commands Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (frontend + backend) |
| `npm run build` | Build for production |
| `npm run typecheck` | Type check TypeScript |
| `npm run lint` | Lint code |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate migration |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:reset` | Reset database |

---

**End of Local Development Guide**  
*Next*: See `61_testing.md` for testing guide, `62_logging-and-monitoring.md` for debugging production
