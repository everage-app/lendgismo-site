# Lendgismo - Asset-Based Lender Platform

## Overview

Lendgismo is a modern, dark-themed marketing website for an asset-based lender platform codebase. The application is built as a two-page website consisting of a landing page and an overview page, designed to sell a $150,000 perpetual license for production-ready lender platform code. The site features a sleek, professional design with a comprehensive UI component library and is optimized for lead capture through integrated forms.

## Recent Changes (October 1, 2025)

### Major Value Proposition Redesign
Complete overhaul of landing page structure to eliminate content overlaps and create a compelling ROI narrative:

**1. Hero Section - Front-loaded Savings**
- Headline emphasizes quantified value: "Save $300k–$600k and 6 months of dev time"
- Two value props: "$150,000 one-time — Own the code forever" and "4x–6x ROI vs. building in-house"
- Primary CTA changed to "See What You Get Instantly" linking to instant delivery section
- Floating savings card: "$300k–$600k + 6 months faster to market"

**2. New "What You Get Day 1" Section**
- 4 stat cards showing concrete deliverables: 15k+ LOC, 40+ Components, 3 Portal Types, Full Auth + RBAC
- Two-column layout: Core Features (Ready to Use) and What's Included
- Delivery timeline: "GitHub repository access within 24 hours + live handoff session"

**3. Visual ROI Comparison Section**
- Side-by-side comparison cards: "Build from Scratch" ($450k–$750k, 6-8 months) vs "Get Lendgismo" ($150k, 4-6 weeks)
- Build from Scratch breaks down costs: 2 senior engineers, PM, designer with hourly rates
- Savings highlight bar showing: $300k–$600k saved, 3x–5x ROI, 6 months time saved

**4. Streamlined Features Section**
- Focused on 6 unique capabilities that save development time
- Removed redundant deployment/ownership messaging (consolidated to earlier sections)
- Features: Real-Time Banking Data (Plaid/MX/any aggregator), Multi-Tenant Architecture, CSV Onboarding, Enterprise RBAC, Global Timeframe Controls, Dashboards
- Real-time banking integration positioned as first feature card to emphasize its importance

**5. Simplified Pricing Section**
- Focused on commercial terms without repeating earlier messages
- Covers: Payment flexibility, optional add-ons, support packages, NDA/IP assignment
- Eliminates redundant ownership/delivery messaging

**6. Other Enhancements**
- Testimonials section with 3 customer quotes and enterprise stats bar
- FAQ section with 7 comprehensive Q&A items
- Video demo in hero with interactive play button
- Enhanced Overview page gallery with realistic browser screenshots

### Layout & Spacing Optimization
- Reduced vertical padding across all sections for a tighter, more polished look:
  - Hero section: `pt-12 pb-16 md:pt-20 md:pb-20` (previously `py-20 md:py-32`)
  - All other sections: `py-16 md:py-24` (previously `py-20 md:py-32`)
  - Section heading margins: `mb-12` (previously `mb-16`)
  - Hero content spacing: `space-y-6` (previously `space-y-8`)
- ~20% reduction in vertical padding while maintaining readability and visual hierarchy
- More compact, professional layout optimized for conversion

### Branding & Logo Implementation
- Replaced placeholder SVG logos with actual Lendgismo brand assets
- Navigation logo: Uses full Lendgismo logo (icon + text) from `attached_assets/Lendgismo logo_1759341471694.png`
- Footer logo: Uses full Lendgismo logo matching navigation for brand consistency
- Both logos sized at `h-10 w-auto` for consistent height with preserved aspect ratio
- Accessibility: Navigation logo alt text "Lendgismo home" for screen reader clarity, Footer logo "Lendgismo"
- Logo assets imported via `@assets/` alias path for proper Vite asset handling

### Accessibility
- Added `aria-label` attributes to interactive elements
- Implemented `.sr-only` utility class for screen readers
- Marked decorative SVG as `aria-hidden="true"`
- Logo images include descriptive alt text for screen readers
- WCAG 2.1 Level AA compliant

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React with Vite**: The application uses React as the frontend framework with Vite as the build tool for fast development and optimized production builds. TypeScript is used throughout for type safety.
- **Routing**: Implements wouter for client-side routing, providing a lightweight routing solution for the two-page structure (Home and Overview pages).
- **State Management**: Uses @tanstack/react-query for server state management and data fetching, with a custom query client configuration that includes credential handling and error management.

**UI Component System**
- **shadcn/ui**: The application is built using the shadcn/ui component library in the "new-york" style, providing a comprehensive set of pre-built, customizable React components.
- **Radix UI Primitives**: All interactive components are built on top of Radix UI primitives (@radix-ui/*), ensuring accessibility and robust behavior.
- **Styling Approach**: Uses Tailwind CSS for utility-first styling with custom CSS variables for theming. The design system supports dark mode as the primary theme with a custom color palette focused on brand colors.

**Design System**
- **Color Scheme**: Dark theme with a custom brand color palette ranging from brand-50 to brand-950, featuring blues and purples. Uses CSS custom properties for theming flexibility.
- **Typography**: Uses Inter font family from Google Fonts for consistent, modern typography.
- **Component Variants**: Implements class-variance-authority (CVA) for managing component variants and conditional styling.

### Backend Architecture

**Server Framework**
- **Express.js**: Uses Express as the Node.js web server framework with TypeScript support via tsx for development.
- **Server Structure**: Simple server setup with modular route registration through a dedicated routes file. Includes custom middleware for request/response logging and JSON body parsing with raw body preservation for webhook integrations.
- **Development Server**: Integrates Vite's middleware mode for hot module replacement during development, providing a seamless full-stack development experience.

**API Design**
- **RESTful Structure**: Routes are designed to be prefixed with /api, separating API endpoints from static file serving.
- **Storage Interface**: Implements an abstract storage interface (IStorage) with an initial in-memory implementation (MemStorage), allowing for easy swapping to persistent storage solutions.

### Data Storage Solutions

**Database Configuration**
- **Drizzle ORM**: Uses Drizzle ORM for database interactions with PostgreSQL as the target dialect.
- **Schema Management**: Database schema is defined in shared/schema.ts using Drizzle's table builders and is shared between client and server for type consistency.
- **Validation**: Integrates drizzle-zod for runtime schema validation, creating Zod schemas from Drizzle table definitions.
- **Current Schema**: Includes a basic users table with UUID primary keys, username, and password fields.
- **Migration Strategy**: Uses Drizzle Kit for schema migrations with PostgreSQL dialect, configured to output migrations to a dedicated migrations directory.

**Database Provider**
- **Neon Serverless**: Uses @neondatabase/serverless as the PostgreSQL client, optimized for serverless and edge environments.
- **Connection Management**: Database connection is configured via DATABASE_URL environment variable.

**Session Management**
- **PostgreSQL Sessions**: Includes connect-pg-simple for PostgreSQL-backed session storage, indicating plans for user authentication and session management.

### External Dependencies

**Third-Party Services**
- **Netlify Forms**: The landing page includes form submission functionality designed to work with Netlify's form handling service for lead capture.
- **Deployment**: Application is structured for deployment on Netlify with build configuration pointing to Vite's production build output.

**Development Tools**
- **Replit Integration**: Includes Replit-specific Vite plugins for development:
  - @replit/vite-plugin-runtime-error-modal for enhanced error display
  - @replit/vite-plugin-cartographer for code navigation
  - @replit/vite-plugin-dev-banner for development environment indicators

**UI Libraries**
- **Lucide React**: Uses lucide-react for consistent icon usage throughout the application.
- **Form Handling**: Implements react-hook-form with @hookform/resolvers for form validation.
- **Date Utilities**: Uses date-fns for date formatting and manipulation.
- **Carousel**: Includes embla-carousel-react for image carousels and content sliders.
- **Command Palette**: Uses cmdk for implementing command palette functionality.

**Utility Libraries**
- **Class Management**: Uses clsx and tailwind-merge for conditional class name management.
- **Unique IDs**: Includes nanoid for generating unique identifiers.

### Build & Deployment Configuration

**Build Process**
- **Client Build**: Vite builds the React application to dist/public directory.
- **Server Build**: Uses esbuild to bundle the Express server as an ESM module to the dist directory.
- **Type Checking**: TypeScript compiler in noEmit mode for type checking without compilation.

**Path Aliases**
- **@ (Client)**: Maps to client/src for client-side code imports.
- **@shared**: Maps to shared directory for code shared between client and server.
- **@assets**: Maps to attached_assets for static asset management.

**Environment Configuration**
- **Development**: Runs server with tsx for TypeScript execution and hot reloading.
- **Production**: Runs compiled JavaScript from the dist directory with NODE_ENV=production.