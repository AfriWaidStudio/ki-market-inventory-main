# Technical Debt

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Debt Template

```
Debt ID:
Area:
Description:
Evidence:
Risk:
Urgency:
Dependencies:
Suggested resolution:
Owner approval required:
Status:
```

## Technical Debt Items

### Debt 1: Supabase Authentication Dependency

**Debt ID**: DEBT-001

**Area**: Authentication

**Description**: Application currently uses Supabase for authentication. Plan to migrate to independent PostgreSQL with Prisma while preserving existing code.

**Evidence**: 
- `src/lib/auth/functions.ts` uses Supabase
- Auth routes use Supabase
- Tables: `app_users`, `auth_sessions`, etc. in Supabase

**Risk**: MEDIUM - Dependency on external service, but migration in progress

**Urgency**: MEDIUM - Planned migration, foundation started

**Dependencies**: 
- DATABASE_URL configured
- Database migrations complete
- Registration/login connected

**Suggested resolution**: Complete Prisma migration after foundation stage

**Owner approval required**: No - planned work

**Status**: IN PROGRESS

---

### Debt 2: TypeScript Deprecation Warnings

**Debt ID**: DEBT-002

**Area**: Build

**Description**: Pre-existing TypeScript deprecation warnings in various files.

**Evidence**: Build passes with deprecation warnings

**Risk**: LOW - Warnings, not errors, don't affect functionality

**Urgency**: LOW - Cosmetic, not blocking

**Dependencies**: None

**Suggested resolution**: Address in separate cleanup work

**Owner approval required**: No

**Status**: KNOWN

---

### Debt 3: Vite Plugin Peer Dependency

**Debt ID**: DEBT-003

**Area**: Build

**Description**: vite-tsconfig-paths plugin has peer dependency warning.

**Evidence**: Warning during build, build still succeeds

**Risk**: LOW - Build works, just a warning

**Urgency**: LOW - Not blocking

**Dependencies**: None

**Suggested resolution**: Update plugin or address in separate work

**Owner approval required**: No

**Status**: KNOWN

---

### Debt 4: DATABASE_URL Not Configured

**Debt ID**: DEBT-004

**Area**: Database

**Description**: DATABASE_URL must be provided for custom auth database connection.

**Evidence**: `src/lib/db/env.server.ts` expects DATABASE_URL

**Risk**: CRITICAL - Blocks all custom auth work

**Urgency**: CRITICAL - Required to proceed

**Dependencies**: Owner provides DATABASE_URL

**Suggested resolution**: Owner provides DATABASE_URL for independent PostgreSQL

**Owner approval required**: N/A - Configuration needed from owner

**Status**: BLOCKED

---

### Debt 5: Full Application Database Schema Unknown

**Debt ID**: DEBT-005

**Area**: Database

**Description**: Complete database schema for main application (trades, wallets, analytics) not yet documented.

**Evidence**: maiplan.md lists required tables but schema not created

**Risk**: LOW - Main focus is auth migration

**Urgency**: MEDIUM - Needed for full implementation

**Dependencies**: Auth migration complete

**Suggested resolution**: Create schema based on maiplan.md requirements

**Owner approval required**: No

**Status**: PLANNED

---

## Debt Management

### Adding New Debt

1. Assign unique ID
2. Document area
3. Describe the debt
4. Assess risk and urgency
5. Propose resolution
6. Get owner input if major

### Resolving Debt

1. Review debt item
2. Plan resolution
3. Get approval if needed
4. Implement fix
5. Remove from debt list
6. Update Brain

### Debt Status Labels

- KNOWN - Identified but not prioritized
- PLANNED - Scheduled for resolution
- BLOCKED - Cannot proceed
- IN PROGRESS - Being worked on
- RESOLVED - Fixed and removed
- WONT FIX - Not worth fixing

## Last Updated

2026-07-11