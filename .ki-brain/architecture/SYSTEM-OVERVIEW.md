# System Overview

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## System Purpose

**KI Market Inventory** is a tracking, analysis, paper-trading, journaling, and read-only intelligence system for cryptocurrency trading.

### Core Mission

Help users track P2P and arbitrage activities, compare market opportunities, record simulated or real-world user-confirmed trades, connect exchanges through read-only access, analyze inflows and outflows, calculate actual profit and loss, and communicate with Konsmik Intelligence through natural conversation.

### Key Constraints

- **NEVER execute real trades**
- **NEVER request withdrawal permissions**
- **NEVER request trading permissions**
- **NEVER release P2P assets**
- **Never simulate success using fake backend responses**

## Runtime Boundaries

### Frontend Boundary

- **Framework**: Remix (React-based)
- **Build**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS (suspected)
- **Deployment**: Vercel (suspected)

### Server Boundary

- **Runtime**: Node.js
- **Framework**: Remix server-side functions
- **Authentication**: Supabase (current) → Prisma (target)
- **Database**: Supabase PostgreSQL (current) → PostgreSQL (target for auth)

### Database Systems

| System | Purpose | Status |
| ------ | ------- | ------ |
| Supabase | Primary database | ACTIVE |
| PostgreSQL (custom) | Auth database | IN PROGRESS |

## External Services

| Service | Purpose | Status |
| ------- | ------- | ------ |
| Supabase | Auth, database, realtime | ACTIVE |
| Google OAuth | Authentication | ACTIVE |
| Binance | Exchange sync | IN PROGRESS |
| Bybit | Exchange sync | IN PROGRESS |
| Konsmik AI | Intelligent assistance | PLANNED |

## Authentication Boundary

**Current**: Supabase-backed custom tables

- Tables: `app_users`, `auth_sessions`, `auth_identities`, `password_reset_tokens`
- Email/password + Google OAuth
- Session management via Supabase

**Target**: Independent PostgreSQL with Prisma

- Schema in `prisma/schema.prisma`
- Client in `src/lib/db/prisma.server.ts`
- DATABASE_URL required

**Migration Status**: Foundation in progress

## Exchange Integration Boundary

### Supported Exchanges

- **Binance** - Read-only sync (IN PROGRESS)
- **Bybit** - Read-only sync (IN PROGRESS)
- **OKX** - Supported (maiplan.md)
- **KuCoin** - Supported (maiplan.md)
- **Bitget** - Supported (maiplan.md)

### Read-Only Requirements

- Wallet balances
- Deposits
- Withdrawals
- Internal transfers
- Spot transactions
- P2P order history

### Forbidden Permissions

- Trade permission
- Withdrawal permission
- Transfer permission

## Deployment Boundary

**Current**: Local development

**Target**: Vercel (suspected based on AGENTS.md)

### Required Environment Variables

- DATABASE_URL (new auth database)
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- OAuth client credentials

## Unknown Areas

- Full API surface
- Complete exchange integration details
- Analytics implementation
- AI chat integration
- Background job system
- Realtime updates mechanism

## Last Verified

2026-07-11

## Evidence

- `maiplan.md` - Full requirements
- AGENTS.md - Recent changes
- `src/routes/` - Route files
- `src/lib/auth/` - Auth code
- `prisma/schema.prisma` - Database schema