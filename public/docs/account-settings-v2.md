# Account Settings Documentation

**Last Updated**: October 16, 2025  
**Feature**: Comprehensive Account Settings Interface

---

## Overview

The Account Settings page provides a centralized hub for managing all user preferences, security settings, integrations, and administrative configurations. The interface features a modern tabbed design with role-based access control.

---

## Features

### 🎨 **Visual Enhancements**
- **Gradient background** with subtle backdrop
- **Shadow effects** on cards for depth
- **Hover states** on interactive elements
- **Color-coded badges** for status indicators
- **Icon-enhanced headers** for better visual hierarchy
- **Responsive grid layouts** for all screen sizes

### 🔐 **Role-Based Tabs**

#### **All Users (Lender & Admin)**
1. **Profile** - Personal and company information
2. **Security** - Password, 2FA, and session management
3. **Notifications** - Email, SMS, and browser alerts
4. **Billing** - Subscription and payment methods
5. **API & Integration** - API keys, webhooks, and third-party integrations
6. **Activity Log** - Comprehensive audit trail
7. **Landing Pages** - Customizable public landing pages

#### **Admin-Only Tabs**
8. **Branding** - Company logo, colors, and visual identity
9. **Team & Roles** - Team member management and role assignment
10. **Users** - User management interface
11. **Permissions** - Fine-grained permission matrix
12. **Security & Compliance** - MFA, session timeouts, audit retention
13. **Developer** - Webhook secrets and sandbox mode
14. **Documents** - Document type requirements and retention

---

## Tab Details

### 1. Profile Tab

**Purpose**: Manage personal and company information

**Features**:
- Large avatar with upload functionality
- First name, last name, email, phone fields
- Company logo upload
- Company name, job title, address

**UI Enhancements**:
- 24px avatar with primary color border
- Upload hint text: "JPG, PNG or GIF. Max size 2MB."
- Icon-enhanced section headers
- Responsive 2-column grid

**Screenshot Location**: Shows basic fields but now with enhanced styling

---

### 2. Security Tab

**Purpose**: Password management and authentication settings

**Features**:
- **Password Change**: Current, new, and confirm fields
- **Two-Factor Authentication**: Toggle switch with description
- **Active Sessions**: View and manage login sessions
- **Logout All Sessions**: Security action button

**UI Enhancements**:
- 3-column grid for password fields
- Bordered cards with hover effects
- Green "Active" badge for current session
- Session metadata: Browser, location, timestamp

---

### 3. Notifications Tab

**Purpose**: Configure notification preferences

**Features**:
- **Email Alerts**: Important updates via email
- **SMS Alerts**: Urgent text messages
- **Browser Notifications**: In-browser push notifications
- **Marketing Emails**: Promotional content

**UI Enhancements**:
- Icon for each notification type (Mail, Phone, Globe, Building)
- Toggle switches with descriptions
- Hover effect on notification cards
- Color-coded icons (primary color)

---

### 4. Billing Tab

**Purpose**: Manage subscription and payment methods

**Features**:
- **Current Plan**: Professional Plan - $299/month
- **Next Billing Date**: Jan 15, 2025
- **Payment Method**: Masked credit card number
- **Update Payment**: Quick action button

**UI Enhancements**:
- Gradient blue card for active plan
- Credit card icon in colored circle
- "Active" badge in blue
- Masked card number with expiry date

---

### 5. API & Integration Tab

**Purpose**: Manage API keys and third-party integrations

**Features**:

#### **API Key Section**
- View/hide API key toggle
- Copy to clipboard button
- Regenerate key with confirmation
- Loading state with spinning icon

#### **Webhooks Section**
- Webhook URL input
- Event selection dropdown
- Save webhook configuration

#### **Third-Party Integrations**
1. **Plaid (Banking Integration)**
   - Environment selector (Sandbox, Development, Production)
   - Client ID (secret input)
   - Secret key (secret input)

2. **Twilio (SMS Notifications)**
   - Account SID (secret input)
   - Auth Token (secret input)
   - From Number (text input)

3. **SendGrid (Email Service)**
   - API Key (secret input)

4. **Stripe (Payment Processing)**
   - Secret Key (secret input)
   - Webhook Secret (secret input)

**UI Enhancements**:
- Gradient card with shadow for integrations
- Icon-enhanced section headers (Globe, Phone, Mail, CreditCard)
- Colored icon circles (primary/10 background)
- Show/Hide toggle for secret fields
- Copy button for each secret
- Test Connection button
- Save All Integrations button
- Demo mode warning banner (amber)

**Secret Input Component**:
- Password-masked by default
- Eye/EyeOff toggle button
- Copy to clipboard with toast notification
- Placeholder text
- Focus ring effect
- Disabled state for demo mode

---

### 6. Activity Log Tab

**Purpose**: Comprehensive audit trail of user actions

**Features**:
- Filterable activity history
- User action tracking
- Timestamp and details
- Admin-level access control

**Component**: `ActivityLog` (separate component)

---

### 7. Landing Pages Tab

**Purpose**: Configure public-facing landing pages

**Features**:
- **Master Toggle**: Enable/disable public landing
- **Subdomain**: Custom subdomain configuration
- **Hero Content**: Headline, subheadline, CTA
- **Sections**: Features, How It Works, Testimonials, FAQ, Contact
- **SEO**: Meta title and description
- **Preview Button**: Open in new tab
- **Reset to Defaults**: Restore default settings

**Access**: Lender + Admin (edit is admin-only)

---

### 8. Branding Tab (Admin Only)

**Purpose**: Customize platform appearance

**Features**:
- Company name input
- Logo upload component
- Primary color picker (hex)
- Secondary color picker (hex)
- Save branding button

**UI Enhancements**:
- Color input type for visual picker
- Logo upload with preview
- Save button with icon

---

### 9. Team & Roles Tab (Admin Only)

**Purpose**: Manage team members and role assignments

**Features**:
- Team member list
- Role dropdown (admin, lender, analyst, support)
- Invite member button
- Remove member action
- Save team changes

**UI Enhancements**:
- Member cards with status indicators
- Role selector dropdown
- Invited vs. Active status

---

### 10. Users Tab (Admin Only)

**Purpose**: User management interface

**Component**: `UsersTab` (separate component)

---

### 11. Permissions Tab (Admin Only)

**Purpose**: Fine-grained permission matrix

**Features**:
- Role-based permission grid
- Toggle switches for each permission
- Save permissions button

**UI Enhancements**:
- Table layout with role rows and action columns
- Switch toggles for each cell
- Scrollable for many permissions

---

### 12. Security & Compliance Tab (Admin Only)

**Purpose**: Organization-wide security settings

**Features**:
- **MFA Required**: Toggle for mandatory 2FA
- **Session Timeout**: Minutes until auto-logout
- **Audit Log Retention**: Days to keep logs
- **PII Masking**: Auto-mask sensitive data
- **IP Allowlist**: Whitelist IP addresses

**UI Enhancements**:
- 2-column grid layout
- Toggle switches with descriptions
- Textarea for IP list
- Number inputs for timeouts

---

### 13. Developer Tab (Admin Only)

**Purpose**: Developer-specific settings

**Features**:
- **Sandbox Mode**: Toggle for non-production flows
- **Webhook Secret**: View and copy webhook secret
- **Rotate Webhook Secret**: Generate new secret
- **Save Settings**: Persist changes

**UI Enhancements**:
- Monospace font for secrets
- Copy button with toast
- Rotate button with loading state
- Save button

---

### 14. Documents Tab (Admin Only)

**Purpose**: Document requirements configuration

**Features**:
- **Required Document Types**: Toggle for each type
- **Retention Days**: Number input
- **Save Settings**: Persist changes

**UI Enhancements**:
- Grid of document type toggles
- Number input for retention
- Save button

---

## Component Architecture

### Main Components
- `AccountSettingsPage` - Main container
- `HeaderRow` - Page header with title and actions
- `Field` - Reusable input field component
- `FieldPassword` - Password input component
- `IntegrationsSection` - Third-party integrations UI
- `SecretInput` - Secret field with show/hide/copy

### External Components
- `ActivityLog` - Activity tracking component
- `UsersTab` - User management component
- `LogoUpload` - Logo upload component
- `NewUserPasswordModal` - First-time password setup
- `ConfirmPasswordModal` - Password confirmation for sensitive actions

---

## Styling Details

### Color Scheme
- **Primary**: Used for icons, accents, gradients
- **Muted**: Background tints for inputs and cards
- **Border**: Subtle borders on cards and inputs
- **Success**: Green for active status
- **Warning**: Amber for demo mode alerts
- **Destructive**: Red for delete actions

### Typography
- **Headers**: Bold, larger sizes with gradient text
- **Labels**: Medium weight, consistent sizing
- **Descriptions**: Muted foreground color
- **Monospace**: For API keys and secrets

### Spacing
- **Cards**: Consistent padding (pt-6 for content)
- **Grids**: Gap-6 for responsive spacing
- **Sections**: Separators between major sections
- **Margins**: mt-2 for descriptions, mt-6 for sections

### Animations
- **Hover**: Transition-colors on interactive elements
- **Loading**: Animate-spin for refresh icons
- **Focus**: Ring effect on inputs

---

## Accessibility

### ARIA Attributes
- `aria-busy` on loading buttons
- `data-testid` on all interactive elements
- Semantic HTML (labels, buttons, inputs)

### Keyboard Navigation
- Tab order follows visual hierarchy
- Focus indicators on all interactive elements
- Enter key submits forms

### Screen Reader Support
- Descriptive labels for all inputs
- Alt text for icons via title attributes
- Role attributes for custom components

---

## State Management

### Local State
- Form field values
- Toggle states (show/hide API key)
- Loading states (saving, regenerating)
- Modal visibility

### Remote State
- User profile data
- Branding settings
- Integration credentials
- Team members
- Permissions matrix

### State Updates
- Optimistic updates for toggles
- Toast notifications for success/error
- Validation on save
- Confirmation modals for sensitive actions

---

## API Endpoints

### GET Endpoints
- `/api/user` - Current user profile
- `/api/admin/settings/landing` - Landing page settings
- `/api/admin/settings/team` - Team members
- `/api/admin/settings/permissions` - Permission matrix
- `/api/admin/settings/security` - Security settings
- `/api/admin/settings/developer` - Developer settings
- `/api/admin/settings/documents` - Document settings

### PUT/POST Endpoints
- `/api/admin/settings/branding` - Update branding
- `/api/admin/settings/landing` - Update landing page
- `/api/admin/settings/team` - Update team
- `/api/admin/settings/permissions` - Update permissions
- `/api/admin/settings/security` - Update security
- `/api/admin/settings/developer` - Update developer settings
- `/api/admin/settings/documents` - Update document settings
- `/api/integrations/save` - Save integration credentials
- `/api/integrations/ping` - Test integration connection
- `/api/admin/settings/developer/rotate-webhook` - Rotate webhook secret

---

## Best Practices

### Security
✅ Password-mask sensitive fields by default  
✅ Require password confirmation for sensitive changes  
✅ Demo mode prevents modifications  
✅ Rate limit API calls  
✅ Validate input on both client and server

### UX
✅ Toast notifications for all actions  
✅ Loading states for async operations  
✅ Disabled states for unavailable actions  
✅ Helpful placeholder text  
✅ Inline validation errors

### Performance
✅ Lazy load admin-only data  
✅ Debounce input fields  
✅ Optimize re-renders with useMemo  
✅ Cancel pending requests on unmount  
✅ Cache branding data

---

## Testing

### Unit Tests (data-testid attributes)
- `tab-profile-settings`
- `tab-security-settings`
- `tab-notification-settings`
- `tab-billing-settings`
- `tab-api-settings`
- `tab-activity-log`
- `tab-landing-settings`
- `tab-branding-settings`
- `tab-users-settings`
- `input-first-name`
- `input-last-name`
- `input-email`
- `input-phone`
- `button-change-avatar`
- `button-save-settings`
- `button-update-password`
- `switch-2fa`
- `button-logout-sessions`
- `switch-emailAlerts`
- `switch-smsAlerts`
- `button-update-payment`
- `input-api-key`
- `button-toggle-api-key`
- `button-regenerate-api-key`
- `button-copy-api-key`
- `input-webhook-url`
- `select-webhook-events`
- `button-save-webhook`

### Integration Tests
- ✅ Save profile changes
- ✅ Change password flow
- ✅ Enable/disable 2FA
- ✅ Regenerate API key
- ✅ Save integrations (with password confirmation)
- ✅ Test integration connection
- ✅ Update branding (admin)
- ✅ Invite team member (admin)
- ✅ Update permissions (admin)

---

## Troubleshooting

### Issue: Settings not saving
**Solution**: Check network tab for API errors, verify authentication

### Issue: Demo mode blocking changes
**Solution**: Use non-demo user account, check `isDemoUser()` function

### Issue: Tabs not displaying
**Solution**: Verify user role, check route parameters, clear browser cache

### Issue: Integrations not loading
**Solution**: Check `/api/admin/settings/*` endpoints, verify admin role

---

## Future Enhancements

### Planned Features
- [ ] Profile photo upload to cloud storage
- [ ] Email verification on email change
- [ ] SMS verification on phone change
- [ ] Export activity log to CSV
- [ ] Custom webhook event selection
- [ ] Real-time team collaboration indicators
- [ ] Advanced permission granularity
- [ ] Dark mode theme editor
- [ ] Custom domain for landing pages

### Technical Debt
- [ ] Extract tabs into separate components
- [ ] Add form validation with Zod
- [ ] Implement optimistic updates for all actions
- [ ] Add undo/redo for destructive actions
- [ ] Improve mobile responsiveness on complex tabs

---

**End of Account Settings Documentation**  
*Last Updated*: October 16, 2025  
*Version*: 2.0.0 (Enhanced UI)
