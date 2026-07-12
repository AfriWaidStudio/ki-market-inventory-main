# Databases

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Current Supabase Database Usage

**Status**: ACTIVE

### Purpose

- Primary application database
- Authentication tables
- User data storage
- Session management

### Connection

- Supabase project configured
- Connection via Supabase client
- Tables: `app_users`, `auth_sessions`, `auth_identities`, `password_reset_tokens`, `profiles`, `user_roles`

### Access

- Via Supabase client (`@supabase/supabase-js`)
- Real-time subscriptions enabled
- Row Level Security (RLS) policies

## Target Independent Auth Database

**Status**: IN PROGRESS

### Purpose

- Custom authentication only
- User accounts
- Sessions
- OAuth identities
- Password resets

### Connection

- PostgreSQL database
- Connection via Prisma ORM
- DATABASE_URL required

### Tables (Prisma Models)

| Model | Purpose | Status |
| ----- | ------- | ------ |
| User | User accounts | CREATED |
| Session | Session management | CREATED |
| AuthIdentity | OAuth identities | CREATED |
| PasswordResetToken | Password reset | CREATED |
| UserRole | Role assignments | CREATED |

### Location

- Schema: `prisma/schema.prisma`
- Migrations: `prisma/migrations/` (not yet created)
- Client: `src/lib/db/prisma.server.ts`

## Application Database (Unknown)

**Status**: PARTIALLY CONFIRMED

### Suspected Tables (from maiplan.md)

- `market_inventory_profiles`
- `market_inventory_accounts`
- `market_inventory_trades`
- `market_inventory_trade_events`
- `market_inventory_trade_fees`
- `market_inventory_trade_notes`
- `market_inventory_opportunities`
- `market_inventory_price_snapshots`
- `market_inventory_exchange_connections`
- `market_inventory_exchange_transactions`
- `market_inventory_sync_runs`
- `market_inventory_transaction_matches`
- `market_inventory_capital_ledger`
- `market_inventory_merchants`
- `market_inventory_alerts`
- `market_inventory_daily_reports`
- `market_inventory_weekly_reports`
- `market_inventory_ai_insights`
- `market_inventory_audit_logs`

### Status

- Not yet created
- Not yet verified
- Schema to be defined

## Migration Ownership

**Owner**: Current workstream

### Responsibilities

- Create migrations
- Test migrations
- Document rollback
- Verify data integrity

### Migration Location

`prisma/migrations/`

### Migration Name

`init_custom_auth`

## Data Ownership Boundaries

### Auth Database

- User credentials
- Password hashes
- Session tokens
- OAuth tokens (access/refresh)
- Password reset tokens

### Application Database

- User-created data
- Transactions
- Inventory
- Settings
- Chat history
- Wallet data

## DATABASE_URL Requirements

### Format

```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

### Security

- Must not be exposed to browser
- Must not be committed to git
- Must be in environment only
- Use SSL in production

### Validation

- `src/lib/db/env.server.ts` validates DATABASE_URL
- Checks for required format
- Confirms not empty

## Connection Status

| Database | Connected | Status |
| -------- | --------- | ------ |
| Supabase | YES | ACTIVE |
| Custom Auth | NO | PENDING DATABASE_URL |

## Last Verified

2026-07-11

## Evidence

- `prisma/schema.prisma` - Schema
- `src/lib/db/env.server.ts` - Validation
- `src/lib/db/prisma.server.ts` - Client
- `maiplan.md` - Required tables
- AGENTS.md - Recent changes