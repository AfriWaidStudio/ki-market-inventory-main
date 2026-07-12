# Current Blockers

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: None

## Blocker 1: Missing DATABASE_URL

**Blocker ID**: BLOCK-001

**Description**: Independent DATABASE_URL is not yet configured for the custom authentication PostgreSQL database.

**Affected area**: 
- Prisma database connection
- Database migrations
- Custom authentication implementation
- Registration/Login migration

**Evidence**: 
- `src/lib/db/env.server.ts` expects DATABASE_URL but it is not set
- `prisma/schema.prisma` requires database connection
- No `.env` file with DATABASE_URL present in repository
- AGENTS.md instructs: "Updated `.env` with proper Supabase credentials"

**Severity**: CRITICAL

**Workaround**: None - database connection is required for all auth migration work

**Required decision**: Provide DATABASE_URL for independent PostgreSQL database

**Owner**: Owner of repository

**Status**: BLOCKED

---

## Blocker 2: Email Verification Configuration

**Blocker ID**: BLOCK-002

**Description**: Email verification is currently enabled in Supabase by default, which may prevent testing.

**Affected area**: 
- User registration flow
- Email confirmation
- User activation

**Evidence**: 
- AGENTS.md: "Supabase's default email provider has low rate limits and may not deliver emails properly. Email confirmation is enabled by default."
- AGENTS.md: "For Testing: Uncheck 'Confirm email' requirement"

**Severity**: MEDIUM

**Workaround**: Disable email verification in Supabase Dashboard for testing

**Required decision**: Disable email verification if needed for testing

**Owner**: Owner of repository / Supabase Dashboard access

**Status**: PENDING ACTION

---

## Blocker 3: No-Delete Requirement

**Blocker ID**: BLOCK-003

**Description**: Cannot delete existing Supabase authentication code or routes.

**Affected area**: 
- All existing auth code
- All existing routes
- All existing middleware

**Evidence**: 
- AGENTS.md instruction: "Do not delete anything"
- Constitution 01-NO-DELETE-RULE.md

**Severity**: INFORMATIONAL

**Workaround**: Comment out code with standard format when needed

**Required decision**: None - this is a constraint

**Owner**: Owner of repository

**Status**: CONSTRAINT

---

## Summary

| Blocker ID | Description | Severity | Status |
| ---------- | ----------- | -------- | ------ |
| BLOCK-001 | Missing DATABASE_URL | CRITICAL | BLOCKED |
| BLOCK-002 | Email verification | MEDIUM | PENDING |
| BLOCK-003 | No-deletion requirement | INFO | CONSTRAINT |

**Primary blocker**: BLOCK-001 - DATABASE_URL must be provided to proceed with custom auth foundation.