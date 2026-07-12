# Change Report Template

Status: ACTIVE  
Authority: Mandatory  
Applies to: All agents and human contributors  
Exceptions: Explicit owner approval where safe and legal

## File Changes

| File | Action | Reason | Risk | Test | Rollback |
| ---- | ------ | ------ | ---- | ---- | -------- |
| [path] | [create/edit/delete/comment] | [reason] | [low/med/high] | [pass/fail] | [instructions] |

## Change Summary

```
Created:
- [file path] - [purpose]

Modified:
- [file path]:[line] - [change description]
- [file path]:[line] - [change description]

Commented:
- [file path]:[line] - [reason]
- [file path]:[line] - [reason]

Deleted:
- [file path] - [reason]
```

## No-Delete Rule Compliance

**Confirmed**: Yes/No

If Yes, list any commented code:
- [file]:[line] - [reason]

If No, explain:
- [explanation]

## Verification

- Type-check: PASS/FAIL
- Build: PASS/FAIL
- Tests: PASS/FAIL [count]

## Rollback Instructions

To rollback all changes:

1. [step 1]
2. [step 2]
3. [step 3]

## Approval Status

- Owner approval: [obtained/not needed]
- Security review: [completed/not needed]
- Test review: [completed/not needed]

## Risks

| Risk | Impact | Mitigation |
| ---- | ------ | ---------- |
| [risk] | [high/med/low] | [mitigation] |

## Last Verified

2026-07-11