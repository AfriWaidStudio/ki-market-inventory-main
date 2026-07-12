# Authentication

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Current Auth Implementation

**Status**: Supabase-backed custom tables and session functions

### Components

| Component | Location | Purpose | Status |
| --------- | -------- | ------- | ------ |
| Auth Functions | `src/lib/auth/functions.ts` | Main auth operations | ACTIVE |
| Core Server | `src/lib/auth/core.server.ts` | Session management | ACTIVE |
| Auth Page | `src/routes/auth.tsx` | Sign in/Sign up UI | ACTIVE |
| OAuth Callback | `src/routes/auth/callback.tsx` | Google OAuth handler | ACTIVE |

### Database Tables (Supabase)

| Table | Purpose | Status |
| ----- | ------- | ------ |
| `app_users` | User accounts | ACTIVE |
| `auth_sessions` | Session tokens | ACTIVE |
| `auth_identities` | OAuth identities | ACTIVE |
| `password_reset_tokens` | Password reset | ACTIVE |
| `profiles` | User profiles | ACTIVE |
| `user_roles` | Role assignments | ACTIVE |

## Target Auth Implementation

**Status**: Independent PostgreSQL with Prisma - FOUNDATION IN PROGRESS

### Components

| Component | Location | Purpose | Status |
| --------- | -------- | ------- | ------ |
| Prisma Schema | `prisma/schema.prisma` | Database schema | CREATED |
| Prisma Client | `src/lib/db/prisma.server.ts` | Database client | CREATED |
| Env Validation | `src/lib/db/env.server.ts` | Environment check | CREATED |
| Health Check | `src/lib/db/health.server.ts` | Database health | CREATED |

### Models (Prisma Schema)

| Model | Purpose | Status |
| ----- | ------- | ------ |
| User | User accounts | CREATED |
| Session | Session management | CREATED |
| AuthIdentity | OAuth identities | CREATED |
| PasswordResetToken | Password reset | CREATED |
| UserRole | Role assignments | CREATED |

## Migration Status

| Component | Status |
| --------- | ------ |
| Prisma schema | CREATED |
| Prisma client | CREATED |
| Database connection | PENDING (needs DATABASE_URL) |
| Registration migration | NOT STARTED |
| Login migration | NOT STARTED |
| Email verification | DEFERRED |

## No-Delete Requirement

**Active**

From AGENTS.md: "Do not delete anything"

- Do not delete existing Supabase auth code
- Do not remove existing routes
- Comment out code when needed with standard format

## Frontend Payload Compatibility

Must be preserved:

### register()

```typescript
register({
  email: string,
  password: string,
  displayName?: string
})
```

### login()

```typescript
login({
  email: string,
  password: string
})
```

## Email Verification Status

**DEFERRED**

Per AGENTS.md: "without enabling email verification until registration and login work correctly"

### Testing

To disable for testing:
- Supabase Dashboard → Authentication → Settings → Email
- Uncheck "Confirm email" requirement

### Production

To enable in production:
- Configure SMTP (Mailtrap, Resend, Postmark)
- Supabase Dashboard → Authentication → SMTP

## Session Management

### Current Implementation

**Status**: Supabase sessions

### Target Implementation

**Status**: Prisma sessions with hashed tokens

### Requirements

- Cryptographically random tokens
- Hashed before storage
- Expiration support
- Invalidated on logout
- Server-side validation

## Password Requirements

- Secure hashing (bcrypt/scrypt/argon2)
- Never stored in plain text
- Minimum length requirements
- Secure comparison

## OAuth Flow

1. User clicks Google sign-in
2. Redirect to Google OAuth
3. Callback at `/auth/callback`
4. Exchange code for tokens
5. Create/update user in database
6. Create session
7. Redirect to app

## Security Considerations

- Email verification deferred for testing
- OAuth requires redirect URL configuration
- Supabase service role key must be server-side only
- All secrets must be in environment variables

## Next Steps

1. Receive DATABASE_URL from owner
2. Run `prisma validate`
3. Run `prisma migrate dev --name init_custom_auth`
4. Connect registration function to Prisma
5. Connect login function to Prisma
6. Test authentication flow

## Evidence

- `src/lib/auth/functions.ts` - Current auth functions
- `prisma/schema.prisma` - New schema
- `src/lib/db/prisma.server.ts` - New client
- AGENTS.md - Recent changes and instructions