# Preserve Contracts

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Core Principle

**Never break existing contracts without explicit approval.**

## What Is a Contract

A contract is an implicit or explicit agreement about:

- Data format
- Interface shape
- Behavior expectations
- Error handling
- Timing

## API Request Contracts

Do not change:

- Required fields
- Field types
- Field names
- Request structure
- Validation rules

If a change is needed:

1. Document the new contract
2. Support both old and new
3. Deprecate old contract with timeline
4. Get owner approval for removal

## API Response Contracts

Do not change:

- Response structure
- Field names
- Status codes
- Error format
- Data types

Breaking changes require:

- Version bump
- Owner approval
- Migration plan

## Database Contracts

Do not change:

- Table names
- Column names
- Column types
- Primary keys
- Foreign keys
- Constraints
- Indexes

Database changes require:

- Migration file
- Owner approval
- Rollback plan

## Component Props

Do not change:

- Prop names
- Prop types
- Required vs optional
- Default values
- Prop structure

If changes are needed:

- Support both versions
- Add new props, don't rename
- Deprecate old props
- Document migration path

## Event Payloads

Do not change:

- Event names
- Payload structure
- Field names
- Types

## Environment Variables

Do not change:

- Variable names
- Expected values
- Required vs optional
- Format

Rename only by:

- Supporting both names temporarily
- Documenting deprecation
- Removing old after migration

## Route Paths

Do not change:

- Public routes
- API routes
- File paths
- URL patterns

Route changes require:

- Redirects
- Documentation
- Owner approval

## Public Exports

Do not remove or change:

- Exported functions
- Exported types
- Exported classes
- Exported constants

## Session Contracts

Do not change:

- Session structure
- Token format
- Expiration rules
- Validation rules

## Backward Compatibility

When changes are necessary:

1. Support old and new simultaneously
2. Log deprecation warnings
3. Provide migration guide
4. Remove old only after migration

## Breaking Change Approval

Required for:

- Removing fields
- Renaming fields
- Changing types
- Removing routes
- Removing exports
- Breaking database schema

Approval template:

```
Breaking change: [description]
Affected: [users/services]
Migration: [how to update]
Removal date: [timeline]
Owner approval: [required]
```