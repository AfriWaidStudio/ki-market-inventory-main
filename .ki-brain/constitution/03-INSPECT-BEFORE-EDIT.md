# Inspect Before Edit

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## Core Principle

**Always inspect code, dependencies, and effects before making changes.**

## Inspection Protocol

### 1. Search Related Files

Find all files that might be affected:

- Function definitions
- Function calls
- Imports and exports
- Configuration references
- Test files
- Documentation

### 2. Trace Callers and Dependencies

For any function or component you plan to modify:

- Find who calls it
- Find what it imports
- Find what depends on it
- Check the data flow

### 3. Inspect Tests

- Run existing tests
- Check test coverage
- Identify test patterns
- Note expected behaviors

### 4. Inspect Configuration

- Check `package.json`
- Check `vite.config.*`
- Check `tsconfig.json`
- Check `.env` files (contents, not values)
- Check database connection settings

### 5. Inspect Environment Variables

- Find all env var usages
- Check naming conventions
- Verify they are documented
- Confirm they are required

### 6. Inspect Database Effects

- Check Prisma schema
- Check migrations
- Check queries
- Check models
- Check relations

### 7. List Planned File Changes

Before editing, announce:

```
Files expected to change:
1. [file path] - [brief reason]
2. [file path] - [brief reason]
```

### 8. Preserve Unfamiliar Code

**Do not modify code you do not understand.**

If uncertain:
- Read carefully
- Look for comments
- Check documentation
- Ask for clarification
- Leave it unchanged

## Pre-Edit Checklist

Before any edit:

- [ ] Read the entire file
- [ ] Understand the context
- [ ] Find related files
- [ ] Identify dependencies
- [ ] List planned changes
- [ ] Check test implications
- [ ] Verify no-delete compliance

## Reading Order

1. Primary file
2. Related files
3. Tests
4. Configuration
5. Documentation

## Verification After Edit

After editing:

- [ ] Run type-check
- [ ] Run tests
- [ ] Run build
- [ ] Verify behavior

## Record Findings

Document what you found:

```
Inspected:
- [file]:[line] - [what was found]
- [file]:[line] - [what was found]

Dependencies:
- [function] called by [file]
- [variable] used in [file]
```