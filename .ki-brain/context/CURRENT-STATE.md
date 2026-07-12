# Current State

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: None

## Project Identity

**Repository**: KI Market Inventory  
**Type**: TypeScript React application  
**Framework**: Remix  
**Build Tool**: Vite  
**Package Manager**: npm  
**Database**: Supabase (current), PostgreSQL (target for custom auth)

## Confirmed Stack

### Frontend

- React 18
- TypeScript
- Remix framework
- Tailwind CSS (suspected)

### Backend

- Remix server-side functions
- Supabase client (@supabase/supabase-js)
- Custom auth functions
- Prisma 5.x (recently added)

### Database

- Supabase PostgreSQL (primary)
- Tables: `app_users`, `auth_sessions`, `auth_identities`, `password_reset_tokens`, `profiles`, `user_roles`
- Target: Independent PostgreSQL for custom auth

### Build Tools

- Vite
- TypeScript
- Prisma 5.22.0 (CLI)
- @prisma/client 7.8.0

## Confirmed Working Features

- Landing page at `/` (src/routes/index.tsx)
- Auth page at `/auth` (src/routes/auth.tsx)
- OAuth callback at `/auth/callback` (src/routes/auth/callback.tsx)
- Supabase authentication functions
- Custom auth service created (src/lib/auth/)
- SVG illustrations for landing page
- Exchange synchronization for Binance and Bybit
- Pagination on history and journal pages
- Settings page with sync status display

## Confirmed Broken Features

- None confirmed

## Current Authentication State

**Status**: Supabase-backed custom tables

### Current Implementation

- `src/lib/auth/functions.ts` - Main auth functions (register, login, etc.)
- `src/lib/auth/core.server.ts` - Core server logic
- Tables: `app_users`, `auth_sessions`, `auth_identities`, `password_reset_tokens`
- Email verification enabled by default (may need to be disabled for testing)
- Google OAuth configured at `/auth/callback`

### Target Implementation

- Independent PostgreSQL with Prisma
- `prisma/schema.prisma` - Created
- `src/lib/db/prisma.server.ts` - Created
- DATABASE_URL required but not configured

### Email Verification

**Status**: DISABLED FOR TESTING (per AGENTS.md)

Go to Supabase Dashboard → Authentication → Settings → Email
Uncheck "Confirm email" requirement

## Current Database State

**Status**: Supabase active, custom auth in progress

### Supabase Database

- Connection: Active
- Tables: app_users, auth_sessions, auth_identities, password_reset_tokens, profiles, user_roles
- Used by: All current auth functions

### Custom Auth Database (Prisma)

**Status**: FOUNDATION IN PROGRESS

- Schema created: `prisma/schema.prisma`
- Client created: `src/lib/db/prisma.server.ts`
- Environment validation: `src/lib/db/env.server.ts`
- Health check: `src/lib/db/health.server.ts`
- DATABASE_URL: NOT YET CONFIGURED
- Migrations: NOT YET APPLIED

## Current Deployment State

**Status**: LOCAL DEVELOPMENT

- Local development environment
- Supabase project connected
- Build passes (with pre-existing deprecation warnings)
- Vercel deployment ready

## Recent Changes (from AGENTS.md)

- Added exchange synchronization for Binance and Bybit
- Added pagination to history and journal pages
- Updated settings page with sync status display
- Added schema compatibility for pre/post-migration databases
- Updated auth page with SMTP help text
- Created custom auth service (`src/lib/auth/`) with hooks and helpers
- Added landing page with SVG illustrations
- Added OAuth callback route (`/auth/callback`)
- Updated `.env` with proper Supabase credentials

## Evidence

```
Confirmed from code:
- src/routes/index.tsx - Landing page
- src/routes/auth.tsx - Auth page  
- src/routes/auth/callback.tsx - OAuth callback
- src/lib/auth/functions.ts - Supabase auth functions
- prisma/schema.prisma - New Prisma schema
- src/lib/db/prisma.server.ts - Prisma client
- package.json - Dependencies including Prisma 5.x
- AGENTS.md - Recent changes documentation
- maiplan.md - Full workflow requirements
```

## Unknowns

- Test framework (Vitest suspected)
- Full API surface
- All exchange integration details
- Complete database schema for main application
- Analytics implementation details

## Last Verification

2026-07-11

Verified against: Current repository state, package.json, prisma/schema.prisma, src/lib/db/, src/lib/auth/, src/routes/, AGENTS.md, maiplan.md

## Maintainer

KI Matrix Brain system