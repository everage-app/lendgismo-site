# Vixo V3 - Lendgismo Asset-Based Lender Platform

## Overview

Vixo V3 is a modern, dark-themed marketing website for Lendgismo's asset-based lender platform codebase. The application is built as a two-page website consisting of a landing page and an overview page, designed to sell a $150,000 perpetual license for production-ready lender platform code. The site features a sleek, professional design with a comprehensive UI component library and is optimized for lead capture through integrated forms.

## Recent Changes (October 1, 2025)

### Landing Page Enhancements
- **Testimonials Section**: Added customer success stories section with 3 testimonial cards featuring quotes, author details with company avatars, and a stats bar displaying enterprise metrics (12+ customers, $50M+ loans processed, 4.9/5 rating)
- **FAQ Section**: Implemented comprehensive FAQ accordion with 7 Q&A items covering licensing, customization, tech stack, implementation timeline, support, deployment, and compliance. Includes "Get in Touch" CTA linking to contact form
- **Video Demo in Hero**: Enhanced hero section with interactive video demo mockup featuring play button overlay on hover and "Watch demo" CTA button

### Overview Page Enhancements
- **Enhanced Gallery Screenshots**: Upgraded gallery mockups from simple gradients to realistic browser screenshots with:
  - Browser chrome with traffic light buttons (red/yellow/green dots)
  - Header areas with logo placeholders and action buttons
  - Content areas showing charts/data visualization for dashboards
  - Data rows/tables for onboarding and RBAC screens
  - Gradient overlays for depth

### Accessibility Improvements
- Added `aria-label` attributes to video demo play buttons
- Implemented `.sr-only` utility class for screen reader accessible text
- Marked decorative SVG icons as `aria-hidden="true"`
- Ensured WCAG 2.1 Level AA compliance for interactive elements

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