# User Data Isolation

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Core Principle

**Every user-owned query must use authenticated ownership.**

## Never Trust Frontend

Never trust:

- Frontend `userId` parameter
- Frontend session token
- Frontend user ID in URL
- Any user-provided identifier without server verification

Always:

- Verify session server-side
- Extract user from verified session
- Use server-side user ID for queries

## Never Use Hardcoded Shared User

Do not:

- Use a default or test user
- Use "user 1" as fallback
- Use a shared demo account
- Use placeholder user IDs

These create data leakage and security issues.

## Never Fall Back to First User

Never:

- Use the first user in database
- Use admin user as default
- Use any user as fallback
- Create "system user" for all operations

## Data Separation

All user data must be separated:

- Chats
- Wallet
- History
- Activity
- Memory
- Files
- Settings
- Preferences
- Sessions
- Tokens

Each user's data must be isolated from other users.

## Ownership Verification

Every query must:

1. Verify session is valid
2. Extract user ID from session
3. Use user ID in WHERE clause
4. Never expose other users' data

Example:

```typescript
// CORRECT
const userId = session.userId
const messages = await db.messages.findMany({
  where: { userId }
})

// WRONG - never do this
const messages = await db.messages.findMany()
```

## Testing User Data Isolation

Always test:

- User A cannot see User B's data
- User A cannot modify User B's data
- User A cannot delete User B's data
- Cross-user operations fail

## Admin Access

Admin access must:

- Be permission-controlled
- Be auditable
- Require additional verification
- Not be automatic
- Be documented

## Multi-Tenant Considerations

For multi-tenant features:

- Always verify tenant ownership
- Never assume tenant from context
- Use verified tenant ID
- Isolate tenant data
- Test tenant isolation

## Data Leak Prevention

Prevent leaks by:

- Never returning user IDs in responses without need
- Never exposing internal IDs
- Using UUIDs or opaque tokens
- Validating access before returning data
- Logging access attempts

## Audit Logging

For sensitive operations:

- Log user ID
- Log action
- Log timestamp
- Log success/failure
- Store logs securely

## Compliance

Ensure compliance with:

- GDPR
- CCPA
- Data protection laws
- Privacy regulations

## Emergency Access

Emergency access procedures:

- Require approval
- Log access
- Document reason
- Notify affected users
- Review access