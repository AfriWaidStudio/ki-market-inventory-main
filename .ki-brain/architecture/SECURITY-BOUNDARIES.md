# Security Boundaries

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Overview

This document describes the security boundaries and protections in the KI Market Inventory application.

## Security Layers

### 1. Network Boundary

**Protection**: HTTPS, CORS, rate limiting

**Status**: ASSUMED

### 2. Authentication Boundary

**Protection**: Session management, password hashing, OAuth

**Status**: ACTIVE (Supabase) → IN PROGRESS (Prisma)

### 3. Authorization Boundary

**Protection**: Role-based access control, data ownership

**Status**: PARTIALLY IMPLEMENTED

### 4. Data Boundary

**Protection**: Database access controls, query validation

**Status**: IN PROGRESS

### 5. Input Boundary

**Protection**: Validation, sanitization

**Status**: ASSUMED

### 6. Output Boundary

**Protection**: Response filtering, error handling

**Status**: ASSUMED

## Authentication Security

### Current Implementation

**Status**: Supabase-managed

**Features**:
- Email/password authentication
- Google OAuth
- Session management via Supabase
- Email verification (configurable)

### Target Implementation

**Status**: Prisma-managed

**Requirements**:
- Secure password hashing (bcrypt/scrypt/argon2)
- Hashed session tokens
- Token expiration
- Invalidated on logout
- Server-side validation

## Authorization Model

### Roles

**Status**: PARTIALLY CONFIRMED

**Suspected Roles**:
- `user` - Regular user
- `admin` - Administrator

**Location**: `user_roles` table

### Data Ownership

**Requirement**: Every user-owned query must use authenticated ownership

**Implementation**:
- Session validates user
- User ID extracted from session
- Database queries filter by user ID

## Data Protection

### User Data Isolation

**Requirement**: CONFIRMED

From Constitution 07:
- Every user-owned query must use authenticated ownership
- Never trust frontend `userId`
- Never use hardcoded shared user
- Separate chats, wallet, history, activity, memory, files

### Secrets Management

**Requirement**: CONFIRMED

From Constitution 06:
- No secrets in Markdown
- No passwords in logs
- No tokens in logs
- Service keys in environment only

## Session Security

### Token Requirements

- Cryptographically random
- Hashed before storage
- Expiration support
- Invalidated on logout

### Current Sessions

**Location**: `auth_sessions` (Supabase)

### Target Sessions

**Location**: `sessions` (Prisma)

## Password Security

### Requirements

- Secure hashing (bcrypt/scrypt/argon2)
- Never stored in plain text
- Minimum length requirements
- Secure comparison

### Current Implementation

**Status**: Supabase handles

### Target Implementation

**Status**: To be implemented

## OAuth Security

### Current Flow

1. User clicks Google sign-in
2. Redirect to Google OAuth
3. Callback at `/auth/callback`
4. Exchange code for tokens
5. Create/update user
6. Create session

### Security Considerations

- State parameter validation
- PKCE (if applicable)
- Token storage
- Refresh token handling

## Input Validation

### Requirements

- Server-side validation
- Type checking
- Length limits
- Format validation

### Status**: ASSUMED

## Output Sanitization

### Requirements

- No sensitive data in responses
- Safe error messages
- No stack traces
- No internal IDs

### Status**: ASSUMED

## Exchange Connection Security

**From maiplan.md**:

### Credentials Storage

- Never store raw secrets in:
  - Local storage
  - Browser cookies
  - Frontend code
  - Client logs
  - Analytics events

### Backend Requirements

- Validate credentials
- Inspect permissions
- Reject dangerous permission sets
- Encrypt secrets before storing
- Store masked API-key identifier
- Record connection time
- Write audit log

### Forbidden Permissions

- Trade permission
- Withdrawal permission
- Transfer permission

## API Security

### Status**: PARTIALLY CONFIRMED

### Suspected Measures

- Authentication required
- Rate limiting
- Input validation
- Error handling

## Environment Secrets

### Required Secrets

| Variable | Location | Browser |
| -------- | -------- | ------- |
| DATABASE_URL | Server only | NO |
| SUPABASE_URL | Server/Client | YES |
| SUPABASE_ANON_KEY | Server/Client | YES |
| SUPABASE_SERVICE_ROLE_KEY | Server only | NO |
| OAuth client secrets | Server only | NO |

## Security Dependencies

### Dependencies Requiring Review

- Supabase client
- Prisma client
- OAuth providers
- Password hashing libraries

## Security Testing

**From maiplan.md Section 26**:

Must verify:
- User A cannot view User B's trades
- User A cannot update User B's trades
- User A cannot access User B's API connections
- User A cannot access User B's uploaded files
- Regular users cannot access admin routes
- Frontend cannot retrieve raw API secrets
- Service-role credentials never reach browser
- Dangerous exchange permissions are rejected
- Input validation blocks malformed data
- Rate limits protect sensitive endpoints

## Last Verified

2026-07-11

## Evidence

- `src/lib/auth/functions.ts`
- `src/lib/auth/core.server.ts`
- `prisma/schema.prisma`
- `src/lib/db/env.server.ts`
- Constitution files
- maiplan.md - Security sections