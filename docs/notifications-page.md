# Notifications Page

## Overview
Full-featured notifications page with filters, search, infinite scroll, bulk actions, and realtime updates. Demo-safe with localStorage persistence.

## URL
`/lender/notifications`

## Features

### Toolbar (Sticky)
- **Search**: Debounced 250ms search across title and body
- **Filters**:
  - Severity: All / Info / Success / Warning / Error
  - Source: All / System / Task / Payment / Application
  - Read State: All / Unread / Read
  - Timeframe: 24h / 7d / 30d / All
- **Bulk Actions** (when items selected):
  - Mark as read
  - Mark as unread
  - Clear selected
- **Global Actions**:
  - Mark all as read
  - Clear all (with confirmation dialog)
- **View Mode**: Compact / Comfortable (persisted in localStorage)

### List
- Infinite scroll with cursor pagination (30 items per page)
- Prefetch at 80% scroll
- Realtime updates via polite polling (15s → 60s backoff)
- New items inserted at top without scroll-jump
- Selection maintained across pages

### Row Interactions
- **Click**: Opens `href` in-app (if provided)
- **Ctrl/Cmd+Click**: Opens `href` in new tab
- **Right-click / Kebab menu**: Mark read/unread, Dismiss
- **Keyboard Navigation**:
  - `↑` / `↓`: Navigate rows
  - `Enter`: Open notification
  - `Space`: Toggle selection
  - `m`: Toggle read/unread
  - `Delete`: Dismiss
  - Ctrl+`a`: Select all

### Accessibility
- `role="feed"` on list, `role="article"` on items
- Proper ARIA labels and focus management
- Live region announces new notifications (`aria-live="polite"`)
- Keyboard-accessible throughout

### States
- **Loading**: Skeleton rows (5)
- **Empty**: "You're all caught up" with link to dashboard
- **Error**: Inline retry button

## Data Contract

```typescript
type Notification = {
  id: string
  title: string
  body?: string
  severity?: "info" | "success" | "warning" | "error"
  createdAt: string // ISO
  isRead: boolean
  href?: string
  icon?: string
  source?: "system" | "task" | "payment" | "application"
}
```

## Files

### Client
- `client/src/lib/notifications.ts` - Core types, helpers, localStorage persistence, demo data
- `client/src/components/NotificationsToolbar.tsx` - Filters, search, bulk actions
- `client/src/components/NotificationsList.tsx` - Infinite scroll container
- `client/src/components/NotificationRow.tsx` - Single notification row
- `client/src/pages/lender/Notifications.tsx` - Main page
- `client/src/components/notifications-dropdown.tsx` - Header dropdown (updated with "View all" link)

### Server
- `server/routes.ts` - Demo-safe API endpoints:
  - `GET /api/notifications` - Returns empty (client uses localStorage)
  - `PATCH /api/notifications` - Blocks in demo mode

## Storage
All notifications stored in `localStorage`:
- Key: `lendgismo-notifications-full`
- Poll tracking: `lendgismo-notifications-last-poll`
- View mode: `lendgismo-notifications-view-mode`

## Realtime Updates
- Polls localStorage every 15s (backoff to 60s if no activity)
- New notifications merged at top without scroll disruption
- Unread count synced to header badge

## Performance
- Debounced search (250ms)
- Memoized row components
- Batch state updates via `startTransition`
- Cancel in-flight requests on param change
- Clamp counts at 99+

## Test Plan

### Manual Testing
1. Navigate to `/lender/notifications`
2. Verify 8 demo notifications load
3. Test search: "payment" → 2 results
4. Test filters:
   - Severity: Warning → 2 items
   - Source: Application → 3 items
   - Read State: Unread → 2 items
   - Timeframe: 24h → 2 items
5. Test selection:
   - Click checkbox on 3 items
   - Click "Mark read" → items update
6. Test keyboard:
   - `↓` to navigate
   - `Space` to select
   - `m` to toggle read
   - `Delete` to dismiss
7. Test bulk actions:
   - "Mark all as read" → all read
   - "Clear all" → confirm dialog → empty state
8. Test view modes: Compact / Comfortable
9. Test "View all" link in header dropdown

### Integration
- Unread count in header badge matches localStorage
- Clicking notification with `href` navigates correctly
- Ctrl+Click opens in new tab

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate notifications |
| `Enter` | Open notification |
| `Space` | Toggle selection |
| `m` | Toggle read/unread |
| `Delete` | Dismiss notification |
| Ctrl+`a` | Select all (browser default) |

## Demo Data
8 notifications generated on first load:
- 2 unread (5min, 30min ago)
- 6 read (2h, 1d, 2d, 3d, 5d, 7d ago)
- Mixed severity: info, success, warning, error
- Mixed sources: system, task, payment, application

## Future Enhancements
- SSE/WebSocket for true realtime (currently polite polling)
- Server-side persistence (currently localStorage only)
- Push notifications (browser API)
- Notification preferences/filters
- Archive functionality
- Notification categories/tags
