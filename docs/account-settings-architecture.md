Canonicalization note (2025-10-14)

- Canonical lender Account Settings route: `/lender/account-settings` rendered by `client/src/pages/settings/AccountSettings.tsx` (thin re-export is used under `client/src/pages/lender/AccountSettings.tsx`).
- Legacy paths now redirect or alias to the canonical: `/settings`, `/account-settings`, `/settings/account`, `/lender/AccountSettings`, and `/lender/settings` all resolve to `/lender/account-settings`.

# Account Settings — Architecture and Wiring (Lender App)

This doc captures the canonical Account Settings page, how it’s routed/wrapped, and the dev settings bridge endpoints the UI talks to.

## Canonical location

- Page component: `client/src/pages/settings/AccountSettings.tsx` (default export: `AccountSettingsPage`)
- Back-compat re-export: `client/src/pages/lender/AccountSettings.tsx` → `export { default } from "@/pages/settings/AccountSettings";`

## Routing and shell

- Router: `client/src/App.tsx` (wouter)
- Lender shell: `LenderShell` wraps lender pages with `Header` + `LenderSidebar` and unified content spacing.
  - Content wrapper classes: `pl-0 lg:pl-60 pt-4 sm:pt-5 relative isolate`
  - Ambient backdrop: first child `<div class="app-waves -z-10 pointer-events-none" aria-hidden />` rendered behind content only (respects `prefers-reduced-motion`).
- Settings route aliases (all render the canonical page):
  - `/lender/account-settings` (primary)
  - `/lender/AccountSettings` (legacy casing)
  - `/lender/settings` (friendly alias)
  - `/settings/account` (generic alias)
  - `/settings` → redirects to `/settings/account`
- Related: `/settings/activity` renders the standalone Activity Log (also available as a tab in the settings page).

Client landing redirect:
- On mount, the router fetches `/api/admin/settings/landing` and if `disableLanding` is true, redirects `/` → `/login` on the client.

## Tabs in Account Settings

Visible to lender users:
- Profile
- Security
- Notifications
- Billing
- API & Integration
- Activity Log (as a tab)
- Preferences

Admin-only tabs (visible when `user.role === 'admin'`):
- Branding
- Landing Pages
- Team & Roles
- Permissions (Matrix)
- Security & Compliance
- Developer (includes rotate webhook secret)
- Documents

## Development settings bridge (server)

- Location: `server/index.ts` (see the `<<settings-bridge start>>` block)
- Enablement: enabled when `NODE_ENV !== 'production'` by default, or explicitly with `SETTINGS_BRIDGE_ENABLED=1`. Disable with `SETTINGS_BRIDGE_ENABLED=0`.
- Tenant scoping: derived from the `user` cookie JSON (`tenantId`), defaulting to `demo`.
- Admin enforcement: write endpoints return 401/403 unless `user.role === 'admin'`.

Endpoints and shapes:

Branding
- GET `/api/admin/settings/branding`
  - Response: `{ companyName?: string, primaryColor?: string, secondaryColor?: string }`
- PUT `/api/admin/settings/branding`
  - Body: same shape as GET response
  - Response: `{ success: true, data: <merged> }`

Landing Pages
- GET `/api/admin/settings/landing`
  - Response: `{ success: true, data: { disableLanding?: boolean, subdomain?: string, heroHeadline?: string, subheadline?: string, ctaLabel?: string, ctaUrl?: string, mediaUrl?: string, sections?: { features?: boolean, howItWorks?: boolean, testimonials?: boolean, faq?: boolean, contact?: boolean }, seo?: { title?: string, description?: string } }, ts }`
- PUT `/api/admin/settings/landing`
  - Body: same shape as `data`
  - Response: `{ success: true, data: <merged> }`

Team & Roles
- GET `/api/admin/settings/team`
  - Response: `{ success: true, data: Array<{ id: string, name: string, email: string, role: string, status: 'active'|'invited' }>, ts }`
- PUT `/api/admin/settings/team`
  - Body: `{ members: Array<{ id?: string, name: string, email: string, role: string, status: 'active'|'invited' }> }`
  - Response: `{ success: true, data: <normalized list> }`

Permissions (Matrix)
- GET `/api/admin/settings/permissions`
  - Response: `{ success: true, data: { roles: string[], actions: string[], matrix: Record<string, Record<string, boolean>> }, ts }`
- PUT `/api/admin/settings/permissions`
  - Body: same shape as `data`
  - Response: `{ success: true, data }`

Security & Compliance
- GET `/api/admin/settings/security`
  - Default object: `{ mfaRequired: true, sessionTimeoutMins: 30, auditLogRetentionDays: 365, piiMasking: true, ipAllowlist: [] }`
- PUT `/api/admin/settings/security`
  - Body: partial update of the above
  - Response: `{ success: true, data: <merged> }`

Developer
- GET `/api/admin/settings/developer`
  - Response: `{ success: true, data: { sandboxMode?: boolean, webhookSecret?: string } }`
- PUT `/api/admin/settings/developer`
  - Body: same shape as `data`
  - Response: `{ success: true, data: <merged> }`
- POST `/api/admin/settings/developer/rotate-webhook`
  - Response: `{ success: true, data: { webhookSecret: string } }`

Documents
- GET `/api/admin/settings/documents`
  - Response: `{ success: true, data: { requiredTypes?: Record<string, boolean>, retentionDays?: number } }`
- PUT `/api/admin/settings/documents`
  - Body: same shape as `data`
  - Response: `{ success: true, data: <merged> }`

Notes and placeholders
- The Integrations section references `/api/integrations/save` and `/api/integrations/ping` as placeholders; these are not part of the settings bridge. In demo mode, saves are effectively read-only with confirmation.
- Admin-only logic is handled both client-side (tab visibility) and server-side (write validation).
- Styling for the subtle animated backdrop and sidebar contrast lives in `client/src/styles/theme-overrides.css`. The sidebar root adds a scoping class `lender-sidebar`.

## Auth and access

- Settings allowed roles: `lender` and `admin`. Borrowers redirect to `/borrower/dashboard`. Unauthenticated users redirect to `/login`.
- Admin-only tabs render only for admin users.

## Quick QA

- Visit any alias (e.g., `/lender/settings`) and verify tabs render.
- As admin, test Branding save (emits `brand:update`), Subdomain & Landing save and root redirect when disabled, Team/Permissions/Security/Developer/Documents saves.
- Developer → Rotate Webhook Secret updates the secret and shows a toast.

## Files of interest

- Canonical settings page: `client/src/pages/settings/AccountSettings.tsx`
- Legacy re-export: `client/src/pages/lender/AccountSettings.tsx`
- Lender shell and routes: `client/src/App.tsx`
- Sidebar (scoped styling class): `client/src/components/layout/lender-sidebar.tsx`
- Global additive CSS (waves + sidebar contrast): `client/src/styles/theme-overrides.css`
- Dev bridge endpoints: `server/index.ts`
