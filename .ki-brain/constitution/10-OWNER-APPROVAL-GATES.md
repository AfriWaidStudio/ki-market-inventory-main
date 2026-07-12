# Owner Approval Gates

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Core Principle

**Explicit owner approval is required before certain operations.**

## Approval Required Operations

### Code Deletion

Deleting code requires:

- Owner approval
- Deletion approval template filled
- Rollback instructions documented

### Database Data Operations

Operations requiring approval:

- `DROP TABLE`
- `TRUNCATE`
- `DELETE FROM` (production or shared data)
- `prisma migrate reset`
- `supabase db reset`
- Force sync

### Authentication Architecture

Changes to auth require:

- Owner approval
- Security review
- Migration plan
- Rollback plan

### Payment Behavior

- Changing rates
- Adding fees
- Removing refunds
- Changing billing

### Wallet Balances

- Modifying balances
- Adding/removing coins
- Changing conversions
- Adjusting limits

### Role Permissions

- Adding/removing roles
- Changing permissions
- Modifying access levels
- Granting admin rights

### Security Controls

- Disabling security
- Weakening validation
- Removing auth checks
- Bypassing verification

### Secrets Rotation

- API keys
- Service keys
- Database passwords
- Tokens

### Production Migration

- Data migration
- Schema changes
- User data changes
- External service migration

### Public API Changes

- Removing endpoints
- Changing response format
- Breaking changes
- Deprecating features

### Contract Breaking

- API changes
- Database changes
- Route changes
- Export changes

## Approval Template

```
Item: [what is being changed/deleted]
File: [full path]
Reason: [why this change is needed]
Dependencies: [what depends on this]
Risk: [security/data/functionality risk]
Replacement: [what replaces it, if anything]
Rollback: [how to undo this change]
Owner approval: [owner name and confirmation]
Date: [YYYY-MM-DD]
```

## Approval Process

1. Document the change
2. Assess risks
3. Plan rollback
4. Get owner approval
5. Implement with approval
6. Verify result
7. Update Brain

## Emergency Approval

For security emergencies:

1. Document the emergency
2. Make minimal necessary change
3. Notify owner immediately
4. Document post-mortem

## Approval Tracking

All approvals must be:

- Documented in Brain
- Linked to decision records
- Available for audit
- Time-stamped

## No Implicit Approval

Silence is NOT approval.

Explicit approval required for:

- Destructive operations
- Security changes
- Data changes
- Auth changes
- Public API changes

## Self-Approval Prohibited

Agents must not approve their own destructive changes.

Human owner approval required for:

- Code deletion
- Data removal
- Auth changes
- Security changes

## Approval Evidence

Record approval as:

```
Owner approval:
- Owner: @username
- Date: YYYY-MM-DD
- Method: [direct instruction/document]
- Scope: [specific change]
- Conditions: [any conditions]
```