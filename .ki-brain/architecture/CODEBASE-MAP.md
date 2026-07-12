# Codebase Map

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Root Directory Structure

| Directory | Purpose | Criticality | Status |
| --------- | ------- | ----------- | ------ |
| `src/` | Application source | CRITICAL | ACTIVE |
| `prisma/` | Database schema | HIGH | ACTIVE |
| `public/` | Static assets | MEDIUM | ACTIVE |
| `routes/` | Page routes | CRITICAL | ACTIVE |
| `lib/` | Shared libraries | HIGH | ACTIVE |
| `assets/` | Images, illustrations | LOW | ACTIVE |
| `components/` | React components | HIGH | ACTIVE |
| `hooks/` | React hooks | HIGH | ACTIVE |
| `services/` | External services | MEDIUM | ACTIVE |
| `config/` | Configuration | HIGH | ACTIVE |
| `scripts/` | Build scripts | MEDIUM | ACTIVE |

## src/ Directory Structure

### Routes (Page Endpoints)

| Directory/File | Purpose | Criticality |
| ---------------- | ------- | ----------- |
| `src/routes/index.tsx` | Landing page | CRITICAL |
| `src/routes/auth.tsx` | Auth page | CRITICAL |
| `src/routes/auth/callback.tsx` | OAuth callback | CRITICAL |

### Library (Shared Code)

| Directory | Purpose | Criticality |
| --------- | ------- | ----------- |
| `src/lib/auth/` | Authentication | CRITICAL |
| `src/lib/db/` | Database layer | HIGH |
| `src/lib/ui/` | UI utilities | MEDIUM |

### Components

| Directory/File | Purpose | Criticality |
| -------------- | ------- | ----------- |
| `src/components/LandingPage.tsx` | Landing page UI | HIGH |
| `src/components/AuthForm.tsx` | Auth form | HIGH |
| `src/components/App.tsx` | Main app | HIGH |

## lib/ Directory Structure

### Authentication (`src/lib/auth/`)

| File | Purpose | Status |
| ---- | ------- | ------ |
| `functions.ts` | Main auth functions | ACTIVE |
| `core.server.ts` | Core server logic | ACTIVE |
| `hooks.ts` | Auth hooks | SUSPECTED |
| `helpers.ts` | Auth helpers | SUSPECTED |

**Functions**:
- `register()` - User registration
- `login()` - User login
- `logout()` - User logout
- `resetPassword()` - Password reset
- `verifyEmail()` - Email verification

### Database (`src/lib/db/`)

| File | Purpose | Status |
| ---- | ------- | ------ |
| `prisma.server.ts` | Prisma client singleton | CREATED |
| `env.server.ts` | Environment validation | CREATED |
| `health.server.ts` | Database health check | CREATED |

## prisma/ Directory Structure

| File | Purpose | Status |
| ---- | ------- | ------ |
| `schema.prisma` | Database schema | CREATED |
| `migrations/` | Database migrations | EMPTY |

## Assets Directory

| File | Purpose | Status |
| ---- | ------- | ------ |
| `src/assets/illustrations/index.tsx` | SVG illustrations | CREATED |
| `scripts/generate-illustrations.cjs` | Image generation | CREATED |

## Important Paths

### Authentication

- `src/lib/auth/functions.ts` - Main auth functions (CRITICAL)
- `src/lib/auth/core.server.ts` - Core server logic (CRITICAL)
- `src/routes/auth.tsx` - Auth page (CRITICAL)
- `src/routes/auth/callback.tsx` - OAuth callback (CRITICAL)

### Database

- `prisma/schema.prisma` - Schema (HIGH)
- `src/lib/db/prisma.server.ts` - Client (HIGH)
- `src/lib/db/env.server.ts` - Validation (MEDIUM)
- `src/lib/db/health.server.ts` - Health check (MEDIUM)

### Components

- `src/components/LandingPage.tsx` - Landing page (HIGH)
- `src/components/AuthForm.tsx` - Auth form (HIGH)

## Do-Not-Edit-Without-Review Areas

| Area | Reason |
| ---- | ------ |
| `src/lib/auth/` | Authentication is critical |
| `prisma/schema.prisma` | Database schema affects all data |
| `src/routes/auth.tsx` | Auth routes are security-sensitive |
| `src/lib/db/` | Database layer is foundational |

## Entry Points

### Server

- `src/routes/auth.tsx` - Auth route handler
- `src/routes/index.tsx` - Landing page handler
- `src/lib/db/prisma.server.ts` - Database client

### Client

- `src/components/LandingPage.tsx` - Landing page component
- `src/lib/auth/core.server.ts` - Auth hooks
- `src/hooks/` - Data hooks

## Last Verified

2026-07-11

## Evidence

- Repository structure
- `src/routes/` files
- `src/lib/auth/` files
- `src/lib/db/` files
- `prisma/schema.prisma`