# No Delete Rule

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Core Principle

**Nothing may be permanently deleted without explicit owner approval.**

This applies to:
- Files
- Folders
- Functions
- Components
- Routes
- API endpoints
- Database fields
- Database tables
- Middleware
- Hooks
- Context
- Provider
- Services
- Utilities
- Tests
- Features
- Configuration
- Environment variables
- Packages
- Dependencies

## Safe Change Protocol

When code appears outdated, broken, duplicated, unused, or unsafe:

1. **Never delete** - Mark as candidate for review
2. **Comment out** with the standard format:

```typescript
// COMMENTED BY KI MATRIX AGENT
// Date: YYYY-MM-DD
// Reason: [brief reason]
// Previous behavior: [what was happening]
// Replacement: [planned replacement or "none yet"]
// Dependencies checked: [what was verified]
// Rollback instructions: [how to restore]
// Owner approval: [pending/approved by @name]
```

## Forbidden Operations

These operations require explicit owner approval:

```text
DELETE FROM
DROP TABLE
DROP COLUMN
TRUNCATE
DROP INDEX
ALTER TABLE ... DROP COLUMN
ALTER TABLE ... DROP CONSTRAINT
DROP FUNCTION
DROP TRIGGER
DROP DATABASE
DROP SCHEMA
```

## Database Operations

**NEVER** perform these without explicit approval:

- `DROP TABLE`
- `TRUNCATE`
- `DELETE FROM` (on production or shared data)
- `prisma migrate reset`
- `supabase db reset`
- Force sync

## Dependency Removal

Package removal requires approval:

- Removing runtime dependencies
- Removing dev dependencies
- Removing peer dependencies

## Route Removal

Route file removal requires approval:

- Page routes
- API routes
- Server hooks

## Deletion Approval Template

When deletion is requested, use this template:

```
Item: [what is being deleted]
File: [full path]
Reason: [why it should be deleted]
Dependencies: [what depends on this]
Risk: [what could break]
Replacement: [what replaces it, if anything]
Rollback: [how to undo]
Owner approval: [owner name and confirmation]
```

## Candidate for Review

When an item is identified as potentially removable but not yet approved:

```text
Candidate for review: [file/function/component]
Status: [outdated/broken/duplicated/unsafe]
Owner decision needed: [yes]
```

## Emergency Situations

In true emergencies (security vulnerability, data breach), the owner may approve immediate deletion. Document the decision afterward.

## Archive Instead of Delete

For historical preservation:

- Move to `archive/` folder
- Keep git history
- Update imports to 404 or error component
- Document the archive reason

## Verification Requirement

After any deletion:

1. Run build
2. Run tests
3. Verify no runtime errors
4. Update Brain documentation if needed

## This Rule Cannot Be Overridden

This rule takes precedence over:

- Convenience
- Performance improvements
- Code cleanup
- Refactoring
- Bug fixes (unless critical security)

All changes must work with the existing codebase.