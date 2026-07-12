# Known Bugs

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: None

## Bug Template

```
Bug ID:
Title:
Status:
Severity:
First observed:
Affected files:
Reproduction:
Expected:
Actual:
Evidence:
Suspected cause:
Confirmed cause:
Fix:
Tests:
```

## Confirmed Bugs

No bugs confirmed at this time.

## Pre-existing Issues (Not Bugs)

The following issues are noted but not classified as bugs:

### Issue 1: TypeScript Deprecation Warnings

**Issue**: Pre-existing deprecation warnings in various files

**Location**: Various files (not in Brain scope)

**Status**: PRE-EXISTING

**Evidence**: Build passes with deprecation warnings

**Note**: Not a bug - existing code with warnings. Part of the codebase, not a defect.

### Issue 2: Vite Plugin Peer Dependency Warning

**Issue**: vite-tsconfig-paths plugin has peer dependency warning

**Location**: vite.config.ts

**Status**: PRE-EXISTING

**Evidence**: Build still works

**Note**: Not a bug - peer dependency issue that doesn't affect functionality

### Issue 3: Supabase Email Delivery

**Issue**: Supabase's default email provider has low rate limits

**Location**: Supabase configuration

**Status**: KNOWN

**Evidence**: AGENTS.md documents this

**Note**: This is a known limitation, not a bug in the application code

---

## New Bugs

If bugs are discovered during work, they will be documented here with full template.