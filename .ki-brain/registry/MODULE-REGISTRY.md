# Module Registry

Status: PLANNED  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Purpose

Index of all modules (reusable code components).

## Module Definition

| Module ID | Name | Code location | Brain document | Owner | Status |
| --------- | ---- | ------------- | -------------- | ----- | ------ |

## Entry Format

```
| [ID] | [Name] | [Location] | [Document] | [Owner] | [Status] |
```

## Module Types

- AUTH - Authentication
- DATABASE - Database layer
- API - API endpoints
- COMPONENT - React components
- HOOK - React hooks
- SERVICE - External services
- UTILITY - Helper functions

## Code Location

Where the module lives:

- `src/lib/auth/`
- `src/lib/db/`
- `src/components/`
- `src/hooks/`
- `src/services/`

## Brain Document

Link to architecture documentation:

- `architecture/AUTHENTICATION.md`
- `architecture/DATABASES.md`
- `architecture/API-LAYER.md`
- etc.

## Owner

Who maintains this module:

- Owner name
- Team
- None (unowned)

## Status Labels

- ACTIVE - Currently used
- INACTIVE - Not currently used
- DEPRECATED - Will be removed
- PLANNED - To be created

## Stage 1

**Stage 1 foundation only.**  
Entries will be created in later stages.