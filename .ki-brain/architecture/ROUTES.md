# Routes

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Confirmed Routes

| Route | File | Purpose | Status |
| ----- | ---- | ------- | ------ |
| `/` | `src/routes/index.tsx` | Landing page | ACTIVE |
| `/auth` | `src/routes/auth.tsx` | Sign in / Sign up page | ACTIVE |
| `/auth/callback` | `src/routes/auth/callback.tsx` | OAuth callback handler | ACTIVE |

## Route Details

### `/` - Landing Page

**File**: `src/routes/index.tsx`

**Component**: `src/components/LandingPage.tsx`

**Purpose**: Welcome page with feature overview

**Features Shown**:
- Opportunity Scanner
- Paper Trading
- Profit Analytics
- KI Intelligence
- Risk Management
- Trade Journal

**Status**: ACTIVE

### `/auth` - Authentication Page

**File**: `src/routes/auth.tsx`

**Purpose**: User sign in and sign up

**Features**:
- Email/password authentication
- Google OAuth sign-in
- Tab switching (Sign In / Sign Up)
- SMTP help text

**Status**: ACTIVE (Supabase-backed)

**Reference**: AGENTS.md - "Updated auth page with SMTP help text"

### `/auth/callback` - OAuth Callback

**File**: `src/routes/auth/callback.tsx`

**Purpose**: Handle OAuth callback from Google

**Flow**:
1. Receive callback from Google OAuth
2. Exchange authorization code for tokens
3. Create/update user in database
4. Create session
5. Redirect to dashboard

**Status**: ACTIVE

**Reference**: AGENTS.md - "Added OAuth callback route (`/auth/callback`)"

## Suspected Routes (Not Verified)

The following routes are suspected to exist based on maiplan.md but not verified:

| Route | Purpose | Status |
| ----- | ------- | ------ |
| `/dashboard` | Main dashboard | SUSPECTED |
| `/opportunities` | Opportunity scanner | SUSPECTED |
| `/paper-trade` | Paper trading | SUSPECTED |
| `/journal` | Trade journal | SUSPECTED |
| `/history` | Trade history | SUSPECTED |
| `/analytics` | Profit analytics | SUSPECTED |
| `/settings` | User settings | SUSPECTED |
| `/profile` | User profile | SUSPECTED |
| `/alerts` | Alert management | SUSPECTED |
| `/admin` | Admin panel | SUSPECTED |

## Route Protection

**Current**: Supabase session-based protection

**Target**: Session-based with Prisma

**Status**: To be implemented

## Route Naming Convention

Based on code analysis:
- File-based routing via Remix
- camelCase for file names
- Directory structure mirrors routes

## OAuth Configuration

**Provider**: Google

**Redirect URL**: `/auth/callback`

**Configuration Required**:
- Google Cloud Console: OAuth credentials
- Supabase: URL configuration
- Environment: OAuth client ID/secret

## API Routes (Suspected)

Not verified - likely exist at:
- `/api/v1/*` endpoints
- Various data endpoints

## Route Changes Policy

Do not remove routes without:
1. Owner approval
2. 404 or redirect replacement
3. Documentation update

## Last Verified

2026-07-11

## Evidence

- `src/routes/index.tsx` - Landing page
- `src/routes/auth.tsx` - Auth page
- `src/routes/auth/callback.tsx` - OAuth callback
- AGENTS.md - Recent changes