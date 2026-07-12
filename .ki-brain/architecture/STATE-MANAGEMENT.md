# State Management

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Overview

This document describes the state management patterns used in the KI Market Inventory application.

## Verified State Management

### Session State

**Location**: `src/lib/auth/core.server.ts`

**Purpose**: 
- User authentication state
- Session token management
- Login/logout state

**Status**: ACTIVE (Supabase-backed)

**Target**: Prisma-backed sessions

### Form State

**Location**: `src/components/AuthForm.tsx`

**Purpose**:
- Email/password input
- Sign in / Sign up tab switching
- Validation state
- Loading state

**Status**: ACTIVE

## Suspected State Management

### Client-Side State

**Suspect**: TanStack Query (React Query)

**Evidence**: Common in Remix/TanStack projects

**Purpose**: 
- Server state management
- Caching
- Background updates
- Pagination

### React State

**Purpose**:
- UI state
- Form state
- Component state

### Realtime State

**Suspect**: Supabase Realtime or Socket.IO

**Evidence**: maiplan.md mentions realtime workflow

**Purpose**:
- Opportunity updates
- Trade status changes
- Dashboard updates

## Session Management

### Current Implementation

**Status**: Supabase sessions

**Location**: `src/lib/auth/core.server.ts`

**Features**:
- Session token generation
- Database storage
- Expiration handling
- Validation

### Target Implementation

**Status**: Prisma sessions

**Location**: `src/lib/db/prisma.server.ts`

**Requirements**:
- Cryptographically random tokens
- Hashed before storage
- Expiration support
- Invalidated on logout

## Application State Categories

### User State

- Profile data
- Preferences
- Risk profile
- Notification settings

### Trade State

- Active trades
- Paper trades
- Closed trades
- Trade events
- Trade fees

### Exchange State

- Connected exchanges
- Sync status
- Transaction imports
- Permission status

### Analytics State

- Profit calculations
- Route performance
- Exchange performance
- Behavioral insights

## State Isolation

### Per-User State

Must be isolated:
- Wallet data
- History
- Journal
- Settings
- Chats
- Memory

### Session State

- Session token
- User ID
- Permissions
- Preferences

## Data Flow Patterns

### Server-Side

1. Request received
2. Session validated
3. User authenticated
4. Data fetched from database
5. Response returned

### Client-Side

1. UI interaction
2. API call
3. State update
4. UI re-render

## Last Verified

2026-07-11

## Evidence

- `src/lib/auth/core.server.ts`
- `src/components/AuthForm.tsx`
- `src/components/LandingPage.tsx`
- maiplan.md - Realtime workflow