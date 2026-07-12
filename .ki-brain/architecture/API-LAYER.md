# API Layer

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Overview

This document describes the API layer architecture for KI Market Inventory.

## Current API State

**Status**: PARTIALLY CONFIRMED

### Confirmed Elements

- Auth functions in `src/lib/auth/functions.ts`
- Supabase client usage
- OAuth callback at `/auth/callback`

### Suspected Elements

- API routes under `/api/`
- Versioned API endpoints
- Data fetching patterns

## API Components

### Authentication API

**Location**: `src/lib/auth/functions.ts`

**Functions**:
- `register()` - User registration
- `login()` - User login
- `logout()` - User logout
- `resetPassword()` - Password reset
- `verifyEmail()` - Email verification

**Status**: ACTIVE (Supabase-backed)

**Target**: Prisma-backed

### Database API

**Location**: `src/lib/db/`

**Components**:
- `prisma.server.ts` - Prisma client
- `env.server.ts` - Environment validation
- `health.server.ts` - Health check

**Status**: IN PROGRESS (Prisma foundation)

## Required API Areas (from maiplan.md)

### API Endpoint Requirements

Create versioned APIs for:

| Endpoint | Purpose |
| -------- | ------- |
| `/api/v1/profile` | User profile |
| `/api/v1/dashboard` | Dashboard data |
| `/api/v1/opportunities` | Opportunity scanner |
| `/api/v1/paper-trades` | Paper trading |
| `/api/v1/manual-trades` | Manual trade tracking |
| `/api/v1/trade-updates` | Trade modifications |
| `/api/v1/trade-closing` | Close trades |
| `/api/v1/trade-history` | History view |
| `/api/v1/exchange-connections` | Exchange integration |
| `/api/v1/exchange-sync` | Sync operations |
| `/api/v1/imported-transactions` | Imported data |
| `/api/v1/matching` | Transaction matching |
| `/api/v1/analytics` | Analytics data |
| `/api/v1/reports` | Report generation |
| `/api/v1/alerts` | Alert management |
| `/api/v1/merchants` | Merchant tracking |
| `/api/v1/ki-chat` | AI chat |
| `/api/v1/admin` | Admin operations |

### API Format

```text
/api/v1/market-inventory/...
```

### Controller Pattern

Controllers should remain thin. Business rules belong in services and domain modules.

## API Contracts

### register()

```typescript
register({
  email: string,
  password: string,
  displayName?: string
})
```

**Response**:
```typescript
{
  user: { id: string, email: string, displayName?: string },
  session: { token: string, expiresAt: string }
}
```

### login()

```typescript
login({
  email: string,
  password: string
})
```

**Response**:
```typescript
{
  user: { id: string, email: string },
  session: { token: string, expiresAt: string }
}
```

## Data Fetching Patterns

### Suspected: TanStack Query (React Query)

**Purpose**:
- Server state management
- Caching
- Background updates
- Pagination

### Server-Side

- Remix loaders
- Server actions
- Direct database queries

## Exchange API Integration

### Required Endpoints

From maiplan.md:

- Exchange data import
- Balance retrieval
- Transaction history
- P2P order data
- Price data

### Security

- Read-only credentials only
- IP restrictions
- Key rotation support

## API Security

### Authentication

All API endpoints require:
- Valid session token
- Server-side validation
- User ownership verification

### Rate Limiting

Required for:
- Login attempts
- Password reset
- Exchange API calls
- Report generation

## API Documentation

**Status**: NOT STARTED

Will require:
- OpenAPI/Swagger spec
- Endpoint documentation
- Request/response schemas

## Last Verified

2026-07-11

## Evidence

- `src/lib/auth/functions.ts`
- `src/lib/db/`
- maiplan.md - API requirements
- AGENTS.md - Recent changes